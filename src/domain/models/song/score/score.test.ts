import { GradeEnum } from "./grade/grade";
import { Score } from "./score";

describe("Score", () => {
    it("正しい値を返すNotesを作る", () => {
        expect(new Score(9950000).value).toBe(9950000);
    });

    it("equals", () => {
        const score1 = new Score(9950000);
        const score2 = new Score(9950000);
        const score3 = new Score(9980000);
        expect(score1.equals(score2)).toBeTruthy();
        expect(score1.equals(score3)).toBeFalsy();
    });

    it("不正な入力", () => {
        expect(() => new Score(-1)).toThrow(
            `スコアは${Score.MIN}から${Score.MAX}の間でなければなりません。`
        );
        expect(() => new Score(10010001)).toThrow(
            `スコアは${Score.MIN}から${Score.MAX}の間でなければなりません。`
        );
    });

    it("Gradeテスト(EX+以下)", () => {
        const score1 = new Score(9500000);
        expect(score1.scoreGrade().value).toBe(GradeEnum.AA);
        const score2 = new Score(9805000);
        expect(score2.scoreGrade().value).toBe(GradeEnum.EX);
        const score3 = new Score(9900000);
        expect(score3.scoreGrade().value).toBe(GradeEnum.EX_PLUS);
        const score4 = new Score(10002001);
        expect(score4.scoreGrade().value).toBe(GradeEnum.EX_PLUS);
        const score5 = new Score(0);
        expect(score5.scoreGrade().value).toBe(GradeEnum.NOT_PLAYED);
        const score6 = new Score(1);
        expect(score6.scoreGrade().value).toBe(GradeEnum.D);
    });
});
