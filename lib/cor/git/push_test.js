const assert = require('assert');

const Self = require('./push');

describe('lib/cor/git/push', () => {
    describe('.handle', () => {
        it('ctx.branch不存在返回', async () => {
            let push = new Self();
            let ctx = {};
            await push.handle(ctx);

            assert.ifError(ctx.err);
        });

        it('ctx.gitDir不存在报错', async () => {
            let push = new Self();
            let ctx = {
                branch: 'test'
            };
            await push.handle(ctx);

            assert.equal(ctx.err.message, 'Push.gitDir');
        });

        it('files数组为空', async () => {
            let ctx = {
                gitURL: 'https://gitURL',
                branch: 'test',
                gitDir: __dirname,
            };

            let cmds = [];
            let push = new Self(
                [],
                arg => {
                    cmds.push(arg);
                }
            );
            await push.handle(ctx);
            assert.deepEqual(cmds, [
                `git push origin test`
            ]);
        });

        it('files数组不为空', async () => {
            let ctx = {
                gitURL: 'https://gitURL',
                branch: 'test',
                gitDir: __dirname,
            };

            let cmds = [];
            let push = new Self(
                ['a.js', 'b.js'],
                arg => {
                    cmds.push(arg);
                }
            );
            await push.handle(ctx);
            assert.deepEqual(cmds, [
                `git add -f a.js`,
                `git add -f b.js`,
                `git commit -m "commit by 'lite'"`,
                `git push origin test`
            ]);
        });
    });
});