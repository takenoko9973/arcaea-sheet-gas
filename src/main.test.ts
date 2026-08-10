import { createFailureResult, createProcessingResult } from "@/app/collectionProcessing";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

import {
    onDailyTasks,
    onHourlySongSync,
    onSpreadsheetChange,
    runDailyStatisticsUpdate,
    runManualEntryRegistration,
    runNewSongRegistration,
    runRegisteredSongUpdate,
    runSongSync,
    setupTriggers,
} from "./main";

jest.mock("@/app/checkCollectedSong", () => ({
    syncSongs: jest.fn(),
    registerNewSongs: jest.fn(),
    updateRegisteredSongs: jest.fn(),
}));
jest.mock("@/app/dailyStatisticsUpdate", () => ({ updateDailyStatistics: jest.fn() }));
jest.mock("@/app/manualRegister", () => ({ registerFromManualEntry: jest.fn() }));
jest.mock("@/trigger/spreadsheetChangeDispatcher", () => ({
    dispatchChangeAction: jest.fn(),
}));
jest.mock("@/trigger/triggerSetting", () => ({
    scheduleNextDailyTrigger: jest.fn(),
    setupManagedTriggers: jest.fn(),
}));

describe("GAS entry points", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("曲同期処理の結果とfailureを記録する", () => {
        const app = jest.requireMock("@/app/checkCollectedSong") as {
            syncSongs: jest.Mock;
        };
        app.syncSongs.mockReturnValue(
            createFailureResult({
                difficulty: DifficultyEnum.FUTURE,
                operation: "register",
                song: "failed-song",
                name: "失敗曲",
                cause: new Error("Wiki unavailable"),
            })
        );
        const logSpy = jest.spyOn(console, "log").mockImplementation();
        const warningSpy = jest.spyOn(console, "warn").mockImplementation();

        const result = runSongSync();

        expect(result.failures).toHaveLength(1);
        expect(logSpy).toHaveBeenCalled();
        expect(warningSpy).toHaveBeenCalledWith(
            "Processing failure: %s",
            expect.stringContaining("failed-song")
        );

        logSpy.mockRestore();
        warningSpy.mockRestore();
    });

    it("登録処理と手動入口が対応するapp処理へ到達する", () => {
        const app = jest.requireMock("@/app/checkCollectedSong") as {
            registerNewSongs: jest.Mock;
            syncSongs: jest.Mock;
            updateRegisteredSongs: jest.Mock;
        };
        const result = createProcessingResult();
        app.registerNewSongs.mockReturnValue(result);
        app.syncSongs.mockReturnValue(result);
        app.updateRegisteredSongs.mockReturnValue(result);

        expect(runNewSongRegistration()).toBe(result);
        expect(runRegisteredSongUpdate()).toBe(result);
        expect(runSongSync()).toBe(result);
        expect(onHourlySongSync()).toBe(result);

        expect(app.registerNewSongs).toHaveBeenCalledTimes(1);
        expect(app.updateRegisteredSongs).toHaveBeenCalledTimes(1);
        expect(app.syncSongs).toHaveBeenCalledTimes(2);

        const registerFromManualEntry = jest.requireMock("@/app/manualRegister")
            .registerFromManualEntry as jest.Mock;
        runManualEntryRegistration();
        expect(registerFromManualEntry).toHaveBeenCalledTimes(1);
    });

    it("setup入口が管理対象triggerの再構築へ到達する", () => {
        const triggerSetting = jest.requireMock("@/trigger/triggerSetting") as {
            setupManagedTriggers: jest.Mock;
        };

        setupTriggers();

        expect(triggerSetting.setupManagedTriggers).toHaveBeenCalledTimes(1);
    });

    it("手動日次入口は統計更新だけを実行する", () => {
        const triggerSetting = jest.requireMock("@/trigger/triggerSetting") as {
            scheduleNextDailyTrigger: jest.Mock;
        };
        const dailyStatistics = jest.requireMock("@/app/dailyStatisticsUpdate") as {
            updateDailyStatistics: jest.Mock;
        };

        runDailyStatisticsUpdate();

        expect(dailyStatistics.updateDailyStatistics).toHaveBeenCalledTimes(1);
        expect(triggerSetting.scheduleNextDailyTrigger).not.toHaveBeenCalled();
    });

    it("日次handlerは次回triggerを確保してから日次処理を実行する", () => {
        const triggerSetting = jest.requireMock("@/trigger/triggerSetting") as {
            scheduleNextDailyTrigger: jest.Mock;
        };
        const dailyStatistics = jest.requireMock("@/app/dailyStatisticsUpdate") as {
            updateDailyStatistics: jest.Mock;
        };
        const order: string[] = [];
        triggerSetting.scheduleNextDailyTrigger.mockImplementation(() => order.push("schedule"));
        dailyStatistics.updateDailyStatistics.mockImplementation(() => order.push("process"));

        onDailyTasks();

        expect(order).toEqual(["schedule", "process"]);
    });

    it("日次処理が失敗しても先に確保した次回triggerを失わない", () => {
        const triggerSetting = jest.requireMock("@/trigger/triggerSetting") as {
            scheduleNextDailyTrigger: jest.Mock;
        };
        const dailyStatistics = jest.requireMock("@/app/dailyStatisticsUpdate") as {
            updateDailyStatistics: jest.Mock;
        };
        const error = new Error("daily failure");
        dailyStatistics.updateDailyStatistics.mockImplementation(() => {
            throw error;
        });

        expect(() => onDailyTasks()).toThrow(error);
        expect(triggerSetting.scheduleNextDailyTrigger).toHaveBeenCalled();
    });

    it("active rangeがない場合はSpreadsheet dispatcherとLockを呼ばない", () => {
        const getScriptLock = jest.mocked(LockService.getScriptLock);
        getScriptLock.mockClear();
        const event = {
            source: {
                getActiveSheet: jest.fn(),
                getActiveRange: () => null,
            },
        } as unknown as GoogleAppsScript.Events.SheetsOnChange;

        onSpreadsheetChange(event);

        expect(getScriptLock).not.toHaveBeenCalled();
    });

    it("Lock取得に失敗した場合はSpreadsheet dispatcherを呼ばない", () => {
        const lock = {
            tryLock: jest.fn().mockReturnValue(false),
            releaseLock: jest.fn(),
        };
        jest.mocked(LockService.getScriptLock).mockReturnValue(
            lock as unknown as GoogleAppsScript.Lock.Lock
        );
        const event = {
            source: {
                getActiveSheet: () => ({ getName: () => "Sheet1" }),
                getActiveRange: () => ({ getA1Notation: () => "A1" }),
            },
        } as unknown as GoogleAppsScript.Events.SheetsOnChange;

        onSpreadsheetChange(event);

        expect(lock.tryLock).toHaveBeenCalledWith(1);
        expect(lock.releaseLock).not.toHaveBeenCalled();
    });

    it("Spreadsheet dispatcherで失敗してもfinallyでLockを解放し、fatalを再送出する", () => {
        const lock = {
            tryLock: jest.fn().mockReturnValue(true),
            releaseLock: jest.fn(),
        };
        jest.mocked(LockService.getScriptLock).mockReturnValue(
            lock as unknown as GoogleAppsScript.Lock.Lock
        );
        const dispatcher = jest.requireMock("@/trigger/spreadsheetChangeDispatcher") as {
            dispatchChangeAction: jest.Mock;
        };
        jest.mocked(dispatcher.dispatchChangeAction).mockImplementation(() => {
            throw new Error("trigger failure");
        });
        jest.spyOn(console, "error").mockImplementation();
        const event = {
            source: {
                getActiveSheet: () => ({ getName: () => "Sheet1" }),
                getActiveRange: () => ({ getA1Notation: () => "A1" }),
            },
        } as unknown as GoogleAppsScript.Events.SheetsOnChange;

        expect(() => onSpreadsheetChange(event)).toThrow("trigger failure");
        expect(lock.releaseLock).toHaveBeenCalledTimes(1);

        jest.restoreAllMocks();
    });
});
