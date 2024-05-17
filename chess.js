

import {Board,Bot} from "./board.js";
import * as pieces from "./pieces.js";

function readFormData() {
    let text=document.getElementById("notationText").value;
    board.convertMovementNotationToMoves(text);
}
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
export var moveAudio=new Audio("move.mp3");
export var width=canvas.width;
export var height=canvas.height;
export var cursorX=0;
export var cursorY=0;
export var mouseIsClicked=false;
document.addEventListener("mousedown",function(event) {
    mouseIsClicked=true;
});

document.getElementById("submitbutton").addEventListener("click",readFormData);

document.addEventListener("mouseup",function (event){
    mouseIsClicked=false;
})

document.addEventListener("mousemove", function(event) {
    cursorX=event.x;
    cursorY=event.y;
})


var board=new Board(width,height,ctx);
//board.loadStandardGame();
board.addBotPlayer(true);
//et value=board.getBoardFENNotation();
//console.log(board.convertMovementNotationToMoves("e2e4"));
board.loadPosFromFENNotation("6kr/8/qqqqq3/qqqqq3/QQQQQ3/QQQQQ3/QQQqq3/4QK3 w - - 0 1");


 update();