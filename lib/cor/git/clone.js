const cp = require('child_process');
const path = require('path');
const util = require('util');

const Handler = require('../../cor/handler');
const str = require('../../str');

let execAsync = util.promisify(cp.exec);

class Clone extends Handler {
    constructor(cfg, func) {
        super();

        this.cfg = cfg;
        this.exec = func || execAsync;
    }

    async handleFunc(ctx) {
        if (!ctx.gitURL)
            throw new Error('Clone.gitURL');

        ctx.gitDir = path.join(__dirname, '..', '..', '..', '..', str.rand(32));

        let gitURL = (ctx.gitCloneURL || ctx.gitURL).replace(
            'https://',
            `https://${this.cfg.username}:${this.cfg.password}@`
        );
        let branch = ctx.branch || 'master';
        await this.exec(`git clone --branch ${branch} ${gitURL} ${ctx.gitDir}`);
    }
}

module.exports = Clone;