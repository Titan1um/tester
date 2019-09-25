const $ = require('underscore');

const dbFactory = require('../../db-factory');
const str = require('../../str');

class Item {
    constructor(manager, entry) {
        this.manager = manager;

        if (entry)
            setEntry(this, entry);
    }

    async add(uow, entry) {
        let entity = {
            id: str.randID(),
            name: this.manager.name,
            key: entry.key,
            value: entry.value,
            text: entry.text,
        };
        await dbFactory.db('enum', uow).add(entity);

        let enumAttrDb = dbFactory.db('enum-attr', uow);
        entity.attrs = $.chain(entry.attrs).filter(attr => {
            return attr.key && attr.value
        }).map(attr => {
            return {
                id: str.randID(),
                enumName: entity.name,
                enumValue: entity.value,
                key: attr.key,
                value: attr.value,
            };
        }).value();
        for (let attr of entity.attrs)
            await enumAttrDb.add(attr);

        setEntry(this, entity);
    }

    equal(pair) {
        if ($.isString(pair))
            pair = pair.toLowerCase();

        return this.lowercaseKey == pair || this.entry.value == pair || this.lowercaseText == pair;
    }

    getEntry() {
        return {
            key: this.entry.key,
            value: this.entry.value,
            text: this.entry.text,
            attr: $.chain(this.entry.attrs).map(r => {
                return [r.key, r.value]
            }).object().value()
        }
    }

    async remove(uow) {
        await dbFactory.db('enum', uow).remove({
            id: this.entry.id
        });
        let attrDb = dbFactory.db('enum-attr', uow);
        for (let attr of this.entry.attrs || [])
            await attrDb.remove(attr);
    }
}

function setEntry(self, entry) {
    self.entry = entry;
    self.lowercaseKey = entry.key.toLowerCase();
    self.lowercaseText = entry.text.toLowerCase();
}

module.exports = Item;