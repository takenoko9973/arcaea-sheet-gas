function songDifficultySort(num) {
  const col = SONG_SHEET_DATA[0].indexOf("並び替え用") + 1;
  SONG_SHEET.getRange('A1').activate();
  SONG_SHEET.getActiveCell().getFilter().sort(col, true);
}

function runTrigger(changedPair) {
  const triggerList = [
    [new SheetCellPair(SONG_SHEET_NAME, "V5"), songDifficultySort],
    [new SheetCellPair(SONG_SHEET_NAME, "V8"), autoRegist],
    [new SheetCellPair(MANUAL_REGIST_SHEET_NAME, "I2"), manualRegist],
  ]
  const pairIndex = triggerList.findIndex(pair => equalSheetCellPair(pair[0], changedPair));
  if (pairIndex == -1) return;

  try {
    if (triggerList[pairIndex][0].cell_location == "") {
      triggerList[pairIndex][1]();
    } else {
      const changeSheet = SHEET_BOOK.getSheetByName(triggerList[pairIndex][0].sheet_name);
      const cell = changeSheet.getRange(triggerList[pairIndex][0].cell_location);

      if (cell.getValue() === true) {
        cell.setValue(false);
        triggerList[pairIndex][1]();
      }
    }
  } catch (e) {
    console.error(e.message);
  }
}

function onChangeData(e) {
  const sheet = e.source.getActiveSheet();
  const cell = e.source.getActiveRange();

  const lock = LockService.getScriptLock(); // 二重実行防止
  if (!lock.tryLock(1)) return;

  const changedPair = new SheetCellPair(sheet.getName(), cell.getA1Notation());
  console.log(Utilities.formatString("Changed %s(%s)", changedPair.cell_location, changedPair.sheet_name));

  runTrigger(changedPair);

  lock.releaseLock();
}
