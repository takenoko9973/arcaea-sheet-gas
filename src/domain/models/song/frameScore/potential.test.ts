import { FrameScore } from "./potential";

describe("FrameScore", () => {
    it("正しい値を返すFrameScoreを作る", () => {
        expect(new FrameScore(100.0).value).toBe(100.0);
    });

    it("equals", () => {
        const constant1 = new FrameScore(100.0);
        const constant2 = new FrameScore(100.0);
        const constant3 = new FrameScore(150.0);
        expect(constant1.equals(constant2)).toBeTruthy();
        expect(constant1.equals(constant3)).toBeFalsy();
    });

    it("不正な定数", () => {
        expect(() => new FrameScore(-1)).toThrow(
            "フレーム値は0以上の数値である必要があります (-1)"
        );
    });
});
