const assert = require('assert');
const path = require('path');

const NodeModules = require('./node-modules');

let gitDir = path.join(process.env.GOPATH, Date.now().toString());
let gitJsonDir = path.join(gitDir, 'package-lock.json');
let oldJsonDir = path.join(__dirname, '..', 'package-lock.json');

describe('/upgrade/node_modules.js', () => {
    describe('.handle', () => {
        it('package-lock.json存在', async () => {
            let ctx = {
                gitDir: gitDir
            };
            let cmds = [];
            let mock = {
                execFunc: cmd => {
                    cmds.push(cmd);
                },
                existsFunc: () => {
                    return true;
                },
                readFileFunc: file => {
                    if (file == oldJsonDir)
                        return '{"dependencies": {}}';
                    if (file == gitJsonDir)
                        return `{"dependencies": {"accepts": {"version": "1.0.0"}}}`;
                }
            }

            let replace = new NodeModules(mock);
            await replace.handle(ctx);

            if (ctx.err)
                assert.fail(ctx.err);

            assert.deepEqual(cmds, ['npm install accepts@1.0.0']);
        });

        it('package-lock.json不存在', async () => {
            let ctx = {
                gitDir: gitDir
            };
            let pathArr = [];
            let mock = {
                cpFunc: (src, dst) => {
                    pathArr.push(src);
                    pathArr.push(dst);
                },
                existsFunc: () => {
                    return false;
                },
            };

            let replace = new NodeModules(mock);
            await replace.handle(ctx);

            if (ctx.err)
                assert.fail(ctx.err);

            assert.deepEqual(pathArr, [
                gitJsonDir,
                oldJsonDir,
                path.join(gitDir, 'node_modules'),
                path.join(__dirname, '..', 'node_modules'),
            ]);
        });
    })
})