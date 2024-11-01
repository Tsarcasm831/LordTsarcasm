// js/input.js
const Input = (() => {
    const keys = {};
    let isPointerLocked = false;

    function init() {
        window.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;
            if (e.key.toLowerCase() === 'e') {
                Interactions.interactWithDoor();
            } else if (e.key === '1') {
                Weapons.switchWeapon('pistol');
                HUD.update();
            } else if (e.key === '2') {
                Weapons.switchWeapon('shotgun');
                HUD.update();
            }
            // Konami code handling can be moved here or kept in editor.js
        });
        window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
        window.addEventListener('mousemove', (e) => {
            if (isPointerLocked) {
                Game.player.angle += e.movementX * 0.003;
            }
        });

        document.addEventListener('pointerlockchange', () => {
            isPointerLocked = document.pointerLockElement === canvas;
            if (!isPointerLocked) {
                keys['w'] = false;
                keys['a'] = false;
                keys['s'] = false;
                keys['d'] = false;
            }
        });

        document.addEventListener('pointerlockerror', () => {
            console.error('Pointer lock error');
        });
    }

    function getKeys() {
        return keys;
    }

    return {
        init,
        getKeys
    };
})();
