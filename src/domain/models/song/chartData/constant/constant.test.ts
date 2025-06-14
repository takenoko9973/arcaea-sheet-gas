import { Constant } from "./constant";

describe("Constant", () => {
    it("正しい値を返すConstantを作る", () => {
        expect(new Constant(10.0).value).toBe(10.0);
    });

    it("equals", () => {
        const constant1 = new Constant(10.7);
        const constant2 = new Constant(10.7);
        const constant3 = new Constant(11.5);
        expect(constant1.equals(constant2)).toBeTruthy();
        expect(constant1.equals(constant3)).toBeFalsy();
    });

    it("不正な定数", () => {
        expect(() => new Constant(-1)).toThrow("定数は0以上の数値である必要があります (-1)");
    });
});
