/*jslint plusplus: true */
/*global GameBoard, PVENTRIES, probePvTable, NOMOVE, moveExists, BOOL, makeMove, takeMove  */
function getPvLine(depth) {
    "use strict";
	var move = probePvTable(), count = 0;
	
	while (move !== NOMOVE && count < depth) {
	
		if (moveExists(move) === BOOL.TRUE) {
			makeMove(move);
			GameBoard.pvArray[count++] = move;
		} else {
			break;
		}
		move = probePvTable();
	}
	
	while (GameBoard.ply > 0) {
		takeMove();
	}
	
	return count;
	
}

function probePvTable() {
    "use strict";
    var index = GameBoard.posKey % PVENTRIES;
    
    if (GameBoard.pvTable[index].posKey === GameBoard.posKey) {
        return GameBoard.pvTable[index].move;
    }
}

function storePvMove(move) {
    "use strict";
    var index = GameBoard.posKey % PVENTRIES;
    GameBoard.pvTable[index].posKey = GameBoard.posKey;
    GameBoard.pvTable[index].move = move;
}