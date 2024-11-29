// Player Sprite Management and Animation
// Player Sprite Class for Overworld
class PlayerSprite {
    constructor() {
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'spritesheet.webp'; // Updated to use the provided sprite sheet

        // Sprite configuration
        this.spriteWidth = 256;  // Width of each sprite frame (based on 4x4 grid, adjust if needed)
        this.spriteHeight = 256; // Height of each sprite frame
        this.scale = 1;          // Scale factor for sprite rendering

        // Animation states
        this.currentFrame = 0;
        this.frameCount = 4;    // Number of animation frames
        this.animationSpeed = 5; // Frames between sprite changes
        this.animationCounter = 0;

        // Movement states
        this.movementStates = {
            IDLE: 'idle',
            WALKING: 'walking',
            RUNNING: 'running'
        };
        this.currentMovementState = this.movementStates.IDLE;

        // Sprite sheet row indices
        this.spriteRows = {
            DOWN: 0,
            LEFT: 1,
            RIGHT: 2,
            UP: 3
        };
    }

    // Update player animation based on movement and direction
    updateAnimation(isMoving, direction) {
        // Determine movement state
        this.currentMovementState = isMoving
            ? (this.currentMovementState === this.movementStates.RUNNING
                ? this.movementStates.RUNNING
                : this.movementStates.WALKING)
            : this.movementStates.IDLE;

        // Animate only when moving
        if (isMoving) {
            this.animationCounter++;

            // Change sprite frame periodically
            if (this.animationCounter >= this.animationSpeed) {
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;
                this.animationCounter = 0;
            }
        } else {
            // Reset to first frame when idle
            this.currentFrame = 0;
        }

        // Determine sprite row based on direction
        this.currentRow = this.spriteRows[direction.toUpperCase()] || this.spriteRows.DOWN;
    }

    // Render player sprite on canvas
    render(ctx, x, y, width, height, direction) {
        // Source sprite coordinates
        const sourceX = this.currentFrame * this.spriteWidth;
        const sourceY = this.spriteRows[direction.toUpperCase()] * this.spriteHeight;

        // Draw sprite
        ctx.drawImage(
            this.spriteSheet,
            sourceX, sourceY,
            this.spriteWidth, this.spriteHeight,
            x, y,
            width * this.scale, height * this.scale
        );
    }
}

// Extend Overworld class to use PlayerSprite
Overworld.prototype.initPlayerSprite = function () {
    // Create player sprite instance
    this.playerSprite = new PlayerSprite();

    // Optional: Override player drawing method
    this.drawPlayer = function () {
        const centerX = this.canvas.width / 2 - this.player.width / 2;
        const centerY = this.canvas.height / 2 - this.player.height / 2;

        // Update sprite animation
        this.playerSprite.updateAnimation(
            this.player.isMoving,
            this.player.direction
        );

        // Render sprite
        this.playerSprite.render(
            this.ctx,
            centerX,
            centerY,
            this.player.width,
            this.player.height,
            this.player.direction // Pass the direction
        );
    };
};
