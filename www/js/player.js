import { SpeedTypes } from "/js/constants.js";

export default class Player {
    constructor(scene, x, y) {
        this.movementState = false;
        this.scene = scene;
        this.baseSpeed = SpeedTypes.Normal;
        this.fastSequenceActive = false;
        this.slowSequenceActive = false;
        this.sprite = scene.physics.add.sprite(x, y, "sprite-player", 0)
            .setMaxVelocity(this.baseSpeed, SpeedTypes.Jump)
            .setSize(6, 8)
            .setOffset(2, 0);
        const { ENTER, SPACE } = Phaser.Input.Keyboard.KeyCodes;
        this.keys = scene.input.keyboard.addKeys({ enter: ENTER, space: SPACE });
        this.canJump = true;
    }

    update() {
        const { keys, sprite } = this;
        if (sprite.body) {
            this.baseSpeed = this.fastSequenceActive ? SpeedTypes.Fast :
                             this.slowSequenceActive ? SpeedTypes.Slow : 
                             SpeedTypes.Normal;

            sprite.body.setMaxVelocity(this.baseSpeed, SpeedTypes.Jump);
            if (Phaser.Input.Keyboard.JustDown(keys.enter)) this.movementState = !this.movementState;
            sprite.body.setVelocityX(this.movementState ? this.baseSpeed : 0);
            
            if (sprite.body.blocked.down) {
                if (keys.space.isDown && (this.canJump || this.scene.hudJumpBarCounter > 0)) {
                    sprite.body.setVelocityY(-SpeedTypes.Jump);
                    this.scene.jumpSound.play();
                    this.canJump = false; 
                }
                if (this.scene.hudJumpBarCounter > 0) {
                    console.log("Enabled");
                    console.log(this.scene.hudJumpBarCounter);
                    console.log(sprite.body.velocity.y);
                }
                if (keys.space.isUp) { 
                    this.canJump = true; 
                }

                sprite.anims.play(sprite.body.velocity.x ? "player-run" : "player-idle", true);
            } else {
                sprite.anims.stop();
                sprite.setTexture("sprite-player", 9);
            }
        }
    }
}
