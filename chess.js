

import {Board} from "./board.js";
import * as pieces from "./pieces.js";


let count=1;
var clickPos={x: 0, y: 0};
function update() {
    ctx.clearRect(0,0,ctx.width,ctx.height);
    board.render();
    document.getElementById("bruh").textContent=clickPos.x+" "+clickPos.y;
    document.addEventListener("click",function(event) {
        clickPos.x=event.clientX
        clickPos.y=event.clientY
    })

    requestAnimationFrame(update);

}


    /** @type {ImageBitmap} */


var canvas=document.getElementById("main");
/** @type {CanvasRenderingContext2D} */
var ctx=canvas.getContext("2d");
var width=canvas.width;
var height=canvas.height;
var board=new Board(width,height,ctx);
let p=board.addPiece(pieces.Bishop,3,5,0,0,true);
p.isSelected=false;
board.addPiece(pieces.Knight,5,4,0,0,true);


 update();