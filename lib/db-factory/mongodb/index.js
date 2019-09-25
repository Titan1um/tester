const ConnPool = require('./conn-pool');
const Repository = require('./repository');
const Uow = require('./uow');
const BaseFactory = require('../base/factory');

class Factory extends BaseFactory {
    constructor(cfg) {
        let connPool = new ConnPool(cfg.url, cfg.dbName);
        super((table, uow, isTx) => {
            return new Repository(connPool, table, uow, isTx);
        }, () => {
            return new Uow(connPool);
        });
        this.connPool = connPool;
    }

    async close() {
        await this.connPool.client.close();
    }
}

module.exports = Factory;