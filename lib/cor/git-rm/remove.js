const request = require('request');

const Handler = require('../handler');

class Remove extends Handler {
    constructor(postFunc) {
        super();

        this.postFunc = postFunc || request.post;
    }

    async handleFunc(ctx) {
        if (ctx.err)
            return;

        this.validContext(ctx, 'authCookie', 'domain', 'group', 'project', 'removeToken');

        await new Promise((s, f) => {
            this.postFunc({
                url: `${ctx.domain}/${ctx.group}/${ctx.project}`,
                headers: {
                    Cookie: ctx.authCookie
                },
                form: {
                    utf8: '✓',
                    _method: 'delete',
                    authenticity_token: ctx.removeToken
                }
            }, (err, resp) => {
                if (err)
                    f(err)
                else if (resp.statusCode != 302)
                    f(new Error(`Remove.${resp.statusMessage}`));
                else
                    s();
            });
        });
    }
}

module.exports = Remove;