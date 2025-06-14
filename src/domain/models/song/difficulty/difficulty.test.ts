import { Difficulty } from "./difficulty";
import { DifficultyEnum,DifficultyName } from "./difficultyName/difficultyName";
import { Level } from "./level/level";

describe("Difficulty", () => {
    it("正しい値とバージョン表記を返すDifficultyを作る", () => {
        const difficulty = new Difficulty({
            difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
            level: new Level("10"),
        });
        expect(difficulty.difficultyName.value).toBe(DifficultyEnum.FUTURE);
        expect(difficulty.level.value).toBe("10");
    });

    it("equals", () => {
        const difficulty1 = new Difficulty({
            difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
            level: new Level("10"),
        });
        const difficulty2 = new Difficulty({
            difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
            level: new Level("10"),
        });
        const difficulty3 = new Difficulty({
            difficultyName: new DifficultyName(DifficultyEnum.BEYOND),
            level: new Level("10"),
        });
        const difficulty4 = new Difficulty({
            difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
            level: new Level("9+"),
        });
        expect(difficulty1.equals(difficulty2)).toBeTruthy();
        expect(difficulty1.equals(difficulty3)).toBeFalsy();
        expect(difficulty1.equals(difficulty4)).toBeFalsy();
    });
});
