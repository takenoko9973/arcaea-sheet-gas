import {
    CONFIG_SHEET_NAME,
    IGNORE_CONSTANT_CONFIG_CELL,
    MANUAL_REGISTER_CONFIG_CELL,
    REGISTERED_DIFFICULTIES_CONFIG_CELL,
    SORT_CONSTANT_CONFIG_CELL,
    SORT_DIFFICULTY_CONFIG_CELL,
    SORT_LEVEL_CONFIG_CELL,
    SORT_SONG_NAME_CONFIG_CELL,
    SORT_VERSION_CONFIG_CELL,
    UPDATE_REGISTER_BUTTON_CONFIG_CELL,
} from "@/const";
import {
    DifficultyEnum,
    isDifficultyEnum,
} from "@/domain/models/song/difficulty/difficultyName/difficultyName";
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
        const value: unknown = this.sheet.getRange(cell).getValue();
        return String(value);
    }

    sortVersionCell(): string {
        return this.getValue(SORT_VERSION_CONFIG_CELL);
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

    manualRegisterCell(): string {
        return this.getValue(MANUAL_REGISTER_CONFIG_CELL);
    }

    targetRegisteredDifficulties(): DifficultyEnum[] {
        // [[DifficultyEnum, isRegistered], ...]
        const regDiffConfigs: unknown[][] = this.sheet
            .getRange(REGISTERED_DIFFICULTIES_CONFIG_CELL)
            .getValues();
        const difficulties: DifficultyEnum[] = [];
        for (const [difficulty, isRegistered] of regDiffConfigs) {
            if (!isRegistered) continue;

            if (isDifficultyEnum(difficulty)) {
                difficulties.push(difficulty);
            } else {
                // 不正値はスキップして最小限のログを残す
                console.log("Skip invalid difficulty: %s", difficulty);
            }
        }

        return difficulties;
    }
}
