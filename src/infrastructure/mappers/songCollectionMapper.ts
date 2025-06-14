import { SongCollectionDto } from "domain/dto/songCollectionDto";
import { extractionJaName, extractionUrlName } from "utils/util";

export class SongCollectionMapper {
    static toDto(row: string[], difficulty: string): SongCollectionDto {
        const [
            songTitle,
            nameJpWithUrl,
            nameEn,
            composer,
            side,
            level,
            constantOld,
            constantNow,
            notes,
        ] = row;

        const constant = constantNow !== "" ? constantNow : constantOld;

        return {
            songTitle: songTitle,
            nameJp: extractionJaName(nameJpWithUrl),
            nameEn: nameEn,
            composer: composer,
            side: side,
            difficulty: difficulty,
            level: level,
            constant: constant,
            notes: notes,
            urlName: extractionUrlName(nameJpWithUrl),
        };
    }
}
