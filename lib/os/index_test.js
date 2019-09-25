const assert = require('assert');

const os = require('./index')

describe('/lib/os/index', () => {
    describe('getEnv', () => {
        it('正常运行', () => {
            os.mock('key', 'value');
            let res = os.getEnv('key');
            assert.strictEqual(res, 'value');
        });
    });

    describe('getEnvWithThrow', () => {
        it('正常运行', () => {
            os.mock('key', 'value');
            let res = os.getEnvWithThrow('key');
            assert.strictEqual(res, 'value');
        });

        it('抛出异常', () => {
            assert.throws(
                () => {
                    os.getEnvWithThrow('errorTest');
                },
                /^Error: 无效的环境变量:errorTest$/,
                '不是期望错误'
            );
        });
    });

    describe('mock', () => {
        it('正常运行', () => {
            os.mock('key', 'value')
            let res = os.getEnvWithThrow('key');
            assert.strictEqual(res, 'value');
        });
    });
});