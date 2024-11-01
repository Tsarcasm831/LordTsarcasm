// js/hud.js
const HUD = (() => {
    const healthValue = document.getElementById('health-value');
    const ammoValue = document.getElementById('ammo-value');
    const healthBar = document.querySelector('.health-bar');

    function update() {
        healthValue.textContent = Game.player.health + '%';
        if (Game.player.health <= 20) {
            healthBar.style.color = 'red';
        } else {
            healthBar.style.color = 'white';
        }
        const weapon = Weapons.getCurrentWeapon();
        if (weapon.ammo === Infinity) {
            ammoValue.textContent = '∞';
        } else {
            ammoValue.textContent = weapon.ammo;
        }
    }

    return {
        update
    };
})();
