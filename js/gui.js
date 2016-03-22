/*jslint plusplus: true */
/*jslint bitwise: true */
/*global $, parseFen, printBoard, printSqAttacked, perftTest, searchPosition, START_FEN, newGame, setInitialBoardPieces, SQ120, GameBoard, FilesBrd, RanksBrd, PIECES, SideChar, PieceChar, PieceCol, PceChar, console, FR2SQ, prSq, UserMove, SQUARES, makeUserMove, parseMove, NOMOVE, makeMove, BOOL, pieceIsOnSq, addGUIPiece, FROMSQ, TOSQ, MFLAGEP, COLOURS, CAPTURED, MFLAGCA, PROMOTED, moveGUIPiece  */
$("#SetFen").click(function () {
    "use strict";
    var fenStr = $("#fenIn").val();
    newGame(fenStr);
});

function newGame(fenStr) {
    "use strict";
	parseFen(fenStr);
	printBoard();
	setInitialBoardPieces();
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

// q3k2b/8/3n/8/8/8/8/R3K2R b KQkq - 0 1

// 2rr3k/pp3pp1/1nnqbN1p/3pN3/2pP4/2P3Q1/PPB4P/R4RK1 w - -

// r1bq2rk/pp3pbp/2p1p1pQ/7P/3P4/2PB1N2/PP3PPR/2KR4 w - -

// 1br3k1/p4p2/2p1r3/3p1b2/3Bn1p1/1P2P1Pq/P3Q1BP/2R1NRK1 b - -
                   
                   