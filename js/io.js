/*global FileChar, FilesBrd, RankChar, RanksBrd, FROMSQ, TOSQ, PROMOTED, PIECES, PieceKnight, PieceRookQueen, PieceBishopQueen, BOOL, console, GameBoard, generateMoves, NOMOVE, COLOURS, makeMove, takeMove */
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

function parseMove(from, to) {
    "use strict";
    generateMoves();
    
    var Move = NOMOVE, PromPce = PIECES.EMPTY, found = BOOL.FALSE, index;
    
    for (index = GameBoard.moveListStart[GameBoard.ply]; index < GameBoard.moveListStart[GameBoard.ply + 1]; ++index) {
        Move = GameBoard.moveList[index];
        if (FROMSQ(Move) === from && TOSQ(Move) === to) {
            PromPce = PROMOTED(Move);
            if (PromPce !== PIECES.EMPTY) {
                if ((PromPce === PIECES.wQ && GameBoard.side === COLOURS.WHITE) || (PromPce === PIECES.bQ && GameBoard.side === COLOURS.BLACK)) {
                    found = BOOL.TRUE;
                    break;
                }
            }
            found = BOOL.TRUE;
            break;
        }
    }
    
    if (found !== BOOL.FALSE) {
        if (makeMove(Move) === BOOL.FALSE) {
            return NOMOVE;
        }
        takeMove();
        return Move;
    }
    
    return NOMOVE;
}
                    