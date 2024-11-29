// Enhanced Overworld System with NPCs, Buildings, and Terrain

class Overworld {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = null;
        this.map = null;
        this.npcs = [];
        this.buildings = [];
        this.trees = [];
        
        // Expanded terrain types
        this.terrainTypes = {
            GROUND: { color: '#8B4513', walkable: true },
            GRASS: { color: '#7CFC00', walkable: true, encounter: 0.005 },
            TALL_GRASS: { color: '#228B22', walkable: true, encounter: 0.02 },
            WATER: { color: '#1E90FF', walkable: false },
            ROCK: { color: '#808080', walkable: false },
            SAND: { color: '#F4A460', walkable: true },
            PATH: { color: '#DEB887', walkable: true },
            FLOWERS: { color: '#FFB6C1', walkable: true }
        };
    }

    init() {
        this.setupCanvas();
        this.generateMap();
        this.initializeEntities();
        this.addKeyboardControls();
        this.gameLoop();
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.id = 'overworld-canvas';
        const battleContainer = document.querySelector('.battle-container');
        battleContainer.innerHTML = '';
        battleContainer.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    generateMap() {
        this.map = {
            width: 2000,
            height: 2000,
            tileSize: 50,
            terrain: []
        };

        // Generate base terrain using improved noise
        const noiseScale = 0.05;
        for (let y = 0; y < this.map.height / this.map.tileSize; y++) {
            this.map.terrain[y] = [];
            for (let x = 0; x < this.map.width / this.map.tileSize; x++) {
                const elevation = noise.simplex2(x * noiseScale, y * noiseScale);
                const moisture = noise.simplex2((x + 1000) * noiseScale, y * noiseScale);
                
                let terrainType = this.determineTerrainType(elevation, moisture);
                this.map.terrain[y][x] = {
                    type: terrainType,
                    ...this.terrainTypes[terrainType]
                };
            }
        }

        // Generate paths and structures
        this.generatePaths();
        this.generateBuildings();
        this.generateTrees();
    }

    determineTerrainType(elevation, moisture) {
        if (elevation < -0.4) return 'WATER';
        if (elevation < -0.2) return 'SAND';
        if (elevation > 0.5) return 'ROCK';
        if (moisture > 0.3) return 'TALL_GRASS';
        if (moisture > 0) return 'GRASS';
        if (moisture > -0.3) return 'GROUND';
        return 'FLOWERS';
    }

    generatePaths() {
        // Generate town paths
        const pathPoints = [];
        for (let i = 0; i < 5; i++) {
            pathPoints.push({
                x: Math.floor(Math.random() * (this.map.width / this.map.tileSize)),
                y: Math.floor(Math.random() * (this.map.height / this.map.tileSize))
            });
        }

        // Connect path points
        for (let i = 0; i < pathPoints.length - 1; i++) {
            this.createPath(pathPoints[i], pathPoints[i + 1]);
        }
    }

    createPath(start, end) {
        let x = start.x, y = start.y;
        while (x !== end.x || y !== end.y) {
            if (this.map.terrain[y] && this.map.terrain[y][x]) {
                this.map.terrain[y][x] = {
                    type: 'PATH',
                    ...this.terrainTypes['PATH']
                };
            }
            
            if (Math.random() < 0.5) {
                x += x < end.x ? 1 : x > end.x ? -1 : 0;
            } else {
                y += y < end.y ? 1 : y > end.y ? -1 : 0;
            }
        }
    }

    generateBuildings() {
        const buildingTypes = [
            { type: 'HOUSE', width: 3, height: 3, color: '#8B4513' },
            { type: 'POKECENTER', width: 4, height: 4, color: '#FF69B4' },
            { type: 'MART', width: 4, height: 3, color: '#4169E1' }
        ];

        // Place buildings near paths
        for (let y = 0; y < this.map.terrain.length; y++) {
            for (let x = 0; x < this.map.terrain[y].length; x++) {
                if (this.map.terrain[y][x].type === 'PATH' && Math.random() < 0.05) {
                    const building = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
                    if (this.canPlaceBuilding(x, y, building)) {
                        this.buildings.push({
                            x: x * this.map.tileSize,
                            y: y * this.map.tileSize,
                            width: building.width * this.map.tileSize,
                            height: building.height * this.map.tileSize,
                            type: building.type,
                            color: building.color
                        });
                    }
                }
            }
        }
    }

    canPlaceBuilding(x, y, building) {
        for (let dy = 0; dy < building.height; dy++) {
            for (let dx = 0; dx < building.width; dx++) {
                if (!this.map.terrain[y + dy] || !this.map.terrain[y + dy][x + dx]) {
                    return false;
                }
            }
        }
        return true;
    }

    generateTrees() {
        for (let y = 0; y < this.map.terrain.length; y++) {
            for (let x = 0; x < this.map.terrain[y].length; x++) {
                if (this.map.terrain[y][x].type === 'GRASS' && Math.random() < 0.1) {
                    this.trees.push({
                        x: x * this.map.tileSize,
                        y: y * this.map.tileSize,
                        size: this.map.tileSize
                    });
                }
            }
        }
    }

    initializeEntities() {
        // Initialize player
        this.player = {
            x: this.map.width / 2,
            y: this.map.height / 2,
            width: 50,
            height: 50,
            speed: 3,
            direction: 'down',
            isMoving: false
        };

        // Initialize NPCs
        this.spawnNPCs();
    }

    spawnNPCs() {
        // Create a few NPCs with different characteristics
        const npc1 = {
            x: 500,
            y: 500,
            name: 'Friendly Trainer',
            color: '#FF69B4',
            movementPattern: 'stationary',
            trainerBattle: true,
            dialogues: [
                "Hey there, young trainer!",
                "Want to test your skills?",
                "Let's have a Pokémon battle!"
            ]
        };

        const npc2 = {
            x: 800,
            y: 700,
            name: 'Wandering Trainer',
            color: '#4169E1',
            movementPattern: 'random',
            trainerBattle: true,
            dialogues: [
                "I'm always looking for a challenge!",
                "Pokémon battles are my passion.",
                "Care to battle?"
            ]
        };

        this.npcs.push(npc1, npc2);
    }

    updateNPCs() {
        this.npcs.forEach(npc => {
            if (npc.movement) {
                npc.movement.angle += 0.02;
                npc.x = npc.movement.centerX + Math.cos(npc.movement.angle) * npc.movement.radius;
                npc.y = npc.movement.centerY + Math.sin(npc.movement.angle) * npc.movement.radius;
            }
        });
    }

    drawTerrain() {
        const startCol = Math.max(0, Math.floor((this.player.x - this.canvas.width / 2) / this.map.tileSize));
        const startRow = Math.max(0, Math.floor((this.player.y - this.canvas.height / 2) / this.map.tileSize));
        const endCol = Math.min(this.map.terrain[0].length, startCol + Math.ceil(this.canvas.width / this.map.tileSize) + 1);
        const endRow = Math.min(this.map.terrain.length, startRow + Math.ceil(this.canvas.height / this.map.tileSize) + 1);

        for (let y = startRow; y < endRow; y++) {
            for (let x = startCol; x < endCol; x++) {
                const tile = this.map.terrain[y][x];
                const screenX = x * this.map.tileSize - (this.player.x - this.canvas.width / 2);
                const screenY = y * this.map.tileSize - (this.player.y - this.canvas.height / 2);
                
                // Draw base terrain
                this.ctx.fillStyle = tile.color;
                this.ctx.fillRect(screenX, screenY, this.map.tileSize, this.map.tileSize);

                // Draw tile effects (e.g., grass movement)
                if (tile.type === 'TALL_GRASS') {
                    this.drawGrassEffect(screenX, screenY);
                }
            }
        }
    }

    drawGrassEffect(x, y) {
        const time = Date.now() / 1000;
        const waveOffset = Math.sin(time * 2) * 2;
        
        this.ctx.fillStyle = '#1B5E20';
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + (i * 15), y + this.map.tileSize);
            this.ctx.quadraticCurveTo(
                x + (i * 15) + 7, y + this.map.tileSize - 15 + waveOffset,
                x + (i * 15) + 15, y + this.map.tileSize
            );
            this.ctx.fill();
        }
    }

    drawEntities() {
        // Draw buildings
        this.buildings.forEach(building => {
            const screenX = building.x - (this.player.x - this.canvas.width / 2);
            const screenY = building.y - (this.player.y - this.canvas.height / 2);
            
            if (this.isOnScreen(screenX, screenY, building.width, building.height)) {
                this.ctx.fillStyle = building.color;
                this.ctx.fillRect(screenX, screenY, building.width, building.height);
                
                // Draw roof
                this.ctx.beginPath();
                this.ctx.moveTo(screenX, screenY);
                this.ctx.lineTo(screenX + building.width / 2, screenY - 20);
                this.ctx.lineTo(screenX + building.width, screenY);
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fill();
            }
        });

        // Draw trees
        this.trees.forEach(tree => {
            const screenX = tree.x - (this.player.x - this.canvas.width / 2);
            const screenY = tree.y - (this.player.y - this.canvas.height / 2);
            
            if (this.isOnScreen(screenX, screenY, tree.size, tree.size)) {
                this.drawTree(screenX, screenY, tree.size);
            }
        });

        // Draw NPCs
        this.npcs.forEach(npc => {
            const screenX = npc.x - (this.player.x - this.canvas.width / 2);
            const screenY = npc.y - (this.player.y - this.canvas.height / 2);
            
            if (this.isOnScreen(screenX, screenY, npc.width, npc.height)) {
                this.ctx.fillStyle = npc.color;
                this.ctx.fillRect(screenX, screenY, npc.width, npc.height);
            }
        });

        // Draw player
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(
            this.canvas.width / 2 - this.player.width / 2,
            this.canvas.height / 2 - this.player.height / 2,
            this.player.width,
            this.player.height
        );
    }

    drawTree(x, y, size) {
        // Draw trunk
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + size/3, y + size/2, size/3, size/2);
        
        // Draw leaves
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + size/2);
        this.ctx.lineTo(x + size/2, y);
        this.ctx.lineTo(x + size, y + size/2);
        this.ctx.fill();
        
        // Draw second layer of leaves
        this.ctx.beginPath();
        this.ctx.moveTo(x + size/6, y + size/3);
        this.ctx.lineTo(x + size/2, y - size/4);
        this.ctx.lineTo(x + size - size/6, y + size/3);
        this.ctx.fill();
    }

    isOnScreen(x, y, width, height) {
        return x + width >= 0 && 
               x <= this.canvas.width && 
               y + height >= 0 && 
               y <= this.canvas.height;
    }

    handleMovement() {
        const newX = this.player.x;
        const newY = this.player.y;
        
        // Get current tile position
        const tileX = Math.floor(this.player.x / this.map.tileSize);
        const tileY = Math.floor(this.player.y / this.map.tileSize);
        
        // Check if current tile is walkable
        if (this.map.terrain[tileY] && 
            this.map.terrain[tileY][tileX] && 
            this.map.terrain[tileY][tileX].walkable) {
            
            // Check for random encounters in grass
            if (this.map.terrain[tileY][tileX].encounter) {
                if (Math.random() < this.map.terrain[tileY][tileX].encounter) {
                    this.triggerBattle();
                    return;
                }
            }
            
            this.player.x = newX;
            this.player.y = newY;
        }
    }

    addKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            const speed = this.player.speed;
            this.player.isMoving = true;

            switch (e.key.toLowerCase()) {
                case 'arrowup':
                case 'w':
                    this.player.y -= speed;
                    this.player.direction = 'up';
                    break;
                case 'arrowdown':
                case 's':
                    this.player.y += speed;
                    this.player.direction = 'down';
                    break;
                case 'arrowleft':
                case 'a':
                    this.player.x -= speed;
                    this.player.direction = 'left';
                    break;
                case 'arrowright':
                case 'd':
                    this.player.x += speed;
                    this.player.direction = 'right';
                    break;
                case 'e':
                    this.checkInteraction();
                    break;
                case 'i':
                    // Directly call global openInventory function
                    if (window.openInventory) {
                        window.openInventory();
                    } else {
                        console.error('openInventory function not found');
                    }
                    break;
            }
        });

        window.addEventListener('keyup', () => {
            this.player.isMoving = false;
        });
    }

    checkInteraction() {
        // Check for NPC interactions
        const interactionRange = this.map.tileSize;
        
        this.npcs.forEach(npc => {
            const distance = Math.sqrt(
                Math.pow(this.player.x - npc.x, 2) + 
                Math.pow(this.player.y - npc.y, 2)
            );
            
            if (distance < interactionRange) {
                this.handleNPCInteraction(npc);
            }
        });

        // Check for building interactions
        this.buildings.forEach(building => {
            if (this.isNearBuilding(building)) {
                this.handleBuildingInteraction(building);
            }
        });
    }

    isNearBuilding(building) {
        return Math.abs(this.player.x - building.x) < this.map.tileSize &&
               Math.abs(this.player.y - building.y) < this.map.tileSize;
    }

    handleNPCInteraction(npc) {
        switch(npc.type) {
            case 'TRAINER':
                this.triggerTrainerBattle(npc);
                break;
            case 'MERCHANT':
                this.openShop();
                break;
            case 'CITIZEN':
                this.showDialog("Hello traveler!");
                break;
        }
    }

    handleBuildingInteraction(building) {
        switch(building.type) {
            case 'POKECENTER':
                this.healTeam();
                break;
            case 'MART':
                this.openShop();
                break;
            case 'HOUSE':
                this.showDialog("This is someone's house.");
                break;
        }
    }

    showDialog(text) {
        const dialog = document.getElementById('dialogue');
        if (dialog) {
            dialog.innerHTML = text;
            dialog.style.display = 'block';
            setTimeout(() => {
                dialog.style.display = 'none';
            }, 3000);
        }
    }

    healTeam() {
        if (window.gameState && window.gameState.playerTeam) {
            window.gameState.playerTeam.forEach(pokemon => {
                pokemon.currentHp = pokemon.hp;
            });
            this.showDialog("Your Pokémon have been healed!");
        }
    }

    openShop() {
        this.showDialog("Shop is not implemented yet!");
    }

    triggerBattle() {
        if (typeof initializeBattle === 'function') {
            this.canvas.style.display = 'none';
            initializeBattle();
        }
    }

    triggerTrainerBattle(npc) {
        console.log(`Starting battle with ${npc.name}`);
        // You would typically transition to battle screen here
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.handleMovement();
        this.updateNPCs();
        this.drawTerrain();
        this.drawEntities();
        requestAnimationFrame(() => this.gameLoop());
    }
}
