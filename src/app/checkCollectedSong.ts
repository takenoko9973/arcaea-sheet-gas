import {
    createFailureResult,
    createProcessingResult,
    mergeProcessingResults,
    ProcessingResult,
} from "@/app/collectionProcessing";
import { providers, repositories } from "@/app/dependencies";
import { isPersistenceFatalError } from "@/domain/errors/persistenceFatalError";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

import { registerSongData } from "./registerSong";
import { updateData } from "./updateData";

export function checkCollectedSong(): ProcessingResult {
    return mergeProcessingResults(autoRegister(), update());
}

export function autoRegister(): ProcessingResult {
    console.log("Start auto register");

    // Configシートの設定に従って対象難易度を取得
    const configSheet = repositories.configSheet();
    const registeredDifficulties = configSheet.targetRegisteredDifficulties();
    const wikiProvider = providers.wiki();
    const result = processDifficulties("register", registeredDifficulties, difficulty =>
        registerSongData(difficulty, wikiProvider)
    );

    console.log("End auto register");
    return result;
}

export function update(): ProcessingResult {
    console.log("Start update");

    // Configシートの設定に従って対象難易度を取得
    const configSheet = repositories.configSheet();
    const registeredDifficulties = configSheet.targetRegisteredDifficulties();
    const result = processDifficulties("update", registeredDifficulties, updateData);

    console.log("End update");
    return result;
}

function processDifficulties(
    operation: string,
    difficulties: DifficultyEnum[],
    process: (difficulty: DifficultyEnum) => ProcessingResult
): ProcessingResult {
    let result = createProcessingResult();

    for (const difficulty of difficulties) {
        try {
            result = mergeProcessingResults(result, process(difficulty));
        } catch (cause) {
            if (isPersistenceFatalError(cause)) throw cause;

            // 難易度境界での失敗は、次の難易度を処理して診断情報を残す。
            result = mergeProcessingResults(
                result,
                createFailureResult({ difficulty, operation, cause })
            );
        }
    }

    return result;
}
