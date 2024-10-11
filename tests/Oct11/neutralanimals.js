// neutralanimals.js

// List of quadrupeds
let quadrupeds = [];

// Function to create a quadruped
function createQuadruped(color = 0x996633) {
    const group = new THREE.Group();

    // Body
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 5), bodyMaterial);
    body.position.y = 5;
    group.add(body);

    // Head
    const headMaterial = new THREE.MeshLambertMaterial({ color });
    const head = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), headMaterial);
    head.position.set(7, 7, 0);
    group.add(head);

    // Legs
    const legMaterial = new THREE.MeshLambertMaterial({ color });
    const legGeometry = new THREE.BoxGeometry(1, 5, 1);

    const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
    frontLeftLeg.position.set(4, 2.5, 2);
    group.add(frontLeftLeg);

    const frontRightLeg = frontLeftLeg.clone();
    frontRightLeg.position.z = -2;
    group.add(frontRightLeg);

    const backLeftLeg = frontLeftLeg.clone();
    backLeftLeg.position.x = -4;
    group.add(backLeftLeg);

    const backRightLeg = frontRightLeg.clone();
    backRightLeg.position.x = -4;
    group.add(backRightLeg);

    // Tail
    const tailMaterial = new THREE.MeshLambertMaterial({ color });
    const tail = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 5), tailMaterial);
    tail.position.set(-7, 6, 0);
    tail.rotation.y = Math.PI / 4;
    group.add(tail);

    // Animation properties
    group.isMoving = false;
    group.animationTime = 0;
    group.animationSpeed = 5.0;

    // Store legs for animation
    group.legs = [frontLeftLeg, frontRightLeg, backLeftLeg, backRightLeg];

    // Direction for movement
    group.userData.direction = new THREE.Vector3();

    // Assign user data
    group.userData.type = 'nonHostile';
    group.userData.name = 'Quadruped';

    return group;
}

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
