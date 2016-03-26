/*jslint plusplus: true */
/*global GameBoardController, PVENTRIES, probePvTable, NOMOVE, moveExists, BOOL, makeMove, takeMove  */
var PvTableController = {};

PvTableController.getPvLine = function (depth) {
    "use strict";
	var move = PvTableController.probePvTable(), count = 0;
	
	while (move !== NOMOVE && count < depth) {
	
		if (MoveGenController.moveExists(move) === BOOL.TRUE) {
			MakeMoveController.makeMove(move);
			GameBoardController.pvArray[count++] = move;
		} else {
			break;
		}
		move = PvTableController.probePvTable();
	}
	
	while (GameBoardController.ply > 0) {
		MakeMoveController.takeMove();
	}
	
	return count;
	
};

PvTableController.probePvTable = function () {
    "use strict";
    var index = GameBoardController.posKey % PVENTRIES;
    
    if (GameBoardController.pvTable[index].posKey === GameBoardController.posKey) {
        return GameBoardController.pvTable[index].move;
    }
};

PvTableController.storePvMove = function (move) {
    "use strict";
    var index = GameBoardController.posKey % PVENTRIES;
    GameBoardController.pvTable[index].posKey = GameBoardController.posKey;
    GameBoardController.pvTable[index].move = move;
};