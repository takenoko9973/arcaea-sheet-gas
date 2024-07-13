import { Difficulty } from "../types/difficulty";
import { DailyArcaeaData, DailyRepositorySheet } from "../class/sheet/dailyRepositorySheet";
import { SongScoreSheet } from "../class/sheet/songScoreSheet";
import { GradeData } from "../class/gradeData";
import { ScoreData } from "../class/scoreData";

export function updateDailyStatistics() {
    console.log("Update daily statistics");

    const statisticsDifficulties: Difficulty[] = [
        Difficulty.Future,
        Difficulty.Beyond,
        Difficulty.Eternal,
    ];

    const dailySheet = DailyRepositorySheet.instance;
    const songScoreSheet = SongScoreSheet.instance;

    const today = new Date();
    const bestPotential = songScoreSheet.getBestPotential();

    let gradeData = new GradeData();
    const scoreData = [];
    for (const difficulty of statisticsDifficulties) {
        const grade = songScoreSheet.getGrades(difficulty);
        gradeData = gradeData.plus(grade);

        const maximumScore = songScoreSheet.getMaximumSumScore(difficulty);
        const score = songScoreSheet.getSumScore(difficulty);
        const farNotes = songScoreSheet.getFarNotes(difficulty);
        const luckShinyPure = songScoreSheet.getLuckShinyPureNotes(difficulty);
        scoreData.push(new ScoreData(score, maximumScore - score, farNotes, luckShinyPure));
    }

    const dailyData = new DailyArcaeaData(today, bestPotential, gradeData, scoreData);
    dailySheet.addData(dailyData);
}
