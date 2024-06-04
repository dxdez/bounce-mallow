export default class Enemy {
    constructor(scene, x, y) {
        this.scene = scene;
        const anims = scene.anims;
        anims.create({
            key: "enemy-idle",
            frames: anims.generateFrameNumbers("sprite-enemy-spike", {
                start: 0,
                end: 3
            }),
            frameRate: 4,
            repeat: -1,
        });
        anims.create({
            key: "enemy-walk",
            frames: anims.generateFrameNumbers("sprite-enemy-spike", {
                start: 4,
                end: 7
            }),
            frameRate: 4,
            repeat: -1
        });
        this.sprite = scene.physics.add.sprite(x, y, "sprite-enemy-spike", 0).setSize(8, 8);
        this.scene.physics.world.addCollider(this.sprite, scene.groundLayer);
        this.isStationary = true;
        this.isForward = true;
    }
    update(time, delta) {
        if (!this.moveTimer) {
            this.moveTimer = time;
            this.sprite.anims.play("enemy-idle", true);
        }
        if (time - this.moveTimer > 3000) {
            this.moveTimer = time;
            //this.moveEnemy(this.sprite, delta);
            this.testEnemy(this.sprite, delta);
        }
    }

    testEnemy(sprite, delta) {
        if (this.isStationary === true) {
           this.isStationary = false;
           this.isForward = (this.isForward === true) ? false : true;
        } else {
           this.isStationary = true;
        }
        console.log("Move enemy " + Math.random());
        console.log("Stationary: " + this.isStationary);
        console.log("Forward: " + this.isForward);
    } 

    // run function recursively
    // function changes stationary and movement
    // movement direction changes each time it activates
    // physics activates on movement

    /*
    moveEnemy(sprite, delta) {
        const moveDistance = 24;
        const moveSpeed = 100;
        const moveDuration = (moveDistance / moveSpeed) * 1000;
        this.scene.tweens.add({
            targets: sprite,
            x: sprite.x + moveDistance,
            duration: moveDuration * delta,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: sprite,
                    x: sprite.x - moveDistance,
                    duration: moveDuration * delta,
                    onComplete: () => {
                        sprite.setPosition(sprite.body.position.x, sprite.body.position.y);
                        sprite.anims.play("enemy-idle", true);
                    }
                });
            }
        });
        sprite.anims.play("enemy-walk", true);
    }
    */


}
