const assert = require('assert');

const Validation = require('./validation')
const Custom = require('./validator/custom');

describe('lib/net/mvc/validation', () => {
    describe('.handleFunc', () => {
        it('请求参数验证不通过', async () => {
            let ctx = {
                action: {
                    validators: [{
                        argName: 'createdOn',
                        validator: new Custom('timestamp')
                    }],
                    actionArg: {
                        createdOn: 12345678000
                    }
                }
            };

            await new Validation().handle(ctx);

            if (!ctx.err) {
                assert.fail('这里应该要报错')
            }
        });

        it('生成验证', () => {
            let ctx = {
                req: {
                    params: {
                        action: 'test'
                    },
                    body: {
                        createdOn: 12345678
                    }
                },
                action: {
                    arg: {
                        createdOn: '时间戳'
                    }
                }
            };
            let handler = new Validation();
            handler.handle(ctx);

            assert.equal(ctx.action.validators[0].argName, 'createdOn');
            if (!ctx.action.validators[0].validator) {
                assert.fail('此处应有数据');
            }
        });

        it('验证成功', async () => {
            let ctx = {
                action: {
                    validators: [{
                        argName: 'createdOn',
                        validator: new Custom('时间戳')
                    }, {
                        argName: 'page',
                        validator: {
                            valid: v => {
                                return v >= 1;
                            }
                        }
                    }]
                },
                actionArg: {
                    createdOn: Date.now(),
                    page: 1
                }
            };

            await new Validation().handle(ctx);

            if (ctx.err) {
                assert.fail(ctx.err)
            }
        });
    });
});