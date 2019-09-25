const DEFAULT_KEY = 'default';

class Accessor {
    constructor() {
        this.hash = {};
    }

    get(k) {
        let v = this.tryGet(k);
        if (v)
            return v;

        throw new Error(`Register: ${k}`);
    }

    getOrSet(k, v) {
        let temp = this.tryGet(k);
        if (temp)
            return temp;

        return (this.hash[k] = v);
    }

    set(k, v) {
        if (!v) {
            v = k;
            k = DEFAULT_KEY;
        }

        this.hash[k] = v;
    }

    tryGet(k) {
        return this.hash[k || DEFAULT_KEY];
    }
}

module.exports = Accessor;