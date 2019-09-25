const fs = require('fs');
const path = require('path');
const $ = require('underscore');
const util = require('util');

const envReg = /(\w+)=([^\s]+)/;
const readFileAsync = util.promisify(fs.readFile);

class Dockerfile {
    constructor(...args) {
        if (!args.length)
            throw new Error('filePath');

        this.filePath = args.length > 1 ? path.join(...args) : args[0];
    }

    async getEnv() {
        await read(this);
        return $.clone(this.env);
    }
}

async function read(self) {
    if (!fs.existsSync(self.filePath))
        throw new Error(`dockerfile: ${self.filePath}`);

    if (self.env)
        return;

    self.env = {};
    let context = await readFileAsync(self.filePath, 'utf-8');
    let m;
    while (m = context.match(envReg)) {
        self.env[m[1]] = m[2];
        context = context.substr(m.index + m[0].length);
    }
}

module.exports = Dockerfile;