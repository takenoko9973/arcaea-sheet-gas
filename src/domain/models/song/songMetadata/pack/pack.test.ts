import { Pack } from "./pack";

describe("Pack", () => {
    it("正しい値を返すPackを作る", () => {
        expect(new Pack("hoge").value).toBe("hoge");
    });

    it("equals", () => {
        const pack1 = new Pack("hoge");
        const pack2 = new Pack("hoge");
        const pack3 = new Pack("foo");
        expect(pack1.equals(pack2)).toBeTruthy();
        expect(pack1.equals(pack3)).toBeFalsy();
    });
});
