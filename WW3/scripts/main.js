// main.js



function loadCartoonBoy() {
    const loader = new GLTFLoader();
    loader.load('/mnt/data/cartoon boy.glb', (gltf) => {
        const cartoonBoy = gltf.scene;

        // Set random position within the spawn room
        const randomX = (Math.random() - 0.5) * (roomWidth - 4);
        const randomZ = (Math.random() - 0.5) * (roomDepth - 4);
        cartoonBoy.position.set(randomX, FLOOR_HEIGHT, randomZ);

        // Scale the character to fit into the scene
        cartoonBoy.scale.set(0.5, 0.5, 0.5);

        // Add some idle animation if available
        if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(cartoonBoy);
            const idleAnimation = mixer.clipAction(gltf.animations[0]);
            idleAnimation.play();

            // Store mixer to update it during animation
            scene.userData.mixer = mixer;
        }

        // Add character to the scene
        scene.add(cartoonBoy);

        // Make the character interactive
        cartoonBoy.userData.isInteractive = true;
        cartoonBoy.userData.message = "Hi, I'm Cartoon Boy! Welcome to the spawn room!";
    });
}


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const roomWidth = 50;
const roomHeight = 25;
const roomDepth = 50;

const textureLoader = new THREE.TextureLoader();

const roomPrompts = {};
roomPrompts['0,0'] = "A alien weird universe";

const roomData = {};  
let currentRoomPrompt = "A alien weird universe";
let imagesLoaded = 0;
const totalImages = 5; 

let playerFrozen = true; // Start frozen
let speedUpgradeLevel = 0;
let pickupRadiusLevel = 0;
const BASE_SPEED = 0.15;
const BASE_PICKUP_RADIUS = 1;
const turnSpeed = 0.03;

let speed = BASE_SPEED * (1 + speedUpgradeLevel);

let lookUp = false;
let lookDown = false;
const maxPitch = Math.PI / 4; // 45 degrees in radians

// Distance threshold to show the shop popup
const interactionThreshold = 2.5;
let isShopOpen = false; // This keeps track of the shop’s open/close status

// This function checks the distance to open or close the shop popup
function checkShopInteraction() {
    if (currentShopCharacter && currentShopCharacter.mesh) {
        const distance = camera.position.distanceTo(currentShopCharacter.mesh.position);
        
        if (distance < interactionThreshold) {
            if (!isShopOpen) {
                openShop();
                displayShopCharacterMessage();
            }
        } else if (isShopOpen) {
            closeShop();
            hideStatusMessage();
        }
    }
}

// Define 10 unique shop characters with additional appearance properties
const shopCharacters = [
    {
        name: "Grizzle the Trader",
        message: "Looking for rare items?",
        bodyType: "muscular",
        clothingStyle: "armor",
        accessories: ["helmet", "shield"]
    },
    {
        name: "Fern the Forager",
        message: "Only the finest herbs here.",
        bodyType: "slim",
        clothingStyle: "robe",
        accessories: ["staff", "herbPouch"]
    },
    {
        name: "Zog the Alchemist",
        message: "Potions and brews for every need.",
        bodyType: "average",
        clothingStyle: "labCoat",
        accessories: ["beaker", "goggles"]
    },
    {
        name: "Mira the Mystic",
        message: "I foresee a deal in your future.",
        bodyType: "ethereal",
        clothingStyle: "cloak",
        accessories: ["crystalBall", "amulet"]
    },
    {
        name: "Tarn the Tinkerer",
        message: "Gadgets and gizmos aplenty!",
        bodyType: "stocky",
        clothingStyle: "toolBelt",
        accessories: ["wrench", "gearHelmet"]
    },
    {
        name: "Lira the Rogue",
        message: "Found these items... somewhere.",
        bodyType: "lean",
        clothingStyle: "leatherArmor",
        accessories: ["daggers", "mask"]
    },
    {
        name: "Bard the Bard",
        message: "Tunes and trinkets for the daring.",
        bodyType: "average",
        clothingStyle: "colorfulGarments",
        accessories: ["lyre", "hat"]
    },
    {
        name: "Zin the Warrior",
        message: "Arm yourself for the battles ahead.",
        bodyType: "muscular",
        clothingStyle: "heavyArmor",
        accessories: ["sword", "shield"]
    },
    {
        name: "Nara the Herbalist",
        message: "Essences and elixirs, fresh from the forest.",
        bodyType: "slim",
        clothingStyle: "flowingRobe",
        accessories: ["herbBelt", "potionVials"]
    },
    {
        name: "Slo the Smith",
        message: "Weapons forged in the finest flames.",
        bodyType: "stocky",
        clothingStyle: "smithApron",
        accessories: ["hammer", "anvil"]
    }
];

let currentShopCharacter = null; // Holds the current room's shop character
let currentShopTab = 'items'; // Default to items tab

// Function to spawn a detailed, human-like shop character with a grounded position and unique attributes
function spawnShopCharacter() {
    // Select a random character
    const randomCharacterIndex = Math.floor(Math.random() * shopCharacters.length);
    currentShopCharacter = shopCharacters[randomCharacterIndex];

    // Generate the character mesh with unique attributes
    createShopCharacterMesh(currentShopCharacter);

    // Load font and create name mesh
    const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new THREE.TextGeometry(currentShopCharacter.name, {
            font: font,
            size: 0.15,
            height: 0.02,
            curveSegments: 8,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position name directly above head
        textMesh.position.set(0, 2.2, 0);

        // Remove initial rotation to allow dynamic rotation towards camera
        // textMesh.rotation.y = Math.PI + 13; // Removed this line

        currentShopCharacter.nameMesh = textMesh;
        currentShopCharacter.mesh.add(textMesh); // Add name to character mesh
    });

    // Add character mesh to scene
    scene.add(currentShopCharacter.mesh);
}


// Updated createShopCharacterMesh function with realistic body shapes
function createShopCharacterMesh(character) {
    // Color palettes based on clothing styles (unchanged)
    const colorPalettes = {
        armor: { primary: 0x555555, secondary: 0xFFD700 },
        robe: { primary: 0x4B0082, secondary: 0xFFFFFF },
        labCoat: { primary: 0xAAAAAA, secondary: 0x000000 },
        cloak: { primary: 0x2E0854, secondary: 0x8A2BE2 },
        toolBelt: { primary: 0x654321, secondary: 0xFFA500 },
        leatherArmor: { primary: 0x8B4513, secondary: 0xDAA520 },
        colorfulGarments: { primary: 0xFF69B4, secondary: 0x00FFFF },
        heavyArmor: { primary: 0x000000, secondary: 0xFFD700 },
        flowingRobe: { primary: 0x7B68EE, secondary: 0x00FF7F },
        smithApron: { primary: 0xA0522D, secondary: 0xFF4500 }
    };

    // Select colors based on clothing style
    const primaryColor = colorPalettes[character.clothingStyle].primary;
    const secondaryColor = colorPalettes[character.clothingStyle].secondary;

    // Materials
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xFFE0BD, roughness: 0.8 });
    const clothingMaterial = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.6 });
    const accessoryMaterial = new THREE.MeshPhysicalMaterial({ color: secondaryColor, metalness: 0.3, roughness: 0.3 });
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x331a00, roughness: 1 });

    // Create character group
    const shopCharacter = new THREE.Group();

    // Body Type Scaling
    let bodyScale = 1;
    switch (character.bodyType) {
        case "muscular":
            bodyScale = 1.2;
            break;
        case "slim":
            bodyScale = 0.9;
            break;
        case "stocky":
            bodyScale = 1.1;
            break;
        case "ethereal":
            bodyScale = 1.0;
            break;
        case "lean":
            bodyScale = 0.85;
            break;
        default:
            bodyScale = 1.0;
    }

    // Create realistic body parts
    const torso = createTorsoMesh(character, clothingMaterial, bodyScale);
    const head = createHeadMesh(character, skinMaterial, bodyScale);
    const leftArm = createArmMesh(character, clothingMaterial, skinMaterial, bodyScale, 'left');
    const rightArm = createArmMesh(character, clothingMaterial, skinMaterial, bodyScale, 'right');
    const leftLeg = createLegMesh(character, clothingMaterial, skinMaterial, bodyScale, 'left');
    const rightLeg = createLegMesh(character, clothingMaterial, skinMaterial, bodyScale, 'right');

    // Add body parts to the character
    shopCharacter.add(torso);
    shopCharacter.add(head);
    shopCharacter.add(leftArm);
    shopCharacter.add(rightArm);
    shopCharacter.add(leftLeg);
    shopCharacter.add(rightLeg);

    // Hair Styles
    const hairStyles = ['short', 'long', 'bald', 'ponytail', 'mohawk'];
    const selectedHairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];

    // Add Hair
    addHair(head, hairMaterial, bodyScale, selectedHairStyle);

    // Facial Features
    const facialFeatures = ['beard', 'mustache', 'scar', 'eyePatch', 'glasses'];
    const selectedFeatures = facialFeatures.filter(() => Math.random() < 0.3); // 30% chance for each feature

    selectedFeatures.forEach(feature => {
        switch (feature) {
            case 'beard':
                addBeard(head, hairMaterial, bodyScale);
                break;
            case 'mustache':
                addMustache(head, hairMaterial, bodyScale);
                break;
            case 'scar':
                addScar(head, bodyScale);
                break;
            case 'eyePatch':
                addEyePatch(head, accessoryMaterial, bodyScale);
                break;
            case 'glasses':
                addGlasses(head, accessoryMaterial, bodyScale);
                break;
        }
    });

    // Eyes and mouth
    addEyesAndMouth(head, bodyScale);

    // Random accessory
    character.accessories.forEach(accessoryName => {
        switch (accessoryName) {
            case "helmet":
                addHelmet(head, accessoryMaterial, bodyScale);
                break;
            case "shield":
                addShield(leftArm, accessoryMaterial, bodyScale);
                break;
            case "staff":
                addStaff(rightArm, accessoryMaterial, bodyScale);
                break;
            case "herbPouch":
                addHerbPouch(torso, accessoryMaterial, bodyScale);
                break;
            case "beaker":
                addBeaker(rightArm, accessoryMaterial, bodyScale);
                break;
            case "goggles":
                addGoggles(head, accessoryMaterial, bodyScale);
                break;
            case "crystalBall":
                addCrystalBall(leftArm, accessoryMaterial, bodyScale);
                break;
            case "amulet":
                addAmulet(torso, accessoryMaterial, bodyScale);
                break;
            case "wrench":
                addWrench(rightArm, accessoryMaterial, bodyScale);
                break;
            case "gearHelmet":
                addGearHelmet(head, accessoryMaterial, bodyScale);
                break;
            case "daggers":
                addDaggers(leftArm, rightArm, accessoryMaterial, bodyScale);
                break;
            case "mask":
                addMask(head, accessoryMaterial, bodyScale);
                break;
            case "lyre":
                addLyre(rightArm, accessoryMaterial, bodyScale);
                break;
            case "hat":
                addHat(head, accessoryMaterial, bodyScale);
                break;
            case "sword":
                addSword(rightArm, accessoryMaterial, bodyScale);
                break;
            case "hammer":
                addHammer(rightArm, accessoryMaterial, bodyScale);
                break;
            case "anvil":
                addAnvil(shopCharacter, accessoryMaterial, bodyScale);
                break;
            case "potionVials":
                addPotionVials(torso, accessoryMaterial, bodyScale);
                break;
            default:
                console.warn(`Accessory "${accessoryName}" is not defined.`);
        }
    });

    // Add clothing layers
    addClothingLayers(torso, character, bodyScale);

    // Position the character in the room (unchanged)
    const charX = (Math.random() - 0.5) * (roomWidth - 4);
    const charZ = (Math.random() - 0.5) * (roomDepth - 4);
    shopCharacter.position.set(
        charX,
        FLOOR_HEIGHT - 0.6,
        charZ
    );

    // Make the character face the center of the room (0,0,0)
    shopCharacter.lookAt(new THREE.Vector3(0, shopCharacter.position.y, 0));

    // Add breathing animation only to the torso
    addBreathingAnimation(torso);

    // Attach character to currentShopCharacter
    currentShopCharacter.mesh = shopCharacter;
}

// Function to create a realistic torso mesh
function createTorsoMesh(character, material, scale) {
    // Create a more anatomically accurate torso using LatheGeometry
    const torsoPoints = [];
    torsoPoints.push(new THREE.Vector2(0.0, 0.0)); // Hip width
    torsoPoints.push(new THREE.Vector2(0.35 * scale, 0.0)); // Hip width
    torsoPoints.push(new THREE.Vector2(0.4 * scale, 0.4 * scale)); // Waist
    torsoPoints.push(new THREE.Vector2(0.35 * scale, 0.8 * scale)); // Ribcage
    torsoPoints.push(new THREE.Vector2(0.3 * scale, 1.2 * scale)); // Chest
    torsoPoints.push(new THREE.Vector2(0.25 * scale, 1.6 * scale)); // Shoulders
    torsoPoints.push(new THREE.Vector2(0.0, 1.6 * scale)); // Neck

    const torsoGeometry = new THREE.LatheGeometry(torsoPoints, 32);
    const torsoMesh = new THREE.Mesh(torsoGeometry, material);
    torsoMesh.position.y = -0.8 * scale; // Adjust position
    return torsoMesh;
}

// Function to create a realistic head mesh
function createHeadMesh(character, material, scale) {
    // Create a head using SphereGeometry and modify vertices for realism
    const headGeometry = new THREE.SphereGeometry(0.25 * scale, 32, 32);
    const headMesh = new THREE.Mesh(headGeometry, material);

    // Adjust vertices to create a more realistic head shape
    const vertices = headGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const y = vertices[i + 1];
        if (y > 0) {
            vertices[i + 1] *= 1.1; // Slightly elongate the upper part
        } else {
            vertices[i + 1] *= 0.9; // Slightly flatten the lower part
        }
    }
    headGeometry.attributes.position.needsUpdate = true;

    headMesh.position.set(0, 1.0 * scale, 0); // Adjust position
    return headMesh;
}

// Function to create a realistic arm mesh
function createArmMesh(character, clothingMaterial, skinMaterial, scale, side) {
    const armGroup = new THREE.Group();

    // Upper arm (shoulder to elbow)
    const upperArmGeometry = new THREE.CylinderGeometry(0.08 * scale, 0.1 * scale, 0.5 * scale, 32);
    const upperArm = new THREE.Mesh(upperArmGeometry, clothingMaterial);
    upperArm.position.y = -0.25 * scale;

    // Forearm (elbow to wrist)
    const forearmGeometry = new THREE.CylinderGeometry(0.07 * scale, 0.08 * scale, 0.5 * scale, 32);
    const forearm = new THREE.Mesh(forearmGeometry, skinMaterial);
    forearm.position.y = -0.5 * scale;

    upperArm.add(forearm);
    armGroup.add(upperArm);

    // Hand
    const handGeometry = new THREE.SphereGeometry(0.07 * scale, 16, 16);
    const hand = new THREE.Mesh(handGeometry, skinMaterial);
    hand.position.y = -0.25 * scale;
    forearm.add(hand);

    // Positioning the entire arm
    const shoulderY = 0.8 * scale;
    const shoulderX = (side === 'left' ? -0.35 : 0.35) * scale;
    armGroup.position.set(shoulderX, shoulderY, 0);

    // Random arm pose
    const armAngle = Math.random() * Math.PI / 6 - Math.PI / 12; // Between -15 and +15 degrees
    armGroup.rotation.z = armAngle;

    return armGroup;
}

// Function to create a realistic leg mesh
function createLegMesh(character, clothingMaterial, skinMaterial, scale, side) {
    const legGroup = new THREE.Group();

    // Upper leg (hip to knee)
    const upperLegGeometry = new THREE.CylinderGeometry(0.1 * scale, 0.12 * scale, 0.6 * scale, 32);
    const upperLeg = new THREE.Mesh(upperLegGeometry, clothingMaterial);
    upperLeg.position.y = -0.3 * scale;

    // Lower leg (knee to ankle)
    const lowerLegGeometry = new THREE.CylinderGeometry(0.08 * scale, 0.1 * scale, 0.6 * scale, 32);
    const lowerLeg = new THREE.Mesh(lowerLegGeometry, clothingMaterial);
    lowerLeg.position.y = -0.6 * scale;

    upperLeg.add(lowerLeg);
    legGroup.add(upperLeg);

    // Foot
    const footGeometry = new THREE.BoxGeometry(0.1 * scale, 0.05 * scale, 0.2 * scale);
    const foot = new THREE.Mesh(footGeometry, clothingMaterial);
    foot.position.set(0, -0.35 * scale, 0.1 * scale);
    lowerLeg.add(foot);

    // Positioning the entire leg
    const hipY = -0.8 * scale;
    const hipX = (side === 'left' ? -0.15 : 0.15) * scale;
    legGroup.position.set(hipX, hipY, 0);

    // Random leg pose
    const legAngle = Math.random() * Math.PI / 18 - Math.PI / 36; // Between -5 and +5 degrees
    legGroup.rotation.z = legAngle;

    return legGroup;
}


// Function to add hair with more realistic geometry
function addHair(head, material, scale, style) {
    switch (style) {
        case 'short':
            const shortHairGeometry = new THREE.BufferGeometry();
            // Define vertices and faces for short hair (e.g., using curves)
            // ... [Complex geometry code here]
            const shortHair = new THREE.Mesh(shortHairGeometry, material);
            shortHair.position.set(0, 0.05 * scale, 0);
            head.add(shortHair);
            break;
        case 'long':
            const longHairGeometry = new THREE.BufferGeometry();
            // Define vertices and faces for long flowing hair
            // ... [Complex geometry code here]
            const longHair = new THREE.Mesh(longHairGeometry, material);
            longHair.position.set(0, -0.25 * scale, 0);
            head.add(longHair);
            break;
        case 'ponytail':
            const ponytailGeometry = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 0.6 * scale, 16);
            const ponytail = new THREE.Mesh(ponytailGeometry, material);
            ponytail.position.set(0, -0.3 * scale, -0.1 * scale);
            head.add(ponytail);
            break;
        case 'mohawk':
            const mohawkGeometry = new THREE.BoxGeometry(0.05 * scale, 0.5 * scale, 0.05 * scale);
            const mohawk = new THREE.Mesh(mohawkGeometry, material);
            mohawk.position.set(0, 0.2 * scale, 0);
            head.add(mohawk);
            break;
        case 'bald':
            // No hair added
            break;
    }
}

// Function to add eyes and mouth with more detail
function addEyesAndMouth(head, scale) {
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.02 * scale, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.05 * scale, 0.05 * scale, 0.23 * scale);
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.05 * scale, 0.05 * scale, 0.23 * scale);
    head.add(rightEye);

    // Eyebrows
    const eyebrowGeometry = new THREE.BoxGeometry(0.06 * scale, 0.005 * scale, 0.01 * scale);
    const eyebrowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    leftEyebrow.position.set(-0.05 * scale, 0.08 * scale, 0.22 * scale);
    leftEyebrow.rotation.z = 0.1;
    head.add(leftEyebrow);

    const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    rightEyebrow.position.set(0.05 * scale, 0.08 * scale, 0.22 * scale);
    rightEyebrow.rotation.z = -0.1;
    head.add(rightEyebrow);

    // Nose
    const noseGeometry = new THREE.ConeGeometry(0.02 * scale, 0.05 * scale, 32);
    const noseMaterial = new THREE.MeshBasicMaterial({ color: 0xFFE0BD });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0, 0.25 * scale);
    nose.rotation.x = Math.PI / 2;
    head.add(nose);

    // Mouth
    const mouthGeometry = new THREE.BoxGeometry(0.08 * scale, 0.02 * scale, 0.01 * scale);
    const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0xFF6666 });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.05 * scale, 0.23 * scale);
    head.add(mouth);
}

// Function to add a beard with more realistic geometry
function addBeard(head, material, scale) {
    const beardGeometry = new THREE.BufferGeometry();
    // Define vertices and faces for a realistic beard shape
    // ... [Complex geometry code here]
    const beard = new THREE.Mesh(beardGeometry, material);
    beard.position.set(0, -0.15 * scale, 0);
    head.add(beard);
}


function addHair(head, material, scale, style) {
    switch (style) {
        case 'short':
            const shortHairGeometry = new THREE.SphereGeometry(0.32 * scale, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const shortHair = new THREE.Mesh(shortHairGeometry, material);
            shortHair.position.set(0, 0.05 * scale, 0);
            head.add(shortHair);
            break;
        case 'long':
            const longHairGeometry = new THREE.CylinderGeometry(0.3 * scale, 0.3 * scale, 0.5 * scale, 16, 1, true);
            const longHair = new THREE.Mesh(longHairGeometry, material);
            longHair.position.set(0, -0.25 * scale, 0);
            head.add(longHair);
            break;
        case 'ponytail':
            const ponytailGeometry = new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.4 * scale, 16);
            const ponytail = new THREE.Mesh(ponytailGeometry, material);
            ponytail.position.set(0, -0.5 * scale, -0.2 * scale);
            head.add(ponytail);
            break;
        case 'mohawk':
            const mohawkGeometry = new THREE.BoxGeometry(0.05 * scale, 0.4 * scale, 0.1 * scale);
            const mohawk = new THREE.Mesh(mohawkGeometry, material);
            mohawk.position.set(0, 0.2 * scale, 0);
            head.add(mohawk);
            break;
        case 'bald':
            // No hair added
            break;
    }
}





function addMustache(head, material, scale) {
    const mustacheGeometry = new THREE.BoxGeometry(0.2 * scale, 0.05 * scale, 0.05 * scale);
    const mustache = new THREE.Mesh(mustacheGeometry, material);
    mustache.position.set(0, -0.05 * scale, 0.31 * scale);
    head.add(mustache);
}

function addScar(head, scale) {
    const scarGeometry = new THREE.PlaneGeometry(0.1 * scale, 0.02 * scale);
    const scarMaterial = new THREE.MeshBasicMaterial({ color: 0x8B0000 });
    const scar = new THREE.Mesh(scarGeometry, scarMaterial);
    scar.position.set(0.05 * scale, 0.05 * scale, 0.31 * scale);
    scar.rotation.z = Math.PI / 4;
    head.add(scar);
}

function addEyePatch(head, material, scale) {
    const patchGeometry = new THREE.BoxGeometry(0.12 * scale, 0.08 * scale, 0.01 * scale);
    const patch = new THREE.Mesh(patchGeometry, material);
    patch.position.set(-0.1 * scale, 0.1 * scale, 0.31 * scale);
    head.add(patch);
}

function addGlasses(head, material, scale) {
    const frameGeometry = new THREE.TorusGeometry(0.05 * scale, 0.005 * scale, 8, 16);
    const leftLens = new THREE.Mesh(frameGeometry, material);
    leftLens.position.set(-0.1 * scale, 0.1 * scale, 0.3 * scale);
    leftLens.rotation.y = Math.PI / 2;
    head.add(leftLens);

    const rightLens = new THREE.Mesh(frameGeometry, material);
    rightLens.position.set(0.1 * scale, 0.1 * scale, 0.3 * scale);
    rightLens.rotation.y = Math.PI / 2;
    head.add(rightLens);

    const bridgeGeometry = new THREE.BoxGeometry(0.02 * scale, 0.01 * scale, 0.01 * scale);
    const bridge = new THREE.Mesh(bridgeGeometry, material);
    bridge.position.set(0, 0.1 * scale, 0.3 * scale);
    head.add(bridge);
}

function addClothingLayers(torso, character, scale) {
    if (character.clothingStyle === 'cloak') {
        const cloakGeometry = new THREE.ConeGeometry(0.6 * scale, 1.6 * scale, 32, 1, true);
        const cloakMaterial = new THREE.MeshStandardMaterial({ color: 0x2E0854, roughness: 0.7, side: THREE.DoubleSide });
        const cloak = new THREE.Mesh(cloakGeometry, cloakMaterial);
        cloak.position.set(0, -0.2 * scale, 0);
        cloak.rotation.x = Math.PI;
        torso.add(cloak);
    } else if (character.clothingStyle === 'armor') {
        const armorGeometry = new THREE.BoxGeometry(0.8 * scale, 1.0 * scale, 0.5 * scale);
        const armorMaterial = new THREE.MeshStandardMaterial({ color: 0xAAAAAA, metalness: 0.5, roughness: 0.4 });
        const armor = new THREE.Mesh(armorGeometry, armorMaterial);
        armor.position.set(0, 0.0 * scale, 0);
        torso.add(armor);
    }
    // Add other clothing styles as needed
}

function addBreathingAnimation(body) {
    const initialScaleY = body.scale.y;
    let breatheIn = true;
    const scaleFactor = 0.0005;

    function animateBreathing() {
        if (breatheIn) {
            body.scale.y += scaleFactor;
            if (body.scale.y >= initialScaleY + 0.02) breatheIn = false;
        } else {
            body.scale.y -= scaleFactor;
            if (body.scale.y <= initialScaleY - 0.02) breatheIn = true;
        }
    }

    // Store the animation function in the scene's user data
    scene.userData.shopCharacterTick = animateBreathing;
}

function addHelmet(head, material, scale) {
    const helmetGeometry = new THREE.SphereGeometry(0.35 * scale, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const helmet = new THREE.Mesh(helmetGeometry, material);
    helmet.position.set(0, 0.05 * scale, 0);
    head.add(helmet);
}

function addShield(arm, material, scale) {
    const shieldGeometry = new THREE.CircleGeometry(0.4 * scale, 32);
    const shield = new THREE.Mesh(shieldGeometry, material);
    shield.rotation.y = Math.PI / 2;
    shield.position.set(0, -0.35 * scale, 0);
    arm.add(shield);
}

function addStaff(hand, material, scale) {
    const staffGeometry = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 1.5 * scale, 16);
    const staff = new THREE.Mesh(staffGeometry, material);
    staff.position.set(0, -0.75 * scale, 0);
    hand.add(staff);
}

function addHerbPouch(torso, material, scale) {
    const pouchGeometry = new THREE.SphereGeometry(0.15 * scale, 16, 16);
    const pouch = new THREE.Mesh(pouchGeometry, material);
    pouch.position.set(-0.3 * scale, -0.4 * scale, 0);
    torso.add(pouch);
}

function addBeaker(hand, material, scale) {
    const beakerGeometry = new THREE.CylinderGeometry(0.05 * scale, 0.1 * scale, 0.3 * scale, 16);
    const beaker = new THREE.Mesh(beakerGeometry, material);
    beaker.position.set(0, -0.2 * scale, 0);
    hand.add(beaker);
}

function addGoggles(head, material, scale) {
    const frameGeometry = new THREE.TorusGeometry(0.05 * scale, 0.005 * scale, 8, 16);
    const leftLens = new THREE.Mesh(frameGeometry, material);
    leftLens.position.set(-0.1 * scale, 0.1 * scale, 0.3 * scale);
    leftLens.rotation.y = Math.PI / 2;
    head.add(leftLens);

    const rightLens = new THREE.Mesh(frameGeometry, material);
    rightLens.position.set(0.1 * scale, 0.1 * scale, 0.3 * scale);
    rightLens.rotation.y = Math.PI / 2;
    head.add(rightLens);

    const bridgeGeometry = new THREE.BoxGeometry(0.02 * scale, 0.01 * scale, 0.01 * scale);
    const bridge = new THREE.Mesh(bridgeGeometry, material);
    bridge.position.set(0, 0.1 * scale, 0.3 * scale);
    head.add(bridge);
}

function addCrystalBall(hand, material, scale) {
    const crystalGeometry = new THREE.SphereGeometry(0.1 * scale, 16, 16);
    const crystal = new THREE.Mesh(crystalGeometry, material);
    crystal.position.set(0, -0.2 * scale, 0);
    hand.add(crystal);
}

function addAmulet(torso, material, scale) {
    const amuletGeometry = new THREE.TorusGeometry(0.1 * scale, 0.02 * scale, 16, 100);
    const amulet = new THREE.Mesh(amuletGeometry, material);
    amulet.position.set(0, 0.9 * scale, 0.3 * scale);
    torso.add(amulet);
}

function addWrench(hand, material, scale) {
    const wrenchGeometry = new THREE.BoxGeometry(0.2 * scale, 0.05 * scale, 0.05 * scale);
    const wrench = new THREE.Mesh(wrenchGeometry, material);
    wrench.position.set(0, -0.25 * scale, 0);
    wrench.rotation.z = Math.PI / 4;
    hand.add(wrench);
}

function addGearHelmet(head, material, scale) {
    const gearGeometry = new THREE.TorusGeometry(0.2 * scale, 0.05 * scale, 16, 100);
    const gearHelmet = new THREE.Mesh(gearGeometry, material);
    gearHelmet.position.set(0, 0.05 * scale, 0);
    gearHelmet.rotation.x = Math.PI / 2;
    head.add(gearHelmet);
}

function addDaggers(leftHand, rightHand, material, scale) {
    const daggerGeometry = new THREE.BoxGeometry(0.05 * scale, 0.5 * scale, 0.02 * scale);

    const dagger1 = new THREE.Mesh(daggerGeometry, material);
    dagger1.position.set(0, -0.25 * scale, 0);
    leftHand.add(dagger1);

    const dagger2 = new THREE.Mesh(daggerGeometry, material);
    dagger2.position.set(0, -0.25 * scale, 0);
    rightHand.add(dagger2);
}

function addMask(head, material, scale) {
    const maskGeometry = new THREE.BoxGeometry(0.3 * scale, 0.15 * scale, 0.05 * scale);
    const mask = new THREE.Mesh(maskGeometry, material);
    mask.position.set(0, 0.0 * scale, 0.35 * scale);
    head.add(mask);
}

function addLyre(hand, material, scale) {
    const lyreGeometry = new THREE.TorusGeometry(0.15 * scale, 0.02 * scale, 16, 100);
    const lyre = new THREE.Mesh(lyreGeometry, material);
    lyre.position.set(0, -0.2 * scale, 0);
    hand.add(lyre);
}

function addHat(head, material, scale) {
    const hatGeometry = new THREE.ConeGeometry(0.2 * scale, 0.3 * scale, 32);
    const hat = new THREE.Mesh(hatGeometry, material);
    hat.position.set(0, 0.35 * scale, 0);
    head.add(hat);
}

function addSword(hand, material, scale) {
    const bladeGeometry = new THREE.BoxGeometry(0.05 * scale, 0.8 * scale, 0.02 * scale);
    const blade = new THREE.Mesh(bladeGeometry, material);
    blade.position.set(0, -0.4 * scale, 0);

    const hiltGeometry = new THREE.BoxGeometry(0.1 * scale, 0.02 * scale, 0.02 * scale);
    const hilt = new THREE.Mesh(hiltGeometry, material);
    hilt.position.set(0, 0, 0);

    const sword = new THREE.Group();
    sword.add(blade);
    sword.add(hilt);

    hand.add(sword);
}

function addHammer(hand, material, scale) {
    const handleGeometry = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 0.8 * scale, 16);
    const handle = new THREE.Mesh(handleGeometry, material);
    handle.position.set(0, -0.4 * scale, 0);

    const headGeometry = new THREE.BoxGeometry(0.2 * scale, 0.1 * scale, 0.1 * scale);
    const head = new THREE.Mesh(headGeometry, material);
    head.position.set(0, -0.8 * scale, 0);

    const hammer = new THREE.Group();
    hammer.add(handle);
    hammer.add(head);

    hand.add(hammer);
}

function addAnvil(sceneGroup, material, scale) {
    const anvilGeometry = new THREE.BoxGeometry(0.5 * scale, 0.2 * scale, 0.3 * scale);
    const anvil = new THREE.Mesh(anvilGeometry, material);
    anvil.position.set(0, -1.0 * scale, 0.2 * scale);
    sceneGroup.add(anvil);
}

function addPotionVials(torso, material, scale) {
    const vialGeometry = new THREE.SphereGeometry(0.05 * scale, 16, 16);
    const vial1 = new THREE.Mesh(vialGeometry, material);
    vial1.position.set(0.2 * scale, -0.2 * scale, 0.3 * scale);
    torso.add(vial1);

    const vial2 = new THREE.Mesh(vialGeometry, material);
    vial2.position.set(-0.2 * scale, -0.2 * scale, 0.3 * scale);
    torso.add(vial2);
}



// Check if the player is within interaction range of the shop character
function checkShopInteraction() {
    if (currentShopCharacter && currentShopCharacter.mesh) {
        const distance = camera.position.distanceTo(currentShopCharacter.mesh.position);

        if (distance < interactionThreshold) {
            if (!isShopOpen) {
                openShop();
                displayShopCharacterMessage();
            }
        } else {
            if (isShopOpen) {
                closeShop();
                hideStatusMessage();
            }
        }
    }
}


// Display the shop character's unique message to the player
function displayShopCharacterMessage() {
    if (currentShopCharacter) {
        showStatusMessage(`${currentShopCharacter.name}: "${currentShopCharacter.message}"`);
    }
}

function createKeyMesh() {
    const keyGroup = new THREE.Group();

    // Shaft of the key
    const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const shaft = new THREE.Mesh(shaftGeometry, keyMaterial);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = 0.4;
    keyGroup.add(shaft);

    // Bow of the key (handle)
    const bowGeometry = new THREE.TorusGeometry(0.2, 0.05, 8, 16);
    const bow = new THREE.Mesh(bowGeometry, keyMaterial);
    bow.position.x = 0;
    keyGroup.add(bow);

    // Teeth of the key
    const teethGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.05);
    const teeth = new THREE.Mesh(teethGeometry, keyMaterial);
    teeth.position.x = 0.8;
    teeth.position.y = -0.3;
    keyGroup.add(teeth);

    return keyGroup;
}

function showStatusMessage(message) {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.style.display = 'block';
}
    
function hideStatusMessage() {
    document.getElementById('status-message').style.display = 'none';
}
    
function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        document.getElementById('loading-screen').style.display = 'none';
        playerFrozen = false;
        hideStatusMessage();
    }
}
    
const roomTextures = {};
    
function loadRoomTextures(roomPrompt) {
    document.getElementById('loading-screen').style.display = 'flex'; 
    playerFrozen = true;
    showStatusMessage('Loading new room...');
    imagesLoaded = 0; 
        
    const wallTexture = textureLoader.load('https://image.pollinations.ai/prompt/the%20wall%20texture%20to%20' + encodeURIComponent(roomPrompt), checkAllImagesLoaded);
    const floorTexture = textureLoader.load('https://image.pollinations.ai/prompt/the%20floor%20to%20' + encodeURIComponent(roomPrompt), checkAllImagesLoaded);
    const ceilingTexture = textureLoader.load('https://image.pollinations.ai/prompt/the%20ceiling%20to%20' + encodeURIComponent(roomPrompt), checkAllImagesLoaded);
    const doorTexture1 = textureLoader.load('https://image.pollinations.ai/prompt/a%20door%20to%20' + encodeURIComponent(roomPrompt), checkAllImagesLoaded);
    const doorTexture2 = textureLoader.load('https://image.pollinations.ai/prompt/another%20door%20to%20' + encodeURIComponent(roomPrompt), checkAllImagesLoaded);
        
    return {
        wall: wallTexture,
        floor: floorTexture,
        ceiling: ceilingTexture,
        door1: doorTexture1,
        door2: doorTexture2
    };
}
    
roomTextures['0,0'] = loadRoomTextures("A alien weird universe");
    
let playerKeys = 100;
let currentKeys = [];
let isJumping = false;
let yVelocity = 0;
const GRAVITY = -0.09;
const JUMP_POWER = 1.0;
const FLOOR_HEIGHT = 2; // Ensure this matches the character's grounding

const keyGeometry = new THREE.SphereGeometry(0.3);
const keyMaterial = new THREE.MeshPhongMaterial({color: 0xFFD700});
const landmineGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
const landmineMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
let currentLandmines = [];
let lastSavePosition = { x: 0, y: 0 };

let inventory = new Array(5).fill(null);
let selectedSlot = 0;
let activeKeyMagnet = false;

let isDragging = false;
const mapOffset = { x: 0, y: 0 };
const dragStart = { x: 0, y: 0 };

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playKeyCollectSound() {
    if (!playSfx) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 523.25; // C5 note
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playSaveRoomSound() {
    if (!playSfx) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'triangle'; // Different waveform for a distinctive sound
    oscillator.frequency.value = 880; // A5 note

    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

function flashScreenGold() {
    const flashDiv = document.createElement('div');
    flashDiv.style.position = 'fixed';
    flashDiv.style.top = '0';
    flashDiv.style.left = '0';
    flashDiv.style.width = '100%';
    flashDiv.style.height = '100%';
    flashDiv.style.backgroundColor = 'rgba(255, 215, 0, 0.5)';
    flashDiv.style.zIndex = '1000';
    document.body.appendChild(flashDiv);

    setTimeout(() => {
        flashDiv.style.transition = 'opacity 1s';
        flashDiv.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(flashDiv);
        }, 1000);
    }, 100);
}

function updateKeyDisplay() {
    const keyDisplay = document.getElementById('key-display');
    keyDisplay.textContent = `Keys: ${playerKeys}`;
}

function spawnKey() {
    const roomKey = `${roomPosition.x},${roomPosition.y}`;
    if (!roomData[roomKey]) {
        roomData[roomKey] = {
            keyPositions: [],
            visited: false
        };
    }
    if (!roomData[roomKey].visited) {
        const numberOfKeys = 2 + Math.floor(Math.random() * 5);
        for (let i = 0; i < numberOfKeys; i++) {
            const isFloorKey = Math.random() < 0.5;
            roomData[roomKey].keyPositions.push({
                x: (Math.random() - 0.5) * (roomWidth - 4),
                y: isFloorKey ? 1 : (2 + (Math.random() * 4)),
                z: (Math.random() - 0.5) * (roomDepth - 4)
            });
        }
        roomData[roomKey].visited = true;
    }
    currentKeys.forEach(key => scene.remove(key));
    currentKeys = [];
    roomData[roomKey].keyPositions.forEach(pos => {
        const key = createKeyMesh();
        key.position.set(pos.x, pos.y, pos.z);
        scene.add(key);
        currentKeys.push(key);
    });
}

function spawnLandmines() {
    const roomKey = `${roomPosition.x},${roomPosition.y}`;
    if (!roomData[roomKey].landminePositions) {
        roomData[roomKey].landminePositions = [];
        const numberOfLandmines = Math.floor(Math.random() * 3); // Up to 2 landmines per room
        for (let i = 0; i < numberOfLandmines; i++) {
            roomData[roomKey].landminePositions.push({
                x: (Math.random() - 0.5) * (roomWidth - 4),
                y: 0.1,
                z: (Math.random() - 0.5) * (roomDepth - 4)
            });
        }
    }

    currentLandmines.forEach(mine => scene.remove(mine));
    currentLandmines = [];

    roomData[roomKey].landminePositions.forEach(pos => {
        const mine = new THREE.Mesh(landmineGeometry, landmineMaterial);
        mine.position.set(pos.x, pos.y, pos.z);
        scene.add(mine);
        currentLandmines.push(mine);
    });
}

function triggerDeath() {
    playerFrozen = true;
    document.getElementById('death-screen').style.display = 'flex';
}

document.getElementById('respawn-button').addEventListener('click', () => {
    document.getElementById('death-screen').style.display = 'none';
    playerFrozen = false;
    enterRoomAtPosition(lastSavePosition.x, lastSavePosition.y);
});

function enterRoomAtPosition(x, y) {
    currentKeys.forEach(key => scene.remove(key));
    currentKeys = [];
    currentLandmines.forEach(mine => scene.remove(mine));
    currentLandmines = [];

    if (currentShopCharacter && currentShopCharacter.mesh) {
        scene.remove(currentShopCharacter.mesh);
        if (currentShopCharacter.nameMesh) {
            scene.remove(currentShopCharacter.nameMesh); // Remove name mesh as well
        }
        currentShopCharacter = null;
    }

    roomPosition.x = x;
    roomPosition.y = y;

    loadRoom();

    spawnKey();
    spawnLandmines();
    spawnShopCharacter(); // Spawn the enhanced shop character

    camera.position.set(0, FLOOR_HEIGHT, 0);
    document.getElementById('room-position').textContent = `Room (${roomPosition.x}, ${roomPosition.y})`;
}

function loadRoom() {
    const roomKey = `${roomPosition.x},${roomPosition.y}`;
    if (!roomPrompts[roomKey]) {
        currentRoomPrompt = generateRandomRoomPrompt();
        roomPrompts[roomKey] = currentRoomPrompt;
        playerFrozen = true;
        showStatusMessage('Loading new room...');
        roomTextures[roomKey] = loadRoomTextures(currentRoomPrompt);
    } else {
        currentRoomPrompt = roomPrompts[roomKey];
        if (!roomTextures[roomKey]) {
            playerFrozen = true;
            showStatusMessage('Loading new room...');
            roomTextures[roomKey] = loadRoomTextures(currentRoomPrompt);
        }
    }

    if (roomTextures[roomKey]) {
        updateRoomMaterials(roomTextures[roomKey]);
    }
    updateRoomDisplay();
    if (isSaveRoom()) {
        lastSavePosition = { x: roomPosition.x, y: roomPosition.y };
        playSaveRoomSound();
        flashScreenGold();
    }
}

function isSaveRoom() {
    return (roomPosition.x % 20 === 0 && roomPosition.y % 20 === 0);
}

function generateRandomRoomPrompt() {
    if (isSaveRoom()) {
        return "A shimmering golden sanctuary";
    } else {
        const prompts = [
            "An abandoned city overtaken by nature, where skyscrapers are draped in vines",
            "A deserted underground bunker, echoing with the remnants of humanity's last hopes",
            "A crumbling highway stretching through a wasteland of twisted metal and ash",
            "A radioactive swamp glowing under a sickly moonlight",
            "A ghost town once bustling with life, now haunted by the echoes of lost souls",
            "A ruined library filled with burned books and forgotten knowledge, with only a few pages left intact",
            "A rusted-out factory overrun by mutated creatures scavenging for scraps",
            "A collapsed skyscraper turned into a dangerous maze of broken glass and crumbling walls",
            "A decaying military base, now home to rogue scavengers and desperate survivors",
            "A desolate suburban neighborhood, where the last signs of life are wild animals prowling",
            "A cracked desert canyon, once a thriving metropolis, now nothing but dust and bones",
            "A submerged city, its crumbled streets now teeming with dangerous sea life",
            "A derelict train station where the last remaining trains rust in place, abandoned by the living",
            "A rusted-out airship slowly drifting in the sky, its crew long dead or missing",
            "A post-apocalyptic carnival, its rides long unmoving, but strange sounds still echo in the distance",
            "The remnants of a futuristic research lab, now overrun by mutated creatures and glowing spores",
            "An abandoned shopping mall, its once-bustling halls now a maze of wreckage and eerie silence",
            "A silent forest of mutated trees that have adapted to the toxic air, casting unnatural shadows",
            "An overgrown military graveyard, where soldiers' forgotten bones lie scattered among the weeds",
            "The remains of a collapsed bridge, where once prosperous cities are now divided by a poisoned river",
            "A hidden underground haven for survivors, surrounded by endless miles of hostile wilderness",
            "A crumbled mansion where wealthy survivors once lived, now home to dangerous, wild animals",
            "A lone survivor’s camp in the remains of a decimated city, surrounded by makeshift walls of scrap metal",
            "A secret vault deep underground, its contents long forgotten, only guarded by strange robotic sentries",
            "The last gas station on earth, its pumps rusted, and the land around it desolate and barren",
            "A forgotten bunker for an ancient civilization, now a chilling reminder of their fall",
            "A flooded subway system, where strange aquatic creatures swim beneath the broken tunnels",
            "The remnants of a vast military compound, where dangerous experimental weapons were once tested",
            "A crumbling theme park, its attractions overrun by mutated wildlife and the shadows of the past"
        ];

        return prompts[Math.floor(Math.random() * prompts.length)];
    }
}

function updateRoomMaterials(textures) { 
    frontWall.material = new THREE.MeshPhongMaterial({ map: textures.wall });
    backWall.material = new THREE.MeshPhongMaterial({ map: textures.wall }); 
    leftWall.material = new THREE.MeshPhongMaterial({ map: textures.wall });
    rightWall.material = new THREE.MeshPhongMaterial({ map: textures.wall });
    floor.material = new THREE.MeshPhongMaterial({ map: textures.floor });
    ceiling.material = new THREE.MeshPhongMaterial({ map: textures.ceiling });
    frontDoor.material = new THREE.MeshPhongMaterial({ map: textures.door1 });  
    backDoor.material = new THREE.MeshPhongMaterial({ map: textures.door2 });
    leftDoor.material = new THREE.MeshPhongMaterial({ map: textures.door1 });
    rightDoor.material = new THREE.MeshPhongMaterial({ map: textures.door2 });
}

const wallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
const doorGeometry = new THREE.BoxGeometry(4, 8, 0.2);
const floor = new THREE.Mesh(floorGeometry);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const ceilingMaterial = new THREE.MeshPhongMaterial({ color: 0x87CEEB });
const ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = roomHeight;
scene.add(ceiling);

const frontWall = new THREE.Mesh(wallGeometry); 
frontWall.position.z = -roomDepth / 2;
frontWall.position.y = roomHeight / 2;
scene.add(frontWall);

const backWall = new THREE.Mesh(wallGeometry);
backWall.position.z = roomDepth / 2;
backWall.position.y = roomHeight / 2;
backWall.rotation.y = Math.PI;
scene.add(backWall);

const leftWall = new THREE.Mesh(wallGeometry);
leftWall.position.x = -roomWidth / 2;
leftWall.position.y = roomHeight / 2;
leftWall.rotation.y = Math.PI / 2;
scene.add(leftWall);

const rightWall = new THREE.Mesh(wallGeometry);
rightWall.position.x = roomWidth / 2; 
rightWall.position.y = roomHeight / 2;
rightWall.rotation.y = -Math.PI / 2;
scene.add(rightWall);

const frontDoor = new THREE.Mesh(doorGeometry);
frontDoor.position.z = -roomDepth / 2 + 0.1;
frontDoor.position.y = 4;
scene.add(frontDoor);

const backDoor = new THREE.Mesh(doorGeometry);
backDoor.position.z = roomDepth / 2 - 0.1;
backDoor.position.y = 4;
backDoor.rotation.y = Math.PI;
scene.add(backDoor);

const leftDoor = new THREE.Mesh(doorGeometry);
leftDoor.position.x = -roomWidth / 2 + 0.1;
leftDoor.position.y = 4;
leftDoor.rotation.y = Math.PI / 2;
scene.add(leftDoor);

const rightDoor = new THREE.Mesh(doorGeometry);  
rightDoor.position.x = roomWidth / 2 - 0.1;
rightDoor.position.y = 4;
rightDoor.rotation.y = -Math.PI / 2; 
scene.add(rightDoor);

updateRoomMaterials(roomTextures['0,0']);

// Buildings
function createBuildingInCorner(roomWidth, roomHeight, roomDepth, cornerPosition) {
    const buildingWidth = roomWidth / 3; // Building takes up 1/3 of the room
    const buildingDepth = roomDepth / 3; 
    const buildingHeight = roomHeight / 1.5; // Building height proportional to room height

    // Wall material
    const wallMaterial = new THREE.MeshPhongMaterial({
        color: 0x808080,
        side: THREE.DoubleSide,
    });

    // Wall geometry
    const wallGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, 0.1);

    // Create walls
    const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);

    // Wall positioning
    frontWall.position.set(cornerPosition.x, buildingHeight / 2, cornerPosition.z + buildingDepth / 2);
    backWall.position.set(cornerPosition.x, buildingHeight / 2, cornerPosition.z - buildingDepth / 2);
    backWall.rotation.y = Math.PI;

    leftWall.position.set(cornerPosition.x - buildingWidth / 2, buildingHeight / 2, cornerPosition.z);
    leftWall.rotation.y = Math.PI / 2;

    rightWall.position.set(cornerPosition.x + buildingWidth / 2, buildingHeight / 2, cornerPosition.z);
    rightWall.rotation.y = -Math.PI / 2;

    // Add collision to walls
    frontWall.userData.isCollidable = true;
    backWall.userData.isCollidable = true;
    leftWall.userData.isCollidable = true;
    rightWall.userData.isCollidable = true;

    // Add walls to scene
    scene.add(frontWall, backWall, leftWall, rightWall);

    // Create entryway
    const entrywayWidth = buildingWidth / 3;
    const entrywayHeight = buildingHeight / 2;
    const entrywayGeometry = new THREE.BoxGeometry(entrywayWidth, entrywayHeight, 0.1);
    const entryway = new THREE.Mesh(entrywayGeometry, new THREE.MeshPhongMaterial({ color: 0x444444 }));

    // Position entryway in front wall
    entryway.position.set(cornerPosition.x, entrywayHeight / 2, cornerPosition.z + buildingDepth / 2 + 0.05);
    scene.add(entryway);

    // Return building as group for future use if needed
    const buildingGroup = new THREE.Group();
    buildingGroup.add(frontWall, backWall, leftWall, rightWall, entryway);

    return buildingGroup;
}

// Function to place buildings in room corners
function addBuildingsToRoom(roomWidth, roomHeight, roomDepth) {
    const cornerOffsets = [
        { x: roomWidth / 2 - roomWidth / 3, z: roomDepth / 2 - roomDepth / 3 }, // Top-right
        { x: -roomWidth / 2 + roomWidth / 3, z: roomDepth / 2 - roomDepth / 3 }, // Top-left
        { x: -roomWidth / 2 + roomWidth / 3, z: -roomDepth / 2 + roomDepth / 3 }, // Bottom-left
        { x: roomWidth / 2 - roomWidth / 3, z: -roomDepth / 2 + roomDepth / 3 }, // Bottom-right
    ];

    cornerOffsets.forEach((corner) => {
        createBuildingInCorner(roomWidth, roomHeight, roomDepth, corner);
    });
}

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(0, roomHeight / 2 - 1, 0);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

camera.position.y = FLOOR_HEIGHT;
camera.rotation.order = 'YXZ';

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let turnLeft = false;
let turnRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let roomPosition = {x: 0, y: 0};
const visitedRooms = [];

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);
document.getElementById('settings-button').addEventListener('click', openSettings);
document.getElementById('map-button').addEventListener('click', openMap);
document.getElementById('close-map-button').addEventListener('click', closeMap);
document.getElementById('key-master-button').addEventListener('click', openKeyMaster);
document.getElementById('fullscreen-button').addEventListener('click', toggleFullscreen);

// Fullscreen functionality
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Fullscreen change listener
document.addEventListener('fullscreenchange', () => {
    const button = document.getElementById('fullscreen-button');
    button.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Enter Fullscreen';
});

// Initialize pointer lock status
let isPointerLocked = false;
let pendingPointerLock = false;  // Control pointer lock after settings

// Function to request pointer lock
function requestPointerLock() {
    if (!isPointerLocked) {
        document.body.requestPointerLock();
    } else {
        document.exitPointerLock();
    }
}

// Add event listener for pointer lock status changes
document.addEventListener('pointerlockchange', () => {
    const pointerLockCheckbox = document.getElementById('pointer-lock');
    isPointerLocked = document.pointerLockElement === document.body;
    pointerLockCheckbox.checked = isPointerLocked; // Sync checkbox status
});

// Update camera rotation based on mouse movement
document.addEventListener('mousemove', (event) => {
    if (isPointerLocked) {
        const sensitivity = 0.002;
        camera.rotation.y -= event.movementX * sensitivity;
        camera.rotation.x -= event.movementY * sensitivity;
        // Clamp pitch rotation
        camera.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, camera.rotation.x));
    }
});

// Add event listener for pointer lock toggle in settings
document.getElementById('pointer-lock').addEventListener('change', (event) => {
    if (event.target.checked) {
        pendingPointerLock = true;  // Set pending pointer lock
    } else {
        document.exitPointerLock();
    }
});

// Mobile detection
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Show joysticks and jump button if on mobile
if (isMobile()) {
    document.querySelectorAll('.joystick-container').forEach(el => el.style.display = 'block');
    document.getElementById('mobile-jump-button').style.display = 'block';
}

// Joystick handling
function handleJoystick(joystickEl, knobEl, callback) {
    let touchId = null;
    let startX, startY;
    const maxDistance = 35;

    function updateKnobPosition(x, y) {
        const dx = x - startX;
        const dy = y - startY;
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
        const angle = Math.atan2(dy, dx);
        
        const newX = distance * Math.cos(angle);
        const newY = distance * Math.sin(angle);
        
        knobEl.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px))`;
        callback(newX / maxDistance, newY / maxDistance);
    }

    joystickEl.addEventListener('touchstart', (e) => {
        if (touchId === null) {
            const touch = e.touches[0];
            touchId = touch.identifier;
            const rect = joystickEl.getBoundingClientRect();
            startX = touch.clientX - rect.left;
            startY = touch.clientY - rect.top;
        }
    });

    joystickEl.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            if (touch.identifier === touchId) {
                const rect = joystickEl.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                updateKnobPosition(x, y);
                break;
            }
        }
    });

    function resetKnob() {
        touchId = null;
        knobEl.style.transform = 'translate(-50%, -50%)';
        callback(0, 0);
    }

    joystickEl.addEventListener('touchend', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchId) {
                resetKnob();
                break;
            }
        }
    });

    joystickEl.addEventListener('touchcancel', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchId) {
                resetKnob();
                break;
            }
        }
    });
}

// Add jump button handler
document.getElementById('mobile-jump-button').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isJumping) {
        yVelocity = JUMP_POWER;
        isJumping = true;
    }
});

// Initialize joysticks
const movementJoystick = document.getElementById('movement-joystick');
const cameraJoystick = document.getElementById('camera-joystick');

handleJoystick(
    movementJoystick, 
    movementJoystick.querySelector('.joystick-knob'),
    (x, y) => {
        moveForward = y < -0.5;
        moveBackward = y > 0.5;
        moveLeft = x < -0.5;
        moveRight = x > 0.5;
    }
);

handleJoystick(
    cameraJoystick,
    cameraJoystick.querySelector('.joystick-knob'),
    (x, y) => {
        turnLeft = x > 0.3;
        turnRight = x < -0.3;
        lookUp = y < -0.3;
        lookDown = y > 0.3;
    }
);

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = true;
            break;
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyA':
            moveLeft = true;
            break;
        case 'KeyD':
            moveRight = true;
            break;
        case 'ArrowLeft':
            turnRight = true;
            break;
        case 'ArrowRight':
            turnLeft = true;
            break;
        case 'ArrowUp':
            lookUp = true;
            break;
        case 'ArrowDown':
            lookDown = true;
            break;
        case 'Space':
            if (!isJumping) {
                yVelocity = JUMP_POWER;
                isJumping = true;
            }
            break;
        case 'KeyE':
            useSelectedItem();
            break;
        case 'Digit1':
        case 'Digit2':  
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
            selectedSlot = parseInt(event.code.slice(-1)) - 1;
            updateInventoryDisplay();
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = false;
            break;
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyA':
            moveLeft = false;
            break;
        case 'KeyD':
            moveRight = false;
            break;
        case 'ArrowLeft':
            turnRight = false;
            break;
        case 'ArrowRight':
            turnLeft = false;
            break;
        case 'ArrowUp':
            lookUp = false;
            break;
        case 'ArrowDown':
            lookDown = false;
            break;
    }
}

function updateRoomDisplay() {
    document.getElementById('room-position').textContent = `Room (${roomPosition.x}, ${roomPosition.y})`;

    if (roomPosition.x === 0 && roomPosition.y === 0) {
        document.getElementById('key-master-button').style.display = 'block';
    } else {
        document.getElementById('key-master-button').style.display = 'none';
    }
}

function animate() {
    requestAnimationFrame(animate);

    yVelocity += GRAVITY;
    camera.position.y += yVelocity;
    
    if (camera.position.y <= FLOOR_HEIGHT) {
        camera.position.y = FLOOR_HEIGHT;
        yVelocity = 0;
        isJumping = false;
    }

    if (!playerFrozen) {
        const pickupRadius = BASE_PICKUP_RADIUS * (1 + pickupRadiusLevel);
        for (let i = currentKeys.length - 1; i >= 0; i--) {
            const key = currentKeys[i];
            const keyDistance = new THREE.Vector2(
                camera.position.x - key.position.x,
                camera.position.z - key.position.z
            ).length();
            
            if (keyDistance < pickupRadius) {
                scene.remove(key);
                currentKeys.splice(i, 1);
                const roomKey = `${roomPosition.x},${roomPosition.y}`;
                roomData[roomKey].keyPositions.splice(i, 1);
                playerKeys++;
                updateKeyDisplay();
                playKeyCollectSound();
            } else {
                key.rotation.y += 0.02; // Spin the key
            }
        }

        currentLandmines.forEach((mine, index) => {
            const dx = camera.position.x - mine.position.x;
            const dz = camera.position.z - mine.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            if (distance < 0.6) {
                triggerDeath();
                scene.remove(mine);
                currentLandmines.splice(index, 1);
                roomData[`${roomPosition.x},${roomPosition.y}`].landminePositions.splice(index, 1);
            }
        });

        direction.set(
            Number(moveRight) - Number(moveLeft),
            0,
            Number(moveBackward) - Number(moveForward)
        );

        // Check if the player is far enough from the shop character to close the shop interface
        if (currentShopCharacter && currentShopCharacter.mesh) {
            const distance = camera.position.distanceTo(currentShopCharacter.mesh.position);
            const shopModal = document.getElementById('shop-modal');
            const thresholdDistance = 5; // Set distance threshold

            // Close the shop interface if the player moves beyond the threshold
            if (distance > thresholdDistance && shopModal.style.display === 'block') {
                closeShop();
                hideStatusMessage(); // Hide the shop interaction message if it's displayed
            }
        }

        const yaw = camera.rotation.y;
        const yawQuaternion = new THREE.Quaternion();
        yawQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

        direction.applyQuaternion(yawQuaternion);
        direction.normalize();
        
        const frameVelocity = direction.multiplyScalar(speed);
        velocity.lerp(frameVelocity, 0.2);
        
        const nextPosition = camera.position.clone().add(velocity);
        if (Math.abs(nextPosition.x) < roomWidth / 2 - 1 &&
            Math.abs(nextPosition.z) < roomDepth / 2 - 1) {
            camera.position.add(velocity);
        }

        const doorCollisionThreshold = 2;
        if (camera.position.z < -roomDepth / 2 + doorCollisionThreshold &&
            Math.abs(camera.position.x) < 2) {
            enterNewRoom(0, 1); 
        } else if (camera.position.z > roomDepth / 2 - doorCollisionThreshold &&
            Math.abs(camera.position.x) < 2) {
            enterNewRoom(0, -1); 
        } else if (camera.position.x < -roomWidth / 2 + doorCollisionThreshold &&
            Math.abs(camera.position.z) < 2) {
            enterNewRoom(-1, 0); 
        } else if (camera.position.x > roomWidth / 2 - doorCollisionThreshold &&
            Math.abs(camera.position.z) < 2) {
            enterNewRoom(1, 0); 
        }

        camera.rotation.y -= turnLeft ? turnSpeed : turnRight ? -turnSpeed : 0;

        // Update camera pitch
        camera.rotation.x += lookUp ? turnSpeed : lookDown ? -turnSpeed : 0;

        // Clamp camera pitch to between -maxPitch and maxPitch
        if (camera.rotation.x > maxPitch) camera.rotation.x = maxPitch;
        if (camera.rotation.x < -maxPitch) camera.rotation.x = -maxPitch;
    }

    // Handle key magnet and other active items
    if (activeKeyMagnet) {
        currentKeys.forEach(key => {
            const directionToPlayer = new THREE.Vector3().subVectors(camera.position, key.position);
            key.position.add(directionToPlayer.normalize().multiplyScalar(0.1));
        });
    }

    // Update shop character animations
    if (scene.userData.shopCharacterTick) {
        scene.userData.shopCharacterTick();
    }

    if (scene.userData.mixer) {
        scene.userData.mixer.update(delta);
    }

    closeShop(); // start shop closed.
    // Check interactions with shop character
    checkShopInteraction();

    // Make name tags face the camera
    if (currentShopCharacter && currentShopCharacter.nameMesh) {
        currentShopCharacter.nameMesh.lookAt(camera.position.x, currentShopCharacter.nameMesh.position.y, camera.position.z);
    }

    renderer.render(scene, camera);
}


// Function to open the shop modal
function openShop() {
    const shopModal = document.getElementById('shop-modal');
    shopModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Disable background scroll
}

// Function to close the shop modal
function closeShop() {
    const shopModal = document.getElementById('shop-modal');
    shopModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Enable background scroll
}


function openMap() {
    document.getElementById('map-ui').style.display = 'block';
    generateMap();
    centerMapOnCurrentRoom();
    playerFrozen = true;
}

function closeMap() {
    document.getElementById('map-ui').style.display = 'none';
    document.getElementById('map-container').innerHTML = ''; // Clear the map
    playerFrozen = false;
}

function showShopTab(tab) {
    const itemsTab = document.getElementById('shop-items');
    const upgradesTab = document.getElementById('shop-upgrades');
    const itemsButton = document.querySelector('.shop-tab[onclick="showShopTab(\'items\')"]');
    const upgradesButton = document.querySelector('.shop-tab[onclick="showShopTab(\'upgrades\')"]');

    if (tab === 'items') {
        itemsTab.style.display = 'block';
        upgradesTab.style.display = 'none';
        itemsButton.classList.add('active');
        upgradesButton.classList.remove('active');
    } else if (tab === 'upgrades') {
        itemsTab.style.display = 'none';
        upgradesTab.style.display = 'block';
        itemsButton.classList.remove('active');
        upgradesButton.classList.add('active');
    }
}

function generateMap() {
    const mapContainer = document.getElementById('map-container');
    mapContainer.innerHTML = ''; // Clear previous content

    const minX = roomPosition.x - 20;
    const maxX = roomPosition.x + 20;
    const minY = roomPosition.y - 20;
    const maxY = roomPosition.y + 20;

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            const roomKey = `${x},${y}`;
            const roomDiv = document.createElement('div');
            roomDiv.textContent = `(${x}, ${y})`;
            roomDiv.classList.add('room-box');
            roomDiv.style.left = `${(x * 45) + 2000}px`; // Adjust scaling and offset as needed
            roomDiv.style.top = `${(-y * 45) + 2000}px`;

            if (x === 0 && y === 0) {
                const iconUrl = 'https://image.pollinations.ai/prompt/' + encodeURIComponent('Make an icon for "A alien weird universe"');
                roomDiv.style.backgroundImage = `url(${iconUrl})`;
                roomDiv.style.backgroundColor = ''; // Remove background color if needed
            } else if (roomPrompts[roomKey]) {
                roomDiv.style.backgroundColor = 'green'; // Discovered room
            } else {
                roomDiv.style.backgroundColor = 'red'; // Undiscovered room
            }

            // Highlight current room
            if (x === roomPosition.x && y === roomPosition.y) {
                roomDiv.style.border = '2px solid yellow';
            }

            mapContainer.appendChild(roomDiv);
        }
    }
}

function centerMapOnCurrentRoom() {
    const x = roomPosition.x;
    const y = roomPosition.y;

    mapOffset.x = window.innerWidth / 2 - ((x * 60) + 25 + 2000); // Adjust scaling and offset as needed
    mapOffset.y = window.innerHeight / 2 - ((-y * 60) + 25 + 2000);

    const mapContainer = document.getElementById('map-container');
    mapContainer.style.transform = `translate(${mapOffset.x}px, ${mapOffset.y}px)`;
}

// Map dragging functionality
const mapContainer = document.getElementById('map-container');
mapContainer.addEventListener('mousedown', function(event) {
    isDragging = true;
    dragStart.x = event.clientX - mapOffset.x;
    dragStart.y = event.clientY - mapOffset.y;
    mapContainer.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', function(event) {
    if (isDragging) {
        mapOffset.x = event.clientX - dragStart.x;
        mapOffset.y = event.clientY - dragStart.y;
        mapContainer.style.transform = `translate(${mapOffset.x}px, ${mapOffset.y}px)`;
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
    mapContainer.style.cursor = 'grab';
});

function executeTravel() {
    const x = parseInt(document.getElementById('travel-x').value);
    const y = parseInt(document.getElementById('travel-y').value);
    
    if (!isNaN(x) && !isNaN(y)) {
        const dx = x - roomPosition.x;
        const dy = y - roomPosition.y;
        enterNewRoom(dx, dy);
        closeTravelMenu();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    }
}

function buyItem(itemId, price) {
    if (playerKeys >= price) {
        const emptySlot = inventory.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            inventory[emptySlot] = itemId;
            playerKeys -= price;
            updateKeyDisplay();
            updateInventoryDisplay();
            closeShop();
        } else {
            alert('Inventory full!');
        }
    } else {
        alert('Not enough keys!');
    }
}

function buyUpgrade(type) {
    if (type === 'speed') {
        const cost = 5;
        if (playerKeys >= cost && speedUpgradeLevel < 5) {
            playerKeys -= cost;
            speedUpgradeLevel++;
            updateKeyDisplay();
            speed = BASE_SPEED * (1 + speedUpgradeLevel);
            
            const boxes = document.querySelectorAll('.upgrade-box:not(.pickup-radius)');
            for (let i = 0; i < speedUpgradeLevel; i++) {
                boxes[i].style.background = 'rgba(255,215,0,0.5)';
            }
        } else {
            alert('Not enough keys or max level reached!');
        }
    } else if (type === 'pickupRadius') {
        const cost = 5;
        if (playerKeys >= cost && pickupRadiusLevel < 5) {
            playerKeys -= cost;
            pickupRadiusLevel++;
            updateKeyDisplay();
            
            const boxes = document.querySelectorAll('.upgrade-box.pickup-radius');
            for (let i = 0; i < pickupRadiusLevel; i++) {
                boxes[i].style.background = 'rgba(255,215,0,0.5)';
            }
        } else {
            alert('Not enough keys or max level reached!');
        }
    }
}

function updateInventoryDisplay() {
    const slots = document.querySelectorAll('.inventory-slot');
    slots.forEach((slot, index) => {
        slot.textContent = inventory[index] || '';
        slot.className = `inventory-slot${index === selectedSlot ? ' selected' : ''}`;
    });
}

function useSelectedItem() {
    const item = inventory[selectedSlot];
    if (item === 'keyMagnet') {
        activeKeyMagnet = true;
        playerFrozen = true;
        showStatusMessage('Key Magnet Active');
        setTimeout(() => {
            activeKeyMagnet = false;
            playerFrozen = false;
            inventory[selectedSlot] = null;
            updateInventoryDisplay();
            hideStatusMessage();
        }, 5000);
    } else if (item === 'travelStone') {
        showTravelMenu();
        setToSaveRoom();
    } else if (item === 'speedBoost') {
        activateSpeedBoost();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'shield') {
        activateShield();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'healthPotion') {
        useHealthPotion();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'manaPotion') {
        useManaPotion();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'strengthElixir') {
        useStrengthElixir();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'invisibilityCloak') {
        useInvisibilityCloak();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'fireballScroll') {
        useFireballScroll();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'iceWand') {
        useIceWand();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'thunderboltScroll') {
        useThunderboltScroll();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'healingHerb') {
        useHealingHerb();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'poisonDagger') {
        equipPoisonDagger();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'magicMap') {
        useMagicMap();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'goldenCompass') {
        useGoldenCompass();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'lantern') {
        useLantern();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'lockpickSet') {
        useLockpickSet();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'teleportScroll') {
        useTeleportScroll();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'resurrectionStone') {
        useResurrectionStone();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'timeStopWatch') {
        useTimeStopWatch();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'magicArmor') {
        equipMagicArmor();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'magicSword') {
        equipMagicSword();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'bootsOfSpeed') {
        equipBootsOfSpeed();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'ringOfProtection') {
        equipRingOfProtection();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'necklaceOfWisdom') {
        equipNecklaceOfWisdom();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'cloakOfShadows') {
        equipCloakOfShadows();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'dragonScale') {
        useDragonScale();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'phoenixFeather') {
        usePhoenixFeather();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'elixirOfLife') {
        useElixirOfLife();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'gemOfSeeing') {
        useGemOfSeeing();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'bookOfSpells') {
        useBookOfSpells();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'orbOfLight') {
        useOrbOfLight();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'bagOfHolding') {
        useBagOfHolding();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'staffOfPower') {
        equipStaffOfPower();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'scrollOfIdentify') {
        useScrollOfIdentify();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'potionOfFlight') {
        usePotionOfFlight();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'scrollOfSummoning') {
        useScrollOfSummoning();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'helmetOfInsight') {
        equipHelmetOfInsight();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'glovesOfThievery') {
        equipGlovesOfThievery();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'beltOfGiantStrength') {
        equipBeltOfGiantStrength();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'ringOfInvisibility') {
        equipRingOfInvisibility();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'mirrorOfTruth') {
        useMirrorOfTruth();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'crystalBall') {
        useCrystalBall();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'hornOfBlasting') {
        useHornOfBlasting();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'bootsOfElvenkind') {
        equipBootsOfElvenkind();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'cloakOfDisplacement') {
        equipCloakOfDisplacement();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'stoneOfGoodLuck') {
        useStoneOfGoodLuck();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'amuletOfHealth') {
        equipAmuletOfHealth();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'talismanOfPureGood') {
        useTalismanOfPureGood();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else if (item === 'deckOfManyThings') {
        useDeckOfManyThings();
        inventory[selectedSlot] = null;
        updateInventoryDisplay();
    } else {
        alert('Unknown item!');
    }
}

function useHealthPotion() {
    showStatusMessage('Health Restored');
    playerHealth = Math.min(playerHealth + 50, maxPlayerHealth);
    updateHealthDisplay();
    hideStatusMessageAfterDelay();
}

function useManaPotion() {
    showStatusMessage('Mana Restored');
    playerMana = Math.min(playerMana + 50, maxPlayerMana);
    updateManaDisplay();
    hideStatusMessageAfterDelay();
}

function useStrengthElixir() {
    showStatusMessage('Strength Increased');
    playerStrength += 10;
    setTimeout(() => {
        playerStrength -= 10;
        hideStatusMessage();
    }, 60000); // Lasts for 60 seconds
}

function useInvisibilityCloak() {
    showStatusMessage('Invisible');
    playerInvisible = true;
    setTimeout(() => {
        playerInvisible = false;
        hideStatusMessage();
    }, 30000); // Lasts for 30 seconds
}

function useFireballScroll() {
    showStatusMessage('Casting Fireball');
    castSpell('fireball');
    hideStatusMessageAfterDelay();
}

function useIceWand() {
    showStatusMessage('Casting Ice Spell');
    castSpell('ice');
    hideStatusMessageAfterDelay();
}

function useThunderboltScroll() {
    showStatusMessage('Casting Thunderbolt');
    castSpell('thunderbolt');
    hideStatusMessageAfterDelay();
}

function useHealingHerb() {
    showStatusMessage('Health Restored');
    playerHealth = Math.min(playerHealth + 20, maxPlayerHealth);
    updateHealthDisplay();
    hideStatusMessageAfterDelay();
}

function equipPoisonDagger() {
    showStatusMessage('Poison Dagger Equipped');
    playerWeapon = 'poisonDagger';
    playerAttackPower += 5;
    playerPoisonDamage = true;
    hideStatusMessageAfterDelay();
}

function useMagicMap() {
    showStatusMessage('Map Revealed');
    revealMap();
    hideStatusMessageAfterDelay();
}

function useGoldenCompass() {
    showStatusMessage('Compass Activated');
    showDirection();
    hideStatusMessageAfterDelay();
}

function useLantern() {
    showStatusMessage('Lantern Lit');
    lightUpArea();
    hideStatusMessageAfterDelay();
}

function useLockpickSet() {
    showStatusMessage('Lockpick Used');
    unlockDoor();
    hideStatusMessageAfterDelay();
}

function useTeleportScroll() {
    showStatusMessage('Teleporting');
    teleportToLocation();
    hideStatusMessageAfterDelay();
}

function useResurrectionStone() {
    showStatusMessage('Resurrection Stone Activated');
    playerHasResurrection = true;
    hideStatusMessageAfterDelay();
}

function useTimeStopWatch() {
    showStatusMessage('Time Stopped');
    timeStopped = true;
    setTimeout(() => {
        timeStopped = false;
        hideStatusMessage();
    }, 10000); // Lasts for 10 seconds
}

function equipMagicArmor() {
    showStatusMessage('Magic Armor Equipped');
    playerArmor += 20;
    hideStatusMessageAfterDelay();
}

function equipMagicSword() {
    showStatusMessage('Magic Sword Equipped');
    playerWeapon = 'magicSword';
    playerAttackPower += 15;
    hideStatusMessageAfterDelay();
}

function equipBootsOfSpeed() {
    showStatusMessage('Boots of Speed Equipped');
    speed += 5;
    hideStatusMessageAfterDelay();
}

function equipRingOfProtection() {
    showStatusMessage('Ring of Protection Equipped');
    playerArmor += 10;
    hideStatusMessageAfterDelay();
}

function equipNecklaceOfWisdom() {
    showStatusMessage('Necklace of Wisdom Equipped');
    playerExperienceGain += 0.1; // Increase experience gain by 10%
    hideStatusMessageAfterDelay();
}

function equipCloakOfShadows() {
    showStatusMessage('Cloak of Shadows Equipped');
    playerStealth += 10;
    hideStatusMessageAfterDelay();
}

function useDragonScale() {
    showStatusMessage('Dragon Scale Used');
    playerArmor += 30;
    hideStatusMessageAfterDelay();
}

function usePhoenixFeather() {
    showStatusMessage('Phoenix Feather Used');
    playerHasResurrection = true;
    hideStatusMessageAfterDelay();
}

function useElixirOfLife() {
    showStatusMessage('Max Health Increased');
    maxPlayerHealth += 20;
    playerHealth += 20;
    updateHealthDisplay();
    hideStatusMessageAfterDelay();
}

function useGemOfSeeing() {
    showStatusMessage('Hidden Objects Revealed');
    revealHiddenObjects();
    hideStatusMessageAfterDelay();
}

function useBookOfSpells() {
    showStatusMessage('New Spells Learned');
    learnNewSpells();
    hideStatusMessageAfterDelay();
}

function useOrbOfLight() {
    showStatusMessage('Area Illuminated');
    illuminateArea();
    hideStatusMessageAfterDelay();
}

function useBagOfHolding() {
    showStatusMessage('Inventory Expanded');
    expandInventory();
    hideStatusMessageAfterDelay();
}

function equipStaffOfPower() {
    showStatusMessage('Staff of Power Equipped');
    playerWeapon = 'staffOfPower';
    playerMagicPower += 20;
    hideStatusMessageAfterDelay();
}

function useScrollOfIdentify() {
    showStatusMessage('Item Identified');
    identifyItem();
    hideStatusMessageAfterDelay();
}

function usePotionOfFlight() {
    showStatusMessage('Flying');
    playerFlying = true;
    setTimeout(() => {
        playerFlying = false;
        hideStatusMessage();
    }, 30000); // Lasts for 30 seconds
}

function useScrollOfSummoning() {
    showStatusMessage('Summoning Creature');
    summonCreature();
    hideStatusMessageAfterDelay();
}

function equipHelmetOfInsight() {
    showStatusMessage('Helmet of Insight Equipped');
    playerPerception += 10;
    hideStatusMessageAfterDelay();
}

function equipGlovesOfThievery() {
    showStatusMessage('Gloves of Thievery Equipped');
    playerStealingSkill += 15;
    hideStatusMessageAfterDelay();
}

function equipBeltOfGiantStrength() {
    showStatusMessage('Belt of Giant Strength Equipped');
    playerStrength += 20;
    hideStatusMessageAfterDelay();
}

function equipRingOfInvisibility() {
    showStatusMessage('Ring of Invisibility Equipped');
    playerInvisible = true;
    setTimeout(() => {
        playerInvisible = false;
        hideStatusMessage();
    }, 60000); // Lasts for 60 seconds
}

function useMirrorOfTruth() {
    showStatusMessage('Illusions Dispelled');
    dispelIllusions();
    hideStatusMessageAfterDelay();
}

function useCrystalBall() {
    showStatusMessage('Vision Revealed');
    showVision();
    hideStatusMessageAfterDelay();
}

function useHornOfBlasting() {
    showStatusMessage('Horn of Blasting Used');
    blastEnemies();
    hideStatusMessageAfterDelay();
}

function equipBootsOfElvenkind() {
    showStatusMessage('Boots of Elvenkind Equipped');
    playerStealth += 15;
    hideStatusMessageAfterDelay();
}

function equipCloakOfDisplacement() {
    showStatusMessage('Cloak of Displacement Equipped');
    playerEvasion += 20;
    hideStatusMessageAfterDelay();
}

function useStoneOfGoodLuck() {
    showStatusMessage('Luck Increased');
    playerLuck += 10;
    hideStatusMessageAfterDelay();
}

function equipAmuletOfHealth() {
    showStatusMessage('Amulet of Health Equipped');
    playerHealthRegen += 5;
    hideStatusMessageAfterDelay();
}

function useTalismanOfPureGood() {
    showStatusMessage('Blessed by Pure Good');
    applyBlessing();
    hideStatusMessageAfterDelay();
}

function useDeckOfManyThings() {
    showStatusMessage('Drawing from Deck of Many Things');
    drawFromDeckOfManyThings();
    hideStatusMessageAfterDelay();
}

// Helper function to hide status message after a short delay
function hideStatusMessageAfterDelay() {
    setTimeout(() => {
        hideStatusMessage();
    }, 2000);
}

// Implementations of the helper functions (e.g., castSpell, revealMap)
// These should match your game's logic and existing functions

function castSpell(spellName) {
    // Spell casting logic
    alert(`You cast ${spellName}!`);
}

function revealMap() {
    // Map revealing logic
    alert('The map is revealed!');
}

function showDirection() {
    // Compass logic
    alert('The compass points north!');
}

function lightUpArea() {
    // Lighting logic
    alert('The area is illuminated!');
}

function unlockDoor() {
    // Unlocking logic
    alert('You unlock the door!');
}

function teleportToLocation() {
    // Teleportation logic
    alert('You teleport to a safe location!');
}

function revealHiddenObjects() {
    // Reveal hidden objects logic
    alert('Hidden objects are now visible!');
}

function learnNewSpells() {
    // Learning spells logic
    alert('You learn new powerful spells!');
}

function illuminateArea() {
    // Illuminate area logic
    alert('The area is filled with light!');
}

function expandInventory() {
    // Inventory expansion logic
    maxInventorySize += 10;
    alert('Your inventory size increases!');
}

function identifyItem() {
    // Item identification logic
    alert('You identify the unknown item!');
}

function summonCreature() {
    // Summoning logic
    alert('A creature comes to your aid!');
}

function dispelIllusions() {
    // Dispel illusions logic
    alert('All illusions are dispelled!');
}

function showVision() {
    // Vision logic
    alert('You see a vision of the future!');
}

function blastEnemies() {
    // Blasting enemies logic
    alert('Enemies are blasted away!');
}

function applyBlessing() {
    // Blessing logic
    alert('You feel a holy power protecting you!');
}

function drawFromDeckOfManyThings() {
    // Random effect logic
    const effects = ['Gain 50 gold', 'Lose 10 health', 'Gain a level', 'Encounter a monster'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    alert(`Effect: ${randomEffect}`);
    // Apply the effect to the player
}

function activateSpeedBoost() {
    showStatusMessage('Speed Boost Active');
    const originalSpeed = speed;
    speed *= 2; // Double the speed
    setTimeout(() => {
        speed = originalSpeed;
        hideStatusMessage();
    }, 5000); // Lasts for 5 seconds
}

let shieldActive = false;

function activateShield() {
    shieldActive = true;
    showStatusMessage('Shield Active');
    setTimeout(() => {
        shieldActive = false;
        hideStatusMessage();
    }, 10000); // Lasts for 10 seconds
}

// Modify triggerDeath function to account for shield
function triggerDeath() {
    if (shieldActive) {
        shieldActive = false;
        hideStatusMessage();
    } else {
        playerFrozen = true;
        document.getElementById('death-screen').style.display = 'flex';
    }
}

function enterNewRoom(dx, dy) {
    currentKeys.forEach(key => scene.remove(key));
    currentKeys = [];
    currentLandmines.forEach(mine => scene.remove(mine));
    currentLandmines = [];

    roomPosition.x += dx;
    roomPosition.y += dy;

    loadRoom();

    spawnKey();
    spawnLandmines();

    camera.position.set(0, FLOOR_HEIGHT, 0);
    document.getElementById('room-position').textContent = `Room (${roomPosition.x}, ${roomPosition.y})`;
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

const titleScreen = document.getElementById('title-screen');
const captionSpans = document.querySelectorAll('#caption span');

let delay = 0;
captionSpans.forEach(span => {
    setTimeout(() => span.style.opacity = 1, delay);
    delay += 500;
});

setTimeout(() => titleScreen.style.opacity = 0, delay + 1000);
setTimeout(() => {
    titleScreen.style.opacity = 0;
    titleScreen.style.display = 'none';
    enterRoomAtPosition(0, 0); // Set starting room position to (0, 0)
}, delay + 2000);

showStatusMessage('Loading initial room...');
updateInventoryDisplay();
animate();

function openKeyMaster() {
    document.getElementById('key-master-modal').style.display = 'block';
}

function closeKeyMaster() {
    document.getElementById('key-master-modal').style.display = 'none';
}

let keysDonated = 0;
let playerLevel = 1;

function donateKeys() {
    const input = document.getElementById('donation-amount');
    const amount = parseInt(input.value);

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount of keys to donate.');
        return;
    }

    if (playerKeys >= amount) {
        playerKeys -= amount;
        keysDonated += amount;
        updateKeyDisplay();

        document.getElementById('key-master-status').textContent = `You have donated ${keysDonated} keys.`;

        if (keysDonated >= 200) {
            levelUp();
            keysDonated -= 200; // Reset after leveling up
            document.getElementById('key-master-status').textContent = `You have leveled up! Your new level is ${playerLevel}. Keys donated towards next level: ${keysDonated}`;
        }
    } else {
        alert('You do not have enough keys to donate.');
    }
}

function levelUp() {
    playerLevel += 1;
    alert(`Congratulations! You have leveled up to level ${playerLevel}!`);
}

function showTravelMenu() {
    playerFrozen = true;
    document.getElementById('travel-menu').style.display = 'block';
}

function closeTravelMenu() {
    playerFrozen = false;
    document.getElementById('travel-menu').style.display = 'none';
}

function setToSaveRoom() {
    document.getElementById('travel-x').value = lastSavePosition.x;
    document.getElementById('travel-y').value = lastSavePosition.y;
}

function openSettings() {
    document.getElementById('settings-modal').style.display = 'block';
    playerFrozen = true;
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
    playerFrozen = false;

    if (pendingPointerLock) {
        requestPointerLock();
        pendingPointerLock = false;  // Reset pending status
    }
}

// Instructions toggle functionality
const instructionsToggle = document.getElementById('instructions-toggle');
instructionsToggle.addEventListener('click', () => {
    const instructions = document.getElementById('instructions');
    if (instructions.style.display === 'none') {
        instructions.style.display = 'block';
        instructionsToggle.textContent = '/\\';
    } else {
        instructions.style.display = 'none';
        instructionsToggle.textContent = '\\/';
    }
});

document.getElementById('play-sfx').addEventListener('change', (e) => {
    playSfx = e.target.checked;
});

document.getElementById('show-instructions').addEventListener('change', (e) => {
    showInstructions = e.target.checked;
    document.getElementById('instructions').style.display = showInstructions ? 'block' : 'none';
    if (showInstructions) {
        showStatusMessage('Instructions displayed.');
    }
});

document.getElementById('fov').addEventListener('input', (e) => {
    const fov = parseInt(e.target.value);
    camera.fov = fov;
    camera.updateProjectionMatrix();
});

const uiScaleSlider = document.getElementById('ui-scale'); 
let playSfx = true;  // Already exists but let's make sure it's set to true
let showInstructions = true;
const scalableElements = [
    '#instructions',
    '#room-position',
    '#key-display',
    '#map-button',
    '#inventory .inventory-slot',
    '#key-master-button',
    '#shop-modal',
    '#key-master-modal',
    '#travel-menu',
    '#status-message',
    '.joystick-container',
    '#mobile-jump-button'
];

uiScaleSlider.addEventListener('input', (e) => {
    uiScale = e.target.value / 100;
    updateUIScale();
});

function checkShopCharacterNameVisibility() {
    if (currentShopCharacter && currentShopCharacter.mesh && currentShopCharacter.nameMesh) {
        const distance = camera.position.distanceTo(currentShopCharacter.mesh.position);
        const nameText = currentShopCharacter.nameMesh; // Retrieve the name text mesh

        if (distance < 5) { // Show name within 5 units
            if (!nameText.parent) {  // Ensure name text is added to the scene if not already
                scene.add(nameText);
            }
        } else {
            if (nameText.parent) {
                scene.remove(nameText); // Hide the name text if out of range
            }
        }
    }
}




function updateUIScale() {
    const root = document.documentElement;
    root.style.setProperty('--ui-scale', uiScale);
    
    // Add base y positions for elements that need vertical scaling
    const yPositions = {
        '#key-display': 65,
        '#map-button': 65,
        '#settings-button': 110
    };
    
    scalableElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const originalFontSize = window.getComputedStyle(el).getPropertyValue('--original-font-size') || '16px';
            const originalPadding = window.getComputedStyle(el).getPropertyValue('--original-padding') || '10px';
            
            // Scale font size
            const baseFontSize = parseInt(originalFontSize);
            el.style.fontSize = `${baseFontSize * uiScale}px`;
            
            // Scale padding
            const basePadding = parseInt(originalPadding);
            el.style.padding = `${basePadding * uiScale}px`;
            
            // Scale Y position if defined
            if (yPositions[selector]) {
                el.style.top = `${yPositions[selector] * uiScale}px`;
            }
            
            // Scale width and height for specific elements
            if (selector === '#inventory .inventory-slot') {
                el.style.width = `${50 * uiScale}px`;
                el.style.height = `${50 * uiScale}px`;
            }
            if (selector === '.joystick-container') {
                el.style.width = `${120 * uiScale}px`;
                el.style.height = `${120 * uiScale}px`;
            }
            if (selector === '#mobile-jump-button') {
                el.style.width = `${80 * uiScale}px`;
                el.style.height = `${80 * uiScale}px`;
            }
        });
    });
}

// Interaction logic
document.addEventListener('keydown', function(event) {
    if (event.key === 'f') { // Press 'F' to interact
        scene.traverse((object) => {
            if (object.userData.isInteractive) {
                const distance = camera.position.distanceTo(object.position);
                if (distance < 2) {
                    showStatusMessage(object.userData.message);
                }
            }
        });
    }
});



// Store original sizes when the page loads
window.addEventListener('load', () => {
    scalableElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            el.style.setProperty('--original-font-size', style.fontSize);
            el.style.setProperty('--original-padding', style.padding);
        });
    });
});

function openInventory() {
    document.getElementById('inventory-modal').style.display = 'block';
}

function closeInventory() {
    document.getElementById('inventory-modal').style.display = 'none';
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'I' || event.key === 'i') {
        const inventoryModal = document.getElementById('inventory-modal');
        inventoryModal.style.display = inventoryModal.style.display === 'none' ? 'block' : 'none';
    }
});
