const assert = require('assert');

const Self = require('./get-remove-token');

describe('lib/cor/git-rm/get-remove-token', () => {
    describe('handle', () => {
        it('ctx.err', async () => {
            let getRemoveToken = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200
                }, '<input type="hidden" name="authen_token" value="1" />');
            });

            let ctx = {
                err: 'error'
            };
            await getRemoveToken.handle(ctx);

            assert.equal(ctx.err, 'error');
            assert.ifError(ctx.removeToken);
        });

        it('GetRemoveToken.authCookie', async () => {
            let getRemoveToken = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200
                }, '<input type="hidden" name="authen_token" value="1" />');
            });

            let ctx = {};
            await getRemoveToken.handle(ctx);

            assert.equal(ctx.err.message, 'GetRemoveToken.authCookie');
            assert.ifError(ctx.removeToken);
        });

        it('GetRemoveToken.domain', async () => {
            let getRemoveToken = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200
                }, '<input type="hidden" name="authen_token" value="1" />');
            });

            let ctx = {
                authCookie: 'authCookie'
            };
            await getRemoveToken.handle(ctx);

            assert.equal(ctx.err.message, 'GetRemoveToken.domain');
            assert.ifError(ctx.removeToken);
        });

        it('GetRemoveToken.group', async () => {
            let getRemoveToken = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200
                }, '<input type="hidden" name="authen_token" value="1" />');
            });

            let ctx = {
                authCookie: 'authCookie',
                domain: 'https://test'
            };
            await getRemoveToken.handle(ctx);

            assert.equal(ctx.err.message, 'GetRemoveToken.group');
            assert.ifError(ctx.removeToken);
        });

        it('GetRemoveToken.project', async () => {
            let getRemoveToken = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200
                }, '<input type="hidden" name="authen_token" value="1" />');
            });

            let ctx = {
                authCookie: 'authCookie',
                domain: 'https://test',
                group: 'test'
            };
            await getRemoveToken.handle(ctx);

            assert.equal(ctx.err.message, 'GetRemoveToken.project');
            assert.ifError(ctx.removeToken);
        });

        it('请求错误', async () => {
            let getRemoveToken = new Self((data, cb) => {
                cb(new Error('请求错误'), {
                    statusCode: 200
                }, '<input type="hidden" name="authen_token" value="1" />');
            });

            let ctx = {
                authCookie: 'authCookie',
                domain: 'https://test',
                group: 'test',
                project: 'test'
            };
            await getRemoveToken.handle(ctx);

            assert.equal(ctx.err.message, '请求错误');
            assert.ifError(ctx.removeToken);
        });

        it('GetRemoveToken.statusMessage', async () => {
            let getRemoveToken = new Self((data, cb) => {
                cb(null, {
                    statusCode: 404,
                    statusMessage: 'Not Found'
                }, '<input type="hidden" name="authen_token" value="1" />');
            });

            let ctx = {
                authCookie: 'authCookie',
                domain: 'https://test',
                group: 'test',
                project: 'test'
            };
            await getRemoveToken.handle(ctx);

            assert.equal(ctx.err.message, 'GetRemoveToken.Not Found');
            assert.ifError(ctx.removeToken);
        });

        it('GetRemoveToken.matches', async () => {
            let getRemoveToken = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200,
                    statusMessage: 'ok'
                }, '');
            });

            let ctx = {
                authCookie: 'authCookie',
                domain: 'https://test',
                group: 'test',
                project: 'test'
            };
            await getRemoveToken.handle(ctx);

            assert.equal(ctx.err.message, 'GetRemoveToken.matches');
            assert.ifError(ctx.removeToken);
        });

        it('success', async () => {
            let getRemoveToken = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200,
                    statusMessage: 'ok'
                }, '<input type="hidden" name="authen_token" value="1" />');
            });

            let ctx = {
                authCookie: 'authCookie',
                domain: 'https://test',
                group: 'test',
                project: 'test'
            };
            await getRemoveToken.handle(ctx);

            assert.ifError(ctx.err);
            assert.equal(ctx.removeToken, 1);
        });
    });
});