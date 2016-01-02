/*global FileChar, FilesBrd, RankChar, RanksBrd, FROMSQ, TOSQ, PROMOTED, PIECES, PieceKnight, PieceRookQueen, PieceBishopQueen, BOOL, console, GameBoard */
/*jslint plusplus: true */
function prSq(sq) {
    "use strict";
    return (FileChar[FilesBrd[sq]] + RankChar[RanksBrd[sq]]);
}

function prMove(move) {
    "use strict";
    var MvStr, ff, rf, ft, rt, promoted, pchar;
    
    ff = FilesBrd[FROMSQ(move)];
    rf = RanksBrd[FROMSQ(move)];
    ft = FilesBrd[TOSQ(move)];
    rt = RanksBrd[TOSQ(move)];
    
    MvStr = FileChar[ff] + RankChar[rf] + FileChar[ft] + RankChar[rt];
    
    promoted = PROMOTED(move);
    
    if (promoted !== PIECES.EMPTY) {
        pchar = 'q';
        if (PieceKnight[promoted] === BOOL.TRUE) {
            pchar = 'n';
        } else if (PieceRookQueen[promoted] === BOOL.TRUE && PieceBishopQueen[promoted] === BOOL.FALSE) {
            pchar = 'r';
        } else if (PieceRookQueen[promoted] === BOOL.FALSE && PieceBishopQueen[promoted] === BOOL.TRUE) {
            pchar = 'b';
        }
        MvStr += pchar;
    }
    return MvStr;
}

function printMoveList() {
    "use strict";
    var index, move;
    console.log('Move List:');
    
    for (index = GameBoard.moveListStart[GameBoard.ply]; index < GameBoard.moveListStart[GameBoard.ply + 1]; ++index) {
        move = GameBoard.moveList[index];
        console.log(prMove(move));
    }
}