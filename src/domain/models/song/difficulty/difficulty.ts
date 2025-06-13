import { ValueObject } from "../../shared/valueObject";
import { DifficultyName } from "./difficultyName/difficultyName";
import { Level } from "./level/level";

type DifficultyValue = {
    difficultyName: DifficultyName;
    level: Level;
};
export class Difficulty extends ValueObject<DifficultyValue, "Difficulty"> {
    constructor(value: DifficultyValue) {
        super(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected validate(value: DifficultyValue): void {}

    equals(other: Difficulty): boolean {
        return this.difficultyName.equals(other.difficultyName) && this.level.equals(other.level);
    }

    get difficultyName(): DifficultyValue["difficultyName"] {
        return this.value.difficultyName;
    }

    get level(): DifficultyValue["level"] {
        return this.value.level;
    }
}
