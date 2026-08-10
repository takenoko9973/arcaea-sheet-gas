import { SHEET_BOOK } from "@/const";

export const AUTO_TRIGGER_HANDLERS = {
    daily: "onDailyStatisticsUpdate",
    hourly: "onHourlyCheckCollectedSong",
    spreadsheetChange: "onSpreadsheetChange",
} as const;

type AutoTriggerKind = keyof typeof AUTO_TRIGGER_HANDLERS;
type Trigger = GoogleAppsScript.Script.Trigger;

const legacyHandlerFunctions = {
    daily: "setDataByDate",
    hourly: "checkCollectedSong",
    spreadsheetChange: "onChangeData",
} as const;

const managedHandlerFunctions = new Set([
    ...Object.values(AUTO_TRIGGER_HANDLERS),
    ...Object.values(legacyHandlerFunctions),
]);
const dailyHandlerFunctions = new Set([
    AUTO_TRIGGER_HANDLERS.daily,
    legacyHandlerFunctions.daily,
]);

const managedTriggerFactories: Record<AutoTriggerKind, () => Trigger> = {
    daily: createDailyTrigger,
    hourly: () =>
        ScriptApp.newTrigger(AUTO_TRIGGER_HANDLERS.hourly)
            .timeBased()
            .everyHours(1)
            .create(),
    spreadsheetChange: () =>
        ScriptApp.newTrigger(AUTO_TRIGGER_HANDLERS.spreadsheetChange)
            .forSpreadsheet(SHEET_BOOK)
            .onChange()
            .create(),
};

/** 管理対象の自動triggerを新規作成してから、古い管理対象だけを整理する。 */
export function setupManagedTriggers(): void {
    const createdTriggers = (Object.keys(managedTriggerFactories) as AutoTriggerKind[]).map(
        triggerKind => managedTriggerFactories[triggerKind]()
    );

    deleteObsoleteTriggers(managedHandlerFunctions, createdTriggers);
}

/** 日次処理の前に、次のローカル日付00:00 one-shotを確保する。 */
export function scheduleNextDailyTrigger(): void {
    const createdTrigger = createDailyTrigger();

    deleteObsoleteTriggers(dailyHandlerFunctions, [createdTrigger]);
}

function createDailyTrigger(): Trigger {
    const dailyTriggerDate = getNextDailyTriggerDate();
    const trigger = ScriptApp.newTrigger(AUTO_TRIGGER_HANDLERS.daily)
        .timeBased()
        .at(dailyTriggerDate)
        .create();

    console.log("set daily Trigger: " + dailyTriggerDate);
    return trigger;
}

function getNextDailyTriggerDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
}

function deleteObsoleteTriggers(handlerFunctions: Set<string>, retainedTriggers: Trigger[]): void {
    const retainedTriggerIds = new Set(retainedTriggers.map(trigger => trigger.getUniqueId()));

    for (const trigger of ScriptApp.getProjectTriggers()) {
        if (!handlerFunctions.has(trigger.getHandlerFunction())) continue;
        if (retainedTriggerIds.has(trigger.getUniqueId())) continue;

        ScriptApp.deleteTrigger(trigger);
    }
}
