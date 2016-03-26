/*jslint bitwise: true */
/*jslint plusplus: true */
/*jslint continue: true */
/*global BRD_SQ_NUM, COLOURS, PIECES, SQUARES, PieceKeys, SideKey, CastleKeys, MAXDEPTH, MAXPOSITIONMOVES, SQ120, RANKS, FILES, console, FR2SQ, CASTLEBIT, RankChar, PceChar, FileChar, SideChar, PieceCol, PieceVal, prSq, BOOL, sqAttacked, KnDir, PieceKnight, RkDir, PieceRookQueen, BiDir, PieceBishopQueen, KiDir, PieceKing, generatePosKey */

var GameBoardController = {};

GameBoardController.pieces = [BRD_SQ_NUM];
GameBoardController.side = COLOURS.WHITE;
GameBoardController.fiftyMove = 0;
GameBoardController.hisPly = 0;
GameBoardController.history = [];
GameBoardController.ply = 0;
GameBoardController.enPas = 0;
GameBoardController.castlePerm = 0;
GameBoardController.material = [2]; // WHITE,BLACK material of pieces
GameBoardController.pceNum = [13]; // Indexed by Piece
GameBoardController.pList = [14 * 10];
GameBoardController.posKey = 0;

GameBoardController.moveList = [MAXDEPTH * MAXPOSITIONMOVES];
GameBoardController.moveScores = [MAXDEPTH * MAXPOSITIONMOVES];
GameBoardController.moveListStart = [MAXDEPTH];
GameBoardController.pvTable = [];
GameBoardController.pvArray = [MAXDEPTH];
GameBoardController.searchHistory = [14 * BRD_SQ_NUM];
GameBoardController.searchKillers = [3 * MAXDEPTH];


GameBoardController.checkBoard = function () {
    "use strict";
    var t_pceNum, t_material, sq64, t_piece, t_pce_num, sq120;
    
    t_pceNum = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    t_material = [ 0, 0 ];
    
    for (t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
        for (t_pce_num = 0; t_pce_num < GameBoardController.pceNum[t_piece]; ++t_pce_num) {
            sq120 = GameBoardController.pList[PCEINDEX(t_piece, t_pce_num)];
            if (GameBoardController.pieces[sq120] !== t_piece) {
                console.log('Error Pce Lists');
                return BOOL.FALSE;
            }
        }
    }
    
    for (sq64 = 0; sq64 < 64; ++sq64) {
        sq120 = SQ120(sq64);
        t_piece = GameBoardController.pieces[sq120];
        t_pceNum[t_piece]++;
        t_material[PieceCol[t_piece]] += PieceVal[t_piece];
    }
    
    for (t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
        if (t_pceNum[t_piece] !== GameBoardController.pceNum[t_piece]) {
            console.log('Error t_pceNum');
            return BOOL.FALSE;
        }
    }
    
    if (t_material[COLOURS.WHITE] !== GameBoardController.material[COLOURS.WHITE] ||
            t_material[COLOURS.BLACK] !== GameBoardController.material[COLOURS.BLACK]) {
        console.log('Error t_material');
        return BOOL.FALSE;
    }
    
    if (GameBoardController.side !== COLOURS.WHITE && GameBoardController.side !== COLOURS.BLACK) {
        console.log('Error GameBoardController.side');
        return BOOL.FALSE;
    }
    
    if (getElementsByClassName.generatePosKey() !== GameBoardController.posKey) {
        console.log('Error GameBoardController.posKey');
    }
    
    return BOOL.TRUE;
};

GameBoardController.printBoard = function () {
    
    "use strict";
    var sq, file, rank, piece, line;
    
    console.log("\nGame Board:\n");
    for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
        line = (RankChar[rank] + "  ");
        for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file, rank);
            piece = GameBoardController.pieces[sq];
            line += (" " + PceChar[piece] + " ");
        }
        console.log(line);
    }
    
    console.log("");
    line = "   ";
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
        line += (' ' + FileChar[file] + ' ');
    }
    
    console.log(line);
    console.log("side:" + SideChar[GameBoardController.side]);
    console.log("enPas:" + GameBoardController.enPas);
    line = "";
    
    if (GameBoardController.castlePerm & CASTLEBIT.WKCA) {
        line += 'K';
    }
    if (GameBoardController.castlePerm & CASTLEBIT.WQCA) {
        line += 'Q';
    }
    if (GameBoardController.castlePerm & CASTLEBIT.BKCA) {
        line += 'k';
    }
    if (GameBoardController.castlePerm & CASTLEBIT.BQCA) {
        line += 'q';
    }
    console.log("castle:" + line);
    console.log("key:" + GameBoardController.posKey.toString(16));
    
    
};

GameBoardController.printPieceList = function () {
    "use strict";
    var piece, pceNum;
    
    for (piece = PIECES.wP; piece <= PIECES.bK; ++piece) {
        for (pceNum = 0; pceNum < GameBoardController.pceNum[piece]; ++pceNum) {
            console.log('Piece ' + PceChar[piece] + ' on ' + IoController.prSq(GameBoardController.pList[PCEINDEX(piece, pceNum)]));
        }
    }
};

GameBoardController.generatePosKey = function () {
    "use strict";
    
    var sq, finalKey = 0, piece = PIECES.EMPTY;
    
    for (sq = 0; sq < BRD_SQ_NUM; ++sq) {
        piece = GameBoardController.pieces[sq];
        if (piece !== PIECES.EMPTY && piece !== SQUARES.OFFBOARD) {
            finalKey ^= PieceKeys[(piece * 120) + sq];
        }
    }
    
    if (GameBoardController.side === COLOURS.WHITE) {
        finalKey ^= SideKey;
    }
    
    if (GameBoardController.enPas !== SQUARES.NO_SQ) {
        finalKey ^= PieceKeys[GameBoardController.enPas];
    }
    
    finalKey ^= CastleKeys[GameBoardController.castlePerm];
    
    return finalKey;
    
};

GameBoardController.updateListsMaterial = function () {
    "use strict";
    var piece, sq, index, colour;
    
    for (index = 0; index < 14 * 120; ++index) {
        GameBoardController.pList[index] = PIECES.EMPTY;
    }
    
    for (index = 0; index < 2; ++index) {
        GameBoardController.material[index] = 0;
    }
    
    for (index = 0; index < 13; ++index) {
        GameBoardController.pceNum[index] = 0;
    }
    
    for (index = 0; index < 64; ++index) {
        sq = SQ120(index);
        piece = GameBoardController.pieces[sq];
        if (piece !== PIECES.EMPTY) {
            colour = PieceCol[piece];
            
            GameBoardController.material[colour] += PieceVal[piece];
            
            GameBoardController.pList[PCEINDEX(piece, GameBoardController.pceNum[piece])] = sq;
            GameBoardController.pceNum[piece]++;
        }
    }
};

GameBoardController.resetBoard = function () {
    "use strict";
    var index;
    
    for (index = 0; index < BRD_SQ_NUM; ++index) {
        GameBoardController.pieces[index] = SQUARES.OFFBOARD;
    }
    
    for (index = 0; index < 64; ++index) {
        GameBoardController.pieces[SQ120(index)] = PIECES.EMPTY;
    }
    
    GameBoardController.side = COLOURS.BOTH;
    GameBoardController.enPas = SQUARES.NO_SQ;
    GameBoardController.fiftyMove = 0;
    GameBoardController.ply = 0;
    GameBoardController.hisPly = 0;
    GameBoardController.castlePerm = 0;
    GameBoardController.posKey = 0;
    GameBoardController.moveListStart[GameBoardController.ply] = 0;
    
};

GameBoardController.parseFen = function (fen) {
    "use strict";
    GameBoardController.resetBoard();
    
    var rank = RANKS.RANK_8, file = FILES.FILE_A, piece = 0, count = 0, i = 0, sq120 = 0, fenCnt = 0;
    
    while ((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
        count = 1;
        switch (fen[fenCnt]) {
        case 'p':
            piece = PIECES.bP;
            break;
        case 'r':
            piece = PIECES.bR;
            break;
        case 'n':
            piece = PIECES.bN;
            break;
        case 'b':
            piece = PIECES.bB;
            break;
        case 'k':
            piece = PIECES.bK;
            break;
        case 'q':
            piece = PIECES.bQ;
            break;
        case 'P':
            piece = PIECES.wP;
            break;
        case 'R':
            piece = PIECES.wR;
            break;
        case 'N':
            piece = PIECES.wN;
            break;
        case 'B':
            piece = PIECES.wB;
            break;
        case 'K':
            piece = PIECES.wK;
            break;
        case 'Q':
            piece = PIECES.wQ;
            break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
            piece = PIECES.EMPTY;
            count = fen[fenCnt].charCodeAt(0) - '0'.charCodeAt(0);
            break;
        case '/':
        case ' ':
            rank--;
            file = FILES.FILE_A;
            fenCnt++;
            continue;
        default:
            console.log("FEN error");
            return;
        }
        
        for (i = 0; i < count; i++) {
            sq120 = FR2SQ(file, rank);
            GameBoardController.pieces[sq120] = piece;
            file++;
        }
        fenCnt++;
        
    } // while loop end
    
    GameBoardController.side = (fen[fenCnt] === 'w') ? COLOURS.WHITE : COLOURS.BLACK;
    fenCnt += 2;
    
    for (i = 0; i < 4; i++) {
        if (fen[fenCnt] === ' ') {
            break;
        }
        
        switch (fen[fenCnt]) {
        case 'K':
            GameBoardController.castlePerm |= CASTLEBIT.WKCA;
            break;
        case 'Q':
            GameBoardController.castlePerm |= CASTLEBIT.WQCA;
            break;
        case 'k':
            GameBoardController.castlePerm |= CASTLEBIT.BKCA;
            break;
        case 'q':
            GameBoardController.castlePerm |= CASTLEBIT.BQCA;
            break;
        default:
            break;
        }
        fenCnt++;
    }
    fenCnt++;

    if (fen[fenCnt] === '-') {
    } else {
        file = fen[fenCnt].charCodeAt(0) - 'a'.charCodeAt(0);
        rank = fen[fenCnt + 1].charCodeAt(0) - '1'.charCodeAt(0);
        console.log("fen[fenCnt]:" + fen[fenCnt] + " File:" + file + " Rank:" + rank);
        GameBoardController.enPas = FR2SQ(file, rank);
    }

    GameBoardController.posKey = GameBoardController.generatePosKey();
    GameBoardController.updateListsMaterial();
    GameBoardController.sqAttacked(21, 0);
};

GameBoardController.printSqAttacked = function () {
    "use strict";
    var sq, file, rank, piece, line;
    console.log("\nAttacked:\n");
    
    for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
        line = ((rank + 1) + "  ");
        for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file, rank);
            if (GameBoardController.sqAttacked(sq, GameBoardController.side) === BOOL.TRUE) {
                piece = "X";
            } else {
                piece = "-";
            }
            line += (" " + piece + " ");
        }
        console.log(line);
    }
    console.log("");
};

GameBoardController.sqAttacked = function (sq, side) {
    "use strict";
    var pce, t_sq, index, dir;
    
    // Test for an attacking pawn
    if (side === COLOURS.WHITE) {
        if (GameBoardController.pieces[sq - 11] === PIECES.wP || GameBoardController.pieces[sq - 9] === PIECES.wP) {
            return BOOL.TRUE;
        }
    } else {
        if (GameBoardController.pieces[sq + 11] === PIECES.bP || GameBoardController.pieces[sq + 9] === PIECES.bP) {
            return BOOL.TRUE;
        }
    }
    
    // Test for attacking knight
    for (index = 0; index < KnDir.length; index++) {
        pce = GameBoardController.pieces[sq + KnDir[index]];
        if (pce !== SQUARES.OFFBOARD && PieceCol[pce] === side && PieceKnight[pce] === BOOL.TRUE) {
            return BOOL.TRUE;
        }
    }
    
    // Test for an attacking Rook/Queen
    for (index = 0; index < 4; ++index) {
        dir = RkDir[index];
        t_sq = sq + dir;
        pce = GameBoardController.pieces[t_sq];
        while (pce !== SQUARES.OFFBOARD) {
            if (pce !== PIECES.EMPTY) {
                if (PieceRookQueen[pce] === BOOL.TRUE && PieceCol[pce] === side) {
                    return BOOL.TRUE;
                }
                break;
            }
            t_sq += dir;
            pce = GameBoardController.pieces[t_sq];
        }
    }
    
    // Test for an attacking Bishop/Queen
    for (index = 0; index < 4; ++index) {
        dir = BiDir[index];
        t_sq = sq + dir;
        pce = GameBoardController.pieces[t_sq];
        while (pce !== SQUARES.OFFBOARD) {
            if (pce !== PIECES.EMPTY) {
                if (PieceBishopQueen[pce] === BOOL.TRUE && PieceCol[pce] === side) {
                    return BOOL.TRUE;
                }
                break;
            }
            t_sq += dir;
            pce = GameBoardController.pieces[t_sq];
        }
    }
    
    // Test for attacking King
    for (index = 0; index < KiDir.length; index++) {
        pce = GameBoardController.pieces[sq + KiDir[index]];
        if (pce !== SQUARES.OFFBOARD && PieceCol[pce] === side && PieceKing[pce] === BOOL.TRUE) {
            return BOOL.TRUE;
        }
    }
    
    return BOOL.FALSE;
};
            
    
    
    
    
    
    
    
    