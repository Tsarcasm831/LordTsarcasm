// Pokemon Battle Script with Enhanced Consistency Checks

// Logging utility
const Logger = {
    log: function(message, data = null) {
        console.log(`[Pokemon Battle Log] ${message}`);
        if (data) console.log(JSON.stringify(data, null, 2));
    },
    error: function(message, error = null) {
        console.error(`[Pokemon Battle Error] ${message}`);
        if (error) console.error(error);
    }
};

// DOM Element References
const domElements = {
    dialogue: document.getElementById('dialogue'),
    submenu: document.getElementById('submenu'),
    playerHp: document.getElementById('player-hp'),
    enemyHp: document.getElementById('enemy-hp'),
    playerExpBar: document.getElementById('player-exp'),
    playerNameLabel: document.getElementById('player-name'),
    enemyNameLabel: document.getElementById('enemy-name')
};

// Global State Management
const gameState = {
    playerTeam: [],
    currentPlayerPokemonIndex: 0,
    playerPokemon: {},
    enemyPokemon: {},
    isPlayerTurn: true,
    playerData: null,
    bagItems: [
        { name: 'Potion', effect: 'heal', amount: 20 },
        { name: 'Super Potion', effect: 'heal', amount: 50 },
        { name: 'Antidote', effect: 'status', status: 'poison' }
    ],
    balls: [
        { name: 'Poké Ball', catchRate: 1 },
        { name: 'Great Ball', catchRate: 1.5 },
        { name: 'Ultra Ball', catchRate: 2 }
    ],
    currentMenu: null
};

// Utility Functions
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatMoveName(moveName) {
    return moveName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Enhanced Pokemon Data Fetching
async function fetchPokemonData() {
    try {
        await fetchPlayerTeam();
        await fetchEnemyPokemon();
        validatePokemonData();
    } catch (error) {
        Logger.error('Failed to fetch Pokemon data', error);
        displayErrorMessage('Unable to load Pokemon. Please refresh the page.');
    }
}

async function fetchPlayerTeam() {
    const teamPokemonNames = ['charmander', 'squirtle', 'bulbasaur'];
    gameState.playerTeam = [];

    try {
        const pokemonDataList = await pokeAPIService.fetchMultiplePokemon(teamPokemonNames);
        
        for (let pokemonData of pokemonDataList) {
            const pokemon = createPokemonObject(pokemonData);
            gameState.playerTeam.push(pokemon);
        }

        if (gameState.playerTeam.length === 0) {
            throw new Error('No player Pokemon could be loaded');
        }

        gameState.playerPokemon = gameState.playerTeam[gameState.currentPlayerPokemonIndex];
        updatePlayerPokemonUI();
    } catch (error) {
        Logger.error('Failed to fetch player team', error);
        displayErrorMessage('Unable to load Pokemon team. Please refresh the page.');
    }
}

function createPokemonObject(pokemonData, level = 5) {
    const pokemon = {
        level: level,
        experience: 0,
        name: capitalizeFirstLetter(pokemonData.name),
        stats: pokemonData.stats,
        hp: pokemonData.stats.hp,
        currentHp: pokemonData.stats.hp,
        moves: pokemonData.moves.slice(0, 4).map(move => ({
            name: formatMoveName(move.name),
            // You might want to fetch additional move details if needed
        })),
        colors: pokemonData.types.map(type => getTypeColor(type)),
        types: pokemonData.types,
        sprite: pokemonData.sprites.officialArtwork,
        data: pokemonData
    };

    return pokemon;
}

async function getMovesByLevel(pokemonData, level) {
    const levelUpMoves = pokemonData.moves.filter(move => {
        return move.version_group_details.some(detail => {
            return detail.move_learn_method.name === 'level-up' && detail.level_learned_at <= level;
        });
    });

    const moves = [];

    for (const move of levelUpMoves) {
        const levelDetails = move.version_group_details.find(detail => {
            return detail.move_learn_method.name === 'level-up' && detail.level_learned_at <= level;
        });
        const moveName = move.move.name;

        // Fetch move data to check if it does damage
        const moveResponse = await fetch(move.move.url);
        const moveData = await moveResponse.json();

        if (moveData.power && moveData.damage_class && (moveData.damage_class.name === 'physical' || moveData.damage_class.name === 'special')) {
            moves.push({
                name: formatMoveName(moveName),
                level: levelDetails.level_learned_at,
                power: moveData.power,
                type: moveData.type.name,
                accuracy: moveData.accuracy,
                damageClass: moveData.damage_class.name
            });
        }
    }

    // Sort moves by level learned
    moves.sort((a, b) => a.level - b.level);

    // Return up to 4 moves
    return moves.slice(0, 4);
}

async function fetchEnemyPokemon(pokemonIdOrName = null) {
    try {
        const enemyPokemonId = pokemonIdOrName || Math.floor(Math.random() * 1010) + 1;
        const pokemonData = await pokeAPIService.fetchPokemonData(enemyPokemonId);
        
        gameState.enemyPokemon = createPokemonObject(pokemonData);
        
        // Update enemy Pokemon UI
        domElements.enemyNameLabel.textContent = `${gameState.enemyPokemon.name} Lv${gameState.enemyPokemon.level}`;
        updatePokemonSVG('enemy', gameState.enemyPokemon);
    } catch (error) {
        Logger.error('Failed to fetch enemy Pokemon', error);
        displayErrorMessage('Unable to load enemy Pokemon. Please refresh the page.');
    }
}

function updatePlayerPokemonUI() {
    domElements.playerNameLabel.textContent = `${gameState.playerPokemon.name} Lv${gameState.playerPokemon.level}`;
    updatePokemonSVG('player', gameState.playerPokemon);
    updateExpBar();
}

function validatePokemonData() {
    // Add comprehensive validation checks
    const playerPokemon = gameState.playerPokemon;
    const enemyPokemon = gameState.enemyPokemon;

    if (!playerPokemon || !enemyPokemon) {
        Logger.error('Pokemon data is incomplete');
        displayErrorMessage('Pokemon data validation failed');
        return false;
    }

    // Check sprite availability
    if (!playerPokemon.sprite || !enemyPokemon.sprite) {
        Logger.error('Missing Pokemon sprites', {
            playerSprite: playerPokemon.sprite,
            enemySprite: enemyPokemon.sprite
        });
    }

    // Log Pokemon details for debugging
    Logger.log('Player Pokemon Details', {
        name: playerPokemon.name,
        level: playerPokemon.level,
        types: playerPokemon.types
    });

    Logger.log('Enemy Pokemon Details', {
        name: enemyPokemon.name,
        level: enemyPokemon.level,
        types: enemyPokemon.types
    });

    return true;
}

function displayErrorMessage(message) {
    domElements.dialogue.innerHTML = `<span style="color: red;">${message}</span>`;
}

// Add missing functions from the original script
function getTypeColor(type) {
    const colors = {
        normal: '#A8A77A',
        fire: '#EE8130',
        water: '#6390F0',
        electric: '#F7D02C',
        grass: '#7AC74C',
        ice: '#96D9D6',
        fighting: '#C22E28',
        poison: '#A33EA1',
        ground: '#E2BF65',
        flying: '#A98FF3',
        psychic: '#F95587',
        bug: '#A6B91A',
        rock: '#B6A136',
        ghost: '#735797',
        dragon: '#6F35FC',
        dark: '#705746',
        steel: '#B7B7CE',
        fairy: '#D685AD'
    };
    return colors[type] || '#68A090';
}

function updatePokemonSVG(role, pokemon) {
    const svgElement = document.getElementById(`${role}-pokemon-svg`);
    if (svgElement && pokemon.sprite) {
        svgElement.innerHTML = `
            <image href="${pokemon.sprite}" x="0" y="0" width="128" height="128"/>
        `;
    } else {
        Logger.error('Unable to update Pokemon SVG', { role, pokemon });
    }
}

function updateExpBar() {
    if (domElements.playerExpBar) {
        domElements.playerExpBar.style.width = '0%';
    }
}

// Pokemon Switching Functionality
function openSwitch() {
    const submenu = domElements.submenu;
    submenu.innerHTML = ''; // Clear previous content
    submenu.classList.remove('hidden');

    // Create a container for Pokemon team slots
    const switchContainer = document.createElement('div');
    switchContainer.classList.add('pokemon-switch-container');

    // Create 6 Pokemon slots (including empty ones)
    for (let i = 0; i < 6; i++) {
        const pokemonSlot = document.createElement('div');
        pokemonSlot.classList.add('pokemon-switch-slot');
        
        // Check if there's a Pokemon in this slot
        if (i < gameState.playerTeam.length) {
            const pokemon = gameState.playerTeam[i];
            
            // Indicate the current active Pokemon
            if (i === gameState.currentPlayerPokemonIndex) {
                pokemonSlot.classList.add('active-pokemon');
            }

            // Create Pokemon details
            pokemonSlot.innerHTML = `
                <img src="${pokemon.sprite}" alt="${pokemon.name}" class="pokemon-sprite">
                <div class="pokemon-details">
                    <div class="pokemon-name">${pokemon.name}</div>
                    <div class="pokemon-level">Lv${pokemon.level}</div>
                    <div class="hp-bar-container">
                        <div class="hp-bar" style="width: ${(pokemon.currentHp / pokemon.hp) * 100}%;"></div>
                    </div>
                    <div class="pokemon-hp">${pokemon.currentHp}/${pokemon.hp} HP</div>
                </div>
            `;

            // Add click event to show detailed view
            pokemonSlot.addEventListener('click', () => showPokemonDetailedView(pokemon));
        } else {
            // Empty slot
            pokemonSlot.classList.add('empty-slot');
            pokemonSlot.innerHTML = `
                <div class="empty-sprite">
                    <span>?</span>
                </div>
                <div class="pokemon-details">
                    <div class="pokemon-name">Empty Slot</div>
                </div>
            `;
        }

        switchContainer.appendChild(pokemonSlot);
    }

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('switch-close-button');
    closeButton.addEventListener('click', closeSwitch);
    
    // Append container and close button to submenu
    submenu.appendChild(switchContainer);
    submenu.appendChild(closeButton);
}

function showPokemonDetailedView(pokemon) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('pokemon-detailed-view-overlay');
    
    // Create detailed view container
    const detailedView = document.createElement('div');
    detailedView.classList.add('pokemon-detailed-view');

    // Populate detailed view
    detailedView.innerHTML = `
        <img src="${pokemon.sprite}" alt="${pokemon.name}" class="pokemon-sprite-large">
        <h2>${pokemon.name}</h2>
        <div class="pokemon-info">
            <div><strong>Level:</strong> ${pokemon.level}</div>
            <div><strong>Type:</strong> ${pokemon.types.join(', ')}</div>
            <div><strong>HP:</strong> ${pokemon.currentHp}/${pokemon.hp}</div>
            <div><strong>Status:</strong> Normal</div>
        </div>
        <h3>Moves</h3>
        <div class="move-list">
            ${pokemon.moves.map(move => `
                <div class="move-item">
                    <strong>${move.name}</strong><br>
                    Type: ${move.type}<br>
                    Power: ${move.power}
                </div>
            `).join('')}
        </div>
        <button class="switch-close-button" id="close-detailed-view">Close</button>
    `;

    // Add overlay and detailed view to body
    overlay.appendChild(detailedView);
    document.body.appendChild(overlay);

    // Add event listener to close button
    document.getElementById('close-detailed-view').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    // Close overlay when clicking outside the detailed view
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

function closeSwitch() {
    const submenu = domElements.submenu;
    submenu.classList.add('hidden');
    submenu.innerHTML = '';
}

// Add styles for switch menu
const switchStyles = `
<style>
.pokemon-switch-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
}

.pokemon-switch-slot {
    display: flex;
    align-items: center;
    width: 200px;
    padding: 10px;
    border: 2px solid #333;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.pokemon-switch-slot:hover {
    background-color: rgba(0, 0, 0, 0.1);
    transform: scale(1.05);
}

.pokemon-switch-slot.active-pokemon {
    background-color: rgba(0, 255, 0, 0.2);
    border-color: green;
}

.pokemon-switch-slot.empty-slot {
    background-color: rgba(0, 0, 0, 0.1);
    border-color: #666;
}

.pokemon-switch-slot .pokemon-sprite {
    width: 80px;
    height: 80px;
    margin-right: 10px;
}

.pokemon-switch-slot .empty-sprite {
    width: 80px;
    height: 80px;
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    font-weight: bold;
}

.pokemon-switch-slot .pokemon-details {
    display: flex;
    flex-direction: column;
}

.pokemon-switch-slot .hp-bar-container {
    width: 100%;
    height: 10px;
    background-color: #ddd;
    border-radius: 5px;
    overflow: hidden;
}

.pokemon-switch-slot .hp-bar {
    height: 100%;
    background-color: green;
    transition: width 0.5s ease;
}

.pokemon-detailed-view-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.pokemon-detailed-view {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    width: 80%;
    max-width: 600px;
}

.pokemon-detailed-view img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 10px 10px 0 0;
}

.pokemon-detailed-view h2 {
    margin-top: 10px;
}

.pokemon-info {
    margin-top: 20px;
}

.pokemon-info div {
    margin-bottom: 10px;
}

.move-list {
    margin-top: 20px;
}

.move-item {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.move-item strong {
    font-size: 18px;
}
</style>
`;

// Append styles to the document
document.head.insertAdjacentHTML('beforeend', switchStyles);

// Initialization Function
function initializeBattle() {
    try {
        fetchPokemonData();
    } catch (error) {
        Logger.error('Battle initialization failed', error);
        displayErrorMessage('Battle could not be started. Please try again.');
    }
}

// Event Listeners
window.addEventListener('load', initializeBattle);
