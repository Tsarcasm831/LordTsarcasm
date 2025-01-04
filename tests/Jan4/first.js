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
            let isAdminLoggedIn = false; // Add this variable for admin login
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
            

            
            
            // Function to open the music modal
            function openMusicModal() {
                console.log('openMusicModal called'); // Add this line
                document.getElementById('musicModal').style.display = 'flex';
            }

            // Function to close the music modal
            function closeMusicModal() {
                document.getElementById('musicModal').style.display = 'none';
            }

            // Update the button event listener
            const openMusicButton = document.getElementById('openMusic');
            if (openMusicButton) {
                openMusicButton.addEventListener('click', openMusicModal);
            } else {
                console.error("Button with ID 'openMusic' not found.");
            }

            // Add event listener for the close button
            const closeMusicModalButton = document.getElementById('closeMusicModal');
            if (closeMusicModalButton) {
                closeMusicModalButton.addEventListener('click', closeMusicModal);
            }

            // Update the keydown event
            document.addEventListener('keydown', function(event) {
                if (event.key === 'm' || event.key === 'M') {
                    openMusicModal();
                }
            });
        