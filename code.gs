var spreadsheet = SpreadsheetApp.openById("1fwOqteE3RDcdKQx-BoUutlCvrRImub-ILfKf6JplLOA");
var musicSheet = spreadsheet.getSheetByName("MusicData");
var dataSheet = spreadsheet.getSheetByName("曲情報収集");

function onEditCell(e) {
  var sheet = e.source.getActiveSheet();
  var cell = e.source.getActiveRange();
    
  switch(sheet.getName()) {
    case "MusicData":
      //S4の値が変更された時だけ実行
      if (cell.getColumn() === 19 &&
          cell.getRow() === 4 &&
          cell.getValues) {
        cell.setValue(false);
        musicDataSort();
      }
      break;
  }
}

function musicDataSort(num = 17) {
  musicSheet.getRange('A1').activate();
  musicSheet.getActiveCell().getFilter().sort(num, true);
}
