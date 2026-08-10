import { vi } from "vitest";

import { registerNewSongs, syncSongs, updateRegisteredSongs } from "@/app/checkCollectedSong";
import { createFailureResult, createProcessingResult } from "@/app/collectionProcessing";
import { updateDailyStatistics } from "@/app/dailyStatisticsUpdate";
import { registerFromManualEntry } from "@/app/manualRegister";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { dispatchChangeAction } from "@/trigger/spreadsheetChangeDispatcher";
import { scheduleNextDailyTrigger, setupManagedTriggers } from "@/trigger/triggerSetting";

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

vi.mock("@/app/checkCollectedSong", () => ({
    syncSongs: vi.fn(),
    registerNewSongs: vi.fn(),
    updateRegisteredSongs: vi.fn(),
}));
vi.mock("@/app/dailyStatisticsUpdate", () => ({ updateDailyStatistics: vi.fn() }));
vi.mock("@/app/manualRegister", () => ({ registerFromManualEntry: vi.fn() }));
vi.mock("@/trigger/spreadsheetChangeDispatcher", () => ({
    dispatchChangeAction: vi.fn(),
}));
vi.mock("@/trigger/triggerSetting", () => ({
    scheduleNextDailyTrigger: vi.fn(),
    setupManagedTriggers: vi.fn(),
}));

describe("GAS entry points", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("曲同期処理の結果とfailureを記録する", () => {
        const mockedSyncSongs = vi.mocked(syncSongs);
        mockedSyncSongs.mockReturnValue(
            createFailureResult({
                difficulty: DifficultyEnum.FUTURE,
                operation: "register",
                song: "failed-song",
                name: "失敗曲",
                cause: new Error("Wiki unavailable"),
            })
        );
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const warningSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

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
        const mockedRegisterNewSongs = vi.mocked(registerNewSongs);
        const mockedSyncSongs = vi.mocked(syncSongs);
        const mockedUpdateRegisteredSongs = vi.mocked(updateRegisteredSongs);
        const result = createProcessingResult();
        mockedRegisterNewSongs.mockReturnValue(result);
        mockedSyncSongs.mockReturnValue(result);
        mockedUpdateRegisteredSongs.mockReturnValue(result);

        expect(runNewSongRegistration()).toBe(result);
        expect(runRegisteredSongUpdate()).toBe(result);
        expect(runSongSync()).toBe(result);
        expect(onHourlySongSync()).toBe(result);

        expect(mockedRegisterNewSongs).toHaveBeenCalledTimes(1);
        expect(mockedUpdateRegisteredSongs).toHaveBeenCalledTimes(1);
        expect(mockedSyncSongs).toHaveBeenCalledTimes(2);

        runManualEntryRegistration();
        expect(vi.mocked(registerFromManualEntry)).toHaveBeenCalledTimes(1);
    });

    it("setup入口が管理対象triggerの再構築へ到達する", () => {
        setupTriggers();

        expect(vi.mocked(setupManagedTriggers)).toHaveBeenCalledTimes(1);
    });

    it("手動日次入口は統計更新だけを実行する", () => {
        runDailyStatisticsUpdate();

        expect(vi.mocked(updateDailyStatistics)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(scheduleNextDailyTrigger)).not.toHaveBeenCalled();
    });

    it("日次handlerは次回triggerを確保してから日次処理を実行する", () => {
        const order: string[] = [];
        vi.mocked(scheduleNextDailyTrigger).mockImplementation(() => order.push("schedule"));
        vi.mocked(updateDailyStatistics).mockImplementation(() => order.push("process"));

        onDailyTasks();

        expect(order).toEqual(["schedule", "process"]);
    });

    it("日次処理が失敗しても先に確保した次回triggerを失わない", () => {
        const error = new Error("daily failure");
        vi.mocked(updateDailyStatistics).mockImplementation(() => {
            throw error;
        });

        expect(() => onDailyTasks()).toThrow(error);
        expect(vi.mocked(scheduleNextDailyTrigger)).toHaveBeenCalled();
    });

    it("active rangeがない場合はSpreadsheet dispatcherとLockを呼ばない", () => {
        const getScriptLock = vi.mocked(LockService.getScriptLock);
        getScriptLock.mockClear();
        const event = {
            source: {
                getActiveSheet: vi.fn(),
                getActiveRange: () => null,
            },
        } as unknown as GoogleAppsScript.Events.SheetsOnChange;

        onSpreadsheetChange(event);

        expect(getScriptLock).not.toHaveBeenCalled();
    });

    it("Lock取得に失敗した場合はSpreadsheet dispatcherを呼ばない", () => {
        const lock = {
            tryLock: vi.fn().mockReturnValue(false),
            releaseLock: vi.fn(),
        };
        vi.mocked(LockService.getScriptLock).mockReturnValue(
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
            tryLock: vi.fn().mockReturnValue(true),
            releaseLock: vi.fn(),
        };
        vi.mocked(LockService.getScriptLock).mockReturnValue(
            lock as unknown as GoogleAppsScript.Lock.Lock
        );
        vi.mocked(dispatchChangeAction).mockImplementation(() => {
            throw new Error("trigger failure");
        });
        vi.spyOn(console, "error").mockImplementation(() => {});
        const event = {
            source: {
                getActiveSheet: () => ({ getName: () => "Sheet1" }),
                getActiveRange: () => ({ getA1Notation: () => "A1" }),
            },
        } as unknown as GoogleAppsScript.Events.SheetsOnChange;

        expect(() => onSpreadsheetChange(event)).toThrow("trigger failure");
        expect(lock.releaseLock).toHaveBeenCalledTimes(1);

        vi.restoreAllMocks();
    });
});
