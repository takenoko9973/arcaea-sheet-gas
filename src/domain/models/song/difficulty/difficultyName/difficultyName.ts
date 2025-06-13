import { ValueObject } from "../../../shared/valueObject";

export enum DifficultyEnum {
    PAST = "PST",
    PRESENT = "PRS",
    FUTURE = "FTR",
    BEYOND = "BYD",
    ETERNAL = "ETR",
}

type DifficultyNameValue = DifficultyEnum;
export class DifficultyName extends ValueObject<DifficultyNameValue, "DifficultyName"> {
    constructor(value: DifficultyNameValue) {
        super(value);
    }

    protected validate(value: DifficultyNameValue): void {
        if (!Object.values(DifficultyEnum).includes(value)) {
            throw new Error("無効な難易度です。");
        }
    }

    equals(other: DifficultyName): boolean {
        return this.value === other.value;
    }
}
