import { initScene, scene, camera, renderer } from './gameCore.js';
import { updateStatusBars, initInventory } from './uiComponents.js';
import { Mob } from './entities.js';

let playerHealth = 100;
let playerHunger = 100;

function initGame() {
    initScene();
    initInventory();
    updateStatusBars(playerHealth, playerHunger);

    // Spawn initial mobs, setup animations, etc.
    const mob = new Mob(new THREE.Vector3(0, 0, 0));
    scene.add(mob.mesh);
}

initGame();

// Main render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
