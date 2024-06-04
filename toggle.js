class Toggle extends HTMLElement {
    static observedAttributes=["width","height","is-on"];
    num=8;
    width=0;
    height=0;
    margin=0;  
    shadowroot=this.attachShadow({mode:"open"});
    constructor() {
        super();
        this.addEventListener("click",this.onclick);
    }

    

    attributeChangedCallback(name,oldValue,newValue) {
        this[name]=newValue;
    }

    connectedCallback() {
        console.log(this.width,this.height);
        this.margin=this.width/10;
        let sliderHeight=(this.height*0.75);
        let ymargin=(this.height-sliderHeight)/2;

        this.shadowRoot.innerHTML=`
        <style>
        input:checked +.switch {
            background-color: rgb(37, 160, 242);
        }
        input:checked +.switch .slider {
            transform: translateX(${(this.width)-(this.margin*2)- (this.height*0.75)}px);
        }
        
        input:not(:checked) + .switch {
            background-color: black;
        
        }
        
        .switch {
            position: relative;
            width: ${this.width};
            height: ${this.height};
        
            border-radius: 30%;
        }
        
        .sliderFull {
            display: flex;
            justify-content: flex-start;
            align-content:flex-start;
        }
        
        .switchbox {
            position: absolute;
            z-index: 1;
            cursor: pointer;
            opacity: 0;
            width: ${this.width};
            height: ${this.height};
        }
        
        .slider {
            position: relative;
            background-color: white;
            border-radius: 100px;
            width: ${this.height*0.75};
            height: ${this.height*0.75};
            top: ${ymargin}px;
            left: ${this.margin}px;
        }
        
            .newGame {
                display:flex ;
                position: fixed;
                z-index: 999;
                top: 0;
                left: 0;
            width: 100%;
                height: 100%;
                background-color: rgba(0,0, 0,0.3);
                justify-content: center;
            }

            .newGameBox {
                display: flex;
                width: 50%;
                height: 80%;
                background-color: dimgray;
                align-self: center;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                text-align: center;
            }
        </style>

        <div id="playerColor" class="sliderFull">
            <input type="checkbox" class="switchbox" id="slider-state">
            <div class="switch">
                <div class="slider"></div>
            </div>
        </div>
                `
    let elem=this.shadowRoot.getElementById("slider-state");
    elem.checked=false;
    elem.addEventListener("change",() => {
            this.setAttribute("is-on",elem.checked)
            this.dispatchEvent(new CustomEvent("toggle"));
        });
    }
}
window.customElements.define("slide-toggle",Toggle);