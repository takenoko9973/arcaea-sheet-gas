export abstract class ValueObject<T, U> {
    // 型で区別するために利用
    private _type!: U;
    protected readonly _value: T;

    constructor(value: T) {
        this.validate(value);
        this._value = value;
    }

    protected abstract validate(value: T): void;

    get value(): T {
        return this._value;
    }

    abstract equals(others: ValueObject<T, U>): boolean;
}
