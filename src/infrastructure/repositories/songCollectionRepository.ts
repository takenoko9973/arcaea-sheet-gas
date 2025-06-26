import { COLLECT_SHEET_NAME } from "const";
import { SongCollectionDto } from "domain/dto/songCollectionDto";
import { DifficultyEnum } from "domain/models/song/difficulty/difficultyName/difficultyName";
import { ISongCollectionRepository } from "domain/repositories/songCollectionRepositoryImpl";
import { SongCollectionMapper } from "infrastructure/mappers/songCollectionMapper";
import { getSheet } from "utils/sheetHelper";

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export class SongCollectionRepository implements ISongCollectionRepository {
    private static singleton: SongCollectionRepository;

    private collectedSongData: { [index in DifficultyEnum]: SongCollectionDto[] };

    static get instance() {
        if (!this.singleton)
            this.singleton = new SongCollectionRepository(getSheet(COLLECT_SHEET_NAME));

        return this.singleton;
    }

    private constructor(sheet: Sheet) {
        this.collectedSongData = this.loadAll(sheet);
    }

    private loadAll(sheet: Sheet): { [index in DifficultyEnum]: SongCollectionDto[] } {
        const values = sheet.getDataRange().getValues();
        const header = values.shift()!; // ヘッダー行を取得して削除

        const data: { [index in DifficultyEnum]: SongCollectionDto[] } = {
            PST: [],
            PRS: [],
            FTR: [],
            BYD: [],
            ETR: [],
        };

        for (const difficulty of Object.values(DifficultyEnum)) {
            const diffColIndex = header.indexOf(difficulty);
            if (diffColIndex === -1) continue;

            data[difficulty as DifficultyEnum] = values
                .map(row => row.slice(diffColIndex + 1, diffColIndex + 10))
                .map(item => SongCollectionMapper.toDto(item, difficulty))
                .filter(dto => dto.songTitle !== "");
        }
        return data;
    }

    public fetchByDifficulty(difficulty: DifficultyEnum): SongCollectionDto[] {
        return this.collectedSongData[difficulty];
    }
}
