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

    normalise() {
        let cpy=Object.assign({},this);
        let magnitude=Math.sqrt( (cpy.x**2) + (cpy.y**2) );
        cpy.x/=magnitude;
        cpy.y/=magnitude;
        return cpy;
    }

    distance(vector) {
        return Math.abs(this.x-vector.x)+Math.abs(this.y-vector.y);
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
    pieceNotation="";

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

    handlePinsAndChecks(currentMovementPoints,dontCheckForCheckmate) {
        if (!dontCheckForCheckmate) {
            if (this.board.getIsinCheck(this.isBlack)) currentMovementPoints=this.validMovesIfPinnedOrInCheck(currentMovementPoints,true);
            else currentMovementPoints=this.validMovesIfPinnedOrInCheck(currentMovementPoints,false);
        }
        return currentMovementPoints;
    }

    validMovesIfPinnedOrInCheck(currentMovementPoints,isCheck=false) {
        let king=this.board.findKing(this.isBlack);

        this.validPiece=false;
        let checkingMoves=king.getCheckSrc(true);
        this.validPiece=true;

        if (checkingMoves.length==0) return currentMovementPoints;
        if (checkingMoves.length>1) return[];
        let pair=checkingMoves[0];
        let attacker=pair[0];

        if (attacker instanceof Knight) {
            let validMoves=currentMovementPoints.filter(point => point.x==attacker.boardX && point.y==attacker.boardY);
            return validMoves;
        }

        let attackDir=new Vector(Number.MAX_VALUE,Number.MAX_VALUE);
        let closestDistance=Number.MAX_VALUE;
        let pointsAroundKing=king.getPointsAroundKing();
        for (let point of pointsAroundKing) {
            let distance=point.distance(new Vector(attacker.boardX,attacker.boardY));
            if (distance<closestDistance) {
                closestDistance=distance;
                attackDir=point;
            }
        }
        attackDir.x-=king.boardX;
        attackDir.y-=king.boardY;




        let validMoves=[];
        let pos=new Vector(king.boardX,king.boardY);

        let pieceIsPinned=false;
        while (!(pos.x==attacker.boardX && pos.y==attacker.boardY)) {
            validMoves.push(new Vector(pos.x,pos.y));
            if (this.boardX==pos.x && this.boardY==pos.y) pieceIsPinned=true;
            pos.x+=attackDir.x;
            pos.y+=attackDir.y;
        }
        validMoves.push(new Vector(attacker.boardX,attacker.boardY));


        if (pieceIsPinned || isCheck) currentMovementPoints=currentMovementPoints.filter(a => validMoves.find(b => (a.x==b.x && a.y==b.y) ) );
        return currentMovementPoints;
    }

    

    getMovementPoints() {
        
    }
    

    getCapturePoints() {
        return this.getMovementPoints(true,true);
    }


    /** @param {CanvasRenderingContext2D} ctx */
    render(ctx, x,y,w,h) {
        this.imgX=this.imgW*this.piecePos;
        this.imgY=this.imgH*this.isBlack;
        ctx.drawImage(this.img,this.imgX,this.imgY,this.imgW,this.imgH,x,y,w,h)
    }

    moveTo(move) {
        let resetMoveCount=false;

        if (this.board.isOnBoard(new Vector(move.x,move.y))) {
            if (!move.isCastle) {
                let direction=(this.isBlack) ? -1 : 1;
                (move.isEnpassant) ? this.board.capturePiece(move.x,move.y+direction) : this.board.capturePiece(move.x,move.y);
                if (this.board.pieceIsValid(this.board.tiles[move.x][move.y])) {
                    resetMoveCount=true;
                    this.board.capturePiece(move.x,move.y);
                }

                this.board.tiles[move.x][move.y]=this;
                this.board.tiles[this.boardX][this.boardY]=undefined;
                this.boardX=move.x;
                this.boardY=move.y;
                if (this instanceof Pawn) resetMoveCount=true;
                else this.board.halfMovesSincePawnMoveOrCapture++;
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
                this.board.halfMovesSincePawnMoveOrCapture++;
            }
            this.numMoves++;
            this.board.halfMoves++;

            this.movedAt=this.board.fullMoves;
            if (this.isBlack) this.board.fullMoves++;

            this.board.updateCheckInfo();
            moveAudio.volume=0;
            moveAudio.play();
            
            let elem=document.getElementById("boardstate");
            this.board.playerIsBlack=!this.board.playerIsBlack;
            this.board.blackPlayersTurn=!this.board.blackPlayersTurn;
            elem.innerText=this.board.getBoardFENNotation();

        }

        if (resetMoveCount) this.board.halfMovesSincePawnMoveOrCapture=0;
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
        let adjacentPositions=[new Vector(this.boardX-1,this.boardY),new Vector(this.boardX+1,this.boardY)]
        for (let pos of adjacentPositions) {
            if (this.board.isOnBoard(pos) && this.board.pieceIsValid(this.board.tiles[pos.x][pos.y]) && this.board.tiles[pos.x][pos.y] instanceof Pawn && this.board.tiles[pos.x][pos.y].isBlack!=this.isBlack) {
                let tile=this.board.tiles[pos.x][pos.y];
                let direction = (tile.isBlack) ? 1 : -1;
                if (tile.boardY==tile.startBoardY+(2*direction)) {
                    if (tile.boardX==tile.startBoardX && tile.numMoves==1) {
                        console.log(this.board.fullMoves);
                        console.log(tile.movedAt);
                        if (this.board.fullMoves-tile.movedAt<=1) return new Move(pos.x,pos.y-direction,true,false,this.isBlack);
                    }
                } 
            }
        }

        // let temp=this.movedAt-this.board.fullMoves<1;
        //if (this.numMoves==1 && this.boardY==this.startBoardY+(2*direction) && this.boardX==this.startBoardX && this.movedAt-this.board.fullMoves<1) {
        //     let right=new Move(this.boardX+1,this.boardY,true,false,this.isBlack);
        //     let left=new Move(this.boardX-1,this.boardY,true,false,this.isBlack);

        //     if (this.board.isOnBoard(left)) {
        //         if (this.board.tiles[left.x][left.y] instanceof Pawn) enPassantMove=left;
        //     }

        //     if (this.board.isOnBoard(right)) {
        //         if (this.board.tiles[right.x][right.y] instanceof Pawn) enPassantMove=right;
        //     }
        // }

        // if (enPassantMove!=null) {
        //     enPassantMove.y+=direction;
        //     for (let move of currentMovementPoints) {
        //         if (move.x==enPassantMove.x && move.y==enPassantMove.y) return false;
        //     }
        //     return enPassantMove;
        // }



        return false;
    }

    getMovementPoints(dontCheckForCheckmate=false) {
        if (!this.validPiece) return [];
        let points=[];

        
        if (this.board.getIsinCheck(this.isBlack)) {

        }

        let point= (this.isBlack) ?  new Vector(0,1) : new Vector(0,-1);
        let direction= (this.isBlack) ? 1 : -1;
        
        let pointOnBoard=new Vector(point.x+this.boardX,point.y+this.boardY);
        if (this.board.isOnBoard(pointOnBoard) && !this.board.tiles[pointOnBoard.x][pointOnBoard.y] ) points.push(new Move(pointOnBoard.x,pointOnBoard.y,false,false,this.isBlack));

        if (this.numMoves==0) {
            let secondPoint=Object.assign({},pointOnBoard);
            secondPoint.y+=point.y;
            if (this.board.isOnBoard(secondPoint) && !(this.board.tiles[secondPoint.x][secondPoint.y] || this.board.tiles[pointOnBoard.x][pointOnBoard.y]) ) points.push(new Move(secondPoint.x,secondPoint.y,false,false,this.isBlack));
        }

        let diagonals=[new Vector(1,direction),new Vector(-1,direction)];
        for (let p of diagonals) {
            let newpos=new Vector(this.boardX+p.x,this.boardY+p.y);
            if (this.board.isOnBoard(newpos) && this.board.pieceIsValid(this.board.tiles[newpos.x][newpos.y]) && this.board.tiles[newpos.x][newpos.y].isBlack!=this.isBlack) {
                points.push(new Move(newpos.x,newpos.y,false,false,this.isBlack));
            }
        }

        let enPassantPos=this.canEnPassant(points);
        if (enPassantPos) points.push(enPassantPos);
        points=this.handlePinsAndChecks(points,dontCheckForCheckmate);
        return points
    }


    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        super(boardX,boardY,startBoardX,startBoardY,isBlack,board);
        this.piecePos=5;
        this.pieceNotation="p";
        if (!this.isBlack) this.pieceNotation=this.pieceNotation.toUpperCase();
    }
}

export class Rook extends Piece {
    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        super(boardX,boardY,startBoardX,startBoardY,isBlack,board);
        this.piecePos=4;
        this.pieceNotation="r";
        if (!this.isBlack) this.pieceNotation=this.pieceNotation.toUpperCase();
    }
    getMovementPoints(dontCheckForCheckmate=false,includeOwnPiecesForCapture=false) {
        if (!this.validPiece) return [];
        let points=[];

        let dxdyList=[[1,0],[-1,0],[0,1],[0,-1]];
        for (let [dx,dy] of dxdyList) {
            let pos=new Vector(this.boardX+dx,this.boardY+dy);
            while (this.board.isOnBoard(pos)) {

                let piece=this.board.tiles[pos.x][pos.y];
                if (this.board.pieceIsValid(piece)) {
                    /** @type {Piece} */
                    if (this.isBlack==piece.isBlack && !includeOwnPiecesForCapture) break;
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
        points=this.handlePinsAndChecks(points,dontCheckForCheckmate);
        return points;
    }

}

export class King extends Piece {
    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        super(boardX,boardY,startBoardX,startBoardY,isBlack,board);
        this.piecePos=0;
        this.pieceNotation="k";
        if (!this.isBlack) this.pieceNotation=this.pieceNotation.toUpperCase();
    }

    getCheckSrc(searchEvenIfNoCheck=false) {
        let res=this.isBlack ? this.board.checkInfo.isBlackInCheck : this.board.checkInfo.isWhiteInCheck;
        if (!res && !searchEvenIfNoCheck) return null;
        let srcs=[];
        let enemyMoves=this.board.getPlayerPiecesAndTheirMoves(!this.isBlack);
        for (let pair of enemyMoves) {
            let points=pair[1];
            const found=points.find(point => point.x==this.boardX && point.y == this.boardY);
            if (found) srcs.push([pair[0],found]);
        }
        return srcs;
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
                        if (this.board.pieceIsValid(this.board.tiles[checkPoint.x][checkPoint.y]) && this.board.tiles[checkPoint.x][checkPoint.y]!=this && checkPoint.x!=point.x) break;
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
                if (this.board.pieceIsValid(tile) && tile.isBlack!=this.isBlack) {
                    enemyMovePoints.push(...tile.getCapturePoints());
                }
            }
        }
        return enemyMovePoints;

    }

    getMovementPoints(dontCheckForCheckmate=false) {
        this.validPiece=false;
        let enemyMovePoints=this.getPointsAttackedByEnemy();
        this.validPiece=true;
        let points=[];

        let moves=this.getCanCastleMoves(enemyMovePoints);
        if (moves!=false) points.push(...moves);

        let pointsAroundKing=this.getPointsAroundKing();
        for (let point of pointsAroundKing) {
            const found=enemyMovePoints.length!=0 ? enemyMovePoints.find(other => other.x==point.x && other.y==point.y) : undefined;
            const alreadyAdded=points.length!=0 ? points.find(other => point.x==other.x && point.y==other.y) : undefined;
            if (found || alreadyAdded ||  (this.board.pieceIsValid(this.board.tiles[point.x][point.y]) && this.board.tiles[point.x][point.y].isBlack==this.isBlack)) continue;

            

            points.push(new Move(point.x,point.y,false,false,this.isBlack));
        }


        return points;
    }
}

export class Queen extends Rook {
    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        super(boardX,boardY,startBoardX,startBoardY,isBlack,board);
        this.piecePos=1;
        this.pieceNotation="q";
        if (!this.isBlack) this.pieceNotation=this.pieceNotation.toUpperCase();
    }

    getMovementPoints(dontCheckForCheckmate=false,includeOwnPiecesForCapture=false) {
        if (!this.validPiece) return [];
        let points=super.getMovementPoints(true);
        

        let dxdyList=[[1,1],[-1,-1],[1,-1],[-1,1]];
        for (let [dx,dy] of dxdyList) {
            let pos=new Vector(this.boardX+dx,this.boardY+dy);
            while (this.board.isOnBoard(pos)) {

                let piece=this.board.tiles[pos.x][pos.y];
                if (this.board.pieceIsValid(piece)) {
                    /** @type {Piece} */
                    if (this.isBlack==piece.isBlack  && !includeOwnPiecesForCapture) break;
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
        points=this.handlePinsAndChecks(points,dontCheckForCheckmate);
        return points;
    }
}

export class Knight extends Piece {
    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        super(boardX,boardY,startBoardX,startBoardY,isBlack,board);
        this.piecePos=3;
        this.pieceNotation="n";
        if (!this.isBlack) this.pieceNotation=this.pieceNotation.toUpperCase();
    }

    getMovementPoints(dontCheckForCheckmate=false,includeOwnPiecesForCapture=false) {
        if (!this.validPiece) return [];
        let points=[];

        let dxdyPoints=[[2,1],[-2,1],[2,-1],[-2,-1],[1,2],[-1,2],[1,-2],[-1,-2]]
        for (let [dx,dy] of dxdyPoints) {
            let pos=new Vector(this.boardX+dx,this.boardY+dy);
            if (this.board.isOnBoard(pos)) {
                let piece=this.board.tiles[pos.x][pos.y];
                if (this.board.pieceIsValid(piece)) {
                    /** @type {Piece} */
                    if (this.isBlack!=piece.isBlack || includeOwnPiecesForCapture) points.push(new Move(pos.x,pos.y,false,false,this.isBlack));
                }
                else points.push(new Move(pos.x,pos.y,false,false,this.isBlack));
            }
        }
        points=this.handlePinsAndChecks(points,dontCheckForCheckmate);
        return points;
    }
}

export class Bishop extends Piece {
    constructor(boardX,boardY,startBoardX,startBoardY,isBlack,board) {
        super(boardX,boardY,startBoardX,startBoardY,isBlack,board);
        this.piecePos=2;
        this.pieceNotation="b";
        if (!this.isBlack) this.pieceNotation=this.pieceNotation.toUpperCase();
    }

    getMovementPoints(dontCheckForCheckmate=false, includeOwnPiecesForCapture=false) {
        if (!this.validPiece) return [];
        let points=[];

        let dxdyList=[[1,1],[-1,-1],[1,-1],[-1,1]];
        for (let [dx,dy] of dxdyList) {
            let pos=new Vector(this.boardX+dx,this.boardY+dy);
            while (this.board.isOnBoard(pos)) {

                let piece=this.board.tiles[pos.x][pos.y];
                if (this.board.pieceIsValid(piece)) {
                    /** @type {Piece} */
                    if (this.isBlack==piece.isBlack  && !includeOwnPiecesForCapture) break;
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
        points=this.handlePinsAndChecks(points,dontCheckForCheckmate);
        return points;
    }
}