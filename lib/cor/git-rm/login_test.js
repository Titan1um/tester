const assert = require('assert');

const Self = require('./login');

describe('lib/cor/git-rm/login', () => {
    describe('.handle', () => {
        it('ctx.err', async () => {
            let login = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200,
                    headers: {
                        'set-cookie': 'authCookie'
                    }
                }, null);
            });

            let ctx = {
                err: 'error',
            };
            assert.ifError(await login.handle(ctx));
            assert.ifError(ctx.authCookie);
        });

        it('Login.loginCookie', async () => {
            let login = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200,
                    headers: {
                        'set-cookie': 'authCookie'
                    }
                }, null);
            });

            let ctx = {
                domain: 'https://test',
            };
            await login.handle(ctx);

            assert.equal(ctx.err.message, 'Login.loginCookie');
            assert.ifError(ctx.authCookie);
        });

        it('Login.loginToken', async () => {
            let login = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200,
                    headers: {
                        'set-cookie': 'authCookie'
                    }
                }, null);
            });

            let ctx = {
                domain: 'https://test',
                loginCookie: 'loginCookie'
            };
            await login.handle(ctx);

            assert.equal(ctx.err.message, 'Login.loginToken');
            assert.ifError(ctx.authCookie);
        });

        it('Login.gitUsername', async () => {
            let login = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200,
                    headers: {
                        'set-cookie': 'authCookie'
                    }
                }, null);
            });

            let ctx = {
                domain: 'https://test',
                loginCookie: 'loginCookie',
                loginToken: 'loginToken',
                gitPassword: 'test'
            };
            await login.handle(ctx);

            assert.equal(ctx.err.message, 'Login.gitUsername');
            assert.ifError(ctx.authCookie);
        });

        it('Login.gitPassword', async () => {
            let login = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200,
                    headers: {
                        'set-cookie': 'authCookie'
                    }
                }, null);
            });

            let ctx = {
                domain: 'https://test',
                loginCookie: 'loginCookie',
                loginToken: 'loginToken',
                gitUsername: 'test'
            };
            await login.handle(ctx);

            assert.equal(ctx.err.message, 'Login.gitPassword');
            assert.ifError(ctx.authCookie);
        });

        it('请求错误', async () => {
            let login = new Self((data, cb) => {
                cb(new Error('请求错误'), {
                    statusCode: 200,
                    headers: {
                        'set-cookie': 'authCookie'
                    }
                }, null);
            });

            let ctx = {
                domain: 'https://test',
                loginCookie: 'loginCookie',
                loginToken: 'loginToken',
                gitUsername: 'test',
                gitPassword: 'test'
            };
            await login.handle(ctx);

            assert.equal(ctx.err.message, '请求错误');
            assert.ifError(ctx.authCookie);
        });

        it('Login.statusMessage', async () => {
            let login = new Self((data, cb) => {
                cb(null, {
                    statusCode: 404,
                    statusMessage: 'Not Found',
                    headers: {
                        'set-cookie': 'authCookie'
                    }
                });
            });

            let ctx = {
                domain: 'https://test',
                loginCookie: 'loginCookie',
                loginToken: 'loginToken',
                gitUsername: 'test',
                gitPassword: 'test'
            };
            await login.handle(ctx);

            assert.equal(ctx.err.message, 'Login.Not Found');
            assert.ifError(ctx.authCookie);
        });

        it('Login.getAuthCookie', async () => {
            let login = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200,
                    headers: {}
                }, null);
            });

            let ctx = {
                domain: 'https://test',
                loginCookie: 'loginCookie',
                loginToken: 'loginToken',
                gitUsername: 'test',
                gitPassword: 'test'
            };
            await login.handle(ctx);

            assert.equal(ctx.err.message, 'Login.getAuthCookie');
            assert.ifError(ctx.authCookie);
        });

        it('success', async () => {
            let login = new Self((data, cb) => {
                cb(null, {
                    statusCode: 200,
                    headers: {
                        'set-cookie': 'authCookie'
                    }
                }, null);
            });

            let ctx = {
                domain: 'https://test',
                loginCookie: 'loginCookie',
                loginToken: 'loginToken',
                gitUsername: 'test',
                gitPassword: 'test'
            };
            await login.handle(ctx);

            assert.ifError(ctx.err);
            assert.equal(ctx.authCookie, 'authCookie');
        });
    });
});