

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





Globals.setBoard(new Board(Globals.width,Globals.height,Globals.ctx));
// Globals.board.loadStandardGame();
// Globals.board.loadPosFromFENNotation("2rNkbnr/pppP2pp/8/4pP2/2P5/6P1/PP2P2P/RNBQKB1R b KQk - 0 1");
// Globals.board.playerIsBlack=false;
// Globals.board.addBotPlayer(!Globals.board.playerIsBlack);
   let url=new URLSearchParams(window.location.search);
   let id=url.get("id");
   if (!id) {
       id=await Multiplayer.mp_createGame("hesus",false);
       console.log(id);
       console.log(await Multiplayer.mp_getGameState(id));

   }

 await update();