// NPC Class for Overworld Interactions
class NPC {
    constructor(options = {}) {
        // Basic NPC properties
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 50;
        this.height = options.height || 50;
        
        // NPC appearance
        this.color = options.color || '#FF69B4';  // Pink humanoid color
        this.name = options.name || 'Trainer';
        
        // NPC behavior
        this.movementPattern = options.movementPattern || 'stationary';
        this.dialogues = options.dialogues || [
            "Hello there!",
            "Welcome to the world of Pokémon!",
            "Are you ready for an adventure?"
        ];
        
        // Battle-related properties
        this.trainerBattle = options.trainerBattle || false;
        this.pokemonTeam = options.pokemonTeam || [];
    }

    // Draw the NPC on the canvas
    draw(ctx, playerX, playerY, canvasWidth, canvasHeight) {
        // Calculate screen position relative to player
        const screenX = this.x - (playerX - canvasWidth / 2);
        const screenY = this.y - (playerY - canvasHeight / 2);
        
        ctx.fillStyle = this.color;
        
        // Draw a simple humanoid shape
        ctx.beginPath();
        // Head
        ctx.arc(screenX + this.width / 2, screenY + this.height / 4, this.width / 4, 0, Math.PI * 2);
        
        // Body
        ctx.rect(screenX + this.width / 4, screenY + this.height / 2, this.width / 2, this.height / 2);
        
        ctx.fill();
    }

    // Interact with NPC (show dialogue or trigger battle)
    interact(overworld) {
        // Random dialogue
        const dialogue = this.dialogues[Math.floor(Math.random() * this.dialogues.length)];
        console.log(`NPC ${this.name} says: ${dialogue}`);

        // Trigger trainer battle if applicable
        if (this.trainerBattle) {
            overworld.triggerTrainerBattle(this);
        }
    }

    // Optional movement method for non-stationary NPCs
    move() {
        if (this.movementPattern === 'random') {
            // Simple random movement logic
            const dx = Math.random() * 10 - 5;
            const dy = Math.random() * 10 - 5;
            this.x += dx;
            this.y += dy;
        }
    }
}
