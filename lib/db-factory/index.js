const Accessor = require('../dp/accessor');

let accessor = new Accessor();

exports.db = (table, uow) => {
    return accessor.get().db(table, uow);
};

exports.get = name => {
    return accessor.get(name);
};

exports.set = (name, instance) => {
    accessor.set(name, instance);
};

exports.uow = () => {
    return accessor.get().uow();
};