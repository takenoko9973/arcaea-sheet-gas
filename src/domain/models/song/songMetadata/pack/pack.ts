import { ValueObject } from "domain/models/shared/valueObject";

type PackValue = string;
export class Pack extends ValueObject<PackValue, "Pack"> {
    constructor(value: PackValue) {
        super(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected validate(value: string): void {}

    equals(other: Pack): boolean {
        return this.value === other.value;
    }
}
