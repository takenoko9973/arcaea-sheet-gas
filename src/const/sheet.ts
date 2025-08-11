const SHEET_ID: string = PropertiesService.getScriptProperties().getProperty("sheetId")!;
export const SHEET_BOOK = SpreadsheetApp.openById(SHEET_ID);

export const COLLECT_SHEET_NAME = "SongCollection";
export const SONG_SCORE_SHEET_NAME = "SongScore";
export const POTENTIAL_SHEET_NAME = "Potential";
export const MANUAL_REGISTER_SHEET_NAME = "ManualRegister";
export const CONFIG_SHEET_NAME = "Config";
export const DAILY_REPOSITORY_SHEET_NAME = "DailyRepository";

export const SORT_DIFFICULTY_CONFIG_CELL = "B2";
export const SORT_SONG_NAME_CONFIG_CELL = "B3";
export const SORT_LEVEL_CONFIG_CELL = "B4";
export const SORT_CONSTANT_CONFIG_CELL = "B5";
export const UPDATE_REGISTER_BUTTON_CONFIG_CELL = "E2";
export const IGNORE_CONSTANT_CONFIG_CELL = "E3";
