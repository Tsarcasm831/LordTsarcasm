// config.js
export const settings = {
    chunkSize: 400,
    chunkResolution: 100,
    terrainHeight: 25,
    waterLevel: 0.02,
    treeCount: 5,
    renderDistance: 2,
    gravity: -9.8,
    jumpForce: 7,
    swimForce: 3,
    swimDrag: 0.9
};

export const biomes = {
    PLAINS: { color: 0x555555, treeColor: 0x333333, treeFrequency: 0.02 },
    FOREST: { color: 0x444444, treeColor: 0x222222, treeFrequency: 0.01 },
    DENSE_FOREST: { color: 0x333333, treeColor: 0x111111, treeFrequency: 0.005 },
    DESERT: { color: 0x777777, treeColor: 0x555555, treeFrequency: 0.005 },
    TUNDRA: { color: 0x999999, treeColor: 0x666666, treeFrequency: 0.01 },
    JUNGLE: { color: 0x666666, treeColor: 0x333333, treeFrequency: 0.005 },
    GROVE: { color: 0x888888, treeColor: 0x444444, treeFrequency: 0.01 },
    BEACH: { color: 0x666666, treeColor: 0x333333, treeFrequency: 0.005 }
};