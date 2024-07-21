/** @type {HTMLCanvasElement} */
import { Vector } from "./pieces.js";
export var canvas=document.getElementById("main");
/** @type {CanvasRenderingContext2D} */
export var ctx=null;
export var width=null;
export var height=null;
export var cursorX=0;
export var cursorY=0;
export var mouseIsClicked=false;
export var board=false;
export var moveAudio=new Audio("move.mp3");


if (canvas) {
    
    ctx=canvas.getContext("2d");
    width=canvas.width;
    height=canvas.height;
   }
export function getCursorPosRelToCanvas() {
    let dims=canvas.getBoundingClientRect();

    let pixelSzX=dims.width/canvas.width;
    let pixelSzY=dims.height/canvas.height;

    let posx=(cursorX-dims.x)/pixelSzX;
    let posy=(cursorY-dims.y)/pixelSzY;
    return new Vector(posx,posy);
}


window.newGame=function() {
    board.loadStandardGame();
    board.addBotPlayer(true);
}

window.restartGame=function() {
    board.loadStandardGame();
    board.addBotPlayer(!board.playerIsBlack);
    let element=document.getElementById("gameOverScr");
    if (element) element.remove();

}

window.startNewGame=function() {
    let newgame=document.getElementById("new-game-container");
    let plrColorElem=document.getElementById("blackSelector");
    let playerIsBlack=plrColorElem.checked;
    document.getElementById("new-game-container").remove();
    board.playerIsBlack=playerIsBlack;
    window.restartGame();
}



window.generateNewGameScreen= function() {
    let gameOver=document.getElementById("gameOverScr");
    if (gameOver) gameOver.remove();
    let elem=document.createElement("div");
    elem.setAttribute("id","new-game-container");
    elem.setAttribute("class","newGame");
    elem.innerHTML=`
    <div class="gameOverBox newGameBox">
    <p class="gameOverText">New Game</p>
    <p class="lower-text">I play as:</p>
    <form class="lower-text" style="display: flex; justify-content: space-around; gap:10px; background:linear-gradient(to right, black 50%, white 50%); padding-inline: 10px; padding-top: 2px; padding-bottom: 3px; border: solid 1px black; border-radius: 4px;">
        <span style="display:flex;">
            <input id="blackSelector" class="plr-color-selector" type="radio" value="black" name="plrColor">
            <label for="blackSelector">Black</label>
        </span>
        <span style="display:flex;">
            <input checked="true" id="whiteSelector" class="plr-color-selector" type="radio" name="plrColor" value="white">
            <label style="color: black;" for="whiteSelector">White</label>
        </span>
    </form>
    <button id="play-game" onclick="startNewGame()" class="lower-text">Play Game</button>
</div>
    `
    document.body.appendChild(elem);
}

export function createGameOverScreen(isStalemate,blackWin,isResignation=false) {
    let elem=document.createElement("div");
    elem.setAttribute("class","gameOverBox");
    elem.setAttribute("id","gameOverScr");

    let cause=(isStalemate) ? "Stalemate" : "Checkmate";
    if (isResignation) cause="Resignation";
    
    let winner="White Wins";
    if (isStalemate) winner="Draw";
    if (blackWin) winner="Black Wins";

    elem.innerHTML=`<div class="gameOverBox">
    <p class="gameOverText">Game Over!</p>
    <div style="background-color: rgb(50,50,50); width: 50%; text-align: center; left:50%;transform:translate(50%); border-radius: 5px; border-color: #000000; border: 2px solid;">
        <h2 id="cause" class="gameOverh3" style="text-decoration: underline;">By ${cause}</h3>
        <h3 id="winner"class="gameOverh3">${winner}</h3>
    </div>
    <br>
    <!-- <button id="button1" class="buttons">Rematch</button>
    <button id="button2" class="buttons">New Game</button> -->
    <form style="justify-content: center; display: flex;" action="/play-chess.html"><button class="buttons" type="submit">Return to Menu</button></form>
</div>`
    document.body.appendChild(elem);
}


function readFormData() {
    let text=document.getElementById("notationText").value;
    board.convertMovementNotationToMoves(text);
}


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

if (document.getElementById("submitbutton")) document.getElementById("submitbutton").addEventListener("click",readFormData);



document.addEventListener("mousemove", function(event) {
    cursorX=event.x;
    cursorY=event.y;
})

export function setBoard(newBoard) {
    board=newBoard
}
