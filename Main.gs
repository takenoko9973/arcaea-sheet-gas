const sheetId = PropertiesService.getScriptProperties().getProperty("sheetId")
const sheetBook = SpreadsheetApp.openById(sheetId);

const collectSheet = sheetBook.getSheetByName("MusicCollection");
const musicSheet = sheetBook.getSheetByName("MusicData");
const manualSheet = sheetBook.getSheetByName("ManualRegister");

function onChangeData(e) {
  const sheet = e.source.getActiveSheet();
  const cell = e.source.getActiveRange();

  const lock = LockService.getScriptLock(); // 二重実行防止
  if (lock.tryLock(1)) {
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
              musicDataSort_(18);
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
    lock.releaseLock();
  }
}

function musicDataSort_(num) {
  musicSheet.getRange('A1').activate();
  musicSheet.getActiveCell().getFilter().sort(num, true);
}
