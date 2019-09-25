const assert = require('assert');

const Self = require('./pull');

let pull, opt, gitDir, cmds = [];

describe('lib/cor/git/pull', () => {
    describe('.handle', () => {
        before(() => {
            let mock = {
                exec: (arg, options) => {
                    cmds.push(arg);
                    opt = options;
                },
                mkdir: (req) => {
                    gitDir = req;
                }
            };
            pull = new Self({
                username: 'test',
                password: 'test'
            }, ['/file', 'Dockerfile'], mock);
        });

        afterEach(()=>{
            cmds = [];
            opt = {};
            gitDir = '';
        });

        it('ctx.gitURL不存在报错', async () => {
            let ctx = {};
            await pull.handle(ctx);
            assert.equal(ctx.err.message, 'Pull.gitURL');
        });

        it('gitURL', async () => {
            let ctx = {
                gitURL: 'https://gitURL'
            };
            await pull.handle(ctx);

            assert.ifError(ctx.err);
            assert.deepEqual(cmds, [
                `git init`,
                `git config core.sparseCheckout true`,
                `echo /file >> .git/info/sparse-checkout`,
                `echo Dockerfile >> .git/info/sparse-checkout`,
                `git remote add origin https://test:test@gitURL`,
                `git pull origin master`
            ]);
            assert.deepEqual(opt, {
                cwd: ctx.gitDir
            });
            assert.equal(gitDir, ctx.gitDir);
        });

        it('gitPullURL', async () => {
            let ctx = {
                gitURL: 'https://gitURL',
                gitPullURL: 'https://gitPullURL'
            };
            await pull.handleFunc(ctx);

            assert.deepEqual(cmds, [
                `git init`,
                `git config core.sparseCheckout true`,
                `echo /file >> .git/info/sparse-checkout`,
                `echo Dockerfile >> .git/info/sparse-checkout`,
                `git remote add origin https://test:test@gitPullURL`,
                `git pull origin master`
            ]);
            assert.deepEqual(opt, {
                cwd: ctx.gitDir
            });
            assert.equal(gitDir, ctx.gitDir);
        });
    });
});