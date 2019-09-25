const assert = require('assert');

const Item = require('./item');
const dbFactory = require('../../db-factory');
const mock = require('../../db-factory/mock');

let iron = {
    id: '1',
    name: 'metal',
    key: 'iron',
    value: 1,
    text: '铁x',
};
let silver = {
    id: '2',
    name: 'metal',
    key: 'silver',
    value: 2,
    text: '银A',
};

describe('/lib/enum/db/item.js', () => {
    before(() => {
        dbFactory.set(new mock.Factory());
        mock.RegisterWhere('enum', (entity, where) => {
            return entity.key == where[1];
        });
    });

    beforeEach(async () => {
        dbFactory.db('enum').add(iron);
    });

    afterEach(() => {
        mock.flushAll();
    });

    describe('.add', () => {
        it('success+无attrs', async () => {
            let mockEnumerable = {
                has: () => {
                    return false;
                },
                name: iron.name
            };
            let self = new Item(mockEnumerable);
            await self.add(null, silver);

            let rows = await dbFactory.db('enum').query().toArray();
            assert.deepEqual(rows, [iron, {
                ...silver,
                id: rows[1].id,
                attrs: []
            }]);
            assert.deepEqual(self.entry, {
                ...rows[1],
                attrs: []
            });
        });

        it('success', async () => {
            let mockEnumerable = {
                has: () => {
                    return false;
                },
                name: iron.name
            };
            let attrs = [{
                enumName: silver.name,
                enumValue: silver.value,
                key: 1,
                value: 1,
            }, {
                enumName: silver.name,
                enumValue: silver.value,
                key: 2,
                value: 2,
            }, {
                value: 3,
            }];
            let self = new Item(mockEnumerable);
            let entry = {
                ...silver,
                attrs: attrs
            }
            await self.add(null, entry);

            let enums = await dbFactory.db('enum').query().where('key = ?', silver.key).toArray();
            assert.equal(enums.length, 1);
            assert.deepEqual(self.entry, enums[0]);
            assert.equal(self.lowercaseKey, entry.key.toLowerCase());
            assert.equal(self.lowercaseText, entry.text.toLowerCase());
            let enumAttrs = await dbFactory.db('enum-attr').query().toArray();
            assert.deepEqual(enumAttrs, [{
                id: enumAttrs[0].id,
                ...attrs[0]
            }, {
                id: enumAttrs[1].id,
                ...attrs[1]
            }]);
        });
    });

    describe('.equal', () => {
        it('根据key查询+success(忽略大小写)', async () => {
            let self = new Item(null, iron);
            let ok = await self.equal('Iron');
            assert.ok(ok);
        });

        it('根据value查询+success', async () => {
            let self = new Item(null, iron);
            let ok = await self.equal(iron.value);
            assert.ok(ok);
        });

        it('根据text查询+success(忽略大小写)', async () => {
            let self = new Item(null, iron);
            let ok = await self.equal('铁X');
            assert.ok(ok);
        });
    });

    describe('.getEntry', () => {
        it('success', () => {
            let self = new Item(null, iron);
            let res = self.getEntry('Iron');
            assert.deepEqual(res, {
                key: iron.key,
                value: iron.value,
                text: iron.text,
                attr: {}
            });
        });

        it('success attrs', () => {
            let self = new Item(null, {
                ...iron,
                attrs: [{
                    key: 1,
                    value: 2
                }, {
                    key: 3,
                    value: 4
                }]
            });
            let res = self.getEntry('Iron');
            assert.deepEqual(res, {
                key: iron.key,
                text: iron.text,
                value: iron.value,
                attr: {
                    '1': 2,
                    '3': 4
                }
            });
        });
    });

    describe('.remove', () => {
        it('success 无attrs', async () => {
            let db = dbFactory.db('enum');
            await db.add(silver);

            let self = new Item(null, silver);
            let uow = dbFactory.uow();
            await self.remove(uow);
            await uow.commit();

            let count = db.query().where('key = ?', silver.key).count();
            assert.equal(count, 0);
        });

        it('success 有attrs', async () => {
            let db = dbFactory.db('enum');
            await db.add(silver);
            let attrDb = dbFactory.db('enum-attr');
            let attr = {
                id: 'attr.id',
                enumName: 'attr.enumName',
                enumValue: 'attr.enumValue',
                key: 'attr.key',
                value: 1,
            };
            await attrDb.add(attr);

            let self = new Item(null, {
                ...silver,
                attrs: [attr]
            });
            let uow = dbFactory.uow();
            await self.remove(uow);
            await uow.commit();

            let count = await db.query().where('key = ?', silver.key).count();
            assert.equal(count, 0);
            let attrCount = await attrDb.query().count();
            assert.equal(attrCount, 0);
        });
    });
});