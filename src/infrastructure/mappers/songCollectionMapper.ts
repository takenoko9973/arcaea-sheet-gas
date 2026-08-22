import { SongCollectionDto } from "@/domain/dto/songCollectionDto";
import { extractionJaName, extractionUrlName } from "@/utils/util";

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

        const constantText = constantNow !== "" ? constantNow : constantOld;
        const normalizedConstantText = constantText.trim();
        const constant =
            normalizedConstantText === ""
                ? 0
                : normalizedConstantText === "--"
                  ? "--"
                  : Number(normalizedConstantText);
        if (typeof constant === "number" && !Number.isFinite(constant)) {
            throw new Error(`譜面定数を数値として解釈できません (${constantText})`);
        }

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
