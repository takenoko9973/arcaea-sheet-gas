import { providers, repositories } from "@/app/dependencies";
import { DifficultyName } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { SongFactory } from "@/domain/models/song/songFactory";
import { SongId } from "@/domain/models/song/songId/songId";
import { ManualRegisterRepository } from "@/infrastructure/repositories/manualRegisterRepository";

import {
    IWikiProvider,
    resolveWikiSongDetails,
} from "./services/wikiDataFetcherService";

/** 手動入力から曲を登録する処理 */
export function registerFromManualEntry(wikiProvider?: IWikiProvider) {
    console.log("Start register from manual entry");

    // 1. 各リポジトリのインスタンスを取得
    const songRepo = repositories.song();
    const manualRegisterRepo = new ManualRegisterRepository();

    // 2. 手動入力シートからエントリ（DTO）を取得
    const dto = manualRegisterRepo.getEntry();
    if (!dto) {
        console.log("No entry for register from manual entry.");
        return;
    }

    // 3. 登録済みか確認
    const songId = new SongId(dto.songTitle);
    const difficultyName = new DifficultyName(dto.difficulty);

    const existingSong = songRepo.findSong(songId, difficultyName);
    if (existingSong) {
        console.log("%s(%s) is already registered.", dto.nameJp, dto.difficulty);
        return;
    }

    console.log("Register from manual entry: %s(%s)", dto.nameJp, dto.difficulty);

    // 4. DTOの既知値を優先し、不足値だけをWikiから補完
    const wikiDetails = resolveWikiSongDetails(dto, dto.difficulty, wikiProvider ?? providers.wiki());

    // 5. ドメインエンティティを生成
    const newSong = SongFactory.createFromManualRegisterDto(dto, wikiDetails);

    // 6. リポジトリに保存し、すぐにシートに書き出す
    songRepo.save(newSong);
    songRepo.flush();

    console.log("End register from manual entry");
}
