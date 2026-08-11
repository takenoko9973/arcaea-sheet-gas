import { SongMapper, SongReconstructionError } from "./songMapper";

describe("SongMapper.toDomain", () => {
    it("復元に失敗した行のシート、行、曲、難易度、操作、原因を保持する", () => {
        const row = [
            "test-song",
            "テスト曲",
            "test song",
            "composer",
            "pack",
            "1.0.0",
            "光",
            "INVALID",
            "10",
            10,
            1000,
            0,
        ];

        expect(() => SongMapper.toDomain(row, { sheet: "SongScore", row: 12 })).toThrow(
            SongReconstructionError
        );
        try {
            SongMapper.toDomain(row, { sheet: "SongScore", row: 12 });
        } catch (error) {
            expect(error).toMatchObject({
                context: {
                    sheet: "SongScore",
                    row: 12,
                    song: "test-song",
                    difficulty: "INVALID",
                    operation: "SongScore復元",
                },
            });
            expect(error).toBeInstanceOf(SongReconstructionError);
            expect((error as SongReconstructionError).cause).toBeInstanceOf(Error);
        }
    });
});
