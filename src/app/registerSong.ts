import {
    createFailureResult,
    processCollectionDtos,
    ProcessingResult,
} from "@/app/collectionProcessing";
import { providers, repositories } from "@/app/dependencies";
import { isPersistenceFatalError } from "@/domain/errors/persistenceFatalError";
import {
    DifficultyEnum,
    DifficultyName,
} from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { SongFactory } from "@/domain/models/song/songFactory";
import { SongId } from "@/domain/models/song/songId/songId";

import {
    IWikiProvider,
    resolveWikiSongDetails,
} from "./services/wikiDataFetcherService";

export function registerSongData(
    difficulty: DifficultyEnum,
    wikiProvider: IWikiProvider = providers.wiki()
): ProcessingResult {
    console.log("Start registering(%s)", difficulty);

    const songRepo = repositories.song();
    const songCollectionRepo = repositories.songCollection();
    // 設定セルの参照と既存のfatal境界を維持する。この設定はWiki補完前のskip判定には使わない。
    songRepo.isIgnoreConstant();

    // 指定の難易度のみのデータを取り出し
    let collectionDtos;
    try {
        collectionDtos = songCollectionRepo.fetchByDifficulty(difficulty);
    } catch (cause) {
        if (isPersistenceFatalError(cause)) throw cause;

        console.log("End registering(%s)", difficulty);
        return createFailureResult({ difficulty, operation: "collection fetch", cause });
    }

    // 共通ループ処理で登録対象だけを処理する
    const result = processCollectionDtos({
        dtos: collectionDtos,
        difficulty,
        operation: "register",
        // 名前が空の場合はスキップ
        shouldSkip: dto => dto.nameJp === "",
        process: dto => {
            // 存在確認
            const songId = new SongId(dto.songTitle);
            const difficultyName = new DifficultyName(difficulty);

            const existingSong = songRepo.findSong(songId, difficultyName);
            if (existingSong) return false;

            console.log("getting data of %s(%s)", dto.nameJp, difficulty);

            // SongCollectionの既知値を優先し、不足値だけをWikiから補完
            const wikiDetails = resolveWikiSongDetails(dto, difficulty, wikiProvider);

            // ドメインエンティティを生成
            const newSong = SongFactory.createFromCollectionDto(dto, wikiDetails);

            // リポジトリに保存（保存できたらtrue）
            songRepo.save(newSong);
            return true;
        },
    });

    // シートに書き込み
    if (result.changed > 0) songRepo.flush();

    console.log("End registering(%s)", difficulty);
    return result;
}
