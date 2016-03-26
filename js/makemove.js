/*jslint plusplus: true */
/*jslint bitwise: true */
/*global GameBoardController, PieceCol, HASH_PCE, PIECES, PieceVal, PCEINDEX, FROMSQ, TOSQ, MFLAGEP, COLOURS, MFLAGCA, SQUARES, HASH_EP, CastlePerm, HASH_CA, CAPTURED, PiecePawn, BOOL, MFLAGPS, PROMOTED, HASH_SIDE, sqAttacked, Kings, takeMove */
var MakeMoveController = {};

MakeMoveController.clearPiece = function (sq) {
    "use strict";
    var pce, col, index, t_pceNum;
    
    pce = GameBoardController.pieces[sq];
    col = PieceCol[pce];
    t_pceNum = -1;
    
    HASH_PCE(pce, sq);
    
    GameBoardController.pieces[sq] = PIECES.EMPTY;
    GameBoardController.material[col] -= PieceVal[pce];
    
    for (index = 0; index < GameBoardController.pceNum[pce]; ++index) {
        if (GameBoardController.pList[PCEINDEX(pce, index)] === sq) {
            t_pceNum = index;
            break;
        }
    }
    
    GameBoardController.pceNum[pce]--;
    GameBoardController.pList[PCEINDEX(pce, t_pceNum)] = GameBoardController.pList[PCEINDEX(pce, GameBoardController.pceNum[pce])];
                                                                      
};

MakeMoveController.addPiece = function (sq, pce) {
    "use strict";
    var col = PieceCol[pce];
    
    HASH_PCE(pce, sq);
    
    GameBoardController.pieces[sq] = pce;
    GameBoardController.material[col] += PieceVal[pce];
    GameBoardController.pList[PCEINDEX(pce, GameBoardController.pceNum[pce])] = sq;
    GameBoardController.pceNum[pce]++;
};

MakeMoveController.movePiece = function (from, to) {
    "use strict";
    var index, pce;
    
    pce = GameBoardController.pieces[from];
    
    HASH_PCE(pce, from);
    GameBoardController.pieces[from] = PIECES.EMPTY;
    
    HASH_PCE(pce, to);
    GameBoardController.pieces[to] = pce;
    
    for (index = 0; index < GameBoardController.pceNum[pce]; ++index) {
        if (GameBoardController.pList[PCEINDEX(pce, index)] === from) {
            GameBoardController.pList[PCEINDEX(pce, index)] = to;
            break;
        }
    }
};

MakeMoveController.makeMove = function (move) {
    "use strict";
    var from, to, side, captured, prPce;
    from = FROMSQ(move);
    to = TOSQ(move);
    side = GameBoardController.side;
    
    GameBoardController.history[GameBoardController.hisPly].posKey = GameBoardController.posKey;
    
    // EnPass Capture
    if ((move & MFLAGEP) !== 0) {
        if (side === COLOURS.WHITE) {
            MakeMoveController.clearPiece(to - 10);
        } else {
            MakeMoveController.clearPiece(to + 10);
        }
    } else if ((move & MFLAGCA) !== 0) {
        switch (to) {
        case SQUARES.C1:
            MakeMoveController.movePiece(SQUARES.A1, SQUARES.D1);
            break;
        case SQUARES.C8:
            MakeMoveController.movePiece(SQUARES.A8, SQUARES.D8);
            break;
        case SQUARES.G1:
            MakeMoveController.movePiece(SQUARES.H1, SQUARES.F1);
            break;
        case SQUARES.G8:
            MakeMoveController.movePiece(SQUARES.H8, SQUARES.F8);
            break;
        default:
            break;
        }
    }
    
    if (GameBoardController.enPas !== SQUARES.NO_SQ) {
        HASH_EP();
    }
    HASH_CA();
    
    GameBoardController.history[GameBoardController.hisPly].move = move;
    GameBoardController.history[GameBoardController.hisPly].fiftyMove = GameBoardController.fiftyMove;
    GameBoardController.history[GameBoardController.hisPly].enPas = GameBoardController.enPas;
    GameBoardController.history[GameBoardController.hisPly].castlePerm = GameBoardController.castlePerm;
    
    GameBoardController.castlePerm &= CastlePerm[from];
    GameBoardController.castlePerm &= CastlePerm[to];
    GameBoardController.enPas = SQUARES.NO_SQ;
    
    HASH_CA();
    
    captured = CAPTURED(move);
    
    if (captured !== PIECES.EMPTY) {
        MakeMoveController.clearPiece(to);
        GameBoardController.fiftyMove = 0;
    }
    
    GameBoardController.hisPly++;
    GameBoardController.ply++;
    
    if (PiecePawn[GameBoardController.pieces[from]] === BOOL.TRUE) {
        GameBoardController.fiftyMove = 0;
        if ((move & MFLAGPS) !== 0) {
            if (side === COLOURS.WHITE) {
                GameBoardController.enPas = from + 10;
            } else {
                GameBoardController.enPas = from - 10;
            }
            HASH_EP();
        }
    }
    
    MakeMoveController.movePiece(from, to);
    
    prPce = PROMOTED(move);
    if (prPce !== PIECES.EMPTY) {
        MakeMoveController.clearPiece(to);
        MakeMoveController.addPiece(to, prPce);
    }
    
    GameBoardController.side ^= 1;
    HASH_SIDE();
    
    if (GameBoardController.sqAttacked(GameBoardController.pList[PCEINDEX(Kings[side], 0)], GameBoardController.side)) {
        MakeMoveController.takeMove();
        return BOOL.FALSE;
    }
    
    return BOOL.TRUE;
};

MakeMoveController.takeMove = function () {
    "use strict";
    
    GameBoardController.hisPly--;
    GameBoardController.ply--;
    
    var move, from, to, captured;
    move = GameBoardController.history[GameBoardController.hisPly].move;
    from = FROMSQ(move);
    to = TOSQ(move);
    
    if (GameBoardController.enPas !== SQUARES.NO_SQ) {
        HASH_EP();
    }
    HASH_CA();
    
    GameBoardController.castlePerm = GameBoardController.history[GameBoardController.hisPly].castlePerm;
    GameBoardController.fiftyMove = GameBoardController.history[GameBoardController.hisPly].fiftyMove;
    GameBoardController.enPas = GameBoardController.history[GameBoardController.hisPly].enPas;
    
    if (GameBoardController.enPas !== SQUARES.NO_SQ) {
        HASH_EP();
    }
    HASH_CA();
    
    GameBoardController.side ^= 1;
    HASH_SIDE();
    
    if ((move & MFLAGEP) !== 0) {
        if (GameBoardController.side === COLOURS.WHITE) {
            MakeMoveController.addPiece(to - 10, PIECES.bP);
        } else {
            MakeMoveController.addPiece(to + 10, PIECES.wP);
        }
    } else if ((move & MFLAGCA) !== 0) {
        switch (to) {
        case SQUARES.C1:
            MakeMoveController.movePiece(SQUARES.D1, SQUARES.A1);
            break;
        case SQUARES.C8:
            MakeMoveController.movePiece(SQUARES.D8, SQUARES.A8);
            break;
        case SQUARES.G1:
            MakeMoveController.movePiece(SQUARES.F1, SQUARES.H1);
            break;
        case SQUARES.G8:
            MakeMoveController.movePiece(SQUARES.F8, SQUARES.H8);
            break;
        default:
            break;
        }
    }
    
    MakeMoveController.movePiece(to, from);
    
    captured = CAPTURED(move);
    if (captured !== PIECES.EMPTY) {
        MakeMoveController.addPiece(to, captured);
    }
    
    if (PROMOTED(move) !== PIECES.EMPTY) {
        MakeMoveController.clearPiece(from);
        MakeMoveController.addPiece(from, (PieceCol[PROMOTED(move)] === COLOURS.WHITE ? PIECES.wP : PIECES.bP));
    }
    
    
};