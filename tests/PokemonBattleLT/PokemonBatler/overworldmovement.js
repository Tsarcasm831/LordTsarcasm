class AdvancedOverworldMovement {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = null;
        this.map = null;
        this.camera = null;
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
    }

    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.id = 'advanced-overworld-canvas';
        
        // Replace battle container with canvas
        const battleContainer = document.querySelector('.battle-container');
        battleContainer.innerHTML = '';
        battleContainer.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize camera
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            minZoom: 0.5,
            maxZoom: 3
        };
        
        // Initialize player
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            width: 50,
            height: 50,
            speed: 5,
            color: '#FF0000'
        };
        
        // Initialize map
        this.map = {
            background: '#90EE90', // Light green
            gridSize: 50,
            width: 2000,  // Large map size
            height: 2000
        };
        
        // Add event listeners
        this.addEventListeners();
        
        // Start game loop
        this.gameLoop();
    }
    
    addEventListeners() {
        // Keyboard movement
        window.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w': this.keys.w = true; break;
                case 'a': this.keys.a = true; break;
                case 's': this.keys.s = true; break;
                case 'd': this.keys.d = true; break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w': this.keys.w = false; break;
                case 'a': this.keys.a = false; break;
                case 's': this.keys.s = false; break;
                case 'd': this.keys.d = false; break;
            }
        });
        
        // Scroll wheel zooming
        this.canvas.addEventListener('wheel', (e) => {
            // Prevent default scrolling
            e.preventDefault();
            
            // Adjust zoom based on scroll direction
            const zoomFactor = e.deltaY > 0 ? -0.1 : 0.1;
            this.camera.zoom = Math.max(
                this.camera.minZoom, 
                Math.min(this.camera.maxZoom, this.camera.zoom + zoomFactor)
            );
        });
    }
    
    updatePlayerMovement() {
        // WASD Movement
        if (this.keys.w) this.player.y -= this.player.speed / this.camera.zoom;
        if (this.keys.s) this.player.y += this.player.speed / this.camera.zoom;
        if (this.keys.a) this.player.x -= this.player.speed / this.camera.zoom;
        if (this.keys.d) this.player.x += this.player.speed / this.camera.zoom;
        
        // Boundary checking
        this.player.x = Math.max(0, Math.min(this.map.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.map.height, this.player.y));
        
        // Update camera to follow player
        this.camera.x = this.player.x - this.canvas.width / (2 * this.camera.zoom);
        this.camera.y = this.player.y - this.canvas.height / (2 * this.camera.zoom);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.map.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply camera transformations
        this.ctx.save();
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        for (let x = 0; x < this.map.width; x += this.map.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.map.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.map.height; y += this.map.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.map.width, y);
            this.ctx.stroke();
        }
        
        // Draw player
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(
            this.player.x - this.player.width / 2, 
            this.player.y - this.player.height / 2, 
            this.player.width, 
            this.player.height
        );
        
        // Restore canvas state
        this.ctx.restore();
        
        // Draw zoom level
        this.ctx.fillStyle = 'black';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Zoom: ${this.camera.zoom.toFixed(2)}x`, 10, 30);
    }
    
    gameLoop() {
        // Update player movement
        this.updatePlayerMovement();
        
        // Draw the scene
        this.draw();
        
        // Continue the game loop
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Modify runAway function to use advanced overworld
function runAway() {
    const advancedOverworld = new AdvancedOverworldMovement();
    advancedOverworld.init();
}
