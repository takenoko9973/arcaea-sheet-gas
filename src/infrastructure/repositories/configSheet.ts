import {
    CONFIG_SHEET_NAME,
    IGNORE_CONSTANT_CONFIG_CELL,
    SORT_CONSTANT_CONFIG_CELL,
    SORT_DIFFICULTY_CONFIG_CELL,
    SORT_LEVEL_CONFIG_CELL,
    SORT_SONG_NAME_CONFIG_CELL,
    UPDATE_REGISTER_BUTTON_CONFIG_CELL,
} from "@/const";
import { IConfigSheet } from "@/domain/repositories/configSheetImpl";
import { getSheet } from "@/utils/sheetHelper";

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export class ConfigSheet implements IConfigSheet {
    private static singleton: ConfigSheet;

    static get instance() {
        if (!this.singleton) this.singleton = new ConfigSheet(getSheet(CONFIG_SHEET_NAME));

        return this.singleton;
    }

    private constructor(private readonly sheet: Sheet) {}

    getValue(cell: string): string {
        return this.sheet.getRange(cell).getValue();
    }

    sortDifficultyCell(): string {
        return this.getValue(SORT_DIFFICULTY_CONFIG_CELL);
    }

    sortSongNameCell(): string {
        return this.getValue(SORT_SONG_NAME_CONFIG_CELL);
    }

    sortLevelCell(): string {
        return this.getValue(SORT_LEVEL_CONFIG_CELL);
    }

    sortConstantCell(): string {
        return this.getValue(SORT_CONSTANT_CONFIG_CELL);
    }

    updateRegisterButtonCell(): string {
        return this.getValue(UPDATE_REGISTER_BUTTON_CONFIG_CELL);
    }

    ignoreConstantCell(): string {
        return this.getValue(IGNORE_CONSTANT_CONFIG_CELL);
    }
}
