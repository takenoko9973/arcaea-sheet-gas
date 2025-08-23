import { ValueObject } from "@/domain/models/shared/valueObject";

type PotentialValue = number;
export class Potential extends ValueObject<PotentialValue, "Potential"> {
    constructor(value: PotentialValue) {
        super(value);
    }

    protected validate(value: PotentialValue): void {
        if (value < 0) {
            throw new Error(`ポテンシャルは0以上の数値である必要があります (${value})`);
        }
    }

    equals(other: ValueObject<PotentialValue, "Potential">): boolean {
        return this.value === other.value;
    }
}
