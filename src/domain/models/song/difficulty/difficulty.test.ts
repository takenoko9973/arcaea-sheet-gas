import { Difficulty, DifficultyEnum } from "./difficulty";

describe("Difficulty", () => {
    it("正しい値とバージョン表記を返すDifficultyを作る", () => {
        expect(new Difficulty(DifficultyEnum.FUTURE).value).toBe(DifficultyEnum.FUTURE);
    });

    it("equals", () => {
        const difficulty1 = new Difficulty(DifficultyEnum.FUTURE);
        const difficulty2 = new Difficulty(DifficultyEnum.FUTURE);
        const difficulty3 = new Difficulty(DifficultyEnum.BEYOND);
        expect(difficulty1.equals(difficulty2)).toBeTruthy();
        expect(difficulty1.equals(difficulty3)).toBeFalsy();
    });

    it("不正な難易度名で、エラーを投げる", () => {
        expect(() => {
            const difficulty = "ARC" as DifficultyEnum;
            new Difficulty(difficulty);
        }).toThrow("無効な難易度です。");
    });
});
