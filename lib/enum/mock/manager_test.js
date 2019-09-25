const assert = require('assert');

const Self = require('./manager');

describe('/lib/enum/mock', () => {
    describe('.all', () => {
        it('Success', async () => {
            let items = [{
                key: 'zhcn',
                value: 1,
                text: '中文'
            }, {
                key: 'en',
                value: 2,
                text: '英文'
            }];
            let self = new Self('language', items);
            assert.deepEqual(await self.all(), items);
        });
    });

    describe('.has', () => {
        it('不包含 key或text', async () => {
            let self = new Self('language', [{
                key: 'zhcn',
                value: 1,
                text: '中文'
            }]);
            assert.ok(!(await self.has('不存在')));
        });
        it('不包含 value', async () => {
            let self = new Self('language', [{
                key: 'zhcn',
                value: 1,
                text: '中文'
            }]);
            assert.ok(!(await self.has(2)));
        });
        it('不包含 value', async () => {
            let self = new Self('language', [{
                key: 'zhcn',
                value: 1,
                text: '中文'
            }]);
            assert.ok(!(await self.has(2)));
        });

        it('Success 存在key', async () => {
            let self = new Self('language', [{
                key: 'zhcn',
                value: 1,
                text: '中文'
            }]);
            assert.ok(await self.has('zhcn'));
        });

        it('Success 存在value', async () => {
            let self = new Self('language', [{
                key: 'zhcn',
                value: 1,
                text: '中文'
            }]);
            assert.ok(await self.has(1));
        });

        it('Success 存在text', async () => {
            let self = new Self('language', [{
                key: 'zhcn',
                value: 1,
                text: '中文'
            }]);
            assert.ok(await self.has('中文'));
        });
    });

    describe('.get', () => {
        it('Success 筛选key', async () => {
            let items = [{
                key: 'zhcn',
                value: 1,
                text: '中文'
            }];
            let self = new Self('language', items);
            assert.deepEqual(await self.get('zhcn'), items[0]);
        });

        it('Success 筛选value', async () => {
            let items = [{
                key: 'zhcn',
                value: 1,
                text: '中文'
            }];
            let self = new Self('language', items);
            assert.deepEqual(await self.get(1), items[0]);
        });

        it('Success 筛选text', async () => {
            let items = [{
                key: 'zhcn',
                value: 1,
                text: '中文'
            }];
            let self = new Self('language', items);
            assert.deepEqual(await self.get('中文'), items[0]);
        });
    });
});