import { createFailureResult, createProcessingResult } from "@/app/collectionProcessing";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

import {
    onDailyStatisticsUpdate,
    onHourlyCheckCollectedSong,
    onSpreadsheetChange,
    runAutoRegister,
    runCheckCollectedSong,
    runManualRegister,
    runUpdate,
    setupTriggers,
} from "./main";

jest.mock("@/app/checkCollectedSong", () => ({
    autoRegister: jest.fn(),
    checkCollectedSong: jest.fn(),
    update: jest.fn(),
}));
jest.mock("@/app/dailyStatisticsUpdate", () => ({ updateDailyStatistics: jest.fn() }));
jest.mock("@/app/manualRegister", () => ({ manualRegister: jest.fn() }));
jest.mock("@/trigger/spreadsheetChangeDispatcher", () => ({
    dispatchSpreadsheetChange: jest.fn(),
}));
jest.mock("@/trigger/triggerSetting", () => ({
    scheduleNextDailyTrigger: jest.fn(),
    setupManagedTriggers: jest.fn(),
}));

describe("GAS entry points", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("収集処理の結果とfailureを記録する", () => {
        const app = jest.requireMock("@/app/checkCollectedSong") as {
            checkCollectedSong: jest.Mock;
        };
        app.checkCollectedSong.mockReturnValue(
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

        const result = runCheckCollectedSong();

        expect(result.failures).toHaveLength(1);
        expect(logSpy).toHaveBeenCalled();
        expect(warningSpy).toHaveBeenCalledWith(
            "Processing failure: %s",
            expect.stringContaining("failed-song")
        );

        logSpy.mockRestore();
        warningSpy.mockRestore();
    });

    it("自動処理と手動入口が対応するapp処理へ到達する", () => {
        const app = jest.requireMock("@/app/checkCollectedSong") as {
            autoRegister: jest.Mock;
            checkCollectedSong: jest.Mock;
            update: jest.Mock;
        };
        const result = createProcessingResult();
        app.autoRegister.mockReturnValue(result);
        app.checkCollectedSong.mockReturnValue(result);
        app.update.mockReturnValue(result);

        expect(runAutoRegister()).toBe(result);
        expect(runUpdate()).toBe(result);
        expect(runCheckCollectedSong()).toBe(result);
        expect(onHourlyCheckCollectedSong()).toBe(result);

        expect(app.autoRegister).toHaveBeenCalledTimes(1);
        expect(app.update).toHaveBeenCalledTimes(1);
        expect(app.checkCollectedSong).toHaveBeenCalledTimes(2);

        const manualRegister = jest.requireMock("@/app/manualRegister").manualRegister as jest.Mock;
        runManualRegister();
        expect(manualRegister).toHaveBeenCalledTimes(1);
    });

    it("setup入口が管理対象triggerの再構築へ到達する", () => {
        const triggerSetting = jest.requireMock("@/trigger/triggerSetting") as {
            setupManagedTriggers: jest.Mock;
        };

        setupTriggers();

        expect(triggerSetting.setupManagedTriggers).toHaveBeenCalledTimes(1);
    });

    it("日次handlerは次回triggerを確保してから本処理を実行する", () => {
        const triggerSetting = jest.requireMock("@/trigger/triggerSetting") as {
            scheduleNextDailyTrigger: jest.Mock;
        };
        const dailyStatistics = jest.requireMock("@/app/dailyStatisticsUpdate") as {
            updateDailyStatistics: jest.Mock;
        };
        const order: string[] = [];
        triggerSetting.scheduleNextDailyTrigger.mockImplementation(() => order.push("schedule"));
        dailyStatistics.updateDailyStatistics.mockImplementation(() => order.push("process"));

        onDailyStatisticsUpdate();

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

        expect(() => onDailyStatisticsUpdate()).toThrow(error);
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
            dispatchSpreadsheetChange: jest.Mock;
        };
        jest.mocked(dispatcher.dispatchSpreadsheetChange).mockImplementation(() => {
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
