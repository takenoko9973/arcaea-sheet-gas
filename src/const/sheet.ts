const SHEET_ID: string = PropertiesService.getScriptProperties().getProperty("sheetId")!;
export const SHEET_BOOK = SpreadsheetApp.openById(SHEET_ID);

export const COLLECT_SHEET_NAME = "SongCollection";
export const SONG_SCORE_SHEET_NAME = "SongScore";
export const POTENTIAL_SHEET_NAME = "Potential";
export const MANUAL_REGISTER_SHEET_NAME = "ManualRegister";
export const DAILY_REPOSITORY_SHEET_NAME = "DailyRepository";

export const IGNORE_CONSTANT_CONFIG_CELL = "Y10";

export const MANUAL_REGISTER_SHEET = SHEET_BOOK.getSheetByName(MANUAL_REGISTER_SHEET_NAME)!;
