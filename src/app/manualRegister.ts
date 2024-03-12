import { SongScoreSheet } from "../class/sheet/songScoreSheet";
import { Song } from "../class/song";
import { MANUAL_REGISTER_SHEET } from "../const";
import { changeCodeToString, extractionJaName, extractionUrlName, toHalfWidth } from "../util";

/**
 * 手動登録ルーチン
 */
export function manualRegister() {
    console.log("start manual register");

    const songScoreSheet = SongScoreSheet.instance;

    const col = 0;
    const dat = MANUAL_REGISTER_SHEET.getDataRange().getValues()[1];

    //各曲情報を取得
    let name = extractionJaName(dat[col]);
    name = changeCodeToString(name);
    const songTitle = dat[col + 1];
    const difficulty = dat[col + 2];

    //存在確認
    const isRegistered = songScoreSheet.isRegistered(songTitle, difficulty);
    if (isRegistered) return;

    const urlName = extractionUrlName(toHalfWidth(dat[col]));
    const level = dat[col + 3];
    const constant = dat[col + 4];

    console.log("%s(%s)", name, difficulty);
    //wikiで残りデータを取得
    const musicData = ArcaeaWikiAPI.getMusicFromWiki(urlName);
    const song = new Song([
        name,
        songTitle,
        musicData.composer,
        difficulty,
        level,
        constant,
        musicData.pack,
        musicData.version,
        musicData.notes[difficulty],
        0,
    ]);

    //すべてのデータが取得できているか確認
    if (song.isLuckData()) {
        songScoreSheet.addSong(song);
    } else {
        console.log("No wiki data (%s)", name);
    }

    console.log("end manual register");
}

declare const ArcaeaWikiAPI: ArcaeaWikiAPI;

declare interface ArcaeaWikiAPI {
    getMusicFromWiki(urlName: string): any;
}
