import { SongId } from "./songId";
import { SongTitle } from "./songTitle/songTitle";
import { Difficulty, DifficultyEnum } from "../difficulty/difficulty";

describe("SongId", () => {
    it("正しい値とバージョン表記を返すSongIdを作る", () => {
        const songId = new SongId({
            songTitle: new SongTitle("hoge"),
            difficulty: new Difficulty(DifficultyEnum.FUTURE),
        });
        expect(songId.id).toBe(`hoge_FTR`);
    });

    it("equals", () => {
        const songId1 = new SongId({
            songTitle: new SongTitle("hoge"),
            difficulty: new Difficulty(DifficultyEnum.FUTURE),
        });
        const songId2 = new SongId({
            songTitle: new SongTitle("hoge"),
            difficulty: new Difficulty(DifficultyEnum.FUTURE),
        });
        // 名前違い
        const songId3 = new SongId({
            songTitle: new SongTitle("foo"),
            difficulty: new Difficulty(DifficultyEnum.FUTURE),
        });
        // 難易度違い
        const songId4 = new SongId({
            songTitle: new SongTitle("hoge"),
            difficulty: new Difficulty(DifficultyEnum.BEYOND),
        });

        expect(songId1.equals(songId2)).toBeTruthy();
        expect(songId1.equals(songId3)).toBeFalsy();
        expect(songId1.equals(songId4)).toBeFalsy();
    });

    describe("fromString", () => {
        it("正しい文字列", () => {
            expect(SongId.fromString("hoge_FTR").id).toBe("hoge_FTR");

            const version = SongId.fromString("foo_BYD");
            expect(version.id).toBe("foo_BYD");
        });

        it("不正な文字列", () => {
            expect(() => SongId.fromString("foo")).toThrow("SongIdの入力が不正です");
            expect(() => SongId.fromString("foo_ABC")).toThrow("無効な難易度です。");
        });
    });
});
