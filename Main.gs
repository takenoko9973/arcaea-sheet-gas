const sheetId = PropertiesService.getScriptProperties().getProperty("sheetId")
const sheetBook = SpreadsheetApp.openById(sheetId);

var collectSheet = sheetBook.getSheetByName("MusicCollection");
var musicSheet = sheetBook.getSheetByName("MusicData");
var manualSheet = sheetBook.getSheetByName("ManualRegister");

function onChangeData(e) {
  var sheet = e.source.getActiveSheet();
  var cell = e.source.getActiveRange();

  Logger.log(Utilities.formatString("Changed %s(%s)", cell.getA1Notation(), sheet.getName()));
  switch (sheet.getName()) {
    case collectSheet.getName(): {
      autoRegist();
      break;
    }
    case musicSheet.getName(): {
      switch (cell.getA1Notation()) {
        case "T5": {
          if (cell.getValue() === true) {
            cell.setValue(false);
            musicDataSort(18);
          }
          break;
        }
        case "T8": {
          if (cell.getValue() === true) {
            cell.setValue(false);
            autoRegist();
          }
          break;
        }
      }
      break;
    }
    case manualSheet.getName(): {
      switch (cell.getA1Notation()) {
        case "I2":
          if (cell.getValue() === true) {
            cell.setValue(false);
            manualRegist();
          }
          break;
      }
      break;
    }
  }
}

function musicDataSort(num) {
  musicSheet.getRange('A1').activate();
  musicSheet.getActiveCell().getFilter().sort(num, true);
}
