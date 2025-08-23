import { Constant } from "@/domain/models/song/chartData/constant/constant";
import { SongNotes } from "@/domain/models/song/chartData/notes/songNotes";
import {
    DifficultyEnum,
    DifficultyName,
} from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { Level } from "@/domain/models/song/difficulty/level/level";
import { SongCollectionRepository } from "@/infrastructure/repositories/songCollectionRepository";
import { SongRepository } from "@/infrastructure/repositories/songRepository";

import { updateData } from "./updateData";

// 1. 依存モジュールをモック化
jest.mock("infrastructure/repositories/songRepository");
jest.mock("infrastructure/repositories/songCollectionRepository");

describe("updateData", () => {
    // 2. モックの準備
    const mockedSongRepository = jest.mocked(SongRepository);
    const mockedSongCollectionRepository = jest.mocked(SongCollectionRepository);

    const mockSongRepositoryInstance = {
        findSong: jest.fn(),
        save: jest.fn(),
        flush: jest.fn(),
    };
    const mockSongCollectionRepositoryInstance = {
        fetchByDifficulty: jest.fn(),
    };

    // 1度だけのセットアップ
    beforeAll(() => {
        Object.defineProperty(mockedSongRepository, "instance", {
            get: jest.fn().mockReturnValue(mockSongRepositoryInstance),
        });
        Object.defineProperty(mockedSongCollectionRepository, "instance", {
            get: jest.fn().mockReturnValue(mockSongCollectionRepositoryInstance),
        });
    });

    // 各テスト前のリセット
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("収集データに更新があった場合、正しく更新処理が実行", () => {
        // 4. テストデータとモックの振る舞いを定義
        // SongCollectionRepositoryが返す「新しい情報」を持つDTO
        const mockDtoWithUpdate = {
            songTitle: "test-song",
            nameJp: "更新曲名",
            level: "11+", // レベルが '11' から '11+' に更新されたと仮定
            constant: "11.7", // 定数が '11.6' から '11.7' に更新されたと仮定
            notes: "1300",
        };

        // SongRepositoryに保存されている「古い情報」を持つSongエンティティのモック
        const mockExistingSong = {
            songData: { nameJp: "テストソング" },
            difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
            level: new Level("11"), // 古いレベル
            constant: new Constant(11.6), // 古い定数
            songNotes: new SongNotes(1300),
            // 更新ロジックで呼ばれるメソッドもモック化
            changeDifficulty: jest.fn(),
            changeChartData: jest.fn(),
        };
        // changeDifficultyが呼ばれたら、自分自身(のフリをしたオブジェクト)を返すように設定
        mockExistingSong.changeDifficulty.mockReturnValue(mockExistingSong);
        mockExistingSong.changeChartData.mockReturnValue(mockExistingSong);

        // 各リポジトリの振る舞いを設定
        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([mockDtoWithUpdate]);
        mockSongRepositoryInstance.findSong.mockReturnValue(mockExistingSong); // anyで型エラーを回避

        // テスト対象の関数を実行
        updateData(DifficultyEnum.FUTURE);

        // 結果を検証
        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalledTimes(1);
        // 更新があったので、change系のメソッドが呼ばれる
        expect(mockExistingSong.changeDifficulty).toHaveBeenCalled();
        expect(mockExistingSong.changeChartData).toHaveBeenCalled();
        // 最終的にsaveとflushが呼ばれる
        expect(mockSongRepositoryInstance.save).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.flush).toHaveBeenCalledTimes(1);
    });

    it("更新がない場合、更新処理が実行されない", () => {
        // DTOと既存Songのデータが全く同じである状況
        const mockDtoNoUpdate = {
            songTitle: "test-song",
            nameJp: "同じ曲名",
            level: "11", // 既存データと同じ
            constant: "11.4", // 既存データと同じ
            notes: "1300", // 既存データと同じ
        };

        const mockExistingSongWithSameData = {
            songData: { nameJp: "同じ曲名" },
            difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
            level: new Level("11"),
            constant: new Constant(11.4),
            songNotes: new SongNotes(1300),
            changeDifficulty: jest.fn(),
            changeChartData: jest.fn(),
        };

        // 各リポジトリの振る舞いを設定
        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([mockDtoNoUpdate]);
        mockSongRepositoryInstance.findSong.mockReturnValue(mockExistingSongWithSameData);

        // テスト対象の関数を実行
        updateData(DifficultyEnum.FUTURE);

        // 結果を検証
        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalledTimes(1);
        // 更新がないので、change系のメソッドは呼ばれない
        expect(mockExistingSongWithSameData.changeDifficulty).not.toHaveBeenCalled();
        expect(mockExistingSongWithSameData.changeChartData).not.toHaveBeenCalled();
        // saveとflushも呼ばれない
        expect(mockSongRepositoryInstance.save).not.toHaveBeenCalled();
        expect(mockSongRepositoryInstance.flush).not.toHaveBeenCalled();
    });
});
