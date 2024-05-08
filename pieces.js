import {Board} from "./board.js";
export class Vector {
    x=null;
    y=null;
    constructor(x,y) {
        this.x=x;
        this.y=y;
    }
}



export class Piece {
    movedAt=0;
    boardX=0
    boardY=0
    x=0;
    y=0;
    isSelected=true;
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

}

export class Pawn extends Piece {

    canEnPassant() {
        //only works for white i think
        if (this.numMoves==1 && this.boardY==this.startBoardY+2 && this.boardX==this.startBoardX && this.movedAt-this.board.fullMoves<1) {
            let right=new Vector(this.boardX+1,this.boardY);
            let left=new Vector(this.boardX-1,this.boardY);

            if (this.board.isOnBoard(left)) {
                if (this.board.tiles[left.x][left.y] instanceof Pawn) return left;
            }

            if (this.board.isOnBoard(right)) {
                if (this.board.tiles[right.x][right.y] instanceof Pawn) return right;
            }
        }
        return false;
    }

    getMovementPoints() {
        if (!this.validPiece) return false;
        let pos=[];
        let point= (this.isBlack) ?  new Vector(0,1) : new Vector(0,-1);
        
        let pointOnBoard=new Vector(point.x+this.boardX,point.y+this.boardY);
        if (this.board.isOnBoard(pointOnBoard) && !this.board.tiles[pointOnBoard.x][pointOnBoard.y] ) pos.push(pointOnBoard);

        if (this.numMoves==0) {
            let secondPoint=Object.assign({},pointOnBoard);
            secondPoint.y+=point.y;
            if (this.board.isOnBoard(secondPoint) && !this.board.tiles[secondPoint.x][secondPoint.y] ) pos.push(secondPoint);

        }

        let enPassantPos=this.canEnPassant();
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
                        points.push(new Vector(pos.x,pos.y));
                        break;
                    }
                }

                points.push(new Vector(pos.x,pos.y));
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
                    if (this.isBlack!=piece.isBlack) points.push(new Vector(pos.x,pos.y));
                }
                else points.push(new Vector(pos.x,pos.y));
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
                        points.push(new Vector(pos.x,pos.y));
                        break;
                    }
                }

                points.push(new Vector(pos.x,pos.y));
                pos.x+=dx;
                pos.y+=dy;
            }
        }
        return points;
    }
}