import { Level } from "./level";

describe("Level", () => {
    it("正しい値を返すLevelを作る", () => {
        expect(new Level("6").value).toBe("6");
        expect(new Level("9+").value).toBe("9+");
        expect(new Level("10+").value).toBe("10+");
    });

    it("equals", () => {
        const level1 = new Level("10");
        const level2 = new Level("10");
        const level3 = new Level("9");
        expect(level1.equals(level2)).toBeTruthy();
        expect(level1.equals(level3)).toBeFalsy();
    });

    it("不正な入力", () => {
        expect(() => new Level("a")).toThrow("無効なレベルです。");
        expect(() => new Level("10a")).toThrow("無効なレベルです。");
        expect(() => new Level("100")).toThrow("無効なレベルです。");
        expect(() => new Level("1++")).toThrow("無効なレベルです。");
    });
});
