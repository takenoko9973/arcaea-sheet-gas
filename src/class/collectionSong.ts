import { Difficulty } from "../const";
import { extractionJaName, extractionUrlName } from "../util";
import { Song } from "./song";

export class CollectionSong {
    composer: string;
    constant: string;
    difficulty: Difficulty;
    level: string;
    nameEn: string;
    nameJp: string;
    notes: string;
    pack: string;
    side: string;
    songTitle: string;
    urlName: string;
    version: string;

    constructor(difficulty: Difficulty, data: any[]) {
        let constantOld, constantNow;

        this.difficulty = difficulty;
        [
            this.songTitle,
            this.nameJp,
            this.nameEn,
            this.composer,
            this.side,
            this.level,
            constantOld,
            constantNow,
            this.notes,
        ] = data;
        this.constant = constantNow !== "" ? constantNow : constantOld;

        // url用の名前も含んでいるので分離
        // また、文字コードもあるのでそれも変換
        this.urlName = extractionUrlName(this.nameJp);
        this.nameJp = extractionJaName(this.nameJp);
        this.pack = "";
        this.version = "";
    }

    toSongData() {
        return new Song([
            this.songTitle,
            this.nameJp,
            this.nameEn,
            this.composer,
            this.pack,
            this.version,
            this.side,
            this.difficulty,
            this.level,
            Number(this.constant),
            Number(this.notes),
            0,
        ]);
    }
}

export function fetchSongDataFromWiki(collectSong: CollectionSong) {
    // wikiから、追加のデータを取得
    const songData = FetchArcaeaWiki.createSongData(collectSong.urlName);
    Utilities.sleep(1500); //サーバーに負荷をかけないようにする

    // wikiからのデータを取り込む
    collectSong.notes =
        collectSong.notes !== ""
            ? collectSong.notes
            : songData.getNotesByDiff(collectSong.difficulty)[0];
    collectSong.pack = songData.pack;
    collectSong.version = songData.version.match(/^(\d+\.\d+)/)[1];
}

declare const FetchArcaeaWiki: FetchArcaeaWiki;

interface FetchArcaeaWiki {
    createSongData(urlName: string): any;
}
