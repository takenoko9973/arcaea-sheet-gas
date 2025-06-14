import { SHEET_BOOK } from "const/sheet";

// シートオブジェクト キャッシュ用
const sheetCache: { [sheetName: string]: GoogleAppsScript.Spreadsheet.Sheet } = {};
const headerCache: { [sheetName: string]: string[] } = {};

/**
 * シート名からシートオブジェクトを取得
 * 2回目以降はキャッシュから高速に返す
 * @param sheetName 取得したいシート名
 */
export function getSheet(sheetName: string): GoogleAppsScript.Spreadsheet.Sheet {
    if (sheetCache[sheetName]) {
        return sheetCache[sheetName];
    }

    console.log("Fetching sheet from book: %s", sheetName); // 初回のみログが出る

    const sheet = SHEET_BOOK.getSheetByName(sheetName)!;
    if (!sheet) {
        throw new Error(`Sheet "${sheetName}" not found.`);
    }

    sheetCache[sheetName] = sheet;
    return sheet;
}

function getSheetHeader(sheetName: string): string[] {
    if (headerCache[sheetName]) {
        return headerCache[sheetName];
    }
    console.log("Reading header from sheet: %s", sheetName);

    const sheet = getSheet(sheetName);
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    headerCache[sheetName] = header;

    return header;
}

export function getColumnIndexByName(sheetName: string, columnName: string): number {
    const header = getSheetHeader(sheetName);
    const index = header.indexOf(columnName);

    if (index === -1) {
        throw new Error(`Column "${columnName}" not found in sheet "${sheetName}".`);
    }

    return index + 1;
}
