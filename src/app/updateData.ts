import { fetchDifficultyCollectData, registeredSongRow as registeredSongRow } from "../util";
import { CollectionSong } from "../class/collectionSong";
import { Song } from "../class/song";
import { SONG_SHEET, SONG_SHEET_DATA } from "../const";

export function updateData(difficulty: string) {
    console.log("Start updating(%s)", difficulty);

    // 指定の難易度のみのデータを取り出し
    const diffData = fetchDifficultyCollectData(difficulty);

    //全データチェック
    for (let i = 1; i < diffData.length; i++) {
        const collectedSong = new CollectionSong(difficulty, diffData[i]);
        if (collectedSong.nameJp === "") continue;

        updateSongData(collectedSong);
    }

    console.log("End updating(%s)", difficulty);
}

function updateSongData(collectedSong: CollectionSong) {
    // 登録済みかどうか
    const registeredSong = fetchRegisteredSong(collectedSong.difficulty, collectedSong.songTitle);
    if (registeredSong === null) return;

    // 整合性確認
    const equalSongData = checkSongDataConsistency(registeredSong, collectedSong.toSongData());
    if (equalSongData) return;

    // 更新
    console.log("update data of %s(%s)", registeredSong.nameJp, registeredSong.difficulty);
    const newSongData = updateSongDataWithDelta(registeredSong, collectedSong.toSongData());
    overwriteSongData(newSongData);
}

function fetchRegisteredSong(difficulty: string, songTitle: string) {
    const registeredRow = registeredSongRow(difficulty, songTitle);
    const registeredSong = fetchRegisteredSongByRowNum(registeredRow);
    return registeredSong;
}

function fetchRegisteredSongByRowNum(rowNum: number) {
    if (rowNum < 0) return null;

    const songData = SONG_SHEET_DATA[rowNum].slice(0, 12);
    return new Song(songData);
}

function checkSongDataConsistency(registeredSong: Song, collectedSong: Song) {
    const equalLevel = registeredSong.level === collectedSong.level;
    const equalConstant = registeredSong.constant === collectedSong.constant;
    const equalNotes = registeredSong.notes === collectedSong.notes;

    return equalLevel && equalConstant && equalNotes;
}

function updateSongDataWithDelta(songData: Song, newSongData: Song) {
    const updateSongData = new Song(songData.getSongDataList());

    updateSongData.level = newSongData.level;
    updateSongData.constant = newSongData.constant;
    updateSongData.notes = newSongData.notes;
    return updateSongData;
}

function overwriteSongData(songData: Song) {
    const registeredRow = registeredSongRow(songData.difficulty, songData.songTitle);
    const updateInfo = [songData.getSongDataList()];

    SONG_SHEET.getRange("A" + (registeredRow + 1) + ":L" + (registeredRow + 1)).setValues(
        updateInfo
    );
}
