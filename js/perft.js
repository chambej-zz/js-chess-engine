/*jslint plusplus: true */
/*jslint bitwise: true */
/*jslint continue: true */
/*global generateMoves, GameBoardController, makeMove, BOOL, takeMove, printBoard, console, prMove */
var PerftController = {};

var perft_leafNodes;

PerftController.perft = function (depth) {
    "use strict";
    if (depth === 0) {
        perft_leafNodes++;
        return;
    }
    MoveGenController.generateMoves();
    var index, move;
    
    for (index = GameBoardController.moveListStart[GameBoardController.ply]; index < GameBoardController.moveListStart[GameBoardController.ply + 1]; ++index) {
        move = GameBoardController.moveList[index];
        if (MakeMoveController.makeMove(move) === BOOL.FALSE) {
            continue;
        }
        PerftController.perft(depth - 1);
        MakeMoveController.takeMove();
    }
    
    return;
};

PerftController.perftTest = function (depth) {
    "use strict";
    
    GameBoardController.printBoard();
    console.log("Starting Test To Depth:" + depth);
    perft_leafNodes = 0;
    
    MoveGenController.generateMoves();
    
    var index, move, moveNum, cumnodes, oldnodes;
    moveNum = 0;
    for (index = GameBoardController.moveListStart[GameBoardController.ply]; index < GameBoardController.moveListStart[GameBoardController.ply + 1]; ++index) {
        move = GameBoardController.moveList[index];
        if (MakeMoveController.makeMove(move) === BOOL.FALSE) {
            continue;
        }
        moveNum++;
        cumnodes = perft_leafNodes;
        PerftController.perft(depth - 1);
        MakeMoveController.takeMove();
        oldnodes = perft_leafNodes - cumnodes;
        console.log("move:" + moveNum + " " + IoController.prMove(move) + " " + oldnodes);
    }
    
    console.log("Test Complete : " + perft_leafNodes + " leaf nodes visited");
    return;
};