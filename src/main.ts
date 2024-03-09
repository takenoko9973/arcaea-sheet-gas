/* eslint-disable @typescript-eslint/no-unused-vars */
import { SheetCellPair } from "./class/sheetCellPair";
import {
    DAILY_REPOSITORY_SHEET,
    POTENTIAL_SHEET,
    BEST_POTENTIAL_CELL,
    SCORE_STATISTICS_SHEET,
    SUM_SCORE_INFO_CELL,
    GRADE_CELL,
} from "./const";
import { runTrigger } from "./trigger/onChangeData";

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
    const lastRow = DAILY_REPOSITORY_SHEET.getLastRow();

    const today = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd");
    const bestPotential = POTENTIAL_SHEET.getRange(BEST_POTENTIAL_CELL).getValue();
    const score = SCORE_STATISTICS_SHEET.getRange(SUM_SCORE_INFO_CELL).getValues().flat();
    const grade = SCORE_STATISTICS_SHEET.getRange(GRADE_CELL).getValues().flat();

    const inputData = [today];
    inputData.push(bestPotential);
    inputData.push(...grade);
    inputData.push(...score);

    DAILY_REPOSITORY_SHEET.insertRowAfter(lastRow);

    const inputCell = DAILY_REPOSITORY_SHEET.getRange(lastRow + 1, 1, 1, inputData.length);
    inputCell.setValues([inputData]);
}
