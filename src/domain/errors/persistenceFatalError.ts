/**
 * シートの復元・初期化・書き込みに失敗したことを示す。
 * これらは次の曲や難易度で回復できないため、収集処理の継続対象にはしない。
 */
export class PersistenceFatalError extends Error {
    readonly cause: unknown;

    constructor(
        readonly operation: string,
        cause: unknown
    ) {
        super(`${operation}に失敗しました: ${describeError(cause)}`);
        this.name = "PersistenceFatalError";
        this.cause = cause;
    }
}

export function isPersistenceFatalError(error: unknown): error is PersistenceFatalError {
    return error instanceof PersistenceFatalError;
}

export function asPersistenceFatalError(operation: string, error: unknown): PersistenceFatalError {
    return isPersistenceFatalError(error) ? error : new PersistenceFatalError(operation, error);
}

function describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
