// enemyMovement.js

function moveEnemies(delta) {
    enemies.forEach((enemy) => {
        if (enemy.userData.isDead) return; 

        const threatRange = 100; 
        const attackRange = 10;  
        const enemySpeed = globalEnemySpeed;

        const directionToPlayer = new THREE.Vector3().subVectors(player.position, enemy.position);
        const distanceToPlayer = directionToPlayer.length();

        // **Check if enemy is within safe zone**
        const safeZoneRadius = 300; // Same as defined in your main code
        const distanceFromCenter = Math.sqrt(
            enemy.position.x * enemy.position.x + enemy.position.z * enemy.position.z
        );

        if (distanceFromCenter < safeZoneRadius) {
            // Enemy is inside the safe zone, push them back
            const directionAwayFromCenter = new THREE.Vector3(enemy.position.x, 0, enemy.position.z).normalize();
            enemy.position.add(directionAwayFromCenter.multiplyScalar(enemySpeed * delta * 10));
            return;
        }

        // Rest of your enemy movement logic
        if (distanceToPlayer <= attackRange) {
            enemy.isMoving = false;
            enemyAttackPlayer(enemy, delta);
        } else if (distanceToPlayer <= threatRange) {
            directionToPlayer.normalize();
            const oldPosition = enemy.position.clone();
            enemy.position.add(directionToPlayer.multiplyScalar(enemySpeed * delta * 10));

            // Collision detection with walls
            let collided = false;
            for (let wall of walls) {
                const enemyBox = new THREE.Box3().setFromObject(enemy);
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (enemyBox.intersectsBox(wallBox)) {
                    collided = true;
                    break;
                }
            }

            for (let wall of enemyWalls) {
                const enemyBox = new THREE.Box3().setFromObject(enemy);
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (enemyBox.intersectsBox(wallBox)) {
                    collided = true;
                    break;
                }
            }

            if (collided) {
                enemy.position.copy(oldPosition);
                enemy.isMoving = false;
            } else {
                enemy.isMoving = true;
                // Rotate enemy to face player
                const angle = Math.atan2(directionToPlayer.x, directionToPlayer.z);
                enemy.rotation.y = angle;
            }
        } else {
            // Wandering logic
            // (Existing wandering code)
        }

        animateHumanoid(enemy, delta);
    });
}
