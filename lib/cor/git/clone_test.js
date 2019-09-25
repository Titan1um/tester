const assert = require('assert');

const Self = require('./clone');

let clone, cmd;

describe('lib/cor/git/clone', () => {
    describe('.handleFunc', () => {
        before(() => {
            clone = new Self({
                username: 'test',
                password: 'test'
            }, (arg) => {
                cmd = arg;
            });
        });

        it('!ctx.gitURL', async () => {
            let err;
            try {
                await clone.handleFunc({});
            } catch (ex) {
                err = ex;
            }
            assert.equal(err.message, 'Clone.gitURL');
        });

        it('!gitCloneURL but gitURL', async () => {
            let ctx = {
                gitURL: 'https://gitURL'
            };
            await clone.handleFunc(ctx);
            assert.equal(cmd, `git clone --branch master https://test:test@gitURL ${ctx.gitDir}`);
        });

        it('!gitURL but gitCloneURL', async () => {
            let ctx = {
                gitURL: 'https://gitURL',
                gitCloneURL: 'https://gitCloneURL'
            };
            await clone.handleFunc(ctx);
            assert.equal(cmd, `git clone --branch master https://test:test@gitCloneURL ${ctx.gitDir}`);
        });

        it('!gitCloneBranch but branch', async () => {
            let ctx = {
                gitURL: 'https://gitURL',
                branch: 'v1.0.0'
            };
            await clone.handleFunc(ctx);
            assert.equal(cmd, `git clone --branch v1.0.0 https://test:test@gitURL ${ctx.gitDir}`);
        });
    });
});