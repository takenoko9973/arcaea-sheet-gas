import { ValueObject } from "domain/models/shared/valueObject";

type LevelValue = string;
export class Level extends ValueObject<LevelValue, "SongTitle"> {
    constructor(value: LevelValue) {
        super(value);
    }

    protected validate(value: LevelValue): void {
        // 8 や 10+ にヒットする正規表現
        const levelPattern = /^\d{1,2}\+?$/;
        const isLevel = levelPattern.test(value);

        // エイプリルフール用
        const isUnknown = value === "?";

        if (
            !isLevel &&
            !isUnknown &&
            value !== "" // 削除曲用
        ) {
            throw new Error("無効なレベルです。");
        }
    }

    equals(other: Level): boolean {
        return this.value === other.value;
    }
}
