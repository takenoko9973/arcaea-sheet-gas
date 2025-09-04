import { MANUAL_REGISTER_SHEET_NAME, SHEET_BOOK } from "@/const";
import { ManualRegisterDto } from "@/domain/dto/manualRegisterDto";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { IManualRegisterRepository } from "@/domain/repositories/manualRegisterRepositoryImpl";
import { extractionJaName, extractionUrlName } from "@/utils/util";

export class ManualRegisterRepository implements IManualRegisterRepository {
    public getEntry(): ManualRegisterDto | null {
        // GSSのシートから直接データを読み込むロジックはここに集約
        const MANUAL_REGISTER_SHEET = SHEET_BOOK.getSheetByName(MANUAL_REGISTER_SHEET_NAME)!;
        const row = MANUAL_REGISTER_SHEET.getDataRange().getValues()[1];

        const [songTitle, nameJpWithUrl, nameEn, difficulty, level, constant] = row.slice(0, 6);

        if (!row || !row[0]) {
            return null;
        }

        return {
            songTitle: songTitle,
            nameJp: extractionJaName(nameJpWithUrl),
            nameEn: nameEn,
            difficulty: difficulty as DifficultyEnum,
            level: level,
            constant: constant,
            urlName: extractionUrlName(nameJpWithUrl),
        };
    }
}
