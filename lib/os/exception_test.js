const assert = require('assert');

const Exception = require('./exception');

describe('lib/os/exception', () => {
    describe('.constructor', () => {
        it('message不是字符串', () => {
            let exception = new Exception(1, {
                key: 'error'
            });
            assert.equal(exception.message, '{\"key\":\"error\"}');
        });

        it('message是字符串', () => {
            let exception = new Exception(1, 'exception');
            assert.equal(exception.message, 'exception');
        });
    });
});