export abstract class ValueObject<T, U> {
    // 型で区別するために利用 (Structural Typingの影響を回避する)
    // 参考 : https://qiita.com/suin/items/57cfc0ec9bb1a6995aa5
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

    abstract equals(other: ValueObject<T, U>): boolean;
}
