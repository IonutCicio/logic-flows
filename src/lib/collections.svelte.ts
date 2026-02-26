export class ManuallyOrderedMap<K extends string | number | symbol, V> {
    private _records: Map<K, V> = new Map()
    private _lastIndex: number = 0
    private _index: Map<K, number> = new Map()

    // This is used to make the object reactive for Svelte
    version = $state<number>(0)

    get(key: K): V | undefined {
        return this._records.get(key)
    }

    set(key: K, value: V): void {
        const index = this._index.get(key);
        if (index == undefined) {
            this._lastIndex++;
            this._index.set(key, this._lastIndex);
        }

        this._records.set(key, value);
        this.version++;
    }

    delete(key: K): void {
        this._records.delete(key);
        this._index.delete(key)
        this.version++;
    }

    rename(key: K, newKey: K): void {
        const value = this._records.get(key)
        const index = this._index.get(key)

        if (!value || index == undefined) {
            throw new Error()
        }

        this._records.delete(key)
        this._index.delete(key)

        this._records.set(newKey, value);
        this._index.set(newKey, index);
        this.version++;
    }


    swap(key1: K, key2: K) {
        const index1 = this._index.get(key1)
        const index2 = this._index.get(key2)

        if (index1 === undefined || index2 === undefined) {
            throw new Error()
        }

        this._index.set(key1, index2);
        this._index.set(key2, index1);
        this.version++;
    }

    keys(): K[] {
        return Array.from(
            Array.from(this._index.entries()).sort(([_1, index1], [_2, index2]) => {
                return (index1 as number) - (index2 as number)
            }).map(([key, _]) => key)
        );
    }

    entries(): [K, V][] {
        return Array.from(
            Array.from(this._index).sort(([_1, index1], [_2, index2]) => {
                return (index1 as number) - (index2 as number)
            }).map(([key, _]) => {
                return [key, (this._records.get(key) as V)];
            }))
    }

    get size(): number {
        return this._records.size;
    }
}
