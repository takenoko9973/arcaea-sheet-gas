import { updateData } from "./updateData";
import { registerSongData } from "./registerSong";

export function checkCollectedSong() {
    autoRegister();
    update();
}

function autoRegister() {
    console.log("Start auto register");
    // registerSongData("PST");
    // registerSongData("PRS");
    registerSongData("FTR");
    registerSongData("BYD");
    registerSongData("ETR");
    console.log("End auto register");
}

function update() {
    console.log("Start update");
    updateData("FTR");
    updateData("BYD");
    updateData("ETR");
    console.log("End update");
}
