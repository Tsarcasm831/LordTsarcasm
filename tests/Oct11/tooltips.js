// Create tooltip element

tooltip.className = 'tooltip';
tooltip.style.display = 'none';
document.body.appendChild(tooltip);

// Tooltip positioning function
function positionTooltip(e) {
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let x = e.clientX + 15;
    let y = e.clientY + 15;
    
    // Check if tooltip would go off right edge
    if (x + tooltipWidth > windowWidth) {
        x = windowWidth - tooltipWidth - 10;
        tooltip.classList.add('right');
    } else {
        tooltip.classList.remove('right');
    }
    
    // Check if tooltip would go off bottom edge
    if (y + tooltipHeight > windowHeight) {
        y = windowHeight - tooltipHeight - 10;
        tooltip.classList.add('bottom');
    } else {
        tooltip.classList.remove('bottom');
    }
    
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

// Function to format stats string
function formatStats(stats) {
    if (!stats) return '';
    try {
        const statsObj = typeof stats === 'string' ? JSON.parse(stats) : stats;
        return Object.entries(statsObj)
            .map(([key, value]) => `${key}: ${value}`)
            .join('<br>');
    } catch (e) {
        return stats; // Return original if parsing fails
    }
}

// Show tooltip for inventory items
function showItemTooltip(e) {
    const slot = e.currentTarget;
    const name = slot.getAttribute('data-name');
    if (!name) return; // Exit if no item

    const rarity = slot.getAttribute('data-rarity') || 'common';
    const description = slot.getAttribute('data-description') || '';
    const stats = slot.getAttribute('data-stats');

    tooltip.innerHTML = `
        <div class="tooltip-header">${name}</div>
        <div class="tooltip-rarity ${rarity}">${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</div>
        ${description ? `<div class="tooltip-description">${description}</div>` : ''}
        ${stats ? `<div class="tooltip-stats">${formatStats(stats)}</div>` : ''}
    `;
    
    tooltip.style.display = 'block';
    positionTooltip(e);
}

// Hide tooltip
function hideTooltip() {
    tooltip.style.display = 'none';
}

// Setup tooltip listeners
function setupInventoryTooltips() {
    const inventorySlots = document.querySelectorAll('.inventory-slot, .equipment-slot');
    inventorySlots.forEach(slot => {
        slot.addEventListener('mouseenter', showItemTooltip);
        slot.addEventListener('mousemove', positionTooltip);
        slot.addEventListener('mouseleave', hideTooltip);
    });
}

// Initialize tooltips when DOM is loaded
document.addEventListener('DOMContentLoaded', setupInventoryTooltips);

// Reinitialize tooltips when inventory is updated
document.addEventListener('inventoryUpdated', setupInventoryTooltips);

// Handle dynamic inventory updates
const inventoryObserver = new MutationObserver(setupInventoryTooltips);
const inventoryElements = document.querySelectorAll('#inventory, #tradeWindow, #chestPopup');

inventoryElements.forEach(element => {
    inventoryObserver.observe(element, {
        childList: true,
        subtree: true
    });
});