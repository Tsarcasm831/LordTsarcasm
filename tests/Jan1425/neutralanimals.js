// neutralanimals.js

// Function to add quadrupeds to the scene
function addQuadrupeds() {
    for (let i = 0; i < 5; i++) {
        let position = getRandomPositionOutsideTown(300, 1000);
        const quadruped = createQuadruped();
        quadruped.position.set(position.x, 0, position.z);
        quadrupeds.push(quadruped);
        scene.add(quadruped);
        quadruped.userData.homePosition = quadruped.position.clone();
        quadruped.userData.wanderRadius = 500; // Adjust as needed
    }
}

// Function to animate quadrupeds
function animateQuadruped(quadruped, delta) {
    if (quadruped.isMoving) {
        quadruped.animationTime += delta * quadruped.animationSpeed;
        const angle = Math.sin(quadruped.animationTime) * (Math.PI / 6);

        // Front Left & Back Right Legs
        quadruped.legs[0].rotation.x = angle;
        quadruped.legs[3].rotation.x = angle;

        // Front Right & Back Left Legs
        quadruped.legs[1].rotation.x = -angle;
        quadruped.legs[2].rotation.x = -angle;
    } else {
        // Reset leg rotations
        quadruped.legs.forEach(leg => leg.rotation.x = 0);
    }
}

// Function to move quadrupeds
function moveQuadrupeds(delta) {
    quadrupeds.forEach((quadruped) => {
        if (quadruped.userData.isDead) return; // Optional: Handle dead quadrupeds

        // Simple wandering logic
        if (!quadruped.isMoving) {
            // Decide to move or stay
            if (Math.random() < 0.01) { // 1% chance to start moving each frame
                quadruped.isMoving = true;
                // Random direction
                const angle = Math.random() * 2 * Math.PI;
                quadruped.userData.direction.set(Math.cos(angle), 0, Math.sin(angle));
                // Rotate to face direction
                quadruped.rotation.y = angle;
            }
        } else {
            // Move in the set direction
            const moveDistance = globalEnemySpeed * delta * 10; // Adjust speed as needed
            quadruped.position.add(quadruped.userData.direction.clone().multiplyScalar(moveDistance));

            // Clamp quadruped's position within -5000 to 5000 on both axes
            quadruped.position.x = Math.max(-5000, Math.min(5000, quadruped.position.x));
            quadruped.position.z = Math.max(-5000, Math.min(5000, quadruped.position.z));

            // Check for collisions with walls
            let collided = false;
            for (let wall of walls) {
                const quadrupedBox = new THREE.Box3().setFromObject(quadruped);
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (quadrupedBox.intersectsBox(wallBox)) {
                    collided = true;
                    break;
                }
            }

            for (let wall of enemyWalls) {
                const quadrupedBox = new THREE.Box3().setFromObject(quadruped);
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (quadrupedBox.intersectsBox(wallBox)) {
                    collided = true;
                    break;
                }
            }

            if (collided) {
                quadruped.position.sub(quadruped.userData.direction.clone().multiplyScalar(moveDistance));
                quadruped.isMoving = false;
            } else {
                quadruped.isMoving = true;
            }

            // Stop moving after a certain distance or time
            if (Math.random() < 0.005) { // 0.5% chance to stop moving each frame
                quadruped.isMoving = false;
            }
        }

        // Animate quadruped
        animateQuadruped(quadruped, delta);
    });
}
