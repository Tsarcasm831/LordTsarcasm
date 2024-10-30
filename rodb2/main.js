// main.js - Main game script

// Import necessary modules
import { WeatherSystem } from './weather.js';
import * as THREE from './node_modules/three/build/three.module.js';
import SimplexNoise from './node_modules/simplex-noise/dist/esm/simplex-noise.js';



// Define global variables and constants

const PARTICLE_POOL_SIZE = 15000;
const particlePool = [];
        
function initParticlePool() {
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
        particlePool.push(new THREE.Vector3());
    }
}

function getParticle() {
    return particlePool.pop() || new THREE.Vector3();
}

function releaseParticle(particle) {
    particlePool.push(particle);
}

let scene, camera, renderer, player, water, breakingIndicator;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, jump = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let isLocked = false;
let raycaster, interactableObjects = [];
let canJump = true;
let breakingObject = null;
let isPaused = false;

const settings = {
    chunkSize: 400,
    chunkResolution: 100,
    terrainHeight: 25,
    waterLevel: 0.02,
    treeCount: 5,
    renderDistance: 2,
    gravity: -9.8,
    jumpForce: 7,
    swimForce: 3,
    swimDrag: 0.9
};

const chunks = new Map();
const simplex = new SimplexNoise();
const mobs = [];
const clock = new THREE.Clock();
const terrainGeometry = new THREE.PlaneGeometry(settings.chunkSize, settings.chunkSize, settings.chunkResolution, settings.chunkResolution);
terrainGeometry.rotateX(-Math.PI / 2);
const terrainMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true
});

const trunkGeometry = new THREE.CylinderGeometry(1, 1.5, 10, 8);
const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
const leafGeometry = new THREE.ConeGeometry(8, 4, 8);
const leafMaterials = [
    new THREE.MeshPhongMaterial({ color: 0x228B22 }),
    new THREE.MeshPhongMaterial({ color: 0x32CD32 }),
    new THREE.MeshPhongMaterial({ color: 0x90EE90 })
];

let mouseDown = false;
let mouseDownTime = 0;
const breakTime = 1000;
// Define biomes
const biomes = {
    PLAINS: { color: 0x555555, treeColor: 0x333333, treeFrequency: 0.02 },
    FOREST: { color: 0x444444, treeColor: 0x222222, treeFrequency: 0.01 },
    DENSE_FOREST: { color: 0x333333, treeColor: 0x111111, treeFrequency: 0.005 },
    DESERT: { color: 0x777777, treeColor: 0x555555, treeFrequency: 0.005 },
    TUNDRA: { color: 0x999999, treeColor: 0x666666, treeFrequency: 0.01 },
    JUNGLE: { color: 0x666666, treeColor: 0x333333, treeFrequency: 0.005 },
    GROVE: { color: 0x888888, treeColor: 0x444444, treeFrequency: 0.01 },
    BEACH: { color: 0x666666, treeColor: 0x333333, treeFrequency: 0.005 }
};

// Implement Mob class
class Mob {
    constructor(position) {
        this.mesh = this.createMesh();
        this.mesh.position.copy(position);
        scene.add(this.mesh);
        this.direction = new THREE.Vector3(
            (Math.random() - 0.5),
            0,
            (Math.random() - 0.5)
        ).normalize();
        this.speed = 1.5;
        this.health = 50;
    }

    createMesh() {
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    update(delta) {
        const moveDistance = this.speed * delta;
        const movement = this.direction.clone().multiplyScalar(moveDistance);
        this.mesh.position.add(movement);

        if (Math.random() < 0.02) {
            this.direction.set(
                (Math.random() - 0.5),
                0,
                (Math.random() - 0.5)
            ).normalize();
        }

        const terrainHeight = getTerrainHeight(this.mesh.position.x, this.mesh.position.z);
        if (this.mesh.position.y < terrainHeight + 1) {
            this.mesh.position.y = terrainHeight + 1;
        }

        const distanceToPlayer = this.mesh.position.distanceTo(player.position);
        if (distanceToPlayer < 2) {
            this.attackPlayer();
        }
    }

    attackPlayer() {
        health = Math.max(0, health - 0.1);
        updateStatusBars();
    }
}

let currentWeather = 'clear';
let rainParticles, snowParticles;
let rainClouds = [];
let health = 100;
let hunger = 100;

// Initialize Inventory
const inventory = {
    items: Array(36).fill(null),
    selectedSlot: 0,

    addItem: function(item) {
        const existingSlot = this.items.findIndex(slot => slot && slot.name === item && slot.count < 10);
        if (existingSlot !== -1) {
            this.items[existingSlot].count++;
        } else {
            const emptySlot = this.items.findIndex(slot => slot === null);
            if (emptySlot !== -1) {
                this.items[emptySlot] = { name: item, count: 1 };
            } else {
                return false;
            }
        }
        this.updateUI();
        updateInHandDisplay();
        return true;
    },

    removeItem: function(slot) {
        if (this.items[slot] !== null) {
            const item = this.items[slot].name;
            this.items[slot].count--;
            if (this.items[slot].count === 0) {
                this.items[slot] = null;
            }
            this.updateUI();
            updateInHandDisplay();
            return item;
        }
        return null;
    },

    updateUI: function() {
        const hotbar = document.getElementById('hotbar');
        const inventoryGrid = document.getElementById('inventory-grid');

        hotbar.innerHTML = '';
        inventoryGrid.innerHTML = '';

        for (let i = 0; i < 36; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.setAttribute('data-slot', i);
            if (this.items[i]) {
                slot.textContent = this.items[i].name;
                const count = document.createElement('span');
                count.className = 'item-count';
                count.textContent = this.items[i].count;
                slot.appendChild(count);
            }
            slot.addEventListener('click', () => this.selectSlot(i));
            if (i === this.selectedSlot) slot.classList.add('selected');

            slot.draggable = true;
            slot.addEventListener('dragstart', this.dragStart.bind(this));
            slot.addEventListener('dragover', this.dragOver);
            slot.addEventListener('drop', this.drop.bind(this));

            if (i < 9) {
                hotbar.appendChild(slot);
            } else {
                inventoryGrid.appendChild(slot);
            }
        }
    },

    selectSlot: function(slot) {
        this.selectedSlot = slot;
        this.updateUI();
        updateInHandDisplay();
    },

    toggleInventoryAndCrafting: function() {
        const inventoryGrid = document.getElementById('inventory-grid');
        const craftingMenu = document.getElementById('crafting-menu');
        if (inventoryGrid.style.display === 'none') {
            inventoryGrid.style.display = 'grid';
            craftingMenu.style.display = 'flex';
            isPaused = true;
            document.exitPointerLock();
        } else {
            inventoryGrid.style.display = 'none';
            craftingMenu.style.display = 'none';
            isPaused = false;
            renderer.domElement.requestPointerLock();
        }
    },

    dragStart: function(e) {
        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-slot'));
    },

    dragOver: function(e) {
        e.preventDefault();
    },

    drop: function(e) {
        e.preventDefault();
        const fromSlot = parseInt(e.dataTransfer.getData('text'));
        const toSlot = parseInt(e.target.getAttribute('data-slot'));

        if (fromSlot !== toSlot) {
            const temp = this.items[fromSlot];
            this.items[fromSlot] = this.items[toSlot];
            this.items[toSlot] = temp;
            this.updateUI();
            updateInHandDisplay();
        }
    },

    createItemMesh: function(item) {
        let geometry, material;
        switch (item) {
            case 'Stick':
                geometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
                material = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
                break;
            case 'Cactus Spine':
                geometry = new THREE.ConeGeometry(0.05, 0.5, 8);
                material = new THREE.MeshPhongMaterial({ color: 0x2F4F4F });
                break;
            case 'Stone':
                geometry = new THREE.DodecahedronGeometry(0.2, 0);
                material = new THREE.MeshPhongMaterial({ color: 0x808080 });
                break;
            case 'Apple':
                geometry = new THREE.SphereGeometry(0.2, 16, 16);
                material = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
                const stem = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8),
                    new THREE.MeshPhongMaterial({ color: 0x8B4513 })
                );
                stem.position.y = 0.2;
                const apple = new THREE.Mesh(geometry, material);
                apple.add(stem);
                return apple;
            case 'String':
                geometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
                material = new THREE.MeshPhongMaterial({ color: 0xEEEEEE });
                break;
            case 'Hammer':
                const hammerGroup = new THREE.Group();
                const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
                const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
                const handle = new THREE.Mesh(handleGeometry, handleMaterial);
                handle.rotation.z = Math.PI / 2;
                hammerGroup.add(handle);
                const headGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.15);
                const headMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
                const head = new THREE.Mesh(headGeometry, headMaterial);
                head.position.x = 0.5;
                hammerGroup.add(head);
                return hammerGroup;
            case 'Coconut':
                geometry = new THREE.SphereGeometry(0.2, 16, 16);
                material = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
                break;
            case 'Wooden Wall':
                geometry = new THREE.BoxGeometry(5, 3, 0.5);
                material = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
                break;
            case 'Wooden Floor':
                geometry = new THREE.PlaneGeometry(5, 5);
                material = new THREE.MeshPhongMaterial({ color: 0xDEB887, side: THREE.DoubleSide });
                break;
            case 'Wooden Door':
                const doorGroup = new THREE.Group();
                const doorGeometry = new THREE.BoxGeometry(1, 2, 0.1);
                const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
                const door = new THREE.Mesh(doorGeometry, doorMaterial);
                door.position.y = 1;
                doorGroup.add(door);
                return doorGroup;
            case 'Stone Wall':
                geometry = new THREE.BoxGeometry(5, 3, 0.5);
                material = new THREE.MeshPhongMaterial({ color: 0x808080 });
                break;
            case 'Stone Floor':
                geometry = new THREE.PlaneGeometry(5, 5);
                material = new THREE.MeshPhongMaterial({ color: 0xA9A9A9, side: THREE.DoubleSide });
                break;
            default:
                geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        }
        return new THREE.Mesh(geometry, material);
    }
};
const crafting = {
    grid: Array(4).fill(null),
    result: null,

    updateUI: function() {
        const craftingGrid = document.getElementById('crafting-grid');
        const craftingResult = document.getElementById('crafting-result');

        craftingGrid.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.setAttribute('data-slot', i);
            if (this.grid[i]) {
                slot.textContent = this.grid[i].name;
                const count = document.createElement('span');
                count.className = 'item-count';
                count.textContent = this.grid[i].count;
                slot.appendChild(count);
            }
            slot.addEventListener('click', () => this.onSlotClick(i));
            craftingGrid.appendChild(slot);
        }

        craftingResult.innerHTML = '';
        if (this.result) {
            craftingResult.textContent = this.result.name;
            const count = document.createElement('span');
            count.className = 'item-count';
            count.textContent = this.result.count;
            craftingResult.appendChild(count);
        }
    },

    onSlotClick: function(slot) {
        const selectedItem = inventory.items[inventory.selectedSlot];
        if (selectedItem) {
            if (this.grid[slot] && this.grid[slot].name === selectedItem.name) {
                this.grid[slot].count++;
            } else {
                this.grid[slot] = { name: selectedItem.name, count: 1 };
            }
            inventory.removeItem(inventory.selectedSlot);
        } else if (this.grid[slot]) {
            inventory.addItem(this.grid[slot].name);
            this.grid[slot] = null;
        }
        this.checkRecipe();
        this.updateUI();
        inventory.updateUI();
    },

    checkRecipe: function() {
        const recipes = [
            {
                ingredients: ['Stick', 'String', 'Stone', 'Stone'],
                result: { name: 'Hammer', count: 1 }
            }
        ];

        for (const recipe of recipes) {
            const flatGrid = this.grid.filter(item => item !== null).map(item => item.name);
            if (this.arraysEqual(flatGrid.sort(), recipe.ingredients.sort())) {
                this.result = recipe.result;
                return;
            }
        }
        this.result = null;
    },

    arraysEqual: function(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    },

    craft: function() {
        if (this.result) {
            inventory.addItem(this.result.name);
            this.grid = Array(4).fill(null);
            this.result = null;
            this.updateUI();
            inventory.updateUI();
            updateInHandDisplay();
        }
    }
};


// Implement updateInHandDisplay, lockPointer, createPlayer, updateStatusBars, initInventory,
function updateInHandDisplay() {
    const canvas = document.getElementById('player-hand-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(200, 200);
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const scene = new THREE.Scene();

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 10);
    scene.add(light);

    const handGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.2);
    const handMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    const hand = new THREE.Mesh(handGeometry, handMaterial);
    hand.position.set(0, -0.5, -1);
    hand.rotation.x = Math.PI / 6;
    scene.add(hand);

    const selectedItem = inventory.items[inventory.selectedSlot];
    if (selectedItem) {
        const itemMesh = inventory.createItemMesh(selectedItem.name);
        itemMesh.position.set(0, 0, -1);
        itemMesh.rotation.set(Math.PI / 4, Math.PI / 4, 0);
        hand.add(itemMesh);
    }

    renderer.render(scene, camera);
}

function lockPointer() {
    renderer.domElement.requestPointerLock();
}

function createPlayer() {
    player = new THREE.Object3D();
    player.add(camera);
    camera.position.set(0, 2, 0);
    player.position.set(0, getTerrainHeight(0, 0) + 2, 0);
    scene.add(player);
}

function updateStatusBars() {
    document.querySelector('#health-bar .bar-fill').style.width = `${health}%`;
    document.querySelector('#hunger-bar .bar-fill').style.width = `${hunger}%`;
}

function initInventory() {
    for (let i = 0; i < 3; i++) {
        inventory.addItem('Apple');
    }
    inventory.updateUI();
    document.addEventListener('keydown', (event) => {
        if (event.code === 'KeyE') {
            inventory.toggleInventoryAndCrafting();
        } else if (event.code >= 'Digit1' && event.code <= 'Digit9') {
            inventory.selectSlot(parseInt(event.code.charAt(5)) - 1);
            updateInHandDisplay();
        } else if (event.code === 'KeyP') {
            togglePause();
        }
        if (event.code === 'Backquote') {
            toggleAdminConsole();
        }
    });

    document.getElementById('craft-button').addEventListener('click', () => crafting.craft());
    document.getElementById('spawn-button').addEventListener('click', () => {
        const selectedObject = document.getElementById('spawn-object-menu').value;
        spawnObject(selectedObject);
    });

    document.getElementById('set-time-button').addEventListener('click', () => {
        const timeOfDay = document.getElementById('time-of-day').value;
        setTimeOfDay(timeOfDay);
    });

    document.getElementById('set-weather-button').addEventListener('click', () => {
        const weather = document.getElementById('weather').value;
        setWeather(weather);
    });

    document.getElementById('set-health-button').addEventListener('click', () => {
        const newHealth = parseInt(document.getElementById('player-health').value);
        health = Math.max(0, Math.min(100, newHealth));
        updateStatusBars();
    });

    document.getElementById('set-hunger-button').addEventListener('click', () => {
        const newHunger = parseInt(document.getElementById('player-hunger').value);
        hunger = Math.max(0, Math.min(100, newHunger));
        updateStatusBars();
    });

    document.getElementById('give-item-button').addEventListener('click', () => {
        const selectedItem = document.getElementById('give-item').value;
        if (!inventory.addItem(selectedItem)) {
            console.log("Inventory is full or item cannot be added.");
        } else {
            console.log(`${selectedItem} added to inventory.`);
        }
    });

    document.getElementById('set-gravity-button').addEventListener('click', () => {
        const newGravity = parseFloat(document.getElementById('gravity').value);
        settings.gravity = newGravity;
        console.log(`Gravity set to ${newGravity}.`);
    });

    document.getElementById('set-jump-force-button').addEventListener('click', () => {
        const newJumpForce = parseFloat(document.getElementById('jump-force').value);
        settings.jumpForce = newJumpForce;
        console.log(`Jump force set to ${newJumpForce}.`);
    });

    document.getElementById('spawn-mob-button').addEventListener('click', () => {
        const x = player.position.x + (Math.random() - 0.5) * 20;
        const z = player.position.z + (Math.random() - 0.5) * 20;
        const y = getTerrainHeight(x, z) + 1;
        const mob = new Mob(new THREE.Vector3(x, y, z));
        mobs.push(mob);
        console.log("Mob spawned.");
    });

    document.getElementById('remove-mobs-button').addEventListener('click', () => {
        for (let mob of mobs) {
            scene.remove(mob.mesh);
        }
        mobs.length = 0;
        console.log("All mobs removed.");
    });

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const tabId = 'tab-' + button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// toggleAdminConsole, spawnObject, spawnMobs, togglePause, createWater, createBreakingIndicator,
function toggleAdminConsole() {
    const adminConsole = document.getElementById('admin-console');
    if (adminConsole.style.display === 'none') {
        adminConsole.style.display = 'block';
        isPaused = true;
        document.exitPointerLock();
    } else {
        adminConsole.style.display = 'none';
        isPaused = false;
        renderer.domElement.requestPointerLock();
    }
}

function spawnObject(objectType) {
    let object;
    switch (objectType) {
        case 'tree':
            object = createStylizedTree(0x228B22);
            break;
        case 'rock':
            object = createRock();
            break;
        case 'boulder':
            object = createBoulder();
            break;
        case 'apple_tree':
            object = createAppleTree();
            break;
        case 'cactus':
            object = createCactus();
            break;
        case 'palm_tree':
            object = createPalmTree();
            break;
        case 'spider_web':
            object = createSpiderWeb();
            break;
        case 'wooden_wall':
            object = createWoodenWall();
            objectType = 'wooden_wall';
            break;
        case 'wooden_floor':
            object = createWoodenFloor();
            objectType = 'wooden_floor';
            break;
        case 'wooden_door':
            object = createWoodenDoor();
            objectType = 'wooden_door';
            break;
        case 'stone_wall':
            object = createStoneWall();
            objectType = 'stone_wall';
            break;
        case 'stone_floor':
            object = createStoneFloor();
            objectType = 'stone_floor';
            break;
        default:
            console.warn('Unknown object type:', objectType);
            return;
    }
    if (object) {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        object.position.copy(player.position).add(forward.multiplyScalar(5));
        scene.add(object);
        interactableObjects.push({ mesh: object, type: objectType, health: 50 });
    }
}

function spawnMobs() {
    const mobCount = 500;
    for (let i = 0; i < mobCount; i++) {
        const x = (Math.random() - 0.5) * settings.chunkSize * settings.renderDistance * 2;
        const z = (Math.random() - 0.5) * settings.chunkSize * settings.renderDistance * 2;
        const y = getTerrainHeight(x, z) + 1;
        const mob = new Mob(new THREE.Vector3(x, y, z));
        mobs.push(mob);
    }
}

function togglePause() {
    isPaused = !isPaused;
    const pauseScreen = document.getElementById('pause-screen');
    if (isPaused) {
        pauseScreen.style.display = 'flex';
        document.exitPointerLock();
    } else {
        pauseScreen.style.display = 'none';
        renderer.domElement.requestPointerLock();
    }
}

function createWater() {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x0077be,
        transparent: true,
        opacity: 0.6
    });
    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = settings.terrainHeight * settings.waterLevel - 10;
    scene.add(water);
}

function createBreakingIndicator() {
    const geometry = new THREE.RingGeometry(0.5, 0.7, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const indicator = new THREE.Mesh(geometry, material);
    indicator.rotation.x = -Math.PI / 2;
    indicator.visible = false;
    scene.add(indicator);
    return indicator;
}

// createSun, createWoodenFloor, createWoodenWall, createWoodenDoor, createStoneWall, createStoneFloor,
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(50, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 500, 0);
    scene.add(sun);
    return sun;
}

function createWoodenFloor() {
    const geometry = new THREE.PlaneGeometry(5, 5);
    const material = new THREE.MeshPhongMaterial({ color: 0xDEB887, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    return floor;
}

function createWoodenWall() {
    const geometry = new THREE.BoxGeometry(5, 3, 0.5);
    const material = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const wall = new THREE.Mesh(geometry, material);
    wall.position.y = 1.5;
    return wall;
}

function createWoodenDoor() {
    const doorGroup = new THREE.Group();
    const doorGeometry = new THREE.BoxGeometry(1, 2, 0.1);
    const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.y = 1;
    doorGroup.add(door);
    return doorGroup;
}

function createStoneWall() {
    const geometry = new THREE.BoxGeometry(5, 3, 0.5);
    const material = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const wall = new THREE.Mesh(geometry, material);
    wall.position.y = 1.5;
    return wall;
}

function createStoneFloor() {
    const geometry = new THREE.PlaneGeometry(5, 5);
    const material = new THREE.MeshPhongMaterial({ color: 0xA9A9A9, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    return floor;
}

function init() {
    initParticlePool();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x343434);
    scene.fog = new THREE.Fog(0x343434, 50, 1000);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    weatherSystem = new WeatherSystem(scene, player, biomes, getBiome);
    breakingIndicator = createBreakingIndicator();
    const sun = createSun();

    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(100, 100, 100);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    scene.add(light);

    scene.add(new THREE.AmbientLight(0x404040, 0.2));

    createWater();
    createPlayer();
    spawnMobs();
    initWeatherEffects();
    createRainClouds();
    initInventory();

    raycaster = new THREE.Raycaster();

    renderer.domElement.addEventListener('click', lockPointer);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);

    updateInHandDisplay();
    updateStatusBars();
    crafting.updateUI();

    animate();
}

function onMouseMove(event) {
    if (isLocked) {
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        player.rotation.y -= movementX * 0.002;
        camera.rotation.x -= movementY * 0.002;
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    }
}

function decreaseHunger() {
    if (isLocked && !isPaused) {
        hunger = Math.max(0, hunger - 0.01);
        if (hunger === 0) {
            health = Math.max(0, health - 0.01);
        }
        updateStatusBars();
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!isPaused) {
        if (isLocked) {
            const delta = Math.min(clock.getDelta(), 0.1);

            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;

            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveRight) - Number(moveLeft);
            direction.normalize();

            if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
            if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

            const terrainHeight = getTerrainHeight(player.position.x, player.position.z);
            const waterSurfaceHeight = settings.terrainHeight * settings.waterLevel - 10;

            if (jump && canJump && player.position.y <= terrainHeight + 2) {
                velocity.y = settings.jumpForce;
                canJump = false;
                setTimeout(() => { canJump = true; }, 500);
            }

            velocity.y += settings.gravity * delta;

            if (player.position.y < waterSurfaceHeight) {
                velocity.y *= settings.swimDrag;
                if (jump) {
                    velocity.y += settings.swimForce * delta;
                }
            }

            player.translateX(-velocity.x * delta);
            player.translateZ(velocity.z * delta);
            player.position.y += velocity.y * delta;

            if (player.position.y < terrainHeight + 2) {
                player.position.y = terrainHeight + 2;
                velocity.y = 0;
                canJump = true;
            }

            if (mouseDown && breakingObject) {
                const progress = (Date.now() - mouseDownTime) / breakTime;
                breakingIndicator.scale.set(progress, progress, 1);
                breakingIndicator.material.opacity = 1 - progress;

                if (progress >= 1) {
                    breakObject(breakingObject);
                    breakingObject = null;
                    breakingIndicator.visible = false;
                }
            }
            // Update Weather
            weatherSystem.updateWeather();

            water.position.x = camera.position.x;
            water.position.z = camera.position.z;

            camera.getWorldDirection(direction);

            decreaseHunger();

            for (let mob of mobs) {
                mob.update(delta);
            }

             if (health <= 0) {
                 console.log("Game Over");
                 isLocked = false;
                 document.exitPointerLock();
             }
         }

         const sunRotationSpeed = 0.1;
         const sun = scene.getObjectByName('sun');
         if (sun) {
             sun.position.x = 1000 * Math.cos(sunRotationSpeed * Date.now() / 1000);
             sun.position.y = 500 * Math.sin(sunRotationSpeed * Date.now() / 1000) + 500;
             sun.position.z = 1000 * Math.sin(sunRotationSpeed * Date.now() / 1000);
         }

         updateChunks();
         updateWeather();
         renderer.render(scene, camera);
     }
}

function breakObject(object) {
    let itemToAdd;
    let count = 1;
    switch (object.type) {
        case 'tree_branch':
            itemToAdd = 'Stick';
            break;
        case 'cactus_spine':
            itemToAdd = 'Cactus Spine';
            break;
        case 'rock':
            itemToAdd = 'Stone';
            break;
        case 'boulder':
            itemToAdd = 'Stone';
            count = 3;
            break;
        case 'apple':
            itemToAdd = 'Apple';
            break;
        case 'spider_web':
            itemToAdd = 'String';
            break;
        case 'coconut':
            itemToAdd = 'Coconut';
            break;
        case 'mob':
            object.health -= 25;
            if (object.health <= 0) {
                scene.remove(object.mesh);
                const index = interactableObjects.indexOf(object);
                if (index > -1) {
                    interactableObjects.splice(index, 1);
                }
                const mobIndex = mobs.indexOf(object);
                if (mobIndex > -1) {
                    mobs.splice(mobIndex, 1);
                }
            }
            return;
    }

    for (let i = 0; i < count; i++) {
        if (!inventory.addItem(itemToAdd)) {
            break;
        }
    }

    const index = interactableObjects.indexOf(object);
    if (index > -1) {
        interactableObjects.splice(index, 1);
        object.mesh.parent.remove(object.mesh);
    }
    updateInHandDisplay();
}

function onMouseDown(event) {
    if (isLocked) {
        mouseDown = true;
        mouseDownTime = Date.now();

        raycaster.setFromCamera(new THREE.Vector2(), camera);
        const intersects = raycaster.intersectObjects(interactableObjects.map(obj => obj.mesh));
        if (intersects.length > 0) {
            const object = interactableObjects.find(obj => obj.mesh === intersects[0].object);
            if (object) {
                if (object.type === 'mob') {
                    breakObject(object);
                    return;
                }
                const selectedItem = inventory.items[inventory.selectedSlot];
                if (object.type === 'boulder' && (!selectedItem || selectedItem.name !== 'Hammer')) {
                    console.log("You need a hammer to break this boulder!");
                    return;
                }
                breakingObject = object;
                breakingIndicator.position.copy(intersects[0].point);
                breakingIndicator.visible = true;
            }
        }

        const selectedItem = inventory.items[inventory.selectedSlot];
        if (selectedItem && selectedItem.name === 'Apple') {
            inventory.removeItem(inventory.selectedSlot);
            hunger = Math.min(100, hunger + 20);
            updateStatusBars();
            updateInHandDisplay();
        }
        if (selectedItem && selectedItem.name === 'Coconut') {
            inventory.removeItem(inventory.selectedSlot);
            hunger = Math.min(100, hunger + 15);
            updateStatusBars();
            updateInHandDisplay();
        }
    }
}

document.addEventListener('pointerlockerror', function(event) {
    console.error('Pointer lock error:', event);
    alert('Failed to lock the pointer. Please try again.');
});

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Space': if (canJump) jump = true; break;
        case 'KeyP':
            togglePause();
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
        case 'Space': jump = false; break;
    }
}

function onMouseUp(event) {
    mouseDown = false;
    mouseDownTime = 0;
    breakingObject = null;
    breakingIndicator.visible = false;
}


// getBiome,
// getCurrentBiome, updateBiomeInfo, generateChunkTerrain,
// createCactus, createAppleTree, createPalmTree, createStylizedTree, createRock,
// createBoulder, createSpiderWeb, getTerrainHeight, updateChunks, setTimeOfDay, setWeather, breakObject, onMouseDown, onPointerLockChange, onWindowResize, onKeyDown, onKeyUp, onMouseUp, onMouseMove, decreaseHunger, etc.

// Example: Implement getBiome, getCurrentBiome, updateBiomeInfo
function getBiome(x, z) {
    const temperature = simplex.noise2D(x / 1000, z / 1000);
    const moisture = simplex.noise2D(x / 1000 + 1000, z / 1000 + 1000);
    const denseForestNoise = simplex.noise2D(x / 500, z / 500);
    const groveNoise = simplex.noise2D(x / 300, z / 300);
    const beachNoise = simplex.noise2D(x / 200, z / 200);

    const terrainHeight = getTerrainHeight(x, z);
    const waterSurfaceHeight = settings.terrainHeight * settings.waterLevel - 10;
    const nearWater = Math.abs(terrainHeight - waterSurfaceHeight) < 5;

    if (temperature < -0.5) return biomes.TUNDRA;
    if (temperature > 0.5 && moisture < -0.3) return biomes.DESERT;
    if (moisture > 0.3) return biomes.JUNGLE;
    if (moisture > 0 || temperature > 0) {
        if (denseForestNoise > 0.2) return biomes.DENSE_FOREST;
        if (groveNoise > 0.3) return biomes.GROVE;
        if (nearWater && beachNoise > 0.6 && temperature > 0) return biomes.BEACH;
        return biomes.FOREST;
    }
    return biomes.PLAINS;
}

function getCurrentBiome() {
    return getBiome(player.position.x, player.position.z);
}

function updateBiomeInfo() {
    const currentBiome = getCurrentBiome();
    const biomeNames = {
        [biomes.PLAINS]: "Plains",
        [biomes.FOREST]: "Forest",
        [biomes.DENSE_FOREST]: "Dense Forest",
        [biomes.DESERT]: "Desert",
        [biomes.TUNDRA]: "Tundra",
        [biomes.JUNGLE]: "Jungle",
        [biomes.GROVE]: "Grove",
        [biomes.BEACH]: "Beach"
    };
    const biomeName = biomeNames[currentBiome] || "Unknown";
    document.getElementById('biome-info').textContent = `Current Biome: ${biomeName}`;
}

// Implement generateChunkTerrain (already shown above)
function generateChunkTerrain(chunkX, chunkZ) {
    const chunkKey = `${chunkX},${chunkZ}`;
    if (chunks.has(chunkKey)) return chunks.get(chunkKey);

    const geometry = terrainGeometry.clone();
    const vertices = geometry.attributes.position.array;
    const colors = new Float32Array(vertices.length);

    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i] + chunkX * settings.chunkSize;
        const z = vertices[i + 2] + chunkZ * settings.chunkSize;

        const baseNoise = simplex.noise2D(x / 500, z / 500);
        const detailNoise = simplex.noise2D(x / 100, z / 100) * 0.5;
        const combinedNoise = (baseNoise + detailNoise) / 1.5;

        vertices[i + 1] = combinedNoise * settings.terrainHeight;

        const biome = getBiome(x, z);
        const color = new THREE.Color(biome.color);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }

    geometry.computeVertexNormals();
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const terrain = new THREE.Mesh(geometry, terrainMaterial);
    terrain.receiveShadow = true;
    terrain.castShadow = true;

    const chunkGroup = new THREE.Group();
    chunkGroup.add(terrain);

    for (let i = 0; i < settings.treeCount; i++) {
        const x = Math.random() * settings.chunkSize;
        const z = Math.random() * settings.chunkSize;
        const worldX = x + chunkX * settings.chunkSize;
        const worldZ = z + chunkZ * settings.chunkSize;
        const y = getTerrainHeight(worldX, worldZ);
        const biome = getBiome(worldX, worldZ);

        if (y > settings.terrainHeight * settings.waterLevel - 10 && Math.random() < biome.treeFrequency) {
            let object;
            let objectType;
            if (biome === biomes.DESERT) {
                object = createCactus();
                objectType = 'cactus';
            } else if (biome === biomes.GROVE) {
                object = createAppleTree();
                objectType = 'apple_tree';
            } else if (biome === biomes.BEACH) {
                object = createPalmTree();
                objectType = 'palm_tree';
            } else {
                object = createStylizedTree(biome.treeColor);
                objectType = 'tree';
            }
            object.position.set(x, y, z);
            chunkGroup.add(object);
            interactableObjects.push({ mesh: object, type: objectType, health: 50 });
        }
    }

    const rockCount = 5;
    for (let i = 0; i < rockCount; i++) {
        const x = Math.random() * settings.chunkSize;
        const z = Math.random() * settings.chunkSize;
        const worldX = x + chunkX * settings.chunkSize;
        const worldZ = z + chunkZ * settings.chunkSize;
        const y = getTerrainHeight(worldX, worldZ);

        if (y > settings.terrainHeight * settings.waterLevel - 10) {
            const rock = createRock();
            rock.position.set(x, y, z);
            chunkGroup.add(rock);
            interactableObjects.push({ mesh: rock, type: 'rock', health: 25 });
        }
    }

    const boulderCount = 2;
    for (let i = 0; i < boulderCount; i++) {
        const x = Math.random() * settings.chunkSize;
        const z = Math.random() * settings.chunkSize;
        const worldX = x + chunkX * settings.chunkSize;
        const worldZ = z + chunkZ * settings.chunkSize;
        const y = getTerrainHeight(worldX, worldZ);

        if (y > settings.terrainHeight * settings.waterLevel - 10) {
            const boulder = createBoulder();
            boulder.position.set(x, y, z);
            chunkGroup.add(boulder);
            interactableObjects.push({ mesh: boulder, type: 'boulder', health: 50 });
        }
    }

    const webCount = 3;
    for (let i = 0; i < webCount; i++) {
        const x = Math.random() * settings.chunkSize;
        const z = Math.random() * settings.chunkSize;
        const worldX = x + chunkX * settings.chunkSize;
        const worldZ = z + chunkZ * settings.chunkSize;
        const y = getTerrainHeight(worldX, worldZ);
        const biome = getBiome(worldX, worldZ);

        if (biome === biomes.DESERT && y > settings.terrainHeight * settings.waterLevel - 10) {
            const web = createSpiderWeb();
            web.position.set(x, y + 1, z);
            chunkGroup.add(web);
            interactableObjects.push({ mesh: web, type: 'spider_web', health: 10 });
        }
    }

    chunkGroup.position.set(chunkX * settings.chunkSize, 0, chunkZ * settings.chunkSize);
    scene.add(chunkGroup);

    chunks.set(chunkKey, chunkGroup);
    return chunkGroup;
}

function createCactus() {
    const cactusGroup = new THREE.Group();
    const cactusGeometry = new THREE.BoxGeometry(2, 10, 2);
    const cactusMaterial = new THREE.MeshPhongMaterial({ color: 0x2E8B57 });
    const cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);
    cactus.position.y = 5;
    cactusGroup.add(cactus);

    const armGeometry = new THREE.BoxGeometry(1.5, 4, 1.5);
    const leftArm = new THREE.Mesh(armGeometry, cactusMaterial);
    leftArm.position.set(-1.75, 3, 0);
    leftArm.rotation.z = Math.PI / 4;
    cactusGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, cactusMaterial);
    rightArm.position.set(1.75, 5, 0);
    rightArm.rotation.z = -Math.PI / 4;
    cactusGroup.add(rightArm);

    const spineGeometry = new THREE.ConeGeometry(0.1, 1, 8);
    const spineMaterial = new THREE.MeshPhongMaterial({ color: 0x2F4F4F });
    for (let i = 0; i < 20; i++) {
        const spine = new THREE.Mesh(spineGeometry, spineMaterial);
        spine.position.set(
            (Math.random() - 0.5) * 2,
            Math.random() * 10,
            (Math.random() - 0.5) * 2
        );
        spine.rotation.set(Math.random() * Math.PI, 0, Math.random() * Math.PI);
        cactusGroup.add(spine);
        interactableObjects.push({ mesh: spine, type: 'cactus_spine', health: 10 });
    }

    cactusGroup.castShadow = true;
    cactusGroup.receiveShadow = true;

    return cactusGroup;
}

function createAppleTree() {
    const treeGroup = createStylizedTree(0x228B22);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 5;
    treeGroup.add(trunk);

    const appleGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const appleMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
    for (let i = 0; i < 10; i++) {
        const apple = new THREE.Mesh(appleGeometry, appleMaterial);
        apple.position.set(
            (Math.random() - 0.5) * 6,
            10 + Math.random() * 5,
            (Math.random() - 0.5) * 6
        );
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8),
            new THREE.MeshPhongMaterial({ color: 0x8B4513 })
        );
        stem.position.y = 0.5;
        apple.add(stem);
        treeGroup.add(apple);
        interactableObjects.push({ mesh: apple, type: 'apple', health: 5 });
    }

    return treeGroup;
}

function createPalmTree() {
    const treeGroup = new THREE.Group();

    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 10, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 5;
    treeGroup.add(trunk);

    const leafGeometry = new THREE.ConeGeometry(4, 6, 4);
    const leafMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
    for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.y = 10;
        leaf.rotation.x = Math.PI / 6;
        leaf.rotation.y = (i / 5) * Math.PI * 2;
        treeGroup.add(leaf);
    }

    const coconutGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const coconutMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    for (let i = 0; i < 3; i++) {
        const coconut = new THREE.Mesh(coconutGeometry, coconutMaterial);
        coconut.position.set(
            (Math.random() - 0.5) * 2,
            10 + Math.random() * 2,
            (Math.random() - 0.5) * 2
        );
        treeGroup.add(coconut);
        interactableObjects.push({ mesh: coconut, type: 'coconut', health: 5 });
    }

    treeGroup.castShadow = true;
    treeGroup.receiveShadow = true;

    return treeGroup;
}

function createStylizedTree(treeColor) {
    const treeGroup = new THREE.Group();

    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 5;
    treeGroup.add(trunk);

    const leafMaterial = new THREE.MeshPhongMaterial({ color: treeColor });
    for (let i = 0; i < 3; i++) {
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.y = 10 + i * 2;
        leaf.scale.setScalar(1 - i * 0.2);
        treeGroup.add(leaf);
    }

    const branchGeometry = new THREE.CylinderGeometry(0.2, 0.1, 3, 8);
    const branchMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    for (let i = 0; i < 5; i++) {
        const branch = new THREE.Mesh(branchGeometry, branchMaterial);
        branch.position.set(
            (Math.random() - 0.5) * 4,
            8 + Math.random() * 4,
            (Math.random() - 0.5) * 4
        );
        branch.rotation.set(Math.random() * Math.PI / 2, 0, Math.random() * Math.PI * 2);
        treeGroup.add(branch);
        interactableObjects.push({ mesh: branch, type: 'tree_branch', health: 15 });
    }

    treeGroup.castShadow = true;
    treeGroup.receiveShadow = true;

    return treeGroup;
}

function createRock() {
    const geometry = new THREE.DodecahedronGeometry(Math.random() * 0.5 + 0.5, 0);
    const material = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const rock = new THREE.Mesh(geometry, material);
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
}

function createBoulder() {
    const geometry = new THREE.DodecahedronGeometry(Math.random() * 2 + 2, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const boulder = new THREE.Mesh(geometry, material);
    boulder.castShadow = true;
    boulder.receiveShadow = true;
    return boulder;
}

function createSpiderWeb() {
    const webGeometry = new THREE.CircleGeometry(2, 6);
    const webMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const web = new THREE.Mesh(webGeometry, webMaterial);
    web.rotation.x = -Math.PI / 2;
    return web;
}

function getTerrainHeight(x, z) {
    const baseNoise = simplex.noise2D(x / 500, z / 500);
    const detailNoise = simplex.noise2D(x / 100, z / 100) * 0.5;
    const combinedNoise = (baseNoise + detailNoise) / 1.5;
    return combinedNoise * settings.terrainHeight;
}

function updateChunks() {
    const playerChunkX = Math.floor(player.position.x / settings.chunkSize);
    const playerChunkZ = Math.floor(player.position.z / settings.chunkSize);

    for (let x = -settings.renderDistance; x <= settings.renderDistance; x++) {
        for (let z = -settings.renderDistance; z <= settings.renderDistance; z++) {
            const chunkX = playerChunkX + x;
            const chunkZ = playerChunkZ + z;
            generateChunkTerrain(chunkX, chunkZ);
        }
    }

    for (const [key, chunk] of chunks.entries()) {
        const [chunkX, chunkZ] = key.split(',').map(Number);
        const distance = Math.max(Math.abs(chunkX - playerChunkX), Math.abs(chunkZ - playerChunkZ));
        chunk.visible = distance <= settings.renderDistance;
    }

    updateBiomeInfo();
}

// Initialize WeatherSystem and other systems in init()
let weatherSystem;

function onPointerLockChange() {
    isLocked = document.pointerLockElement === renderer.domElement;
    console.log("Pointer lock changed. isLocked:", isLocked);
}

init();

