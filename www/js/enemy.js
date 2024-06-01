export default class Enemy {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sys = sys;
        const anims = scene.anims;
        anims.create({
            key: "enemy-idle",
            frames: anims.generateFrameNumbers("sprite-enemy-spike", { start: 0, end: 3 }),
            frameRate: 3,
            repeat: -1,
        });
        this.sprite = scene.physics.add.sprite(x, y, "sprite-enemy-spike", 1).setSize(8, 8);
        scene.physics.world.addCollider(this.sprite, scene.groundLayer);
    }
    update() {
        this.sprite.anims.play("enemy-idle", true);
    }
}
