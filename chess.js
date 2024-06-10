

import {Board,Bot, OnlineBoard} from "./board.js";
import * as pieces from "./pieces.js";
import {Button,PromotionMenu} from "./gui.js";
import {requests} from "./mp_requests.js"

/** @param {Object} */
export async function mp_makeRequest(data) {
    const url="/handle-posts.php";
    let formData=new FormData();
    for (const [k,v] of Object.entries(data)) {
        formData.append(k,v);
    }
    const response=await (await fetch(url,{method:"POST",body:formData})).text();
    return JSON.parse(response);
}

export async function mp_getGameState(id) {
    let state=await mp_makeRequest({"request":requests.GET_STATE,"id":id});
    if (!state.Error) return state.Data;
    else return "";
}

export async function mp_createGame(username,playerIsBlack) {
    let data={"request":requests.CREATE_GAME,"username":username,"playerIsBlack":playerIsBlack,"fen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 1 1"};
    let res=await mp_makeRequest(data);
    if (res.Error==false) {
        board=new OnlineBoard(board.width,board.height,board.ctx,res.Data.id);
        let state=await mp_getGameState(res.Data.id);
        board.loadPosFromFENNotation(state.FEN);
        board.playerIsBlack=playerIsBlack;
    }
    return res.Data.id;
    
}

export async function mp_sendUsername(event) {
    event.preventDefault();
    

    const urlData=new URLSearchParams(window.location.search)
    const formData=new FormData(event.target);
    const id=urlData.get("id");
    formData.append("id",id);
    formData.append("request",requests.SEND_USERNAME);
    fetch("/handle-posts.php",{
        method:"POST",
        body: formData
}).then(res=>res.text()).then(res2=>{
    let data=JSON.parse(res2);
    if (data.Error) console.log("error "+data.Error);
    else {
        let data2=data.Data;
        console.log(data2);
        board=new OnlineBoard(board.width,board.height,board.ctx,id);
        board.playerIsBlack=data2.PlayerIsBlack;
        board.loadPosFromFENNotation(data2.FEN);
        let elem=document.getElementById("username-entry-div");
        elem.remove();
    }
    
});

console.log(await mp_getGameState(id));
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
    <button id="button2" class="buttons" onclick="generateNewGameScreen()">New Game</button>`
    document.body.appendChild(elem);
}


function readFormData() {
    let text=document.getElementById("notationText").value;
    board.convertMovementNotationToMoves(text);
}
let count=1;
function update() {
    ctx.clearRect(0,0,ctx.width,ctx.height);
    if (board) board.update();


    requestAnimationFrame(update);
    width=canvas.width;
    height=canvas.height;
    count++;

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
//board.loadStandardGame();
//sboard.playerIsBlack=false;
//board.addBotPlayer(!board.playerIsBlack);
let url=new URLSearchParams(window.location.search);
let id=url.get("id");
if (!id) {
    id=await mp_createGame("hesus",true);
    console.log(id);
    console.log(await mp_getGameState(id));
}

 update();