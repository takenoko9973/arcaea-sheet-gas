/* eslint-disable @typescript-eslint/no-unused-vars */
import { SheetCellPair } from "./class/sheetCellPair";
import { Difficulty } from "./types";
import { runTrigger } from "./trigger/onChangeData";
import { ScoreData } from "./class/scoreData";
import { DailyArcaeaData, DailyRepositorySheet } from "./class/sheet/dailyRepositorySheet";
import { SongScoreSheet } from "./class/sheet/songScoreSheet";
import { GradeData } from "./class/gradeData";

function onChangeData(e: GoogleAppsScript.Events.SheetsOnChange) {
    const sheet = e.source.getActiveSheet();
    const cell = e.source.getActiveRange();
    if (cell === null) return;

    const lock = LockService.getScriptLock(); // 二重実行防止
    if (!lock.tryLock(1)) return;

    const changedPair = new SheetCellPair(sheet.getName(), cell.getA1Notation());
    console.log("Changed %s(%s)", changedPair.cell_location, changedPair.sheet_name);

    runTrigger(changedPair);

    lock.releaseLock();
}

function setDataByDate() {
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
        scoreData.push(new ScoreData(score, maximumScore - score));
    }

    const dailyData = new DailyArcaeaData(today, bestPotential, gradeData, scoreData);
    dailySheet.addData(dailyData);
}
