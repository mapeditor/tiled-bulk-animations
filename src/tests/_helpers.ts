(globalThis as any).tiled = {
    activeAssetChanged: { connect: () => {} },
    registerAction: () => ({} as any),
    extendMenu: () => {},
    alert: () => {},
    confirm: () => true,
    log: () => {},
    error: () => {},
};

(globalThis as any).Qt = {
    rect: (x: number, y: number, w: number, h: number) => ({ x, y, width: w, height: h }),
};

(globalThis as any).Dialog = class {
    minimumWidth = 0;
    minimumHeight = 0;
    constructor(_title: string) {}
    reject() {}
    show() {}
    addComboBox(_label: string, _items: string[]) {
        return { currentIndex: 0, currentTextChanged: { connect: () => {} } };
    }
    addNumberInput(_label: string) {
        return {
            decimals: 0, minimum: 0, maximum: 99999, value: 0, suffix: "",
            valueChanged: { connect: () => {} },
        };
    }
    addButton(_text: string) {
        return { clicked: { connect: () => {} } };
    }
};

export function makeTile(id: number): any {
    return { id };
}

export function makeRect(x: number, y: number, w: number, h: number) {
    return { x, y, width: w, height: h };
}

export function makeTilesetDimensions(cols: number, rows: number, tw = 16, th = 16, sp = 0, m = 0): any {
    return {
        image: { width: cols * tw + (cols - 1) * sp + 2 * m, height: rows * th + (rows - 1) * sp + 2 * m },
        tileset: { tile: { width: tw, height: th, spacing: sp }, margin: m, rows, columns: cols },
    };
}

export function makeTilesetAsset(cols: number, rows: number, tw = 16, th = 16, sp = 0, m = 0): any {
    return {
        imageWidth: cols * tw + (cols - 1) * sp + 2 * m,
        imageHeight: rows * th + (rows - 1) * sp + 2 * m,
        tileWidth: tw,
        tileHeight: th,
        tileSpacing: sp,
        margin: m,
    };
}

let _mod: any = null;
export async function getIndexModule() {
    if (!_mod) _mod = await import("../index");
    return _mod;
}
