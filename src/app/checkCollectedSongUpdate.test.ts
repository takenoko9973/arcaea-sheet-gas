import { vi } from "vitest";

import { createProcessingResult } from "@/app/collectionProcessing";
import { providers, repositories } from "@/app/dependencies";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

import { updateRegisteredSongs } from "./checkCollectedSong";
import { updateData } from "./updateData";

vi.mock("./updateData", () => ({ updateData: vi.fn() }));

describe("updateRegisteredSongs", () => {
    const mockedUpdateData = vi.mocked(updateData);

    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
        vi.spyOn(repositories, "configSheet").mockReturnValue({
            targetRegisteredDifficulties: () => [DifficultyEnum.PAST, DifficultyEnum.FUTURE],
        } as ReturnType<typeof repositories.configSheet>);
        vi.spyOn(providers, "wiki").mockReturnValue({ fetchSongData: vi.fn() });
        mockedUpdateData.mockReturnValue(createProcessingResult());
    });

    it("difficultyをまたいで同じWikiProviderを共有する", () => {
        updateRegisteredSongs();

        expect(mockedUpdateData).toHaveBeenCalledTimes(2);
        const firstProvider = mockedUpdateData.mock.calls[0][1];
        const secondProvider = mockedUpdateData.mock.calls[1][1];
        expect(firstProvider).toBe(secondProvider);
    });
});
