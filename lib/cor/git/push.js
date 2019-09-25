const cp = require('child_process');
const util = require('util');

const Handler = require('../handler');

let execAsync = util.promisify(cp.exec);

class Push extends Handler {
    constructor(files, func) {
        super();

        this.files = files;
        this.exec = func || execAsync;
    }

    async handleFunc(ctx) {
        if (ctx.err || !ctx.branch)
            return;

        this.validContext(ctx, 'gitDir');

        let cmds = [];
        if (this.files.length) {
            for (let file of this.files)
                cmds.push(`git add -f ${file}`);

            cmds.push(`git commit -m "commit by 'lite'"`);
        }

        cmds.push(`git push origin ${ctx.branch}`);

        for (let cmd of cmds) {
            await this.exec(cmd, {
                cwd: ctx.gitDir
            });
        }
    }
}

module.exports = Push;