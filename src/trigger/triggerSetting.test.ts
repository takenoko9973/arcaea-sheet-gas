import { vi, type Mock } from "vitest";

import {
    AUTO_TRIGGER_HANDLERS,
    scheduleNextDailyTrigger,
    setupManagedTriggers,
} from "./triggerSetting";

type MockTrigger = {
    handlerFunction: string;
    uniqueId: string;
    getHandlerFunction: Mock<() => string>;
    getUniqueId: Mock<() => string>;
};

const createdTriggers: MockTrigger[] = [];
const existingTriggers: MockTrigger[] = [];
const events: string[] = [];
const atDates: Date[] = [];

const scriptApp = {
    getProjectTriggers: vi.fn(() => [...existingTriggers, ...createdTriggers]),
    deleteTrigger: vi.fn((trigger: MockTrigger) => {
        events.push(`delete:${trigger.uniqueId}`);
    }),
    newTrigger: vi.fn((handlerFunction: string) => {
        events.push(`new:${handlerFunction}`);

        const create = vi.fn(() => {
            const trigger = createMockTrigger(handlerFunction, `created-${createdTriggers.length}`);
            createdTriggers.push(trigger);
            events.push(`create:${handlerFunction}`);
            return trigger;
        });

        return {
            timeBased: vi.fn(() => ({
                at: vi.fn((date: Date) => {
                    atDates.push(date);
                    return { create };
                }),
                everyHours: vi.fn(() => ({ create })),
            })),
            forSpreadsheet: vi.fn(() => ({
                onChange: vi.fn(() => ({ create })),
            })),
        };
    }),
};

function createMockTrigger(handlerFunction: string, uniqueId: string): MockTrigger {
    return {
        handlerFunction,
        uniqueId,
        getHandlerFunction: vi.fn(() => handlerFunction),
        getUniqueId: vi.fn(() => uniqueId),
    };
}

describe("trigger setting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createdTriggers.length = 0;
        existingTriggers.length = 0;
        events.length = 0;
        atDates.length = 0;
        (globalThis as unknown as { ScriptApp: unknown }).ScriptApp = scriptApp;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("管理対象を新規作成してから旧handlerを整理し、無関係なtriggerを残す", () => {
        existingTriggers.push(
            createMockTrigger("setDataByDate", "legacy-daily"),
            createMockTrigger("checkCollectedSong", "legacy-hourly"),
            createMockTrigger("onHourlyCheckCollectedSong", "previous-hourly"),
            createMockTrigger("onHourlyRegisterAndUpdateSongs", "previous-sync"),
            createMockTrigger("onChangeData", "legacy-change"),
            createMockTrigger("onDailyStatisticsUpdate", "old-daily"),
            createMockTrigger("unrelatedHandler", "unrelated")
        );

        setupManagedTriggers();

        expect(scriptApp.newTrigger).toHaveBeenNthCalledWith(
            1,
            AUTO_TRIGGER_HANDLERS.daily
        );
        expect(scriptApp.newTrigger).toHaveBeenNthCalledWith(
            2,
            AUTO_TRIGGER_HANDLERS.hourly
        );
        expect(scriptApp.newTrigger).toHaveBeenNthCalledWith(
            3,
            AUTO_TRIGGER_HANDLERS.spreadsheetChange
        );
        expect(scriptApp.deleteTrigger).toHaveBeenCalledTimes(6);
        expect(scriptApp.deleteTrigger).toHaveBeenCalledWith(existingTriggers[0]);
        expect(scriptApp.deleteTrigger).toHaveBeenCalledWith(existingTriggers[1]);
        expect(scriptApp.deleteTrigger).toHaveBeenCalledWith(existingTriggers[2]);
        expect(scriptApp.deleteTrigger).toHaveBeenCalledWith(existingTriggers[3]);
        expect(scriptApp.deleteTrigger).toHaveBeenCalledWith(existingTriggers[4]);
        expect(scriptApp.deleteTrigger).toHaveBeenCalledWith(existingTriggers[5]);
        expect(scriptApp.deleteTrigger).not.toHaveBeenCalledWith(existingTriggers[6]);

        const firstDelete = events.findIndex(event => event.startsWith("delete:"));
        const lastCreate = events.findLastIndex(event => event.startsWith("create:"));
        expect(firstDelete).toBeGreaterThan(lastCreate);
    });

    it("日次再設定は翌日00:00の新規triggerを先に確保する", () => {
        vi.useFakeTimers().setSystemTime(new Date(2026, 7, 10, 12, 34, 56));
        const oldDailyTrigger = createMockTrigger("setDataByDate", "old-daily");
        const unrelatedTrigger = createMockTrigger("unrelatedHandler", "unrelated");
        existingTriggers.push(oldDailyTrigger, unrelatedTrigger);

        scheduleNextDailyTrigger();

        expect(atDates).toHaveLength(1);
        expect(atDates[0]).toEqual(new Date(2026, 7, 11, 0, 0, 0, 0));
        expect(scriptApp.deleteTrigger).toHaveBeenCalledWith(oldDailyTrigger);
        expect(scriptApp.deleteTrigger).not.toHaveBeenCalledWith(unrelatedTrigger);

        const createIndex = events.findIndex(event => event === "create:onDailyTasks");
        const deleteIndex = events.findIndex(event => event === "delete:old-daily");
        expect(createIndex).toBeGreaterThanOrEqual(0);
        expect(deleteIndex).toBeGreaterThan(createIndex);
    });

    it("日次triggerの新規作成に失敗した場合は既存triggerを削除しない", () => {
        const oldDailyTrigger = createMockTrigger("onDailyTasks", "old-daily");
        existingTriggers.push(oldDailyTrigger);
        scriptApp.newTrigger.mockImplementationOnce(() => {
            throw new Error("trigger creation failed");
        });

        expect(() => scheduleNextDailyTrigger()).toThrow("trigger creation failed");

        expect(scriptApp.getProjectTriggers).not.toHaveBeenCalled();
        expect(scriptApp.deleteTrigger).not.toHaveBeenCalled();
        expect(existingTriggers).toEqual([oldDailyTrigger]);
    });
});
