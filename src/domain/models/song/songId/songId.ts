import { SongTitle } from "./songTitle/songTitle";
import { Difficulty, DifficultyEnum } from "../difficulty/difficulty";
import { ValueObject } from "../../shared/valueObject";

type SongIdValue = {
    songTitle: SongTitle;
    difficulty: Difficulty;
};
export class SongId extends ValueObject<SongIdValue, "SongId"> {
    constructor(value: SongIdValue) {
        super(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected validate(value: SongIdValue): void {}

    equals(others: SongId): boolean {
        return (
            this.value.songTitle.equals(others.value.songTitle) &&
            this.value.difficulty.equals(others.value.difficulty)
        );
    }

    static fromString(songIdString: string) {
        // タイトル_難易度(3文字) にヒット
        const titlePattern = /^(.+)_([A-Z]{3})$/;
        const match = songIdString.match(titlePattern);

        if (match === null) {
            throw new Error("SongIdの入力が不正です");
        }

        const songTitle = match.at(1);
        const difficulty = match.at(2);

        if (songTitle === undefined) {
            throw new Error("SongTitleが検出できません");
        }
        if (difficulty === undefined) {
            throw new Error("Difficultyが検出できません");
        }

        return new SongId({
            songTitle: new SongTitle(songTitle),
            difficulty: new Difficulty(difficulty as DifficultyEnum),
        });
    }

    get id(): string {
        return `${this.songTitle.value}_${this.difficulty.value}`;
    }

    private get songTitle(): SongTitle {
        return this.value.songTitle;
    }

    get difficulty(): Difficulty {
        return this.value.difficulty;
    }
}
