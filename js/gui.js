/*global $, parseFen, printBoard, printSqAttacked, perftTest, searchPosition, START_FEN */
$("#SetFen").click(function () {
    "use strict";
    var fenStr = $("#fenIn").val();
    parseFen(fenStr);
    //parseFen(START_FEN);
    //printSqAttacked();
    printBoard();
    //perftTest(5);
    searchPosition();
});

// q3k2b/8/3n/8/8/8/8/R3K2R b KQkq - 0 1

// 2rr3k/pp3pp1/1nnqbN1p/3pN3/2pP4/2P3Q1/PPB4P/R4RK1 w - -

// r1bq2rk/pp3pbp/2p1p1pQ/7P/3P4/2PB1N2/PP3PPR/2KR4 w - -

// 1br3k1/p4p2/2p1r3/3p1b2/3Bn1p1/1P2P1Pq/P3Q1BP/2R1NRK1 b - -
                   
                   