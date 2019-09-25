const assert = require('assert');

const Self = require('./get-login-token');

describe('lib/cor/git-rm/get-login-token', () => {
    describe('.handle', () => {
        it('GetLoginToken.domain', async () => {
            let ctx = {};
            await new Self().handle(ctx);

            assert.equal(ctx.err.message, 'GetLoginToken.domain');
        });

        it('请求错误', async () => {
            let getLoginToken = new Self((data, cb) => {
                cb(new Error('请求错误'), {
                    headers: {
                        'set-cookie': 'cookie'
                    }
                }, null);
            });

            let ctx = {
                domain: 'https://test'
            };
            await getLoginToken.handle(ctx);

            assert.equal(ctx.err.message, '请求错误');
            assert.ifError(ctx.loginCookie);
            assert.ifError(ctx.loginToken);
        });

        it('GetLoginToken.statusMessage', async () => {
            let getloginToken = new Self((data, cb) => {
                cb(null, {
                    statusCode: 404,
                    statusMessage: 'Not Found'
                }, '<input type="hidden" name="authen_token" value="1" />');
            });

            let ctx = {
                domain: 'https://test'
            };
            await getloginToken.handle(ctx);

            assert.equal(ctx.err.message, 'GetLoginToken.Not Found');
            assert.ifError(ctx.loginToken);
        });

        it('GetLoginToken.matches', async () => {
            let getLoginToken = new Self((data, cb) => {
                cb(null, {
                    headers: {
                        'set-cookie': 'cookie',
                    },
                    statusCode: 200
                }, '');
            });

            let ctx = {
                domain: 'https://test'
            };
            await getLoginToken.handle(ctx);
            assert.equal(ctx.err.message, 'GetLoginToken.matches');
        });

        it('success', async () => {
            let getLoginToken = new Self((data, cb) => {
                cb(null, {
                    headers: {
                        'set-cookie': 'cookie',
                    },
                    statusCode: 200
                }, '<input type="hidden" name="authen_token" value="1" />');
            });

            let ctx = {
                domain: 'https://test'
            };
            assert.ifError(await getLoginToken.handle(ctx));
            assert.equal(ctx.loginCookie, 'cookie');
            assert.equal(ctx.loginToken, 1);
        });
    });
});