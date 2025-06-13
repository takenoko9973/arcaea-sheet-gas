import { Song } from "../models/song/song";
import { SongId } from "../models/song/songId/songId";

// Songアグリゲートのためのリポジトリインターフェース
export interface ISongRepository {
    /**
     * 指定されたIDで楽曲を検索する
     * @param id 楽曲ID
     * @returns 楽曲エンティティ、見つからない場合はnull
     */
    findById(id: SongId): Song | null;

    /**
     * 楽曲エンティティを永続化する
     * (新規作成と更新の両方を担当)
     * @param song 楽曲エンティティ
     */
    save(song: Song): void;
}
