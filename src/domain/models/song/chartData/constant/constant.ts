import { ValueObject } from "@/domain/models/shared/valueObject";

type ConstantValue = number;
export class Constant extends ValueObject<ConstantValue, "Constant"> {
    constructor(value: ConstantValue) {
        super(value);
    }

    protected validate(value: ConstantValue): void {
        if (value < 0) {
            throw new Error(`定数は0以上の数値である必要があります (${value})`);
        }
    }

    equals(other: ValueObject<ConstantValue, "Constant">): boolean {
        return this.value === other.value;
    }
}
