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
        case "S4": {
          if (cell.getValue = "TRUE") {
            cell.setValue(false);
            musicDataSort();
          }
          break;
        }
        case "S7": {
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

function musicDataSort(num = 17) {
  musicSheet.getRange('A1').activate();
  musicSheet.getActiveCell().getFilter().sort(num, true);
}

