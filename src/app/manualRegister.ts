import { DifficultyName } from "domain/models/song/difficulty/difficultyName/difficultyName";
import { SongFactory } from "domain/models/song/songFactory";
import { SongId } from "domain/models/song/songId/songId";
import { ManualRegisterRepository } from "infrastructure/repositories/manualRegisterRepository";
import { SongRepository } from "infrastructure/repositories/songRepository";

import { WikiDataFetcherService } from "./services/wikiDataFetcherService";

/**
 * 手動登録ルーチン
 */
export function manualRegister() {
    console.log("start manual register");

    // 1. 各リポジトリのインスタンスを取得
    const songRepo = SongRepository.instance;
    const manualRegisterRepo = new ManualRegisterRepository(); // このリポジトリはシンプルなのでSingletonでなくてもOK

    // 2. 手動登録シートからエントリ（DTO）を取得
    const dto = manualRegisterRepo.getEntry();
    if (!dto) {
        console.log("No entry for manual register.");
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

    console.log("Manual registering %s(%s)", dto.nameJp, dto.difficulty);

    // 4. Wikiから補足データを取得 (DTOを元にした形に修正)
    const wikiDetails = WikiDataFetcherService.fetchDetails({
        urlName: dto.urlName,
        difficulty: dto.difficulty,
        // DTOにない他のプロパティは空で渡す
        songTitle: "",
        nameJp: "",
        nameEn: "",
        composer: "",
        side: "",
        level: "",
        constant: "",
        notes: "",
    });

    // 5. ドメインエンティティを生成
    const newSong = SongFactory.createFromManualRegisterDto(dto, wikiDetails);

    // 6. リポジトリに保存し、すぐにシートに書き出す
    songRepo.save(newSong);
    songRepo.flush();

    console.log("end manual register");
}
