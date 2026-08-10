import { vi } from "vitest";

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
vi.mock("@/infrastructure/repositories/songRepository");
vi.mock("@/infrastructure/repositories/songCollectionRepository");

describe("updateData", () => {
    // 2. モックの準備
    const mockedSongRepository = vi.mocked(SongRepository);
    const mockedSongCollectionRepository = vi.mocked(SongCollectionRepository);

    const mockSongRepositoryInstance = {
        findSong: vi.fn(),
        save: vi.fn(),
        flush: vi.fn(),
    };
    const mockSongCollectionRepositoryInstance = {
        fetchByDifficulty: vi.fn(),
    };

    // 1度だけのセットアップ
    beforeAll(() => {
        Object.defineProperty(mockedSongRepository, "instance", {
            get: vi.fn().mockReturnValue(mockSongRepositoryInstance),
        });
        Object.defineProperty(mockedSongCollectionRepository, "instance", {
            get: vi.fn().mockReturnValue(mockSongCollectionRepositoryInstance),
        });
    });

    // 各テスト前のリセット
    beforeEach(() => {
        vi.clearAllMocks();
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
            changeDifficulty: vi.fn(),
            changeChartData: vi.fn(),
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
            changeDifficulty: vi.fn(),
            changeChartData: vi.fn(),
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

    it("1曲の処理失敗後も後続曲を更新する", () => {
        const changedSong = {
            songData: { nameJp: "後続曲" },
            difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
            level: new Level("11"),
            constant: new Constant(11.0),
            songNotes: new SongNotes(1000),
            changeDifficulty: vi.fn(),
            changeChartData: vi.fn(),
        };
        changedSong.changeDifficulty.mockReturnValue(changedSong);
        changedSong.changeChartData.mockReturnValue(changedSong);
        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([
            {
                songTitle: "failed-song",
                nameJp: "失敗曲",
                level: "11",
                constant: "11",
                notes: "1000",
            },
            {
                songTitle: "following-song",
                nameJp: "後続曲",
                level: "11+",
                constant: "11",
                notes: "1000",
            },
        ]);
        mockSongRepositoryInstance.findSong
            .mockImplementationOnce(() => {
                throw new Error("Collection processing failure");
            })
            .mockReturnValueOnce(changedSong);

        const result = updateData(DifficultyEnum.FUTURE);

        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalledTimes(2);
        expect(mockSongRepositoryInstance.save).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.flush).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ processed: 1, changed: 1, skipped: 0 });
        expect(result.failures).toHaveLength(1);
        expect(result.failures[0]).toMatchObject({
            song: "failed-song",
            difficulty: DifficultyEnum.FUTURE,
            operation: "update",
        });
    });
});
