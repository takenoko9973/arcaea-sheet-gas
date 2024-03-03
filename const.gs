const SHEET_ID = PropertiesService.getScriptProperties().getProperty("sheetId")
const SHEET_BOOK = SpreadsheetApp.openById(SHEET_ID);

const COLLECT_SHEET_NAME = "SongCollection";
const SONG_SHEET_NAME = "SongData";
const POTENTIAL_SHEET_NAME = "Potential";
const MANUAL_REGIST_SHEET_NAME = "ManualRegister";
const SCORE_STATISTICS_SHEET_NAME = "ScoreStatistics";
const SUM_SCORE_DATE_SHEET_NAME = "DataEachDate";

const COLLECT_SHEET = SHEET_BOOK.getSheetByName(COLLECT_SHEET_NAME);
const SONG_SHEET = SHEET_BOOK.getSheetByName(SONG_SHEET_NAME);
const POTENTIAL_SHEET = SHEET_BOOK.getSheetByName(POTENTIAL_SHEET_NAME);
const MANUAL_REGIST_SHEET = SHEET_BOOK.getSheetByName(MANUAL_REGIST_SHEET_NAME);
const SCORE_STATISTICS_SHEET = SHEET_BOOK.getSheetByName(SCORE_STATISTICS_SHEET_NAME);
const SUM_SCORE_DATE_SHEET = SHEET_BOOK.getSheetByName(SUM_SCORE_DATE_SHEET_NAME);

const SONG_SHEET_DATA = SONG_SHEET.getRange(1, 1, SONG_SHEET.getLastRow(), SONG_SHEET.getLastColumn()).getValues();
const COLLECT_SHEET_DATA = COLLECT_SHEET.getRange(1, 1, COLLECT_SHEET.getLastRow(), COLLECT_SHEET.getLastColumn()).getValues();

const BEST_POTENTIAL_CELL = "O4";
const SUM_SCORE_INFO_CELL = "J33:K34";
const GRADE_CELL = "B13:H13";
