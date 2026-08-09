import { isPersistenceFatalError } from "@/domain/errors/persistenceFatalError";
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
    operation: string;
    shouldSkip: (dto: T) => boolean;
    process: (dto: T) => boolean;
};

export type ProcessingFailure = {
    difficulty: DifficultyEnum;
    operation: string;
    song?: string;
    name?: string;
    cause: unknown;
};

export type ProcessingResult = {
    processed: number;
    changed: number;
    skipped: number;
    failures: ProcessingFailure[];
};

export function createProcessingResult(): ProcessingResult {
    return { processed: 0, changed: 0, skipped: 0, failures: [] };
}

export function createFailureResult(failure: ProcessingFailure): ProcessingResult {
    const result = createProcessingResult();
    result.failures.push(failure);
    return result;
}

export function mergeProcessingResults(...results: ProcessingResult[]): ProcessingResult {
    return results.reduce(
        (merged, result) => ({
            processed: merged.processed + result.processed,
            changed: merged.changed + result.changed,
            skipped: merged.skipped + result.skipped,
            failures: [...merged.failures, ...result.failures],
        }),
        createProcessingResult()
    );
}

// 表示用の名称を安定して取得する
export function getDisplayName(dto: NameSource): string {
    return dto.nameJp || dto.songTitle || "(unknown)";
}

// DTO配列を共通処理し、アイテム単位で回復可能な失敗だけを記録して継続する
export function processCollectionDtos<T extends NameSource>(options: ProcessOptions<T>): ProcessingResult {
    const result = createProcessingResult();

    for (const dto of options.dtos) {
        if (options.shouldSkip(dto)) {
            result.skipped += 1;
            continue;
        }

        const displayName = getDisplayName(dto);
        try {
            const isChanged = options.process(dto);
            result.processed += 1;
            if (isChanged) result.changed += 1;
        } catch (error) {
            if (isPersistenceFatalError(error)) throw error;

            result.failures.push({
                difficulty: options.difficulty,
                operation: options.operation,
                song: dto.songTitle,
                name: displayName,
                cause: error,
            });
        }
    }

    return result;
}

export function describeProcessingFailure(failure: ProcessingFailure): string {
    const cause = failure.cause instanceof Error ? failure.cause.message : String(failure.cause);
    const song = failure.song ? ` song=${failure.song}` : "";
    const name = failure.name ? ` name=${failure.name}` : "";
    return `difficulty=${failure.difficulty} operation=${failure.operation}${song}${name} cause=${cause}`;
}

export function logProcessingResult(operation: string, result: ProcessingResult): void {
    console.log(
        "%s result: processed=%s changed=%s skipped=%s failures=%s",
        operation,
        result.processed,
        result.changed,
        result.skipped,
        result.failures.length
    );
    for (const failure of result.failures) {
        console.warn("Processing failure: %s", describeProcessingFailure(failure));
    }
}
