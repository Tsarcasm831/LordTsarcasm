function generateRandomItems(count) {
    const items = [
        { name: 'Small Health Potion', description: 'Restores 50 health points.' },
        { name: 'Rusty Sword', description: 'A worn-out sword with minimal damage.' },
        { name: 'Old Shield', description: 'Provides basic protection against attacks.' },
        { name: 'Leather Boots', description: 'Increases movement speed slightly.' },
        { name: 'Cloth Armor', description: 'Offers minimal defense but allows easy movement.' },
        { name: 'Mana Potion', description: 'Restores 30 mana points.' },
        { name: 'Iron Helmet', description: 'Protects the head from minor attacks.' },
        // Add more items with descriptions as needed
    ];
    const randomItems = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * items.length);
        // Clone the item to avoid reference issues
        randomItems.push({ ...items[randomIndex] });
    }
    return randomItems;
}

function addItemsToInventory(items) {
    console.log('Items added to inventory:', items);
    playerInventory.push(...items);
}
