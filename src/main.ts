/* eslint-disable @typescript-eslint/no-unused-vars */
import { SheetCellPair } from "./class/sheetCellPair";
import {
    POTENTIAL_SHEET,
    SCORE_STATISTICS_SHEET,
    BEST_POTENTIAL_CELL,
    GRADE_CELL,
    SUM_SCORE_INFO_CELL,
} from "./const";
import { runTrigger } from "./trigger/onChangeData";
import { splitArrayIntoChunks } from "./util";
import { ScoreData } from "./class/scoreData";
import { DailyArcaeaData, DailyRepositorySheet } from "./class/sheet/dailyRepositorySheet";

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
    const dailySheet = DailyRepositorySheet.instance;

    const today = new Date();
    const bestPotential = POTENTIAL_SHEET.getRange(BEST_POTENTIAL_CELL).getValue();
    const grade = SCORE_STATISTICS_SHEET.getRange(GRADE_CELL).getValues().flat();
    const score = SCORE_STATISTICS_SHEET.getRange(SUM_SCORE_INFO_CELL).getValues().flat();

    const scoreData = splitArrayIntoChunks(score, 2).map(
        array => new ScoreData(array[0], array[1])
    );

    const dailyData = new DailyArcaeaData(today, bestPotential, grade, scoreData);
    dailySheet.addData(dailyData);
}
