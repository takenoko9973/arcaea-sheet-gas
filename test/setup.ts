/**
 * Vitestのテスト環境でGoogle Apps Scriptのグローバルオブジェクトをモックする。
 */
import { vi } from "vitest";

const gasGlobals = globalThis as unknown as Record<string, unknown>;

gasGlobals.PropertiesService = {
    getScriptProperties: vi.fn(() => ({
        getProperty: vi.fn((key: string) => {
            if (key === "sheetId") {
                return "test_sheet_id";
            }
            return null;
        }),
        getProperties: vi.fn(() => ({
            sheetId: "test_sheet_id",
        })),
    })),
};

gasGlobals.SpreadsheetApp = {
    openById: vi.fn(() => ({
        getSheetByName: vi.fn(() => ({
            getRange: vi.fn(() => ({
                getValue: vi.fn(),
                getValues: vi.fn(() => [[]]),
                setValue: vi.fn(),
                setValues: vi.fn(),
            })),
            getDataRange: vi.fn(() => ({
                getValues: vi.fn(() => [[]]),
                createFilter: vi.fn(),
            })),
            getFilter: vi.fn(),
            getLastColumn: vi.fn(() => 1),
            getLastRow: vi.fn(() => 1),
            insertRowAfter: vi.fn(),
            insertRowsAfter: vi.fn(),
        })),
    })),
};

gasGlobals.LockService = {
    getScriptLock: vi.fn(() => ({
        tryLock: vi.fn().mockReturnValue(true),
        releaseLock: vi.fn(),
    })),
};

gasGlobals.Utilities = {
    formatDate: vi.fn(() => new Date().toISOString()),
    sleep: vi.fn(),
};
