// js/ammoCrate.js
class AmmoCrate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.collected = false;
    }
}

const AmmoCrates = (() => {
    let ammoCrates = [];

    function initialize(map) {
        ammoCrates = [];
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (Map.ammoCrateMap[y][x]) {
                    ammoCrates.push(new AmmoCrate(x + 0.5, y + 0.5));
                }
            }
        }
    }

    function update(player) {
        ammoCrates.forEach(crate => {
            if (crate.collected) return;
            const dx = player.player.x - crate.x;
            const dy = player.player.y - crate.y;
            const distance = Math.hypot(dx, dy);
            if (distance < 0.5) {
                crate.collected = true;
                Map.ammoCrateMap[Math.floor(crate.y)][Math.floor(crate.x)] = false;
                Weapons.addAmmo(10);
                HUD.update();
                ScreenFlash.trigger();
                Assets.ammoPickupSound.play();
            }
        });
    }

    function getCrates() {
        return ammoCrates;
    }

    return {
        initialize,
        update,
        getCrates
    };
})();
