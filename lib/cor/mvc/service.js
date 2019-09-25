const fs = require('fs');
const path = require('path');
const $ = require('underscore');
const util = require('util');

const Handler = require('../handler');
const Exception = require('../../os/exception');

const readdirAsync = util.promisify(fs.readdir);

class Service extends Handler {
    constructor(dir) {
        super();

        this.dir = dir;
    }

    async handleFunc(ctx) {
        let name = ctx.req.params.service.toLowerCase();
        ctx.service = await get(this, name);
        if (ctx.service)
            return;

        throw new Exception(501, `server-route-service`);
    }
}

async function get(self, name) {
    if (!self.cache) {
        self.cache = {};

        let files = await readdirAsync(self.dir);
        for (let r of files) {
            if (r.includes('_'))
                continue;

            self.cache[path.basename(r, '.js')] = $.chain(
                require(
                    path.join(self.dir, r)
                )
            ).map((v, k) => [
                k.toLowerCase(),
                v
            ]).object().value();
        }
    }

    return self.cache[name];
}

module.exports = Service;