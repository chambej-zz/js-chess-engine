/*jslint bitwise: true */
/*global GameBoardController */
var PIECES =  { EMPTY : 0, wP : 1, wN : 2, wB : 3, wR : 4, wQ : 5, wK : 6, bP : 7, bN : 8, bB : 9, bR : 10, bQ : 11, bK : 12  };
              
var BRD_SQ_NUM = 120;

var FILES =  { FILE_A : 0, FILE_B : 1, FILE_C : 2, FILE_D : 3, FILE_E : 4, FILE_F : 5, FILE_G : 6, FILE_H : 7, FILE_NONE : 8 };
	
var RANKS =  { RANK_1 : 0, RANK_2 : 1, RANK_3 : 2, RANK_4 : 3, RANK_5 : 4, RANK_6 : 5, RANK_7 : 6, RANK_8 : 7, RANK_NONE : 8 };
	
var COLOURS = { WHITE : 0, BLACK : 1, BOTH : 2 };

var CASTLEBIT = { WKCA : 1, WQCA : 2, BKCA : 4, BQCA : 8 };

var SQUARES = {A1 : 21, B1 : 22, C1 : 23, D1 : 24, E1 : 25, F1 : 26, G1 : 27, H1 : 28, A8 : 91, B8 : 92, C8 : 93, D8 : 94, E8 : 95, F8 : 96, G8 : 97, H8 : 98, NO_SQ : 99, OFFBOARD : 100};

var BOOL = { FALSE : 0, TRUE : 1 };

var MAXGAMEMOVES = 2048;
var MAXPOSITIONMOVES = 256;
var MAXDEPTH = 64;
var INFINITE = 30000;
var MATE = 29000;
var PVENTRIES = 10000;

var FilesBrd = [BRD_SQ_NUM];
var RanksBrd = [BRD_SQ_NUM];

var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

var PceChar = ".PNBRQKpnbrqk";
var SideChar = "wb-";
var RankChar = "12345678";
var FileChar = "abcdefgh";


function FR2SQ(f, r) {
    "use strict";
    return ((21 + (f)) + ((r) * 10));
}

var PieceBig = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
var PieceMaj = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
var PieceMin = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
var PieceVal = [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000  ];
var PieceCol = [ COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK ];
	
var PiecePawn = [ BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
var PieceKnight = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
var PieceKing = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE ];
var PieceRookQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];
var PieceBishopQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE ];
var PieceSlides = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];

var KnDir = [ -8, -19, -21, -12, 8, 19, 21, 12 ];
var RkDir = [ -1, -10, 1, 10 ];
var BiDir = [ -9, -11, 11, 9 ];
var KiDir = [ -1, -10, 1, 10, -9, -11, 11, 9 ];

var DirNum = [ 0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8 ];
var PceDir = [ 0, 0, KnDir, BiDir, RkDir, KiDir, KiDir, 0, KnDir, BiDir, RkDir, KiDir, KiDir ];
var LoopNonSlidePce = [ PIECES.wN, PIECES.wK, 0, PIECES.bN, PIECES.bK, 0 ];
var LoopNonSlideIndex = [ 0, 3 ];
var LoopSlidePiece = [ PIECES.wB, PIECES.wR, PIECES.wQ, 0, PIECES.bB, PIECES.bR, PIECES.bQ, 0 ];
var LoopSlidePieceIndex = [ 0, 4 ];

var PieceKeys = [14 * 120];
var SideKey;
var CastleKeys = [16];

var Sq120ToSq64 = [BRD_SQ_NUM];
var Sq64ToSq120 = [64];

/**
 * @return {number}
 */
function RAND_32() {
    "use strict";
	return (Math.floor((Math.random() * 255) + 1) << 23) | (Math.floor((Math.random() * 255) + 1) << 16)
		 | (Math.floor((Math.random() * 255) + 1) << 8) | Math.floor((Math.random() * 255) + 1);

}

var Mirror64 = [
    56,	57,	58,	59,	60,	61,	62,	63,
    48,	49,	50,	51,	52,	53,	54,	55,
    40,	41,	42,	43,	44,	45,	46,	47,
    32,	33,	34,	35,	36,	37,	38,	39,
    24,	25,	26,	27,	28,	29,	30,	31,
    16,	17,	18,	19,	20,	21,	22,	23,
    8, 9, 10, 11, 12, 13, 14, 15,
    0, 1, 2, 3,	4, 5, 6, 7
];

function SQ64(sq120) {
    "use strict";
    return Sq120ToSq64[(sq120)];
}

function SQ120(sq64) {
    "use strict";
    return Sq64ToSq120[(sq64)];
}

function PCEINDEX(pce, pceNum) {
    "use strict";
    return (pce * 10 + pceNum);
}

function MIRROR64(sq) {
    "use strict";
	return Mirror64[sq];
}

var Kings = [PIECES.wK, PIECES.bK];
var CastlePerm = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15,  7, 15, 15, 15,  3, 15, 15, 11, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15
];

function FROMSQ(m) {
    "use strict";
    return (m & 0x7F);
}

function TOSQ(m) {
    "use strict";
    return ((m >> 7) & 0x7F);
}

function CAPTURED(m) {
    "use strict";
    return ((m >> 14) & 0xF);
}

function PROMOTED(m) {
    "use strict";
    return ((m >> 20) & 0xF);
}

var MFLAGEP = 0x40000;
var MFLAGPS = 0x80000;
var MFLAGCA = 0x1000000;
var MFLAGCAP = 0x7C000;
var MFLAGPROM = 0xF00000;

var NOMOVE = 0;

function SQOFFBOARD(sq) {
    "use strict";
    if (FilesBrd[sq] === SQUARES.OFFBOARD) {
        return BOOL.TRUE;
    }
    return BOOL.FALSE;
}

function HASH_PCE(pce, sq) {
    "use strict";
    GameBoardController.posKey ^= PieceKeys[(pce * 120) + sq];
}

function HASH_CA() {
    "use strict";
    GameBoardController.posKey ^= CastleKeys[GameBoardController.castlePerm];
}

function HASH_SIDE() {
    "use strict";
    GameBoardController.posKey ^= SideKey;
}

function HASH_EP() {
    "use strict";
    GameBoardController.posKey ^= PieceKeys[GameBoardController.enPas];
}

var GameController = {};
GameController.EngineSide = COLOURS.BOTH;
GameController.PlayerSide = COLOURS.BOTH;
GameController.GameOver = BOOL.FALSE;

var UserMove = {};
UserMove.from = SQUARES.NO_SQ;
UserMove.to = SQUARES.NO_SQ;

function PCEINDEX(pce, pceNum) {
    "use strict";
    return (pce * 10 + pceNum);
}








