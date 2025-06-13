import { ValueObject } from "../../shared/valueObject";

type PotentialValue = number;
export class Potential extends ValueObject<PotentialValue, "Potential"> {
    constructor(value: PotentialValue) {
        super(value);
    }

    protected validate(value: PotentialValue): void {
        if (value < 0) {
            throw new Error("定数は0以上の数値です。");
        }
    }

    equals(other: ValueObject<PotentialValue, "Potential">): boolean {
        return this.value === other.value;
    }
}
