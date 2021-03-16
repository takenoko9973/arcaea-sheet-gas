var spreadsheet = SpreadsheetApp.openById("1fwOqteE3RDcdKQx-BoUutlCvrRImub-ILfKf6JplLOA");
var musicSheet = spreadsheet.getSheetByName("MusicData");
var dataSheet = spreadsheet.getSheetByName("曲情報収集");

function onEditCell(e) {
  var sheet = e.source.getActiveSheet();
  var cell = e.source.getActiveRange();

  switch(sheet.getName()) {
    case "MusicData":
      Logger.log("Changed "+ cell.getA1Notation() + "(" + sheet.getName() + ")");

      switch(cell.getA1Notation()) {
        case "T4": {
          if (cell.getValue = "TRUE") {
            cell.setValue(false);
            musicDataSort(18);
          }
          break;
        }
        case "T7": {
          if (cell.getValue = "TRUE") {
            cell.setValue(false);
            registMusic();
          }
          break;
        }
      }
      break;
  }
}

function onChangeData(e) {
  var sheet = e.source.getActiveSheet();

  Logger.log("Changed " + sheet.getName());
  switch(sheet.getName()) {
    case "曲情報収集":
      registMusic();
      break;
  }
}

function musicDataSort(num) {
  musicSheet.getRange('A1').activate();
  musicSheet.getActiveCell().getFilter().sort(num, true);
}
