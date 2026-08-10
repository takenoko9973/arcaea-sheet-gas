import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { Song } from "@/domain/models/song/song";
import { ManualRegisterRepository } from "@/infrastructure/repositories/manualRegisterRepository";
import { SongRepository } from "@/infrastructure/repositories/songRepository";

import { registerFromManualEntry } from "./manualRegister";

jest.mock("domain/models/song/songFactory");
jest.mock("infrastructure/repositories/songRepository");
jest.mock("infrastructure/repositories/manualRegisterRepository");

describe("registerFromManualEntry", () => {
    const mockedSongRepository = jest.mocked(SongRepository);
    const mockedManualRegisterRepository = jest.mocked(ManualRegisterRepository);

    const mockSongRepositoryInstance = {
        findSong: jest.fn(),
        save: jest.fn(),
        flush: jest.fn(),
    };

    beforeAll(() => {
        Object.defineProperty(mockedSongRepository, "instance", {
            get: jest.fn().mockReturnValue(mockSongRepositoryInstance),
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    function createWikiProvider() {
        return {
            fetchSongData: jest.fn().mockReturnValue({
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
        mockSongRepositoryInstance.findSong.mockReturnValue({} as Song);

        registerFromManualEntry();

        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalled();
        expect(mockSongRepositoryInstance.save).not.toHaveBeenCalled();
        expect(mockSongRepositoryInstance.flush).not.toHaveBeenCalled();
    });
});
