let lockInstance;

exports.init = instance => {
    lockInstance = instance;
}

exports.lock = async (key, expires, action) => {
    let isLocked = await lockInstance.lock(key, expires);
    if (isLocked) {
        await action();
        await lockInstance.unlock(key);
    }
    return isLocked;
}