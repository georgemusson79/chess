import {Board} from "./board.js";
import { moveAudio } from "./chess.js";
export class Vector {
    x=null;
    y=null;
    constructor(x,y) {
        this.x=x;
        this.y=y;
    }
}

class Move {
    x=0;
    y=0;
    isEnpassant=false;
    isCastle=false;
    isBlack=false;
    constructor(x,y,isEnpassant,isCastle,isBlack) {
        this.x=x;
        this.y=y;
        this.isEnpassant=isEnpassant;
        this.isCastle=isCastle;
        this.isBlack=isBlack;
    }
}

export class Piece {
    movedAt=0;
    boardX=0
    boardY=0
    x=0;
    y=0;
    isPickedUp=false;
    isSelected=false;
    w=0;
    h=0;
    isBlack=false;
    piecePos=0;
    imgX=0;
    imgY=0;
    imgW=0;
    imgH=0;
    img=new Image();
    /** @type {Board} */
    board=null;
    numMoves=0;
    startBoardX=0;
    startBoardY=0;
    validPiece=false;

    /** @param {Board} board */
    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        this.boardX=boardX;
        this.boardY=boardY;
        this.startBoardX=startBoardX;
        this.startBoardY=startBoardY;
        this.img.src="pieces.png";
        this.isBlack=isBlack;
        this.board=board;
        this.img.onload = () => {
            this.imgW=this.img.width/6;
            this.imgH=this.img.height/2;
            this.validPiece=true;
        }
        
        
    }

    update() {
        if (!this.validPiece) return;

    }

    onClick() {

    }

    getMovementPoints() {
        
    }


    /** @param {CanvasRenderingContext2D} ctx */
    render(ctx, x,y,w,h) {
        this.imgX=this.imgW*this.piecePos;
        this.imgY=this.imgH*this.isBlack;
        ctx.drawImage(this.img,this.imgX,this.imgY,this.imgW,this.imgH,x,y,w,h)
    }

    moveTo(move) {
        if (this.board.isOnBoard(new Vector(move.x,move.y))) {
            let direction=(this.isBlack) ? -1 : 1;
            (move.isEnpassant) ? this.board.capturePiece(move.x,move.y+direction) : this.board.capturePiece(move.x,move.y);
            this.board.tiles[move.x][move.y]=this;
            this.board.tiles[this.boardX][this.boardY]=undefined;
            this.boardX=move.x;
            this.boardY=move.y;
            this.numMoves++;
            moveAudio.play();
        }
    }

}

export class Pawn extends Piece {

    canEnPassant(currentMovementPoints) {
        //only works for white i think
        let enPassantMove=null;

        let direction = (this.isBlack) ? 1 : -1;

        let temp=this.movedAt-this.board.fullMoves<1;
        if (this.numMoves==1 && this.boardY==this.startBoardY+(2*direction) && this.boardX==this.startBoardX && this.movedAt-this.board.fullMoves<1) {
            let right=new Move(this.boardX+1,this.boardY,true,false,this.isBlack);
            let left=new Move(this.boardX-1,this.boardY,true,false,this.isBlack);

            if (this.board.isOnBoard(left)) {
                if (this.board.tiles[left.x][left.y] instanceof Pawn) enPassantMove=left;
            }

            if (this.board.isOnBoard(right)) {
                if (this.board.tiles[right.x][right.y] instanceof Pawn) enPassantMove=right;
            }
        }

        if (enPassantMove!=null) {
            enPassantMove.y+=direction;
            for (let move of currentMovementPoints) {
                if (move.x==enPassantMove.x && move.y==enPassantMove.y) return false;
            }
            return enPassantMove;
        }


        return false;
    }

    getMovementPoints() {
        if (!this.validPiece) return false;
        let pos=[];
        let point= (this.isBlack) ?  new Vector(0,1) : new Vector(0,-1);
        let direction= (this.isBlack) ? 1 : -1;
        
        let pointOnBoard=new Vector(point.x+this.boardX,point.y+this.boardY);
        if (this.board.isOnBoard(pointOnBoard) && !this.board.tiles[pointOnBoard.x][pointOnBoard.y] ) pos.push(new Move(pointOnBoard.x,pointOnBoard.y,false,false,this.isBlack));

        if (this.numMoves==0) {
            let secondPoint=Object.assign({},pointOnBoard);
            secondPoint.y+=point.y;
            if (this.board.isOnBoard(secondPoint) && !(this.board.tiles[secondPoint.x][secondPoint.y] || this.board.tiles[pointOnBoard.x][pointOnBoard.y]) ) pos.push(new Move(secondPoint.x,secondPoint.y,false,false,this.isBlack));
        }

        let diagonals=[new Vector(1,direction*1),new Vector(-1,direction*1)];
        for (let p of diagonals) {
            let newpos=new Vector(this.boardX+p.x,this.boardY+p.y);
            if (this.board.isOnBoard(newpos) && this.board.tiles[newpos.x][newpos.y]!=undefined) {
                pos.push(new Move(newpos.x,newpos.y,false,false,this.isBlack));
            }
        }

        let enPassantPos=this.canEnPassant(pos);
        if (enPassantPos) pos.push(enPassantPos); 
        return pos
    }


    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        super(boardX,boardY,startBoardX,startBoardY,isBlack,board);
        this.piecePos=5;
    }
}

export class Rook extends Piece {
    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        super(boardX,boardY,startBoardX,startBoardY,isBlack,board);
        this.piecePos=4;
    }

    getMovementPoints() {
        if (!this.validPiece) return false;
        let points=[];

        let dxdyList=[[1,0],[-1,0],[0,1],[0,-1]];
        for (let [dx,dy] of dxdyList) {
            let pos=new Vector(this.boardX+dx,this.boardY+dy);
            while (this.board.isOnBoard(pos)) {

                let piece=this.board.tiles[pos.x][pos.y];
                if (piece!=undefined) {
                    /** @type {Piece} */
                    if (this.isBlack==piece.isBlack) break;
                    else {
                        points.push(new Move(pos.x,pos.y,false,false,this.isBlack));
                        break;
                    }
                }

                points.push(new Move(pos.x,pos.y,false,false,this.isBlack));
                pos.x+=dx;
                pos.y+=dy;
            }
        }

        return points;
    }

}

export class King extends Piece {
    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        super(boardX,boardY,startBoardX,startBoardY,isBlack,board);
        this.piecePos=0;
    }
}

export class Queen extends Rook {
    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        super(boardX,boardY,startBoardX,startBoardY,isBlack,board);
        this.piecePos=1;
    }

    getMovementPoints() {
        if (!this.validPiece) return false;
        let points=super.getMovementPoints();

    }
}

export class Knight extends Piece {
    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        super(boardX,boardY,startBoardX,startBoardY,isBlack,board);
        this.piecePos=3;
    }

    getMovementPoints() {
        if (!this.validPiece) return false;
        let points=[];
        let dxdyPoints=[[2,1],[-2,1],[2,-1],[-2,-1],[1,2],[-1,2],[1,-2],[-1,-2]]
        for (let [dx,dy] of dxdyPoints) {
            let pos=new Vector(this.boardX+dx,this.boardY+dy);
            if (this.board.isOnBoard(pos)) {
                let piece=this.board.tiles[pos.x][pos.y];
                if (piece!=undefined) {
                    /** @type {Piece} */
                    if (this.isBlack!=piece.isBlack) points.push(new Move(pos.x,pos.y,false,false,this.isBlack));
                }
                else points.push(new Move(pos.x,pos.y,false,false,this.isBlack));
            }
        }
        return points;
    }
}

export class Bishop extends Piece {
    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        super(boardX,boardY,startBoardX,startBoardY,isBlack,board);
        this.piecePos=2;
    }

    getMovementPoints() {
        if (!this.validPiece) return false;
        let points=[];
        let dxdyList=[[1,1],[-1,-1],[1,-1],[-1,1]];
        for (let [dx,dy] of dxdyList) {
            let pos=new Vector(this.boardX+dx,this.boardY+dy);
            while (this.board.isOnBoard(pos)) {

                let piece=this.board.tiles[pos.x][pos.y];
                if (piece!=undefined) {
                    /** @type {Piece} */
                    if (this.isBlack==piece.isBlack) break;
                    else {
                        points.push(new Move(pos.x,pos.y,false,false,this.isBlack));
                        break;
                    }
                }

                points.push(new Move(pos.x,pos.y,false,false,this.isBlack));
                pos.x+=dx;
                pos.y+=dy;
            }
        }
        return points;
    }
}