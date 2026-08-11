import { MANUAL_REGISTER_SHEET_NAME, SHEET_BOOK } from "@/const";
import { ManualRegisterDto } from "@/domain/dto/manualRegisterDto";
import { isDifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { IManualRegisterRepository } from "@/domain/repositories/manualRegisterRepositoryImpl";
import { extractionJaName, extractionUrlName } from "@/utils/util";

export class ManualRegisterRepository implements IManualRegisterRepository {
    public getEntry(): ManualRegisterDto | null {
        // GSSのシートから直接データを読み込むロジックはここに集約
        const MANUAL_REGISTER_SHEET = SHEET_BOOK.getSheetByName(MANUAL_REGISTER_SHEET_NAME)!;
        const row: unknown[] = MANUAL_REGISTER_SHEET.getDataRange().getValues()[1];

        const [songTitle, nameJpWithUrl, nameEn, rawDifficulty, level, constant] = row
            .slice(0, 6)
            .map(value => String(value));

        if (!row || !row[0]) {
            return null;
        }

        if (!isDifficultyEnum(rawDifficulty)) {
            throw new Error(`無効な難易度です (${rawDifficulty})`);
        }

        return {
            songTitle: songTitle,
            nameJp: extractionJaName(nameJpWithUrl),
            nameEn: nameEn,
            difficulty: rawDifficulty,
            level: level,
            constant: constant,
            urlName: extractionUrlName(nameJpWithUrl),
        };
    }
}
