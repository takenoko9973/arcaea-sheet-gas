import { PROCESSING_TARGET_DIFFICULTIES } from "@/const";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

import { registerSongData } from "./registerSong";
import { updateData } from "./updateData";

export function checkCollectedSong() {
    autoRegister();
    update();
}

export function autoRegister() {
    console.log("Start auto register");

    for (const difficulty of PROCESSING_TARGET_DIFFICULTIES) {
        registerSongData(difficulty as DifficultyEnum);
    }

    console.log("End auto register");
}

export function update() {
    console.log("Start update");

    for (const difficulty of PROCESSING_TARGET_DIFFICULTIES) {
        updateData(difficulty as DifficultyEnum);
    }

    console.log("End update");
}
