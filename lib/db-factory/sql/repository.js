const Query = require('./query');

class Repository {
    constructor(conn, table, uow, isTx, sqlMaker) {
        this.conn = conn;
        this.table = table;
        this.uow = uow;
        this.isTx = isTx;
        this.sqlMaker = sqlMaker;
    }

    async add(entity) {
        this.uow.registerAdd(this.table, entity);
        if (this.isTx)
            return;
        await this.uow.commit();
    }

    query() {
        return new Query(this.conn, this.table, this.sqlMaker);
    }

    async remove(entity) {
        this.uow.registerRemove(this.table, entity);
        if (this.isTx)
            return;
        await this.uow.commit();
    }

    async save(entity) {
        this.uow.registerSave(this.table, entity);
        if (this.isTx)
            return;
        await this.uow.commit();
    }
}

module.exports = Repository;