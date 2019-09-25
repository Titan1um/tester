const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');
const $ = require('underscore');

const self = require('./enum');
const dbFactory = require('../lib/db-factory');
const MockFactory = require('../lib/db-factory/mock');
const io = require('../lib/io');
const str = require('../lib/str');
const redis = require('../lib/redis');
const MockRedis = require('../lib/redis/mock');
const errCode = require('../model/enum/err-code');

const TEST_DIR = path.join(__dirname, '..', 'model', 'enum');

let writeFileAsync = util.promisify(fs.writeFile);

describe('/api/enum.js', () => {
    before(async () => {
        dbFactory.set(
            new MockFactory.Factory()
        );
        redis.set(new MockRedis());
        MockFactory.RegisterWhere('enum-attr', (entity, where) => {
            return entity.enumName == where[1];
        });

        await io.mkdir(TEST_DIR);
        let tempContent = `module.exports = {
    idle: {
        text: '空闲',
        value: 0,
    },
    running: {
        text: '执行中',
        value: 1,
    },
    completed: {
        text: '完成',
        value: 2,
    },
}`;
        await writeFileAsync(
            path.join(TEST_DIR, 'enum_test.js'),
            tempContent
        );
    });

    after(async () => {
        let modelDir = path.join(TEST_DIR, '..');
        if (fs.readdirSync(modelDir).length)
            await io.rm(path.join(TEST_DIR, 'enum_test.js'));
        else
            await io.rm(modelDir);
    });

    beforeEach(() => {
        MockFactory.RegisterWhere('enum', (entity, where) => {
            return entity.name == where[1];
        });
    });

    afterEach(() => {
        MockFactory.flushAll();
    })

    describe('.add', () => {
        it('枚举已存在, db', async () => {
            await dbFactory.db('enum').add({
                id: str.randID(),
                name: 'testEnum',
                key: 'test',
                value: 0,
                text: '测试'
            });

            let err;
            try {
                await self.add.fn({
                    name: 'testEnum',
                    key: 'test',
                    value: 0,
                    text: '测试'
                });
            } catch (error) {
                err = error;
            }

            assert.equal(err.message, '枚举已存在');
            assert.equal(err.code, errCode.tip.value);
        });

        it('success', async () => {
            let db = dbFactory.db('enum');
            await db.add({
                id: str.randID(),
                name: 'testEnum',
                key: 'test',
                value: 0,
                text: '测试'
            });

            let err;
            let arg = {
                name: 'testEnum1',
                key: 'test1',
                value: 1,
                text: '测试1',
                attrs: [{
                    enumName: 'testEnum1',
                    enumValue: 1,
                    key: 'key',
                    value: 'value',
                }]
            }
            try {
                await self.add.fn(arg);
            } catch (error) {
                err = error;
            }

            assert.ifError(err);
            let enums = await db.query().where('name = ?', arg.name).toArray();
            let attrs = await dbFactory.db('enum-attr').query().toArray();
            assert.deepEqual($.omit(arg, 'attrs'), $.omit(enums[0], 'id', 'attrs'));
            assert.deepEqual([$.omit(attrs[0], 'id')], arg.attrs);
        });
    });

    describe('.find', () => {
        it('不存在, name有值', async () => {
            let resp = await self.find.fn({
                name: 'testEnum'
            });
            assert.deepEqual(resp, {});
        });

        it('不存在, names有值', async () => {
            let resp = await self.find.fn({
                names: ['testEnum']
            });
            assert.deepEqual(resp, {});
        });

        it('success, file', async () => {
            let resp = await self.find.fn({
                name: 'enum_test',
            });
            assert.deepEqual(resp, {
                'enum_test': [{
                        key: 'idle',
                        value: 0,
                        text: '空闲'
                    },
                    {
                        key: 'running',
                        value: 1,
                        text: '执行中'
                    },
                    {
                        key: 'completed',
                        value: 2,
                        text: '完成'
                    }
                ]
            });
        });

        it('success, db', async () => {
            await dbFactory.db('enum').add({
                id: str.randID(),
                name: 'testEnum',
                key: 'test',
                value: 1,
                text: '测试'
            });
            await dbFactory.db('enum-attr').add({
                id: str.randID(),
                enumName: 'testEnum',
                enumValue: 1,
                key: 'test',
                value: 1,
            });
            await dbFactory.db('enum-attr').add({
                id: str.randID(),
                enumName: 'testEnum',
                enumValue: 1,
                key: 'key',
                value: 2,
            });
            let resp = await self.find.fn({
                name: 'testEnum',
            });
            assert.deepEqual(resp, {
                testEnum: [{
                    key: 'test',
                    value: 1,
                    text: '测试',
                    attr: {
                        test: 1,
                        key: 2
                    }
                }]
            })
        });
    });

    describe('.remove', () => {
        it('success, value无值', async () => {
            let db = dbFactory.db('enum');
            let mock = [{
                id: str.randID(),
                name: 'testEnum',
                key: 'test1',
                value: 1,
                text: '测试1'
            }, {
                id: str.randID(),
                name: 'testEnum',
                key: 'test2',
                value: 2,
                text: '测试2'
            }];
            for (let entity of mock)
                await db.add(entity);

            let err;
            let arg = {
                name: 'testEnum'
            };
            try {
                await self.remove.fn(arg);
            } catch (error) {
                err = error;
            }
            let entities = await db.query().where('name = ?', arg.name).toArray();
            assert.ifError(err);
            assert.ok(entities.length == 0);
        });

        it('success, value有值', async () => {
            let db = dbFactory.db('enum');
            let mock = [{
                id: str.randID(),
                name: 'testEnum',
                key: 'test1',
                value: 1,
                text: '测试1'
            }, {
                id: str.randID(),
                name: 'testEnum',
                key: 'test2',
                value: 2,
                text: '测试2'
            }];
            for (let entity of mock)
                await db.add(entity);

            let err;
            let arg = {
                name: mock[0].name,
                value: mock[0].value
            };
            try {
                await self.remove.fn(arg);
            } catch (error) {
                err = error;
            }
            let entities = await db.query().where('name = ?', arg.name).toArray();

            assert.ifError(err);
            assert.ok(entities.length == 1);
            assert.deepEqual(entities[0], mock[1]);
        });
    });
});