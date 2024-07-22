

import {Board,Bot, OnlineBoard} from "./board.js";
import * as Globals from "./globals.js"
import * as Multiplayer from "./mp_requests.js"




let count=1;
async function update() {
    Globals.board.ctx.clearRect(0,0,Globals.board.ctx.width,Globals.board.ctx.height);
    if (Globals.board) await Globals.board.update();


    await new Promise(requestAnimationFrame);
    
    // Call your async update function
    await update();
    count++;

}

export async function setupOnlineMatch(username,plrIsBlack) {
    document.getElementById("additional-settings-container").style.display="none";
    document.getElementById("online-settings-container").style.display="block";
    document.getElementById("settings").style.display="block";
    document.getElementById("settings").innerText="Additional Settings...";

    Globals.setBoard(new Board(Globals.width,Globals.height,Globals.ctx));
// Globals.board.loadStandardGame();
// Globals.board.loadPosFromFENNotation("2rNkbnr/pppP2pp/8/4pP2/2P5/6P1/PP2P2P/RNBQKB1R b KQk - 0 1");
// Globals.board.playerIsBlack=false;
// Globals.board.addBotPlayer(!Globals.board.playerIsBlack);
   let url=new URLSearchParams(window.location.search);
   let id=url.get("id");
   if (!id) {
       id=await Multiplayer.mp_createGame(username,plrIsBlack);
       document.getElementById("game-id-read").value=id;
       document.getElementById("challenge-link-read").value=window.location.href+"?id="+id;
       document.getElementById("p1-name").innerText=username;
       console.log(await Multiplayer.mp_getGameState(id));
       console.log(window.location.search);

   }
     await update();


}

export async function setupBotMatch() {

    Globals.setBoard(new Board(Globals.width,Globals.height,Globals.ctx));
    Globals.board.loadStandardGame();
    Globals.board.playerIsBlack=false;
    Globals.board.addBotPlayer(!Globals.board.playerIsBlack);
    // document.getElementById("p1-name").innerText="Player 1";
    // document.getElementById("p2-name").innerText="Stockfish Engine";

     await update();

}





//Globals.setBoard(new Board(Globals.width,Globals.height,Globals.ctx));

//    let url=new URLSearchParams(window.location.search);
//    let id=url.get("id");
//    if (!id) {
//        id=await Multiplayer.mp_createGame("hesus",false);
//        console.log(id);
//        console.log(await Multiplayer.mp_getGameState(id));

//    }
