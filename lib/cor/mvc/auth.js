const Handler = require('../../cor/handler');
const Exception = require('../../os/exception');
const User = require('../../os/account/user');

class Auth extends Handler {
    constructor(project, mock) {
        super();

        this.createUserFunc = mock ? mock.createUserFunc : req => new User(project, req);
        this.logFunc = mock ? mock.logFunc : console.log;
    }

    async handleFunc(ctx) {
        if (ctx.err)
            return;

        try {
            ctx.user = this.createUserFunc(ctx.req);
            if (!ctx.user.sessionID)
                return;

            let entry = await ctx.user.sdk.call('session', '/session/get', {
                key: ctx.user.sessionID,
                renewalTime: 30 * 60
            });
            ctx.user.setEntry(entry);
        } catch (e) {
            this.logFunc(e);
        } finally {
            if (!ctx.action.unauth && ctx.user.isNull)
                throw new Exception(99);
        }
    }
}

module.exports = Auth;