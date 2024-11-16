import { Difficulty } from "../difficulty/difficulty";
import { Level } from "./level/level";
import { Notes } from "./notes/notes";
import { Constant } from "./constant/constant";
import { ValueObject } from "../../shared/valueObject";

type DifficultyDataValue = {
    difficulty: Difficulty;
    level: Level;
    notes: Notes;
    constant: Constant;
};
export class DifficultyData extends ValueObject<DifficultyDataValue, "DifficultyData"> {
    constructor(value: DifficultyDataValue) {
        super(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected validate(value: DifficultyDataValue): void {}

    equals(other: DifficultyData): boolean {
        return (
            this.difficulty.equals(other.difficulty) &&
            this.level.equals(other.level) &&
            this.notes.equals(other.notes) &&
            this.constant.equals(other.constant)
        );
    }

    get difficulty(): DifficultyDataValue["difficulty"] {
        return this.value.difficulty;
    }

    get level(): DifficultyDataValue["level"] {
        return this.value.level;
    }

    get notes(): DifficultyDataValue["notes"] {
        return this.value.notes;
    }

    get constant(): DifficultyDataValue["constant"] {
        return this.value.constant;
    }
}
