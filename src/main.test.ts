import { createFailureResult } from "@/app/collectionProcessing";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { runTrigger } from "@/trigger/onChangeData";

import { checkCollectedSong, onChangeData } from "./main";

jest.mock("@/app/checkCollectedSong", () => ({
    autoRegister: jest.fn(),
    checkCollectedSong: jest.fn(),
    update: jest.fn(),
}));
jest.mock("@/trigger/onChangeData", () => ({ runTrigger: jest.fn() }));

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

        const result = checkCollectedSong();

        expect(result.failures).toHaveLength(1);
        expect(logSpy).toHaveBeenCalled();
        expect(warningSpy).toHaveBeenCalledWith(
            "Processing failure: %s",
            expect.stringContaining("failed-song")
        );
    });

    it("onChangeDataで失敗してもfinallyでLockを解放し、fatalを再送出する", () => {
        const lock = {
            tryLock: jest.fn().mockReturnValue(true),
            releaseLock: jest.fn(),
        };
        jest.mocked(LockService.getScriptLock).mockReturnValue(
            lock as unknown as GoogleAppsScript.Lock.Lock
        );
        jest.mocked(runTrigger).mockImplementation(() => {
            throw new Error("trigger failure");
        });
        jest.spyOn(console, "error").mockImplementation();
        const event = {
            source: {
                getActiveSheet: () => ({ getName: () => "Sheet1" }),
                getActiveRange: () => ({ getA1Notation: () => "A1" }),
            },
        } as unknown as GoogleAppsScript.Events.SheetsOnChange;

        expect(() => onChangeData(event)).toThrow("trigger failure");
        expect(lock.releaseLock).toHaveBeenCalledTimes(1);
    });
});
