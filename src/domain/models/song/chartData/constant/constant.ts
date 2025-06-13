import { ValueObject } from "../../../shared/valueObject";

type ConstantValue = number;
export class Constant extends ValueObject<ConstantValue, "Constant"> {
    constructor(value: ConstantValue) {
        super(value);
    }

    protected validate(value: ConstantValue): void {
        if (value < 0) {
            throw new Error("定数は0以上の数値です。");
        }
    }

    equals(other: ValueObject<ConstantValue, "Constant">): boolean {
        return this.value === other.value;
    }
}
