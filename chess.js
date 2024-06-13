

import {Board,Bot, OnlineBoard} from "./board.js";
import * as Globals from "./globals.js"
import * as Multiplayer from "./mp_requests.js"




let count=1;
function update() {
    Globals.board.ctx.clearRect(0,0,Globals.board.ctx.width,Globals.board.ctx.height);
    if (Globals.board) Globals.board.update();


    requestAnimationFrame(update);
    count++;

}





Globals.setBoard(new Board(Globals.width,Globals.height,Globals.ctx));
// board.loadStandardGame();
// board.playerIsBlack=false;
// board.addBotPlayer(!board.playerIsBlack);
 let url=new URLSearchParams(window.location.search);
 let id=url.get("id");
 if (!id) {
     id=await Multiplayer.mp_createGame("hesus",false);
     console.log(id);
     console.log(await Multiplayer.mp_getGameState(id));
     await Multiplayer.mp_submitMove(id,"12234543","e5");
     console.log(await Multiplayer.mp_getGameState(id));
 }

 update();