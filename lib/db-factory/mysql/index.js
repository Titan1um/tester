const Conn = require('./conn');
const BaseFactory = require('../base/factory');
const Repository = require('../sql/repository');
const Maker = require('../sql/sql-maker');
const Uow = require('../sql/uow');

class Factory extends BaseFactory {
    constructor(cfg) {
        let conn = new Conn(cfg);
        let sqlMaker = new Maker(0, Number.MAX_SAFE_INTEGER);
        super(
            (table, uow, isTx) => {
                return new Repository(conn, table, uow, isTx, sqlMaker);
            },
            () => {
                return new Uow(conn, sqlMaker);
            }
        );

        this.conn = conn;
    }

    close() {
        return new Promise(s => {
            this.conn.pool.end(() => {
                s();
            });
        });
    }
}

module.exports = Factory;