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

    update() {
        this.render();
        this.handleClicks();
        this.handleSelectingPieces();
        
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
        let pos=this.hoveredTile;
        if (mouseIsClicked) {
            if (pos!=null && this.pieceIsValid(this.tiles[pos.x][pos.y]) && this.tiles[pos.x][pos.y].isBlack==this.playerIsBlack && this.selectedPiece==null) {
                let tile=this.tiles[pos.x][pos.y];
                this.selectedPiece=tile;
                tile.isPickedUp=true;
                tile.isSelected=true;
                this.selectedPieceMovementPoints=this.selectedPiece.getMovementPoints();
            }

        }

        else {
            if (this.selectedPiece!=null) {
                this.selectedPiece.isPickedUp=false;
                this.selectedPiece.isSelected=false;
                
                if (this.hoveredTile!=null) {
                    let validMoves=this.selectedPieceMovementPoints;
                    for (let place of validMoves) {
                        if (place.x==this.hoveredTile.x && place.y==this.hoveredTile.y) {
                            this.selectedPiece.moveTo(place);

                        }
                    }
                }
            }
            this.selectedPiece=null;
            this.selectedPieceMovementPoints=null;
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
        else return Result.CONTINUE;
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
        
        let castleResBlack=this.kingCastleDirection(true);
        let castleResWhite=this.kingCastleDirection(false);

        if (castleResBlack) output+=castleResBlack;
        if (castleResWhite) output+=castleResWhite;
        if (!castleResBlack && !castleResWhite) output+="-";

        output+=" "+this.getEnPassantTargetSquares()+" ";
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
                    if (p.boardY==p.startBoardY+(dir*2) && p.numMoves==1 && this.fullMoves-p.movedAt<=1 && this.blackPlayersTurn!=p.isBlack) {
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


            for (let char of boardString) {
                if (isNaN(char) && notationToPiece[char.toLowerCase()]) {
                    let piece=notationToPiece[char.toLowerCase()];
                    let isBlack=(char===char.toUpperCase()) ? false : true;

                    switch (char.toLowerCase()) {
                        case "r":
                            this.addPiece(piece,xPos,yPos,xPos,yPos,isBlack);
                            break;

                        case "k":
                            this.addPiece(piece,xPos,yPos,xPos,yPos,isBlack);
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
                            this.addPiece(piece,xPos,yPos,xPos,yPos,isBlack);
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
        }

        convertNotationToPos(notation) {
            let letter=notation[0].toLowerCase();
            let number=notation[1];

            let x=letter.charCodeAt(0) - 'a'.charCodeAt(0);
            let y=this.tilesYCount-number;
            return new Vector(x,y);
        }





}
