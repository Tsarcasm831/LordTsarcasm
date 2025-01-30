export const ITEMS = {
  wood: {
    name: 'Wood',
    type: 'resource',
    icon: `<img src="https://file.garden/Zy7B0LkdIVpGyzA1/LTTD-Assets/rotten_log.png" width="24" height="24" alt="Wood" />`,
    stackable: true,
    description: "Basic building material\nGathered from trees",
  },
  stone: {
    name: 'Stone',
    type: 'resource',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><path fill="#808080" d="M16 2l14 14-14 14L2 16 16 2z"/></svg>`,
    stackable: true,
    description: "Solid rock material\nUsed for crafting tools",
  },
  axe: {
    name: 'Axe',
    type: 'tool',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><path fill="#4a4a4a" d="M28 4L4 28l4-4 8-8V12l8-8h4zM12 16l-4 4-4-4 4-4 4 4z"/></svg>`,
    durability: 100,
    description: "Woodcutting tool\nDurability: 100",
  },
  cottage: {
    name: 'Cottage Kit',
    type: 'building',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><path fill="#deb887" d="M16 2l14 12v16H2V14L16 2zm4 24h-8v-6h8v6z"/></svg>`,
    description: "Prefab house kit\nPlace to build a home",
  },
  scrap_metal: {
    name: 'Scrap Metal',
    type: 'resource',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><path fill="#808080" d="M16 2l14 14-14 14L2 16 16 2z"/><path fill="#666" d="M8 8h4v4H8zM16 16h4v4h-4zM20 8h4v4h-4zM8 20h4v4H8z"/></svg>`,
    stackable: true,
    description: "Rusted metal scraps\nCan be smelted or recycled",
  },
  engine_part: {
    name: 'Engine Part',
    type: 'component',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><path fill="#4a4a4a" d="M16 4l12 12-12 12L4 16 16 4zm-4 8H8v8h4v-8zm8 0h4v8h-4v-8z"/><circle cx="16" cy="16" r="4" fill="#666"/></svg>`,
    stackable: false,
    description: "Damaged engine component\nUseful for advanced crafting",
  },
  copper: {
    name: 'Copper Ore',
    type: 'resource',
    icon: `<img src="https://file.garden/Zy7B0LkdIVpGyzA1/LTTD-Assets/copper_ore.png" width="24" height="24" alt="Copper Ore" />`,
    stackable: true,
    description: "Shiny copper ore\nUsed for advanced crafting",
  },
  iron_ore: {
    name: 'Iron Ore',
    type: 'resource',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24">
      <path fill="#808080" d="M16 2l14 14-14 14L2 16 16 2z"/>
      <path fill="#a0a0a0" d="M8 8h4v4H8zm8 8h4v4h-4zm4-8h4v4h-4zm-8 8h4v4H8z"/>
    </svg>`,
    stackable: true,
    description: "Dense iron ore\nRequires stronger tools to process",
  },
  tin_ore: {
    name: 'Tin Ore',
    type: 'resource',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24">
      <path fill="#909090" d="M16 2l14 14-14 14L2 16 16 2z"/>
      <path fill="#a8a8a8" d="M8 8h4v4H8zm8 8h4v4h-4zm4-8h4v4h-4zm-8 8h4v4H8zM20 16h4v4h-4z"/>
    </svg>`,
    stackable: true,
    description: "Brittle tin ore\nUsed for bronze alloys and electronics",
  },
  bronze_bar: {
    name: 'Bronze Bar',
    type: 'material',
    icon: `<img src="https://file.garden/Zy7B0LkdIVpGyzA1/LTTD-Assets/bronze_bar.png" width="24" height="24" alt="Bronze Bar" />`,
    stackable: true,
    description: "Refined bronze alloy\nUsed for crafting advanced tools",
  },
  cloth_chest: {
    name: 'Cloth Chest',
    type: 'armor',
    icon: `<img src="https://file.garden/Zy7B0LkdIVpGyzA1/LTTD-Assets/cloth_chest.png" width="24" height="24" alt="Cloth Chest" />`,
    stackable: false,
    description: "Light armor made of cloth\nProvides minimal protection",
  },
  pine_log: {
    name: 'Pine Log',
    type: 'resource',
    icon: `<img src="https://file.garden/Zy7B0LkdIVpGyzA1/LTTD-Assets/pine_log.png" width="24" height="24" alt="Pine Log" />`,
    stackable: true,
    description: "Strong pine wood log\nUsed for construction",
  },
  fir_log: {
    name: 'Fir Log',
    type: 'resource',
    icon: `<img src="https://file.garden/Zy7B0LkdIVpGyzA1/LTTD-Assets/fir_log.png" width="24" height="24" alt="Fir Log" />`,
    stackable: true,
    description: "Durable fir wood log\nPreferred for crafting furniture",
  },
  maple_log: {
    name: 'Maple Log',
    type: 'resource',
    icon: `<img src="https://file.garden/Zy7B0LkdIVpGyzA1/LTTD-Assets/maple_log.png" width="24" height="24" alt="Maple Log" />`,
    stackable: true,
    description: "Dense maple wood log\nHighly valued for its strength",
  },
  birch_log: {
    name: 'Birch Log',
    type: 'resource',
    icon: `<img src="https://file.garden/Zy7B0LkdIVpGyzA1/LTTD-Assets/birch_log.png" width="24" height="24" alt="Birch Log" />`,
    stackable: true,
    description: "Lightweight birch wood\nCommonly used in basic structures",
  },
  copper_bar: {
    name: 'Copper Bar',
    type: 'material',
    icon: `<img src="https://file.garden/Zy7B0LkdIVpGyzA1/LTTD-Assets/copper_bar.png" width="24" height="24" alt="Copper Bar" />`,
    stackable: true,
    description: "Refined copper\nEssential for advanced crafting",
  },
};
