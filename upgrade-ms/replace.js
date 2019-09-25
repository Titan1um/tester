const fs = require('fs');
const path = require('path');
const util = require('util');

const cp = require('./cp');
const Handler = require('./handler');
const rm = require('./rm');

class Replace extends Handler {
    constructor(filePaths, mock) {
        super();

        this.filePaths = filePaths;
        this.cpFunc = mock && mock.cp || cp;
        this.rmFunc = mock && mock.rm || rm;
        this.isDirFunc = mock && mock.isDirFunc || async function (dir) {
            let stat = await util.promisify(fs.stat)(dir);
            return stat.isDirectory();
        };
    }

    async handleFunc(ctx) {
        if (ctx.err)
            return;

        this.validContext(ctx, 'gitDir');

        for (let r of this.filePaths) {
            let src = path.join(ctx.gitDir, ...r);
            let dst = path.join(__dirname, '..', ...r);
            let isDir = await this.isDirFunc(src);
            if (isDir)
                await this.rmFunc(dst, console.log);

            await this.cpFunc(src, dst);
        }
    }
};

module.exports = Replace;