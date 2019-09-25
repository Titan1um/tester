const cp = require('child_process');
const path = require('path');
const util = require('util');

const Handler = require('./handler');

let execAsync = util.promisify(cp.exec);

class Clone extends Handler {
    constructor(gitURL, func) {
        super();

        this.gitURL = gitURL;
        this.exec = func || execAsync;
    }

    async handleFunc(ctx) {
        ctx.gitDir = path.join(process.env.GOPATH, Date.now().toString());
        let cmd = `git clone ${this.gitURL} ${ctx.gitDir}`;
        console.log(cmd);
        await this.exec(cmd);
    }
}

module.exports = Clone;