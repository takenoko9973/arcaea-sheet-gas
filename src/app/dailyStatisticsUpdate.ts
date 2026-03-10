import { repositories } from "@/app/dependencies";
import { DailyData } from "@/domain/models/daily/dailyData";
import { GradeData } from "@/domain/models/daily/greadeData/gradeData";
import { ScoreData } from "@/domain/models/daily/scoreData/scoreData";

import { StatisticsService } from "./services/statisticsService";

export function updateDailyStatistics() {
    console.log("Start update daily statistics");

    const today = new Date();

    // シート取得
    const songRepo = repositories.song();
    const dailyRepo = repositories.dailyStatistics();
    const configSheet = repositories.configSheet();

    // 集計
    const allSongs = songRepo.fetchSongs();
    const version = StatisticsService.latestVersion(allSongs);
    const bestPotential = StatisticsService.calculateBestPotential(allSongs);
    const potentialMax = StatisticsService.calculateBestMaxPotential(allSongs);

    let totalGradeData = GradeData.createEmpty();
    const scoreDataList: ScoreData[] = [];
    const registeredDifficulties = configSheet.targetRegisteredDifficulties();
    for (const difficulty of registeredDifficulties) {
        const grade = StatisticsService.calculateGrades(allSongs, difficulty);
        totalGradeData = totalGradeData.plus(grade);

        const scoreData = StatisticsService.calculateScoreData(allSongs, difficulty);
        scoreDataList.push(scoreData);
    }

    // 更新
    const dailyData = new DailyData(
        today,
        version,
        bestPotential,
        potentialMax,
        totalGradeData,
        scoreDataList
    );
    dailyRepo.add(dailyData);

    console.log("Finished update daily statistics");
}
