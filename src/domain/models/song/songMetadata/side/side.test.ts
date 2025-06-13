import { Side, SideEnum } from "./side";

describe("Side", () => {
    it("正しい値を返すSideを作る", () => {
        expect(new Side(SideEnum.LIGHT).value).toBe(SideEnum.LIGHT);
    });

    it("equals", () => {
        const side1 = new Side(SideEnum.LIGHT);
        const side2 = new Side(SideEnum.LIGHT);
        const side3 = new Side(SideEnum.CONFLICT);
        expect(side1.equals(side2)).toBeTruthy();
        expect(side1.equals(side3)).toBeFalsy();
    });

    it("不正な属性名で、エラーを投げる", () => {
        expect(() => {
            const side = "Arcaea" as SideEnum;
            new Side(side);
        }).toThrow("無効な属性です。");
    });
});
