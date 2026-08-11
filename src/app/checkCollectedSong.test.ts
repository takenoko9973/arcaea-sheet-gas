import { vi } from "vitest";

import { createProcessingResult } from "@/app/collectionProcessing";
import { providers, repositories } from "@/app/dependencies";
import { PersistenceFatalError } from "@/domain/errors/persistenceFatalError";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

import { registerNewSongs } from "./checkCollectedSong";
import { registerSongData } from "./registerSong";

vi.mock("./registerSong", () => ({ registerSongData: vi.fn() }));

describe("registerNewSongs", () => {
    const mockedRegisterSongData = vi.mocked(registerSongData);

    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
        vi.spyOn(repositories, "configSheet").mockReturnValue({
            targetRegisteredDifficulties: () => [DifficultyEnum.PAST, DifficultyEnum.FUTURE],
        } as ReturnType<typeof repositories.configSheet>);
        vi.spyOn(providers, "wiki").mockReturnValue({ fetchSongData: vi.fn() });
    });

    it("ある難易度の処理失敗を記録し、次の難易度を継続する", () => {
        mockedRegisterSongData
            .mockImplementationOnce(() => {
                throw new Error("difficulty failure");
            })
            .mockReturnValueOnce({ ...createProcessingResult(), processed: 1, changed: 1 });

        const result = registerNewSongs();

        expect(mockedRegisterSongData).toHaveBeenCalledTimes(2);
        expect(mockedRegisterSongData).toHaveBeenNthCalledWith(
            2,
            DifficultyEnum.FUTURE,
            expect.anything()
        );
        expect(result).toMatchObject({ processed: 1, changed: 1, skipped: 0 });
        expect(result.failures).toHaveLength(1);
        expect(result.failures[0]).toMatchObject({
            difficulty: DifficultyEnum.PAST,
            operation: "register",
        });
    });

    it("永続化のfatalは次の難易度へ継続せず再送出する", () => {
        const fatal = new PersistenceFatalError("SongScore flush", new Error("write failure"));
        mockedRegisterSongData.mockImplementation(() => {
            throw fatal;
        });

        expect(registerNewSongs).toThrow(fatal);
        expect(mockedRegisterSongData).toHaveBeenCalledTimes(1);
    });
});
