export class OverworldMap {
    constructor(world, player, tileSize = 32) {
        this.world = world;
        this.player = player;
        this.tileSize = tileSize;
        this.isVisible = false;
        
        // Create map canvas
        this.mapCanvas = document.createElement('canvas');
        this.mapCanvas.width = 17 * tileSize;
        this.mapCanvas.height = 17 * tileSize;
        this.mapCanvas.style.position = 'absolute';
        this.mapCanvas.style.top = '50%';
        this.mapCanvas.style.left = '50%';
        this.mapCanvas.style.transform = 'translate(-50%, -50%)';
        this.mapCanvas.style.border = '2px solid #333';
        this.mapCanvas.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.mapCanvas.style.display = 'none';
        this.ctx = this.mapCanvas.getContext('2d');
        
        document.body.appendChild(this.mapCanvas);
        
        // Bind key event
        this.bindEvents();
        
        // Constants for room transition
        this.TRANSITION_DURATION = 500; // milliseconds
        this.isTransitioning = false;
        this.transitionDirection = null;
        this.transitionStartTime = null;
        this.previousRoomCanvas = null;
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'm') {
                this.toggleMap();
            }
        });
    }
    
    toggleMap() {
        this.isVisible = !this.isVisible;
        this.mapCanvas.style.display = this.isVisible ? 'block' : 'none';
        if (this.isVisible) {
            this.render();
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
        
        // Get player position
        const playerX = Math.floor(this.player.x / this.world.tileSize);
        const playerY = Math.floor(this.player.y / this.world.tileSize);
        
        // Calculate bounds for 17x17 grid centered on player
        const startX = playerX - 8;
        const startY = playerY - 8;
        
        // Draw each tile
        for (let y = 0; y < 17; y++) {
            for (let x = 0; x < 17; x++) {
                const worldX = startX + x;
                const worldY = startY + y;
                
                const screenX = x * this.tileSize;
                const screenY = y * this.tileSize;
                
                // Draw tile
                this.drawTile(worldX, worldY, screenX, screenY);
            }
        }
        
        // Draw player position (center of the map)
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(8 * this.tileSize + this.tileSize/2, 8 * this.tileSize + this.tileSize/2, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Check room boundaries
        this.checkRoomBoundaries();
    }
    
    drawTile(worldX, worldY, screenX, screenY) {
        // Get tile from world
        let tile = null;
        if (this.world.tiles && this.world.tiles[worldY] && this.world.tiles[worldY][worldX]) {
            tile = this.world.tiles[worldY][worldX];
        }
        
        // Draw tile background
        this.ctx.fillStyle = this.getTileColor(tile);
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        
        // Draw grid lines
        this.ctx.strokeStyle = '#333';
        this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
        
        // Draw objects if any exist at this position
        const objects = this.world.objects ? this.world.objects.filter(obj => 
            Math.floor(obj.x / this.world.tileSize) === worldX && 
            Math.floor(obj.y / this.world.tileSize) === worldY
        ) : [];
        
        if (objects.length > 0) {
            this.drawObjects(objects, screenX, screenY);
        }
    }
    
    getTileColor(tile) {
        if (!tile) return '#000000';
        // Define colors based on tile type
        switch(tile.type) {
            case 'grass': return '#4a8505';
            case 'water': return '#0077be';
            case 'sand': return '#c2b280';
            case 'rock': return '#808080';
            default: return '#4a8505';
        }
    }
    
    drawObjects(objects, x, y) {
        objects.forEach(obj => {
            // Draw different markers based on object type
            this.ctx.fillStyle = this.getObjectColor(obj);
            this.ctx.fillRect(x + this.tileSize/4, y + this.tileSize/4, 
                            this.tileSize/2, this.tileSize/2);
        });
    }
    
    getObjectColor(obj) {
        // Define colors for different object types
        if (obj.constructor.name.includes('Tree')) return '#006400';
        if (obj.constructor.name.includes('Rock')) return '#696969';
        if (obj.constructor.name.includes('House')) return '#8b4513';
        if (obj.constructor.name.includes('Container')) return '#ffd700';
        return '#000000';
    }
    
    handleRoomTransition(direction) {
        if (this.isTransitioning) return;
        
        // Save current room state to canvas
        this.previousRoomCanvas = document.createElement('canvas');
        this.previousRoomCanvas.width = this.mapCanvas.width;
        this.previousRoomCanvas.height = this.mapCanvas.height;
        const ctx = this.previousRoomCanvas.getContext('2d');
        ctx.drawImage(this.mapCanvas, 0, 0);
        
        // Start transition
        this.isTransitioning = true;
        this.transitionDirection = direction;
        this.transitionStartTime = Date.now();
        
        // Update room position based on direction
        switch(direction) {
            case 'left':
                this.world.roomPosition.x--;
                break;
            case 'right':
                this.world.roomPosition.x++;
                break;
            case 'up':
                this.world.roomPosition.y++;
                break;
            case 'down':
                this.world.roomPosition.y--;
                break;
        }
        
        // Load new room
        this.world.loadRoom();
    }
    
    renderRoomTransition() {
        if (!this.isTransitioning) return;
        
        const elapsed = Date.now() - this.transitionStartTime;
        const progress = Math.min(elapsed / this.TRANSITION_DURATION, 1);
        
        // Create transition canvas
        const transitionCanvas = document.createElement('canvas');
        transitionCanvas.width = this.mapCanvas.width;
        transitionCanvas.height = this.mapCanvas.height;
        const ctx = transitionCanvas.getContext('2d');
        
        // Calculate transition offset
        let offsetX = 0;
        let offsetY = 0;
        
        switch(this.transitionDirection) {
            case 'left':
                offsetX = progress * this.mapCanvas.width;
                break;
            case 'right':
                offsetX = -progress * this.mapCanvas.width;
                break;
            case 'up':
                offsetY = -progress * this.mapCanvas.height;
                break;
            case 'down':
                offsetY = progress * this.mapCanvas.height;
                break;
        }
        
        // Draw previous room
        ctx.drawImage(this.previousRoomCanvas, offsetX, offsetY);
        
        // Draw current room
        ctx.drawImage(this.mapCanvas, 
            offsetX + (this.transitionDirection === 'left' ? -this.mapCanvas.width : 
                      this.transitionDirection === 'right' ? this.mapCanvas.width : 0),
            offsetY + (this.transitionDirection === 'up' ? this.mapCanvas.height : 
                      this.transitionDirection === 'down' ? -this.mapCanvas.height : 0));
        
        // Update map canvas with transition
        this.ctx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
        this.ctx.drawImage(transitionCanvas, 0, 0);
        
        // End transition if complete
        if (progress === 1) {
            this.isTransitioning = false;
            this.transitionDirection = null;
            this.transitionStartTime = null;
            this.previousRoomCanvas = null;
        }
    }
    
    checkRoomBoundaries() {
        const margin = 2; // Distance from edge to trigger transition
        
        if (this.player.x < -this.world.roomWidth/2 + margin) {
            this.handleRoomTransition('left');
            this.player.x = this.world.roomWidth/2 - margin;
        } else if (this.player.x > this.world.roomWidth/2 - margin) {
            this.handleRoomTransition('right');
            this.player.x = -this.world.roomWidth/2 + margin;
        }
        
        if (this.player.y < -this.world.roomDepth/2 + margin) {
            this.handleRoomTransition('down');
            this.player.y = this.world.roomDepth/2 - margin;
        } else if (this.player.y > this.world.roomDepth/2 - margin) {
            this.handleRoomTransition('up');
            this.player.y = -this.world.roomDepth/2 + margin;
        }
        
        // Render room transition
        this.renderRoomTransition();
    }
}