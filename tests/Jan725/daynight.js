// daynight.js
let isDaytime = true;
let cycleProgress = 0; // 0 to 1 represents full cycle
const CYCLE_DURATION = 3000000; // 30 seconds in milliseconds

// Day-night cycle colors
const DAY_SKY_COLOR = 0x87ceeb;    // Light blue
const NIGHT_SKY_COLOR = 0x000033;   // Dark blue
const DAY_LIGHT_INTENSITY = 1.0;    // Bright sunlight
const NIGHT_LIGHT_INTENSITY = 0.2;  // Dim moonlight
const DAY_AMBIENT_INTENSITY = 0.4;  // Bright ambient during day
const NIGHT_AMBIENT_INTENSITY = 0.1; // Dim ambient during night

// Shadow properties
const SHADOW_OPACITY_DAY = 0.3;     // Lighter shadows during day
const SHADOW_OPACITY_NIGHT = 0.8;   // Darker shadows at night

// Character behavior constants
const CHARACTER_DAY_SPEED = 1.0;    // Normal movement speed during day
const CHARACTER_NIGHT_SPEED = 0.6;  // Slower movement at night
const CHARACTER_DAY_COLOR = 1.0;    // Normal color intensity
const CHARACTER_NIGHT_COLOR = 0.7;  // Dimmer color at night

// Store references to lights
let directionalLight;
let ambientLight;

function initDayNightCycle() {
    // Get existing lights from the scene
    directionalLight = scene.children.find(child => child instanceof THREE.DirectionalLight);
    ambientLight = scene.children.find(child => child instanceof THREE.AmbientLight);
    
    if (!directionalLight || !ambientLight) {
        console.error('Required lights not found in scene');
        return;
    }

    // Enable shadow mapping
    if (renderer) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Configure directional light for shadows
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.bias = -0.001;

    // Make sure ground/floor receives shadows
    const ground = scene.children.find(child => child.name === 'ground');
    if (ground) {
        ground.receiveShadow = true;
    }

    // Start the cycle
    updateDayNightCycle();
}

function updateDayNightCycle() {
    const currentTime = Date.now();
    cycleProgress = (currentTime % CYCLE_DURATION) / CYCLE_DURATION;

    // Use sine wave for smooth transition
    const transitionFactor = (Math.sin(cycleProgress * Math.PI * 2) + 1) / 2;

    // Update isDaytime based on transition factor
    isDaytime = transitionFactor > 0.5;

    // Interpolate sky color
    const skyColor = new THREE.Color(NIGHT_SKY_COLOR).lerp(
        new THREE.Color(DAY_SKY_COLOR),
        transitionFactor
    );
    scene.background = skyColor;

    // Update light intensities and shadow properties
    if (directionalLight) {
        directionalLight.intensity = THREE.MathUtils.lerp(
            NIGHT_LIGHT_INTENSITY,
            DAY_LIGHT_INTENSITY,
            transitionFactor
        );

        // Adjust shadow darkness based on time of day
        if (directionalLight.shadow) {
            directionalLight.shadow.opacity = THREE.MathUtils.lerp(
                SHADOW_OPACITY_NIGHT,
                SHADOW_OPACITY_DAY,
                transitionFactor
            );
        }

        // Update light position for dynamic shadows
        const lightAngle = cycleProgress * Math.PI * 2;
        directionalLight.position.x = Math.cos(lightAngle) * 100;
        directionalLight.position.y = Math.abs(Math.sin(lightAngle)) * 100 + 50;
        directionalLight.position.z = Math.sin(lightAngle) * 100;
        directionalLight.lookAt(0, 0, 0);
    }

    if (ambientLight) {
        ambientLight.intensity = THREE.MathUtils.lerp(
            NIGHT_AMBIENT_INTENSITY,
            DAY_AMBIENT_INTENSITY,
            transitionFactor
        );
    }

    // Update all humanoid characters in the scene
    scene.traverse((object) => {
        if (object.isHumanoid || (object.userData && object.userData.type === 'humanoid')) {
            // Adjust movement speed
            object.movementSpeed = THREE.MathUtils.lerp(
                CHARACTER_NIGHT_SPEED,
                CHARACTER_DAY_SPEED,
                transitionFactor
            );

            // Traverse all meshes in the humanoid
            object.traverse((node) => {
                if (node.isMesh && node.material) {
                    // Create a new material instance if we haven't yet
                    if (!node.material._isCustomMaterial) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            roughness: 0.7,
                            metalness: 0.0,
                            side: THREE.DoubleSide
                        });
                        node.material._isCustomMaterial = true;
                    }

                    // Update material color based on time of day
                    const intensity = THREE.MathUtils.lerp(
                        CHARACTER_NIGHT_COLOR,
                        CHARACTER_DAY_COLOR,
                        transitionFactor
                    );

                    // Store original color if not stored
                    if (!node.material._originalColor) {
                        node.material._originalColor = node.material.color.clone();
                    }

                    // Apply lighting effect
                    node.material.color.copy(node.material._originalColor);
                    node.material.color.multiplyScalar(intensity);
                }
            });
        }
    });

    requestAnimationFrame(updateDayNightCycle);
}

// Export for use in other files
window.initDayNightCycle = initDayNightCycle;
window.isDaytime = isDaytime;
