const SHEET_ID: string = PropertiesService.getScriptProperties().getProperty("sheetId")!;
export const SHEET_BOOK = SpreadsheetApp.openById(SHEET_ID);

export const COLLECT_SHEET_NAME = "SongCollection";
export const SONG_SHEET_NAME = "SongData";
export const POTENTIAL_SHEET_NAME = "Potential";
export const MANUAL_REGISTER_SHEET_NAME = "ManualRegister";
export const SCORE_STATISTICS_SHEET_NAME = "ScoreStatistics";
export const SUM_SCORE_DATE_SHEET_NAME = "DataEachDate";

export const COLLECT_SHEET = SHEET_BOOK.getSheetByName(COLLECT_SHEET_NAME)!;
export const SONG_SHEET = SHEET_BOOK.getSheetByName(SONG_SHEET_NAME)!;
export const POTENTIAL_SHEET = SHEET_BOOK.getSheetByName(POTENTIAL_SHEET_NAME)!;
export const MANUAL_REGISTER_SHEET = SHEET_BOOK.getSheetByName(MANUAL_REGISTER_SHEET_NAME)!;
export const SCORE_STATISTICS_SHEET = SHEET_BOOK.getSheetByName(SCORE_STATISTICS_SHEET_NAME)!;
export const SUM_SCORE_DATE_SHEET = SHEET_BOOK.getSheetByName(SUM_SCORE_DATE_SHEET_NAME)!;

export const SONG_SHEET_DATA = SONG_SHEET.getRange(
    1,
    1,
    SONG_SHEET.getLastRow(),
    SONG_SHEET.getLastColumn()
).getValues();
export const COLLECT_SHEET_DATA = COLLECT_SHEET.getRange(
    1,
    1,
    COLLECT_SHEET.getLastRow(),
    COLLECT_SHEET.getLastColumn()
).getValues();

export const BEST_POTENTIAL_CELL = "O4";
export const SUM_SCORE_INFO_CELL = "J33:K34";
export const GRADE_CELL = "B13:H13";
