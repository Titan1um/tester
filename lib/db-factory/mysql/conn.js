const mysql = require('mysql');
const util = require('util');

class Conn {
    constructor(cfg) {
        this.pool = mysql.createPool(cfg);
    }

    async exec(queue) {
        if (!(queue && queue.length))
            return;

        let conn = await util.promisify(this.pool.getConnection.bind(this.pool))();
        let queryAsync = util.promisify(conn.query.bind(conn));
        try {
            if (queue.length == 1) {
                return await queryAsync(queue[0].sql, queue[0].args);
            }

            conn.beginTransaction();
            for (let item of queue) {
                await queryAsync(item.sql, item.args);
            }
            await util.promisify(conn.commit.bind(conn))();
        } catch (error) {
            conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
};

module.exports = Conn;