import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { Song } from "@/domain/models/song/song";
import { ManualRegisterRepository } from "@/infrastructure/repositories/manualRegisterRepository";
import { SongRepository } from "@/infrastructure/repositories/songRepository";

import { manualRegister } from "./manualRegister";
import { WikiDataFetcherService } from "./services/wikiDataFetcherService";

jest.mock("domain/models/song/songFactory");
jest.mock("infrastructure/repositories/songRepository");
jest.mock("infrastructure/repositories/manualRegisterRepository");

jest.mock("./services/wikiDataFetcherService");

describe("manualRegister", () => {
    // 各リポジトリのモック
    const mockedSongRepository = jest.mocked(SongRepository);
    const mockedManualRegisterRepository = jest.mocked(ManualRegisterRepository);
    const mockedWikiDataFetcherService = jest.mocked(WikiDataFetcherService);

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

    it("新しい曲が入力された場合、登録処理を実行", () => {
        const mockDto = {
            songTitle: "テストソング",
            nameJp: "テストソング",
            nameEn: "test-song",
            difficulty: DifficultyEnum.FUTURE,
            level: "10",
            constant: "10.5",
            urlName: "test-song-url",
        };

        const mockWikiDetails = {
            composer: "Test Composer",
            pack: "Test Pack",
            version: "1.0",
            level: "10",
            side: "光",
            notes: 1000,
            constant: 10.5,
        };

        // パターン状況設定
        mockedManualRegisterRepository.prototype.getEntry.mockReturnValue(mockDto);
        mockSongRepositoryInstance.findSong.mockReturnValue(null); // 見つからなかったパターン
        mockedWikiDataFetcherService.fetchDetails.mockReturnValue(mockWikiDetails);

        // 仮想環境で実行
        manualRegister();

        // 各関数が実行されたかどうか (関数完遂の確認)
        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalled();
        expect(mockedWikiDataFetcherService.fetchDetails).toHaveBeenCalled();
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
        // findSongが返す、既存の曲のモック
        const mockExistingSong = {} as Song; // 中身は空でOK

        mockedManualRegisterRepository.prototype.getEntry.mockReturnValue(mockDto);
        mockSongRepositoryInstance.findSong.mockReturnValue(mockExistingSong);

        // テスト対象の関数を実行
        manualRegister();

        // 結果を検証
        // findSongは呼ばれる
        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalled();
        // saveとflushは呼ばれないことを確認
        expect(mockSongRepositoryInstance.save).not.toHaveBeenCalled();
        expect(mockSongRepositoryInstance.flush).not.toHaveBeenCalled();
        // Wikiへの問い合わせも行われない
        expect(mockedWikiDataFetcherService.fetchDetails).not.toHaveBeenCalled();
    });
});
