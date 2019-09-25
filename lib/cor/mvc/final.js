const Handler = require('../handler');
const Exception = require('../../os/exception');
const thread = require('../../thread');

class Final extends Handler {
    constructor(mock) {
        super();

        this.handleErrorFunc = mock || function (ctx) {
            thread.run(async () => {
                let stack = ctx.err.stack;
                await ctx.user.sdk.call('log', '/log/add', {
                    content: {
                        route: ctx.user.route,
                        stack: stack,
                        user: ctx.user.entry
                    },
                    traceID: ctx.user.getTraceID(),
                });
            });
            return new Exception(599, 'server-error');
        };
    }

    handleFunc(ctx) {
        if (ctx.err) {
            if (ctx.err.constructor != Exception)
                ctx.err = this.handleErrorFunc(ctx);

            ctx.resp.json({
                err: ctx.err.code > 500 ? 500 : ctx.err.code,
                data: ctx.err.message
            });
        } else {
            ctx.resp.json({
                err: 0,
                data: ctx.res
            });
        }
    }
}

module.exports = Final;