import {canvas, cursorX,cursorY,mouseIsClicked,getCursorPosRelToCanvas} from "./globals.js"
import {Queen,Rook,Bishop,Knight,Vector} from "./pieces.js"

export class Button {
    x=0;
    y=0;
    w=0;
    h=0;
    isClicked=false;
    img=null;
    imgW=0;
    imgH=0;
    imgX=0;
    imgY=0;
    /** @type {HTMLCanvasElement} */
    canvas=null;
    isReady=false;
    /** @type {CanvasRenderingContext2D} */
    ctx=null;
    clickFunction=null;
    params=[];


    onClick() {
        this.clickFunction(...this.params);
    }

    isHovered() {
        let pos= getCursorPosRelToCanvas();

        if (pos.x>this.x && pos.x<this.x+this.w && pos.y>this.y && pos.y<this.y+this.h) return true;
        return false;
    }

    onHover() {

    }

    render() {
        if (!this.isReady) return;
        this.ctx.drawImage(this.img,this.imgX,this.imgY,this.imgW,this.imgH,this.x,this.y,this.w,this.h);
    }

    update() {
        if (this.isHovered() && mouseIsClicked) {
            this.onClick();
            this.isClicked=true;
        }
        else this.isClicked=false;
    }


    constructor(canvas,imgPath,x,y,w,h, fn=()=>{}, params=[],imgX=0,imgY=0,imgW=null,imgH=null) {
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.imgX=imgX;
        this.imgY=imgY;
        this.imgW=imgW;
        this.imgH=imgH;
        this.canvas=canvas;
        this.ctx=canvas.getContext("2d");
        this.params=params;
        this.clickFunction=fn;
        this.img=new Image();
        this.img.src=imgPath;
        this.img.onload = () => {
            if (this.imgW==null) this.imgW=this.img.width;
            if (this.imgH==null) this.imgH=this.img.height;
            this.isReady=true;
        }
    }
}

export class PromotionMenu {
    waitingForMouseRelease=false;
    x=null;
    y=null;
    w=null;
    deleteThis=false;
    h=null;
    canvas=null;
    /** @type {CanvasRenderingContext2D} */
    ctx=null;
    piece=null;
    moveTo=null;
    ready=false;
    buttons=[];

    constructor(canvas,x,y,w,h,piece,moveTo) {
        this.x=x;
        this.itemSelected=false;
        this.h=h;
        this.w=w;
        this.y=y;
        this.canvas=canvas;
        this.moveTo=moveTo;
        this.moveTo.isPromotion=true;
        this.piece=piece;
        let i=0;
        let promoteTo=[Queen,Bishop,Knight,Rook];
        let img=new Image();
        img.src="pieces.png";
        this.ctx=canvas.getContext("2d");
        if (mouseIsClicked) this.waitingForMouseRelease=true;
        img.onload = () => {
            let imgW=img.width/6;
            let imgH=img.height/2;
            for (let buttonY=0; buttonY<this.h; buttonY+=this.h/4) {
                let imgX=(i+1)*imgW;
                let imgY=(piece.isBlack) ? imgH : 0;
                let button=new Button(canvas,"pieces.png",this.x,this.y+buttonY,this.w,this.h/4,this._promoteTo,[piece,promoteTo[i],this.moveTo],imgX,imgY,imgW,imgH);
                this.buttons.push(button);
                i++;
            }
            this.ready=true;
        }
        
    }

    _promoteTo(piece,to,nextMove) {
        piece=piece.promoteTo(to);
        piece.moveTo(nextMove);
    }
    
    render() {
        if (!this.ready) return;
        this.ctx.fillStyle="rgb(100,100,100)"
        this.ctx.fillRect(this.x,this.y,this.w,this.h);
        for (let button of this.buttons) {
            if (mouseIsClicked) {
                console.log("a");
            }
            if (button.isHovered()) {
                this.ctx.fillStyle="rgba(255,255,255,0.4)"
                this.ctx.fillRect(button.x,button.y,button.w,button.h);
            }
            if (button.isReady) button.render();
        }
        this.ctx.strokeStyle="rgb(0,0,0)";
        this.ctx.strokeRect(this.x,this.y,this.w,this.h);
    }

    update() {
        if (this.waitingForMouseRelease) if (!mouseIsClicked) this.waitingForMouseRelease=false;
        for (let button of this.buttons) {
            button.update();
            if (button.isClicked) {
                this.deleteThis=true;
                return;
            }
        }
        this.render();
        if (mouseIsClicked && !this.waitingForMouseRelease) this.deleteThis=true;
    }
}