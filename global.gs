const SHEET_ID = PropertiesService.getScriptProperties().getProperty("sheetId")
const SHEET_BOOK = SpreadsheetApp.openById(SHEET_ID);

const COLLECT_SHEET_NAME = "SongCollection";
const SONG_SHEET_NAME = "SongData";
const MANUAL_REGIST_SHEET_NAME = "ManualRegister";

const COLLECT_SHEET = SHEET_BOOK.getSheetByName(COLLECT_SHEET_NAME);
const SONG_SHEET = SHEET_BOOK.getSheetByName(SONG_SHEET_NAME);
const MANUAL_REGIST_SHEET = SHEET_BOOK.getSheetByName(MANUAL_REGIST_SHEET_NAME);

const SONG_SHEET_DATA = SONG_SHEET.getRange(1, 1, SONG_SHEET.getLastRow(), SONG_SHEET.getLastColumn()).getValues();
const COLLECT_SHEET_DATA = COLLECT_SHEET.getRange(1, 1, COLLECT_SHEET.getLastRow(), COLLECT_SHEET.getLastColumn()).getValues();
