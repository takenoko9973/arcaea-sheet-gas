/**
 * シート名とセル場所のセット
 * セル場所はA1方式推奨
 */
class SheetCellPair {
  constructor(sheet_name, cell_location) {
    this.sheet_name = sheet_name;
    this.cell_location = cell_location;
  }
}

// シート名が一致しているか
function equalSheetName(pair1, pair2) {
  return pair1.sheet_name === pair2.sheet_name;
}

// セルの場所が一致しているか (ただし、片方が空白だった場合は常にtrue)
function equalCellLocation(pair1, pair2) {
  if (pair1.cell_location === "") return true;
  if (pair2.cell_location === "") return true;

  return pair1.cell_location === pair2.cell_location;
}

// シート、セルが共に一致しているかどうか (セルが空白の場合はシートのみで判断)
function equalSheetCellPair(pair1, pair2) {
  if (!equalSheetName(pair1, pair2)) return false;
  if (!equalCellLocation(pair1, pair2)) return false;

  return true;
}