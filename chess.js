

import {Board,Bot} from "./board.js";
import * as pieces from "./pieces.js";
import {Button,PromotionMenu} from "./gui.js";

function hello(num) {
    console.log(num);
}

function readFormData() {
    let text=document.getElementById("notationText").value;
    board.convertMovementNotationToMoves(text);
}
let count=1;
function update() {
    ctx.clearRect(0,0,ctx.width,ctx.height);
    board.update();
    if (p!=undefined) {
        p.update();
    }

    requestAnimationFrame(update);
    width=canvas.width;
    height=canvas.height;

}

export function getCursorPosRelToCanvas() {
    let dims=canvas.getBoundingClientRect();

    let pixelSzX=dims.width/canvas.width;
    let pixelSzY=dims.height/canvas.height;

    let posx=(cursorX-dims.x)/pixelSzX;
    let posy=(cursorY-dims.y)/pixelSzY;
    return new pieces.Vector(posx,posy);
}

    /** @type {ImageBitmap} */

/** @type {HTMLCanvasElement} */
export var canvas=document.getElementById("main");
/** @type {CanvasRenderingContext2D} */
var ctx=canvas.getContext("2d");
export var moveAudio=new Audio("move.mp3");
export var width=canvas.width;
export var height=canvas.height;
export var cursorX=0;
export var cursorY=0;
export var mouseIsClicked=false;


document.addEventListener("mousedown",function(event) {
    mouseIsClicked=true;
});

document.addEventListener("mouseup",function (event){
    mouseIsClicked=false;
});

document.addEventListener("touchstart",function(event) {
    mouseIsClicked=true;
});

document.addEventListener("touchend",function (event){
    mouseIsClicked=false;
});

document.getElementById("submitbutton").addEventListener("click",readFormData);



document.addEventListener("mousemove", function(event) {
    cursorX=event.x;
    cursorY=event.y;
})

export var p=undefined;
var board=new Board(width,height,ctx);
board.loadStandardGame();
board.addBotPlayer(false);
let piece=board.tiles[0][6];
let dims={w:canvas.width/board.tilesXCount,h:canvas.height/board.tilesYCount*3};
//et value=board.getBoardFENNotation();
//console.log(board.convertMovementNotationToMoves("e2e4"));
board.loadPosFromFENNotation("rnbqkbnr/1ppppppp/8/8/2P5/2R5/pPPPPPPP/1NBQKBNR b Kkq - 0 1");


 update();