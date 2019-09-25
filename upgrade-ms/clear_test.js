const assert = require('assert');

const Self = require('./clear');

describe('upgrade/clear', () => {
    describe('.clear', () => {
        it('err', async () => {
            let err;
            let ok;
            await new Self(ex => {
                err = ex;
            }, () => {
                ok = true;
            }).handle({
                err: 1
            });
            assert.equal(err, 1);
            assert.ifError(ok);
        });

        it('ok', async () => {
            let ctx = {
                gitDir: 'dir'
            };
            await new Self(null, res => {
                ctx.res = res;
            }).handle({
                gitDir: 'dir'
            });
            assert.equal(ctx.gitDir, ctx.res);
        });
    });
})