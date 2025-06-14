import { PROCESSING_TARGET_DIFFICULTIES } from "const";
import { DailyData } from "domain/models/daily/dailyData";
import { GradeData } from "domain/models/daily/greadeData/gradeData";
import { ScoreData } from "domain/models/daily/scoreData/scoreData";
import { DailyStatisticsRepository } from "infrastructure/repositories/dailyStatisticsRepository";
import { SongRepository } from "infrastructure/repositories/songRepository";

import { StatisticsService } from "./services/statisticsService";

export function updateDailyStatistics() {
    console.log("Start update daily statistics");

    const today = new Date();

    // シート取得
    const songRepo = SongRepository.instance;
    const dailyRepo = DailyStatisticsRepository.instance;

    // 集計
    const allSongs = songRepo.fetchSongs();
    const bestPotential = StatisticsService.calculateBestPotential(allSongs);

    let totalGradeData = GradeData.createEmpty();
    const scoreDataList: ScoreData[] = [];
    for (const difficulty of PROCESSING_TARGET_DIFFICULTIES) {
        const grade = StatisticsService.calculateGrades(allSongs, difficulty);
        totalGradeData = totalGradeData.plus(grade);

        const scoreData = StatisticsService.calculateScoreData(allSongs, difficulty);
        scoreDataList.push(scoreData);
    }

    // 更新
    const dailyData = new DailyData(today, bestPotential, totalGradeData, scoreDataList);
    dailyRepo.add(dailyData);

    console.log("Finished update daily statistics");
}
