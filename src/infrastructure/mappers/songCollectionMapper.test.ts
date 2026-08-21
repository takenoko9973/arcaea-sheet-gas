import { SongCollectionMapper } from "./songCollectionMapper";

describe("SongCollectionMapper", () => {
    const baseRow = ["song", "曲>song", "Song", "Composer", "光", "10", "", "", "1000"];

    it("新旧の譜面定数が空欄なら0へ正規化する", () => {
        expect(SongCollectionMapper.toDto(baseRow, "FTR").constant).toBe(0);
    });

    it("現在の譜面定数をnumberとして取得する", () => {
        const row = [...baseRow];
        row[7] = "10.7";

        expect(SongCollectionMapper.toDto(row, "FTR").constant).toBe(10.7);
    });

    it("現在値が空欄なら旧譜面定数をnumberとして取得する", () => {
        const row = [...baseRow];
        row[6] = "10.6";

        expect(SongCollectionMapper.toDto(row, "FTR").constant).toBe(10.6);
    });

    it("譜面定数が数値でなければ失敗する", () => {
        const row = [...baseRow];
        row[7] = "unknown";

        expect(() => SongCollectionMapper.toDto(row, "FTR")).toThrow();
    });
});
