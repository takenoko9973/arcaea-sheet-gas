import {
    DifficultyEnum,
    DifficultyName,
} from "domain/models/song/difficulty/difficultyName/difficultyName";
import { SongFactory } from "domain/models/song/songFactory";
import { SongId } from "domain/models/song/songId/songId";
import { SongCollectionRepository } from "infrastructure/repositories/songCollectionRepository";
import { SongRepository } from "infrastructure/repositories/songRepository";

import { WikiDataFetcherService } from "./services/wikiDataFetcherService";

export function registerSongData(difficulty: DifficultyEnum) {
    console.log("Start registering(%s)", difficulty);

    const songRepo = SongRepository.instance;
    const songCollectionRepo = SongCollectionRepository.instance;
    const isIgnoreConstant = songRepo.isIgnoreConstant(); // 定数情報が未登録でも強制登録

    // 指定の難易度のみのデータを取り出し
    const collectionDtos = songCollectionRepo.fetchByDifficulty(difficulty);

    // 全データチェック
    let isRegistered = false;
    for (const dto of collectionDtos) {
        if (dto.nameJp === "") continue;
        if (dto.constant === "" && !isIgnoreConstant) continue;

        // 存在確認
        const songId = new SongId(dto.songTitle);
        const difficultyName = new DifficultyName(difficulty);

        const existingSong = songRepo.findSong(songId, difficultyName);
        if (existingSong) continue;

        console.log("getting data of %s(%s)", dto.nameJp, difficulty);

        // Wikiからデータを取得
        const wikiDetails = WikiDataFetcherService.fetchDetails(dto);

        // ドメインエンティティを生成
        const newSong = SongFactory.createFromCollectionDto(dto, wikiDetails);

        // リポジトリに保存
        songRepo.save(newSong);
        isRegistered = true;
    }

    // シートに書き込み
    if (isRegistered) songRepo.flush();

    console.log("End registering(%s)", difficulty);
}
