// pokeapi_service.js
// Service for fetching and managing Pokemon data from PokeAPI

class PokeAPIService {
    constructor() {
        this.baseURL = 'https://pokeapi.co/api/v2/pokemon/';
        this.cache = new Map(); // Cache to store fetched Pokemon data
    }

    // Transform raw PokeAPI data into a more usable format for our game
    transformPokemonData(rawData) {
        return {
            id: rawData.id,
            name: rawData.name,
            types: rawData.types.map(t => t.type.name),
            sprites: {
                default: rawData.sprites.front_default,
                shiny: rawData.sprites.front_shiny,
                officialArtwork: rawData.sprites.other['official-artwork'].front_default
            },
            stats: {
                hp: rawData.stats.find(s => s.stat.name === 'hp').base_stat,
                attack: rawData.stats.find(s => s.stat.name === 'attack').base_stat,
                defense: rawData.stats.find(s => s.stat.name === 'defense').base_stat,
                specialAttack: rawData.stats.find(s => s.stat.name === 'special-attack').base_stat,
                specialDefense: rawData.stats.find(s => s.stat.name === 'special-defense').base_stat,
                speed: rawData.stats.find(s => s.stat.name === 'speed').base_stat
            },
            moves: rawData.moves.slice(0, 4).map(m => ({
                name: m.move.name,
                url: m.move.url
            })),
            abilities: rawData.abilities.map(a => ({
                name: a.ability.name,
                isHidden: a.is_hidden
            })),
            height: rawData.height,
            weight: rawData.weight
        };
    }

    // Fetch Pokemon data by name or ID
    async fetchPokemonData(pokemonNameOrId) {
        // Check cache first
        if (this.cache.has(pokemonNameOrId)) {
            return this.cache.get(pokemonNameOrId);
        }

        try {
            const response = await fetch(`${this.baseURL}${pokemonNameOrId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch Pokemon: ${pokemonNameOrId}`);
            }

            const rawData = await response.json();
            const transformedData = this.transformPokemonData(rawData);
            
            // Cache the transformed data
            this.cache.set(pokemonNameOrId, transformedData);
            
            return transformedData;
        } catch (error) {
            console.error('PokeAPI Fetch Error:', error);
            throw error;
        }
    }

    // Fetch multiple Pokemon at once
    async fetchMultiplePokemon(pokemonList) {
        try {
            const pokemonPromises = pokemonList.map(pokemon => this.fetchPokemonData(pokemon));
            return await Promise.all(pokemonPromises);
        } catch (error) {
            console.error('Error fetching multiple Pokemon:', error);
            throw error;
        }
    }

    // Generate a random team of Pokemon
    async generateRandomTeam(teamSize = 6) {
        const maxPokemonId = 1010; // Up to Gen 9
        const randomTeam = [];
        const usedIds = new Set();

        while (randomTeam.length < teamSize) {
            const randomId = Math.floor(Math.random() * maxPokemonId) + 1;
            
            if (!usedIds.has(randomId)) {
                try {
                    const pokemonData = await this.fetchPokemonData(randomId);
                    randomTeam.push(pokemonData);
                    usedIds.add(randomId);
                } catch (error) {
                    console.warn(`Could not fetch Pokemon with ID ${randomId}`);
                }
            }
        }

        return randomTeam;
    }
}

// Create a singleton instance of PokeAPIService
const pokeAPIService = new PokeAPIService();

// Expose the service for global use
window.pokeAPIService = pokeAPIService;
