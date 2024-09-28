import { Notes } from "./notes";

describe("Notes", () => {
    it("正しい値を返すNotesを作る", () => {
        expect(new Notes(100).value).toBe(100);
    });

    it("equals", () => {
        const level1 = new Notes(1222);
        const level2 = new Notes(1222);
        const level3 = new Notes(2221);
        expect(level1.equals(level2)).toBeTruthy();
        expect(level1.equals(level3)).toBeFalsy();
    });

    it("不正な入力", () => {
        expect(() => new Notes(0)).toThrow(
            `ノーツ数は${Notes.MIN}から${Notes.MAX}の間でなければなりません。`
        );
        expect(() => new Notes(-1)).toThrow(
            `ノーツ数は${Notes.MIN}から${Notes.MAX}の間でなければなりません。`
        );
        expect(() => new Notes(2237)).toThrow(
            `ノーツ数は${Notes.MIN}から${Notes.MAX}の間でなければなりません。`
        );
    });
});
