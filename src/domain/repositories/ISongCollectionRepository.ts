import { CollectionSong } from "../../infrastructure/datasources/collectionSong"; // DTOとして利用
import { Difficulty } from "../../shared/types/difficulty";

export interface IScoreCollectionRepository {
    /**
     * 指定された難易度の更新用楽曲データをすべて取得する
     * @param difficulty 難易度
     */
    fetchByDifficulty(difficulty: Difficulty): CollectionSong[];
}
