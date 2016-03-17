/*jslint plusplus: true */
/*jslint bitwise: true */
/*jslint continue: true */
/*global BOOL, NOMOVE, INFINITE, GameBoard, MAXDEPTH, generateMoves, makeMove, takeMove, $, evalPosition, storePvMove, sqAttacked, PCEINDEX, Kings, MATE, BRD_SQ_NUM, PVENTRIES, probePvTable, prMove, console, getPvLine, generateCaptures, MFLAGCAP, FROMSQ, TOSQ */
var SearchController = {};

SearchController.nodes;
SearchController.fh;
SearchController.fhf;
SearchController.depth;
SearchController.time;
SearchController.start;
SearchController.stop;
SearchController.best;
SearchController.thinking;

function pickNextMove(MoveNum) {
    "use strict";
    var index = 0, bestScore = -1, bestNum = MoveNum, temp;

    for (index = MoveNum; index < GameBoard.moveListStart[GameBoard.ply + 1]; ++index) {
        if (GameBoard.moveScores[index] > bestScore) {
            bestScore = GameBoard.moveScores[index];
            bestNum = index;
        }
    }

    if (bestNum !== MoveNum) {
        temp = 0;
        temp = GameBoard.moveScores[MoveNum];
        GameBoard.moveScores[MoveNum] = GameBoard.moveScores[bestNum];
        GameBoard.moveScores[bestNum] = temp;

        temp = GameBoard.moveList[MoveNum];
        GameBoard.moveList[MoveNum] = GameBoard.moveList[bestNum];
        GameBoard.moveList[bestNum] = temp;
    }
}

function clearPvTable() {
    "use strict";
    var index;

    for (index = 0; index < PVENTRIES; index++) {
        GameBoard.pvTable[index].move = NOMOVE;
        GameBoard.pvTable[index].posKey = 0;
    }
}

function checkUp() {
    "use strict";
    if (($.now() - SearchController.start) > SearchController.time) {
        SearchController.stop === BOOL.TRUE;
    }
}


function isRepetition() {
    "use strict";
    var index = 0;

    for (index = GameBoard.hisPly - GameBoard.fiftyMove; index < GameBoard.hisPly - 1; ++index) {
        if (GameBoard.posKey === GameBoard.history[index].posKey) {
            return BOOL.TRUE;
        }
    }

    return BOOL.FALSE;
}

function quiescence(alpha, beta) {
    "use strict";
    if ((SearchController.nodes & 2047) === 0) {
        checkUp();
    }

    SearchController.nodes++;

    if ((isRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply !== 0) {
        return 0;
    }

    if (GameBoard.ply > MAXDEPTH - 1) {
        return evalPosition();
    }

    var Score = evalPosition(), MoveNum = 0, Legal = 0, OldAlpha, BestMove = NOMOVE, Move = NOMOVE;

    if (Score >= beta) {
        return beta;
    }

    if (Score > alpha) {
        alpha = Score;
    }

    generateCaptures();

    OldAlpha = alpha;
    
    for (MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++MoveNum) {

        pickNextMove(MoveNum);

        Move = GameBoard.moveList[MoveNum];

        if (makeMove(Move) === BOOL.FALSE) {
            continue;
        }
        Legal++;
        Score = -quiescence(-beta, -alpha);

        takeMove();

        if (SearchController.stop === BOOL.TRUE) {
            return 0;
        }

        if (Score > alpha) {
            if (Score >= beta) {
                if (Legal === 1) {
                    SearchController.fhf++;
                }
                SearchController.fh++;
                return beta;
            }
            alpha = Score;
            BestMove = Move;
        }
    }

    if (alpha !== OldAlpha) {
        storePvMove(BestMove);
    }

    return alpha;

}

function alphaBeta(alpha, beta, depth) {
    "use strict";

    if (depth <= 0) {
        return quiescence(alpha, beta);
    }

    if ((SearchController.nodes & 2047) === 0) {
        checkUp();
    }

    SearchController.nodes++;

    if ((isRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply !== 0) {
        return 0;
    }

    if (GameBoard.ply > MAXDEPTH - 1) {
        return evalPosition();
    }

    var InCheck = sqAttacked(GameBoard.pList[PCEINDEX(Kings[GameBoard.side], 0)], GameBoard.side ^ 1), Score = -INFINITE, MoveNum = 0, Legal = 0, OldAlpha = alpha, BestMove = NOMOVE, Move = NOMOVE, PvMove = probePvTable();
    if (InCheck === BOOL.TRUE) {
        depth++;
    }

    generateMoves();

    OldAlpha = alpha;
    if (PvMove !== NOMOVE) {
        for (MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++MoveNum) {
            if (GameBoard.moveList[MoveNum] === PvMove) {
                GameBoard.moveScores[MoveNum] = 2000000;
                break;
            }
        }
    }

    for (MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++MoveNum) {

        pickNextMove(MoveNum);

        Move = GameBoard.moveList[MoveNum];

        if (makeMove(Move) === BOOL.FALSE) {
            continue;
        }
        Legal++;
        Score = -alphaBeta(-beta, -alpha, depth - 1);

        takeMove();

        if (SearchController.stop === BOOL.TRUE) {
            return 0;
        }

        //console.log('Score: ' + Score + ' Alpha: ' + alpha + ' Beta: ' + beta);
        if (Score > alpha) {
            if (Score >= beta) {
                if (Legal === 1) {
                    SearchController.fhf++;
                }
                SearchController.fh++;
                if ((Move & MFLAGCAP) === 0) {
                    GameBoard.searchKillers[MAXDEPTH + GameBoard.ply] =
                        GameBoard.searchKillers[GameBoard.ply];
                    GameBoard.searchKillers[GameBoard.ply] = Move;
                }
                return beta;
            }
            if ((Move & MFLAGCAP) === 0) {
                GameBoard.searchHistory[GameBoard.pieces[FROMSQ(Move)] * BRD_SQ_NUM + TOSQ(Move)]
                    += depth * depth;
            }
            alpha = Score;
            BestMove = Move;
        }
    }

    if (Legal === 0) {
        if (InCheck === BOOL.TRUE) {
            return -MATE + GameBoard.ply;
        } else {
            return 0;
        }
    }

    if (alpha !== OldAlpha) {
        storePvMove(BestMove);
    }

    return alpha;
}

function clearForSearch() {
    "use strict";
    var index = 0, index2 = 0;

    for (index = 0; index < 14 * BRD_SQ_NUM; ++index) {
        GameBoard.searchHistory[index] = 0;
    }

    for (index = 0; index < 3 * MAXDEPTH; ++index) {
        GameBoard.searchKillers[index] = 0;
    }

    clearPvTable();
    GameBoard.ply = 0;
    SearchController.nodes = 0;
    SearchController.fh = 0;
    SearchController.fhf = 0;
    SearchController.start = $.now();
    SearchController.stop = BOOL.FALSE;
}

function searchPosition() {
    "use strict";
    var bestMove = NOMOVE, bestScore = -INFINITE, currentDepth = 0, line, PvNum, c;
    
    clearForSearch();

    for (currentDepth = 1; currentDepth <= /*SearchController.depth*/ 6; ++currentDepth) {

        bestScore = alphaBeta(-INFINITE, INFINITE, currentDepth);

        if (SearchController.stop === BOOL.TRUE) {
            break;
        }

        bestMove = probePvTable();
        line = 'D:' + currentDepth + ' Best:' + prMove(bestMove) + ' Score:' + bestScore +
            ' nodes:' + SearchController.nodes;

        PvNum = getPvLine(currentDepth);
        line += ' Pv:';
        for (c = 0; c < PvNum; ++c) {
            line += ' ' + prMove(GameBoard.pvArray[c]);
        }
        if (currentDepth !== 1) {
            line += (" Ordering:" + ((SearchController.fhf / SearchController.fh) * 100).toFixed(2) + "%");
        }
        console.log(line);

    }

    SearchController.best = bestMove;
    SearchController.thinking = BOOL.FALSE;

}