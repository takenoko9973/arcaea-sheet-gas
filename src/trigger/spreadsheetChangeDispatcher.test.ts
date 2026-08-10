import { vi } from "vitest";

import { syncSongs } from "@/app/checkCollectedSong";
import { registerFromManualEntry } from "@/app/manualRegister";
import { SheetCellPair } from "@/domain/sheetCellPair";

import { dispatchChangeAction } from "./spreadsheetChangeDispatcher";

const mocks = vi.hoisted(() => {
    const mockCell = {
        getValue: vi.fn(),
        setValue: vi.fn(),
    };
    const mockFilter = {
        sort: vi.fn(),
    };
    const mockSheet = {
        getRange: vi.fn(() => mockCell),
        getFilter: vi.fn(() => mockFilter),
        getDataRange: vi.fn(() => ({ createFilter: vi.fn(() => mockFilter) })),
    };
    const mockSheetBook = {
        getSheetByName: vi.fn(() => mockSheet),
    };

    return {
        mockCell,
        mockFilter,
        mockSheet,
        mockSheetBook,
    };
});
vi.mock("@/app/checkCollectedSong", () => ({
    syncSongs: vi.fn(),
}));
vi.mock("@/app/manualRegister", () => ({
    registerFromManualEntry: vi.fn(),
}));
vi.mock("@/const", () => ({
    MANUAL_REGISTER_SHEET_NAME: "ManualRegister",
    SHEET_BOOK: mocks.mockSheetBook,
    SONG_SCORE_SHEET_NAME: "SongScore",
    __mockCell: mocks.mockCell,
    __mockFilter: mocks.mockFilter,
    __mockSheet: mocks.mockSheet,
    __mockSheetBook: mocks.mockSheetBook,
}));
vi.mock("@/infrastructure/repositories/configSheet", () => ({
    ConfigSheet: {
        get instance() {
            return {
                sortVersionCell: vi.fn(() => "A1"),
                sortDifficultyCell: vi.fn(() => "A2"),
                sortSongNameCell: vi.fn(() => "A3"),
                sortLevelCell: vi.fn(() => "A4"),
                sortConstantCell: vi.fn(() => "A5"),
                updateRegisterButtonCell: vi.fn(() => "B1"),
                manualRegisterCell: vi.fn(() => ""),
            };
        },
    },
}));
vi.mock("@/utils/sheetHelper", () => ({
    getColumnIndexByName: vi.fn(() => 1),
    getSheet: vi.fn(() => mocks.mockSheet),
}));

function getMocks() {
    return mocks;
}

describe("change action dispatcher", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getMocks().mockCell.getValue.mockReturnValue(true);
    });

    it("各sort routeへ到達し、対象セルをfalseへ戻す", () => {
        const mocks = getMocks();
        for (const cellLocation of ["A1", "A2", "A3", "A4", "A5"]) {
            dispatchChangeAction(new SheetCellPair("SongScore", cellLocation));
        }

        expect(mocks.mockSheetBook.getSheetByName).toHaveBeenCalledTimes(5);
        expect(mocks.mockCell.setValue).toHaveBeenCalledTimes(5);
        expect(mocks.mockCell.setValue).toHaveBeenCalledWith(false);
        expect(mocks.mockFilter.sort).toHaveBeenCalled();
    });

    it("曲同期routeへ到達する", () => {
        const mockedSyncSongs = vi.mocked(syncSongs);
        const mocks = getMocks();

        dispatchChangeAction(new SheetCellPair("SongScore", "B1"));

        expect(mockedSyncSongs).toHaveBeenCalledTimes(1);
        expect(mocks.mockCell.setValue).toHaveBeenCalledWith(false);
    });

    it("manual entry registration routeは空セル番地で同一sheet全体に一致する", () => {
        const mockedRegisterFromManualEntry = vi.mocked(registerFromManualEntry);
        const mocks = getMocks();

        dispatchChangeAction(new SheetCellPair("ManualRegister", "D5"));

        expect(mockedRegisterFromManualEntry).toHaveBeenCalledTimes(1);
        expect(mocks.mockSheet.getRange).toHaveBeenCalledWith("D5");
        expect(mocks.mockCell.setValue).toHaveBeenCalledWith(false);
    });

    it("対象セルがfalseなら処理せず、非対象変更も無視する", () => {
        const mockedSyncSongs = vi.mocked(syncSongs);
        const mocks = getMocks();
        mocks.mockCell.getValue.mockReturnValue(false);

        dispatchChangeAction(new SheetCellPair("SongScore", "B1"));
        dispatchChangeAction(new SheetCellPair("Potential", "A1"));

        expect(mockedSyncSongs).not.toHaveBeenCalled();
        expect(mocks.mockCell.setValue).not.toHaveBeenCalled();
    });
});
