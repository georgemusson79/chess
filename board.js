import { Piece, Vector } from "./pieces.js";
import {canvas, cursorX,cursorY,mouseIsClicked} from "./chess.js"

export class Board {
    halfMoves=0;
    fullMoves=0;
    playerIsBlack=true;
    /** @type {Piece} */
    selectedPiece=null;
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
    tiles=null

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
                        let movementPoints=tile.getMovementPoints();
                        if (movementPoints!=false) {
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
            if (pos!=null && this.tiles[pos.x][pos.y]!=undefined && this.tiles[pos.x][pos.y].isBlack==this.playerIsBlack && this.selectedPiece==null) {
                let tile=this.tiles[pos.x][pos.y];
                this.selectedPiece=tile;
                tile.isPickedUp=true;
                tile.isSelected=true;
            }

        }

        else {
            if (this.selectedPiece!=null) {
                this.selectedPiece.isPickedUp=false;
                this.selectedPiece.isSelected=false;
                
                if (this.hoveredTile!=null) {
                    let validMoves=this.selectedPiece.getMovementPoints();
                    for (let place of validMoves) {
                        if (place.x==this.hoveredTile.x && place.y==this.hoveredTile.y) {
                            this.selectedPiece.moveTo(place.x,place.y);
                            this.playerIsBlack=!this.playerIsBlack;
                        }
                    }
                }
            }
            this.selectedPiece=null;
        }
    }



}
