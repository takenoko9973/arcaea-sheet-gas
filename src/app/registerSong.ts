import { CollectionSong, fetchSongDataFromWiki } from "../class/collectionSong";
import { SongScoreSheet } from "../class/sheet/songScoreSheet";
import { fetchDifficultyCollectData } from "../util";

export function registerSongData(difficulty: string) {
    console.log("Start registering(%s)", difficulty);

    const songScoreSheet = SongScoreSheet.instance;

    // 指定の難易度のみのデータを取り出し
    const diffData = fetchDifficultyCollectData(difficulty);

    //全データチェック
    for (let i = 1; i < diffData.length; i++) {
        const collectSong = new CollectionSong(difficulty, diffData[i]);
        if (collectSong.nameJp === "") continue;
        if (collectSong.nameJp === null) continue;

        //存在確認
        const isRegistered = songScoreSheet.isRegistered(
            collectSong.difficulty,
            collectSong.songTitle
        );
        if (isRegistered) continue;

        // まだ定数が判明していなければ、無視
        if (collectSong.constant === "") continue;

        console.log("getting data of %s(%s)", collectSong.nameJp, collectSong.difficulty);
        fetchSongDataFromWiki(collectSong);

        // 欠けがあるか確認
        const song = collectSong.toSongData();
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
