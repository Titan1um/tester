const assert = require('assert');

const Handler = require('./handler');

class TestHandler extends Handler {
    async handleFunc(ctx) {
        ctx.data = "123"
    }
}

describe('lib/cor/handler', () => {
    describe('.constructor', () => {
        it('未使用构造函数', () => {
            let ctx = {};
            let handler = new TestHandler();
            handler.handle(ctx);

            assert.equal(ctx.data, '123');
        });

        it('有使用构造函数', () => {
            let ctx = {};
            let handler = new Handler(ctx => {
                ctx.data = '123'
            });
            handler.handle(ctx);

            assert.equal(ctx.data, '123');
        });
    });
});