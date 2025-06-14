import { SongCollectionDto } from "domain/dto/songCollectionDto";

import { IFetchArcaeaWiki } from "../../@types/fetch-arcaea-wiki";

// IFetchArcaeaWikiの型定義をグローバルで宣言
declare const FetchArcaeaWiki: IFetchArcaeaWiki;

// Wikiから取得するデータの型を定義
type WikiSongDetails = { composer: string; pack: string; version: string; notes: number };

export class WikiDataFetcherService {
    /**
     * Arcaea Wikiから楽曲の詳細データを取得する
     * @param dto 楽曲情報DTO
     * @returns 取得した詳細データ
     */
    public static fetchDetails(dto: SongCollectionDto): WikiSongDetails {
        // wikiから、追加のデータを取得
        const songDataFromWiki = FetchArcaeaWiki.createSongData(dto.urlName);
        Utilities.sleep(1500); // サーバーに負荷をかけないようにする

        // 取得したデータから必要な情報を取り出す
        const notesStr =
            dto.notes !== ""
                ? dto.notes
                : songDataFromWiki.getNotesByDiff(dto.difficulty)[0].toString();

        const versionMatch = songDataFromWiki.version.match(/^(\d+\.\d+)/);
        const version = versionMatch ? versionMatch[1] : "";

        return {
            composer: songDataFromWiki.composer,
            pack: songDataFromWiki.pack,
            version: version,
            notes: Number(notesStr),
        };
    }
}
