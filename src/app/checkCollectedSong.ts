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

export function syncSongs(): ProcessingResult {
    return mergeProcessingResults(registerNewSongs(), updateRegisteredSongs());
}

export function registerNewSongs(): ProcessingResult {
    console.log("Start register new songs");

    const configSheet = repositories.configSheet();
    const registeredDifficulties = configSheet.targetRegisteredDifficulties();
    const wikiProvider = providers.wiki();
    const result = processDifficulties("register", registeredDifficulties, difficulty =>
        registerSongData(difficulty, wikiProvider)
    );

    console.log("End register new songs");
    return result;
}

export function updateRegisteredSongs(): ProcessingResult {
    console.log("Start update registered songs");

    const configSheet = repositories.configSheet();
    const registeredDifficulties = configSheet.targetRegisteredDifficulties();
    const wikiProvider = providers.wiki();
    const result = processDifficulties("update", registeredDifficulties, difficulty =>
        updateData(difficulty, wikiProvider)
    );

    console.log("End update registered songs");
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

            result = mergeProcessingResults(
                result,
                createFailureResult({ difficulty, operation, cause })
            );
        }
    }

    return result;
}
