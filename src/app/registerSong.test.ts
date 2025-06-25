import { DifficultyEnum } from "domain/models/song/difficulty/difficultyName/difficultyName";
import { Song } from "domain/models/song/song";
import { SongCollectionRepository } from "infrastructure/repositories/songCollectionRepository";
import { SongRepository } from "infrastructure/repositories/songRepository";

import { registerSongData } from "./registerSong";
import { WikiDataFetcherService } from "./services/wikiDataFetcherService";

// 依存モジュールをモック化
jest.mock("domain/models/song/songFactory");
jest.mock("infrastructure/repositories/songRepository");
jest.mock("infrastructure/repositories/songCollectionRepository");

jest.mock("./services/wikiDataFetcherService");

describe("registerSongData", () => {
    // モックの準備
    const mockedSongRepository = jest.mocked(SongRepository);
    const mockedSongCollectionRepository = jest.mocked(SongCollectionRepository);
    const mockedWikiDataFetcherService = jest.mocked(WikiDataFetcherService);

    // SongRepositoryの偽インスタンス
    const mockSongRepositoryInstance = {
        findSong: jest.fn(),
        save: jest.fn(),
        flush: jest.fn(),
        isIgnoreConstant: jest.fn(), // isIgnoreConstantもモック対象
    };

    // SongCollectionRepositoryの偽インスタンス
    const mockSongCollectionRepositoryInstance = {
        fetchByDifficulty: jest.fn(),
    };

    //1度だけのセットアップ
    beforeAll(() => {
        // SongRepositoryシングルトンのモック
        Object.defineProperty(mockedSongRepository, "instance", {
            get: jest.fn().mockReturnValue(mockSongRepositoryInstance),
        });
        // SongCollectionRepositoryシングルトンのモック
        Object.defineProperty(mockedSongCollectionRepository, "instance", {
            get: jest.fn().mockReturnValue(mockSongCollectionRepositoryInstance),
        });
    });

    // 各テスト前のリセット
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("新曲の登録", () => {
        // テストデータとモックの振る舞いを定義
        // SongCollectionRepositoryが返すDTOのモック
        const mockSongDto = {
            songTitle: "new-song",
            nameJp: "新しい曲",
            constant: "11.0",
        };

        // Wikiから取得されるデータのモック
        const mockWikiDetails = {
            composer: "Test Composer",
            pack: "Test Pack",
            version: "2.0",
            notes: 1200,
            constant: 11.0,
        };

        // 各リポジトリ・サービスが返す値を設定
        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([mockSongDto]); // DTOを1件含む配列を返す
        mockSongRepositoryInstance.isIgnoreConstant.mockReturnValue(false); // 定数チェックは有効
        mockSongRepositoryInstance.findSong.mockReturnValue(null); // 曲はまだ存在しない
        mockedWikiDataFetcherService.fetchDetails.mockReturnValue(mockWikiDetails);

        // テスト対象の関数を実行
        registerSongData(DifficultyEnum.FUTURE);

        // 結果を検証
        // 1件のDTOに対して、それぞれ1回ずつ呼ばれるはずの処理を検証
        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalledTimes(1);
        expect(mockedWikiDataFetcherService.fetchDetails).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.save).toHaveBeenCalledTimes(1);

        // ループが終わった後、登録があったのでflushが1回呼ばれる
        expect(mockSongRepositoryInstance.flush).toHaveBeenCalledTimes(1);
    });

    it("登録済みの場合", () => {
        // テストデータとモックの振る舞いを定義
        const mockSongDto = {
            songTitle: "existing-song",
            nameJp: "既存の曲",
            constant: "10.0",
        };
        const mockExistingSong = {} as Song; // 存在する曲のダミー

        // 各リポジトリ・サービスが返す値を設定
        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([mockSongDto]);
        mockSongRepositoryInstance.isIgnoreConstant.mockReturnValue(false);
        // findSongがnullではなく、既存の曲オブジェクトを返すように設定
        mockSongRepositoryInstance.findSong.mockReturnValue(mockExistingSong);

        // テスト対象の関数を実行
        registerSongData(DifficultyEnum.FUTURE);

        // 結果を検証
        // findSongは呼ばれるが、それ以降の処理は行われないはず
        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalledTimes(1);
        expect(mockedWikiDataFetcherService.fetchDetails).not.toHaveBeenCalled();
        expect(mockSongRepositoryInstance.save).not.toHaveBeenCalled();

        // 何も登録されなかったので、flushも呼ばれない
        expect(mockSongRepositoryInstance.flush).not.toHaveBeenCalled();
    });
});
