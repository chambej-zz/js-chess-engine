/*jslint plusplus: true */
/*jslint browser: true */
/*jslint bitwise: true */
/*global FILES, RANKS, SQUARES, BRD_SQ_NUM, FilesBrd, RanksBrd, FR2SQ, console, $, PieceKeys, CastleKeys, SideKey, RAND_32, Sq120ToSq64, Sq64ToSq120, parseFen, printBoard, START_FEN, printSqAttacked, generateMoves, printMoveList, checkBoard, MAXGAMEMOVES, GameBoardController, NOMOVE, printPieceList, makeMove, takeMove, PVENTRIES, initMvvLva, newGame */
function initFilesRanksBrd() {
    "use strict";
    var index, file = FILES.FILE_A, rank, sq = SQUARES.A1;
    
    for (index = 0; index < BRD_SQ_NUM; ++index) {
        FilesBrd[index] = SQUARES.OFFBOARD;
        RanksBrd[index] = SQUARES.OFFBOARD;
    }
    
    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
            sq = FR2SQ(file, rank);
            FilesBrd[sq] = file;
            RanksBrd[sq] = rank;
        }
    }
}

function initHashKeys() {
    "use strict";
    var index;
    
    for (index = 0; index < 14 * 120; ++index) {
        PieceKeys[index] = RAND_32();
    }
    
    SideKey = RAND_32();
    
    for (index = 0; index < 16; ++index) {
        CastleKeys[index] = RAND_32();
    }
}

function initSq120ToSq64() {
    "use strict";
    var index, file = FILES.FILE_A, rank, sq = SQUARES.A1, sq64 = 0;
    
    for (index = 0; index < BRD_SQ_NUM; ++index) {
        Sq120ToSq64[index] = 65;
    }
    
    for (index = 0; index < 64; ++index) {
        Sq64ToSq120[index] = 120;
    }
    
    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
            sq = FR2SQ(file, rank);
            Sq64ToSq120[sq64] = sq;
            Sq120ToSq64[sq] = sq64;
            sq64++;
        }
    }
}

function initBoardVars() {
    "use strict";
    var index;
    for (index = 0; index < MAXGAMEMOVES; ++index) {
        GameBoardController.history.push({
            move: NOMOVE,
            castlePerm: 0,
            enPas: 0,
            fiftyMove: 0,
            posKey: 0
        });
    }
    
    for (index = 0; index < PVENTRIES; ++index) {
        GameBoardController.pvTable.push({
            move : NOMOVE,
            posKey : 0
        });
    }
}

function initBoardSquares() {
    "use strict";
	var light = 0, rankName, fileName, divString, lastLight = 0, rankIter, fileIter = 0, lightString;
	
	for (rankIter = RANKS.RANK_8; rankIter >= RANKS.RANK_1; rankIter--) {
		light = lastLight ^ 1;
		lastLight ^= 1;
		rankName = "rank" + (rankIter + 1);
		for (fileIter = FILES.FILE_A; fileIter <= FILES.FILE_H; fileIter++) {
			fileName = "file" + (fileIter + 1);
			
			if (light === 0) {
                lightString = "Light";
            } else {
                lightString = "Dark";
            }
			divString = "<div class=\"Square " + rankName + " " + fileName + " " + lightString + "\"/>";
			light ^= 1;
			$("#Board").append(divString);
        }
    }
}


function init() {
    "use strict";
    console.log("init() called");
    initFilesRanksBrd();
    initHashKeys();
    initSq120ToSq64();
    initBoardVars();
    MoveGenController.initMvvLva();
    initBoardSquares();
}

$(function () {
    "use strict";
	init();
	console.log("Main Init Called");
    GuiController.newGame(START_FEN);
});

