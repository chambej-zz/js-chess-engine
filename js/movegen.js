/*jslint bitwise: true */
/*jslint plusplus: true */
/*jslint continue: true */
/*global GameBoard, COLOURS, PIECES, PCEINDEX, RanksBrd, RANKS, SQUARES, BOOL, PieceCol, CASTLEBIT, sqAttacked, SQOFFBOARD, LoopNonSlideIndex, LoopNonSlidePce, DirNum, PceDir, LoopSlidePieceIndex, LoopSlidePiece, MFLAGCA, MFLAGEP, MFLAGPS */
function MOVE(from, to, captured, promoted, flag) {
    "use strict";
    return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

function addCaptureMove(move) {
    "use strict";
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] = 0;
}

function addQuietMove(move) {
    "use strict";
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] = 0;
}

function addEnPassentMove(move) {
    "use strict";
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] = 0;
}

function addWhitePawnCaptureMove(from, to, cap) {
    "use strict";
    if (RanksBrd[from] === RANKS.RANK_7) {
        addCaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
        addCaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
        addCaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
        addCaptureMove(MOVE(from, to, cap, PIECES.wN, 0));
    } else {
        addCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
}

function addBlackPawnCaptureMove(from, to, cap) {
    "use strict";
    if (RanksBrd[from] === RANKS.RANK_2) {
        addCaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
        addCaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
        addCaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
        addCaptureMove(MOVE(from, to, cap, PIECES.bN, 0));
    } else {
        addCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
}

function addWhitePawnQuietMove(from, to) {
    "use strict";
    if (RanksBrd[from] === RANKS.RANK_7) {
        addCaptureMove(MOVE(from, to, PIECES.EMPTY, PIECES.wQ, 0));
        addCaptureMove(MOVE(from, to, PIECES.EMPTY, PIECES.wR, 0));
        addCaptureMove(MOVE(from, to, PIECES.EMPTY, PIECES.wB, 0));
        addCaptureMove(MOVE(from, to, PIECES.EMPTY, PIECES.wN, 0));
    } else {
        addCaptureMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
}

function addBlackPawnQuietMove(from, to) {
    "use strict";
    if (RanksBrd[from] === RANKS.RANK_2) {
        addCaptureMove(MOVE(from, to, PIECES.EMPTY, PIECES.bQ, 0));
        addCaptureMove(MOVE(from, to, PIECES.EMPTY, PIECES.bR, 0));
        addCaptureMove(MOVE(from, to, PIECES.EMPTY, PIECES.bB, 0));
        addCaptureMove(MOVE(from, to, PIECES.EMPTY, PIECES.bN, 0));
    } else {
        addCaptureMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
}

function generateMoves() {
    "use strict";
    GameBoard.moveListStart[GameBoard.ply + 1] = GameBoard.moveListStart[GameBoard.ply];
    
    var pceType, pceNum, sq, pceIndex, pce, t_sq, dir, index;
    
    if (GameBoard.side === COLOURS.WHITE) {
        pceType = PIECES.wP;
        for (pceNum = 0; pceNum < GameBoard.pceNum[pceType]; ++pceNum) {
            sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];
            
            if (GameBoard.pieces[sq + 10] === PIECES.EMPTY) {
                addWhitePawnQuietMove(sq, sq + 10);
                if (RanksBrd[sq] === RANKS.RANK_2 && GameBoard.pieces[sq + 20] === PIECES.EMPTY) {
                    addQuietMove(MOVE(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }
            
            if (SQOFFBOARD(sq + 9) === BOOL.FALSE && PieceCol[GameBoard.pieces[sq + 9]] === COLOURS.BLACK) {
                addWhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq + 9]);
            }
            
            if (SQOFFBOARD(sq + 11) === BOOL.FALSE && PieceCol[GameBoard.pieces[sq + 11]] === COLOURS.BLACK) {
                addWhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq + 11]);
            }
            
            if (GameBoard.enPas !== SQUARES.NO_SQ) {
                if (sq + 9 === GameBoard.enPas) {
                    addEnPassentMove(MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq + 11 === GameBoard.enPas) {
                    addEnPassentMove(MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
        
        if (GameBoard.castlePerm & CASTLEBIT.WKCA) {
            if (GameBoard.pieces[SQUARES.F1] === PIECES.EMPTY && GameBoard.pieces[SQUARES.G1] === PIECES.EMPTY) {
                if (sqAttacked(SQUARES.F1, COLOURS.BLACK) === BOOL.FALSE && sqAttacked(SQUARES.E1, COLOURS.BLACK) === BOOL.FALSE) {
                    addQuietMove(MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
        
        if (GameBoard.castlePerm & CASTLEBIT.WQCA) {
            if (GameBoard.pieces[SQUARES.D1] === PIECES.EMPTY && GameBoard.pieces[SQUARES.C1] === PIECES.EMPTY && GameBoard.pieces[SQUARES.B1] === PIECES.EMPTY) {
                if (sqAttacked(SQUARES.D1, COLOURS.BLACK) === BOOL.FALSE && sqAttacked(SQUARES.E1, COLOURS.BLACK) === BOOL.FALSE) {
                    addQuietMove(MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
        
    } else {
        pceType = PIECES.bP;
        for (pceNum = 0; pceNum < GameBoard.pceNum[pceType]; ++pceNum) {
            sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];
            
            if (GameBoard.pieces[sq - 10] === PIECES.EMPTY) {
                addBlackPawnQuietMove(sq, sq - 10);
                if (RanksBrd[sq] === RANKS.RANK_7 && GameBoard.pieces[sq - 20] === PIECES.EMPTY) {
                    addQuietMove(MOVE(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }
            
            if (SQOFFBOARD(sq - 9) === BOOL.FALSE && PieceCol[GameBoard.pieces[sq - 9]] === COLOURS.WHITE) {
                addBlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq - 9]);
            }
            
            if (SQOFFBOARD(sq - 11) === BOOL.FALSE && PieceCol[GameBoard.pieces[sq - 11]] === COLOURS.WHITE) {
                addBlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq - 11]);
            }
            
            if (GameBoard.enPas !== SQUARES.NO_SQ) {
                if (sq - 9 === GameBoard.enPas) {
                    addEnPassentMove(MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq - 11 === GameBoard.enPas) {
                    addEnPassentMove(MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
        if (GameBoard.castlePerm & CASTLEBIT.BKCA) {
            if (GameBoard.pieces[SQUARES.F8] === PIECES.EMPTY && GameBoard.pieces[SQUARES.G8] === PIECES.EMPTY) {
                if (sqAttacked(SQUARES.F8, COLOURS.WHITE) === BOOL.FALSE && sqAttacked(SQUARES.E8, COLOURS.WHITE) === BOOL.FALSE) {
                    addQuietMove(MOVE(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
        
        if (GameBoard.castlePerm & CASTLEBIT.BQCA) {
            if (GameBoard.pieces[SQUARES.D8] === PIECES.EMPTY && GameBoard.pieces[SQUARES.C8] === PIECES.EMPTY && GameBoard.pieces[SQUARES.B8] === PIECES.EMPTY) {
                if (sqAttacked(SQUARES.D8, COLOURS.WHITE) === BOOL.FALSE && sqAttacked(SQUARES.E8, COLOURS.WHITE) === BOOL.FALSE) {
                    addQuietMove(MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
    }
    
    pceIndex = LoopNonSlideIndex[GameBoard.side];
    pce = LoopNonSlidePce[pceIndex++];
    
    while (pce !== 0) {
        for (pceNum = 0; pceNum < GameBoard.pceNum[pce]; ++pceNum) {
            sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
            
            for (index = 0; index < DirNum[pce]; index++) {
                dir = PceDir[pce][index];
                t_sq = sq + dir;
                
                if (SQOFFBOARD(t_sq) === BOOL.TRUE) {
                    continue;
                }
                
                if (GameBoard.pieces[t_sq] !== PIECES.EMPTY) {
                    if (PieceCol[GameBoard.pieces[t_sq]] !== GameBoard.side) {
                        addCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0));
                    }
                } else {
                    addQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                }
            }
        }
        pce = LoopNonSlidePce[pceIndex++];
    }
    
    pceIndex = LoopSlidePieceIndex[GameBoard.side];
    pce = LoopSlidePiece[pceIndex++];
    
    while (pce !== 0) {
        for (pceNum = 0; pceNum < GameBoard.pceNum[pce]; ++pceNum) {
            sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
            
            for (index = 0; index < DirNum[pce]; index++) {
                dir = PceDir[pce][index];
                t_sq = sq + dir;
                
                while (SQOFFBOARD(t_sq) === BOOL.FALSE) {
                    
                    if (GameBoard.pieces[t_sq] !== PIECES.EMPTY) {
                        if (PieceCol[GameBoard.pieces[t_sq]] !== GameBoard.side) {
                            addCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0));
                        }
                        break;
                    }
                    addQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                    t_sq += dir;
                }
            }
        }
        pce = LoopSlidePiece[pceIndex++];
    }
}