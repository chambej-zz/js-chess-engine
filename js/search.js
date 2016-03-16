/*jslint plusplus: true */
/*jslint bitwise: true */
/*jslint continue: true */
/*global BOOL, NOMOVE, INFINITE, GameBoard, MAXDEPTH, generateMoves, makeMove, takeMove, $, evalPosition, storePvMove, sqAttacked, PCEINDEX, Kings, MATE, BRD_SQ_NUM, PVENTRIES, probePvTable, prMove, console, getPvLine, generateCaptures, MFLAGCAP, FROMSQ, TOSQ */
var SearchController = {};

SearchController.nodes;
SearchController.fh; // fail high
SearchController.fhf; // fail high first
SearchController.depth;
SearchController.time;
SearchController.start;
SearchController.stop;
SearchController.best;
SearchController.thinking;

function pickNextMove(moveNum) {
    "use strict";
    var index, bestScore = -1, bestNum = moveNum, temp = 0;
    
    for (index = moveNum; index < GameBoard.moveListStart[GameBoard.ply + 1]; ++index) {
        if (GameBoard.moveScores[index] > bestScore) {
            bestScore = GameBoard.moveScores[index];
            bestNum = index;
        }
        
        if (bestNum !== moveNum) {
            temp = GameBoard.moveScores[moveNum];
            GameBoard.moveScores[moveNum] = GameBoard.moveScores[bestNum];
            GameBoard.moveScores[bestNum] = temp;
            
            temp = GameBoard.moveList[moveNum];
            GameBoard.moveList[moveNum] = GameBoard.moveList[bestNum];
            GameBoard.moveList[bestNum] = temp;
        }
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
        SearchController.stop == BOOL.TRUE;
    }
}


function isRepetition() {
    "use strict";
    var index;
    
    for (index = GameBoard.hisPly - GameBoard.fiftyMove; index < GameBoard.hisPly - 1; ++index) {
        if (GameBoard.posKey === GameBoard.history[index].posKey) {
            return BOOL.TRUE;
        }
    }
    
    return BOOL.FALSE;
}

function quiesence(alpha, beta) {
    "use strict";
    
    /* Check Time Up */
    if ((SearchController.nodes & 2047) === 0) {
        checkUp();
    }
    
    SearchController.nodes++;
    
    /* Check Rep() Fifty Move Rule */
    if ((isRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply !== 0) {
        return 0;
    }
    
    if (GameBoard.ply > MAXDEPTH - 1) {
        /* return Evaluate() */
        return evalPosition();
    }
    
    var score = evalPosition(), moveNum = 0, legal = 0, oldAlpha = alpha, bestMove = NOMOVE, move = NOMOVE;
    
    if (score >= beta) {
        return beta;
    }
    
    if (score > alpha) {
        alpha = score;
    }
    
    generateCaptures();
    
    for (moveNum = GameBoard.moveListStart[GameBoard.ply]; moveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++moveNum) {
    
        /* Pick Next Best Move */
        pickNextMove(moveNum);
        
        move = GameBoard.moveList[moveNum];
        if (makeMove(move) === BOOL.FALSE) {
            continue;
        }
        
        legal++;
        score = -quiesence(-beta, -alpha);
        takeMove();
        
        if (SearchController.stop === BOOL.TRUE) {
            return 0;
        }
        
        if (score > alpha) {
            if (score >= beta) {
                if (legal === 1) {
                    SearchController.fhf++;
                }
                SearchController.fh++;
                return beta;
            }
            alpha = score;
            bestMove = move;
        }
    }
    
    if (alpha !== oldAlpha) {
        /* Store PvMove */
        storePvMove(bestMove);
    }
    
    return alpha;

}

function alphaBeta(alpha, beta, depth) {
    "use strict";
    if (depth <= 0) {
        return quiesence(alpha, beta);
    }
    
    /* Check Time Up */
    if ((SearchController.nodes & 2047) === 0) {
        checkUp();
    }
    
    SearchController.nodes++;
    
    /* Check Rep() Fifty Move Rule */
    if ((isRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply !== 0) {
        return 0;
    }
    
    if (GameBoard.ply > MAXDEPTH - 1) {
        /* return Evaluate() */
        return evalPosition();
    }
    
    /* Check if in check */
    var inCheck = sqAttacked(GameBoard.pList[PCEINDEX(Kings[GameBoard.side], 0)], GameBoard.side ^ 1), score = -INFINITE, moveNum = 0, legal = 0, oldAlpha = alpha, bestMove = NOMOVE, Move = NOMOVE;
    if (inCheck === BOOL.TRUE) {
        depth++;
    }
     
    generateMoves();
    
    /* Get PvMove */
    /* Order PvMove */
    var pvMove = probePvTable();
    if (pvMove !== NOMOVE) {
        for (moveNum = GameBoard.moveListStart[GameBoard.ply]; moveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++moveNum) {
            if (GameBoard.moveList[moveNum] === pvMove) {
                GameBoard.moveScores[moveNum] = 2000000;
                break;
            }
        }
    }
    
    for (moveNum = GameBoard.moveListStart[GameBoard.ply]; moveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++moveNum) {
    
        /* Pick Next Best Move */
        pickNextMove(moveNum);
        
        Move = GameBoard.moveList[moveNum];
        if (makeMove(Move) === BOOL.FALSE) {
            continue;
        }
        
        legal++;
        score = -alphaBeta(-beta, -alpha, depth - 1);
        takeMove();
        
        if (SearchController.stop === BOOL.TRUE) {
            return 0;
        }

        console.log('Score: ' + score + ' Alpha: ' + alpha + ' Beta: ' + beta);
        if (score > alpha) {
            if (score >= beta) {
                if (legal === 1) {
                    SearchController.fhf++;
                }
                SearchController.fh++;
                
                /* Update Killer Moves */
                if ((Move & MFLAGCAP) === 0) {
                    GameBoard.searchKillers[MAXDEPTH + GameBoard.ply] = GameBoard.searchKillers[GameBoard.ply];
                    GameBoard.searchKillers[GameBoard.ply] = Move;
                }
                
                return beta;
            }
            
            if ((Move  & MFLAGCAP) === 0) {
                GameBoard.searchHistory[GameBoard.pieces[FROMSQ(Move)] * BRD_SQ_NUM + TOSQ(Move)] += depth * depth;
            }
            
            alpha = score;
            bestMove = Move;
        }
    }
    
    /* Mate Check */
    if (legal === 0) {
        if (inCheck === BOOL.TRUE) {
            return -MATE + GameBoard.ply;
        } else {
            return 0;
        }
    }
    
    if (alpha !== oldAlpha) {
        /* Store PvMove */
        storePvMove(bestMove);
    }
    
    return alpha;
}

function clearForSearch() {
    "use strict";
    var index = 0;
    
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
    var bestMove = NOMOVE, bestScore = -INFINITE, currentDepth = 0, line, pvNum, c;
    clearForSearch();
    
    for (currentDepth = 1; currentDepth <= /*SearchController.depth*/ 1; ++currentDepth) {
    
        /*AB*/
        bestScore = alphaBeta(-INFINITE, INFINITE, currentDepth);
        
        if (SearchController.stop === BOOL.TRUE) {
            break;
        }
        
        bestMove = probePvTable();
        line = 'D:' + currentDepth + ' Best:' + prMove(bestMove) + ' Score:' + bestScore +
            ' Nodes:' + SearchController.nodes;
        pvNum = getPvLine(currentDepth);
        line += ' Pv:';
        for (c = 0; c < pvNum; ++c) {
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


