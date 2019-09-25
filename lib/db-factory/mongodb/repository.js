const Query = require('./query');

class Repository {
    constructor(connPool, table, uow, isTx) {
        this.connPool = connPool;
        this.isTx = isTx;
        this.table = table;
        this.uow = uow;
    }

    async add(entity) {
        this.uow.registerAdd(this.table, entity);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    query() {
        return new Query(this.connPool, this.table);
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