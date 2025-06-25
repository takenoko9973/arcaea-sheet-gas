import { SongCollectionDto } from "domain/dto/songCollectionDto";

import { IFetchArcaeaWiki } from "../../@types/fetch-arcaea-wiki";

// IFetchArcaeaWikiの型定義をグローバルで宣言
declare const FetchArcaeaWiki: IFetchArcaeaWiki;

// Wikiから取得するデータの型を定義
export type WikiSongDetails = {
    composer: string;
    pack: string;
    version: string;
    notes: number;
    constant: number;
};

export class WikiDataFetcherService {
    /**
     * Arcaea Wikiから楽曲の詳細データを取得する
     * @param dto 楽曲情報DTO
     * @returns 取得した詳細データ
     */
    static fetchDetails(dto: SongCollectionDto): WikiSongDetails {
        // wikiから、追加のデータを取得
        const songDataFromWiki = FetchArcaeaWiki.createSongData(dto.urlName);
        Utilities.sleep(1500); // サーバーに負荷をかけないようにする

        // 取得したデータから必要な情報を取り出す
        const notes =
            dto.notes !== ""
                ? Number(dto.notes)
                : songDataFromWiki.getNotesByDiff(dto.difficulty)[0];
        const constant =
            dto.constant !== ""
                ? Number(dto.constant)
                : songDataFromWiki.getConstantByDiff(dto.difficulty)[0]; // Last(BYD) の場合はバグる

        return {
            composer: songDataFromWiki.composer,
            pack: songDataFromWiki.pack,
            version: songDataFromWiki.version,
            notes: notes,
            constant: constant,
        };
    }
}
