// daynight.js
let isDaytime = true; // Always true for development
let cycleProgress = 0;
const CYCLE_DURATION = 3000000; // Not used during development
let cycleStartOffset = 0; // Start at the beginning of the day

// Day-night cycle colors
const DAY_SKY_COLOR = 0x87ceeb;    // Light blue
const NIGHT_SKY_COLOR = 0x000033;   // Dark blue
const DAY_LIGHT_INTENSITY = 0.8;    // Slightly reduced for better shadow contrast
const NIGHT_LIGHT_INTENSITY = 0.2;  // Dim moonlight
const DAY_AMBIENT_INTENSITY = 0.3;  // Reduced for better shadow definition
const NIGHT_AMBIENT_INTENSITY = 0.1; // Dim ambient during night

// Shadow properties
const SHADOW_OPACITY_DAY = 0.5;     // Increased shadow opacity for better visibility
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
    directionalLight.position.set(50, 100, 50); // Adjusted for better humanoid lighting
    directionalLight.intensity = 1.0; // Balanced intensity
    
    // Increase ambient light for better visibility of humanoids
    if (ambientLight) {
        ambientLight.intensity = 0.4; // Increased ambient light for better visibility
    }
    
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.bias = -0.00001; // Much smaller bias
    directionalLight.shadow.normalBias = 0.005;
    directionalLight.shadow.radius = 1.5;
    directionalLight.shadow.darkness = 0.5; // Increased shadow darkness

    // Make sure ground/floor receives shadows
    const ground = scene.children.find(child => child.name === 'ground');
    if (ground) {
        ground.receiveShadow = true;
    }

    // Start the cycle
    updateDayNightCycle();
}

function updateDayNightCycle() {
    // Force daytime settings for development
    isDaytime = true;
    const transitionFactor = 1.0; // Always full day

    // Set sky color
    scene.background = new THREE.Color(DAY_SKY_COLOR);

    // Update lights
    if (directionalLight) {
        directionalLight.intensity = DAY_LIGHT_INTENSITY;
    }
    if (ambientLight) {
        ambientLight.intensity = DAY_AMBIENT_INTENSITY;
    }

    // Update shadow properties
    if (directionalLight) {
        directionalLight.shadow.opacity = SHADOW_OPACITY_DAY;
    }

    // Update any day/night dependent objects or behaviors
    window.characterSpeedMultiplier = CHARACTER_DAY_SPEED;
    window.characterColorIntensity = CHARACTER_DAY_COLOR;
}

// Export for use in other files
window.initDayNightCycle = initDayNightCycle;
window.isDaytime = isDaytime;
