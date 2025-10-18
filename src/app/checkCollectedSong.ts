import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { ConfigSheet } from "@/infrastructure/repositories/configSheet";

import { registerSongData } from "./registerSong";
import { updateData } from "./updateData";

export function checkCollectedSong() {
    autoRegister();
    update();
}

export function autoRegister() {
    console.log("Start auto register");

    const configSheet = ConfigSheet.instance;
    const registeredDifficulties = configSheet.targetRegisteredDifficulties();
    for (const difficulty of registeredDifficulties) {
        registerSongData(difficulty as DifficultyEnum);
    }

    console.log("End auto register");
}

export function update() {
    console.log("Start update");

    const configSheet = ConfigSheet.instance;
    const registeredDifficulties = configSheet.targetRegisteredDifficulties();
    for (const difficulty of registeredDifficulties) {
        updateData(difficulty as DifficultyEnum);
    }

    console.log("End update");
}
