import { repositories } from "@/app/dependencies";

import { registerSongData } from "./registerSong";
import { updateData } from "./updateData";

export function checkCollectedSong() {
    autoRegister();
    update();
}

export function autoRegister() {
    console.log("Start auto register");

    // Configシートの設定に従って対象難易度を取得
    const configSheet = repositories.configSheet();
    const registeredDifficulties = configSheet.targetRegisteredDifficulties();
    for (const difficulty of registeredDifficulties) {
        registerSongData(difficulty);
    }

    console.log("End auto register");
}

export function update() {
    console.log("Start update");

    // Configシートの設定に従って対象難易度を取得
    const configSheet = repositories.configSheet();
    const registeredDifficulties = configSheet.targetRegisteredDifficulties();
    for (const difficulty of registeredDifficulties) {
        updateData(difficulty);
    }

    console.log("End update");
}
