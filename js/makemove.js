/*jslint plusplus: true */
/*jslint bitwise: true */
/*global GameBoard, PieceCol, HASH_PCE, PIECES, PieceVal, PCEINDEX, FROMSQ, TOSQ, MFLAGEP, COLOURS, MFLAGCA, SQUARES, HASH_EP, CastlePerm, HASH_CA, CAPTURED, PiecePawn, BOOL, MFLAGPS, PROMOTED, HASH_SIDE, sqAttacked, Kings, takeMove */
function clearPiece(sq) {
    "use strict";
    var pce, col, index, t_pceNum;
    
    pce = GameBoard.pieces[sq];
    col = PieceCol[pce];
    t_pceNum = -1;
    
    HASH_PCE(pce, sq);
    
    GameBoard.pieces[sq] = PIECES.EMPTY;
    GameBoard.material[col] -= PieceVal[pce];
    
    for (index = 0; index < GameBoard.pceNum[pce]; ++index) {
        if (GameBoard.pList[PCEINDEX(pce, index)] === sq) {
            t_pceNum = index;
            break;
        }
    }
    
    GameBoard.pceNum[pce]--;
    GameBoard.pList[PCEINDEX(pce, t_pceNum)] = GameBoard.pList[PCEINDEX(pce, GameBoard.pceNum[pce])];
                                                                      
}

function addPiece(sq, pce) {
    "use strict";
    var col = PieceCol[pce];
    
    HASH_PCE(pce, sq);
    
    GameBoard.pieces[sq] = pce;
    GameBoard.material[col] += PieceVal[pce];
    GameBoard.pList[PCEINDEX(pce, GameBoard.pceNum[pce])] = sq;
    GameBoard.pceNum[pce]++;
}

function movePiece(from, to) {
    "use strict";
    var index, pce;
    
    pce = GameBoard.pieces[from];
    
    HASH_PCE(pce, from);
    GameBoard.pieces[from] = PIECES.EMPTY;
    
    HASH_PCE(pce, to);
    GameBoard.pieces[to] = pce;
    
    for (index = 0; index < GameBoard.pceNum[pce]; ++index) {
        if (GameBoard.pList[PCEINDEX(pce, index)] === from) {
            GameBoard.pList[PCEINDEX(pce, index)] = to;
            break;
        }
    }
}

function makeMove(move) {
    "use strict";
    var from, to, side, captured, prPce;
    from = FROMSQ(move);
    to = TOSQ(move);
    side = GameBoard.side;
    
    GameBoard.history[GameBoard.hisPly].posKey = GameBoard.posKey;
    
    // EnPass Capture
    if ((move & MFLAGEP) !== 0) {
        if (side === COLOURS.WHITE) {
            clearPiece(to - 10);
        } else {
            clearPiece(to + 10);
        }
    } else if ((move & MFLAGCA) !== 0) {
        switch (to) {
        case SQUARES.C1:
            movePiece(SQUARES.A1, SQUARES.D1);
            break;
        case SQUARES.C8:
            movePiece(SQUARES.A8, SQUARES.D8);
            break;
        case SQUARES.G1:
            movePiece(SQUARES.H1, SQUARES.F1);
            break;
        case SQUARES.G8:
            movePiece(SQUARES.H8, SQUARES.F8);
            break;
        default:
            break;
        }
    }
    
    if (GameBoard.enPas !== SQUARES.NO_SQ) {
        HASH_EP();
    }
    HASH_CA();
    
    GameBoard.history[GameBoard.hisPly].move = move;
    GameBoard.history[GameBoard.hisPly].fiftyMove = GameBoard.fiftyMove;
    GameBoard.history[GameBoard.hisPly].enPas = GameBoard.enPas;
    GameBoard.history[GameBoard.hisPly].castlePerm = GameBoard.castlePerm;
    
    GameBoard.castlePerm &= CastlePerm[from];
    GameBoard.castlePerm &= CastlePerm[to];
    GameBoard.enPas = SQUARES.NO_SQ;
    
    HASH_CA();
    
    captured = CAPTURED(move);
    
    if (captured !== PIECES.EMPTY) {
        clearPiece(to);
        GameBoard.fiftyMove = 0;
    }
    
    GameBoard.hisPly++;
    GameBoard.ply++;
    
    if (PiecePawn[GameBoard.pieces[from]] === BOOL.TRUE) {
        GameBoard.fiftyMove = 0;
        if ((move & MFLAGPS) !== 0) {
            if (side === COLOURS.WHITE) {
                GameBoard.enPas = from + 10;
            } else {
                GameBoard.enPas = from - 10;
            }
            HASH_EP();
        }
    }
    
    movePiece(from, to);
    
    prPce = PROMOTED(move);
    if (prPce !== PIECES.EMPTY) {
        clearPiece(to);
        addPiece(to, prPce);
    }
    
    GameBoard.side ^= 1;
    HASH_SIDE();
    
    if (sqAttacked(GameBoard.pList[PCEINDEX(Kings[side], 0)], GameBoard.side)) {
        takeMove();
        return BOOL.FALSE;
    }
    
    return BOOL.TRUE;
}

function takeMove() {
    "use strict";
    
    GameBoard.hisPly--;
    GameBoard.ply--;
    
    var move, from, to, captured;
    move = GameBoard.history[GameBoard.hisPly].move;
    from = FROMSQ(move);
    to = TOSQ(move);
    
    if (GameBoard.enPas !== SQUARES.NO_SQ) {
        HASH_EP();
    }
    HASH_CA();
    
    GameBoard.castlePerm = GameBoard.history[GameBoard.hisPly].castlePerm;
    GameBoard.fiftyMove = GameBoard.history[GameBoard.hisPly].fiftyMove;
    GameBoard.enPas = GameBoard.history[GameBoard.hisPly].enPas;
    
    if (GameBoard.enPas !== SQUARES.NO_SQ) {
        HASH_EP();
    }
    HASH_CA();
    
    GameBoard.side ^= 1;
    HASH_SIDE();
    
    if ((move & MFLAGEP) !== 0) {
        if (GameBoard.side === COLOURS.WHITE) {
            addPiece(to - 10, PIECES.bP);
        } else {
            addPiece(to + 10, PIECES.wP);
        }
    } else if ((move & MFLAGCA) !== 0) {
        switch (to) {
        case SQUARES.C1:
            movePiece(SQUARES.D1, SQUARES.A1);
            break;
        case SQUARES.C8:
            movePiece(SQUARES.D8, SQUARES.A8);
            break;
        case SQUARES.G1:
            movePiece(SQUARES.F1, SQUARES.H1);
            break;
        case SQUARES.G8:
            movePiece(SQUARES.F8, SQUARES.H8);
            break;
        default:
            break;
        }
    }
    
    movePiece(to, from);
    
    captured = CAPTURED(move);
    if (captured !== PIECES.EMPTY) {
        addPiece(to, captured);
    }
    
    if (PROMOTED(move) !== PIECES.EMPTY) {
        clearPiece(from);
        addPiece(from, (PieceCol[PROMOTED(move)] === COLOURS.WHITE ? PIECES.wP : PIECES.bP));
    }
    
    
}