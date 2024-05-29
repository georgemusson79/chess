

import {Board,Bot} from "./board.js";
import * as pieces from "./pieces.js";
import {Button,PromotionMenu} from "./gui.js";

window.restartGame=function() {
    board.addBotPlayer(!board.playerIsBlack);
    board.loadStandardGame();
    let element=document.getElementById("gameOverScr");
    if (element) element.remove();

}

export function createGameOverScreen(isStalemate,blackWin) {
    let elem=document.createElement("div");
    elem.setAttribute("class","gameOverBox");
    elem.setAttribute("id","gameOverScr");

    let cause=(isStalemate) ? "Stalemate" : "Checkmate";
    let winner="White";
    if (isStalemate) winner="Draw";
    if (blackWin) winner="Black";

    elem.innerHTML=`<p class="gameOverText">Game Over!</p>
    <div style="background-color: rgb(50,50,50); width: 50%; text-align: center; left:50%;transform:translate(50%); border-radius: 5px; border-color: #000000; border: 2px solid;">
        <h2 id="cause" class="gameOverh3" style="text-decoration: underline;">By ${cause}</h3>
        <h3 id="winner"class="gameOverh3">${winner} Wins</h3>
    </div>
    <br>
    <button id="button1" class="buttons" onclick="restartGame()">Rematch</button>
    <button id="button2" class="buttons" onclick="restartGame()">New Game</button>`
    document.body.appendChild(elem);
}

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
board.addBotPlayer(true);
let piece=board.tiles[0][6];
let dims={w:canvas.width/board.tilesXCount,h:canvas.height/board.tilesYCount*3};
//et value=board.getBoardFENNotation();
//console.log(board.convertMovementNotationToMoves("e2e4"));
board.loadPosFromFENNotation("rn2k3/6Q1/2N4R/8/8/8/PPPPPPPP/RNB1KB2 w Qq - 0 1");
//createGameOverScreen();

 update();