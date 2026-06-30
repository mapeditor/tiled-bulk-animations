class cacheservice implements ICacheService {
    constructor(
        private prefix: string = "tiled:",
        private cache = new Map<string, any>(),
    ) { }

    private prefixed(key: string) {
        return `${this.prefix}${key}`;
    }

    add(key: string, asset: Tileset): void {
        this.cache.set(this.prefixed(key), asset);

        // Update key if asset file name changed
        asset.fileNameChanged.connect((new_file_name) => {
            const old_file = this.cache.get(key);

            const old_file_key = this.prefixed(old_file);
            const new_file_key = this.prefixed(new_file_name);
            const data = this.cache.get(old_file_key);

            if (data !== undefined) {
                this.cache.delete(old_file_key);
                this.cache.set(new_file_key, data);
            }
            this.cache.set(key, new_file_name);
        });
    }

    get(key: string): Tileset | null {
        const value = this.cache.get(this.prefixed(key));
        return value !== undefined ? value : null;
    }

    remove(key: string): void {
        this.cache.delete(this.prefixed(key));
    }

}

export default cacheservice;