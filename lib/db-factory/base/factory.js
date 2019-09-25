class Factory {
    constructor(buildRepository, buildUow) {
        this.buildRepository = buildRepository;
        this.buildUow = buildUow;
    }

    db(table, uow) {
        let isTx = true;
        if (!uow) {
            uow = this.uow();
            isTx = false;
        }
        return this.buildRepository(table, uow, isTx);
    }

    uow() {
        return this.buildUow();
    }
}

module.exports = Factory;