const Handler = require('./handler');
const rm = require('./rm');

class Clear extends Handler {
    constructor(log, rmFunc) {
        super();

        this.log = log || console.log;
        this.rm = rmFunc || rm;
    }

    async handleFunc(ctx) {
        if (ctx.err)
            this.log(ctx.err);

        if (ctx.gitDir)
            await this.rm(ctx.gitDir);
    }
}

module.exports = Clear;