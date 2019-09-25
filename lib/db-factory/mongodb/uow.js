class UnitOfWork {
    constructor(connPool) {
        this.connPool = connPool;
        this.queue = [];
    }

    async commit() {
        if (this.queue.length == 0)
            return;

        let conn = await this.connPool.getConn();

        let tableOfConn = {};
        for (let item of this.queue) {
            let db = tableOfConn[item.table];
            if (!db) {
                db = tableOfConn[item.table] = conn.collection(item.table);
            } 

            await item.fn(db);
        }
        this.queue = [];
    }

    registerAdd(table, entity) {
        this.queue.push({
            table,
            fn: async db => {
                await db.insertOne(entity);
            }
        });
    }

    registerRemove(table, entity) {
        this.queue.push({
            table,
            fn: async db => {
                await db.deleteOne({
                    id: entity.id
                });
            }
        });
    }

    registerSave(table, entity) {
        this.queue.push({
            table,
            fn: async db => {
                await db.updateOne({
                    id: entity.id
                }, {
                    $set: entity
                });
            }
        });
    }
}

module.exports = UnitOfWork;