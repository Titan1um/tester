const assert = require('assert');

const self = require('./custom');
const str = require('../../../str');

describe('lib/cor/mvc/validator/custom', () => {
    describe('标识', () => {
        it('success', async () => {
            assert.ok(await self.create('标识').valid(str.randID()));
        });

        it('验证不通过', async () => {
            assert.ok(!(await self.create('标识').valid('123456')));
        });
    });

    describe('端口', () => {
        it('1~65535', async () => {
            assert.ok(await self.create('端口').valid(10000));
        });

        it('小于1', async () => {
            assert.ok(!(await self.create('端口').valid(0)));
        });

        it('大于65535', async () => {
            assert.ok(!(await self.create('端口').valid(70000)));
        });
    });

    describe('分页大小', () => {
        it('1~1000', async () => {
            assert.ok(await self.create('分页大小').valid(10));
        });

        it('小于1', async () => {
            assert.ok(!(await self.create('分页大小').valid(0)));
        });

        it('大于1000', async () => {
            assert.ok(!(await self.create('分页大小').valid(1001)));
        });
    });

    describe('分页页码', () => {
        it('1~10000', async () => {
            assert.ok(await self.create('分页页码').valid(10));
        });

        it('小于1', async () => {
            assert.ok(!(await self.create('分页页码').valid(0)));
        });

        it('大于10000', async () => {
            assert.ok(!(await self.create('分页页码').valid(10001)));
        });
    });

    describe('ipv4', () => {
        it('success', async () => {
            assert.ok(await self.create('ipv4').valid('10.1.12.21'));
        });

        it('验证不通过', async () => {
            assert.ok(!(await self.create('ipv4').valid('192.168.0.1111')));
        });
    });

    describe('可空标识', () => {
        it('success', async () => {
            assert.ok(await self.create('可空标识').valid(str.rand(32)));
        });

        it('空标识', async () => {
            assert.ok(await self.create('可空标识').valid(''));
        });

        it('验证不通过', async () => {
            assert.ok(!(await self.create('可空标识').valid('123456')));
        });
    });

    describe('密码', () => {
        it('success', async () => {
            assert.ok(await self.create('密码').valid('123456'));
            assert.ok(await self.create('密码').valid(str.rand(20)));
        });

        it('验证不通过', async () => {
            assert.ok(!(await self.create('密码').valid('12345')));
        });
    });

    describe('时间戳', () => {
        it('success', async () => {
            assert.ok(await self.create('时间戳').valid(Date.now()));
        });

        it('验证不通过', async () => {
            assert.ok(!(await self.create('时间戳').valid(123456)));
        });
    });

    describe('应用名', () => {
        it('success', async () => {
            assert.ok(await self.create('应用名').valid('应用名'));
        });

        it('长度溢出', async () => {
            assert.ok(!(await self.create('应用名').valid(str.rand(33))));
        });

        it('格式错误', async () => {
            assert.ok(!(await self.create('应用名').valid(123)));
        });
    });

    describe('整数', () => {
        it('success', async () => {
            assert.ok(await self.create('整数').valid(0));
        });

        it('验证不通过', async () => {
            assert.ok(!(await self.create('整数').valid(1.1)));
        });
    });

    describe('正整数', () => {
        it('success', async () => {
            assert.ok(await self.create('正整数').valid(1));
        });

        it('验证不通过', async () => {
            assert.ok(!(await self.create('正整数').valid(0)));
        });
    });

    describe('registry', () => {
        it('success', async () => {
            await self.registry({
                'registry': v => {
                    if (v == 1)
                        return true;
                }
            });
            let res = await self.create('registry').valid(1);
            assert.ok(res);
        });
    });
});