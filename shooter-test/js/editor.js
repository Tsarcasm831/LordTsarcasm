// js/editor.js
const Editor = (() => {
    let editorMode = false;
    let editorStartPos = {x: 1.5, y: 1.5};
    const editorDialog = document.querySelector('.map-editor-dialog');
    const editorCanvas = document.getElementById('editorCanvas');
    const editorCtx = editorCanvas.getContext('2d');
    const editorControls = document.querySelector('.editor-controls');
    const textEditor = document.querySelector('.text-editor');
    const toggleTextEditorBtn = document.getElementById('toggleTextEditor');

    // Editor view controls
    let zoomLevel = 1;
    const minZoomLevel = 0.5;
    const maxZoomLevel = 3;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let panOffsetX = 0;
    let panOffsetY = 0;

    // Editor drawing state
    let isDrawing = false;
    let currentTool = 'draw';
    let lineStartX = null;
    let lineStartY = null;

    const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright'];
    let konamiIndex = 0;

    function init() {
        window.addEventListener('keydown', handleKonamiCode);
        document.getElementById('toggleTextEditor').addEventListener('click', toggleTextEditor);
        // Add other editor initialization if needed
    }

    function handleKonamiCode(e) {
        if (e.key.toLowerCase() === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                konamiIndex = 0;
                openEditor();
            }
        } else {
            konamiIndex = 0;
        }
    }

    function openEditor() {
        editorDialog.style.display = 'block';
        if (document.pointerLockElement === canvas) {
            document.exitPointerLock();
        }
        initializeEditor();
    }

    function initializeEditor() {
        editorCanvas.width = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.6);
        editorCanvas.height = editorCanvas.width;

        Game.cellSize = 32 * zoomLevel;

        Game.maxEditorOffsetX = Math.max(0, Map.map[0].length * Game.cellSize - editorCanvas.width);
        Game.maxEditorOffsetY = Math.max(0, Map.map.length * Game.cellSize - editorCanvas.height);

        Game.editorOffsetX = Math.min(Game.editorOffsetX, Game.maxEditorOffsetX);
        Game.editorOffsetY = Math.min(Game.editorOffsetY, Game.maxEditorOffsetY);

        document.getElementById('editorSkyboxSelect').value = Game.currentSkyboxName;
        document.getElementById('gameSkyboxSelect').value = Game.currentSkyboxName;
        document.getElementById('zoomLevelDisplay').textContent = Math.round(zoomLevel * 100) + '%';

        // Add editor event listeners
        editorCanvas.addEventListener('wheel', onEditorWheel);
        editorCanvas.addEventListener('mousedown', onEditorMouseDown);
        editorCanvas.addEventListener('mousemove', onEditorMouseMove);
        editorCanvas.addEventListener('mouseup', onEditorMouseUp);
        editorCanvas.addEventListener('mouseleave', onEditorMouseUp);
        editorCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
        window.addEventListener('keydown', onEditorKeyDown);

        // Initialize tool buttons
        document.getElementById('drawToolButton').addEventListener('click', () => setActiveTool('draw'));
        document.getElementById('eraseToolButton').addEventListener('click', () => setActiveTool('erase'));
        document.getElementById('fillToolButton').addEventListener('click', () => setActiveTool('fill'));
        document.getElementById('lineToolButton').addEventListener('click', () => setActiveTool('line'));

        Renderer.drawEditorGrid();
    }

    function onEditorWheel(e) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        zoomLevel = Math.min(maxZoomLevel, Math.max(minZoomLevel, zoomLevel + delta));
        Game.cellSize = 32 * zoomLevel;
        document.getElementById('zoomLevelDisplay').textContent = Math.round(zoomLevel * 100) + '%';

        Game.maxEditorOffsetX = Math.max(0, Map.map[0].length * Game.cellSize - editorCanvas.width);
        Game.maxEditorOffsetY = Math.max(0, Map.map.length * Game.cellSize - editorCanvas.height);

        Game.editorOffsetX = Math.min(Game.editorOffsetX, Game.maxEditorOffsetX);
        Game.editorOffsetY = Math.min(Game.editorOffsetY, Game.maxEditorOffsetY);

        Renderer.drawEditorGrid();
    }

    function onEditorMouseDown(e) {
        const rect = editorCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (e.button === 2) { // Right-click for panning
            isPanning = true;
            panStartX = mouseX;
            panStartY = mouseY;
        } else if (e.button === 0) { // Left-click for drawing
            isDrawing = true;
            if (currentTool === 'line') {
                lineStartX = mouseX + Game.editorOffsetX;
                lineStartY = mouseY + Game.editorOffsetY;
            } else {
                handleDrawing(e);
            }
        }
    }

    function onEditorMouseMove(e) {
        const rect = editorCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (isPanning) {
            const dx = mouseX - panStartX;
            const dy = mouseY - panStartY;
            panStartX = mouseX;
            panStartY = mouseY;

            Game.editorOffsetX = Math.max(0, Math.min(Game.maxEditorOffsetX, Game.editorOffsetX - dx));
            Game.editorOffsetY = Math.max(0, Math.min(Game.maxEditorOffsetY, Game.editorOffsetY - dy));
            Renderer.drawEditorGrid();
        } else if (isDrawing && currentTool !== 'line') {
            handleDrawing(e);
        }
    }

    function onEditorMouseUp(e) {
        isDrawing = false;
        isPanning = false;
        if (currentTool === 'line' && lineStartX !== null && lineStartY !== null) {
            const rect = editorCanvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left + Game.editorOffsetX;
            const mouseY = e.clientY - rect.top + Game.editorOffsetY;

            const x0 = Math.floor(lineStartX / Game.cellSize);
            const y0 = Math.floor(lineStartY / Game.cellSize);
            const x1 = Math.floor(mouseX / Game.cellSize);
            const y1 = Math.floor(mouseY / Game.cellSize);

            DrawLineOnMap(x0, y0, x1, y1);

            lineStartX = null;
            lineStartY = null;
            Renderer.drawEditorGrid();
        }
    }

    function setActiveTool(tool) {
        currentTool = tool;
        const toolButtons = ['drawToolButton', 'eraseToolButton', 'fillToolButton', 'lineToolButton'];
        toolButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (buttonId === tool + 'ToolButton') {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    function handleDrawing(e) {
        const rect = editorCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + Game.editorOffsetX;
        const mouseY = e.clientY - rect.top + Game.editorOffsetY;

        const x = Math.floor(mouseX / Game.cellSize);
        const y = Math.floor(mouseY / Game.cellSize);

        if (x < 0 || x >= Map.map[0].length || y < 0 || y >= Map.map.length) return;

        UndoRedo.pushState();

        const tileType = document.getElementById('editorTileType').value;

        if (currentTool === 'draw') {
            if (tileType === 'S') {
                editorStartPos.x = x + 0.5;
                editorStartPos.y = y + 0.5;
                document.getElementById('startPosDisplay').textContent = `X: ${editorStartPos.x.toFixed(1)}, Y: ${editorStartPos.y.toFixed(1)}`;
            } else if (tileType === 'C') {
                Map.ceilingMap[y][x] = !Map.ceilingMap[y][x];
            } else if (tileType === 'E') {
                Map.enemyMap[y][x] = !Map.enemyMap[y][x];
            } else if (tileType === 'A') {
                Map.ammoCrateMap[y][x] = !Map.ammoCrateMap[y][x];
            } else if (tileType === 'D') {
                Map.map[y][x] = 'D';
                Map.updateWallTypes();
            } else {
                Map.map[y][x] = parseInt(tileType);
                Map.updateWallTypes();
            }
        } else if (currentTool === 'erase') {
            Map.map[y][x] = 0;
            Map.ceilingMap[y][x] = false;
            Map.enemyMap[y][x] = false;
            Map.ammoCrateMap[y][x] = false;
            Map.updateWallTypes();
        }

        Renderer.drawEditorGrid();
    }

    function DrawLineOnMap(x0, y0, x1, y1) {
        const dx = Math.abs(x1 - x0);
        const dy = -Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx + dy;

        while (true) {
            if (x0 < 0 || x0 >= Map.map[0].length || y0 < 0 || y0 >= Map.map.length) break;
            const tileType = document.getElementById('editorTileType').value;
            if (tileType === 'S') {
                editorStartPos.x = x0 + 0.5;
                editorStartPos.y = y0 + 0.5;
                document.getElementById('startPosDisplay').textContent =
                    `X: ${editorStartPos.x.toFixed(1)}, Y: ${editorStartPos.y.toFixed(1)}`;
            } else if (tileType === 'C') {
                Map.ceilingMap[y0][x0] = !Map.ceilingMap[y0][x0];
            } else if (tileType === 'E') {
                Map.enemyMap[y0][x0] = !Map.enemyMap[y0][x0];
            } else if (tileType === 'A') {
                Map.ammoCrateMap[y0][x0] = !Map.ammoCrateMap[y0][x0];
            } else if (tileType === 'D') {
                Map.map[y0][x0] = 'D';
                Map.updateWallTypes();
            } else {
                Map.map[y0][x0] = parseInt(tileType);
                Map.updateWallTypes();
            }

            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 >= dy) {
                err += dy;
                x0 += sx;
            }
            if (e2 <= dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    function toggleTextEditor() {
        textEditor.style.display = textEditor.style.display === 'none' ? 'block' : 'none';
    }

    function onEditorKeyDown(e) {
        const scrollAmount = 10;
        switch (e.key) {
            case 'ArrowUp':
                Game.editorOffsetY = Math.max(0, Game.editorOffsetY - scrollAmount);
                break;
            case 'ArrowDown':
                Game.editorOffsetY = Math.min(Game.maxEditorOffsetY, Game.editorOffsetY + scrollAmount);
                break;
            case 'ArrowLeft':
                Game.editorOffsetX = Math.max(0, Game.editorOffsetX - scrollAmount);
                break;
            case 'ArrowRight':
                Game.editorOffsetX = Math.min(Game.maxEditorOffsetX, Game.editorOffsetX + scrollAmount);
                break;
            default:
                return;
        }
        e.preventDefault();
        Renderer.drawEditorGrid();
    }

    return {
        init,
        openEditor
    };
})();
