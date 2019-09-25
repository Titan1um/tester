class Handler {
    async handle(ctx) {
        try {
            await this.handleFunc(ctx);
        } catch (error) {
            ctx.err = error;
        } finally {
            if (this.next) 
                await this.next.handle(ctx);
        }
    }
    
    setNext(next) {
        return (this.next = next);
    }

    validContext(ctx, ...fields) {
        for (let field of fields) {
            if (!ctx[field])
                throw new Error(`${this.constructor.name}.${field}`);
        }
    }
}

module.exports = Handler;