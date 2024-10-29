import LevelChunk from "/js/level-chunk.js";
import Utils from "/js/utils.js";
import Enemy from "/js/dynamic-enemy.js";
import Item from "/js/dynamic-item.js";
import Player from "/js/player.js";
import { LoseTileTypes, ItemTypes, TileSettings, BASE_RESOURCES, BACKGROUND_RESOURCES_HILLS } from "/js/constants.js";

export default class DynamicPlatformScene extends Phaser.Scene {
    preload() {
        Utils.loadResources(this, BASE_RESOURCES);
        Utils.loadResources(this, BACKGROUND_RESOURCES_HILLS);
    }
    create() {
        this.chunks = [];
        this.chunkColliders = [];
        this.chunkCliffColliders = [];
        this.enemies = [];
        this.enemyTileCollider = [];
        this.items = [];
        this.itemTileCollider = [];
        this.chunkWidth = TileSettings.TileChunkDefaultSize;
        this.activeChunks = TileSettings.TileChunkDefaultActive; 
        this.backgroundImages = Utils.createBackgrounds(this, 1, "background-hills", 0);
        Utils.createSceneAttributes(this, BASE_RESOURCES);
        this.player = new Player(this, this.chunkWidth, 10);
        this.generateInitialChunks();
        Utils.createAnimations(this);
        Utils.createSounds(this, BASE_RESOURCES);
        this.cameras.main.startFollow(this.player.sprite);
        this.updateCameraBounds();
    }
    generateInitialChunks() {
        for (let i = 0; i < (this.activeChunks * 3); i++) {
            this.createChunk(i * this.chunkWidth, 0, !(i < this.activeChunks));
        }
    }
    createChunk(x, y, showCliff) {
        const chunk = new LevelChunk(this, x, y, this.chunkWidth, showCliff);
        const groundLayer = chunk.create();
        this.chunks.push(chunk);
        this.chunkColliders.push(this.physics.add.collider(
            this.player.sprite, 
            chunk.groundLayer
        ));
        if (chunk.enemySpawnPoint) {
            this.createEnemy(this, chunk, chunk.enemySpawnPoint.x, chunk.enemySpawnPoint.y);
        }
        if (chunk.itemSpawnPoint) {
            this.createItem(this, chunk, chunk.itemSpawnPoint.x, chunk.itemSpawnPoint.y);
        }
        this.chunkCliffColliders.push(this.physics.add.overlap(
            this.player.sprite,
            chunk.loseLayer,
            (player, tile) => {
                this.loseSequenceActive = true;
                this.loseSequenceShatter = (tile.index === LoseTileTypes.Spikes);
            },
            (player, tile) => {
                return ([LoseTileTypes.Cliff, LoseTileTypes.Spikes].includes(tile.index));
            },
            this
        ));
        this.updateCameraBounds();
    }
    update(time, delta) {
        if (this.loseSequenceActive == false) {
            this.manageChunks();
            this.player.update();
        } else {
            this.player.sprite.setVelocityX(0);
            Utils.runLoseSequenceDynamic(this, 0, 5, !this.loseSequenceShatter); 
        }
        this.items.forEach(item => {
            item.update();
        });
        this.enemies.forEach(enemy => {
            enemy.update(time, delta);
        });
    }
    createEnemy(scene, chunk, x, y) {
        const enemy = new Enemy(chunk, scene, x, y);
        this.enemyTileCollider.push(enemy.spriteCollider);
        this.enemies.push(enemy);
    }
    createItem(scene, chunk, x, y) {
        const itemTypesArray = Object.keys(ItemTypes);
        const item = new Item(chunk, scene, x, y, ItemTypes[itemTypesArray[Math.floor(Math.random() * itemTypesArray.length)]]);
        this.itemTileCollider.push(item.spriteCollider);
        this.items.push(item);
    }
    removeOldestChunk() {
        if (this.chunks.length > (this.activeChunks * 2)) {
            const oldestChunk = this.chunks.shift();
            const oldestChunkValueX = oldestChunk.x;
            oldestChunk.destroy();
            this.physics.world.removeCollider(this.chunkColliders.shift());
            this.physics.world.removeCollider(this.chunkCliffColliders.shift());
            this.manageOldObjectData(this, oldestChunkValueX);
            this.updateCameraBounds();
        }
    }
    updateCameraBounds() {
        if (this.chunks.length > 0) {
            this.cameras.main.setBounds(0, 0, (this.chunks[this.chunks.length - 1].x + this.chunkWidth), (this.sys.game.config.height));
        }
    }
    manageChunks() {
        if (this.player.sprite.x > this.chunks[this.chunks.length - 1].x - this.chunkWidth) {
            this.createChunk(this.chunks[this.chunks.length - 1].x + this.chunkWidth, 0, true);
            this.removeOldestChunk();
        }
    }
    manageOldObjectData(chunkScene, oldChunkX) {
        let indexOfEnemies = 0;
        let indexOfItems = 0;
        for (let i = 0; i < chunkScene.enemies.length; i++) {
            if (chunkScene.enemies[i].sprite.x < (oldChunkX + TileSettings.TileChunkDefaultSize)) {
                indexOfEnemies++;
            }
        }
        for (let i = 0; i < chunkScene.items.length; i++) {
            if (chunkScene.items[i].sprite.x < (oldChunkX + TileSettings.TileChunkDefaultSize)) {
                indexOfItems++;
            }
        }
        for (let r = 0; r < indexOfItems; r++) {
            const latestItems = chunkScene.items.shift();
            chunkScene.physics.world.removeCollider(chunkScene.itemTileCollider.shift());
        }
        for (let r = 0; r < indexOfEnemies; r++) {
            const latestEnemy = chunkScene.enemies.shift();
            chunkScene.physics.world.removeCollider(chunkScene.enemyTileCollider.shift());
        }
    }
}
