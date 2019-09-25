const assert = require('assert');
const path = require('path');

const Self = require('./replace');

describe('upgrade/replace', () => {
    describe('.handle', () => {
        it('ctx.err', async () => {
            let ctx = {
                err: 'error'
            };
            await new Self().handle(ctx);

            assert.notEqual(ctx.err.message, 'Replace.gitDir');
        });

        it('!ctx.gitDir', async () => {
            let ctx = {};
            await new Self().handle(ctx);

            assert.equal(ctx.err.message, 'Replace.gitDir');
        });

        it('success', async () => {
            let ctx = {
                gitDir: path.join(__dirname, 'test')
            };
            let handler = new Self([
                ['lib'],
                ['upgrade', 'replace.js']
            ], {
                cp: () => ctx.cp = 1,
                rm: (dst) => {
                    if (dst == path.join(__dirname, '..', 'lib')) {
                        ctx.rm = 1;
                    }
                    if (dst == path.join(__dirname, 'replace.js')) {
                        throw new Error('Rm.Error');
                    }
                },
                isDirFunc: (dst) => {
                    return (dst == path.join(__dirname, '..', 'lib')) ? true : false;
                }
            });

            await handler.handle(ctx);

            assert.ifError(ctx.err);
            assert.ok(ctx.cp);
            assert.ok(ctx.rm);
        });
    });
});