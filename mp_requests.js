export const requests = {
    SEND_USERNAME : 1,
    CREATE_GAME : 2,
    GET_STATE : 3,
    SUBMIT_MOVE: 4,
    RESIGN: 5,
    GAME_OVER: 6
}

import {OnlineBoard} from "./board.js";
import { setOnlineMenuLinks } from "./chess.js";
import {board, setBoard, width, height,ctx} from "./globals.js"




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
    else return state;
}

export async function mp_submitResignation(id,playerIsBlack) {
    let data={"request":requests.RESIGN,"id":id,"playerIsBlack":playerIsBlack};
    let res=await mp_makeRequest(data);
    if (res.Error) return false;
    return true;
}

export async function mp_submitGameOver(id) {
    let data={"request":requests.GAME_OVER,"id":id};
    let res=await mp_makeRequest(data);
    if (res.Error) return false;
    return true;
}

export async function mp_createGame(username,playerIsBlack) {
    let data={"request":requests.CREATE_GAME,"username":username,"playerIsBlack":playerIsBlack,"fen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 1 1"};
    let res=await mp_makeRequest(data);
    if (res.Error==false) {
        setBoard(new OnlineBoard(width,height,ctx,res.Data.id,playerIsBlack));

        let state=await mp_getGameState(res.Data.id);
        board.loadPosFromFENNotation(state.FEN);
        board.playerIsBlack=playerIsBlack;

        document.cookie=`username=${username}; expires=${Date.now()+(1000*60*60*24)}`;
        document.cookie=`id=${res.Data.id}; expires=${Date.now()+(1000*60*60*24)}`;
    }

    return res.Data.id;
    
}

export async function mp_checkIfCanJoinGame(id,username) {
    let res=await mp_getGameState(id);
    if (res.Error) return res;


    if (res.B_PLR && res.W_PLR) res.Error="Game is full";
    else {
        let plrName=(res.B_PLR) ? res.B_PLR : res.W_PLR;
        if (username==plrName) res.Error="Name already taken";
    }

    return res;

}

export async function mp_submitMove(id,newBoardState,move) {
    let data={"request":requests.SUBMIT_MOVE,"id":id,"move":move,"fen":newBoardState,"move":move};
    let res=await mp_makeRequest(data);
}

export async function mp_autoSendUsername(id,username) {
    let res=await mp_makeRequest({"request":requests.SEND_USERNAME,"id":id,"username":username});
    if (!res.Error) {
        let data2=res.Data;
        setBoard(new OnlineBoard(board.width,board.height,board.ctx,id,data2.PlayerIsBlack));
        board.loadPosFromFENNotation(data2.FEN);
        //set cookies so user can rejoin if page refreshes
        document.cookie=`username=${username}; expires=${Date.now()+(1000*60*60*24)}`;
        document.cookie=`id=${id}; expires=${Date.now()+(1000*60*60*24)}`;
    }
}

export async function mp_rejoin(id,username) {

    let res=await mp_getGameState(id);
    if (res.Error) window.location.href="/join-game.php";
    else {
        let playerIsBlack=false;
        if (username==res.B_PLR) playerIsBlack=true;
        setBoard(new OnlineBoard(width,height,ctx,id,playerIsBlack));
        if (res.OLD_FEN)board.loadPosFromFENNotation(res.OLD_FEN);
        else board.loadPosFromFENNotation(res.FEN);
        if (res.LAST_MOVE) board.convertMovementNotationToMoves(res.LAST_MOVE);
        document.getElementById("p1-name").innerText=username;
        document.getElementById("p2-name").innerText="Awaiting Player 2...";
        if (res.B_PLR==null || res.W_PLR==null) {
            document.getElementById("settings").style.display="block";
            document.getElementById("online-settings-container").style.display="block";
            document.getElementById("additional-settings-container").style.display="none";
        }

        setOnlineMenuLinks(id);
    }

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
        setBoard(new OnlineBoard(board.width,board.height,board.ctx,id,data2.PlayerIsBlack));
        board.loadPosFromFENNotation(data2.FEN);
        let elem=document.getElementById("username-entry-div");
        let username=formData.get("username");
        elem.remove();
        
        //set cookies so player can rejoin
        document.cookie=`username=${username}; expires=${Date.now()+(1000*60*60*24)}`;
        document.cookie=`id=${id}; expires=${Date.now()+(1000*60*60*24)}`;
    }
    
});

console.log(await mp_getGameState(id));
}