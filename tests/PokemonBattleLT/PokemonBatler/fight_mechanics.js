// Advanced Pokemon Battle Fight Mechanics

// Logging and Error Handling
const BattleLogger = {
    log: function(message, data = null) {
        console.log(`[Battle Mechanics Log] ${message}`);
        if (data) console.log(JSON.stringify(data, null, 2));
    },
    error: function(message, error = null) {
        console.error(`[Battle Mechanics Error] ${message}`);
        if (error) console.error(error);
    }
};

// Battle State Management
const BattleState = {
    isPlayerTurn: true,
    turnCount: 0,
    battleLog: [],
    
    resetTurn: function() {
        this.isPlayerTurn = true;
        this.turnCount = 0;
        this.battleLog = [];
    },
    
    addBattleLog: function(message) {
        this.battleLog.push(message);
        BattleLogger.log(message);
    }
};

// Move Effectiveness and Damage Calculation
const BattleMechanics = {
    // Type effectiveness chart (expanded from original)
    typeEffectivenessChart: {
        normal: { rock: 0.5, ghost: 0, steel: 0.5 },
        fire: { 
            grass: 2, ice: 2, bug: 2, 
            rock: 0.5, fire: 0.5, water: 0.5, dragon: 0.5 
        },
        water: { 
            fire: 2, ground: 2, rock: 2, 
            water: 0.5, grass: 0.5, dragon: 0.5 
        },
        electric: { 
            water: 2, flying: 2, 
            grass: 0.5, electric: 0.5, dragon: 0.5 
        },
        grass: { 
            water: 2, ground: 2, rock: 2, 
            fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5 
        },
        // Add more type interactions as needed
    },

    calculateTypeEffectiveness: function(moveType, defenderTypes) {
        let multiplier = 1;
        defenderTypes.forEach(defenderType => {
            const typeEffects = this.typeEffectivenessChart[moveType];
            if (typeEffects && typeEffects[defenderType]) {
                multiplier *= typeEffects[defenderType];
            }
        });
        return multiplier;
    },

    calculateDamage: function(move, attacker, defender) {
        // More comprehensive damage calculation
        const levelMultiplier = (2 * attacker.level / 5) + 2;
        const basePower = move.power || 40; // Default to 40 if no power specified
        
        // Determine attack and defense stats based on move type
        const attackStat = move.damageClass === 'physical' ? 
            attacker.stats.attack : attacker.stats.specialAttack;
        const defenseStat = move.damageClass === 'physical' ? 
            defender.stats.defense : defender.stats.specialDefense;

        // Type effectiveness
        const typeEffectiveness = this.calculateTypeEffectiveness(
            move.type, 
            defender.types
        );

        // Random factor
        const randomFactor = Math.random() * (1 - 0.85) + 0.85;

        // Damage calculation formula
        const damage = Math.floor(
            (levelMultiplier * basePower * (attackStat / defenseStat) / 50 + 2) 
            * typeEffectiveness 
            * randomFactor
        );

        // Log battle details
        BattleLogger.log('Damage Calculation', {
            move: move.name,
            basePower: basePower,
            attacker: attacker.name,
            defender: defender.name,
            typeEffectiveness: typeEffectiveness,
            calculatedDamage: damage
        });

        return damage;
    }
};

// Player Fight Mechanics
function playerFight(selectedMove) {
    // Ensure a move is selected and it's the player's turn
    if (!selectedMove || !BattleState.isPlayerTurn) {
        BattleLogger.error('Invalid fight action', { 
            move: selectedMove, 
            isPlayerTurn: BattleState.isPlayerTurn 
        });
        return;
    }

    // Get current game state
    const playerPokemon = gameState.playerPokemon;
    const enemyPokemon = gameState.enemyPokemon;

    // Perform attack
    const damage = BattleMechanics.calculateDamage(
        selectedMove, 
        playerPokemon, 
        enemyPokemon
    );

    // Apply damage to enemy
    enemyPokemon.currentHp = Math.max(0, enemyPokemon.currentHp - damage);

    // Dynamic move dialogue phrases
    const moveDialoguePhrases = [
        `${playerPokemon.name} used ${selectedMove.name}!`,
        `${playerPokemon.name} unleashed ${selectedMove.name}!`,
        `${playerPokemon.name} attacked with ${selectedMove.name}!`,
        `${selectedMove.name} strikes from ${playerPokemon.name}!`,
        `A powerful ${selectedMove.name} from ${playerPokemon.name}!`
    ];
    const randomMovePhrase = moveDialoguePhrases[Math.floor(Math.random() * moveDialoguePhrases.length)];

    // Damage effectiveness phrases
    let effectivenessPhrase = '';
    const typeEffectiveness = BattleMechanics.calculateTypeEffectiveness(
        selectedMove.type, 
        enemyPokemon.types
    );
    if (typeEffectiveness > 1) {
        effectivenessPhrase = "It's super effective!";
    } else if (typeEffectiveness < 1) {
        effectivenessPhrase = "It's not very effective...";
    }

    // Update dialogue
    const dialogueElement = document.getElementById('dialogue');
    if (dialogueElement) {
        dialogueElement.innerHTML = `
            <strong>${randomMovePhrase}</strong>
            ${effectivenessPhrase ? `<br><em>${effectivenessPhrase}</em>` : ''}
        `;
    }

    // Update battle log and UI
    BattleState.addBattleLog(`${playerPokemon.name} used ${selectedMove.name}`);
    updateEnemyHealthBar(enemyPokemon);

    // Check if enemy is defeated
    if (enemyPokemon.currentHp <= 0) {
        handleEnemyDefeated();
        return;
    }

    // Switch to enemy turn
    BattleState.isPlayerTurn = false;
    setTimeout(enemyTurn, 1000);
}

// Enemy Turn Mechanics
function enemyTurn() {
    const playerPokemon = gameState.playerPokemon;
    const enemyPokemon = gameState.enemyPokemon;

    // Select a random move for the enemy
    const enemyMove = selectEnemyMove(enemyPokemon);

    // Perform attack
    const damage = BattleMechanics.calculateDamage(
        enemyMove, 
        enemyPokemon, 
        playerPokemon
    );

    // Apply damage to player
    playerPokemon.currentHp = Math.max(0, playerPokemon.currentHp - damage);

    // Dynamic move dialogue phrases
    const moveDialoguePhrases = [
        `${enemyPokemon.name} used ${enemyMove.name}!`,
        `${enemyPokemon.name} unleashed ${enemyMove.name}!`,
        `${enemyPokemon.name} attacked with ${enemyMove.name}!`,
        `${enemyMove.name} strikes from ${enemyPokemon.name}!`,
        `A powerful ${enemyMove.name} from ${enemyPokemon.name}!`
    ];
    const randomMovePhrase = moveDialoguePhrases[Math.floor(Math.random() * moveDialoguePhrases.length)];

    // Damage effectiveness phrases
    let effectivenessPhrase = '';
    const typeEffectiveness = BattleMechanics.calculateTypeEffectiveness(
        enemyMove.type, 
        playerPokemon.types
    );
    if (typeEffectiveness > 1) {
        effectivenessPhrase = "It's super effective!";
    } else if (typeEffectiveness < 1) {
        effectivenessPhrase = "It's not very effective...";
    }

    // Update dialogue
    const dialogueElement = document.getElementById('dialogue');
    if (dialogueElement) {
        dialogueElement.innerHTML = `
            <strong>${randomMovePhrase}</strong>
            ${effectivenessPhrase ? `<br><em>${effectivenessPhrase}</em>` : ''}
        `;
    }

    // Update battle log and UI
    BattleState.addBattleLog(`${enemyPokemon.name} used ${enemyMove.name}`);
    updatePlayerHealthBar(playerPokemon);

    // Check if player is defeated
    if (playerPokemon.currentHp <= 0) {
        handlePlayerDefeated();
        return;
    }

    // Switch back to player turn
    BattleState.isPlayerTurn = true;
}

// Helper Functions
function selectEnemyMove(enemyPokemon) {
    // If no moves available, use a default move
    if (!enemyPokemon.moves || enemyPokemon.moves.length === 0) {
        return {
            name: 'Struggle',
            type: 'normal',
            power: 50,
            damageClass: 'physical'
        };
    }

    // Randomly select a move
    return enemyPokemon.moves[Math.floor(Math.random() * enemyPokemon.moves.length)];
}

function updateEnemyHealthBar(enemyPokemon) {
    const enemyHpBar = document.getElementById('enemy-hp');
    if (enemyHpBar) {
        const healthPercentage = (enemyPokemon.currentHp / enemyPokemon.hp) * 100;
        enemyHpBar.style.width = `${healthPercentage}%`;
        
        // Color coding for health
        if (healthPercentage > 50) {
            enemyHpBar.style.backgroundColor = 'green';
        } else if (healthPercentage > 20) {
            enemyHpBar.style.backgroundColor = 'orange';
        } else {
            enemyHpBar.style.backgroundColor = 'red';
        }
    }
}

function updatePlayerHealthBar(playerPokemon) {
    const playerHpBar = document.getElementById('player-hp');
    if (playerHpBar) {
        const healthPercentage = (playerPokemon.currentHp / playerPokemon.hp) * 100;
        playerHpBar.style.width = `${healthPercentage}%`;
        
        // Color coding for health
        if (healthPercentage > 50) {
            playerHpBar.style.backgroundColor = 'green';
        } else if (healthPercentage > 20) {
            playerHpBar.style.backgroundColor = 'orange';
        } else {
            playerHpBar.style.backgroundColor = 'red';
        }
    }
}

function handleEnemyDefeated() {
    BattleState.addBattleLog(`Enemy ${gameState.enemyPokemon.name} was defeated!`);
    
    // Calculate experience gain
    const experienceGained = calculateExperienceGain(gameState.enemyPokemon);
    gameState.playerPokemon.experience += experienceGained;

    // Check for level up
    checkLevelUp();

    // Optionally, trigger new enemy or end battle
    fetchEnemyPokemon();
}

function handlePlayerDefeated() {
    BattleState.addBattleLog(`${gameState.playerPokemon.name} was defeated!`);
    
    // Game over logic
    const dialogueElement = document.getElementById('dialogue');
    if (dialogueElement) {
        dialogueElement.innerHTML = 'Game Over! Your Pokemon was defeated.';
    }

    // Optionally, add restart game button or logic
    restartGame();
}

function calculateExperienceGain(defeatedPokemon) {
    // Basic experience calculation
    return Math.floor(
        (defeatedPokemon.level * defeatedPokemon.hp) / 7
    );
}

function checkLevelUp() {
    const playerPokemon = gameState.playerPokemon;
    const experienceToNextLevel = experienceToNextLevel(playerPokemon.level);

    if (playerPokemon.experience >= experienceToNextLevel) {
        playerPokemon.level++;
        playerPokemon.experience = 0;

        // Increase base stats
        Object.keys(playerPokemon.stats).forEach(stat => {
            playerPokemon.stats[stat] = Math.floor(playerPokemon.stats[stat] * 1.1);
        });

        BattleState.addBattleLog(`${playerPokemon.name} leveled up to level ${playerPokemon.level}!`);
        
        // Update UI
        const playerNameLabel = document.getElementById('player-name');
        if (playerNameLabel) {
            playerNameLabel.textContent = `${playerPokemon.name} Lv${playerPokemon.level}`;
        }
    }
}

function experienceToNextLevel(currentLevel) {
    // Simple experience curve
    return Math.floor(Math.pow(currentLevel, 3));
}

function restartGame() {
    // Reset game state
    gameState.playerTeam.forEach(pokemon => {
        pokemon.currentHp = pokemon.hp;
        pokemon.experience = 0;
    });

    // Reset battle state
    BattleState.resetTurn();

    // Reinitialize battle
    initializeBattle();
}

// Expose functions for global use
window.playerFight = playerFight;
window.enemyTurn = enemyTurn;

function openFight() {
    const fightMenu = document.getElementById('fight-menu');
    
    // If fight menu is already open, close it
    if (!fightMenu.classList.contains('hidden')) {
        fightMenu.classList.add('hidden');
        return;
    }

    // Clear previous content
    fightMenu.innerHTML = `
        <div class="close-btn-container">
            <button onclick="closeCurrentInterface()" class="close-interface-btn" title="Close">✕</button>
        </div>
    `;

    // Ensure we have a player Pokémon with moves
    const playerPokemon = window.playerPokemon || {
        name: 'Default Pokémon',
        moves: [
            { name: 'Tackle', type: 'normal', power: 40 },
            { name: 'Scratch', type: 'normal', power: 40 }
        ]
    };

    // Create move buttons
    playerPokemon.moves.forEach(move => {
        const moveButton = document.createElement('button');
        moveButton.textContent = move.name;
        moveButton.classList.add('move-button');
        moveButton.onclick = () => {
            playerFight(move);
            fightMenu.classList.add('hidden');
        };
        fightMenu.appendChild(moveButton);
    });

    // Show fight menu
    fightMenu.classList.remove('hidden');
}

// Expose openFight globally
window.openFight = openFight;
