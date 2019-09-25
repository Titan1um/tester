const request = require('request');

const Handler = require('../handler');

class Login extends Handler {
    constructor(postFunc) {
        super();

        this.postFunc = postFunc || request.post;
    }

    async handleFunc(ctx) {
        if (ctx.err)
            return;

        this.validContext(ctx, 'domain', 'loginCookie', 'loginToken', 'gitUsername', 'gitPassword');

        await new Promise((s, f) => {
            this.postFunc({
                url: `${ctx.domain}/users/auth/ldapmain/callback`,
                headers: {
                    Cookie: ctx.loginCookie
                },
                form: {
                    utf8: '✓',
                    authenticity_token: ctx.loginToken,
                    username: ctx.gitUsername,
                    password: ctx.gitPassword
                }
            }, (err, resp) => {
                if (err)
                    return f(err);

                if (resp.statusCode != 302)
                    return f(new Error(`Login.${resp.statusMessage}`));

                if (!resp.headers['set-cookie'])
                    return f(new Error('Login.getAuthCookie'));

                ctx.authCookie = resp.headers['set-cookie'];
                s();
            });
        });
    }
}

module.exports = Login;