const cp = require('child_process');
const util = require('util');

const Handler = require('../handler');

class Init extends Handler {
    constructor(cfg, mockFunc) {
        super();

        this.cfg = cfg;
        this.exec = mockFunc || util.promisify(cp.exec);
    }

    async handleFunc(ctx) {
        if (ctx.err)
            return;

        this.validContext(ctx, 'gitDir', 'gitURL');

        let url = ctx.gitURL.replace('https://', `https://${this.cfg.username}:${this.cfg.password}@`);
        let cmds = [
            'git init',
            `git remote add origin ${url}`,
        ];
        for (let cmd of cmds) {
            await this.exec(cmd, {
                cwd: ctx.gitDir
            });
        }
    }
}

module.exports = Init;