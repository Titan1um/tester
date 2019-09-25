const assert = require('assert');

const Conn = require('../mysql/conn');
const Query = require('../sql/query');
const SqlMaker = require('../sql/sql-maker');

const conn = new Conn({
    host: '10.47.133.237',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'lite-db'
});
const sqlMaker = new SqlMaker(0, Number.MAX_SAFE_INTEGER);

describe('/lib/db-factory/mysql/query.js', () => {
    after(() => {
        conn.pool.end();
    });

    beforeEach(async () => {
        await conn.exec([{
            sql: 'CREATE TABLE testTable (id int,name varchar(255),password varchar(255),`key` varchar(255))'
        }]);
    });

    afterEach(async () => {
        await conn.exec([{
            sql: 'DROP TABLE testTable'
        }]);
    });

    describe('.count()', () => {
        it('只有表', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'111\',\'111\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).count();
            assert.equal(result, 1);
        });

        it('有表和where条件', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'111\',\'111\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'2\',\'222\',\'222\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).where('id > ?', 1).count();
            assert.equal(result, 1);
        });

        it('sql错误', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'111\',\'111\')'
            }]);
            let err;
            try {
                await new Query(conn, 'AAAA', sqlMaker).count();
            } catch (error) {
                err = error;
            }
            assert.equal(err.code, 'ER_NO_SUCH_TABLE');
        });
    });

    describe('.toArray()', () => {
        it('只有表', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'name1\',\'password1\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).toArray();
            assert.deepEqual(result, [{
                id: `1`,
                name: `name1`,
                password: `password1`,
                key: null,
            }]);
        });

        it('有表和where条件', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'name1\',\'password1\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'2\',\'name2\',\'password2\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).where('id > ?', 1).toArray();
            assert.deepEqual(result, [{
                id: `2`,
                name: `name2`,
                password: `password2`,
                key: null,
            }]);
        });

        it('有表,take条件', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'name1\',\'password1\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'2\',\'name2\',\'password2\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'3\',\'name3\',\'password3\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).take(1).toArray();
            assert.deepEqual(result, [{
                id: `1`,
                name: `name1`,
                password: `password1`,
                key: null,
            }]);
        });

        it('有表,skip条件', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'name\',\'password\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'2\',\'name\',\'password\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'3\',\'name\',\'password\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).skip(1).toArray();
            assert.deepEqual(result, [{
                id: 2,
                name: 'name',
                password: 'password',
                key: null,
            }, {
                id: 3,
                name: 'name',
                password: 'password',
                key: null,
            }]);
        });

        it('有表,take,skip条件', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'name\',\'password\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'2\',\'name\',\'password\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'3\',\'name\',\'password\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'4\',\'name\',\'password\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).skip(1).take(2).toArray();
            for (let i = 0; i < 2; i++) {
                assert.deepEqual(result[i], {
                    id: i + 2,
                    name: 'name',
                    password: 'password',
                    key: null,
                });
            }
        });

        it('有表,where,take,skip条件', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'name1\',\'password1\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'2\',\'name2\',\'password2\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'3\',\'name3\',\'password3\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'4\',\'name4\',\'password4\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).where('id > ?', 1).skip(1).take(1).toArray();
            assert.deepEqual(result, [{
                id: 3,
                name: `name3`,
                password: `password3`,
                key: null,
            }]);
        });

        it('有表,order', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'1\',\'name\',\'password\',\'key4\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'2\',\'name\',\'password\',\'key3\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'3\',\'name\',\'password\',\'key2\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'4\',\'name\',\'password\',\'key1\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).order('key').toArray();
            for (let i = 0; i < 4; i++) {
                assert.deepEqual(result[i], {
                    id: 4 - i,
                    name: 'name',
                    password: 'password',
                    key: 'key' + (i + 1),
                });
            }
        });

        it('有表,orderByDesc', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'1\',\'name\',\'password\',\'key4\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'2\',\'name\',\'password\',\'key3\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'3\',\'name\',\'password\',\'key2\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'4\',\'name\',\'password\',\'key1\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).orderByDesc('key').toArray();
            for (let i = 0; i < 4; i++) {
                assert.deepEqual(result[i], {
                    id: i + 1,
                    name: 'name',
                    password: 'password',
                    key: 'key' + (4 - i),
                });
            }
        });

        it('有表,order,where', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'1\',\'name\',\'password\',\'key4\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'2\',\'name\',\'password\',\'key3\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'3\',\'name\',\'password\',\'key2\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'4\',\'name\',\'password\',\'key1\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).order('key').where('id > ?', 1).toArray();
            for (let i = 0; i < 3; i++) {
                assert.deepEqual(result[i], {
                    id: 4 - i,
                    name: 'name',
                    password: 'password',
                    key: 'key' + (i + 1),
                });
            }
        });

        it('有表,order有两个字段', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'1\',\'name1\',\'password1\',\'key3\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'2\',\'name2\',\'password2\',\'key3\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'3\',\'name3\',\'password3\',\'key3\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'4\',\'name4\',\'password4\',\'key1\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).order('key', "id").toArray();
            assert.deepEqual(result, [{
                id: 4,
                name: `name4`,
                password: `password4`,
                key: 'key1',
            }, {
                id: 1,
                name: `name1`,
                password: `password1`,
                key: 'key3',
            }, {
                id: 2,
                name: `name2`,
                password: `password2`,
                key: 'key3',
            }, {
                id: 3,
                name: `name3`,
                password: `password3`,
                key: 'key3',
            }]);
        });

        it('有表,order和orderByDesc同时存在', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'1\',\'name1\',\'password1\',\'key2\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'2\',\'name2\',\'password2\',\'key3\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'3\',\'name3\',\'password3\',\'key3\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password,`key`) VALUES (\'4\',\'name4\',\'password4\',\'key1\')'
            }]);
            let result = await new Query(conn, 'testTable', sqlMaker).order('key').orderByDesc('id').toArray();
            assert.deepEqual(result, [{
                id: 4,
                name: `name4`,
                password: `password4`,
                key: 'key1',
            }, {
                id: 1,
                name: `name1`,
                password: `password1`,
                key: 'key2',
            }, {
                id: 3,
                name: `name3`,
                password: `password3`,
                key: 'key3',
            }, {
                id: 2,
                name: `name2`,
                password: `password2`,
                key: 'key3',
            }]);
        });
    });
});