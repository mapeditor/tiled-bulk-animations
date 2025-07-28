
class BulkAnimationEditor {
    constructor() {
        this.title = "Bulk Animation Editor";
        this.version = "1.3.2-p1"; // p1 = patch perf

        const createAnimations = tiled.registerAction('BulkAnimationEditor_CreateFromSelection',
            action => this.beginCreateAnimations());
        createAnimations.text = "Create Bulk Animations From Selection";
        createAnimations.icon = "icon-create.png";

        const clearAnimations = tiled.registerAction('BulkAnimationEditor_ClearSelection',
            action => this.beginClearAnimations());
        clearAnimations.text = "Clear Animations In Selection";
        clearAnimations.icon = "icon-clear.png";
    }

    // --- NEW: heavy info on cache ---
    _initCache(tileset) {
        const W = tileset.imageWidth;
        const H = tileset.imageHeight;
        const w = tileset.tileWidth;
        const h = tileset.tileHeight;
        const p = tileset.tileSpacing;
        const m = tileset.margin;
        this._cache = {
            numCols: Math.floor((W + p - 2*m) / (w + p)),
            numRows: Math.floor((H + p - 2*m) / (h + p))
        };
    }

    getNumCols() { return this._cache?.numCols ?? this._calcNumCols(); }
    getNumRows() { return this._cache?.numRows ?? this._calcNumRows(); }

    // keeps for compatibility in case of direct call
    _calcNumRows() {
        const tileset = tiled.activeAsset;
        const H = tileset.imageHeight;
        const h = tileset.tileHeight;
        const p = tileset.tileSpacing;
        const m = tileset.margin;
        return Math.floor((H + p - 2*m) / (h + p));
    }
    _calcNumCols() {
        const tileset = tiled.activeAsset;
        const W = tileset.imageWidth;
        const w = tileset.tileWidth;
        const p = tileset.tileSpacing;
        const m = tileset.margin;
        return Math.floor((W + p - 2*m) / (w + p));
    }

    beginCreateAnimations() {
        this.dialog = new Dialog(this.title);
        this.dialog.minimumWidth = 400;
        this.dialog.finished.connect((code) => { this.dialog = undefined; });
        this.promptInputs(() => {
            if (!this.config) {
                if (this.dialog) this.dialog.reject();
                tiled.alert("Aborting operation.", this.title);
                return;
            }
            this.execute(() => this.createAnimations(), "Create Animations", this.config);
        });
    }

    // --- REWRITTEN: createAnimations() use Tileset.macro and avoid filter() global ---
    createAnimations() {
        const tileset = tiled.activeAsset;
        const { selectedTiles, direction, strideR, strideD, frames, duration } = this.config;

        tileset.macro("Create Animations (Bulk)", () => {
            for (const tile of selectedTiles) {
                // Construire les frames sans parcourir tout tileset.tiles
                const framesForTile = this.getFrames(tile, direction, strideR, strideD, frames, duration);
                if (!framesForTile) return; // erreur déjà signalée
                tile.frames = framesForTile;
            }
        });

        if (this.dialog) this.dialog.accept();
    }

    beginClearAnimations() {
        const tileset = tiled.activeAsset;
        if (!tileset.selectedTiles || !tileset.selectedTiles.length) {
            tiled.alert("No tiles are selected. Please select a region containing the animations you would like to clear.", this.title);
            return;
        }
        const animatedTiles = tileset.selectedTiles.filter(tile => tile.frames && tile.frames.length > 0);
        if (!animatedTiles.length) {
            tiled.alert("No animations are present on any of the tiles in the selected region.", this.title);
            return;
        }
        const response = tiled.confirm(animatedTiles.length + " tile(s) will have their animations removed. Are you sure you want to continue?", this.title);
        if (!response) return;
        this.execute(() => this.clearAnimations(animatedTiles), "Clear Animations", null);
    }

    clearAnimations(animatedTiles) {
        const tileset = tiled.activeAsset;
        tileset.macro("Clear Animations", () => {
            for (const tile of animatedTiles) tile.frames = [];
        });
    }

    execute(action, name) {
        try {
            action();
        } catch (e) {
            tiled.alert("An error occurred performing the operation. The error was logged to the Console (View → Views and Toolbars → Console).\n\nPlease try again, and if the error persists, please submit an issue for this extension with the error output from the console and (if possible) the tileset you are using.", this.title);
            const errorOutput = this.formatError(e, name);
            tiled.error(errorOutput);
        }
    }

    // --- REWRITTEN: promptInputs caches everything & avoids re-iterating
    promptInputs(configCallback) {
        const tileset = tiled.activeAsset;
        this.config = {};
        if (!tileset.selectedTiles || !tileset.selectedTiles.length) {
            tiled.alert("No tiles are selected. Please select the tiles containing the first animation frame of the tiles you would like to animate.", this.title);
            return null;
        }

        this._initCache(tileset);
        // Selection sorted only once
        this.config.selectedTiles = tileset.selectedTiles.slice().sort((a, b) => a.id - b.id);

        const proceed = this.checkExistingAnimations();
        if (!proceed) return;

        // Extent calculated via tile.id
        this.config.extent = this.getSelectionExtent();
        if (!this.config.extent) return;

        this.addDirectionInput();
        this.addStrideInput();
        this.addFramesInput();
        this.addDurationInput();
        this.dialog.addSeparator();
        const okButton = this.dialog.addButton('OK');
        okButton.clicked.connect(() => {
            if (!this.validateConfig()) return;
            configCallback();
        });
        const cancelButton = this.dialog.addButton('Cancel');
        cancelButton.clicked.connect(() => this.dialog.reject());
        this.dialog.show();
    }

    validateConfig() {
        const { frames, direction, strideR, strideD } = this.config;
        const rightEnabled = (direction === 'r' || direction === 'b');
        const downEnabled = (direction === 'd' || direction === 'b');
        const maxFrames = this.getMaxFrames();
        if (isNaN(frames) || frames < 0) {
            tiled.alert(`Invalid number of frames '${this.config.frames}'. Try again or press Cancel to abort.`, this.title);
            return false;
        }
        if (frames !== 0 && frames > maxFrames) {
            tiled.alert(`Invalid number of frames. Based on the size of the tileset, the maximum number of frames is: ${maxFrames}.\n\nPlease try again, or press Cancel to abort.`, this.title);
            return false;
        }
        const maxStrideR = this.getMaxStride('r');
        const maxStrideD = this.getMaxStride('d');
        if (rightEnabled && strideR <= 0) { tiled.alert("Stride (Right) should be greater than zero.", this.title); return false; }
        if (downEnabled && strideD <= 0) { tiled.alert("Stride (Down) should be greater than zero.", this.title); return false; }
        if (rightEnabled && strideR > maxStrideR) {
            tiled.alert("Stride (Right) is invalid. Based on the size of the tileset and the specified direction, the maximum stride is: " + maxStrideR + ".\n\nPlease try again, or press Cancel to abort.", this.title);
            return false;
        }
        if (downEnabled && strideD > maxStrideD) {
            tiled.alert("Stride (Down) is invalid. Based on the size of the tileset and the specified direction, the maximum stride is: " + maxStrideD + ".\n\nPlease try again, or press Cancel to abort.", this.title);
            return false;
        }
        return true;
    }

    checkExistingAnimations() {
        const tileset = tiled.activeAsset;
        const animatedTiles = tileset.selectedTiles.filter(tile => tile.frames && tile.frames.length > 0);
        if (animatedTiles.length) {
            const response = tiled.confirm(animatedTiles.length + " tile(s) already have animations. These existing animations will be cleared. Are you sure you want to continue?", this.title);
            if (!response) return false;
        }
        return true;
    }

    addDirectionInput() {
        const tileset = tiled.activeAsset;
        let defaultDirection = tileset.imageWidth >= tileset.imageHeight ? "r" : "d";
        const directionToHeading = {
            "r": "The remainder of the animation is located to the right of the selected region.",
            "d": 'The remainder of the animation is located beneath the selected region.',
            "b": 'The remainder of the animation is both to the right and down (left to right, downwards).'
        };
        this.config.direction = defaultDirection;
        this.dialog.addSeparator('Direction');
        this.directionHeading = this.dialog.addHeading(`Current Direction: ${(this.config.direction == "r"? "Right": this.config.direction==="d"?"Down":"Both")}\n${directionToHeading[this.config.direction]}`, true);
        this.directionDropdown = this.dialog.addComboBox('', ['Right', 'Down', 'Both']);
        this.directionDropdown.currentIndex = this.config.direction == "r" ? 0 : (this.config.direction==="d"?1:2);
        this.directionDropdown.currentTextChanged.connect(function(newText){
            switch (newText){
                case 'Right': this.config.direction = "r"; break;
                case 'Down': this.config.direction = "d"; break;
                case 'Both': this.config.direction = "b"; break;
            }
            this.directionHeading.text = `Current Direction: ${newText}\n${directionToHeading[this.config.direction]}`;
            this.updateStrideInputs();
            const maxFrames = this.getMaxFrames();
            this.framesInput.maximum = maxFrames;
            if (this.framesInput.value === 0) this.config.frames = maxFrames;
        }.bind(this));
    }

    updateStrideInputs(){
        switch (this.config.direction)  {
            case 'r':
                this.downStrideInput.enabled = false;
                this.downStrideInput.toolTip = 'Disabled since the current direction is Right';
                this.downStrideInput.minimum = 0; this.downStrideInput.value = 0;
                this.rightStrideInput.enabled = true; this.rightStrideInput.minimum = 1;
                this.rightStrideInput.value = this.getDefaultStride('r');
                this.rightStrideInput.toolTip = this.rightStrideLabel.text;
                this.config.strideR = this.rightStrideInput.value; break;
            case 'd':
                this.rightStrideInput.enabled = false;
                this.rightStrideInput.toolTip = 'Disabled since the current direction is Down';
                this.rightStrideInput.minimum = 0; this.rightStrideInput.value = 0;
                this.downStrideInput.enabled = true; this.downStrideInput.minimum = 1;
                this.downStrideInput.value = this.getDefaultStride('d');
                this.downStrideInput.toolTip = this.downStrideLabel.text;
                this.config.strideD = this.downStrideInput.value; break;
            case 'b':
                if (this.rightStrideInput.value === 1) this.rightStrideInput.value = this.getDefaultStride('r');
                if (this.downStrideInput.value === 1) this.downStrideInput.value = this.getDefaultStride('d');
                this.downStrideInput.enabled = true; this.downStrideInput.minimum = 1;
                this.rightStrideInput.enabled = true; this.rightStrideInput.minimum = 1;
                this.config.strideD = this.downStrideInput.value; this.config.strideR = this.rightStrideInput.value;
                this.rightStrideInput.toolTip = this.rightStrideLabel.text; this.downStrideInput.toolTip = this.downStrideLabel.text; break;
        }
    }

    addStrideInput() {
        const defaultStrideR = this.getDefaultStride('r');
        const defaultStrideD = this.getDefaultStride('d');
        const maxStrideR = this.getMaxStride('r');
        const maxStrideD = this.getMaxStride('d');

        this.dialog.addHeading("Enter the stride. This represents the number of tiles to advance between each animation frame (in the direction specified in the previous step).\nThe value defaulted below is a best guess based on the selection, but may require adjustment depending on how the tileset is laid out.", true);
        this.rightStrideLabel = this.dialog.addLabel("Stride (Right)");
        this.rightStrideInput = this.dialog.addNumberInput("", defaultStrideR);
        this.rightStrideInput.minimum = 1; this.rightStrideInput.decimals = 0; this.rightStrideInput.maximum = maxStrideR;
        this.rightStrideInput.valueChanged.connect(() => { this.config.strideR = this.rightStrideInput.value; });
        this.config.strideR = this.rightStrideInput.value;
        this.downStrideLabel = this.dialog.addLabel("Stride (Down)");
        this.downStrideInput = this.dialog.addNumberInput("", defaultStrideD);
        this.downStrideInput.minimum = 1; this.downStrideInput.decimals = 0; this.downStrideInput.maximum = maxStrideD;
        this.downStrideInput.valueChanged.connect(() => { this.config.strideD = this.downStrideInput.value; });
        this.config.strideD = this.downStrideInput.value;
        this.updateStrideInputs();
    }

    // --- OPTIMISÉ: ne dépend pas d’indexOf ---
    getDefaultStride(direction) {
        if (!this.isSelectionRectangular()) return 1;
        const extent = this.config.extent;
        return direction === 'd' ? extent.height : extent.width;
    }

    getMaxStride(direction) {
        const extent = this.config.extent;
        if (direction === 'r' || direction === 'b') {
            const numCols = this.getNumCols();
            const extentR = extent.x + extent.width;
            return numCols - extentR;
        } else {
            const numRows = this.getNumRows();
            const extentB = extent.y + extent.height;
            return numRows - extentB;
        }
    }

    getIdStride() {
        const { direction, strideR, strideD } = this.config;
        const numCols = this.getNumCols();
        switch (direction) {
            case 'r': return strideR;
            case 'd': return numCols * strideD;
            case 'b': return strideR + (numCols * strideD);
        }
    }

    addFramesInput() {
        const maxFrames = this.getMaxFrames();
        this.dialog.addHeading("Enter the number of frames in each animation. Enter 0 if the animation continues for the remainder of the tileset.", true);
        const input = this.dialog.addNumberInput("Frames", 0);
        this.framesInput = input;
        this.config.frames = maxFrames;
        input.decimals = 0; input.minimum = 0; input.maximum = Math.floor(maxFrames);
        input.valueChanged.connect(() => { this.config.frames = input.value === 0 ? this.getMaxFrames() : input.value; });
    }

    getMaxFrames() {
        const { direction, strideR, strideD, extent } = this.config;
        if (direction === 'r') {
            const numCols = this.getNumCols();
            const extentR = extent.x + extent.width;
            return strideR === 0 ? 0 : 1 + Math.floor((numCols - extentR) / strideR);
        } else if (direction === 'b') {
            const numCols = this.getNumCols();
            const numRows = this.getNumRows();
            const extentR = extent.x + extent.width;
            const extentB = extent.y + extent.height;
            return (strideR === 0 || strideD === 0) ? 0 : (1 + Math.floor((numCols - extentR) / strideR)) * (1 + Math.floor((numRows - extentB) / strideD));
        } else { // 'd'
            const numRows = this.getNumRows();
            const extentB = extent.y + extent.height;
            return strideD === 0 ? 0 : 1 + Math.floor((numRows - extentB) / strideD);
        }
    }

    addDurationInput() {
        this.dialog.addHeading("Enter the default duration to use for each animation frame (in milliseconds).", true);
        this.durationInput = this.dialog.addNumberInput('Duration: ', 100);
        this.config.duration = 100;
        this.durationInput.decimals = 0; this.durationInput.minimum = 1; this.durationInput.maximum = 99999; this.durationInput.suffix = " ms";
        this.durationInput.value = this.config.duration;
        this.durationInput.valueChanged.connect(() => { this.config.duration = this.durationInput.value; });
    }

    // --- REWRITTEN: coordinates via tile.id (not indexOf) ---
    getTileCoord(tile) {
        const numCols = this.getNumCols();
        const id = tile.id;
        const x = id % numCols;
        const y = Math.floor(id / numCols);
        return Qt.point(x, y);
    }

    // --- REWRITTEN: uses only the cached sorted selection ---
    getSelectedTiles() {
        const tileset = tiled.activeAsset;
        if (!tileset.selectedTiles) return [];
        return tileset.selectedTiles.slice().sort((a, b) => a.id - b.id);
    }

    // --- REWRITTEN: uses tile.id -> simple O(n), not O(n^2) ---
    getSelectionExtent() {
        const selectedTiles = (this.config && this.config.selectedTiles) ? this.config.selectedTiles : this.getSelectedTiles();
        if (!selectedTiles || !selectedTiles.length) return null;
        const numCols = this.getNumCols();
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
        for (const t of selectedTiles) {
            const id = t.id;
            const x = id % numCols;
            const y = Math.floor(id / numCols);
            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
        }
        const width = right - left + 1;
        const height = bottom - top + 1;
        return Qt.rect(left, top, width, height);
    }

    isSelectionRectangular() {
        const extent = this.config.extent || this.getSelectionExtent();
        if (!extent) return null;
        const selectedTiles = this.config.selectedTiles; // already sorted by id
        const numCols = this.getNumCols();
        // Expected iteration by rows
        let i = 0;
        for (let r = extent.y; r < extent.y + extent.height; r++) {
            for (let c = extent.x; c < extent.x + extent.width; c++, i++) {
                if (i >= selectedTiles.length) return false;
                const expectedId = r * numCols + c;
                if (selectedTiles[i].id !== expectedId) return false;
            }
        }
        return true;
    }


    // --- REWRITTEN: builds frames using tile.id and Tileset.findTile/tile ---
    getFrames(tile, direction, strideR, strideD, maxFrames, duration) {
        const tileset = tiled.activeAsset;
        const idStride = this.getIdStride();
        const frames = [];
        let tileId = tile.id;
        for (let i = 0; i < maxFrames; i++, tileId += idStride) {
            const frameTile = tileset.findTile ? tileset.findTile(tileId) : tileset.tile(tileId); // findTile available in >= 1.9.2
            if (!frameTile) {
                // exits cleanly; warns the user only once
                tiled.alert("An error occurred performing the operation: a referenced tile (ID " + tileId + ") does not exist. Aborting.", this.title);
                return null;
            }
            frames.push({ tileId: frameTile.id, duration });
        }
        return frames;
    }

    formatError(e, name, config) {
        const tileset = tiled.activeAsset;
        let result = 'Error output from Bulk Animations extension (please copy everything below if submitting an issue):\n'
            + '----------------------------------------\n'
            + e.toString() + "\n\n"
            + "Action: " + name + "\n\n"
            + "Stack Trace:\n"
            + e.stack + '\n\n'
            + "Extension Version: " + this.version + "\n\n";
        if (config) result += "Config:\n" + JSON.stringify(config) +"\n\n";
        result += "Tileset Information:\n"
            + "Image width: " + tileset.imageWidth + "\n"
            + "Image height: " + tileset.imageHeight + "\n"
            + "Tile width: " + tileset.tileWidth + "\n"
            + "Tile height: " + tileset.tileHeight + "\n"
            + "Tile spacing: " + tileset.tileSpacing + "\n"
            + "Margin: " + tileset.margin + "\n\n"
            + '----------------------------------------\n';
        return result;
    }
}

const bulkAnimationEditor = new BulkAnimationEditor();

tiled.extendMenu("Tileset", [
    { action: 'BulkAnimationEditor_CreateFromSelection', before: 'AddTiles' },
    { action: 'BulkAnimationEditor_ClearSelection' },
    { separator: true }
]);
