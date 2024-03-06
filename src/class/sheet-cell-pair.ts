/**
 * シート名とセル場所のセット
 * セル場所はA1方式推奨
 */
export class SheetCellPair {
    cell_location: string;
    sheet_name: string;

    constructor(sheet_name: string, cell_location: string) {
        this.sheet_name = sheet_name;
        this.cell_location = cell_location;
    }
}

// シート名が一致しているか
export function equalSheetName(pair1: SheetCellPair, pair2: SheetCellPair) {
    return pair1.sheet_name === pair2.sheet_name;
}

// セルの場所が一致しているか (ただし、片方が空白だった場合は常にtrue)
export function equalCellLocation(pair1: SheetCellPair, pair2: SheetCellPair) {
    if (pair1.cell_location === "") return true;
    if (pair2.cell_location === "") return true;

    return pair1.cell_location === pair2.cell_location;
}

// シート、セルが共に一致しているかどうか (セルが空白の場合はシートのみで判断)
export function equalSheetCellPair(pair1: SheetCellPair, pair2: SheetCellPair) {
    if (!equalSheetName(pair1, pair2)) return false;
    if (!equalCellLocation(pair1, pair2)) return false;

    return true;
}
