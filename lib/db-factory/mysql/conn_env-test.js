const assert = require('assert');
let mysql = require('mysql');

const Conn = require('./conn');

const DB_CONFIG = {
    host: '10.47.133.237',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'lite-db',
};

let conn = new Conn(DB_CONFIG);
let connection = mysql.createConnection(DB_CONFIG);
let entity = {
    id: 1,
    name: '2',
    password: '3',
};

describe('/lib/db-factory/mysql/conn.js', () => {
    before(async () => {
        await new Promise((resolve, reject) => {
            connection.query('CREATE TABLE conn_test(id int,name varchar(32),password varchar(32))', function (error, _, _) {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    });

    beforeEach(async () => {
        await new Promise((resolve, reject) => {
            connection.query('INSERT INTO conn_test(id, name, password) values (1,2,3)', function (error, _, _) {
                if (error)
                    reject(error);
                resolve();
            });
        });
    });

    after(async () => {
        await new Promise((resolve, reject) => {
            connection.query('DROP TABLE conn_test', function (error, _, _) {
                if (error)
                    reject(error);
                resolve();
            });
        });
        connection.end();
        conn.pool.end();
    });

    afterEach(async () => {
        await new Promise((resolve, reject) => {
            connection.query('DELETE FROM conn_test', function (error, _, _) {
                if (error)
                    reject(error);
                resolve();
            });
        });
    });

    describe('.exec', () => {
        it('语句错误', async () => {
            let err;
            try {
                await conn.exec([{
                    sql: 'SELECT_ * FROM conn_test'
                }]);
            } catch (error) {
                err = error;
            }
            assert.equal(err.code, 'ER_PARSE_ERROR');
        });

        it('SELECT', async () => {
            let res = await conn.exec([{
                sql: 'SELECT * FROM conn_test'
            }]);
            assert.deepEqual(res, [entity]);
        });

        it('SELECT 有参数 无数据', async () => {
            let res = await conn.exec([{
                sql: 'SELECT * FROM conn_test where id = ?',
                args: [0]
            }]);
            assert.deepEqual(res, []);
        });

        it('SELECT 有参数 有数据', async () => {
            let res = await conn.exec([{
                sql: 'SELECT * FROM conn_test where id = ?',
                args: [1]
            }]);
            assert.deepEqual(res, [entity]);
        });

        it('提交多条(事务)', async () => {
            await conn.exec([{
                sql: 'DELETE FROM conn_test',
            }, {
                sql: "INSERT INTO conn_test(id, name, password) values (?,?,?)",
                args: [4, '5', '6']
            }]);

            await new Promise((resolve, reject) => {
                connection.query('SELECT * FROM conn_test', function (error, results, fields) {
                    if (error)
                        reject(error);

                    assert.deepEqual(results, [{
                        id: 4,
                        name: '5',
                        password: '6'
                    }]);
                    resolve();
                });
            });
        });

        it('事务提交失败', async () => {
            let err;
            try {
                await conn.exec([{
                    sql: 'DELETE FROM conn_test where id = ?',
                    args: [1]
                }, {
                    sql: 'INSERT_ * FROM conn_test VALUES (4,5,6)',
                }]);
            } catch (error) {
                err = error;
            }
            assert.equal(err.code, 'ER_PARSE_ERROR');

            await new Promise((resolve, reject) => {
                connection.query('SELECT * FROM conn_test', function (error, results, fields) {
                    if (error)
                        reject(error);
                        
                    assert.deepEqual(results, [entity]);
                    resolve();
                });
            });
        });
    });
});