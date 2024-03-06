import { fetchDifficultyCollectData, registedSongRow } from '../util';
import { CollectionSong } from '../class/collectionSong';
import { Song } from '../class/song';
import { SONG_SHEET, SONG_SHEET_DATA } from '../const';

export function updateData(difficulty: string) {
    console.log('Start updating(%s)', difficulty);

    // 指定の難易度のみのデータを取り出し
    const diffData = fetchDifficultyCollectData(difficulty);

    //全データチェック
    for (let i = 1; i < diffData.length; i++) {
        const collectedSong = new CollectionSong(difficulty, diffData[i]);
        if (collectedSong.nameJp === '') continue;

        updateSongData(collectedSong);
    }

    console.log('End updating(%s)', difficulty);
}

function updateSongData(collectedSong: CollectionSong) {
    // 登録済みかどうか
    const registedSong = fetchRegistedSong(collectedSong.difficulty, collectedSong.songTitle);
    if (registedSong === null) return;

    // 整合性確認
    const equalSongData = checkSongDataConsistency(registedSong, collectedSong.toSongData());
    if (equalSongData) return;

    // 更新
    console.log('update data of %s(%s)', registedSong.nameJp, registedSong.difficulty);
    const newSongData = updateSongDataWithDelta(registedSong, collectedSong.toSongData());
    overwriteSongData(newSongData);
}

function fetchRegistedSong(difficulty: string, songTitle: string) {
    const registedRow = registedSongRow(difficulty, songTitle);
    const registedSong = fetchRegistedSongByRowNum(registedRow);
    return registedSong;
}

function fetchRegistedSongByRowNum(rowNum: number) {
    if (rowNum < 0) return null;

    const songData = SONG_SHEET_DATA[rowNum].slice(0, 12);
    return new Song(songData);
}

function checkSongDataConsistency(registedSong: Song, collectedSong: Song) {
    const equalLevel = registedSong.level === collectedSong.level;
    const equalConstant = registedSong.constant === collectedSong.constant;
    const equalNotes = registedSong.notes === collectedSong.notes;

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
    const registedRow = registedSongRow(songData.difficulty, songData.songTitle);
    const updateInfo = [songData.getSongDataList()];

    SONG_SHEET.getRange('A' + (registedRow + 1) + ':L' + (registedRow + 1)).setValues(updateInfo);
}
