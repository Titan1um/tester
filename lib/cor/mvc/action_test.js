const assert = require('assert');

const Action = require('./action');

describe('lib/cor/mvc/action', () => {
    describe('.handleFunc', () => {
        it('ctx.err存在', () => {
            let ctx = {
                err: 'some err'
            };

            let action = new Action();
            action.handle(ctx);

            assert.equal(ctx.action, undefined);
        });

        it('api不存在', () => {
            let ctx = {
                req: {
                    params: {
                        action: ''
                    }
                },
                service: {}
            };
            let action = new Action();
            action.handle(ctx);

            if (!ctx.err) {
                assert.fail('此处应该有err');
            }
        });

        it('存在参数', () => {
            let ctx = {
                req: {
                    params: {
                        action: 'test'
                    },
                    body: {
                        CreatedOn: 12345678,
                        $one: '123'
                    }
                },
                service: {
                    test: {
                        arg: {
                            createdOn: 'timestamp',
                            $One: null
                        }
                    }
                }
            };
            let action = new Action();
            action.handle(ctx);

            assert.equal(ctx.actionArg.createdOn, 12345678);
            assert.equal(ctx.actionArg.One, '123');
        });
    });
});