import { checkCollectedSong } from "../app/checkCollectedSong";
import { manualRegister } from "../app/manualRegister";
import { SheetCellPair, equalSheetCellPair } from "../class/sheetCellPair";
import {
    MANUAL_REGISTER_SHEET_NAME,
    SHEET_BOOK,
    SONG_SHEET,
    SONG_SHEET_DATA,
    SONG_SCORE_SHEET_NAME,
} from "../const";

const triggerList = [
    {
        pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, "AA5"),
        func: songDifficultySort,
    },
    {
        pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, "AA6"),
        func: songNameSort,
    },
    {
        pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, "AA8"),
        func: checkCollectedSong,
    },
    {
        pair: new SheetCellPair(MANUAL_REGISTER_SHEET_NAME, "G2"),
        func: manualRegister,
    },
];

function songDifficultySort() {
    const col = SONG_SHEET_DATA[0].indexOf("並び替え用(難易度順)") + 1;
    SONG_SHEET.getRange("A1").activate();
    SONG_SHEET.getActiveCell().getFilter()?.sort(col, true);
}

function songNameSort() {
    const col = SONG_SHEET_DATA[0].indexOf("並び替え用(曲名順)") + 1;
    SONG_SHEET.getRange("A1").activate();
    SONG_SHEET.getActiveCell().getFilter()?.sort(col, true);
}

export function runTrigger(changedPair: SheetCellPair) {
    const pairIndex = triggerList.findIndex(pair => equalSheetCellPair(pair["pair"], changedPair));
    if (pairIndex === -1) return;

    if (triggerList[pairIndex]["pair"].cell_location === "") {
        triggerList[pairIndex]["func"]();
    } else {
        const changeSheet = SHEET_BOOK.getSheetByName(triggerList[pairIndex]["pair"].sheet_name)!;
        const cell = changeSheet.getRange(triggerList[pairIndex]["pair"].cell_location);

        if (cell.getValue() === true) {
            cell.setValue(false);
            triggerList[pairIndex]["func"]();
        }
    }
}
