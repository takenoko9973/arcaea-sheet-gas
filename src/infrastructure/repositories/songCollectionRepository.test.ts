import { vi } from "vitest";

import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { getSheet } from "@/utils/sheetHelper";

import { SongCollectionRepository } from "./songCollectionRepository";

vi.mock("@/utils/sheetHelper", () => ({ getSheet: vi.fn() }));

describe("SongCollectionRepository", () => {
    it("Collection行の--を含むDTOを難易度別にロードできる", () => {
        const getValues = vi
            .fn()
            .mockReturnValue([
                [DifficultyEnum.FUTURE],
                ["ignored", "song", "曲>song", "Song", "Composer", "光", "10", "", "--", "1000"],
            ]);
        const sheet = {
            getDataRange: vi.fn().mockReturnValue({ getValues }),
        };
        vi.mocked(getSheet).mockReturnValue(sheet as unknown as ReturnType<typeof getSheet>);

        const result = SongCollectionRepository.instance.fetchByDifficulty(DifficultyEnum.FUTURE);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            songTitle: "song",
            nameJp: "曲",
            constant: "--",
            notes: "1000",
        });
    });
});
