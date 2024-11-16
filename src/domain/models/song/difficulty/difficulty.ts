import { ValueObject } from "../../shared/valueObject";

export enum DifficultyEnum {
    PAST = "PST",
    PRESENT = "PRS",
    FUTURE = "FTR",
    BEYOND = "BYD",
    ETERNAL = "ETR",
}

type DifficultyValue = DifficultyEnum;
export class Difficulty extends ValueObject<DifficultyValue, "Difficulty"> {
    constructor(value: DifficultyValue) {
        super(value);
    }

    protected validate(value: DifficultyValue): void {
        if (!Object.values(DifficultyEnum).includes(value)) {
            throw new Error("無効な難易度です。");
        }
    }

    equals(other: Difficulty): boolean {
        return this.value === other.value;
    }
}
