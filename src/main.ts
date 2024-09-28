/* eslint-disable @typescript-eslint/no-unused-vars */
import { SheetCellPair } from "./class/sheetCellPair";
import { runTrigger } from "./trigger/onChangeData";
import { updateDailyStatistics } from "./app/dailyStatisticsUpdate";

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

/**
 * 日付変更で実行
 */
function setDataByDate() {
    console.log("Run daily task");

    updateDailyStatistics();

    console.log("End daily task");
}
