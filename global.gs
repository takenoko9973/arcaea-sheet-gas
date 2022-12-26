const sheetId = PropertiesService.getScriptProperties().getProperty("sheetId")
const sheetBook = SpreadsheetApp.openById(sheetId);

const collectSheet = sheetBook.getSheetByName("SongCollection");
const songSheet = sheetBook.getSheetByName("SongData");
const manualSheet = sheetBook.getSheetByName("ManualRegister");

const songSheetData = songSheet.getRange(1, 1, songSheet.getLastRow(), songSheet.getRange(1, 1).getNextDataCell(SpreadsheetApp.Direction.NEXT).getColumn()).getValues();
const diffData = collectSheet.getRange(1, 1, collectSheet.getLastRow(), collectSheet.getLastColumn()).getValues();
