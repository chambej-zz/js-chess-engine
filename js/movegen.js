/*jslint bitwise: true */
/*jslint plusplus: true */
/*jslint continue: true */
/*global GameBoardController, COLOURS, PIECES, PCEINDEX, RanksBrd, RANKS, SQUARES, BOOL, PieceCol, CASTLEBIT, SQOFFBOARD, LoopNonSlideIndex, LoopNonSlidePce, DirNum, PceDir, LoopSlidePieceIndex, LoopSlidePiece, MFLAGCA, MFLAGEP, MFLAGPS, generateMoves, NOMOVE, makeMove, takeMove, CAPTURED, FROMSQ, MAXDEPTH, BRD_SQ_NUM, TOSQ  */
var MoveGenController = {};

var MvvLvaValue = [ 0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600 ], MvvLvaScores = new Array(14 * 14);

MoveGenController.initMvvLva = function () {
    "use strict";
	var Attacker, Victim;
	
	for (Attacker = PIECES.wP; Attacker <= PIECES.bK; ++Attacker) {
		for (Victim = PIECES.wP; Victim <= PIECES.bK; ++Victim) {
			MvvLvaScores[Victim * 14 + Attacker] = MvvLvaValue[Victim] + 6 - (MvvLvaValue[Attacker] / 100);
		}
	}

};

MoveGenController.moveExists = function (move) {
	"use strict";
	MoveGenController.generateMoves();
    
	var index, moveFound = NOMOVE;
	for (index = GameBoardController.moveListStart[GameBoardController.ply]; index < GameBoardController.moveListStart[GameBoardController.ply + 1]; ++index) {
	
		moveFound = GameBoardController.moveList[index];
		if (MakeMoveController.makeMove(moveFound) === BOOL.FALSE) {
			continue;
		}
		MakeMoveController.takeMove();
		if (move === moveFound) {
			return BOOL.TRUE;
		}
	}
	return BOOL.FALSE;
};


/**
 * @return {number}
 */
MoveGenController.MOVE = function (from, to, captured, promoted, flag) {
    "use strict";
    return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
};

MoveGenController.addCaptureMove = function (move) {
    "use strict";
    GameBoardController.moveList[GameBoardController.moveListStart[GameBoardController.ply + 1]] = move;
    GameBoardController.moveScores[GameBoardController.moveListStart[GameBoardController.ply + 1]++] = MvvLvaScores[CAPTURED(move) * 14 + GameBoardController.pieces[FROMSQ(move)]] + 1000000;
};

MoveGenController.addQuietMove = function (move) {
    "use strict";
    GameBoardController.moveList[GameBoardController.moveListStart[GameBoardController.ply + 1]] = move;
    GameBoardController.moveScores[GameBoardController.moveListStart[GameBoardController.ply + 1]] = 0;
    
    if (move === GameBoardController.searchKillers[GameBoardController.ply]) {
        GameBoardController.moveScores[GameBoardController.moveListStart[GameBoardController.ply + 1]] = 900000;
    } else if (move === GameBoardController.searchKillers[GameBoardController.ply + MAXDEPTH]) {
        GameBoardController.moveScores[GameBoardController.moveListStart[GameBoardController.ply + 1]] = 800000;
    } else {
        GameBoardController.moveScores[GameBoardController.moveListStart[GameBoardController.ply + 1]] = GameBoardController.searchHistory[GameBoardController.pieces[FROMSQ(move)] * BRD_SQ_NUM + TOSQ(move)];
    }
    
    GameBoardController.moveListStart[GameBoardController.ply + 1]++
};

MoveGenController.addEnPassentMove = function (move) {
    "use strict";
    GameBoardController.moveList[GameBoardController.moveListStart[GameBoardController.ply + 1]] = move;
    GameBoardController.moveScores[GameBoardController.moveListStart[GameBoardController.ply + 1]++] = 105 + 1000000;
};

MoveGenController.addWhitePawnCaptureMove = function (from, to, cap) {
    "use strict";
    if (RanksBrd[from] === RANKS.RANK_7) {
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, cap, PIECES.wQ, 0));
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, cap, PIECES.wR, 0));
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, cap, PIECES.wB, 0));
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, cap, PIECES.wN, 0));
    } else {
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
};

MoveGenController.addBlackPawnCaptureMove = function (from, to, cap) {
    "use strict";
    if (RanksBrd[from] === RANKS.RANK_2) {
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, cap, PIECES.bQ, 0));
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, cap, PIECES.bR, 0));
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, cap, PIECES.bB, 0));
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, cap, PIECES.bN, 0));
    } else {
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
};

MoveGenController.addWhitePawnQuietMove = function (from, to) {
    "use strict";
    if (RanksBrd[from] === RANKS.RANK_7) {
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, PIECES.EMPTY, PIECES.wQ, 0));
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, PIECES.EMPTY, PIECES.wR, 0));
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, PIECES.EMPTY, PIECES.wB, 0));
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, PIECES.EMPTY, PIECES.wN, 0));
    } else {
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
};

MoveGenController.addBlackPawnQuietMove = function (from, to) {
    "use strict";
    if (RanksBrd[from] === RANKS.RANK_2) {
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, PIECES.EMPTY, PIECES.bQ, 0));
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, PIECES.EMPTY, PIECES.bR, 0));
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, PIECES.EMPTY, PIECES.bB, 0));
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, PIECES.EMPTY, PIECES.bN, 0));
    } else {
        MoveGenController.addCaptureMove(MoveGenController.MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
};

MoveGenController.generateMoves = function () {
    "use strict";
    GameBoardController.moveListStart[GameBoardController.ply + 1] = GameBoardController.moveListStart[GameBoardController.ply];
    
    var pceType, pceNum, sq, pceIndex, pce, t_sq, dir, index;
    
    if (GameBoardController.side === COLOURS.WHITE) {
        pceType = PIECES.wP;
        for (pceNum = 0; pceNum < GameBoardController.pceNum[pceType]; ++pceNum) {
            sq = GameBoardController.pList[PCEINDEX(pceType, pceNum)];
            
            if (GameBoardController.pieces[sq + 10] === PIECES.EMPTY) {
                MoveGenController.addWhitePawnQuietMove(sq, sq + 10);
                if (RanksBrd[sq] === RANKS.RANK_2 && GameBoardController.pieces[sq + 20] === PIECES.EMPTY) {
                    MoveGenController.addQuietMove(MoveGenController.MOVE(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }
            
            if (SQOFFBOARD(sq + 9) === BOOL.FALSE && PieceCol[GameBoardController.pieces[sq + 9]] === COLOURS.BLACK) {
                MoveGenController.addWhitePawnCaptureMove(sq, sq + 9, GameBoardController.pieces[sq + 9]);
            }
            
            if (SQOFFBOARD(sq + 11) === BOOL.FALSE && PieceCol[GameBoardController.pieces[sq + 11]] === COLOURS.BLACK) {
                MoveGenController.addWhitePawnCaptureMove(sq, sq + 11, GameBoardController.pieces[sq + 11]);
            }
            
            if (GameBoardController.enPas !== SQUARES.NO_SQ) {
                if (sq + 9 === GameBoardController.enPas) {
                    MoveGenController.addEnPassentMove(MoveGenController.MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq + 11 === GameBoardController.enPas) {
                    MoveGenController.addEnPassentMove(MoveGenController.MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
        
        if (GameBoardController.castlePerm & CASTLEBIT.WKCA) {
            if (GameBoardController.pieces[SQUARES.F1] === PIECES.EMPTY && GameBoardController.pieces[SQUARES.G1] === PIECES.EMPTY) {
                if (GameBoardController.sqAttacked(SQUARES.F1, COLOURS.BLACK) === BOOL.FALSE && GameBoardController.sqAttacked(SQUARES.E1, COLOURS.BLACK) === BOOL.FALSE) {
                    MoveGenController.addQuietMove(MoveGenController.MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
        
        if (GameBoardController.castlePerm & CASTLEBIT.WQCA) {
            if (GameBoardController.pieces[SQUARES.D1] === PIECES.EMPTY && GameBoardController.pieces[SQUARES.C1] === PIECES.EMPTY && GameBoardController.pieces[SQUARES.B1] === PIECES.EMPTY) {
                if (GameBoardController.sqAttacked(SQUARES.D1, COLOURS.BLACK) === BOOL.FALSE && GameBoardController.sqAttacked(SQUARES.E1, COLOURS.BLACK) === BOOL.FALSE) {
                    MoveGenController.addQuietMove(MoveGenController.MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
        
    } else {
        pceType = PIECES.bP;
        for (pceNum = 0; pceNum < GameBoardController.pceNum[pceType]; ++pceNum) {
            sq = GameBoardController.pList[PCEINDEX(pceType, pceNum)];
            
            if (GameBoardController.pieces[sq - 10] === PIECES.EMPTY) {
                MoveGenController.addBlackPawnQuietMove(sq, sq - 10);
                if (RanksBrd[sq] === RANKS.RANK_7 && GameBoardController.pieces[sq - 20] === PIECES.EMPTY) {
                    MoveGenController.addQuietMove(MoveGenController.MOVE(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }
            
            if (SQOFFBOARD(sq - 9) === BOOL.FALSE && PieceCol[GameBoardController.pieces[sq - 9]] === COLOURS.WHITE) {
                MoveGenController.addBlackPawnCaptureMove(sq, sq - 9, GameBoardController.pieces[sq - 9]);
            }
            
            if (SQOFFBOARD(sq - 11) === BOOL.FALSE && PieceCol[GameBoardController.pieces[sq - 11]] === COLOURS.WHITE) {
                MoveGenController.addBlackPawnCaptureMove(sq, sq - 11, GameBoardController.pieces[sq - 11]);
            }
            
            if (GameBoardController.enPas !== SQUARES.NO_SQ) {
                if (sq - 9 === GameBoardController.enPas) {
                    MoveGenController.addEnPassentMove(MoveGenController.MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq - 11 === GameBoardController.enPas) {
                    MoveGenController.addEnPassentMove(MoveGenController.MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
        if (GameBoardController.castlePerm & CASTLEBIT.BKCA) {
            if (GameBoardController.pieces[SQUARES.F8] === PIECES.EMPTY && GameBoardController.pieces[SQUARES.G8] === PIECES.EMPTY) {
                if (GameBoardController.sqAttacked(SQUARES.F8, COLOURS.WHITE) === BOOL.FALSE && GameBoardController.sqAttacked(SQUARES.E8, COLOURS.WHITE) === BOOL.FALSE) {
                    MoveGenController.addQuietMove(MoveGenController.MOVE(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
        
        if (GameBoardController.castlePerm & CASTLEBIT.BQCA) {
            if (GameBoardController.pieces[SQUARES.D8] === PIECES.EMPTY && GameBoardController.pieces[SQUARES.C8] === PIECES.EMPTY && GameBoardController.pieces[SQUARES.B8] === PIECES.EMPTY) {
                if (GameBoardController.sqAttacked(SQUARES.D8, COLOURS.WHITE) === BOOL.FALSE && GameBoardController.sqAttacked(SQUARES.E8, COLOURS.WHITE) === BOOL.FALSE) {
                    MoveGenController.addQuietMove(MoveGenController.MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
    }
    
    pceIndex = LoopNonSlideIndex[GameBoardController.side];
    pce = LoopNonSlidePce[pceIndex++];
    
    while (pce !== 0) {
        for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
            sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
            
            for (index = 0; index < DirNum[pce]; index++) {
                dir = PceDir[pce][index];
                t_sq = sq + dir;
                
                if (SQOFFBOARD(t_sq) === BOOL.TRUE) {
                    continue;
                }
                
                if (GameBoardController.pieces[t_sq] !== PIECES.EMPTY) {
                    if (PieceCol[GameBoardController.pieces[t_sq]] !== GameBoardController.side) {
                        MoveGenController.addCaptureMove(MoveGenController.MOVE(sq, t_sq, GameBoardController.pieces[t_sq], PIECES.EMPTY, 0));
                    }
                } else {
                    MoveGenController.addQuietMove(MoveGenController.MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                }
            }
        }
        pce = LoopNonSlidePce[pceIndex++];
    }
    
    pceIndex = LoopSlidePieceIndex[GameBoardController.side];
    pce = LoopSlidePiece[pceIndex++];
    
    while (pce !== 0) {
        for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
            sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
            
            for (index = 0; index < DirNum[pce]; index++) {
                dir = PceDir[pce][index];
                t_sq = sq + dir;
                
                while (SQOFFBOARD(t_sq) === BOOL.FALSE) {
                    
                    if (GameBoardController.pieces[t_sq] !== PIECES.EMPTY) {
                        if (PieceCol[GameBoardController.pieces[t_sq]] !== GameBoardController.side) {
                            MoveGenController.addCaptureMove(MoveGenController.MOVE(sq, t_sq, GameBoardController.pieces[t_sq], PIECES.EMPTY, 0));
                        }
                        break;
                    }
                    MoveGenController.addQuietMove(MoveGenController.MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                    t_sq += dir;
                }
            }
        }
        pce = LoopSlidePiece[pceIndex++];
    }
};

MoveGenController.generateCaptures = function () {
    "use strict";
	GameBoardController.moveListStart[GameBoardController.ply + 1] = GameBoardController.moveListStart[GameBoardController.ply];
	
	var pceType, pceNum, sq, pceIndex, pce, t_sq, dir, index;
    if (GameBoardController.side === COLOURS.WHITE) {
		pceType = PIECES.wP;
		
		for (pceNum = 0; pceNum < GameBoardController.pceNum[pceType]; ++pceNum) {
			sq = GameBoardController.pList[PCEINDEX(pceType, pceNum)];
			
			if (SQOFFBOARD(sq + 9) === BOOL.FALSE && PieceCol[GameBoardController.pieces[sq + 9]] === COLOURS.BLACK) {
				MoveGenController.addWhitePawnCaptureMove(sq, sq + 9, GameBoardController.pieces[sq + 9]);
			}
			
			if (SQOFFBOARD(sq + 11) === BOOL.FALSE && PieceCol[GameBoardController.pieces[sq + 11]] === COLOURS.BLACK) {
				MoveGenController.addWhitePawnCaptureMove(sq, sq + 11, GameBoardController.pieces[sq + 11]);
			}
			
			if (GameBoardController.enPas !== SQUARES.NO_SQ) {
				if (sq + 9 === GameBoardController.enPas) {
					MoveGenController.addEnPassentMove(MoveGenController.MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
				
				if (sq + 11 === GameBoardController.enPas) {
					MoveGenController.addEnPassentMove(MoveGenController.MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
			}
			
		}

	} else {
		pceType = PIECES.bP;
		
		for (pceNum = 0; pceNum < GameBoardController.pceNum[pceType]; ++pceNum) {
			sq = GameBoardController.pList[PCEINDEX(pceType, pceNum)];
			
			if (SQOFFBOARD(sq - 9) === BOOL.FALSE && PieceCol[GameBoardController.pieces[sq - 9]] === COLOURS.WHITE) {
				MoveGenController.addBlackPawnCaptureMove(sq, sq - 9, GameBoardController.pieces[sq - 9]);
			}
			
			if (SQOFFBOARD(sq - 11) === BOOL.FALSE && PieceCol[GameBoardController.pieces[sq - 11]] === COLOURS.WHITE) {
				MoveGenController.addBlackPawnCaptureMove(sq, sq - 11, GameBoardController.pieces[sq - 11]);
			}
			
			if (GameBoardController.enPas !== SQUARES.NO_SQ) {
				if (sq - 9 === GameBoardController.enPas) {
					MoveGenController.addEnPassentMove(MoveGenController.MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
				
				if (sq - 11 === GameBoardController.enPas) {
					MoveGenController.addEnPassentMove(MoveGenController.MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
			}
		}
	}
	
	pceIndex = LoopNonSlideIndex[GameBoardController.side];
	pce = LoopNonSlidePce[pceIndex++];
	
	while (pce !== 0) {
		for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
			sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
			
			for (index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;
				
				if (SQOFFBOARD(t_sq) === BOOL.TRUE) {
					continue;
				}
				
				if (GameBoardController.pieces[t_sq] !== PIECES.EMPTY) {
					if (PieceCol[GameBoardController.pieces[t_sq]] !== GameBoardController.side) {
						MoveGenController.addCaptureMove(MoveGenController.MOVE(sq, t_sq, GameBoardController.pieces[t_sq], PIECES.EMPTY, 0));
					}
				}
			}
		}
		pce = LoopNonSlidePce[pceIndex++];
	}
	
	pceIndex = LoopSlidePieceIndex[GameBoardController.side];
	pce = LoopSlidePiece[pceIndex++];
	
	while (pce !== 0) {
		for (pceNum = 0; pceNum < GameBoardController.pceNum[pce]; ++pceNum) {
			sq = GameBoardController.pList[PCEINDEX(pce, pceNum)];
			
			for (index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;
				
				while (SQOFFBOARD(t_sq) === BOOL.FALSE) {
				
					if (GameBoardController.pieces[t_sq] !== PIECES.EMPTY) {
						if (PieceCol[GameBoardController.pieces[t_sq]] !== GameBoardController.side) {
							MoveGenController.addCaptureMove(MoveGenController.MOVE(sq, t_sq, GameBoardController.pieces[t_sq], PIECES.EMPTY, 0));
						}
						break;
					}
					t_sq += dir;
				}
			}
		}
		pce = LoopSlidePiece[pceIndex++];
	}
};