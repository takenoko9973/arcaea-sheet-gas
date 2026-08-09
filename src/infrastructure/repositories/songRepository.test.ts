import { PersistenceFatalError } from "@/domain/errors/persistenceFatalError";
import { SongReconstructionError } from "@/infrastructure/mappers/songMapper";
import { getSheet } from "@/utils/sheetHelper";

import { SongRepository } from "./songRepository";

jest.mock("@/utils/sheetHelper", () => ({ getSheet: jest.fn() }));

describe("SongRepository", () => {
    const mockedGetSheet = jest.mocked(getSheet);

    beforeEach(() => {
        jest.clearAllMocks();
        Reflect.deleteProperty(SongRepository, "singleton");
    });

    it("SongScoreの復元失敗をfatalとして初期化境界から送出する", () => {
        mockedGetSheet.mockReturnValue({
            getName: () => "SongScore",
            getDataRange: () => ({
                getValues: () => [
                    ["header"],
                    [
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
                    ],
                ],
            }),
        } as unknown as GoogleAppsScript.Spreadsheet.Sheet);

        let thrown: unknown;
        try {
            SongRepository.instance.flush();
        } catch (error) {
            thrown = error;
        }
        expect(thrown).toBeInstanceOf(PersistenceFatalError);
        expect((thrown as PersistenceFatalError).cause).toBeInstanceOf(SongReconstructionError);
    });

    it("flushの失敗をfatalとして送出する", () => {
        mockedGetSheet.mockReturnValue({
            getName: () => "SongScore",
            getDataRange: () => ({ getValues: () => [["header"]] }),
            getLastRow: () => {
                throw new Error("write failure");
            },
        } as unknown as GoogleAppsScript.Spreadsheet.Sheet);

        const repository = SongRepository.instance;

        expect(() => repository.flush()).toThrow(PersistenceFatalError);
    });
});
