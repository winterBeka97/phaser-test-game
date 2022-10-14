import Phaser from "phaser";
import sky from "./assets/sky.png";
import ground from "./assets/platform.png";
import star from "./assets/star.png";
import bomb from "./assets/bomb.png";
import monkey from "./assets/dude.png";

class MyGame extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    preload ()
    {
        this.load.image("sky", sky);
        this.load.image("ground", ground);
        this.load.image("star", star);
        this.load.image("bomb", bomb);
        
        this.load.spritesheet("dude", monkey, {
            frameWidth: 32,
            frameHeight: 48,
        });
    }
    
    create ()
    {   
        this.add.image(400,300,"sky");

        const platforms = this.physics.add.staticGroup();
        //platforms
        platforms.create(400, 568,"ground").setScale(2).refreshBody();
        platforms.create(500, 400, "ground");
        platforms.create(100,250,"ground");
        platforms.create(750,220,"ground");

        //player
        this.player = this.physics.add.sprite(100,450,"dude");
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        //collider
        this.physics.add.collider(this.player,platforms);

        //animation
        this.anims.create({
            key:"turn",
            frames: [{key:"dude", frame:4}],
            frameRate: 20
        });
        this.anims.create({
            key: "right",
            frames:this.anims.generateFrameNumbers("dude",{start: 5, end:8}),
            frameRate: 10,
            repeat: -1  
        });
        this.anims.create({
            key: "left",
            frames:this.anims.generateFrameNumbers("dude",{start: 0, end:3}),
            frameRate: 10,
            repeat: -1   
        });

        const stars = this.physics.add.group({
            key: "star",
            repeat: 11,
            setXY:{x:12,y:0,stepX:70},
        });

        stars.children.iterate(function(child){
            child.setBounceY(Phaser.Math.FloatBetween(0.4,0.8));
        });
        this.physics.add.collider(stars, platforms);
        this.physics.add.overlap(this.player, stars, collect, null, this);

        //bombs
        const bombs = this.physics.add.group();
        this.physics.add.collider(bombs,platforms);

        this.physics.add.collider(this.player,bombs, bombTouched, null, this);

        function bombTouched(player, bomb){
            this.physics.pause();
            this.player.setTint(0xff000);
            this.player.anims.play("turn");
        }

        //score text
        const scoreText = this.add.text(15,15,"score: 0",{
            fontSize: "35px",
            fill: "#fff",
        })

        let score = 0;

        //star collision
        function collect(player,star){
            star.disableBody(true,true);
            score+=5;
            scoreText.setText("score: "+score);

            if(stars.countActive(true) === 0){
                stars.children.iterate(function (child){
                    child.enableBody(true, child.x, 0, true, true);
                });
                
                var x = player.x<400 ? Phaser.Math.Between(400,800) : Phaser.Math.Between(0,400);

                const bomb = bombs.create(x,16,"bomb");
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-200,200),20);
            }
        }
    }   

    update()
    {
        const cursors = this.input.keyboard.createCursorKeys();
        if(cursors.left.isDown){
            this.player.setVelocity(-130);
            this.player.setVelocityY(30);
            this.player.setGravityY(550);
            this.player.anims.play("left",true);
            
        }else if(cursors.right.isDown){
            this.player.setVelocity(160);
            this.player.setVelocityY(30);
            this.player.setGravityY(550);
            this.player.anims.play("right",true);
        }else{
            this.player.setVelocityX(0);
            this.player.anims.play("turn");
        }

        if(cursors.up.isDown && this.player.body.touching.down){
            this.player.setVelocityY(-620);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics:{
        default: 'arcade',
        arcade: {
            gravity: { y: 350 },
            debug: true
        }
    },
    scene: MyGame
};

const game = new Phaser.Game(config);
