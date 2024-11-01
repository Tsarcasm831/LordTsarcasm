// js/projectile.js
class Projectile {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        const angle = Math.atan2(targetY - y, targetX - x);
        this.velocityX = Math.cos(angle) * 0.1;
        this.velocityY = Math.sin(angle) * 0.1;
        this.radius = 0.1;
        this.active = true;
        this.animationSpeed = 50;
        this.lastFrameTime = Date.now();
        this.frame = Math.floor(Math.random() * 4);
    }

    update(deltaTime) {
        this.x += this.velocityX;
        this.y += this.velocityY;

        if (!Map.isPassable(Map.getTile(Math.floor(this.y), Math.floor(this.x)))) {
            this.active = false;
        }

        const dx = Game.player.x - this.x;
        const dy = Game.player.y - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance < this.radius) {
            this.active = false;
            Game.player.health -= 10;
            if (Game.player.health < 0) Game.player.health = 0;
            HUD.update();
        }

        // Update frame
        const currentTime = Date.now();
        if (currentTime - this.lastFrameTime > this.animationSpeed) {
            this.frame = Math.floor(Math.random() * 4);
            this.lastFrameTime = currentTime;
        }
    }
}

const Projectiles = (() => {
    let projectiles = [];

    function add(projectile) {
        projectiles.push(projectile);
    }

    function update(deltaTime) {
        projectiles.forEach(projectile => {
            projectile.update(deltaTime);
        });
        projectiles = projectiles.filter(projectile => projectile.active);
    }

    function getProjectiles() {
        return projectiles;
    }

    return {
        add,
        update,
        getProjectiles
    };
})();
