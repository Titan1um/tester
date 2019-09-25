const $ = require('underscore');

class UnitOfWork {
    constructor(mockCache, idAssert) {
        this.idAssert = idAssert || function (newItem, oldItem) {
            return newItem.id == oldItem.id;
        };
        this.queue = [];
        this.tableGroup = mockCache;
    }

    commit() {
        if (this.queue.length) {
            $.each(this.queue, uowItem => {
                this.tableGroup[uowItem.table] = this.tableGroup[uowItem.table] || {
                    data: []
                }

                let index = $.findIndex(this.tableGroup[uowItem.table].data, item => {
                    return this.idAssert(uowItem.entity, item);
                });
                uowItem.op(index);
            });
        }
        this.queue = [];
    }

    registerAdd(table, entity) {
        this.queue.push({
            table: table,
            entity: entity,
            op: index => {
                if (index == -1) {
                    this.tableGroup[table].data.push(entity);
                } else {
                    throw new Error(`table:${table}, id已经存在`);
                }
            }
        });
    }

    registerRemove(table, entity) {
        this.queue.push({
            table: table,
            entity: entity,
            op: index => {
                if (index != -1)
                    this.tableGroup[table].data.splice(index, 1);
            }
        });
    }

    registerSave(table, entity) {
        this.queue.push({
            table: table,
            entity: entity,
            op: index => {
                if (index != -1)
                    this.tableGroup[table].data[index] = entity;
            }
        });
    }
}

module.exports = UnitOfWork;