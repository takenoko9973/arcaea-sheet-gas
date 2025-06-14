import { Potential } from "./potential";

describe("Constant", () => {
    it("正しい値を返すConstantを作る", () => {
        expect(new Potential(10.0).value).toBe(10.0);
    });

    it("equals", () => {
        const constant1 = new Potential(10.7);
        const constant2 = new Potential(10.7);
        const constant3 = new Potential(11.5);
        expect(constant1.equals(constant2)).toBeTruthy();
        expect(constant1.equals(constant3)).toBeFalsy();
    });

    it("不正な定数", () => {
        expect(() => new Potential(-1)).toThrow(
            "ポテンシャルは0以上の数値である必要があります (-1)"
        );
    });
});
