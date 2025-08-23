import { checkCollectedSong } from "@/app/checkCollectedSong";
import { manualRegister } from "@/app/manualRegister";
import { MANUAL_REGISTER_SHEET_NAME, SHEET_BOOK, SONG_SCORE_SHEET_NAME } from "@/const";
import { SheetCellPair } from "@/domain/sheetCellPair";
import { ConfigSheet } from "@/infrastructure/repositories/configSheet";
import { getColumnIndexByName, getSheet } from "@/utils/sheetHelper";

const configSheet = ConfigSheet.instance;

const triggerList = [
    {
        pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, configSheet.sortDifficultyCell()),
        func: songDifficultySort,
    },
    {
        pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, configSheet.sortSongNameCell()),
        func: songNameSort,
    },
    {
        pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, configSheet.sortLevelCell()),
        func: songLevelSort,
    },
    {
        pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, configSheet.sortConstantCell()),
        func: songConstantSort,
    },
    {
        pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, configSheet.updateRegisterButtonCell()),
        func: checkCollectedSong,
    },
    { pair: new SheetCellPair(MANUAL_REGISTER_SHEET_NAME, "G2"), func: manualRegister },
];

/**
 * 難易度順に並び替え
 */
function songDifficultySort() {
    console.log("Sort by Difficulty");
    const sheet = getSheet(SONG_SCORE_SHEET_NAME)!;
    const filter = sheet.getFilter() || sheet.getDataRange().createFilter();

    const titleCol = getColumnIndexByName(SONG_SCORE_SHEET_NAME, "Song Title (English)");
    const levelCol = getColumnIndexByName(SONG_SCORE_SHEET_NAME, "レベル(ソート用)");
    const diffCol = getColumnIndexByName(SONG_SCORE_SHEET_NAME, "難易度");

    // 取得した列番号を使ってソート
    filter.sort(titleCol, true);
    filter.sort(levelCol, true);
    filter.sort(diffCol, true);
}

/**
 * 曲名順に並び替え
 */
function songNameSort() {
    console.log("Sort by Song Title");
    const sheet = getSheet(SONG_SCORE_SHEET_NAME)!;
    const filter = sheet.getFilter() || sheet.getDataRange().createFilter();

    const titleCol = getColumnIndexByName(SONG_SCORE_SHEET_NAME, "Song Title (English)");
    const diffCol = getColumnIndexByName(SONG_SCORE_SHEET_NAME, "難易度");

    filter.sort(diffCol, true);
    filter.sort(titleCol, true);
}

/**
 * レベル順に並び替え
 */
function songLevelSort() {
    console.log("Sort by Level");
    const sheet = getSheet(SONG_SCORE_SHEET_NAME)!;
    const filter = sheet.getFilter() || sheet.getDataRange().createFilter();

    const titleCol = getColumnIndexByName(SONG_SCORE_SHEET_NAME, "Song Title (English)");
    const levelCol = getColumnIndexByName(SONG_SCORE_SHEET_NAME, "レベル(ソート用)");

    filter.sort(titleCol, true);
    filter.sort(levelCol, true);
}

/**
 * 定数順に並び替え
 */
function songConstantSort() {
    console.log("Sort by Constant");
    const sheet = getSheet(SONG_SCORE_SHEET_NAME)!;
    const filter = sheet.getFilter() || sheet.getDataRange().createFilter();

    const titleCol = getColumnIndexByName(SONG_SCORE_SHEET_NAME, "Song Title (English)");
    const constantCol = getColumnIndexByName(SONG_SCORE_SHEET_NAME, "譜面定数");

    filter.sort(titleCol, true);
    filter.sort(constantCol, true);
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
