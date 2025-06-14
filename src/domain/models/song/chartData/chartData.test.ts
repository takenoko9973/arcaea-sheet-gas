import { ChartData } from "./chartData";
import { Constant } from "./constant/constant";
import { SongNotes } from "./notes/songNotes";

describe("SongId", () => {
    it("正しい値を返すdifficultyDataを作る", () => {
        const difficultyData = new ChartData({
            songNotes: new SongNotes(1000),
            constant: new Constant(10.3),
        });
        expect(difficultyData.songNotes.value).toBe(1000);
        expect(difficultyData.constant.value).toBe(10.3);
    });

    it("equals", () => {
        const difficultyData1 = new ChartData({
            songNotes: new SongNotes(1000),
            constant: new Constant(10.3),
        });
        const difficultyData2 = new ChartData({
            songNotes: new SongNotes(1000),
            constant: new Constant(10.3),
        });
        // ノーツ数違い
        const difficultyData3 = new ChartData({
            songNotes: new SongNotes(2000),
            constant: new Constant(10.3),
        });
        // 譜面定数違い
        const difficultyData4 = new ChartData({
            songNotes: new SongNotes(1000),
            constant: new Constant(10.6),
        });

        expect(difficultyData1.equals(difficultyData2)).toBeTruthy();
        expect(difficultyData1.equals(difficultyData3)).toBeFalsy();
        expect(difficultyData1.equals(difficultyData4)).toBeFalsy();
    });
});
