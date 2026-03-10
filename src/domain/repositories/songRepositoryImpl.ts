import { DifficultyName } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { Song } from "@/domain/models/song/song";
import { SongId } from "@/domain/models/song/songId/songId";

// Songアグリゲートのためのリポジトリインターフェース
export interface ISongRepository {
    /**
     * 指定されたIDで楽曲を検索する
     * @param id 楽曲ID
     * @param difficultyName 難易度名
     * @returns 楽曲エンティティ、見つからない場合はnull
     */
    findSong(songId: SongId, difficultyName: DifficultyName): Song | null;

    /**
     * 楽曲エンティティを永続化する
     * (新規作成と更新の両方を担当)
     * @param song 楽曲エンティティ
     */
    save(song: Song): void;

    /**
     * まとめてシートへ書き込む
     */
    flush(): void;

    /**
     * 保存済みの楽曲一覧を取得する
     */
    fetchSongs(): Song[];

    /**
     * 定数未登録でも登録を許可するか判定する
     */
    isIgnoreConstant(): boolean;
}
