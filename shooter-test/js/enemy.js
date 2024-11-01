// js/enemy.js
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 0.02;
        this.state = 'idle';
        this.deathAnimationTime = 0;
        this.deathAnimationDuration = 500;
        this.attackCooldown = 0;
        this.attackAnimationTime = 0;
        this.attackAnimationDuration = 600;
        this.health = 100;
        this.spriteFrameX = 0;
        this.spriteFrameY = 0;
        this.lastFrameTime = 0;
        this.animationSpeed = 100;
    }

    update(player, deltaTime) {
        if (this.state === 'dying') {
            this.deathAnimationTime += deltaTime;
            if (this.deathAnimationTime >= this.deathAnimationDuration) {
                this.state = 'dead';
            }
        } else if (this.state === 'attacking') {
            const currentTime = Date.now();
            if (currentTime - this.lastFrameTime > this.animationSpeed) {
                this.spriteFrameY++;
                if (this.spriteFrameY > 5) {
                    this.spriteFrameY = 0;
                    this.state = 'idle';
                    this.attackCooldown = 2000;
                    Projectiles.add(new Projectile(this.x, this.y, player.x, player.y));
                }
                this.lastFrameTime = currentTime;
            }
        } else {
            const dx = player.player.x - this.x;
            const dy = player.player.y - this.y;
            const distance = Math.hypot(dx, dy);

            if (distance < 5 && this.attackCooldown <= 0) {
                this.state = 'attacking';
                this.attackAnimationTime = 0;
                this.spriteFrameY = 0;
                this.lastFrameTime = Date.now();
            } else {
                let moveX = (dx / distance) * this.speed;
                let moveY = (dy / distance) * this.speed;

                const newX = this.x + moveX;
                const newY = this.y + moveY;

                if (Map.isPassable(Map.getTile(Math.floor(newY), Math.floor(this.x)))) {
                    this.y = newY;
                }

                if (Map.isPassable(Map.getTile(Math.floor(this.y), Math.floor(newX)))) {
                    this.x = newX;
                }

                this.attackCooldown -= deltaTime;
            }
        }
    }
}

const Enemies = (() => {
    let enemies = [];

    function initialize(map) {
        enemies = [];
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (Map.enemyMap[y][x]) {
                    enemies.push(new Enemy(x + 0.5, y + 0.5));
                }
            }
        }
    }

    function updateAll(player, deltaTime) {
        enemies.forEach(enemy => {
            enemy.update(player, deltaTime);
        });
        enemies = enemies.filter(enemy => enemy.state !== 'dead');
    }

    function getEnemies() {
        return enemies;
    }

    return {
        initialize,
        updateAll,
        getEnemies
    };
})();
