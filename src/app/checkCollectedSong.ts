import { updateData } from './updateData';
import { registSongData } from './registSong';

export function checkCollectedSong() {
    autoRegist();
    update();
}

function autoRegist() {
    console.log('Start auto regist');
    // registSongData("PST");
    // registSongData("PRS");
    registSongData('FTR');
    registSongData('BYD');
    registSongData('ETR');
    console.log('End auto regist');
}

function update() {
    console.log('Start update');
    updateData('FTR');
    updateData('BYD');
    updateData('ETR');
    console.log('Start update');
}
