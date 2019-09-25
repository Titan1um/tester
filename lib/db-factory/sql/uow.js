class Uow {
    constructor(conn, sqlMaker) {
        this.conn = conn;
        this.sqlMaker = sqlMaker;
    }

    registerAdd(table, entity) {
        if (!this.queue)
            this.queue = [];
        this.queue.push(this.sqlMaker.makeAdd(table, entity));
    }

    async commit() {
        await this.conn.exec(this.queue);
        this.queue = [];
    }

    registerRemove(table, entity) {
        if (!this.queue)
            this.queue = [];
        this.queue.push(this.sqlMaker.makeRemove(table, entity));
    }

    registerSave(table, entity) {
        if (!this.queue)
            this.queue = [];
        this.queue.push(this.sqlMaker.makeSave(table, entity));
    }
}

module.exports = Uow;