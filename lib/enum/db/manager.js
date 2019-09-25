const fs = require('fs');
const path = require('path');
const $ = require('underscore');

const Item = require('./item');
const time = require('../../time');
const dbFactory = require('../../db-factory');
const CacheState = require('../../dp/cache-state');

const ENUM_ATTR_NAME = 'enum-attr';
const ENUM_NAME = 'enum';
const ENUM_PATH = path.join(__dirname, '..', '..', '..', 'model', 'global', 'enum.js');

class Manager extends CacheState {
    constructor(name, mockFunc) {
        super(ENUM_NAME, name);

        this.name = name;
        this.existsFunc = mockFunc || fs.existsSync;
    }

    async add(uow, entry) {
        if (isDisabled(this))
            return;

        let keyExist = await this.has(entry.key);
        let valueExist = await this.has(entry.value);
        if (keyExist || valueExist)
            return;

        let item = new Item(this);
        await item.add(uow, entry);
        this.items.push(item);

        await this.updateState();
    }

    async all() {
        if (isDisabled(this))
            return [];

        let items = await findItems(this);
        return $.map(items, r => {
            return r.getEntry();
        });
    }

    async has(pair) {
        if (isDisabled(this))
            return;

        let index = await getItemIndex(this, pair);
        return index >= 0;
    }

    async get(pair) {
        if (isDisabled(this))
            return;

        let index = await getItemIndex(this, pair);
        if (index == -1)
            return;

        let items = await findItems(this);
        return items[index].getEntry();
    }

    async remove(uow, pair) {
        if (isDisabled(this))
            return;

        let index = await getItemIndex(this, pair);
        if (index == -1)
            return;

        let item = this.items[index];
        await item.remove(uow);
        this.items.splice(index, 1);

        await this.updateState();
    }
}

async function findItems(self) {
    if (self.items) {
        let isChanged = await self.isChanged();
        if (!isChanged)
            return self.items;
    }

    let enumRows = await dbFactory.db(ENUM_NAME).query().where('name = ?', self.name).toArray();
    let attrRows = await dbFactory.db(ENUM_ATTR_NAME).query().where('enumName = ?', self.name).toArray();
    attrRows = $.groupBy(attrRows, 'enumValue');
    self.items = $.map(enumRows, r => {
        return new Item(self, {
            ...r,
            attrs: attrRows[r.value] || []
        });
    });
    self.modifiedOn = await time.unix();

    return self.items;
}

async function getItemIndex(self, pair) {
    let items = await findItems(self);
    return $.findIndex(items, item => {
        return item.equal(pair);
    });
}

function isDisabled(self) {
    if (self.isDisabled == null)
        self.isDisabled = !self.existsFunc(ENUM_PATH);

    return self.isDisabled;
}

module.exports = Manager;