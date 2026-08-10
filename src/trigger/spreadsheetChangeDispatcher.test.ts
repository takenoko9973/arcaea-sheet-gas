import { SheetCellPair } from "@/domain/sheetCellPair";

import { dispatchChangeAction } from "./spreadsheetChangeDispatcher";

jest.mock("@/app/checkCollectedSong", () => ({
    syncSongs: jest.fn(),
}));
jest.mock("@/app/manualRegister", () => ({
    registerFromManualEntry: jest.fn(),
}));
jest.mock("@/const", () => {
    const mockCell = {
        getValue: jest.fn(),
        setValue: jest.fn(),
    };
    const mockFilter = {
        sort: jest.fn(),
    };
    const mockSheet = {
        getRange: jest.fn(() => mockCell),
        getFilter: jest.fn(() => mockFilter),
        getDataRange: jest.fn(() => ({ createFilter: jest.fn(() => mockFilter) })),
    };
    const mockSheetBook = {
        getSheetByName: jest.fn(() => mockSheet),
    };

    return {
        MANUAL_REGISTER_SHEET_NAME: "ManualRegister",
        SHEET_BOOK: mockSheetBook,
        SONG_SCORE_SHEET_NAME: "SongScore",
        __mockCell: mockCell,
        __mockFilter: mockFilter,
        __mockSheet: mockSheet,
        __mockSheetBook: mockSheetBook,
    };
});
jest.mock("@/infrastructure/repositories/configSheet", () => ({
    ConfigSheet: {
        get instance() {
            return {
                sortVersionCell: jest.fn(() => "A1"),
                sortDifficultyCell: jest.fn(() => "A2"),
                sortSongNameCell: jest.fn(() => "A3"),
                sortLevelCell: jest.fn(() => "A4"),
                sortConstantCell: jest.fn(() => "A5"),
                updateRegisterButtonCell: jest.fn(() => "B1"),
                manualRegisterCell: jest.fn(() => ""),
            };
        },
    },
}));
jest.mock("@/utils/sheetHelper", () => ({
    getColumnIndexByName: jest.fn(() => 1),
    getSheet: jest.fn(() => jest.requireMock("@/const").__mockSheet),
}));

function getMocks() {
    return jest.requireMock("@/const") as {
        __mockCell: {
            getValue: jest.Mock;
            setValue: jest.Mock;
        };
        __mockFilter: {
            sort: jest.Mock;
        };
        __mockSheet: {
            getRange: jest.Mock;
        };
        __mockSheetBook: {
            getSheetByName: jest.Mock;
        };
    };
}

describe("change action dispatcher", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getMocks().__mockCell.getValue.mockReturnValue(true);
    });

    it("各sort routeへ到達し、対象セルをfalseへ戻す", () => {
        const mocks = getMocks();
        for (const cellLocation of ["A1", "A2", "A3", "A4", "A5"]) {
            dispatchChangeAction(new SheetCellPair("SongScore", cellLocation));
        }

        expect(mocks.__mockSheetBook.getSheetByName).toHaveBeenCalledTimes(5);
        expect(mocks.__mockCell.setValue).toHaveBeenCalledTimes(5);
        expect(mocks.__mockCell.setValue).toHaveBeenCalledWith(false);
        expect(mocks.__mockFilter.sort).toHaveBeenCalled();
    });

    it("曲同期routeへ到達する", () => {
        const syncSongs = jest.requireMock("@/app/checkCollectedSong").syncSongs as jest.Mock;
        const mocks = getMocks();

        dispatchChangeAction(new SheetCellPair("SongScore", "B1"));

        expect(syncSongs).toHaveBeenCalledTimes(1);
        expect(mocks.__mockCell.setValue).toHaveBeenCalledWith(false);
    });

    it("manual entry registration routeは空セル番地で同一sheet全体に一致する", () => {
        const registerFromManualEntry = jest.requireMock("@/app/manualRegister")
            .registerFromManualEntry as jest.Mock;
        const mocks = getMocks();

        dispatchChangeAction(new SheetCellPair("ManualRegister", "D5"));

        expect(registerFromManualEntry).toHaveBeenCalledTimes(1);
        expect(mocks.__mockSheet.getRange).toHaveBeenCalledWith("D5");
        expect(mocks.__mockCell.setValue).toHaveBeenCalledWith(false);
    });

    it("対象セルがfalseなら処理せず、非対象変更も無視する", () => {
        const syncSongs = jest.requireMock("@/app/checkCollectedSong").syncSongs as jest.Mock;
        const mocks = getMocks();
        mocks.__mockCell.getValue.mockReturnValue(false);

        dispatchChangeAction(new SheetCellPair("SongScore", "B1"));
        dispatchChangeAction(new SheetCellPair("Potential", "A1"));

        expect(syncSongs).not.toHaveBeenCalled();
        expect(mocks.__mockCell.setValue).not.toHaveBeenCalled();
    });
});
