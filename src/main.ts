import {
    autoRegister,
    checkCollectedSong,
    update,
} from "@/app/checkCollectedSong";
import {
    logProcessingResult,
    ProcessingResult,
} from "@/app/collectionProcessing";
import { updateDailyStatistics } from "@/app/dailyStatisticsUpdate";
import { manualRegister } from "@/app/manualRegister";
import { SheetCellPair } from "@/domain/sheetCellPair";
import { dispatchSpreadsheetChange } from "@/trigger/spreadsheetChangeDispatcher";
import {
    scheduleNextDailyTrigger,
    setupManagedTriggers,
} from "@/trigger/triggerSetting";

/** 毎時の自動処理と同じ収集処理を手動で実行する入口 */
export function runCheckCollectedSong(): ProcessingResult {
    return runProcessingEntryPoint("check collected song", checkCollectedSong);
}

/** 登録処理だけを手動で実行する入口 */
export function runAutoRegister(): ProcessingResult {
    return runProcessingEntryPoint("auto register", autoRegister);
}

/** 更新処理だけを手動で実行する入口 */
export function runUpdate(): ProcessingResult {
    return runProcessingEntryPoint("update", update);
}

/** 手動登録シートの内容を登録する入口 */
export function runManualRegister() {
    return manualRegister();
}

/** 管理対象の自動triggerを初期化する入口 */
export function setupTriggers(): void {
    setupManagedTriggers();
}

/** 毎時の登録・更新を実行するGAS handler */
export function onHourlyCheckCollectedSong(): ProcessingResult {
    return runCheckCollectedSong();
}

/** Spreadsheet changeを内部dispatcherへ渡すGAS handler */
export function onSpreadsheetChange(e: GoogleAppsScript.Events.SheetsOnChange): void {
    const sheet = e.source.getActiveSheet();
    const cell = e.source.getActiveRange();
    if (cell === null) return;

    const lock = LockService.getScriptLock(); // 二重実行防止
    if (!lock.tryLock(1)) return;

    try {
        const changedPair = new SheetCellPair(sheet.getName(), cell.getA1Notation());
        console.log("Changed %s(%s)", changedPair.cell_location, changedPair.sheet_name);

        dispatchSpreadsheetChange(changedPair);
    } catch (cause) {
        console.error("onSpreadsheetChange fatal: %s", describeError(cause));
        throw cause;
    } finally {
        lock.releaseLock();
    }
}

/** 翌日00:00のone-shotから実行される日次GAS handler */
export function onDailyStatisticsUpdate(): void {
    // 本処理より先に次回予定を確保し、日次処理の失敗で次回実行を失わないようにする。
    scheduleNextDailyTrigger();

    console.log("Run daily task");

    updateDailyStatistics();

    console.log("End daily task");
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
