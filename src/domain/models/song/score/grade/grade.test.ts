import { Grade, GradeEnum } from "./grade";

describe("Grade", () => {
    it("正しい値を返すGradeを作る", () => {
        expect(new Grade(GradeEnum.EX_PLUS).value).toBe(GradeEnum.EX_PLUS);
    });

    it("equals", () => {
        const difficulty1 = new Grade(GradeEnum.AA);
        const difficulty2 = new Grade(GradeEnum.AA);
        const difficulty3 = new Grade(GradeEnum.A);
        expect(difficulty1.equals(difficulty2)).toBeTruthy();
        expect(difficulty1.equals(difficulty3)).toBeFalsy();
    });

    it("不正なグレードで、エラーを投げる", () => {
        expect(() => {
            const difficulty = "ARC" as GradeEnum;
            new Grade(difficulty);
        }).toThrow("無効なグレードです (ARC)");
    });
});
