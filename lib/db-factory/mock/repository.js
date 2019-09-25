const Query = require('./query');

class Repository {
    constructor(table, uow, isTx, mockCache) {
        this.isTx = isTx;
        this.table = table;
        this.uow = uow;
        this.mockCache = mockCache;
    }

    add(entity) {
        this.uow.registerAdd(this.table, entity);
        if (this.isTx)
            return;
        this.uow.commit();
    }

    query() {
        return new Query(this.table, this.mockCache);
    }

    remove(entity) {
        this.uow.registerRemove(this.table, entity);
        if (this.isTx)
            return;
        this.uow.commit();
    }

    save(entity) {
        this.uow.registerSave(this.table, entity);
        if (this.isTx)
            return;
        this.uow.commit();
    }
};

module.exports = Repository;