import { ValueObject } from "../../shared/valueObject";

type ScoreValue = number;
export class Score extends ValueObject<ScoreValue, "Score"> {
    static readonly MIN = 0;
    static readonly MAX = 10000000 + 10000; // 余裕を持って、PM + 10000ノーツ分取る

    constructor(value: ScoreValue) {
        super(value);
    }

    protected validate(value: ScoreValue): void {
        if (value < Score.MIN || value > Score.MAX) {
            throw new Error(`スコアは${Score.MIN}から${Score.MAX}の間でなければなりません。`);
        }
    }

    equals(others: Score): boolean {
        return this.value === others.value;
    }
}
