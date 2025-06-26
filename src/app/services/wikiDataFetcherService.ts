import { IFetchArcaeaWiki } from "../../@types/fetch-arcaea-wiki";
import { DifficultyEnum } from "../../domain/models/song/difficulty/difficultyName/difficultyName";

// IFetchArcaeaWikiの型定義をグローバルで宣言
declare const FetchArcaeaWiki: IFetchArcaeaWiki;

// Wikiから取得するデータの型を定義
export type WikiSongDetails = {
    composer: string;
    pack: string;
    version: string;
    level: string;
    notes: number;
    constant: number;
};

export class WikiDataFetcherService {
    /**
     * Arcaea Wikiから楽曲の詳細データを取得する
     * @param dto 楽曲情報DTO
     * @returns 取得した詳細データ
     */
    static fetchDetails(urlName: string, difficulty: DifficultyEnum): WikiSongDetails {
        // wikiから、追加のデータを取得
        const songDataFromWiki = FetchArcaeaWiki.createSongData(urlName);
        Utilities.sleep(1500); // サーバーに負荷をかけないようにする

        return {
            composer: songDataFromWiki.composer,
            pack: songDataFromWiki.pack,
            version: songDataFromWiki.version,
            level: songDataFromWiki.getLevelByDiff(difficulty)[0],
            notes: songDataFromWiki.getNotesByDiff(difficulty)[0],
            constant: songDataFromWiki.getConstantByDiff(difficulty)[0],
        };
    }
}
