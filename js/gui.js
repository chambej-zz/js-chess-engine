/*jslint plusplus: true */
/*jslint bitwise: true */
/*global $, parseFen, printBoard, printSqAttacked, perftTest, searchPosition, START_FEN, newGame, setInitialBoardPieces, SQ120, GameBoard, FilesBrd, RanksBrd, PIECES, SideChar, PieceChar, PieceCol, PceChar, console, FR2SQ, prSq, UserMove, SQUARES, makeUserMove, parseMove, NOMOVE, makeMove, BOOL, pieceIsOnSq, addGUIPiece, FROMSQ, TOSQ, MFLAGEP, COLOURS, CAPTURED, MFLAGCA, PROMOTED, moveGUIPiece, generateMoves, takeMove, sqAttacked, PCEINDEX, Kings, GameController, checkAndSet, SearchController, startSearch, MAXDEPTH, preSearch  */
$("#SetFen").click(function () {
    "use strict";
    var fenStr = $("#fenIn").val();
    newGame(fenStr);
});

$('#TakeButton').click(function () {
    "use strict";
    if (GameBoard.hisPly > 0) {
        takeMove();
        GameBoard.ply = 0;
        setInitialBoardPieces();
    }
});

$('#NewGameButton').click(function () {
    "use strict";
    newGame(START_FEN);
});

function newGame(fenStr) {
    "use strict";
	parseFen(fenStr);
	printBoard();
	setInitialBoardPieces();
    checkAndSet();
}

function clearAllPieces() {
    "use strict";
	$(".Piece").remove();
}

function setInitialBoardPieces() {
    "use strict";
	var sq, sq120, file, rank, rankName, fileName, imageString, pieceFileName, pce;
	
	clearAllPieces();
	
	for (sq = 0; sq < 64; ++sq) {
		sq120 = SQ120(sq);
		pce = GameBoard.pieces[sq120];

        if (pce >= PIECES.wP && pce <= PIECES.bK) {
			addGUIPiece(sq120, pce);
		}
	}

}

function deselectSq(sq) {
    "use strict";
    $('.Square').each(function (index) {
        if (pieceIsOnSq(sq, $(this).position().top, $(this).position().left) === BOOL.TRUE) {
            $(this).removeClass('SqSelected');
        }
    });
}
function setSqSelected(sq) {
    "use strict";
    $('.Square').each(function (index) {
        if (pieceIsOnSq(sq, $(this).position().top, $(this).position().left) === BOOL.TRUE) {
            $(this).addClass('SqSelected');
        }
    });
}
function clickedSquare(pageX, pageY) {
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
    
    console.log('Clicked sq: ' + prSq(sq));
    setSqSelected(sq);
    
    return sq;
}

$(document).on('click', '.Piece', function (e) {
    "use strict";
    console.log('Piece Click');
    if (UserMove.from === SQUARES.NO_SQ) {
        UserMove.from = clickedSquare(e.pageX, e.pageY);
    } else {
        UserMove.to = clickedSquare(e.pageX, e.pageY);
    }
    makeUserMove();
});

$(document).on('click', '.Square', function (e) {
    "use strict";
    console.log('Square Click');
    if (UserMove.from !== SQUARES.NO_SQ) {
        UserMove.to = clickedSquare(e.pageX, e.pageY);
        makeUserMove();
    }
});

function makeUserMove() {
    "use strict";
    if (UserMove.from !== SQUARES.NO_SQ && UserMove.to !== SQUARES.NO_SQ) {
        console.log('User Move: ' + prSq(UserMove.from) + prSq(UserMove.to));
        
        var parsed = parseMove(UserMove.from, UserMove.to);
        
        if (parsed !== NOMOVE) {
            makeMove(parsed);
            printBoard();
            moveGUIPiece(parsed);
            checkAndSet();
            preSearch();
        }
        
        deselectSq(UserMove.from);
        deselectSq(UserMove.to);
        UserMove.from = SQUARES.NO_SQ;
        UserMove.to = SQUARES.NO_SQ;
    }
}

function pieceIsOnSq(sq, top, left) {
    "use strict";
    if ((RanksBrd[sq] === 7 - Math.round(top / 60)) && FilesBrd[sq] === Math.round(left / 60)) {
        return BOOL.TRUE;
    }
    return BOOL.FALSE;
    
}

function removeGUIPiece(sq) {
    "use strict";
    $('.Piece').each(function (index) {
        if (pieceIsOnSq(sq, $(this).position().top, $(this).position().left) === BOOL.TRUE) {
            $(this).remove();
        }
    });
}

function addGUIPiece(sq, pce) {
    "use strict";
    var file = FilesBrd[sq],
        rank = RanksBrd[sq],
        rankName = "rank" + (rank + 1),
        fileName = "file" + (file + 1),
        pieceFileName = "images/" + SideChar[PieceCol[pce]] + PceChar[pce].toUpperCase() + ".png",
        imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece " + rankName + " " + fileName + "\"/>";
	$("#Board").append(imageString);
}

function moveGUIPiece(move) {
    "use strict";
    var from = FROMSQ(move),
        to = TOSQ(move),
        epRemove,
        file = FilesBrd[to],
        rank = RanksBrd[to],
        rankName = "rank" + (rank + 1),
        fileName = "file" + (file + 1);
    
    if (move & MFLAGEP) {
        if (GameBoard.side === COLOURS.BLACK) {
            epRemove = to - 10;
        } else {
            epRemove = to + 10;
        }
        removeGUIPiece(epRemove);
    } else if (CAPTURED(move)) {
        removeGUIPiece(to);
    }
    $('.Piece').each(function (index) {
        if (pieceIsOnSq(from, $(this).position().top, $(this).position().left) === BOOL.TRUE) {
            $(this).removeClass();
            $(this).addClass("Piece " + rankName + " " + fileName);
        }
    });
    
    if (move & MFLAGCA) {
        switch (to) {
        case SQUARES.G1:
            removeGUIPiece(SQUARES.H1);
            addGUIPiece(SQUARES.F1, PIECES.wR);
            break;
        case SQUARES.C1:
            removeGUIPiece(SQUARES.A1);
            addGUIPiece(SQUARES.D1, PIECES.wR);
            break;
        case SQUARES.G8:
            removeGUIPiece(SQUARES.H8);
            addGUIPiece(SQUARES.F8, PIECES.bR);
            break;
        case SQUARES.C8:
            removeGUIPiece(SQUARES.A8);
            addGUIPiece(SQUARES.D8, PIECES.bR);
            break;
        }
    } else if (PROMOTED(move)) {
        removeGUIPiece(to);
        addGUIPiece(to, PROMOTED(move));
    }
}

function drawMaterial() {
    "use strict";
    if (GameBoard.pceNum[PIECES.wP] !== 0
            || GameBoard.pceNum[PIECES.bP] !== 0) {
        return BOOL.FALSE;
    }
    if (GameBoard.pceNum[PIECES.wQ] !== 0
            || GameBoard.pceNum[PIECES.bQ] !== 0
            || GameBoard.pceNum[PIECES.wR] !== 0
            || GameBoard.pceNum[PIECES.bR] !== 0) {
        return BOOL.FALSE;
    }
    if (GameBoard.pceNum[PIECES.wB] > 1
            || GameBoard.pceNum[PIECES.bB] > 1) {
        return BOOL.FALSE;
    }
    if (GameBoard.pceNum[PIECES.wN] > 1
            || GameBoard.pceNum[PIECES.bN] > 1) {
        return BOOL.FALSE;
    }
    if (GameBoard.pceNum[PIECES.wN] !== 0
            && GameBoard.pceNum[PIECES.wB] !== 0) {
        return BOOL.FALSE;
    }
    if (GameBoard.pceNum[PIECES.bN] !== 0
            && GameBoard.pceNum[PIECES.bB] !== 0) {
        return BOOL.FALSE;
    }
    
    return BOOL.TRUE;
}

function threeFoldRep() {
    "use strict";
    var i = 0, r = 0;
    
    for (i = 0; i < GameBoard.hisPly; ++i) {
        if (GameBoard.history[i].posKey === GameBoard.posKey) {
            r++;
        }
    }
    return r;
}

function checkResult() {
    "use strict";
    if (GameBoard.fiftyMove >= 100) {
        $("#GameStatus").text("GAME DRAWN {fifty move rule}");
        return BOOL.TRUE;
    }
    if (threeFoldRep() >= 2) {
        $("#GameStatus").text("GAME DRAWN {3-fold repetition}");
        return BOOL.TRUE;
    }
    if (drawMaterial() === BOOL.TRUE) {
        $("#GameStatus").text("GAME DRAWN {insufficient material to mate}");
        return BOOL.TRUE;
    }
    
    generateMoves();
    var MoveNum = 0, found = 0, inCheck;
    
    for (MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++MoveNum) {
        if (makeMove(GameBoard.moveList[MoveNum]) === BOOL.FALSE) {
            continue;
        } else {
            found++;
            takeMove();
            break;
        }
    }
    
    if (found !== 0) {
        return BOOL.FALSE;
    }
    
    inCheck = sqAttacked(GameBoard.pList[PCEINDEX(Kings[GameBoard.side], 0)], GameBoard.side ^ 1);
    
    if (inCheck === BOOL.TRUE) {
        if (GameBoard.side === COLOURS.WHITE) {
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
    
    return BOOL.FALSE;
}

function checkAndSet() {
    "use strict";
    if (checkResult() === BOOL.TRUE) {
        GameController.GameOver = BOOL.TRUE;
    } else {
        GameController.GameOver = BOOL.FALSE;
        $("#GameStatus").text('');
    }
}

function preSearch() {
    "use strict";
    if (GameController.GameOver === BOOL.FALSE) {
        SearchController.thinking = BOOL.TRUE;
        setTimeout(function () {
            startSearch();
        }, 200);
    }
}

$("#SearchButton").click(function () {
    "use strict";
    GameController.PlayerSide = GameController.side ^ 1;
    preSearch();
});

function startSearch() {
    "use strict";
    SearchController.depth = MAXDEPTH;
    SearchController.start = $.now();
    var thinkingTime = $("#ThinkTimeChoice").val();
    
    SearchController.time = parseInt(thinkingTime, [10]) * 1000;
    searchPosition();
    
    makeMove(SearchController.best);
    moveGUIPiece(SearchController.best);
    checkAndSet();
    
}

// q3k2b/8/3n/8/8/8/8/R3K2R b KQkq - 0 1

// 2rr3k/pp3pp1/1nnqbN1p/3pN3/2pP4/2P3Q1/PPB4P/R4RK1 w - -

// r1bq2rk/pp3pbp/2p1p1pQ/7P/3P4/2PB1N2/PP3PPR/2KR4 w - -

// 1br3k1/p4p2/2p1r3/3p1b2/3Bn1p1/1P2P1Pq/P3Q1BP/2R1NRK1 b - -
                   
                   