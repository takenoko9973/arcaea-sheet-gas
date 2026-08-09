import {
    autoRegister as runAutoRegister,
    checkCollectedSong as runCheckCollectedSong,
    update as runUpdate,
} from "@/app/checkCollectedSong";
import {
    logProcessingResult,
    ProcessingResult,
} from "@/app/collectionProcessing";
import { updateDailyStatistics } from "@/app/dailyStatisticsUpdate";
import { SHEET_BOOK } from "@/const";
import { SheetCellPair } from "@/domain/sheetCellPair";
import { runTrigger } from "@/trigger/onChangeData";
import { setDailyTrigger } from "@/trigger/triggerSetting";

export { manualRegister } from "@/app/manualRegister";

export function checkCollectedSong(): ProcessingResult {
    return runProcessingEntryPoint("check collected song", runCheckCollectedSong);
}

export function autoRegister(): ProcessingResult {
    return runProcessingEntryPoint("auto register", runAutoRegister);
}

export function update(): ProcessingResult {
    return runProcessingEntryPoint("update", runUpdate);
}

export function initTriggers() {
    // 既存のトリガーをすべて削除
    const allTriggers = ScriptApp.getProjectTriggers();
    for (const trigger of allTriggers) {
        ScriptApp.deleteTrigger(trigger);
    }

    setDailyTrigger();
    ScriptApp.newTrigger("checkCollectedSong").timeBased().everyHours(1).create();
    ScriptApp.newTrigger("onChangeData").forSpreadsheet(SHEET_BOOK).onChange().create();
}

export function onChangeData(e: GoogleAppsScript.Events.SheetsOnChange) {
    const sheet = e.source.getActiveSheet();
    const cell = e.source.getActiveRange();
    if (cell === null) return;

    const lock = LockService.getScriptLock(); // 二重実行防止
    if (!lock.tryLock(1)) return;

    try {
        const changedPair = new SheetCellPair(sheet.getName(), cell.getA1Notation());
        console.log("Changed %s(%s)", changedPair.cell_location, changedPair.sheet_name);

        runTrigger(changedPair);
    } catch (cause) {
        console.error("onChangeData fatal: %s", describeError(cause));
        throw cause;
    } finally {
        lock.releaseLock();
    }
}

/**
 * 日付変更で実行
 */
export function setDataByDate() {
    console.log("Run daily task");

    updateDailyStatistics();

    console.log("End daily task");

    setDailyTrigger();
}

function runProcessingEntryPoint(
    operation: string,
    process: () => ProcessingResult
): ProcessingResult {
    try {
        const result = process();
        logProcessingResult(operation, result);
        return result;
    } catch (cause) {
        console.error("%s fatal: %s", operation, describeError(cause));
        throw cause;
    }
}

function describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
