const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const $ = require('underscore');
const util = require('util');

const Handler = require('../handler');
const str = require('../../str');

class Pull extends Handler {
    constructor(cfg, files, mock) {
        super();

        this.cfg = cfg;
        this.files = files;
        this.execFunc = mock && mock.exec || util.promisify(cp.exec);
        this.mkdirFunc = mock && mock.mkdir || util.promisify(fs.mkdir);
    }

    async handleFunc(ctx) {
        this.validContext(ctx, 'gitURL');

        ctx.gitDir = path.join(__dirname, '..', '..', '..', '..', str.rand(32));
        await this.mkdirFunc(ctx.gitDir);

        let cmds = $.reduce(this.files, (memo, r) => {
            memo.push(`echo ${r} >> .git/info/sparse-checkout`);
            return memo;
        }, [
            `git init`,
            `git config core.sparseCheckout true`
        ]);
        let gitURL = (ctx.gitPullURL || ctx.gitURL).replace('https://', `https://${this.cfg.username}:${this.cfg.password}@`);
        cmds.push(
            `git remote add origin ${gitURL}`,
            `git pull origin master`
        );
        for (let cmd of cmds) {
            await this.execFunc(cmd, {
                cwd: ctx.gitDir
            });
        }
    }
}

module.exports = Pull;