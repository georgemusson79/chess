import { Piece, Vector } from "./pieces.js";
import { Rook, Knight, Bishop, Queen, King, Pawn } from './pieces.js';
import {canvas, cursorX,cursorY,mouseIsClicked} from "./chess.js"

const Result = {
    CONTINUE:1,
    STALEMATE:2,
    CHECKMATE:3
}

class CheckInfo {
    isBlackInCheck=false;
    isWhiteInCheck=false;
    isCheckMate=false;
    isStaleMate=false;
    chkSrc=null;
}

export class Board {
    botPlayer=null;
    secondPlayerExists=false;
    secondPlayerIsBot=false;
    halfMoves=0;
    fullMoves=0;
    halfMovesSincePawnMoveOrCapture=0;
    checkInfo=new CheckInfo();
    playerIsBlack=false;
    blackPlayersTurn=false;
    /** @type {Piece} */
    selectedPiece=null;
    selectedPieceMovementPoints=null;
    pieceJustPickedUp=false;
    hoveredTile=null;
    startX = 0;
    startY = 0;
    width = 0;
    height = 0;
    tilesXCount = 8;
    tilesYCount = 8;
    sqWidth = 0;
    sqHeight = 0;
    colorA = "rgb(118,150,86)";
    colorB = "rgb(238,238,210)";
    /** @type {CanvasRenderingContext2D} */
    ctx = 0;
    tiles=null;

    constructor(width, height, ctx) {
    
        this.ctx = ctx;
        this.setBoard(8,8,width,height);

        this.ctx.beginPath();
        this.ctx.fillStyle = this.colorB;
        this.drawColor = this.colorA;
        this.render();

        
    }

    addPiece(piece,x,y,startX,startY,isBlack) {
        this.tiles[x][y]=new piece(x,y,startX,startY,isBlack,this);
        return this.tiles[x][y];
    }

    /** @param {Vector} pos  */
    isOnBoard(pos) {
        if (pos.x>=this.tilesXCount || pos.x<0) return false;
        if (pos.y>=this.tilesYCount || pos.y<0) return false;
        return true;
    }

    handleBot() {
        if (this.secondPlayerIsBot && this.blackPlayersTurn==this.botPlayer.isBlack && !this.botPlayer.isRetrievingData && !this.botPlayer.dataRetrieved) {
            this.botPlayer.depth=document.getElementById("stockfishDifficulty").value;
            this.botPlayer.decideMove();

        }

        if (this.botPlayer.dataRetrieved) {
            this.botPlayer.dataRetrieved=false;
            this.botPlayer.onDecideDoMove();
        }

    }

    update() {
        this.render();
        this.handleClicks();
        this.handleBot();
        this.handleSelectingPieces();
        this.updateCheckInfo();
        
        let p=document.getElementById("checkInfo");

        p.innerHTML="black in check: "+this.checkInfo.isBlackInCheck+" white in check: "+this.checkInfo.isWhiteInCheck+" checkmate "+this.checkInfo.isCheckMate+" stalemate "+this.checkInfo.isStaleMate+" chk src: ";
        
        if (checkInfo.chkSrc!=undefined) {
            for (let pair of checkInfo.chkSrc) {
            p.innerHTML+="bruh ";
            for (let item of pair[1]) p.innerHTML+="["+item.x+item.y+"] "
            }
        }
        else p.innerHTML+=checkInfo.chkSrc;
        
    }

    render() {
        for (let x = this.startX; x < this.startX + this.width; x += this.sqWidth) {
            this.drawColor = (this.drawColor == this.colorA) ? this.colorB : this.colorA;
            for (let y = this.startY; y < this.startY + this.height; y += this.sqHeight) {
                this.drawColor = (this.drawColor == this.colorA) ? this.colorB : this.colorA;
                this.ctx.fillStyle = this.drawColor;
                this.ctx.fillRect(x, y, this.sqWidth, this.sqHeight);
                    
                if (this.hoveredTile!=null) {
                    let tilePos=this.tilePosToPxPos(this.hoveredTile.x,this.hoveredTile.y);
                    if (tilePos.x==x && tilePos.y==y) {
                        this.ctx.fillStyle="rgb(255,0,0)";
                        this.ctx.fillRect(x, y, this.sqWidth, this.sqHeight);
                    }
                } 
            }
        }
        this.renderPieces();
    }

    renderPieces() {
        if (this.tiles==null) return;
        for (let x=0; x<this.tilesXCount; x++) {
            for (let y=0; y<this.tilesYCount; y++) {
                
                if (this.tiles[x][y]) {
                    /** @type {Piece} */
                    let tile=this.tiles[x][y];

                    if (tile.isPickedUp) {
                        let cursorPos=this.getCursorPosRelToCanvas();
                        tile.render(this.ctx,cursorPos.x,cursorPos.y,this.sqWidth,this.sqHeight);
                    }

                    else {
                        let renderX=x*this.sqWidth;
                        let renderY=y*this.sqHeight;
                        tile.render(this.ctx,renderX,renderY,this.sqWidth,this.sqHeight);
                    }

                    if (tile.isSelected) {
                        let movementPoints=this.selectedPieceMovementPoints;
                        if (movementPoints!=null) {
                            for (let point of movementPoints) {
                                point=this.tilePosToPxPos(point.x,point.y);
                                point.x+=this.sqWidth/2;
                                point.y+=this.sqHeight/2
                                this.ctx.beginPath();
                                this.ctx.arc(point.x,point.y,this.sqWidth/6,0,2 * Math.PI,false);
                                this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // Set the color
                                this.ctx.fill();
                                this.ctx.closePath();
                            }
                        }
                    }
                }
            }
        }
    }

    setBoard(tilesXCount,tilesYCount, width,height) {
        this.tilesXCount=tilesXCount;
        this.tilesYCount=tilesYCount;
        this.width = width;
        this.height = height;
        this.sqWidth = this.width / this.tilesXCount;
        this.sqHeight = this.height / this.tilesYCount;
        this.clearBoard();
    }

    clearBoard() {
        this.tiles=new Array(this.tilesXCount);
        for (let x=0; x<this.tilesXCount; x++) this.tiles[x]=new Array(this.tilesYCount);
    }

    loadStandardGame() {
        this.clearBoard();
        let boardPieces=[Rook,Knight,Bishop,Queen,King,Bishop,Knight,Rook];
        let pawnYValues=[1,6];
        let pieceYValues=[0,7];
        for (let y of pawnYValues) {
            let isBlack=(y==1);
            for (let x=0; x<this.tilesXCount; x++) {
                this.addPiece(Pawn,x,y,x,y,isBlack);   
            }
        }

        for (let y of pieceYValues) {
            let isBlack=(y==0);
            for (let x=0; x<this.tilesXCount; x++) this.addPiece(boardPieces[x],x,y,x,y,isBlack);
        }

    }

    checkBoardReady() {

        let piecesObj=this.getBoardPieces();
        let pieces=[...piecesObj.blackPieces,...piecesObj.whitePieces]
        for (let piece of pieces) if (!piece.validPiece) return false;
        return true;
    }

    getBoardPieces() {
        let pieces={blackPieces:[],whitePieces:[]};
        for (let y=0; y<this.tilesYCount; y++) for (let x=0; x<this.tilesXCount; x++) if (this.tiles[x][y]!=undefined) {
            if (this.tiles[x][y].isBlack) pieces.blackPieces.push(this.tiles[x][y]);
            else pieces.whitePieces.push(this.tiles[x][y]);
        }
        return pieces;
    }

    tilePosToPxPos(x,y) {
        let renderX=this.startX+(x*this.sqWidth);
        let renderY=this.startX+(y*this.sqHeight);
        return new Vector(renderX,renderY);

    }

    convertClickPosToTilePos(px,py) {

    }

    handleClicks() {
        let pos=this.cursorToTilePos();
        let posx=pos.x;
        let posy=pos.y;
        if (posx<this.tilesXCount &&posx>=0 && posy<this.tilesYCount && posy>=0) {
            this.hoveredTile=new Vector(posx,posy);
            document.getElementById("cpos").innerText="Cursor Pos: "+this.hoveredTile.x+" "+this.hoveredTile.y;
        }
        else this.hoveredTile=null;

    }

    getCursorPosRelToCanvas() {
        let dims=canvas.getBoundingClientRect();

        let pixelSzX=dims.width/canvas.width;
        let pixelSzY=dims.height/canvas.height;

        let posx=(cursorX-dims.x)/pixelSzX;
        let posy=(cursorY-dims.y)/pixelSzY;
        return new Vector(posx,posy);
    }

    cursorToTilePos() {
        let dims=canvas.getBoundingClientRect();

        let pixelSzX=dims.width/canvas.width;
        let pixelSzY=dims.height/canvas.height;

        let posx=cursorX-dims.x;
        let posy=cursorY-dims.y;
        posx=Math.ceil(((posx/this.sqWidth)/pixelSzX)-1);
        posy=Math.ceil(((posy/this.sqHeight)/pixelSzY)-1);
        return new Vector(posx,posy);
    } 

    handleSelectingPieces() {
        if (this.blackPlayersTurn!=this.playerIsBlack) return false;
        let pos=this.hoveredTile;
        if (mouseIsClicked) {
            if (pos!=null && this.pieceIsValid(this.tiles[pos.x][pos.y]) && this.tiles[pos.x][pos.y].isBlack==this.playerIsBlack && this.selectedPiece==null) {
                let tile=this.tiles[pos.x][pos.y];
                this.selectedPiece=tile;
                tile.isPickedUp=true;
                tile.isSelected=true;
                this.selectedPieceMovementPoints=this.selectedPiece.getMovementPoints();
            }

            if (this.selectedPiece && !this.selectedPiece.isPickedUp) {
            
                if (pos!=null && this.isOnBoard(pos.x,pos.y) && this.pieceIsValid(this.tiles[pos.x][pos.y]) && this.tiles[pos.x][pos.y].isBlack==this.playerIsBlack) {
                    this.selectedPiece.isSelected=false;
                    this.selectedPiece=null;
                    this.selectedPieceMovementPoints=null;
                }

                else if (pos!=null) {
                    for (let place of this.selectedPieceMovementPoints) {
                        if (place.x==this.hoveredTile.x && place.y==this.hoveredTile.y) {
                            this.selectedPiece.moveTo(place);
                            this.selectedPiece.isSelected=false;
                            this.selectedPiece=null;
                            this.selectedPieceMovementPoints=null;
                        
                        }
                    }
                }
            }
            
        }


        else {
            if (this.selectedPiece!=null) {
                
                if (this.hoveredTile!=null) {
                    let validMoves=this.selectedPieceMovementPoints;
                    for (let place of validMoves) {
                        if (place.x==this.hoveredTile.x && place.y==this.hoveredTile.y && this.selectedPiece.isPickedUp) {
                            this.selectedPiece.moveTo(place);
                            this.selectedPiece.isSelected=false;
                            this.selectedPiece.isPickedUp=false;
                            this.selectedPiece=null;
                            this.selectedPieceMovementPoints=null;
                            
                        }
                    }
                }

                if (this.selectedPiece!=null) this.selectedPiece.isPickedUp=false;
            }
        }
    }

    capturePiece(x,y) {
       if (this.isOnBoard(x,y) && this.pieceIsValid(this.tiles[x][y])) {
        this.tiles[x][y]=undefined;
        this.halfMovesSincePawnMoveOrCapture=0;
       }
    }

    getPlayerMoves(playerIsBlack,ignoreChecks=true) {
        let movementPoints=[]

        for (let x=0; x<this.tilesXCount; x++) for (let y=0; y<this.tilesYCount; y++) {
            if (this.pieceIsValid(this.tiles[x][y]) && this.tiles[x][y].isBlack==playerIsBlack) {
                movementPoints.push(...this.tiles[x][y].getMovementPoints(ignoreChecks));
            }
        }
        return movementPoints;
    }

    getPlayerPiecesAndTheirMoves(playerIsBlack) {
        let movementPoints=[]

        for (let x=0; x<this.tilesXCount; x++) for (let y=0; y<this.tilesYCount; y++) {
            if (this.pieceIsValid(this.tiles[x][y]) && this.tiles[x][y].isBlack==playerIsBlack) {
                movementPoints.push([this.tiles[x][y],this.tiles[x][y].getMovementPoints(true)]);
            }
        }
        return movementPoints;
    }

    getPlayerCapturingMoves(playerIsBlack) {
        let playerMovePoints=[];
        for (let x=0; x<this.tilesXCount; x++) {
            for (let y=0; y<this.tilesYCount; y++) {
                /** @type {Piece} */
                let tile=this.tiles[x][y];
                if (this.pieceIsValid(tile) && tile.isBlack==playerIsBlack) {
                    playerMovePoints.push(...tile.getCapturePoints());
                }
            }
        }
        return playerMovePoints;

    }

    updateCheckInfo() {
        this.checkInfo=new CheckInfo();

        //get kings
        let bKing=this.findKing(true);
        let wKing=this.findKing(false);
        
        let kings=[bKing,wKing];

        for (let king of kings) {
            let attackPoints=this.getPlayerCapturingMoves(!king.isBlack);
            const underAttack=attackPoints.find(point => point.x==king.boardX && point.y==king.boardY);
            if (underAttack) {
                (king.isBlack) ? this.checkInfo.isBlackInCheck=true : this.checkInfo.isWhiteInCheck=true;

                this.checkInfo.chkSrc=king.getCheckSrc();
            }
            else this.checkInfo.chkSrc=null;

            let res=this.checkForEndOfGame(king.isBlack);
            if (res==Result.STALEMATE && king.isBlack==this.blackPlayersTurn) this.checkInfo.isStaleMate=true;
            else if (res==Result.CHECKMATE) this.checkInfo.isCheckMate=true;
            if (res!=Result.CONTINUE) return;
        }


    }

    findKing(playerIsBlack) {
        for (let x=0; x<this.tilesXCount; x++) for (let y=0; y<this.tilesYCount; y++) {
                if (this.tiles[x][y] instanceof King && this.tiles[x][y].isBlack==playerIsBlack) return this.tiles[x][y];
            }
        }

    pieceIsValid(tile) {
        if (tile==undefined || !tile.validPiece) return false;
        return true;
    }

    getIsinCheck(kingIsBlack) {
        return (kingIsBlack) ? this.checkInfo.isBlackInCheck : this.checkInfo.isWhiteInCheck;
    }

    checkForEndOfGame(kingIsBlack) {
        let moves=this.getPlayerMoves(kingIsBlack,false);
        if (moves.length==0) {
            if (this.getIsinCheck(kingIsBlack)) return Result.CHECKMATE;
            //return stalemate if its the players turn and they have no moves
            else if (this.playerIsBlack == kingIsBlack) return Result.STALEMATE;
        }
        return Result.CONTINUE;
    }


    getBoardFENNotation() {
        let output="";
        let distance=0;
        for (let y=0; y<this.tilesYCount; y++) {


            for (let x=0; x<this.tilesXCount; x++) {
                if (this.tiles[x][y]!=undefined && this.tiles[x][y] instanceof Piece) {
                    if (distance!=0) {
                        output+=distance;
                        distance=0;
                    }
                    output+=this.tiles[x][y].pieceNotation;
                }
                else distance++;
            }

            if (distance!=0) {
                output+=distance;
                distance=0;
            }
            if (y!=this.tilesYCount-1) output+="/";
        }
        output+=" ";
        output+=(this.blackPlayersTurn) ? "b " : "w ";
        
        let kings=[];
        kings.push(this.findKing(true));
        kings.push(this.findKing(false));
        let castleResult="";

        for (let king of kings) {
            let inputs=["k","q"];
            for (let input of inputs) {
                if (king.getCanCastle(input)) {
                    if (!king.isBlack) castleResult+=input.toUpperCase();
                    else castleResult+=input;
                }
            } 
        }
        if (castleResult.length==0) castleResult="-";
        output+=castleResult+" ";

        output+=this.getEnPassantTargetSquares()+" ";
        output+=this.halfMovesSincePawnMoveOrCapture+" ";
        output+=this.fullMoves;
        return output;
    }

    kingCastleDirection(kingIsBlack) {
        let res="";
        let king=this.findKing(kingIsBlack);
        let moves=king.getCanCastleMoves(this.getPlayerCapturingMoves(!kingIsBlack));
        if (!moves) return false;

        let biggestDistance=0;
        for (let move of moves) {
            let distance=Math.abs(king.boardX-move.castleTile.x);
            if (distance>biggestDistance) biggestDistance=distance;
        }
        res = (biggestDistance==4) ? "q" : "k";
        if (kingIsBlack) res=res.toUpperCase();
        return res;
        
    }

    getEnPassantTargetSquares() {
        let res="";
        for (let y=0; y<this.tilesYCount; y++) {
            for (let x=0; x<this.tilesYCount; x++) {
                if (this.tiles[x][y]!=undefined && this.tiles[x][y] instanceof Pawn) {
                    let p=this.tiles[x][y];
                    let dir=p.isBlack ? 1 : -1;
                    if (p.boardY==p.startBoardY+(dir*2) && p.numMoves==1 && this.fullMoves-p.movedAt==1 && this.blackPlayersTurn!=p.isBlack) {
                        let letter=String.fromCharCode(x+97);
                        let behind=this.tilesYCount-p.boardY+dir;
                        res+=letter + behind;
                    }
                }
            }
        }
        if (res.length==0) res="-";
        return res;
    }

        loadPosFromFENNotation(stringFENNotation) {

            let data=stringFENNotation.split(" ");
            if (data.length!=6) {
                console.log("invalid FEN");
                this.loadStandardGame();
                return false;
            }
            let boardString=data[0];
            this.clearBoard();
            let notationToPiece={"r":Rook,"n":Knight,"k":King,"q":Queen,"b":Bishop,"p":Pawn};
            
            let xPos=0;
            let yPos=0;
            let defaultPawnRows={black:1, white:6};
            

            this.blackPlayersTurn=(data[1]=="b") ? true : false;
            if (this.blackPlayersTurn) this.playerIsBlack=true;
            let castling=data[2];
            let enPassant=data[3];
            this.fullMoves=data[5];
            this.halfMovesSincePawnMoveOrCapture=data[4];

            let kings={blackKing:null,whiteKing:null};
            let kingCount=0;

            for (let char of boardString) {
                if (isNaN(char) && notationToPiece[char.toLowerCase()]) {
                    let piece=notationToPiece[char.toLowerCase()];
                    let isBlack=(char===char.toUpperCase()) ? false : true;
                    switch (char.toLowerCase()) {

                        case "k":
                            let king=this.addPiece(piece,xPos,yPos,xPos,yPos,isBlack);
                            (isBlack) ? kings.blackKing=king : kings.whiteKing=king;
                            kingCount++;
                            break;

                        case "p":
                            let startRow=(isBlack) ? defaultPawnRows.black : defaultPawnRows.white;
                            let pawn=this.addPiece(piece,xPos,yPos,xPos,startRow,isBlack);

                            if (enPassant!="-") {
                                let behind=(pawn.isBlack) ? -1 : 1;
                                let targetSquare=this.convertNotationToPos(enPassant);

                                if (targetSquare.equals(new Vector(pawn.boardX,pawn.boardY+behind))) {
                                    pawn.movedAt=this.fullMoves;
                                    pawn.numMoves=1;
                                }
                            }
                            
                            break;
                            


                        default:
                            let obj=this.addPiece(piece,xPos,yPos,xPos,yPos,isBlack);
                            if (obj instanceof Rook) obj.numMoves=1;
                            break;
                    }
                    xPos++;

                }

                if (char=="/") {
                    xPos=0;
                    yPos++;
                }

                else if (!isNaN(char)) {
                    let spaces=parseInt(char);
                    xPos+=spaces;
                }
            }

            //input validation
            if (kingCount!=2 || kings.blackKing==null || kings.whiteKing==null) {
                console.log("invalid king count");
                this.loadStandardGame();
                return false;
            }

            //handle castling
            for (let char of castling) {
                if (char=="-") break;
                let king=(char===char.toUpperCase()) ? kings.whiteKing : kings.blackKing;
                let row = king.isBlack ? 0 : 7;
                let rooksPoints={"q":new Vector(0,row),"k":new Vector(7,row)};
                char=char.toLowerCase();
                let pos=rooksPoints[char];

                //validate that castling info is correct
                if (!this.isOnBoard(pos) || !(this.tiles[pos.x][pos.y] instanceof Rook) || this.tiles[pos.x][pos.y].isBlack!=king.isBlack) {
                    console.log("invalid castling info");
                    this.loadStandardGame();
                    return false;
                }

                this.tiles[pos.x][pos.y].numMoves=0;
            }

            this.updateCheckInfo();

        }

        convertNotationToPos(notation) {
            let letter=notation[0].toLowerCase();
            let number=notation[1];

            let x=letter.charCodeAt(0) - 'a'.charCodeAt(0);
            let y=this.tilesYCount-number;
            return new Vector(x,y);
        }

        convertMovementNotationToMoves(notation) {
            let split=[];
            for (let i=0; i<notation.length; i+=2) split.push(notation.substr(i,2));
            let piecePos=this.convertNotationToPos(split[0]);
            let piece=this.tiles[piecePos.x][piecePos.y];
            piece.validPiece=true;
            let moves=piece.getMovementPoints();
            let pieceTo=this.convertNotationToPos(split[1]);
            let selectedMove=moves.find(move => move.x==pieceTo.x && move.y==pieceTo.y);
            piece.moveTo(selectedMove,true,false);
        }

        addBotPlayer(isBlack) {
            this.botPlayer=new Bot(isBlack,this);
            this.playerIsBlack=!isBlack;
            this.secondPlayerExists=true;
            this.secondPlayerIsBot=true;
        }

        removeBotPlayer() {
            this.botPlayer=null;
            this.secondPlayerExists=false;
            this.secondPlayerIsBot=false;
        }

        



}


export class Bot {
    depth=10;
    board=null;
    isBlack=true;
    dataRetrieved=false;
    isRetrievingData=false;
    move=null;
    constructor(isBlack,board) {
        this.isBlack=isBlack;
        this.board=board;
    }

    decideMove() {
        this.dataRetrieved=false;
        this.isRetrievingData=true;
        let url="https://stockfish.online/api/s/v2.php";
        let fen=this.board.getBoardFENNotation();
        let fullRequest=url+"?fen="+fen+"&depth="+this.depth;
        const response=fetch(fullRequest).then(res =>{ 
            return res.json()}).then(data=> {
            console.log(JSON.stringify(data));
            this.move=data.bestmove.substr(9,4);
            console.log(this.move);
            this.dataRetrieved=true;
            this.isRetrievingData=false;
        });
    }

    onDecideDoMove() {
        this.board.convertMovementNotationToMoves(this.move);
    }
    

    
}