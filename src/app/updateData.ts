import { Song } from "../class/song";
import { SongCollectionSheet, SongScoreSheet } from "../class/sheet";
import { Difficulty } from "../types";

export function updateData(difficulty: Difficulty) {
    console.log("Start updating(%s)", difficulty);

    const songScoreSheet = SongScoreSheet.instance;
    const songCollectionSheet = SongCollectionSheet.instance;

    // 指定の難易度のみのデータを取り出し
    const diffData = songCollectionSheet.getCollectionData(difficulty);

    //全データチェック
    for (const collectedSong of diffData) {
        if (collectedSong.nameJp === "") continue;

        // 登録済みかどうか
        const registeredSong = songScoreSheet.searchRegisteredSong(
            collectedSong.difficulty,
            collectedSong.songTitle
        );
        if (registeredSong === null) return;

        // 整合性確認
        const equalSongData = checkSongDataConsistency(registeredSong, collectedSong.toSongData());
        if (equalSongData) return;

        // 更新
        console.log("update data of %s(%s)", registeredSong.nameJp, registeredSong.difficulty);
        const newSongData = updateSongDataWithDelta(registeredSong, collectedSong.toSongData());
        songScoreSheet.overwriteSong(newSongData);
    }

    songScoreSheet.updateSheet();
    console.log("End updating(%s)", difficulty);
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
