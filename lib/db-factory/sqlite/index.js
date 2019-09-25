const Conn = require('./conn');
const BaseFactory = require('../base/factory');
const Repository = require('../sql/repository');
const SqlMaker = require('../sql/sql-maker');
const Uow = require('../sql/uow');

class Factory extends BaseFactory {
    constructor(cfg) {
        let conn = new Conn(cfg);
        let sqlMaker = new SqlMaker(-1, -1);
        super((table, uow, isTx) => {
            return new Repository(conn, table, uow, isTx, sqlMaker);
        }, () => {
            return new Uow(conn, sqlMaker);
        });

        this.conn = conn;
    }

    close() {
        return new Promise(s => {
            this.conn.db.close(() => {
                s();
            });
        });
    }
}

module.exports = Factory;