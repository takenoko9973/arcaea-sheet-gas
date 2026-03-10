import { processCollectionDtos } from "@/app/collectionProcessing";
import { repositories } from "@/app/dependencies";
import {
    DifficultyEnum,
    DifficultyName,
} from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { SongFactory } from "@/domain/models/song/songFactory";
import { SongId } from "@/domain/models/song/songId/songId";

import { WikiDataFetcherService } from "./services/wikiDataFetcherService";

export function registerSongData(difficulty: DifficultyEnum) {
    console.log("Start registering(%s)", difficulty);

    const songRepo = repositories.song();
    const songCollectionRepo = repositories.songCollection();
    const isIgnoreConstant = songRepo.isIgnoreConstant(); // 定数情報が未登録でも強制登録

    // 指定の難易度のみのデータを取り出し
    const collectionDtos = songCollectionRepo.fetchByDifficulty(difficulty);

    // 共通ループ処理で登録対象だけを処理する
    const isRegistered = processCollectionDtos({
        dtos: collectionDtos,
        difficulty,
        // 名前が空、または定数が空で許可設定が無い場合はスキップ
        shouldSkip: dto => dto.nameJp === "" || (dto.constant === "" && !isIgnoreConstant),
        process: dto => {
            // 存在確認
            const songId = new SongId(dto.songTitle);
            const difficultyName = new DifficultyName(difficulty);

            const existingSong = songRepo.findSong(songId, difficultyName);
            if (existingSong) return false;

            console.log("getting data of %s(%s)", dto.nameJp, difficulty);

            // Wikiからデータを取得
            const wikiDetails = WikiDataFetcherService.fetchDetails(dto.urlName, difficulty);

            // ドメインエンティティを生成
            const newSong = SongFactory.createFromCollectionDto(dto, wikiDetails);

            // リポジトリに保存（保存できたらtrue）
            songRepo.save(newSong);
            return true;
        },
    });

    // シートに書き込み
    if (isRegistered) songRepo.flush();

    console.log("End registering(%s)", difficulty);
}
