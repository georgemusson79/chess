import {Board} from "./board.js";
import { moveAudio } from "./chess.js";
export class Vector {
    x=null;
    y=null;
    constructor(x,y) {
        this.x=x;
        this.y=y;
    }
    equals(vector) {
        if (this.x==vector.x && this.y==vector.y) return true;
        return false;
    }
}

class Move {
    x=0;
    y=0;
    isEnpassant=false;
    isCastle=false;
    isBlack=false;
    castleTile=null;
    constructor(x,y,isEnpassant,isCastle,isBlack,castleTile=null) {
        this.x=x;
        this.y=y;
        this.isEnpassant=isEnpassant;
        this.isCastle=isCastle;
        this.isBlack=isBlack;
        this.castleTile=castleTile;
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

    getCapturePoints() {
        return this.getMovementPoints();
    }


    /** @param {CanvasRenderingContext2D} ctx */
    render(ctx, x,y,w,h) {
        this.imgX=this.imgW*this.piecePos;
        this.imgY=this.imgH*this.isBlack;
        ctx.drawImage(this.img,this.imgX,this.imgY,this.imgW,this.imgH,x,y,w,h)
    }

    moveTo(move) {
        if (this.board.isOnBoard(new Vector(move.x,move.y))) {
            if (!move.isCastle) {
                let direction=(this.isBlack) ? -1 : 1;
                (move.isEnpassant) ? this.board.capturePiece(move.x,move.y+direction) : this.board.capturePiece(move.x,move.y);
                this.board.tiles[move.x][move.y]=this;
                this.board.tiles[this.boardX][this.boardY]=undefined;
                this.boardX=move.x;
                this.boardY=move.y;
            }

        

            else {
                let distance=Math.abs(this.boardX-move.castleTile.x);
                let rookDistance=-2;
                let kingDistance=2;
                if (distance==4) {
                    rookDistance=3;
                    kingDistance=-2;
                }
                let rook=this.board.tiles[move.castleTile.x][move.castleTile.y];
                let kingOldPos=new Vector(this.boardX,this.boardY);
                let rookOldPos=new Vector(rook.boardX,rook.boardY);

                this.boardX+=kingDistance;
                this.board.tiles[this.boardX][this.boardY]=this;
                this.board.tiles[kingOldPos.x][kingOldPos.y]=undefined;
                rook.boardX+=rookDistance;
                this.board.tiles[rook.boardX][rook.boardY]=rook;
                this.board.tiles[rookOldPos.x][rookOldPos.y]=undefined;
                
            }
            this.numMoves++;
            this.board.halfMoves++;
            this.movedAt=this.board.fullMoves;
            if (this.isBlack) this.board.fullMoves++;

            this.board.updateCheckInfo();
            moveAudio.volume=0.3;
            moveAudio.play();

        }
    }

}

export class Pawn extends Piece {

    getCapturePoints() {
        let yDirection=this.isBlack ? 1 : -1;
        let moves=[new Move(this.boardX+1,this.boardY+yDirection,true,false,this.isBlack),new Move(this.boardX-1,this.boardY+yDirection,true,false,this.isBlack)];
        moves.filter(move => this.board.isOnBoard(new Vector(move.x,move.y)));
        return moves;
    }

    canEnPassant(currentMovementPoints) {
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

        let diagonals=[new Vector(1,direction),new Vector(-1,direction)];
        for (let p of diagonals) {
            let newpos=new Vector(this.boardX+p.x,this.boardY+p.y);
            if (this.board.isOnBoard(newpos) && this.board.tiles[newpos.x][newpos.y]!=undefined && this.board.tiles[newpos.x][newpos.y].isBlack!=this.isBlack) {
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

    getCapturePoints() {
        return this.getPointsAroundKing();
    }

    getCanCastleMoves(pointsAttackedByEnemy) {
        let points=[new Vector(this.boardX-4,this.boardY),new Vector(this.boardX+3,this.boardY)];
        let castleMoves=[];
        for (let point of points) {
            let movesThisSide=[];
            if (this.board.isOnBoard(point)) {
                let tile=this.board.tiles[point.x][point.y];
                if (this.numMoves==0 && tile instanceof Rook && tile.isBlack==this.isBlack && tile.numMoves==0) {
                    let distance=Math.abs(point.x-this.boardX);
                    let checkPoint=new Vector(this.boardX,this.boardY);
                    let dir=point.x<this.boardX ? -1 : 1;
                    while (checkPoint.x!=point.x) {
                        checkPoint.x+=dir;
                        const underAttack=pointsAttackedByEnemy.find(attackPoint => attackPoint.x==checkPoint.x && attackPoint.y==checkPoint.y)
                        if (underAttack) break;
                        if (this.board.tiles[checkPoint.x][checkPoint.y]!=undefined && this.board.tiles[checkPoint.x][checkPoint.y]!=this && checkPoint.x!=point.x) break;
                        if (this.board.tiles[checkPoint.x][checkPoint.y]!=this) movesThisSide.push(new Move(checkPoint.x,checkPoint.y,false,true,this.isBlack,point));
                    }
                    
                    if (checkPoint.x==point.x && checkPoint.y==point.y) castleMoves.push(...movesThisSide);
                }
            }
        }

        if (castleMoves.length==0) return false;
        return castleMoves;

    }


    getPointsAroundKing() {
        let points=[];
        for (let x=this.boardX-1;x<this.boardX+2; x++) {
            for (let y=this.boardY-1; y<this.boardY+2; y++) {
                if (this.board.isOnBoard(new Vector(x,y)) && this.board.tiles[x][y]!=this) points.push(new Vector(x,y));
            }
        }
        return points;
    }

    getPointsAttackedByEnemy() {
        let enemyMovePoints=[];
        for (let x=0; x<this.board.tilesXCount; x++) {
            for (let y=0; y<this.board.tilesYCount; y++) {
                /** @type {Piece} */
                let tile=this.board.tiles[x][y];
                if (tile!=undefined && tile.isBlack!=this.isBlack) {
                    enemyMovePoints.push(...tile.getCapturePoints());
                }
            }
        }
        return enemyMovePoints;

    }

    getMovementPoints() {
        let enemyMovePoints=this.getPointsAttackedByEnemy();
        let points=[];

        let moves=this.getCanCastleMoves(enemyMovePoints);
        if (moves!=false) points.push(...moves);

        let pointsAroundKing=this.getPointsAroundKing();
        for (let point of pointsAroundKing) {
            const found=enemyMovePoints.length!=0 ? enemyMovePoints.find(other => other.x==point.x && other.y==point.y) : undefined;
            const alreadyAdded=points.length!=0 ? points.find(other => point.x==other.x && point.y==other.y) : undefined;
            if (found || alreadyAdded ||  (this.board.tiles[point.x][point.y]!=undefined && this.board.tiles[point.x][point.y].isBlack==this.isBlack)) continue;
            points.push(new Move(point.x,point.y,false,false,this.isBlack));
        }


        return points;
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