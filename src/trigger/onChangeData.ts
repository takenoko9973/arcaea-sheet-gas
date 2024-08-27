import { checkCollectedSong } from "../app/checkCollectedSong";
import { manualRegister } from "../app/manualRegister";
import { SongScoreSheet } from "../class/sheet";
import { SheetCellPair, equalSheetCellPair } from "../class/sheetCellPair";
import { MANUAL_REGISTER_SHEET_NAME, SHEET_BOOK, SONG_SCORE_SHEET_NAME } from "../const";

const triggerList = [
    {
        pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, "Y5"),
        func: songDifficultySort,
    },
    {
        pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, "Y6"),
        func: songNameSort,
    },
    {
        pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, "Y7"),
        func: songLevelSort,
    },
    {
        pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, "Y9"),
        func: checkCollectedSong,
    },
    {
        pair: new SheetCellPair(MANUAL_REGISTER_SHEET_NAME, "G2"),
        func: manualRegister,
    },
];

/**
 * 難易度順に並び替え
 */
function songDifficultySort() {
    const songScoreSheet = SongScoreSheet.instance;
    songScoreSheet.sort("Song Title (English)", true);
    songScoreSheet.sort("レベル(ソート用)", true);
    songScoreSheet.sort("難易度", true);
}

/**
 * 曲名順に並び替え
 */
function songNameSort() {
    const songScoreSheet = SongScoreSheet.instance;
    songScoreSheet.sort("Song Title (English)", true);
    songScoreSheet.sort("難易度", true);
}

/**
 * レベル順に並び替え
 */
function songLevelSort() {
    const songScoreSheet = SongScoreSheet.instance;
    songScoreSheet.sort("Song Title (English)", true);
    songScoreSheet.sort("レベル(ソート用)", true);
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
