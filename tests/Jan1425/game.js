// Global variables
let inventoryLoaded = false;
const clock = new THREE.Clock(); // Create a new Three.js clock
let mapScene, mapCamera, mapRenderer; // Create a new Three.js scene, camera, and renderer for the fullscreen map.
let scene, camera, renderer; // Create a new Three.js scene, camera, and renderer
let player, ground, safeZoneGround; // Player, ground, and safe zone
let inventoryOpen = false; // Inventory state
let statsOpen = false; // Character stats state
let destination = null; // Destination for teleportation
let speed = 3.0; // Player movement speed
let minimapCamera; // Minimap camera
let enemies = []; // List of enemies
let gold = 0; // Gold amount
let bestiary = {}; // Bestiary data
const townRadius = 200; // Radius of the town
let quadrupeds = []; // List of quadrupeds
let walls = []; // List of walls
let friendlies = []; // List of friendlies
let helpWindowOpen = false; // Add this variable for help window
let isTeleporting = false; // Add this variable for teleportation
let adminConsoleOpen = false; // Add this variable for admin console
let teleportProgress = 0; // Add this variable for teleportation
let teleportationDuration = 3; // Duration in seconds
let previousPosition = null; // Add this variable for teleportation
let structures = []; // Add this variable for structures
let cameraAngle = 0;    // Add this variable for camera angle
let enemyWalls = []; // Walls that affect only enemies
let npcPopupOpen = false; // Track NPC popup state
let npcAdminEnabled = false; // Track NPC admin state
let currentNpc = null; // Track current NPC
let currentOpenedChest = null; // Added to address the popup issue
let treasureChests = []; // Added to keep track of treasure chests
let isAdminLoggedIn = true; // Add this variable for admin login
let quests = [];
let questLogOpen = false; // Add this variable for quest log
let isMouseDown = false; // Add this variable for mouse down
let mouseDestination = null; // Add this variable for mouse down
let cameraTargetAngle = 0; // Add this variable for camera target angle
let currentCameraAngle = 0; // Add this variable for current camera angle
const cameraRotationSpeed = 0.05; // Adjust for smoother or faster rotation
let rotateLeft = false; // Add this variable for rotation
let currentStructure = null; // Implement Structure Admin Functions
let rotateRight = false; // Add this variable for rotation
let globalEnemySpeed = 1; // Global variable for enemy speed
let activeDamageIntervals = new Map(); // Keep track of active damage intervals
const collidableTerrainObjects = [];       
let playerInventory = []; // Player inventory
let currentHealth = 100;
let maxHealth = 100;
let currentMana = 100;
let maxMana = 100;

// Cache geometries and materials
const HumanoidCache = {
    geometries: {
        body: new THREE.BoxGeometry(5, 7, 2),
        shirt: new THREE.BoxGeometry(6, 8, 3),
        pectorals: new THREE.BoxGeometry(4.5, 1.5, 1),
        lowerBody: new THREE.BoxGeometry(4, 3, 2.5),
        shorts: new THREE.BoxGeometry(5, 4, 3),
        head: new THREE.BoxGeometry(3, 3, 3),
        neckJoint: new THREE.SphereGeometry(1, 16, 16),
        hair: new THREE.BoxGeometry(3.2, 0.5, 3.2),
        eye: new THREE.SphereGeometry(0.2, 8, 8),
        nose: new THREE.BoxGeometry(0.2, 0.4, 0.2),
        arm: new THREE.BoxGeometry(1, 6, 1),
        shoulderJoint: new THREE.SphereGeometry(0.75, 16, 16),
        hipJoint: new THREE.SphereGeometry(0.8, 16, 16),
        kneeJoint: new THREE.SphereGeometry(0.6, 16, 16),
        upperLeg: new THREE.BoxGeometry(1.5, 4, 1.5),
        lowerLeg: new THREE.BoxGeometry(1.5, 4, 1.5),
        foot: new THREE.BoxGeometry(1.5, 0.5, 2),
        pubicHair: new THREE.PlaneGeometry(2, 1)
    },
    colors: {
        skin: [0xf5cba7, 0xe0ac69, 0xd2b48c, 0xffdbac, 0xc68642],
        hair: [0x4b3621, 0x2c1b18, 0xa52a2a, 0xffd700, 0x8b4513],
        clothing: [0x3333ff, 0xff3333, 0x33ff33, 0xffff33, 0xff33ff, 0x33ffff, 0xff9900]
    },
    materials: new Map()
};

const npcData = [
    { 
        name: 'John Reilly', 
        dialogue: 'Greetings, adventurer. May your journey be safe.', 
        occupation: 'Town Guard', 
        health: 100, 
        location: { x: 200, y: 0, z: -150 },
        faction: 'Town' 
    },
    { 
        name: 'Martha Reilly', 
        dialogue: 'Looking to trade? I have wares you might like.', 
        occupation: 'Merchant', 
        health: 100, 
        location: { x: 300, y: 0, z: -100 },
        faction: 'Town' 
    },
    { 
        name: 'Noah', 
        dialogue: 'Need your weapons sharpened?', 
        occupation: 'Blacksmith', 
        health: 120, 
        location: { x: 100, y: 0, z: -50 },
        faction: 'Town' 
    },
    { 
        name: 'Jace', 
        dialogue: 'These crops won\'t tend themselves.', 
        occupation: 'Farmer', 
        health: 80, 
        location: { x: 400, y: 0, z: 0 },
        faction: 'Village' 
    },
    { 
        name: 'Kaanan', 
        dialogue: 'Stay vigilant out there.', 
        occupation: 'Ranger', 
        health: 150, 
        location: { x: -50, y: 0, z: 50 },
        faction: 'Outskirts' 
    },
    { 
        name: 'Spyder', 
        dialogue: 'Got any info worth trading?', 
        occupation: 'Information Broker', 
        health: 70, 
        location: { x: 250, y: 0, z: -250 },
        faction: 'Underworld' 
    },
    { 
        name: 'Flick', 
        dialogue: 'Quick hands, quicker wit.', 
        occupation: 'Thief', 
        health: 60, 
        location: { x: 500, y: 0, z: -300 },
        faction: 'Rogue' 
    },
    { 
        name: 'ZANE', 
        dialogue: 'What do you seek?', 
        occupation: 'Mystic', 
        health: 90, 
        location: { x: -100, y: 0, z: 100 },
        faction: 'Wanderers' 
    },
    { 
        name: 'Bill', 
        dialogue: 'Another day, another coin.', 
        occupation: 'Innkeeper', 
        health: 100, 
        location: { x: 150, y: 0, z: -20 },
        faction: 'Town' 
    },
    { 
        name: 'Samantha', 
        dialogue: 'Every herb has a purpose.', 
        occupation: 'Healer', 
        health: 110, 
        location: { x: 120, y: 0, z: -120 },
        faction: 'Village' 
    },
    { 
        name: 'Julia', 
        dialogue: 'A good book can change your life.', 
        occupation: 'Librarian', 
        health: 80, 
        location: { x: 220, y: 0, z: -90 },
        faction: 'Town' 
    },
    { 
        name: 'Abigail', 
        dialogue: 'May the gods protect you.', 
        occupation: 'Priestess', 
        health: 90, 
        location: { x: -200, y: 0, z: -150 },
        faction: 'Sanctum' 
    },
    { 
        name: 'Guard 1', 
        dialogue: 'No one passes without permission.', 
        occupation: 'Guard', 
        health: 120, 
        location: { x: 300, y: 0, z: -200 },
        faction: 'Fortress' 
    },
    { 
        name: 'Guard 2', 
        dialogue: 'Stand down or face the consequences.', 
        occupation: 'Guard', 
        health: 120, 
        location: { x: 320, y: 0, z: -220 },
        faction: 'Fortress' 
    },
    { 
        name: 'Nick', 
        dialogue: 'It’s quiet… too quiet.', 
        occupation: 'Scout', 
        health: 90, 
        location: { x: -150, y: 0, z: 50 },
        faction: 'Outskirts' 
    },
    { 
        name: 'Xris Hawkins', 
        dialogue: 'Even in ruins, there’s beauty.', 
        occupation: 'Bard', 
        health: 100, 
        location: { x: 0, y: 0, z: 0 },
        faction: 'Wanderers' 
    },
    { 
        name: 'Samuel Kont', 
        dialogue: 'Science holds the answers you seek.', 
        occupation: 'Scientist', 
        health: 85, 
        location: { x: -300, y: 0, z: 50 },
        faction: 'Research Guild' 
    }
];

// Player health and energy
let playerHealth = 100;
const playerMaxHealth = 100;
let playerEnergy = 1;
const playerMaxEnergy = 1;

// Invulnerability variable
let playerInvulnerable = false;

// Looting variables
let isLooting = false;
let lootProgress = 0;
const lootDuration = 2; // Duration in seconds
let lootedItems = [];
let currentLootingEnemy = null;

// Initialize Character Stats with Expanded Attributes
let characterStats = {
    level: 1,
    experience: 0,
    nextLevelExperience: 100,
    strength: 10,
    dexterity: 10,
    vitality: 10,
    energy: 10,
    mana: 50,          // New Attribute
    karma: 0,          // New Attribute
    reputation: 0,     // New Attribute
    statPoints: 0
};


// Define skill tree data with new attributes
let skillTreeData = {
    strength: {
        name: 'Strength Boost',
        description: 'Increase your strength by 5.',
        cost: 1,
        learned: false,
        effects: { strength: 5 }
    },
    dexterity: {
        name: 'Dexterity Boost',
        description: 'Increase your dexterity by 5.',
        cost: 1,
        learned: false,
        effects: { dexterity: 5 }
    },
    vitality: {
        name: 'Vitality Boost',
        description: 'Increase your vitality by 5.',
        cost: 1,
        learned: false,
        effects: { vitality: 5 }
    },
    energy: {
        name: 'Energy Boost',
        description: 'Increase your energy by 5.',
        cost: 1,
        learned: false,
        effects: { energy: 5 }
    },
    mana: {
        name: 'Mana Pool',
        description: 'Increase your mana by 20.',
        cost: 2,
        learned: false,
        effects: { mana: 20 }
    },
    karmaInfluence: {
        name: 'Karma Influence',
        description: 'Increase your karma by 5.',
        cost: 2,
        learned: false,
        effects: { karma: 5 }
    },
    reputationBoost: {
        name: 'Reputation Boost',
        description: 'Increase your reputation by 10.',
        cost: 2,
        learned: false,
        effects: { reputation: 10 }
    }
    // Add more skills as needed
};

const color = 0xFFFFFF; // Example color in hexadecimal



document.addEventListener('DOMContentLoaded', () => {
    const lifeOrb = document.getElementById('lifeOrb');
    const energyOrb = document.getElementById('energyOrb');
    const lifeFill = document.getElementById('lifeFill');
    const energyFill = document.getElementById('energyFill');
    const lifeValue = document.getElementById('lifeValue');
    const energyValue = document.getElementById('energyValue');

    // Example values (replace with actual game or application data)
    let life = 75;    // Health percentage
    let energy = 50;  // Energy percentage

    // Function to update the orbs visually
    function updateOrbs() {
        const lifeFill = document.getElementById('lifeFill');
        const energyFill = document.getElementById('energyFill');
        const lifeValue = document.getElementById('lifeValue');
        const energyValue = document.getElementById('energyValue');

        // Calculate percentage for orbs
        const lifePercentage = (playerHealth / playerMaxHealth) * 100;
        const energyPercentage = (currentMana / maxMana) * 100;

        // Update the heights and values of the orbs
        lifeFill.style.height = `${lifePercentage}%`;
        energyFill.style.height = `${energyPercentage}%`;

        lifeValue.textContent = `${Math.round(lifePercentage)}%`;
        energyValue.textContent = `${Math.round(energyPercentage)}%`;
    }

    // Initialize orbs with initial values
    updateOrbs();

    
});

// Show Character Stats
function openStats() {
    const statsModal = document.getElementById('stats');
    statsModal.style.display = 'flex';  // or 'block', depending on your modal style
    statsModal.setAttribute('aria-hidden', 'false');
  }
  
  // Hide Character Stats
  function closeStats() {
    const statsModal = document.getElementById('stats');
    statsModal.style.display = 'none';
    statsModal.setAttribute('aria-hidden', 'true');
  }
  
  // Example: Hook up the 'C' key to open/close
  document.addEventListener('keydown', (event) => {
    if (event.key === 'c' || event.key === 'C') {
      const statsModal = document.getElementById('stats');
      // Toggle if it's open or closed
      if (statsModal.style.display === 'none' || !statsModal.style.display) {
        openStats();
      } else {
        closeStats();
      }
    }
  });
  