import { THREE } from './libs.js';

// Biome definitions
export const biomes = {
    PLAINS: { color: 0x555555, treeColor: 0x333333, treeFrequency: 0.02 },
    FOREST: { color: 0x444444, treeColor: 0x222222, treeFrequency: 0.01 },
    DENSE_FOREST: { color: 0x333333, treeColor: 0x111111, treeFrequency: 0.005 },
    DESERT: { color: 0x777777, treeColor: 0x555555, treeFrequency: 0.005 },
    TUNDRA: { color: 0x999999, treeColor: 0x666666, treeFrequency: 0.01 },
    JUNGLE: { color: 0x666666, treeColor: 0x333333, treeFrequency: 0.005 },
    GROVE: { color: 0x888888, treeColor: 0x444444, treeFrequency: 0.01 },
    BEACH: { color: 0x666666, treeColor: 0x333333, treeFrequency: 0.005 }
};

// Mob class
export class Mob {
    constructor(position, type = 'Goblin') {
        this.type = type;
        this.name = type;
        this.mesh = this.createMesh(type);
        this.mesh.position.copy(position);
        scene.add(this.mesh);
        this.direction = new THREE.Vector3(
            (Math.random() - 0.5),
            0,
            (Math.random() - 0.5)
        ).normalize();

        // Set attributes based on mob type
        switch(type) {
            case 'Goblin':
                this.speed = 2.0;
                this.health = 50;
                break;
            case 'Orc':
                this.speed = 1.5;
                this.health = 80;
                break;
            case 'Troll':
                this.speed = 1.0;
                this.health = 120;
                break;
            default:
                this.speed = 1.0;
                this.health = 60;
        }

        this.createNameTag();
        this.createWalkingAnimation();
        this.createIdleAnimation(); // FIX: Initialize idle animation

        const skeletonHelper = new THREE.SkeletonHelper(this.mesh);
        scene.add(skeletonHelper);
        
        interactableObjects.push({ mesh: this.mesh, type: 'mob', health: this.health });

    }

    createIdleAnimation() {
    // No movement, but you can add slight breathing or idle motions
        const times = [0, 1];
        const values = [0, 0];

        const tracks = [
            new THREE.NumberKeyframeTrack('.bones[leftArm].rotation[x]', times, values),
            new THREE.NumberKeyframeTrack('.bones[rightArm].rotation[x]', times, values),
            new THREE.NumberKeyframeTrack('.bones[leftLeg].rotation[x]', times, values),
            new THREE.NumberKeyframeTrack('.bones[rightLeg].rotation[x]', times, values),
        ];

        const clip = new THREE.AnimationClip('idle', -1, tracks);
        this.idleAction = this.mixer.clipAction(clip);
        this.idleAction.loop = THREE.LoopRepeat;
        this.idleAction.play();
    }
    

    createMesh(type) {
        let mesh;
        switch(type) {
            case 'Goblin':
                mesh = this.createHumanoidMesh(0x00ff00); // Green color for Goblin
                this.speed = 2.0;
                this.health = 50;
                break;
            case 'Orc':
                mesh = this.createHumanoidMesh(0x0000ff); // Blue color for Orc
                this.speed = 1.5;
                this.health = 80;
                break;
            case 'Troll':
                mesh = this.createHumanoidMesh(0x800080); // Purple color for Troll
                this.speed = 1.0;
                this.health = 120;
                break;
            default:
                mesh = this.createHumanoidMesh(0xff0000); // Default Red color
                this.speed = 1.0;
                this.health = 60;
        }
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    createHumanoidMesh(color) {
    // Create a group to hold all parts of the mob
    const mobGroup = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.BoxGeometry(1, 2, 0.5);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1; // Position the body so that it sits on the ground
    mobGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffe0bd }); // Skin color
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    mobGroup.add(head);

    // Left Arm
    const leftArmGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const leftArmMaterial = new THREE.MeshPhongMaterial({ color: color });
    const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
    leftArm.position.set(-0.75, 1.5, 0);
    leftArm.rotation.z = Math.PI / 2;
    mobGroup.add(leftArm);

    // Right Arm
    const rightArmGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const rightArmMaterial = new THREE.MeshPhongMaterial({ color: color });
    const rightArm = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
    rightArm.position.set(0.75, 1.5, 0);
    rightArm.rotation.z = Math.PI / 2;
    mobGroup.add(rightArm);

    // Left Leg
    const leftLegGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const leftLegMaterial = new THREE.MeshPhongMaterial({ color: color });
    const leftLeg = new THREE.Mesh(leftLegGeometry, leftLegMaterial);
    leftLeg.position.set(-0.3, 0, 0);
    mobGroup.add(leftLeg);

    // Right Leg
    const rightLegGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const rightLegMaterial = new THREE.MeshPhongMaterial({ color: color });
    const rightLeg = new THREE.Mesh(rightLegGeometry, rightLegMaterial);
    rightLeg.position.set(0.3, 0, 0);
    mobGroup.add(rightLeg);

    // Apply shadows
    mobGroup.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    return mobGroup;
}


    createNameTag() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '20px Arial';
        context.fillStyle = 'white';
        context.fillText(this.name, 0, 20);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        this.nameTag = new THREE.Sprite(spriteMaterial);
        this.nameTag.scale.set(10, 5, 1);
        this.nameTag.position.set(0, 3, 0); // Position above the mob
        this.mesh.add(this.nameTag);
    }

    update(delta) {
        const moveDistance = this.speed * delta;
        const movement = this.direction.clone().multiplyScalar(moveDistance);
        this.mesh.position.add(movement);

        // Rotate the mob to face the movement direction
        this.mesh.lookAt(this.mesh.position.clone().add(this.direction));

        if (Math.random() < 0.02) {
            this.direction.set(
                (Math.random() - 0.5),
                0,
                (Math.random() - 0.5)
            ).normalize();
        }

        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(delta);
        }

        // Adjust the speed of the animation based on movement speed
        if (this.walkAction) {
            const speedFactor = this.speed / 2; // Adjust denominator as needed
            this.walkAction.timeScale = speedFactor;
        }

        const terrainHeight = getTerrainHeight(this.mesh.position.x, this.mesh.position.z);
        if (this.mesh.position.y < terrainHeight + 1) {
            this.mesh.position.y = terrainHeight + 1;
        }

        const distanceToPlayer = this.mesh.position.distanceTo(player.position);
        if (distanceToPlayer < 2) {
            this.attackPlayer();
        }

        // Update name tag orientation
        if (this.nameTag) {
            this.nameTag.lookAt(camera.position);
        }

        // Determine if mob is moving
        const isMoving = movement.lengthSq() > 0.0001;

        if (isMoving) {
            // Play walking animation
            if (this.walkAction && !this.walkAction.isRunning()) {
                this.idleAction.stop();
                this.walkAction.play();
            }
        } else {
            // Play idle animation
            if (this.idleAction && !this.idleAction.isRunning()) {
                this.walkAction.stop();
                this.idleAction.play();
            }
        }
        
        // Adjust the speed of the animation based on movement speed
        if (this.walkAction) {
            const speedFactor = this.speed / 2; // Adjust denominator as needed
            this.walkAction.timeScale = speedFactor;
        }
        // Rotate the mob to face movement direction
        if (this.direction.lengthSq() > 0.001) {
            const targetQuaternion = new THREE.Quaternion();
            targetQuaternion.setFromUnitVectors(
                new THREE.Vector3(0, 0, 1), // Assuming the mesh faces +Z
                this.direction.clone().normalize()
            );
            this.mesh.quaternion.slerp(targetQuaternion, 0.1); // Smooth rotation
        }
    }

    createWalkingAnimation() {
        const times = [0, 0.5, 1]; // Animation keyframe times

        // Left leg rotation around X-axis
        const leftLegRotationValues = [
            Math.PI / 4,  // Forward
            -Math.PI / 4, // Backward
            Math.PI / 4,  // Forward
        ];

        // Right leg rotation around X-axis (opposite of left leg)
        const rightLegRotationValues = [
            -Math.PI / 4, // Backward
            Math.PI / 4,  // Forward
            -Math.PI / 4, // Backward
        ];

        // Similar for arms but inverse
        const leftArmRotationValues = [
            -Math.PI / 4, // Backward
            Math.PI / 4,  // Forward
            -Math.PI / 4, // Backward
        ];

        const rightArmRotationValues = [
            Math.PI / 4,  // Forward
            -Math.PI / 4, // Backward
            Math.PI / 4,  // Forward
        ];

        // Create keyframe tracks
        const tracks = [];

        tracks.push(
            new THREE.NumberKeyframeTrack('.bones["leftLeg"].rotation[x]', times, leftLegRotationValues)
        );
        tracks.push(
            new THREE.NumberKeyframeTrack('.bones["rightLeg"].rotation[x]', times, rightLegRotationValues)
        );
        tracks.push(
            new THREE.NumberKeyframeTrack('.bones["leftArm"].rotation[x]', times, leftArmRotationValues)
        );
        tracks.push(
            new THREE.NumberKeyframeTrack('.bones["rightArm"].rotation[x]', times, rightArmRotationValues)
        );

        // Create the clip
        const clip = new THREE.AnimationClip('walk', -1, tracks);

        // Create the mixer and action
        this.mixer = new THREE.AnimationMixer(this.mesh);
        this.walkAction = this.mixer.clipAction(clip);
        this.walkAction.loop = THREE.LoopRepeat;
        this.walkAction.play();
    }


    attackPlayer() {
        health = Math.max(0, health - 0.1);
        updateStatusBars();
    }
}
