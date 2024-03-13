import { fetchSongDataFromWiki } from "../class/collectionSong";
import { SongCollectionSheet, SongScoreSheet } from "../class/sheet";
import { Difficulty } from "../const";

export function registerSongData(difficulty: Difficulty) {
    console.log("Start registering(%s)", difficulty);

    const songScoreSheet = SongScoreSheet.instance;
    const songCollectionSheet = SongCollectionSheet.instance;

    // 指定の難易度のみのデータを取り出し
    const diffData = songCollectionSheet.getCollectionData(difficulty);

    //全データチェック
    for (const collectedSong of diffData) {
        if (collectedSong.nameJp === "") continue;
        if (collectedSong.nameJp === null) continue;

        //存在確認
        const isRegistered = songScoreSheet.isRegistered(
            collectedSong.difficulty,
            collectedSong.songTitle
        );
        if (isRegistered) continue;

        // まだ定数が判明していなければ、無視
        if (collectedSong.constant === "") continue;

        console.log("getting data of %s(%s)", collectedSong.nameJp, collectedSong.difficulty);
        fetchSongDataFromWiki(collectedSong);

        // 欠けがあるか確認
        const song = collectedSong.toSongData();
        if (song.isLuckData()) {
            // データが足りなければ飛ばす
            console.warn("Exist luck data (%s)", song.nameJp);
            continue;
        }
        songScoreSheet.addSong(song);
        songScoreSheet.updateSheet();
    }
    console.log("End registering(%s)", difficulty);
}
