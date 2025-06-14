import { DifficultyEnum } from "domain/models/song/difficulty/difficultyName/difficultyName";

import { registerSongData } from "./registerSong";
import { updateData } from "./updateData";

export function checkCollectedSong() {
    autoRegister();
    update();
}

const TARGET_DIFFICULTIES = [
    // DifficultyEnum.PAST,
    // DifficultyEnum.PRESENT,
    DifficultyEnum.FUTURE,
    DifficultyEnum.BEYOND,
    DifficultyEnum.ETERNAL,
];

function autoRegister() {
    console.log("Start auto register");

    for (const difficulty of TARGET_DIFFICULTIES) {
        registerSongData(difficulty as DifficultyEnum);
    }

    console.log("End auto register");
}

function update() {
    console.log("Start update");

    for (const difficulty of TARGET_DIFFICULTIES) {
        updateData(difficulty as DifficultyEnum);
    }

    console.log("End update");
}
