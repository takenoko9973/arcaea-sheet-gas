var spreadsheet = SpreadsheetApp.openById("1fwOqteE3RDcdKQx-BoUutlCvrRImub-ILfKf6JplLOA");
var dataSheet = spreadsheet.getSheetByName("musicColl");
var musicSheet = spreadsheet.getSheetByName("MusicData");
var manualSheet = spreadsheet.getSheetByName("ManualRegister");

function onChangeData(e) {
  var sheet = e.source.getActiveSheet();
  var cell = e.source.getActiveRange();

  Logger.log(Utilities.formatString("Changed %s(%s)", cell.getA1Notation(), sheet.getName()));
  switch (sheet.getName()) {
    case dataSheet.getName(): {
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
