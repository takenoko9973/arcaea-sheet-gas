import { getConfigSheet } from "@/app/dependencies";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

import { registerSongData } from "./registerSong";
import { updateData } from "./updateData";

export function checkCollectedSong() {
    autoRegister();
    update();
}

export function autoRegister() {
    console.log("Start auto register");

    const configSheet = getConfigSheet();
    const registeredDifficulties = configSheet.targetRegisteredDifficulties();
    for (const difficulty of registeredDifficulties) {
        registerSongData(difficulty as DifficultyEnum);
    }

    console.log("End auto register");
}

export function update() {
    console.log("Start update");

    const configSheet = getConfigSheet();
    const registeredDifficulties = configSheet.targetRegisteredDifficulties();
    for (const difficulty of registeredDifficulties) {
        updateData(difficulty as DifficultyEnum);
    }

    console.log("End update");
}
