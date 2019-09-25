const assert = require('assert');
const path = require('path');

const Init = require('./init');
const rm = require('../../io/rm');

describe('lib/cor/git/init.js', () => {
    describe('.handleFunc', () => {
        before(() => {});
        it('ctx.err', async () => {
            let hasExec = false;
            let handler = new Init({}, () => {
                hasExec = true;
            });
            await handler.handle({
                err: 'error'
            });
            assert.ok(!hasExec);
        });

        it('success', async () => {
            let cfg = {
                username: 'test_name',
                password: 'test_pwd'
            };
            let cmds = [];
            let opt;
            let handler = new Init(cfg, (cmd, options) => {
                cmds.push(cmd);
                opt = options;
            });
            let ctx = {
                gitURL: 'https://test.git',
                gitDir: path.join(__dirname, Date.now().toString())
            };
            await handler.handle(ctx);
            await rm(ctx.gitDir);

            assert.deepEqual(cmds, [
                'git init',
                'git remote add origin https://test_name:test_pwd@test.git',
            ]);
            assert.deepEqual(opt, {
                cwd: ctx.gitDir
            });
        });
    });
});