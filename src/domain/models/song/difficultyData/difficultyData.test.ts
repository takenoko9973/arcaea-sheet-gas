import { Difficulty, DifficultyEnum } from "../difficulty/difficulty";
import { Constant } from "./constant/constant";
import { DifficultyData } from "./difficultyData";
import { Level } from "./level/level";
import { SongNotes } from "./notes/songNotes";

describe("SongId", () => {
    it("正しい値とバージョン表記を返すSongIdを作る", () => {
        const difficultyData = new DifficultyData({
            difficulty: new Difficulty(DifficultyEnum.FUTURE),
            level: new Level("10"),
            notes: new SongNotes(1000),
            constant: new Constant(10.3),
        });
        expect(difficultyData.difficulty.value).toBe(DifficultyEnum.FUTURE);
        expect(difficultyData.level.value).toBe("10");
        expect(difficultyData.notes.value).toBe(1000);
        expect(difficultyData.constant.value).toBe(10.3);
    });

    it("equals", () => {
        const difficultyData1 = new DifficultyData({
            difficulty: new Difficulty(DifficultyEnum.FUTURE),
            level: new Level("10"),
            notes: new SongNotes(1000),
            constant: new Constant(10.3),
        });
        const difficultyData2 = new DifficultyData({
            difficulty: new Difficulty(DifficultyEnum.FUTURE),
            level: new Level("10"),
            notes: new SongNotes(1000),
            constant: new Constant(10.3),
        });
        // 難易度違い
        const difficultyData3 = new DifficultyData({
            difficulty: new Difficulty(DifficultyEnum.BEYOND),
            level: new Level("10"),
            notes: new SongNotes(1000),
            constant: new Constant(10.3),
        });
        // レベル違い
        const difficultyData4 = new DifficultyData({
            difficulty: new Difficulty(DifficultyEnum.FUTURE),
            level: new Level("11"),
            notes: new SongNotes(1000),
            constant: new Constant(10.3),
        });
        // ノーツ数違い
        const difficultyData5 = new DifficultyData({
            difficulty: new Difficulty(DifficultyEnum.FUTURE),
            level: new Level("10"),
            notes: new SongNotes(2000),
            constant: new Constant(10.3),
        });
        // 譜面定数違い
        const difficultyData6 = new DifficultyData({
            difficulty: new Difficulty(DifficultyEnum.FUTURE),
            level: new Level("10"),
            notes: new SongNotes(1000),
            constant: new Constant(10.6),
        });

        expect(difficultyData1.equals(difficultyData2)).toBeTruthy();
        expect(difficultyData1.equals(difficultyData3)).toBeFalsy();
        expect(difficultyData1.equals(difficultyData4)).toBeFalsy();
        expect(difficultyData1.equals(difficultyData5)).toBeFalsy();
        expect(difficultyData1.equals(difficultyData6)).toBeFalsy();
    });
});
