const path = require('path');

const cp = require('./cp');
const Handler = require('./handler');

class Copy extends Handler {
    constructor(files, mock) {
        super();

        this.files = files;
        this.cpFunc = mock || cp;
    }

    async handleFunc(ctx) {
        if (ctx.err)
            return;

        for (let r of this.files) {
            let src = path.join(ctx.gitDir, ...r);
            let dst = path.join(__dirname, '..', ...r);
            await this.cpFunc(src, dst);
        }
    }
}

module.exports = Copy;