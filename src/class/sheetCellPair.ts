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

    // シート名が一致しているか
    equalSheetName(pair: SheetCellPair) {
        return this.sheet_name === pair.sheet_name;
    }

    // セルの場所が一致しているか (ただし、片方が空白だった場合は常にtrue)
    equalCellLocation(pair: SheetCellPair) {
        if (this.cell_location === "") return true;
        if (pair.cell_location === "") return true;

        return this.cell_location === pair.cell_location;
    }

    // シート、セルが共に一致しているかどうか (セルが空白の場合はシートのみで判断)
    equal(pair: SheetCellPair) {
        if (!this.equalSheetName(pair)) return false;
        if (!this.equalCellLocation(pair)) return false;

        return true;
    }
}
