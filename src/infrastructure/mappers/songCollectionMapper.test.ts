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

    it.each([
        ["現在値", 7],
        ["旧値", 6],
    ])("$0の--は文字列表現として保持する", (_label, index) => {
        const row = [...baseRow];
        row[index] = "--";

        expect(SongCollectionMapper.toDto(row, "FTR").constant).toBe("--");
    });

    it.each(["unknown", "abc", "10x"])("譜面定数が%sなら失敗する", invalidConstant => {
        const row = [...baseRow];
        row[7] = invalidConstant;

        expect(() => SongCollectionMapper.toDto(row, "FTR")).toThrow();
    });
});
