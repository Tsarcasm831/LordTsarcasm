// js/map.js
const Map = (() => {
    let map = [
        [1,1,1,1,1,1,1,1],
        [1,3,3,3,3,3,3,1],
        [1,3,1,4,1,3,3,1],
        [1,3,4,4,4,1,3,1],
        [1,3,1,4,3,3,3,1],
        [1,3,1,3,1,3,3,1],
        [1,3,3,3,3,3,3,1],
        [1,1,1,1,1,1,1,1]
    ];

    let ceilingMap = map.map(row => row.map(() => false));
    let enemyMap = map.map(row => row.map(() => false));
    let ammoCrateMap = map.map(row => row.map(() => false));

    const wallTypes = [];

    function updateWallTypes() {
        for (let y = 0; y < map.length; y++) {
            wallTypes[y] = [];
            for (let x = 0; x < map[y].length; x++) {
                const tile = map[y][x];
                if (tile === 1) {
                    wallTypes[y][x] = 1; // Standard wall
                } else if (tile === 2) {
                    wallTypes[y][x] = 2; // Goop wall
                } else if (tile === 'D') {
                    wallTypes[y][x] = 'door'; // Door
                } else {
                    wallTypes[y][x] = null; // Empty space or other types
                }
            }
        }
    }

    updateWallTypes();

    function getTile(y, x) {
        if (map[y] && map[y][x] !== undefined) {
            return map[y][x];
        }
        return 0; // Default to empty space
    }

    function isPassable(tile) {
        return tile === 0 || tile === 3 || tile === 5;
    }

    return {
        map,
        ceilingMap,
        enemyMap,
        ammoCrateMap,
        wallTypes,
        updateWallTypes,
        getTile,
        isPassable
    };
})();
