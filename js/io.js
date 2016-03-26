/*global FileChar, FilesBrd, RankChar, RanksBrd, FROMSQ, TOSQ, PROMOTED, PIECES, PieceKnight, PieceRookQueen, PieceBishopQueen, BOOL, console, GameBoard, generateMoves, NOMOVE, COLOURS, makeMove, takeMove */
/*jslint plusplus: true */
var IoController = {};

IoController.prSq = function (sq) {
    "use strict";
    return (FileChar[FilesBrd[sq]] + RankChar[RanksBrd[sq]]);
};

IoController.prMove = function (move) {
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
};

IoController.printMoveList = function () {
    "use strict";
    var index, move;
    console.log('Move List:');
    
    for (index = GameBoardController.moveListStart[GameBoardController.ply]; index < GameBoardController.moveListStart[GameBoardController.ply + 1]; ++index) {
        move = GameBoardController.moveList[index];
        console.log(IoController.prMove(move));
    }
};

IoController.parseMove = function (from, to) {
    "use strict";
    MoveGenController.generateMoves();
    
    var Move = NOMOVE, PromPce = PIECES.EMPTY, found = BOOL.FALSE, index;
    
    for (index = GameBoardController.moveListStart[GameBoardController.ply]; index < GameBoardController.moveListStart[GameBoardController.ply + 1]; ++index) {
        Move = GameBoardController.moveList[index];
        if (FROMSQ(Move) === from && TOSQ(Move) === to) {
            PromPce = PROMOTED(Move);
            if (PromPce !== PIECES.EMPTY) {
                if ((PromPce === PIECES.wQ && GameBoardController.side === COLOURS.WHITE) || (PromPce === PIECES.bQ && GameBoardController.side === COLOURS.BLACK)) {
                    found = BOOL.TRUE;
                    break;
                }
            }
            found = BOOL.TRUE;
            break;
        }
    }
    
    if (found !== BOOL.FALSE) {
        if (MakeMoveController.makeMove(Move) === BOOL.FALSE) {
            return NOMOVE;
        }
        MakeMoveController.takeMove();
        return Move;
    }
    
    return NOMOVE;
};
                    