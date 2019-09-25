const $ = require('underscore');

class Query {
    constructor(table, mockCache) {
        this.chain = $.chain(mockCache[table] ? mockCache[table].data : []);
        this.mockCache = mockCache;
        this.table = table;
    }

    count() {
        return this.chain.value().length;
    }

    order(...fields) {
        return this.sort('asc', fields);
    }

    orderByDesc(...fields) {
        return this.sort('desc', fields);
    }

    skip(skip) {
        this.skipValue = skip;
        return this;
    }

    sort(sortKey, fields) {
        this.orderValues = this.orderValues || [];
        $.each(fields, r => {
            this.orderValues.push(`${r} ${sortKey}`);
        });
        return this;
    }

    take(take) {
        this.takeValue = take;
        return this;
    }

    toArray() {
        if (!this.mockCache[this.table] || !this.mockCache[this.table].data.length)
            return [];

        if (this.orderValues && this.orderValues.length) {
            this.chain.sort((next, current) => {
                for (let item of this.orderValues) {
                    let [value, order] = item.split(' ');
                    if (current[value] == next[value])
                        continue;

                    if ($.isString(current[value])) {
                        return order == 'asc' ? next[value].localeCompare(current[value]) : current[value].localeCompare(next[value]);
                    }
                    return order == 'asc' ? next[value] - current[value] : current[value] - next[value];
                }
            });
        }

        if (this.takeValue || this.skipValue) {
            if (!this.takeValue)
                return this.chain.slice(this.skipValue).map().value();

            if (!this.skipValue)
                return this.chain.take(this.takeValue).map().value();

            return this.chain.map().slice(this.skipValue).take(this.takeValue).value();
        }

        return this.chain.map().value();
    }

    where(...whereArgs) {
        this.chain = this.chain.filter(r => {
            return this.mockCache[this.table].whereFunc && this.mockCache[this.table].whereFunc(r, whereArgs);
        });
        return this;
    }
}

module.exports = Query;