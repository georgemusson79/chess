

import {Board} from "./board.js";
import * as pieces from "./pieces.js";


let count=1;
function update() {
    ctx.clearRect(0,0,ctx.width,ctx.height);
    board.update();
    requestAnimationFrame(update);
    width=canvas.width;
    height=canvas.height;

}


    /** @type {ImageBitmap} */

/** @type {HTMLCanvasElement} */
export var canvas=document.getElementById("main");
/** @type {CanvasRenderingContext2D} */
var ctx=canvas.getContext("2d");
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
})

document.addEventListener("mousemove", function(event) {
    cursorX=event.x;
    cursorY=event.y;
})


var board=new Board(width,height,ctx);
let p=board.addPiece(pieces.Bishop,3,5,0,0,true);
p.isSelected=false;
board.addPiece(pieces.Pawn,1,0,1,0,true);
board.addPiece(pieces.Pawn,0,3,0,3,false);
board.addPiece(pieces.Rook,7,7,0,0,false);


 update();