/*global $, parseFen, printBoard, printSqAttacked, perftTest */
$("#SetFen").click(function () {
    "use strict";
    var fenStr = $("#fenIn").val();
    parseFen(fenStr);
    printSqAttacked();
    printBoard();
    perftTest(5);
});

// q3k2b/8/3n/8/8/8/8/R3K2R b KQkq - 0 1
                   
                   