class SqlMaker {
    constructor(defaultSkipValue, defaultTakeValue) {
        this.defaultSkipValue = defaultSkipValue;
        this.defaultTakeValue = defaultTakeValue;
    }

    makeAdd(table, entity) {
        let sqlBuffer = ['INSERT INTO `', table, '` ('];
        let args = [];
        for (let item in entity) {
            sqlBuffer.push('`', item, '`,');
            args.push(entity[item]);
        }
        sqlBuffer.pop();
        sqlBuffer.push('`) VALUES (');
        for (let item in entity) {
            sqlBuffer.push('?', ',');
        }
        sqlBuffer.pop();
        sqlBuffer.push(')');
        return {
            sql: sqlBuffer.join(''),
            args: args
        };
    }

    makeCount(query) {
        let sqlBuffer = ['SELECT COUNT (id) FROM `', query.table, '`'];
        if (query.whereValue)
            sqlBuffer.push(' WHERE ', query.whereValue);
        return sqlBuffer.join('');
    }

    makeRemove(table, entity) {
        let sqlBuffer = ['DELETE FROM `', table, '` WHERE id = ?'];
        return {
            sql: sqlBuffer.join(''),
            args: entity.id
        };
    }

    makeSave(table, entity) {
        let sqlBuffer = ['UPDATE `', table, '` SET '];
        let args = [];
        for (let item in entity) {
            sqlBuffer.push('`', item, '` = ?', ' , ');
            args.push(entity[item]);
        }
        args.push(entity.id);
        sqlBuffer.pop();
        sqlBuffer.push(' WHERE id = ?');
        return {
            sql: sqlBuffer.join(''),
            args: args
        };
    }

    makeSelect(query) {
        let sqlBuffer = ['SELECT * FROM `', query.table, '`'];
        if (query.whereValue)
            sqlBuffer.push(' WHERE ', query.whereValue);
        if (query.orderValues) {
            sqlBuffer.push(' ORDER BY ');
            for (let item of query.orderValues) {
                sqlBuffer.push('`', item.field, '` ', item.sortKey, ',')
            }
            // 去除最后一个','
            sqlBuffer.pop();
        }
        if (query.takeValue || query.skipValue) {
            if (!query.takeValue)
                query.takeValue = this.defaultTakeValue;
            if (!query.skipValue)
                query.skipValue = this.defaultSkipValue;
            sqlBuffer.push(' LIMIT ', query.skipValue, ' , ', query.takeValue);
        }
        return sqlBuffer.join('');
    }
}

module.exports = SqlMaker;