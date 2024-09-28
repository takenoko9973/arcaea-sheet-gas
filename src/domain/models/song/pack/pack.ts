import { ValueObject } from "../../shared/valueObject";

type PackValue = string;
export class Pack extends ValueObject<PackValue, "Pack"> {
    constructor(value: PackValue) {
        super(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected validate(value: string): void {}

    equals(others: Pack): boolean {
        return this.value === others.value;
    }
}
