import { ValueObject } from "@/domain/models/shared/valueObject";

export enum DifficultyEnum {
    PAST = "PST",
    PRESENT = "PRS",
    FUTURE = "FTR",
    BEYOND = "BYD",
    ETERNAL = "ETR",
}

// DifficultyEnumとして妥当な値かを判定する
export function isDifficultyEnum(value: unknown): value is DifficultyEnum {
    return typeof value === "string" && Object.values(DifficultyEnum).includes(value as DifficultyEnum);
}

type DifficultyNameValue = DifficultyEnum;
export class DifficultyName extends ValueObject<DifficultyNameValue, "DifficultyName"> {
    constructor(value: DifficultyNameValue) {
        super(value);
    }

    protected validate(value: DifficultyNameValue): void {
        if (!Object.values(DifficultyEnum).includes(value)) {
            throw new Error(`無効な難易度です (${value})`);
        }
    }

    equals(other: DifficultyName): boolean {
        return this.value === other.value;
    }
}
