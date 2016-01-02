/*jslint plusplus: true */
/*jslint bitwise: true */
/*jslint continue: true */
/*global generateMoves, GameBoard, makeMove, BOOL, takeMove, printBoard, console, prMove */
var perft_leafNodes;

function perft(depth) {
    "use strict";
    if (depth === 0) {
        perft_leafNodes++;
        return;
    }
    generateMoves();
    var index, move;
    
    for (index = GameBoard.moveListStart[GameBoard.ply]; index < GameBoard.moveListStart[GameBoard.ply + 1]; ++index) {
        move = GameBoard.moveList[index];
        if (makeMove(move) === BOOL.FALSE) {
            continue;
        }
        perft(depth - 1);
        takeMove();
    }
    
    return;
}

function perftTest(depth) {
    "use strict";
    
    printBoard();
    console.log("Starting Test To Depth:" + depth);
    perft_leafNodes = 0;
    
    generateMoves();
    
    var index, move, moveNum, cumnodes, oldnodes;
    moveNum = 0;
    for (index = GameBoard.moveListStart[GameBoard.ply]; index < GameBoard.moveListStart[GameBoard.ply + 1]; ++index) {
        move = GameBoard.moveList[index];
        if (makeMove(move) === BOOL.FALSE) {
            continue;
        }
        moveNum++;
        cumnodes = perft_leafNodes;
        perft(depth - 1);
        takeMove();
        oldnodes = perft_leafNodes - cumnodes;
        console.log("move:" + moveNum + " " + prMove(move) + " " + oldnodes);
    }
    
    console.log("Test Complete : " + perft_leafNodes + " leaf nodes visited");
    return;
}