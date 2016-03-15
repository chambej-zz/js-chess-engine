/*global $, parseFen, printBoard, printSqAttacked, perftTest, searchPosition, START_FEN */
$("#SetFen").click(function () {
    "use strict";
    var fenStr = $("#fenIn").val();
    //parseFen(fenStr);
    parseFen(START_FEN);
    //printSqAttacked();
    printBoard();
    //perftTest(5);
    searchPosition();
});

// q3k2b/8/3n/8/8/8/8/R3K2R b KQkq - 0 1
                   
                   