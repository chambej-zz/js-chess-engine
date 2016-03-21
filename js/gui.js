/*jslint plusplus: true */
/*global $, parseFen, printBoard, printSqAttacked, perftTest, searchPosition, START_FEN, newGame, setInitialBoardPieces, SQ120, GameBoard, FilesBrd, RanksBrd, PIECES, SideChar, PieceChar, PieceCol, PceChar  */
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
		file = FilesBrd[sq120];
		rank = RanksBrd[sq120];
		
		if (pce >= PIECES.wP && pce <= PIECES.bK) {
			rankName = "rank" + (rank + 1);
			fileName = "file" + (file + 1);
			pieceFileName = "images/" + SideChar[PieceCol[pce]] + PceChar[pce].toUpperCase() + ".png";
			imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece " + rankName + " " + fileName + "\"/>";
			$("#Board").append(imageString);
		}
	}

}


// q3k2b/8/3n/8/8/8/8/R3K2R b KQkq - 0 1

// 2rr3k/pp3pp1/1nnqbN1p/3pN3/2pP4/2P3Q1/PPB4P/R4RK1 w - -

// r1bq2rk/pp3pbp/2p1p1pQ/7P/3P4/2PB1N2/PP3PPR/2KR4 w - -

// 1br3k1/p4p2/2p1r3/3p1b2/3Bn1p1/1P2P1Pq/P3Q1BP/2R1NRK1 b - -
                   
                   