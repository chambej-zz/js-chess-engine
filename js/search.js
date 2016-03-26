/*jslint plusplus: true */
/*jslint bitwise: true */
/*jslint continue: true */
/*global BOOL, NOMOVE, INFINITE, GameBoardController, MAXDEPTH, generateMoves, makeMove, takeMove, $, evalPosition, storePvMove, sqAttacked, PCEINDEX, Kings, MATE, BRD_SQ_NUM, PVENTRIES, probePvTable, prMove, console, getPvLine, generateCaptures, MFLAGCAP, FROMSQ, TOSQ, updateDOMStats */
var SearchController = {};

SearchController.nodes = 0;
SearchController.fh = 0;
SearchController.fhf = 0;
SearchController.depth = MAXDEPTH;
SearchController.time = 0;
SearchController.start = 0;
SearchController.stop = 0;
SearchController.best = 0;
SearchController.thinking = BOOL.FALSE;

SearchController.pickNextMove = function (MoveNum) {
    "use strict";
    var index, bestScore = -1, bestNum = MoveNum, temp;

    for (index = MoveNum; index < GameBoardController.moveListStart[GameBoardController.ply + 1]; ++index) {
        if (GameBoardController.moveScores[index] > bestScore) {
            bestScore = GameBoardController.moveScores[index];
            bestNum = index;
        }
    }

    if (bestNum !== MoveNum) {
        temp = 0;
        temp = GameBoardController.moveScores[MoveNum];
        GameBoardController.moveScores[MoveNum] = GameBoardController.moveScores[bestNum];
        GameBoardController.moveScores[bestNum] = temp;

        temp = GameBoardController.moveList[MoveNum];
        GameBoardController.moveList[MoveNum] = GameBoardController.moveList[bestNum];
        GameBoardController.moveList[bestNum] = temp;
    }
};

SearchController.clearPvTable = function () {
    "use strict";
    var index;

    for (index = 0; index < PVENTRIES; index++) {
        GameBoardController.pvTable[index].move = NOMOVE;
        GameBoardController.pvTable[index].posKey = 0;
    }
};

SearchController.checkUp = function () {
    "use strict";
    if (($.now() - SearchController.start) > SearchController.time) {
        SearchController.stop = BOOL.TRUE;
    }
};


SearchController.isRepetition = function () {
    "use strict";
    var index;

    for (index = GameBoardController.hisPly - GameBoardController.fiftyMove; index < GameBoardController.hisPly - 1; ++index) {
        if (GameBoardController.posKey === GameBoardController.history[index].posKey) {
            return BOOL.TRUE;
        }
    }

    return BOOL.FALSE;
};

SearchController.quiescence = function (alpha, beta) {
    "use strict";
    if ((SearchController.nodes & 2047) === 0) {
        SearchController.checkUp();
    }

    SearchController.nodes++;

    if ((SearchController.isRepetition() || GameBoardController.fiftyMove >= 100) && GameBoardController.ply !== 0) {
        return 0;
    }

    if (GameBoardController.ply > MAXDEPTH - 1) {
        return EvaluationControler.evalPosition();
    }

    var Score = EvaluationControler.evalPosition(), MoveNum, Legal = 0, OldAlpha, BestMove = NOMOVE, Move = NOMOVE;

    if (Score >= beta) {
        return beta;
    }

    if (Score > alpha) {
        alpha = Score;
    }

    MoveGenController.generateCaptures();

    OldAlpha = alpha;
    
    for (MoveNum = GameBoardController.moveListStart[GameBoardController.ply]; MoveNum < GameBoardController.moveListStart[GameBoardController.ply + 1]; ++MoveNum) {

        SearchController.pickNextMove(MoveNum);

        Move = GameBoardController.moveList[MoveNum];

        if (MakeMoveController.makeMove(Move) === BOOL.FALSE) {
            continue;
        }
        Legal++;
        Score = -SearchController.quiescence(-beta, -alpha);

        MakeMoveController.takeMove();

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
        PvTableController.storePvMove(BestMove);
    }

    return alpha;

};

SearchController.alphaBeta = function (alpha, beta, depth) {
    "use strict";

    if (depth <= 0) {
        return SearchController.quiescence(alpha, beta);
    }

    if ((SearchController.nodes & 2047) === 0) {
        SearchController.checkUp();
    }

    SearchController.nodes++;

    if ((SearchController.isRepetition() || GameBoardController.fiftyMove >= 100) && GameBoardController.ply !== 0) {
        return 0;
    }

    if (GameBoardController.ply > MAXDEPTH - 1) {
        return EvaluationControler.evalPosition();
    }

    var InCheck = GameBoardController.sqAttacked(GameBoardController.pList[PCEINDEX(Kings[GameBoardController.side], 0)], GameBoardController.side ^ 1), Score = -INFINITE, MoveNum = 0, Legal = 0, OldAlpha = alpha, BestMove = NOMOVE, Move = NOMOVE, PvMove = PvTableController.probePvTable();
    if (InCheck === BOOL.TRUE) {
        depth++;
    }

    MoveGenController.generateMoves();

    OldAlpha = alpha;
    if (PvMove !== NOMOVE) {
        for (MoveNum = GameBoardController.moveListStart[GameBoardController.ply]; MoveNum < GameBoardController.moveListStart[GameBoardController.ply + 1]; ++MoveNum) {
            if (GameBoardController.moveList[MoveNum] === PvMove) {
                GameBoardController.moveScores[MoveNum] = 2000000;
                break;
            }
        }
    }

    for (MoveNum = GameBoardController.moveListStart[GameBoardController.ply]; MoveNum < GameBoardController.moveListStart[GameBoardController.ply + 1]; ++MoveNum) {

        SearchController.pickNextMove(MoveNum);

        Move = GameBoardController.moveList[MoveNum];

        if (MakeMoveController.makeMove(Move) === BOOL.FALSE) {
            continue;
        }
        Legal++;
        Score = -SearchController.alphaBeta(-beta, -alpha, depth - 1);

        MakeMoveController.takeMove();

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
                    GameBoardController.searchKillers[MAXDEPTH + GameBoardController.ply] =
                        GameBoardController.searchKillers[GameBoardController.ply];
                    GameBoardController.searchKillers[GameBoardController.ply] = Move;
                }
                return beta;
            }
            if ((Move & MFLAGCAP) === 0) {
                GameBoardController.searchHistory[GameBoardController.pieces[FROMSQ(Move)] * BRD_SQ_NUM + TOSQ(Move)]
                    += depth * depth;
            }
            alpha = Score;
            BestMove = Move;
        }
    }

    if (Legal === 0) {
        if (InCheck === BOOL.TRUE) {
            return -MATE + GameBoardController.ply;
        } else {
            return 0;
        }
    }

    if (alpha !== OldAlpha) {
        PvTableController.storePvMove(BestMove);
    }

    return alpha;
};

SearchController.clearForSearch = function () {
    "use strict";
    var index;

    for (index = 0; index < 14 * BRD_SQ_NUM; ++index) {
        GameBoardController.searchHistory[index] = 0;
    }

    for (index = 0; index < 3 * MAXDEPTH; ++index) {
        GameBoardController.searchKillers[index] = 0;
    }

    SearchController.clearPvTable();
    GameBoardController.ply = 0;
    SearchController.nodes = 0;
    SearchController.fh = 0;
    SearchController.fhf = 0;
    SearchController.start = $.now();
    SearchController.stop = BOOL.FALSE;
};

SearchController.searchPosition = function () {
    "use strict";
    var bestMove = NOMOVE, bestScore = -INFINITE, currentDepth, line, PvNum, c, score;
    
    SearchController.clearForSearch();

    for (currentDepth = 1; currentDepth <= SearchController.depth; ++currentDepth) {

        score = SearchController.alphaBeta(-INFINITE, INFINITE, currentDepth);

        if (SearchController.stop === BOOL.TRUE) {
            break;
        }

        bestScore = score;
        bestMove = PvTableController.probePvTable();
        line = 'D:' + currentDepth + ' Best:' + IoController.prMove(bestMove) + ' Score:' + bestScore +
            ' nodes:' + SearchController.nodes;

        PvNum = PvTableController.getPvLine(currentDepth);
        line += ' Pv:';
        for (c = 0; c < PvNum; ++c) {
            line += ' ' + IoController.prMove(GameBoardController.pvArray[c]);
        }
        if (currentDepth !== 1) {
            line += (" Ordering:" + ((SearchController.fhf / SearchController.fh) * 100).toFixed(2) + "%");
        }
        console.log(line);

    }

    SearchController.best = bestMove;
    SearchController.thinking = BOOL.FALSE;
    SearchController.updateDOMStats(bestScore, currentDepth);

};

SearchController.updateDOMStats = function (dom_score, dom_depth) {
    "use strict";
    var scoreText = "Score: " + (dom_score / 100).toFixed(2);
    if (Math.abs(dom_score) > MATE - MAXDEPTH) {
        scoreText = "Score: Mate In " + (MATE - (Math.abs(dom_score)) - 1) + " moves";
    }
    
    $("#OrderingOut").text("Ordering:" + ((SearchController.fhf / SearchController.fh) * 100).toFixed(2) + "%");
    $("#DepthOut").text("Depth: " + dom_depth);
    $("#ScoreOut").text(scoreText);
    $("#NodesOut").text("Nodes: " + SearchController.nodes);
    $("#TimeOut").text("Time: " + (($.now() - SearchController.start) / 1000).toFixed(1) + "s");
    $("#BestOut").text("BestMove: " + IoController.prMove(SearchController.best));
    
};