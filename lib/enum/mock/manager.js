const $ = require('underscore');


class Manager {
    constructor(name, items) {
        this.name = name;
        this.items = items;
    }

    async all() {
        return this.items;
    }

    async has(pair) {
        let e = await this.get(pair);
        return e ? true : false;
    }

    async get(pair) {
        return $.find(this.items, $.isString(pair) ? e => {
            return e.key.toLowerCase() == pair.toLowerCase() || e.text == pair
        } : {
            value: pair
        });
    }
}

module.exports = Manager;