import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

// 表示名生成に必要な最小情報
type NameSource = {
    nameJp?: string;
    songTitle?: string;
};

// DTO配列の共通処理に必要な情報
type ProcessOptions<T extends NameSource> = {
    dtos: T[];
    difficulty: DifficultyEnum;
    shouldSkip: (dto: T) => boolean;
    process: (dto: T) => boolean;
};

// 表示用の名称を安定して取得する
export function getDisplayName(dto: NameSource): string {
    return dto.nameJp || dto.songTitle || "(unknown)";
}

// DTO配列を共通処理し、例外はスキップして継続する
export function processCollectionDtos<T extends NameSource>(options: ProcessOptions<T>): boolean {
    let hasChanges = false;

    for (const dto of options.dtos) {
        if (options.shouldSkip(dto)) continue;

        const displayName = getDisplayName(dto);
        try {
            const isChanged = options.process(dto);
            if (isChanged) hasChanges = true;
        } catch (error) {
            // 例外はログだけ残して次の要素へ進む
            const message = error instanceof Error ? error.message : String(error);
            console.log("Skip %s(%s): %s", displayName, options.difficulty, message);
        }
    }

    return hasChanges;
}
