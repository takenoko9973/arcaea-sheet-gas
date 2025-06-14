import { PureNotes } from "./pureNotes";
import { ShinyPureNotes } from "./shinyPureNotes";
import { SongNotes } from "./songNotes";

describe("Notes", () => {
    it("正しい値を返すNotesを作る", () => {
        expect(new SongNotes(100).value).toBe(100);
        expect(new PureNotes(0).value).toBe(0);
        expect(new ShinyPureNotes(0).value).toBe(0);
    });

    it("equals", () => {
        const level1 = new SongNotes(1222);
        const level2 = new SongNotes(1222);
        const level3 = new PureNotes(1222);
        const level4 = new ShinyPureNotes(1222);
        const level5 = new SongNotes(2221);
        expect(level1.equals(level2)).toBeTruthy();
        expect(level1.equals(level3)).toBeTruthy();
        expect(level1.equals(level4)).toBeTruthy();
        expect(level1.equals(level5)).toBeFalsy();
    });

    it("不正な入力", () => {
        expect(() => new SongNotes(0)).toThrow(
            `ノーツ数は${SongNotes.MIN}から${SongNotes.MAX}の間でなければなりません (0)`
        );
        expect(() => new SongNotes(-1)).toThrow(
            `ノーツ数は${SongNotes.MIN}から${SongNotes.MAX}の間でなければなりません (-1)`
        );
        expect(() => new SongNotes(2237)).toThrow(
            `ノーツ数は${SongNotes.MIN}から${SongNotes.MAX}の間でなければなりません (2237)`
        );
        expect(() => new PureNotes(-1)).toThrow(
            `ノーツ数は${PureNotes.MIN}から${PureNotes.MAX}の間でなければなりません (-1)`
        );
        expect(() => new ShinyPureNotes(-1)).toThrow(
            `ノーツ数は${ShinyPureNotes.MIN}から${ShinyPureNotes.MAX}の間でなければなりません (-1)`
        );
    });
});
