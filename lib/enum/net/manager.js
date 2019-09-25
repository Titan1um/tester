const $ = require('underscore');

class Net {
    constructor(name, appName, user) {
        this.name = name;
        this.appName = appName;
        this.user = user;
    }

    async all() {
        let res = await this.user.sdk.call(this.appName, '/enum/find', {
            name: this.name
        });
        return res[this.name];
    }

    async has(pair) {
        let entries = await this.all();
        return $.any(entries, r => {
            return compare(r, pair);
        });
    }

    async get(pair) {
        let entries = await this.all();
        return $.find(entries, r => {
            return compare(r, pair);
        });
    }
}

function compare(entry, pair) {
    if ($.isString(pair))
        pair = pair.toLowerCase();

    return entry.key.toLowerCase() == pair || entry.value == pair || entry.text.toLowerCase() == pair;
}

module.exports = Net;