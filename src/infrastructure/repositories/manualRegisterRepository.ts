import { MANUAL_REGISTER_SHEET_NAME, SHEET_BOOK } from "const";
import { ManualRegisterDto } from "domain/dto/manualRegisterDto";
import { DifficultyEnum } from "domain/models/song/difficulty/difficultyName/difficultyName";
import { IManualRegisterRepository } from "domain/repositories/manualRegisterRepositoryImpl";
import { changeCodeToString, extractionJaName, extractionUrlName, toHalfWidth } from "utils/util";

export class ManualRegisterRepository implements IManualRegisterRepository {
    public getEntry(): ManualRegisterDto | null {
        // GSSのシートから直接データを読み込むロジックはここに集約
        const MANUAL_REGISTER_SHEET = SHEET_BOOK.getSheetByName(MANUAL_REGISTER_SHEET_NAME)!;
        const row = MANUAL_REGISTER_SHEET.getDataRange().getValues()[1];
        if (!row || !row[0]) {
            return null;
        }

        const nameCell = toHalfWidth(row[0]);

        return {
            nameJp: changeCodeToString(extractionJaName(nameCell)),
            songTitle: row[1],
            difficulty: row[2] as DifficultyEnum,
            level: row[3],
            constant: row[4],
            urlName: extractionUrlName(nameCell),
        };
    }
}
