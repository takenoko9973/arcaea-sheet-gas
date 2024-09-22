import { checkCollectedSong } from "../app/checkCollectedSong";
import { manualRegister } from "../app/manualRegister";
import { SongScoreSheet } from "../class/sheet";
import { SheetCellPair } from "../domain/sheetCellPair";
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
    const pairIndex = triggerList.findIndex(pair => pair["pair"].equal(changedPair));
    if (pairIndex === -1) return;

    // チェックボックスの場合、falseに変更 (チェックされてない場合は終了)
    if (changedPair.cell_location !== "") {
        const changeSheet = SHEET_BOOK.getSheetByName(changedPair.sheet_name)!;
        const cell = changeSheet.getRange(changedPair.cell_location);

        if (cell.getValue() === false) return;
        cell.setValue(false);
    }

    triggerList[pairIndex]["func"]();
}
