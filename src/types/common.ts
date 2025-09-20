class MexcError extends Error {
    private readonly _code: number;
    private readonly _extend: any;
    constructor(params: {
        message: string;
        code: number;
        _extend?: any;
    }) {
        super(params.message);
        this._code = params.code;
        this._extend = params._extend;
    }

    get code(){
        return this._code;
    }

    toString(){
        return `Mexc Error ${this._code} - ${this.message} (${JSON.stringify(this._extend)})`
    }
}
