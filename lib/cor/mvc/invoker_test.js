const assert = require('assert');

const Invoker = require('./invoker');

describe('lib/net/mvc/invoker', () => {
    describe('.handleFunc', () => {
        it('ctx.err有值', async () => {
            let ctx = {
                err: 'some err'
            };

            await new Invoker().handle(ctx);

            if (ctx.res) {
                assert.fail('不应有值');
            }
        });

        it('正常执行', async () => {
            let ctx = {
                action: {
                    fn: {
                        call: (a, b) => {
                            return "ok";
                        }
                    }
                },
                actionArg: {}
            };

            await new Invoker().handle(ctx);

            assert.equal(ctx.res, "ok");
        });
    });
});