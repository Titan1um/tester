const fs = require('fs');
const path = require('path');
const $ = require('underscore');
const util = require('util');

const ROOT_DIR = path.join(__dirname, '..', '..', '..', 'model', 'enum');

let cache = {};
let enumFileMapping = null;
let readdirAsync = util.promisify(fs.readdir);

class Manager {
    constructor(name) {
        this.name = name;
    }

    async all() {
        if (cache[this.name])
            return cache[this.name];

        await scanEnumFile();
        let enumFileName = enumFileMapping && enumFileMapping[this.name.replace('-', '').toLowerCase()];
        if (!enumFileName)
            return [];
        return await readEnum(this.name, enumFileName);
    }

    async has(pair) {
        let item = await this.get(pair);
        return item ? true : false;
    }

    async get(pair) {
        let enums = await this.all();

        return $.find(enums, $.isString(pair) ? r => {
            return r.key.toLowerCase() == pair.toLowerCase() || r.text == pair
        } : {
            value: pair
        });
    }
}

async function scanEnumFile() {
    if (enumFileMapping)
        return;
        
    enumFileMapping = fs.existsSync(ROOT_DIR) ? $.chain(
        await readdirAsync(ROOT_DIR)
    ).map(f => {
        return [f.split('.')[0].replace('-', '').toLowerCase(), f];
    }).object().value() : null;
}

async function readEnum(enumName, enumFileName) {
    cache[enumName] = $.chain(
        require(path.join(ROOT_DIR, enumFileName))
    ).map((v, k) => {
        return {
            key: k,
            value: v.value,
            text: v.text
        };
    }).value();
    return cache[enumName];
}

module.exports = Manager;