/*jslint plusplus: true */
/*global GameBoardController, COLOURS, PIECES, PCEINDEX, SQ64, MIRROR64 */
var EvaluationControler = {};

EvaluationControler.PawnTable = [
    0, 0, 0, 0, 0, 0, 0, 0,
    10, 10, 0, -10, -10, 0, 10, 10,
    5, 0, 0, 5, 5, 0, 0, 5,
    0, 0, 10, 20, 20, 10, 0, 0,
    5, 5, 5, 10, 10, 5, 5, 5,
    10, 10, 10, 20, 20, 10, 10, 10,
    20, 20, 20, 30, 30, 20, 20, 20,
    0, 0, 0, 0, 0, 0, 0, 0
];

EvaluationControler.KnightTable = [
    0, -10,	0, 0, 0, 0,	-10, 0,
    0,	0,	0, 5,	5,	0,	0,	0,
    0,	0,	10,	10,	10,	10,	0,	0,
    0,	0,	10,	20,	20,	10,	5,	0,
    5,	10,	15,	20,	20,	15,	10,	5,
    5,	10,	10,	20,	20,	10,	10,	5,
    0,	0,	5,	10,	10,	5,	0,	0,
    0,	0,	0,	0,	0,	0,	0,	0
];

EvaluationControler.BishopTable = [
    0,	0, -10, 0,	0, -10, 0,	0,
    0,	0,	0,	10,	10,	0,	0,	0,
    0,	0,	10,	15,	15,	10,	0,	0,
    0,	10,	15,	20,	20,	15,	10,	0,
    0,	10,	15,	20,	20,	15,	10,	0,
    0,	0,	10,	15,	15,	10,	0,	0,
    0,	0,	0,	10,	10,	0,	0,	0,
    0,	0,	0,	0,	0,	0,	0,	0
];

EvaluationControler.RookTable = [
    0,	0,	5,	10,	10,	5,	0,	0,
    0,	0,	5,	10,	10,	5,	0,	0,
    0,	0,	5,	10,	10,	5,	0,	0,
    0,	0,	5,	10,	10,	5,	0,	0,
    0,	0,	5,	10,	10,	5,	0,	0,
    0,	0,	5,	10,	10,	5,	0,	0,
    25,	25,	25,	25,	25,	25,	25,	25,
    0,	0,	5,	10,	10,	5,	0,	0
];

EvaluationControler.BishopPair = 40;


EvaluationControler.evalPosition = function () {
    "use strict";
    var score = GameBoardController.material[COLOURS.WHITE] - GameBoardController.material[COLOURS.BLACK], pce, sq, pceNum;
	
	pce = PIECES.wP;
	for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
		sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
		score += EvaluationControler.PawnTable[SQ64(sq)];
	}
	
	pce = PIECES.bP;
	for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
		sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
		score -= EvaluationControler.PawnTable[MIRROR64(SQ64(sq))];
	}
	
	pce = PIECES.wN;
	for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
		sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
		score += EvaluationControler.KnightTable[SQ64(sq)];
	}

	pce = PIECES.bN;
	for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
		sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
		score -= EvaluationControler.KnightTable[MIRROR64(SQ64(sq))];
	}
	
	pce = PIECES.wB;
	for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
		sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
		score += EvaluationControler.BishopTable[SQ64(sq)];
	}

	pce = PIECES.bB;
	for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
		sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
		score -= EvaluationControler.BishopTable[MIRROR64(SQ64(sq))];
	}
    
	pce = PIECES.wR;
	for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
		sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
		score += EvaluationControler.RookTable[SQ64(sq)];
	}

	pce = PIECES.bR;
	for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
		sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
		score -= EvaluationControler.RookTable[MIRROR64(SQ64(sq))];
	}
	
	pce = PIECES.wQ;
	for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
		sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
		score += EvaluationControler.RookTable[SQ64(sq)];
	}

	pce = PIECES.bQ;
	for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
		sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
		score -= EvaluationControler.RookTable[MIRROR64(SQ64(sq))];
	}
	
	if (GameBoardController.pceNum[PIECES.wB] >= 2) {
		score += EvaluationControler.BishopPair;
	}
	
	if (GameBoardController.pceNum[PIECES.bB] >= 2) {
		score -= EvaluationControler.BishopPair;
	}
	

    if (GameBoardController.side === COLOURS.WHITE) {
        return score;
    } else {
        return -score;
    }
    
};