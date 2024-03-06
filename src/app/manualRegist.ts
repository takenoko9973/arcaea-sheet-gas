import { Song } from '../class/song';
import { MANUAL_REGIST_SHEET } from '../const';
import {
    changeCodeToString,
    extractionJaName,
    extractionUrlName,
    isRegistedSong,
    toHalfWidth,
} from '../util';
import { addSong } from './registSong';

/**
 * 手動登録ルーチン
 */
export function manualRegist() {
    console.log('start manual regist');

    const col = 0;
    const dat = MANUAL_REGIST_SHEET.getDataRange().getValues()[1];

    //各曲情報を取得
    let name = extractionJaName(dat[col]);
    name = changeCodeToString(name);
    const songTitle = dat[col + 1];
    const difficulty = dat[col + 2];

    //存在確認
    const isUnregist = isRegistedSong(songTitle, difficulty);
    if (!isUnregist) return;

    const urlName = extractionUrlName(toHalfWidth(dat[col]));
    const level = dat[col + 3];
    const constant = dat[col + 4];

    console.log('%s(%s)', name, difficulty);
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
        addSong(song);
    } else {
        console.log('No wiki data (%s)', name);
    }

    console.log('end manual regist');
}

declare const ArcaeaWikiAPI: ArcaeaWikiAPI;

declare interface ArcaeaWikiAPI {
    getMusicFromWiki(urlName: string): any;
}
