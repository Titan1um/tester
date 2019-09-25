const assert = require('assert');

const Self = require('./remove');

describe('lib/cor/git-rm/remove', () => {
    describe('.handle', () => {
        it('ctx.err', async () => {
            let remove = new Self((data, cb) => {
                cb(null, {
                    statusCode: 500
                }, null);
            });

            let ctx = {
                err: 'error'
            };
            await remove.handle(ctx);

            assert.equal(ctx.err, 'error');
        });

        it('Remove.authCookie', async () => {
            let remove = new Self((data, cb) => {
                cb(null, {
                    statusCode: 500
                }, null);
            });

            let ctx = {};
            await remove.handle(ctx);

            assert.equal(ctx.err.message, 'Remove.authCookie');
        });

        it('Remove.domain', async () => {
            let remove = new Self((data, cb) => {
                cb(null, {
                    statusCode: 500
                }, null);
            });

            let ctx = {
                authCookie: 'authCookie'
            };
            await remove.handle(ctx);

            assert.equal(ctx.err.message, 'Remove.domain');
        });

        it('Remove.group', async () => {
            let remove = new Self((data, cb) => {
                cb(null, {
                    statusCode: 500
                }, null);
            });

            let ctx = {
                authCookie: 'authCookie',
                domain: 'https://test'
            };
            await remove.handle(ctx);

            assert.equal(ctx.err.message, 'Remove.group');
        });

        it('Remove.project', async () => {
            let remove = new Self((data, cb) => {
                cb(null, {
                    statusCode: 500
                }, null);
            });

            let ctx = {
                authCookie: 'authCookie',
                domain: 'https://test',
                group: 'test'
            };
            await remove.handle(ctx);

            assert.equal(ctx.err.message, 'Remove.project');
        });

        it('Remove.removeToken', async () => {
            let remove = new Self((data, cb) => {
                cb(null, {
                    statusCode: 500
                }, null);
            });

            let ctx = {
                authCookie: 'authCookie',
                domain: 'https://test',
                group: 'test',
                project: 'test'
            };
            await remove.handle(ctx);

            assert.equal(ctx.err.message, 'Remove.removeToken');
        });

        it('请求错误', async () => {
            let remove = new Self((data, cb) => {
                cb(new Error('请求错误'), null, null);
            });

            let ctx = {
                authCookie: 'authCookie',
                domain: 'https://test',
                group: 'test',
                project: 'test',
                removeToken: 'removeToken'
            };
            await remove.handle(ctx);

            assert.equal(ctx.err.message, '请求错误');
        });

        it('Remove.statusMessage', async () => {
            let remove = new Self((data, cb) => {
                cb(null, {
                    statusCode: 404,
                    statusMessage: 'Not Found'
                }, null);
            });

            let ctx = {
                authCookie: 'authCookie',
                domain: 'https://test',
                group: 'test',
                project: 'test',
                removeToken: 'removeToken'
            };
            await remove.handle(ctx);

            assert.equal(ctx.err.message, 'Remove.Not Found');
        });

        it('success', async () => {
            let remove = new Self((data, cb) => {
                cb(null, {
                    statusCode: 302
                }, null);
            });

            let ctx = {
                authCookie: 'authCookie',
                domain: 'https://test',
                group: 'test',
                project: 'test',
                removeToken: 'removeToken'
            };
            await remove.handle(ctx);

            assert.ifError(ctx.err);
        });
    });
});