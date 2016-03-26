/*jslint plusplus: true */
/*jslint bitwise: true */
/*global $, parseFen, printBoard, printSqAttacked, perftTest, searchPosition, START_FEN, newGame, setInitialBoardPieces, SQ120, GameBoardController, FilesBrd, RanksBrd, PIECES, SideChar, PieceChar, PieceCol, PceChar, console, FR2SQ, prSq, UserMove, SQUARES, makeUserMove, parseMove, NOMOVE, makeMove, BOOL, pieceIsOnSq, addGUIPiece, FROMSQ, TOSQ, MFLAGEP, COLOURS, CAPTURED, MFLAGCA, PROMOTED, moveGUIPiece, generateMoves, takeMove, sqAttacked, PCEINDEX, Kings, GameController, checkAndSet, SearchController, startSearch, MAXDEPTH, preSearch  */
var GuiController = {};

$("#SetFen").click(function () {
    "use strict";
    var fenStr = $("#fenIn").val();
    GuiController.newGame(fenStr);
});

$("#TakeButton").click(function () {
    "use strict";
    if (GameBoardController.hisPly > 0) {
        MakeMoveController.takeMove();
        GameBoardController.ply = 0;
        GuiController.setInitialBoardPieces();
    }
});

$("#NewGameButton").click(function () {
    "use strict";
    GuiController.newGame(START_FEN);
});

GuiController.newGame = function (fenStr) {
    "use strict";
	GameBoardController.parseFen(fenStr);
	GameBoardController.printBoard();
	GuiController.setInitialBoardPieces();
    GuiController.checkAndSet();
};

GuiController.clearAllPieces = function () {
    "use strict";
	$(".Piece").remove();
};

GuiController.setInitialBoardPieces = function () {
    "use strict";
	var sq, sq120, pce;
	
	GuiController.clearAllPieces();
	
	for (sq = 0; sq < 64; ++sq) {
		sq120 = SQ120(sq);
		pce = GameBoardController.pieces[sq120];

        if (pce >= PIECES.wP && pce <= PIECES.bK) {
			GuiController.addGUIPiece(sq120, pce);
		}
	}

};

GuiController.deselectSq = function (sq) {
    "use strict";
    $(".Square").each(function () {
        if (GuiController.pieceIsOnSq(sq, $(this).position().top, $(this).position().left) === BOOL.TRUE) {
            $(this).removeClass('SqSelected');
        }
    });
};

GuiController.setSqSelected = function (sq) {
    "use strict";
    $(".Square").each(function () {
        if (GuiController.pieceIsOnSq(sq, $(this).position().top, $(this).position().left) === BOOL.TRUE) {
            $(this).addClass('SqSelected');
        }
    });
};

GuiController.clickedSquare = function (pageX, pageY) {
    "use strict";
    console.log('clickedSquare() at ' + pageX + ',' + pageY);
    
    var position = $('#Board').position(),
        workedX = Math.floor(position.left),
        workedY = Math.floor(position.top),
        file,
        rank,
        sq;
        
    pageX = Math.floor(pageX);
    pageY = Math.floor(pageY);
    file = Math.floor((pageX - workedX) / 60);
    rank = 7 - Math.floor((pageY - workedY) / 60);
    sq = FR2SQ(file, rank);
    
    console.log('Clicked sq: ' + IoController.prSq(sq));
    GuiController.setSqSelected(sq);
    
    return sq;
};

$(document).on('click', '.Piece', function (e) {
    "use strict";
    console.log('Piece Click');
    if (UserMove.from === SQUARES.NO_SQ) {
        UserMove.from = GuiController.clickedSquare(e.pageX, e.pageY);
    } else {
        UserMove.to = GuiController.clickedSquare(e.pageX, e.pageY);
    }
    GuiController.makeUserMove();
});

$(document).on('click', '.Square', function (e) {
    "use strict";
    console.log('Square Click');
    if (UserMove.from !== SQUARES.NO_SQ) {
        UserMove.to = GuiController.clickedSquare(e.pageX, e.pageY);
        GuiController.makeUserMove();
    }
});

GuiController.makeUserMove = function () {
    "use strict";
    if (UserMove.from !== SQUARES.NO_SQ && UserMove.to !== SQUARES.NO_SQ) {
        console.log('User Move: ' + IoController.prSq(UserMove.from) + IoController.prSq(UserMove.to));
        
        var parsed = IoController.parseMove(UserMove.from, UserMove.to);
        
        if (parsed !== NOMOVE) {
            MakeMoveController.makeMove(parsed);
            GameBoardController.printBoard();
            GuiController.moveGUIPiece(parsed);
            GuiController.checkAndSet();
            GuiController.preSearch();
        }
        
        GuiController.deselectSq(UserMove.from);
        GuiController.deselectSq(UserMove.to);
        UserMove.from = SQUARES.NO_SQ;
        UserMove.to = SQUARES.NO_SQ;
    }
};

GuiController.pieceIsOnSq = function (sq, top, left) {
    "use strict";
    if ((RanksBrd[sq] === 7 - Math.round(top / 60)) && FilesBrd[sq] === Math.round(left / 60)) {
        return BOOL.TRUE;
    }
    return BOOL.FALSE;
    
};

GuiController.removeGUIPiece = function (sq) {
    "use strict";
    $(".Piece").each(function () {
        if (GuiController.pieceIsOnSq(sq, $(this).position().top, $(this).position().left) === BOOL.TRUE) {
            $(this).remove();
        }
    });
};

GuiController.addGUIPiece = function (sq, pce) {
    "use strict";
    var file = FilesBrd[sq],
        rank = RanksBrd[sq],
        rankName = "rank" + (rank + 1),
        fileName = "file" + (file + 1),
        pieceFileName = "images/" + SideChar[PieceCol[pce]] + PceChar[pce].toUpperCase() + ".png",
        imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece " + rankName + " " + fileName + "\"/>";
	$("#Board").append(imageString);
};

GuiController.moveGUIPiece = function (move) {
    "use strict";
    var from = FROMSQ(move),
        to = TOSQ(move),
        epRemove,
        file = FilesBrd[to],
        rank = RanksBrd[to],
        rankName = "rank" + (rank + 1),
        fileName = "file" + (file + 1);
    
    if (move & MFLAGEP) {
        if (GameBoardController.side === COLOURS.BLACK) {
            epRemove = to - 10;
        } else {
            epRemove = to + 10;
        }
        GuiController.removeGUIPiece(epRemove);
    } else if (CAPTURED(move)) {
        GuiController.removeGUIPiece(to);
    }
    $(".Piece").each(function () {
        if (GuiController.pieceIsOnSq(from, $(this).position().top, $(this).position().left) === BOOL.TRUE) {
            $(this).removeClass();
            $(this).addClass("Piece " + rankName + " " + fileName);
        }
    });
    
    if (move & MFLAGCA) {
        switch (to) {
        case SQUARES.G1:
            GuiController.removeGUIPiece(SQUARES.H1);
            GuiController.addGUIPiece(SQUARES.F1, PIECES.wR);
            break;
        case SQUARES.C1:
            GuiController.removeGUIPiece(SQUARES.A1);
            GuiController.addGUIPiece(SQUARES.D1, PIECES.wR);
            break;
        case SQUARES.G8:
            GuiController.removeGUIPiece(SQUARES.H8);
            GuiController.addGUIPiece(SQUARES.F8, PIECES.bR);
            break;
        case SQUARES.C8:
            GuiController.removeGUIPiece(SQUARES.A8);
            GuiController.addGUIPiece(SQUARES.D8, PIECES.bR);
            break;
        }
    } else if (PROMOTED(move)) {
        GuiController.removeGUIPiece(to);
        GuiController.addGUIPiece(to, PROMOTED(move));
    }
};

GuiController.drawMaterial = function () {
    "use strict";
    if (GameBoardController.pceNum[PIECES.wP] !== 0
            || GameBoardController.pceNum[PIECES.bP] !== 0) {
        return BOOL.FALSE;
    }
    if (GameBoardController.pceNum[PIECES.wQ] !== 0
            || GameBoardController.pceNum[PIECES.bQ] !== 0
            || GameBoardController.pceNum[PIECES.wR] !== 0
            || GameBoardController.pceNum[PIECES.bR] !== 0) {
        return BOOL.FALSE;
    }
    if (GameBoardController.pceNum[PIECES.wB] > 1
            || GameBoardController.pceNum[PIECES.bB] > 1) {
        return BOOL.FALSE;
    }
    if (GameBoardController.pceNum[PIECES.wN] > 1
            || GameBoardController.pceNum[PIECES.bN] > 1) {
        return BOOL.FALSE;
    }
    if (GameBoardController.pceNum[PIECES.wN] !== 0
            && GameBoardController.pceNum[PIECES.wB] !== 0) {
        return BOOL.FALSE;
    }
    if (GameBoardController.pceNum[PIECES.bN] !== 0
            && GameBoardController.pceNum[PIECES.bB] !== 0) {
        return BOOL.FALSE;
    }
    
    return BOOL.TRUE;
};

GuiController.threeFoldRep = function () {
    "use strict";
    var i = 0, r = 0;
    
    for (i = 0; i < GameBoardController.hisPly; ++i) {
        if (GameBoardController.history[i].posKey === GameBoardController.posKey) {
            r++;
        }
    }
    return r;
};

GuiController.checkResult = function () {
    "use strict";
    if (GameBoardController.fiftyMove >= 100) {
        $("#GameStatus").text("GAME DRAWN {fifty move rule}");
        return BOOL.TRUE;
    }
    if (GuiController.threeFoldRep() >= 2) {
        $("#GameStatus").text("GAME DRAWN {3-fold repetition}");
        return BOOL.TRUE;
    }
    if (GuiController.drawMaterial() === BOOL.TRUE) {
        $("#GameStatus").text("GAME DRAWN {insufficient material to mate}");
        return BOOL.TRUE;
    }
    
    MoveGenController.generateMoves();
    var MoveNum, found = 0, inCheck;
    
    for (MoveNum = GameBoardController.moveListStart[GameBoardController.ply]; MoveNum < GameBoardController.moveListStart[GameBoardController.ply + 1]; ++MoveNum) {
        if (MakeMoveController.makeMove(GameBoardController.moveList[MoveNum]) === BOOL.FALSE) {

        } else {
            found++;
            MakeMoveController.takeMove();
            break;
        }
    }
    
    if (found !== 0) {
        return BOOL.FALSE;
    }
    
    inCheck = GameBoardController.sqAttacked(GameBoardController.pList[PCEINDEX(Kings[GameBoardController.side], 0)], GameBoardController.side ^ 1);
    
    if (inCheck === BOOL.TRUE) {
        if (GameBoardController.side === COLOURS.WHITE) {
            $("#GameStatus").text("GAME OVER {black mates}");
            return BOOL.TRUE;
        } else {
            $("#GameStatus").text("GAME OVER {white mates}");
            return BOOL.TRUE;
        }
    } else {
        $("#GameStatus").text("GAME DRAWN {stalemate}");
        return BOOL.TRUE;
    }

};

GuiController.checkAndSet = function () {
    "use strict";
    if (GuiController.checkResult() === BOOL.TRUE) {
        GameController.GameOver = BOOL.TRUE;
    } else {
        GameController.GameOver = BOOL.FALSE;
        $("#GameStatus").text('');
    }
};

GuiController.preSearch = function () {
    "use strict";
    if (GameController.GameOver === BOOL.FALSE) {
        SearchController.thinking = BOOL.TRUE;
        setTimeout(function () {
            GuiController.startSearch();
        }, 200);
    }
};

$("#SearchButton").click(function () {
    "use strict";
    GameController.PlayerSide = GameController.side ^ 1;
    GuiController.preSearch();
});

GuiController.startSearch = function () {
    "use strict";
    SearchController.depth = MAXDEPTH;
    SearchController.start = $.now();
    var thinkingTime = $("#ThinkTimeChoice").val();
    
    SearchController.time = parseInt(thinkingTime, [10]) * 1000;
    SearchController.searchPosition();
    
    MakeMoveController.makeMove(SearchController.best);
    GuiController.moveGUIPiece(SearchController.best);
    GuiController.checkAndSet();
    
};

// q3k2b/8/3n/8/8/8/8/R3K2R b KQkq - 0 1

// 2rr3k/pp3pp1/1nnqbN1p/3pN3/2pP4/2P3Q1/PPB4P/R4RK1 w - -

// r1bq2rk/pp3pbp/2p1p1pQ/7P/3P4/2PB1N2/PP3PPR/2KR4 w - -

// 1br3k1/p4p2/2p1r3/3p1b2/3Bn1p1/1P2P1Pq/P3Q1BP/2R1NRK1 b - -
                   
                   