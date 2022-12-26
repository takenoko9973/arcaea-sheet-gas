function onChangeData(e) {
  const sheet = e.source.getActiveSheet();
  const cell = e.source.getActiveRange();

  return;

  const lock = LockService.getScriptLock(); // 二重実行防止
  if (lock.tryLock(1)) {
    Logger.log(Utilities.formatString("Changed %s(%s)", cell.getA1Notation(), sheet.getName()));
    switch (sheet.getName()) {
      case collectSheet.getName(): {
        autoRegist();
        break;
      }
      case songSheet.getName(): {
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
