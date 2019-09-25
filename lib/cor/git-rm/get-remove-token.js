const request = require('request');

const Handler = require('../handler');

class GetRemoveToken extends Handler {
    constructor(getFunc) {
        super();

        this.getFunc = getFunc || request.get;
    }

    async handleFunc(ctx) {
        if (ctx.err)
            return;

        this.validContext(ctx, 'authCookie', 'domain', 'group', 'project');

        await new Promise((s, f) => {
            this.getFunc({
                url: `${ctx.domain}/${ctx.group}/${ctx.project}/edit`,
                headers: {
                    Cookie: ctx.authCookie
                }
            }, (err, resp, body) => {
                if (err)
                    return f(err);

                if (resp.statusCode != 200)
                    return f(new Error(`GetRemoveToken.${resp.statusMessage}`));

                let matches = body.match(/_token" value="(.*?)"/g);
                if (!matches)
                    return f(new Error('GetRemoveToken.matches'));

                ctx.removeToken = matches.pop().replace('_token" value="', '').replace('"', '');
                s();
            });
        });
    }
}

module.exports = GetRemoveToken;