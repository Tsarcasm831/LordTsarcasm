// js/player.js
const Player = (() => {
    const player = {
        x: 1.5,
        y: 1.5,
        angle: 0,
        speed: 0.05,
        turnSpeed: 0.05,
        velocityX: 0,
        velocityY: 0,
        friction: 0.9,
        acceleration: 0.005,
        health: 100,
        ammo: 10,
        bobTime: 0,
        bobAmount: 0
    };

    function update(deltaTime) {
        player.velocityX *= player.friction;
        player.velocityY *= player.friction;

        // Update bobbing
        if (Math.abs(player.velocityX) > 0.001 || Math.abs(player.velocityY) > 0.001) {
            player.bobTime += deltaTime * 0.01;
            player.bobAmount = Math.sin(player.bobTime) * 5;
        } else {
            player.bobAmount *= 0.9;
        }

        // Movement logic handled in main.js or input.js
    }

    return {
        player,
        update
    };
})();
