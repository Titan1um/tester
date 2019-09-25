const request = require('request');

const Handler = require('../handler');

class GetLoginToken extends Handler {
    constructor(getFunc) {
        super();

        this.getFunc = getFunc || request.get;
    }

    async handleFunc(ctx) {
        this.validContext(ctx, 'domain');

        await new Promise((s, f) => {
            this.getFunc({
                url: `${ctx.domain}/users/sign_in`
            }, (err, resp, body) => {
                if (err)
                    return f(err);

                if (resp.statusCode != 200)
                    return f(new Error(`GetLoginToken.${resp.statusMessage}`));

                ctx.loginCookie = resp.headers['set-cookie'];

                let matches = body.match(/_token" value="(.*?)"/g);
                if (!matches)
                    return f(new Error('GetLoginToken.matches'));

                ctx.loginToken = matches[0].replace('_token" value="', '').replace('"', '');
                s();
            });
        })
    }
}

module.exports = GetLoginToken;