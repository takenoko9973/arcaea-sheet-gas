/**
 * Jestのテスト環境でGoogle Apps Scriptのグローバルオブジェクトをモックするためのファイル
 */

// PropertiesServiceのモック
global.PropertiesService = {
    getScriptProperties: jest.fn(() => ({
        getProperty: jest.fn(key => {
            // "sheetId"を要求されたら、テスト用のダミーIDを返す
            if (key === "sheetId") {
                return "test_sheet_id";
            }
            return null;
        }),
        getProperties: jest.fn(() => ({
            sheetId: "test_sheet_id",
        })),
    })),
};

// SpreadsheetAppのモック (テスト内容に応じて詳細化が必要)
global.SpreadsheetApp = {
    openById: jest.fn(id => ({
        getSheetByName: jest.fn(name => ({
            getRange: jest.fn(() => ({
                getValue: jest.fn(),
                getValues: jest.fn(() => [[]]),
                setValue: jest.fn(),
                setValues: jest.fn(),
            })),
            getDataRange: jest.fn(() => ({
                getValues: jest.fn(() => [[]]),
                createFilter: jest.fn(),
            })),
            getFilter: jest.fn(),
            getLastColumn: jest.fn(() => 1),
            getLastRow: jest.fn(() => 1),
            insertRowAfter: jest.fn(),
            insertRowsAfter: jest.fn(),
        })),
    })),
};

// LockServiceのモック
global.LockService = {
    getScriptLock: jest.fn(() => ({
        tryLock: jest.fn().mockReturnValue(true),
        releaseLock: jest.fn(),
    })),
};

// Utilitiesのモック
global.Utilities = {
    formatDate: jest.fn((date, tz, format) => new Date().toISOString()),
    sleep: jest.fn(),
};
