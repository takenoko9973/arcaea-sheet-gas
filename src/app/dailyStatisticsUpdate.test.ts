import { DailyData } from "domain/models/daily/dailyData";
import { GradeData, GradeDataValue } from "domain/models/daily/greadeData/gradeData";
import { ScoreData } from "domain/models/daily/scoreData/scoreData";
import { Song } from "domain/models/song/song";
import { DailyStatisticsRepository } from "infrastructure/repositories/dailyStatisticsRepository";
import { SongRepository } from "infrastructure/repositories/songRepository";

import { updateDailyStatistics } from "./dailyStatisticsUpdate";
import { StatisticsService } from "./services/statisticsService";

// 依存モジュールをモック化
jest.mock("domain/models/daily/greadeData/gradeData");
jest.mock("infrastructure/repositories/songRepository");
jest.mock("infrastructure/repositories/dailyStatisticsRepository");

jest.mock("./services/statisticsService");

describe("updateDailyStatistics", () => {
    // モックの準備
    const mockedSongRepository = jest.mocked(SongRepository);
    const mockedDailyStatisticsRepository = jest.mocked(DailyStatisticsRepository);
    const mockedStatisticsService = jest.mocked(StatisticsService);
    const mockedGradeData = jest.mocked(GradeData);

    const mockSongRepositoryInstance = { fetchSongs: jest.fn() };
    const mockDailyStatisticsRepositoryInstance = { add: jest.fn() };

    // 1度だけのセットアップ
    beforeAll(() => {
        Object.defineProperty(mockedSongRepository, "instance", {
            get: jest.fn().mockReturnValue(mockSongRepositoryInstance),
        });
        Object.defineProperty(mockedDailyStatisticsRepository, "instance", {
            get: jest.fn().mockReturnValue(mockDailyStatisticsRepositoryInstance),
        });
    });

    // 各テスト前のリセット
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("統計データが計算され、保存される", () => {
        // テストデータとモックの振る舞いを定義
        const mockSongs = [{} as Song]; // 中身は空で良い
        const mockPotential = 12.34;
        const mockGradeData = new GradeData({} as GradeDataValue); // モックインスタンス
        const mockScoreData = new ScoreData(0, 0, 0, 0);

        // GradeData.createEmpty()がモックインスタンスを返すように設定
        mockedGradeData.createEmpty.mockReturnValue(mockGradeData);
        // plusメソッドは自分自身を返すようにして、チェーンできるようにする
        (mockGradeData.plus as jest.Mock).mockReturnValue(mockGradeData);

        mockSongRepositoryInstance.fetchSongs.mockReturnValue(mockSongs);
        mockedStatisticsService.calculateBestPotential.mockReturnValue(mockPotential);
        mockedStatisticsService.calculateGrades.mockReturnValue(mockGradeData);
        mockedStatisticsService.calculateScoreData.mockReturnValue(mockScoreData);

        // テスト対象の関数を実行
        updateDailyStatistics();

        // 結果を検証
        // 統計計算サービスが正しく呼ばれたか
        expect(mockedStatisticsService.calculateBestPotential).toHaveBeenCalledWith(mockSongs);
        // ループ処理なので、対象の難易度の数だけ呼ばれる (現状の実装では3回)
        expect(mockedStatisticsService.calculateGrades).toHaveBeenCalledTimes(3);
        expect(mockedStatisticsService.calculateScoreData).toHaveBeenCalledTimes(3);

        // 最終的にaddメソッドが1回だけ呼ばれることを確認
        expect(mockDailyStatisticsRepositoryInstance.add).toHaveBeenCalledTimes(1);

        // addメソッドに渡された引数(DailyData)を検証
        const addedData = mockDailyStatisticsRepositoryInstance.add.mock.calls[0][0];
        expect(addedData).toBeInstanceOf(DailyData);
        expect(addedData.potential).toBe(mockPotential);
        expect(addedData.scoreData.length).toBe(3);
    });
});
