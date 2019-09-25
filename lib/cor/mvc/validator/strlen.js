class Validator {
    constructor(arg) {
        this.min = arg.min || 0;
        this.max = arg.max || 0;
    }

    valid(v) {
        let len = v ? v.length : 0;
        if (this.min <= 0 && !len)
            return true

        let max = this.max;
        if (max <= 0)
            max = len + 1;

        return this.min <= len && len < max;
    }
}

module.exports = Validator;