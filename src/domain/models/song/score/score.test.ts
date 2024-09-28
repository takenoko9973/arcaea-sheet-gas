import { Score } from "./score";

describe("Score", () => {
    it("正しい値を返すNotesを作る", () => {
        expect(new Score(9950000).value).toBe(9950000);
    });

    it("equals", () => {
        const level1 = new Score(9950000);
        const level2 = new Score(9950000);
        const level3 = new Score(9980000);
        expect(level1.equals(level2)).toBeTruthy();
        expect(level1.equals(level3)).toBeFalsy();
    });

    it("不正な入力", () => {
        expect(() => new Score(-1)).toThrow(
            `スコアは${Score.MIN}から${Score.MAX}の間でなければなりません。`
        );
        expect(() => new Score(10010001)).toThrow(
            `スコアは${Score.MIN}から${Score.MAX}の間でなければなりません。`
        );
    });
});
