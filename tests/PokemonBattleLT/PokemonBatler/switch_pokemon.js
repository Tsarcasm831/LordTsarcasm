// switch_pokemon.js
// Module for handling Pokemon team switching and detailed team view

class PokemonTeamManager {
    constructor() {
        this.teamContainer = document.getElementById('submenu');
        this.switchMenuPlaceholder = document.querySelector('.switch-menu-placeholder');
        this.currentTeam = []; // Will be populated from player's data
        this.selectedPokemon = null;
    }

    async initializePokemonTeam() {
        try {
            // Fetch Charmander data from PokeAPI
            const charmander = await pokeAPIService.fetchPokemonData('charmander');
            
            // Create a team with Charmander and 5 blank slots
            this.currentTeam = [
                charmander,
                null, null, null, null, null
            ];
            this.renderTeamView();
        } catch (error) {
            console.error('Error initializing Pokemon team:', error);
            this.teamContainer.innerHTML = '<p>Unable to load team. Please try again.</p>';
        }
    }

    renderTeamView() {
        // Clear previous content
        this.switchMenuPlaceholder.innerHTML = '';

        // Create team overview container
        const teamContainer = document.createElement('div');
        teamContainer.classList.add('team-container');

        // Create team list
        const teamList = document.createElement('div');
        teamList.classList.add('pokemon-team-list');

        this.currentTeam.forEach((pokemon, index) => {
            const pokemonCard = document.createElement('div');
            pokemonCard.classList.add('pokemon-card');
            pokemonCard.dataset.index = index;

            // Styling for empty and filled slots
            if (pokemon) {
                pokemonCard.innerHTML = `
                    <img src="${pokemon.sprites.default}" alt="${pokemon.name}" class="pokemon-sprite">
                    <div class="pokemon-info">
                        <h3>${pokemon.name.toUpperCase()}</h3>
                        <p>Type: ${pokemon.types.join(' / ')}</p>
                        <p>HP: ${pokemon.stats.hp}</p>
                    </div>
                `;
                pokemonCard.addEventListener('click', () => this.showPokemonDetails(pokemon));
            } else {
                pokemonCard.innerHTML = `
                    <div class="empty-slot-icon">+</div>
                    <p>Empty Slot</p>
                `;
                pokemonCard.classList.add('empty-slot');
            }

            teamList.appendChild(pokemonCard);
        });

        // Create details section
        const detailsSection = document.createElement('div');
        detailsSection.classList.add('pokemon-details-section');
        detailsSection.innerHTML = `
            <h2 id="details-title">Select a Pokémon</h2>
            <div id="pokemon-details-content">
                <p>Click on a Pokémon to view detailed information.</p>
            </div>
        `;

        // Combine team list and details section
        teamContainer.appendChild(teamList);
        teamContainer.appendChild(detailsSection);

        this.switchMenuPlaceholder.appendChild(teamContainer);
    }

    showPokemonDetails(pokemon) {
        const detailsTitle = document.getElementById('details-title');
        const detailsContent = document.getElementById('pokemon-details-content');

        detailsTitle.textContent = pokemon.name.toUpperCase();
        detailsContent.innerHTML = `
            <div class="pokemon-full-details">
                <img src="${pokemon.sprites.officialArtwork}" alt="${pokemon.name}" class="large-pokemon-sprite">
                <div class="pokemon-stats">
                    <h3>Stats</h3>
                    <p>Type: ${pokemon.types.join(' / ')}</p>
                    <p>Height: ${pokemon.height / 10} m</p>
                    <p>Weight: ${pokemon.weight / 10} kg</p>
                    <h4>Base Stats</h4>
                    <p>HP: ${pokemon.stats.hp}</p>
                    <p>Attack: ${pokemon.stats.attack}</p>
                    <p>Defense: ${pokemon.stats.defense}</p>
                    <p>Sp. Attack: ${pokemon.stats.specialAttack}</p>
                    <p>Sp. Defense: ${pokemon.stats.specialDefense}</p>
                    <p>Speed: ${pokemon.stats.speed}</p>
                </div>
                <div class="pokemon-moves">
                    <h3>Moves</h3>
                    ${pokemon.moves.length > 0 ? pokemon.moves.map(move => `
                        <div class="move-card">
                            <span class="move-name">${move.name}</span>
                        </div>
                    `).join('') : '<p>No moves learned</p>'}
                </div>
                <div class="pokemon-abilities">
                    <h3>Abilities</h3>
                    ${pokemon.abilities.map(ability => `
                        <div class="ability-card">
                            <span class="ability-name">${ability.name}</span>
                            ${ability.isHidden ? '<span class="hidden-ability">(Hidden)</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async switchPokemon(pokemonId) {
        try {
            // In a real implementation, this would interact with the battle system
            console.log(`Attempting to switch to Pokemon with ID: ${pokemonId}`);
            
            // Close submenu
            this.teamContainer.classList.add('hidden');
            
            // Optional: Update battle view with selected Pokemon
            const selectedPokemon = this.currentTeam.find(p => p.id === pokemonId);
            if (selectedPokemon) {
                // Update player Pokemon SVG and details
                const playerPokemonSvg = document.getElementById('player-pokemon-svg');
                const playerNameElement = document.getElementById('player-name');
                
                playerPokemonSvg.innerHTML = `
                    <circle cx="64" cy="64" r="60" fill="#F08030" stroke="#000" stroke-width="4"/>
                    <image href="${selectedPokemon.sprites.default}" x="14" y="14" width="100" height="100"/>
                `;
                playerNameElement.textContent = `${selectedPokemon.name.toUpperCase()} Lv5`;
            }
        } catch (error) {
            console.error('Switch Pokemon Error:', error);
            alert('Unable to switch Pokemon. Please try again.');
        }
    }
}

// Initialize the Pokemon Team Manager
const pokemonTeamManager = new PokemonTeamManager();

function openSwitch() {
    const submenu = document.getElementById('submenu');
    if (submenu) {
        submenu.classList.remove('hidden');
        pokemonTeamManager.initializePokemonTeam();
    }
}

// Add event listener to close button or outside click to hide submenu
document.addEventListener('click', (event) => {
    const submenu = document.getElementById('submenu');
    const switchButton = document.querySelector('button[onclick="openSwitch()"]');

    if (submenu && !submenu.contains(event.target) && event.target !== switchButton) {
        submenu.classList.add('hidden');
    }
});
