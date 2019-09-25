const dbFactory = require('../lib/db-factory');
const dbEnumFactory = require('../lib/enum/db');
const fileEnumFactory = require('../lib/enum/file');
const Exception = require('../lib/os/exception');
const errCode = require('../model/enum/err-code');

exports.add = {
    arg: {
        name: ['strlen', {
            min: 3,
            max: 50
        }],
        key: ['strlen', {
            min: 1,
            max: 20
        }],
        value: '正整数',
        text: ['strlen', {
            min: 1,
            max: 45
        }],
        attrs: null,
    },
    fn: async arg => {
        let manager = dbEnumFactory(arg.name);
        let keyExist = await manager.has(arg.key);
        let valueExist = await manager.has(arg.value);
        if (keyExist || valueExist)
            throw new Exception(errCode.tip.value, '枚举已存在');

        let uow = dbFactory.uow();
        await manager.add(uow, {
            key: arg.key,
            value: arg.value,
            text: arg.text,
            attrs: arg.attrs,
        });
        await uow.commit();
    }
};

exports.find = {
    arg: {
        name: null,
        names: null
    },
    fn: async arg => {
        if (arg.name)
            arg.names = [arg.name];
        if (!arg.names)
            return {};

        let result = {};
        for (let name of arg.names) {
            let ds = await fileEnumFactory(name).all();
            if (!ds.length)
                ds = await dbEnumFactory(name).all();
            if (ds.length > 0)
                result[name] = ds;
        }

        return result;
    }
};

exports.remove = {
    arg: {
        name: ['strlen', {
            min: 3,
            max: 50
        }],
        value: null
    },
    fn: async arg => {
        let uow = dbFactory.uow();
        let manager = dbEnumFactory(arg.name);
        if (arg.value) {
            await manager.remove(uow, arg.value);
        } else {
            let entities = await manager.all();
            for (let item of entities)
                await manager.remove(uow, item.value);
        }
        await uow.commit();
    }
};