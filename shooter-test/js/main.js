// js/main.js
const Game = (() => {
    let currentSkyboxName = 'sunny';
    let currentSkybox = Assets.skyboxImages[currentSkyboxName];
    let muzzleFlashSize = 0.3;
    let muzzleFlashXOffset = 48;
    let muzzleFlashYOffset = -101;
    let cellSize = 32;
    let editorOffsetX = 0;
    let editorOffsetY = 0;
    let maxEditorOffsetX = 0;
    let maxEditorOffsetY = 0;

    let openingDoors = [];
    let screenFlash = {
        duration: 200,
        opacity: 0,
        maxOpacity: 0.8,
        startTime: 0,
        isFlashing: false,
        trigger: function() {
            this.isFlashing = true;
            this.opacity = this.maxOpacity;
            this.startTime = Date.now();
        },
        update: function() {
            if (!this.isFlashing) return;
            const elapsedTime = Date.now() - this.startTime;
            if (elapsedTime >= this.duration) {
                this.isFlashing = false;
                this.opacity = 0;
                return;
            }
            this.opacity = this.maxOpacity * (1 - elapsedTime / this.duration);
        },
        draw: function(ctx, width, height) {
            if (!this.isFlashing) return;
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fillRect(0, 0, width, height);
        }
    };

    function resize() {
        const canvas = document.getElementById('game');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function updateDoors() {
        const currentTime = Date.now();
        openingDoors = openingDoors.filter(door => {
            const elapsed = currentTime - door.startTime;
            door.progress = elapsed / door.duration;

            if (door.progress >= 1) {
                Map.map[door.y][door.x] = 3; // Change to floor tile
                return false;
            }
            return true;
        });
    }

    function interactWithDoor() {
        const playerMapX = Math.floor(Game.player.x);
        const playerMapY = Math.floor(Game.player.y);

        const directions = [
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
        ];

        for (let dir of directions) {
            const checkX = playerMapX + dir.x;
            const checkY = playerMapY + dir.y;

            if (Map.map[checkY] && Map.map[checkY][checkX] === 'D') {
                openDoor(checkX, checkY);
                break;
            }
        }
    }

    function openDoor(x, y) {
        Assets.doorOpenSound.play();
        openingDoors.push({
            x: x,
            y: y,
            progress: 0,
            duration: 1000,
            startTime: Date.now()
        });
    }

    function castRay(angle) {
        let rayX = Game.player.x;
        let rayY = Game.player.y;
        let rayAngle = angle;

        const deltaX = Math.cos(rayAngle);
        const deltaY = Math.sin(rayAngle);

        let distance = 0;
        let hitX = 0;
        let wallType = 0;

        let isGoop = false;
        let goopDistance = 20;
        let isPool = false;
        let poolDistance = 20;

        while (distance < 20) {
            rayX += deltaX * 0.1;
            rayY += deltaY * 0.1;
            distance += 0.1;

            const mapX = Math.floor(rayX);
            const mapY = Math.floor(rayY);

            if (Map.map[mapY] && Map.map[mapY][mapX] === 1) {
                hitX = rayX % 1;
                wallType = Map.wallTypes[mapY][mapX];
                return { distance, hitX, wallType, doorProgress: 0, isGoop, goopDistance, isPool, poolDistance };
            }

            if (Map.map[mapY] && Map.map[mapY][mapX] === 'D') {
                hitX = rayX % 1;
                wallType = 'door';
                let doorProgress = 0;
                for (let door of openingDoors) {
                    if (door.x === mapX && door.y === mapY) {
                        doorProgress = door.progress;
                        break;
                    }
                }
                return { distance, hitX, wallType, doorProgress, isGoop, goopDistance, isPool, poolDistance };
            }
            if (Map.map[mapY] && Map.map[mapY][mapX] === 2) {
                isGoop = true;
                goopDistance = distance;
            }
            if (Map.map[mapY] && Map.map[mapY][mapX] === 4) {
                isPool = true;
                poolDistance = distance;
            }
        }

        return { distance, hitX, wallType, isGoop, goopDistance, isPool, poolDistance };
    }

    function update(deltaTime) {
        Player.update(deltaTime);
        AmmoCrates.update(Game.player);
        Enemies.updateAll(Game.player, deltaTime);
        Projectiles.update(deltaTime);

        if (Input.getKeys()['w']) {
            Game.player.velocityX += Math.cos(Game.player.angle) * Game.player.acceleration;
            Game.player.velocityY += Math.sin(Game.player.angle) * Game.player.acceleration;
        }
        if (Input.getKeys()['s']) {
            Game.player.velocityX -= Math.cos(Game.player.angle) * Game.player.acceleration;
            Game.player.velocityY -= Math.sin(Game.player.angle) * Game.player.acceleration;
        }
        if (Input.getKeys()['a']) {
            Game.player.velocityX += Math.cos(Game.player.angle - Math.PI / 2) * Game.player.acceleration;
            Game.player.velocityY += Math.sin(Game.player.angle - Math.PI / 2) * Game.player.acceleration;
        }
        if (Input.getKeys()['d']) {
            Game.player.velocityX += Math.cos(Game.player.angle + Math.PI / 2) * Game.player.acceleration;
            Game.player.velocityY += Math.sin(Game.player.angle + Math.PI / 2) * Game.player.acceleration;
        }

        const newX = Game.player.x + Game.player.velocityX;
        const newY = Game.player.y + Game.player.velocityY;

        if (Map.isPassable(Map.getTile(Math.floor(newY), Math.floor(Game.player.x)))) {
            Game.player.y = newY;
        }
        if (Map.isPassable(Map.getTile(Math.floor(Game.player.y), Math.floor(newX)))) {
            Game.player.x = newX;
        }

        screenFlash.update();
    }

    function gameLoop(timestamp) {
        if (!Game.lastFrameTime) Game.lastFrameTime = timestamp;
        const deltaTime = timestamp - Game.lastFrameTime;
        Game.lastFrameTime = timestamp;

        if (Game.player.health > 0) {
            update(deltaTime);
            updateDoors();
            Renderer.draw();
            screenFlash.draw(Renderer.ctx, canvas.width, canvas.height);
            requestAnimationFrame(gameLoop);
        } else {
            Renderer.ctx.fillStyle = 'red';
            Renderer.ctx.font = '48px monospace';
            Renderer.ctx.textAlign = 'center';
            Renderer.ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        }
    }

    function init() {
        Input.init();
        Editor.init();
        Map.updateWallTypes();
        Enemies.initialize(Map.map);
        AmmoCrates.initialize(Map.map);
        HUD.update();
        requestAnimationFrame(gameLoop);
    }

    return {
        init,
        player: Player.player,
        currentSkyboxName,
        currentSkybox,
        muzzleFlashSize,
        muzzleFlashXOffset,
        muzzleFlashYOffset,
        cellSize,
        editorOffsetX,
        editorOffsetY,
        maxEditorOffsetX,
        maxEditorOffsetY,
        lastFrameTime: 0
    };
})();

// Initialize the game after all scripts are loaded
window.onload = () => {
    Game.init();
};
