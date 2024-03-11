const SHEET_ID: string = PropertiesService.getScriptProperties().getProperty("sheetId")!;
export const SHEET_BOOK = SpreadsheetApp.openById(SHEET_ID);

export const COLLECT_SHEET_NAME = "SongCollection";
export const SONG_SCORE_SHEET_NAME = "SongScore";
export const POTENTIAL_SHEET_NAME = "Potential";
export const MANUAL_REGISTER_SHEET_NAME = "ManualRegister";
export const SCORE_STATISTICS_SHEET_NAME = "ScoreStatistics";
export const DAILY_REPOSITORY_SHEET_NAME = "DailyRepository";

export const COLLECT_SHEET = SHEET_BOOK.getSheetByName(COLLECT_SHEET_NAME)!;
export const SONG_SHEET = SHEET_BOOK.getSheetByName(SONG_SCORE_SHEET_NAME)!;
export const POTENTIAL_SHEET = SHEET_BOOK.getSheetByName(POTENTIAL_SHEET_NAME)!;
export const MANUAL_REGISTER_SHEET = SHEET_BOOK.getSheetByName(MANUAL_REGISTER_SHEET_NAME)!;
export const SCORE_STATISTICS_SHEET = SHEET_BOOK.getSheetByName(SCORE_STATISTICS_SHEET_NAME)!;

export const SONG_SHEET_DATA = SONG_SHEET.getDataRange().getValues();
export const COLLECT_SHEET_DATA = COLLECT_SHEET.getDataRange().getValues();

export const BEST_POTENTIAL_CELL = "O4";
export const SUM_SCORE_INFO_CELL = "J33:K35";
export const GRADE_CELL = "B13:H13";
