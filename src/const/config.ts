import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

/**
 * データ更新や集計の対象難易度
 */
export const PROCESSING_TARGET_DIFFICULTIES: readonly DifficultyEnum[] = [
    // DifficultyEnum.PAST,
    // DifficultyEnum.PRESENT,
    DifficultyEnum.FUTURE,
    DifficultyEnum.BEYOND,
    DifficultyEnum.ETERNAL,
] as const;
