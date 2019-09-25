class Validator {
    constructor(arg) {
        this.min = arg.min || 0;
        this.max = arg.max || 0;
    }

    valid(v) {
        return this.min <= v && v < this.max;
    }
}

module.exports = Validator;