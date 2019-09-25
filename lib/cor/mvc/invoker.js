const Handler = require('../handler');

class Invoker extends Handler {
    async handleFunc(ctx) {
        if (ctx.err)
            return;

        ctx.res = await ctx.action.fn.call({
            user: ctx.user
        }, ctx.actionArg);
    }
}

module.exports = Invoker;