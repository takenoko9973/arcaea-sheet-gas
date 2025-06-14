import { SongCollectionDto } from "domain/dto/songCollectionDto";
import { DifficultyEnum } from "domain/models/song/difficulty/difficultyName/difficultyName";

/**
 * 収集済み楽曲データ（Wiki情報など）を取得するためのリポジトリインターフェース
 */
export interface ISongCollectionRepository {
    /**
     * 指定された難易度の更新用楽曲データをすべて取得する
     * @param difficulty 難易度
     */
    fetchByDifficulty(difficulty: DifficultyEnum): SongCollectionDto[];
}
