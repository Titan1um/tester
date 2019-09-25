class Query {
    constructor(conn, table, sqlMaker) {
        this.conn = conn;
        this.table = table;
        this.sqlMaker = sqlMaker;
    }

    async count() {
        let result = await this.conn.exec([{
            sql: this.sqlMaker.makeCount(this),
            args: this.whereArgValues
        }]);
        return result[0]['COUNT (id)'];
    }

    order(...fields) {
        return sort(this, 'asc', ...fields);
    }

    orderByDesc(...fields) {
        return sort(this, 'desc', ...fields);
    }

    skip(skip) {
        this.skipValue = skip;
        return this;
    }


    take(take) {
        this.takeValue = take;
        return this;
    }

    async toArray() {
        return await this.conn.exec([{
            sql: this.sqlMaker.makeSelect(this),
            args: this.whereArgValues
        }]);
    }

    where(sql, ...args) {
        this.whereValue = sql;
        this.whereArgValues = args;
        return this;
    }
}

function sort(self, sortKey, ...fields) {
    if (!self.orderValues)
        self.orderValues = [];
    fields.forEach(r => {
        self.orderValues.push({
            field: r,
            sortKey: sortKey
        });
    });
    return self;
}

module.exports = Query;