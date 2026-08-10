import { vi } from "vitest";

import { DailyData } from "@/domain/models/daily/dailyData";
import { FrameScoreData } from "@/domain/models/daily/frameScoreData/frameScoreData";
import { GradeData, GradeDataValue } from "@/domain/models/daily/gradeData/gradeData";
import { ScoreData } from "@/domain/models/daily/scoreData/scoreData";
import { Song } from "@/domain/models/song/song";
import { DailyStatisticsRepository } from "@/infrastructure/repositories/dailyStatisticsRepository";
import { SongRepository } from "@/infrastructure/repositories/songRepository";

import { updateDailyStatistics } from "./dailyStatisticsUpdate";
import { StatisticsService } from "./services/statisticsService";

// 依存モジュールをモック化
vi.mock("@/domain/models/daily/gradeData/gradeData");
vi.mock("@/infrastructure/repositories/songRepository");
vi.mock("@/infrastructure/repositories/dailyStatisticsRepository");

vi.mock("./services/statisticsService");

describe("updateDailyStatistics", () => {
    // モックの準備
    const mockedSongRepository = vi.mocked(SongRepository);
    const mockedDailyStatisticsRepository = vi.mocked(DailyStatisticsRepository);
    const mockedStatisticsService = vi.mocked(StatisticsService);
    const mockedGradeData = vi.mocked(GradeData);

    const mockSongRepositoryInstance = { fetchSongs: vi.fn() };
    const mockDailyStatisticsRepositoryInstance = { add: vi.fn() };

    // 1度だけのセットアップ
    beforeAll(() => {
        Object.defineProperty(mockedSongRepository, "instance", {
            get: vi.fn().mockReturnValue(mockSongRepositoryInstance),
        });
        Object.defineProperty(mockedDailyStatisticsRepository, "instance", {
            get: vi.fn().mockReturnValue(mockDailyStatisticsRepositoryInstance),
        });
    });

    // 各テスト前のリセット
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("統計データが計算され、保存される", () => {
        // テストデータとモックの振る舞いを定義
        const mockSongs = [{} as Song]; // 中身は空で良い
        const mockPotential = 12.34;
        const mockGradeData = new GradeData({} as GradeDataValue); // モックインスタンス
        const mockScoreData = new ScoreData(0, 0, 0, 0);
        const mockFrameScoreData = new FrameScoreData(10, 1);

        // GradeData.createEmpty()がモックインスタンスを返すように設定
        mockedGradeData.createEmpty.mockReturnValue(mockGradeData);
        // plusメソッドは自分自身を返すようにして、チェーンできるようにする
        vi.mocked(mockGradeData.plus).mockReturnValue(mockGradeData);

        mockSongRepositoryInstance.fetchSongs.mockReturnValue(mockSongs);
        mockedStatisticsService.calculateBestPotential.mockReturnValue(mockPotential);
        mockedStatisticsService.calculateGrades.mockReturnValue(mockGradeData);
        mockedStatisticsService.calculateScoreData.mockReturnValue(mockScoreData);
        mockedStatisticsService.calculateFrameScoreData.mockReturnValue(mockFrameScoreData);

        // テスト対象の関数を実行
        updateDailyStatistics();

        // 結果を検証
        // 統計計算サービスが正しく呼ばれたか
        expect(mockedStatisticsService.calculateBestPotential).toHaveBeenCalledWith(mockSongs);

        // 最終的にaddメソッドが1回だけ呼ばれることを確認
        expect(mockDailyStatisticsRepositoryInstance.add).toHaveBeenCalledTimes(1);

        // addメソッドに渡された引数(DailyData)を検証
        const addedData = mockDailyStatisticsRepositoryInstance.add.mock.calls[0][0];
        expect(addedData).toBeInstanceOf(DailyData);
        expect(addedData.potential).toBe(mockPotential);
    });
});
