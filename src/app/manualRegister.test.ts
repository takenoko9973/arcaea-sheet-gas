import { vi } from "vitest";

import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { Song } from "@/domain/models/song/song";
import { ManualRegisterRepository } from "@/infrastructure/repositories/manualRegisterRepository";
import { SongRepository } from "@/infrastructure/repositories/songRepository";

import { registerFromManualEntry } from "./manualRegister";

vi.mock("@/domain/models/song/songFactory");
vi.mock("@/infrastructure/repositories/songRepository");
vi.mock("@/infrastructure/repositories/manualRegisterRepository");

describe("registerFromManualEntry", () => {
    const mockedSongRepository = vi.mocked(SongRepository);
    const mockedManualRegisterRepository = vi.mocked(ManualRegisterRepository);

    const mockSongRepositoryInstance = {
        findSong: vi.fn(),
        save: vi.fn(),
        flush: vi.fn(),
    };

    beforeAll(() => {
        Object.defineProperty(mockedSongRepository, "instance", {
            get: vi.fn().mockReturnValue(mockSongRepositoryInstance),
        });
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    function createWikiProvider() {
        return {
            fetchSongData: vi.fn().mockReturnValue({
                composer: "Wiki Composer",
                pack: "Test Pack",
                version: "1.0.0",
                side: "光(光)",
                charts: [
                    {
                        difficulty: DifficultyEnum.FUTURE,
                        level: "10",
                        notes: 1000,
                        constant: 10.5,
                    },
                ],
            }),
        };
    }

    it("新しい曲が入力された場合、登録処理を実行する", () => {
        const mockDto = {
            songTitle: "テストソング",
            nameJp: "テストソング",
            nameEn: "test-song",
            difficulty: DifficultyEnum.FUTURE,
            level: "10",
            constant: "10.5",
            urlName: "test-song-url",
        };
        const mockWikiProvider = createWikiProvider();

        mockedManualRegisterRepository.prototype.getEntry.mockReturnValue(mockDto);
        mockSongRepositoryInstance.findSong.mockReturnValue(null);

        registerFromManualEntry(mockWikiProvider);

        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalled();
        expect(mockWikiProvider.fetchSongData).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.save).toHaveBeenCalled();
        expect(mockSongRepositoryInstance.flush).toHaveBeenCalled();
    });

    it("登録済みの曲が入力された場合、登録処理を実行しない", () => {
        const mockDto = {
            songTitle: "テストソング",
            nameJp: "テストソング",
            nameEn: "test-song",
            difficulty: DifficultyEnum.FUTURE,
            level: "10",
            constant: "10.5",
            urlName: "test-song-url",
        };

        mockedManualRegisterRepository.prototype.getEntry.mockReturnValue(mockDto);
        mockSongRepositoryInstance.findSong.mockReturnValue({});

        registerFromManualEntry();

        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalled();
        expect(mockSongRepositoryInstance.save).not.toHaveBeenCalled();
        expect(mockSongRepositoryInstance.flush).not.toHaveBeenCalled();
    });
});
