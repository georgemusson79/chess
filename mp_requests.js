export const requests = {
    SEND_USERNAME : 1,
    CREATE_GAME : 2,
    GET_STATE : 3,
    SUBMIT_MOVE: 4
}

import {OnlineBoard} from "./board.js";
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

export async function mp_createGame(username,playerIsBlack) {
    let data={"request":requests.CREATE_GAME,"username":username,"playerIsBlack":playerIsBlack,"fen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 1 1"};
    let res=await mp_makeRequest(data);
    if (res.Error==false) {
        setBoard(new OnlineBoard(width,height,ctx,res.Data.id,playerIsBlack));
        let state=await mp_getGameState(res.Data.id);
        board.loadPosFromFENNotation(state.FEN);
        board.playerIsBlack=playerIsBlack;
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
        elem.remove();
    }
    
});

console.log(await mp_getGameState(id));
}