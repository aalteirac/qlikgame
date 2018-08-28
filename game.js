var game;


var opt = {
    rotSpeed: 3,
    dropSpeed: 150,
    minSpace: 15
}

function setHS(sc){
    return new Promise((resolve,reject)=>{
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
               resolve(this.responseText);
            }
        }
        xhttp.open("GET", "sv.php?sc="+ encodeURI(sc), true);
        xhttp.send();
    })
}

function loadHS() {
    return new Promise((resolve,reject)=>{
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           resolve(this.responseText);
        }
        else if(this.readyState == 4 && this.status !== 200)
           resolve('None@0') ;
        };
        xhttp.open("GET", "scr.txt", true);
        xhttp.send();
    })
  }

window.onload = function() {

    var cfg = {
       type: Phaser.CANVAS,
       width: 750,
       height: 1334,
	   backgroundColor: 0x000000,
       scene: [ExtensionGame]
    };
    game = new Phaser.Game(cfg);
    window.focus()
    resize();
    window.addEventListener("resize", resize, false);
}

class ExtensionGame extends Phaser.Scene{

    constructor(){
        super("ExtensionGame");
    }

    preload(){
        this.load.image("q", "q.png");
        this.load.image("ext", "ext.png");
    }
    create(){
		this.lost = false;
        this.canDrop = true;
        this.extGroup = this.add.group();
        this.extension = this.add.sprite(game.config.width / 2, game.config.height / 5 * 4, "ext");
        this.target = this.add.sprite(game.config.width / 2, 400, "q");
        this.target.depth = 1;
        this.input.on("pointerdown", this.dropExtension, this);
		this.score = 0;
		if(!localStorage.getItem('mxscore'))
			localStorage.setItem('mxscore', "0");
    }
    dropExtension(){
		if(this.lost)
			this.scene.start("ExtensionGame")
        if(this.canDrop){
            this.canDrop = false;
            this.tweens.add({
                targets: [this.extension],
                y: this.target.y + this.target.width / 2,
                duration: opt.dropSpeed,
                callbackScope: this,
                onComplete: function(tween){
                    var hit = true;
                    var children = this.extGroup.getChildren();
                    for (var i = 0; i < children.length; i++){
                        if(Math.abs(Phaser.Math.Angle.ShortestBetween(this.target.angle, children[i].impactAngle)) < opt.minSpace){
                            hit = false;
                            break;
                        }
                    }
                    if(hit){
                        this.canDrop = true;
                        var ext = this.add.sprite(this.extension.x, this.extension.y, "ext");
                        ext.impactAngle = this.target.angle;
                        this.extGroup.add(ext);
                        this.extension.y = game.config.height / 5 * 4;
						this.score += 1;
                    }
                    else{
                        this.tweens.add({
                            targets: [this.extension],
                            y: game.config.height + this.extension.height,
                            rotation: 5,
                            duration: opt.dropSpeed * 4,
                            callbackScope: this,
                            onComplete: async function(tween){
								var width = this.cameras.main.width;
								var height = this.cameras.main.height;
                                var pl = this.score >1 ? 's' : '';
                                var bst=await loadHS();
                                var numScore=parseInt(bst.split("@")[1]);
								if(this.score > bst.split("@")[1]) {
                                    localStorage.setItem('mxscore', this.score);
                                    var best = prompt("Please enter your name", "Bill");
                                    bst=best +'@'+this.score;
                                    numScore=parseInt(bst.split("@")[1]);   
                                    await setHS(bst) ;
                                }   
								var scoreText = this.make.text({
									x: width / 2,
									y: height / 2 +50,
									text: `You have plugged ${this.score} extension${pl} on Sense... \r\n ...before trying to use an unsupported API...
									\r\n\r\n\r\nIF TOO MUCH CUSTOM TRY QLIK CORE :-)
									\r\n\r\n\r\nBEST SCORE: ${bst.replace('@',' ')} extension${numScore>1?'s':''}`,
									style: {
										font: '20px monospace',
										fill: '#ffffff'
									}
								});
								scoreText.setOrigin(0.5, 0.5);
								this.lost = true;
                            }
                        });
                    }
                }
            });
        }
    }

    update(){
        this.target.angle += opt.rotSpeed;
        var children = this.extGroup.getChildren();
        for (var i = 0; i < children.length; i++){
            children[i].angle += opt.rotSpeed;
            var radians = Phaser.Math.DegToRad(children[i].angle + 90);
            children[i].x = this.target.x + (this.target.width / 2) * Math.cos(radians);
            children[i].y = this.target.y + (this.target.width / 2) * Math.sin(radians) ;
        }

    }
}


function resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
