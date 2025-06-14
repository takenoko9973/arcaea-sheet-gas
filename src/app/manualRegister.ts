// ... ドメインモデルのインポート ...
import {
    DifficultyEnum,
    DifficultyName,
} from "domain/models/song/difficulty/difficultyName/difficultyName";
import { Song } from "domain/models/song/song";
import { SongId } from "domain/models/song/songId/songId";
import { SongTitle } from "domain/models/song/songId/songTitle/songTitle";
import { ManualRegisterRepository } from "infrastructure/repositories/manualRegisterRepository";
import { SongRepository } from "infrastructure/repositories/songRepository";
import { WikiDataFetcherService } from "./services/wikiDataFetcherService";
import { SongData } from "domain/models/song/songData/songData";
import { SongMetadata } from "domain/models/song/songMetadata/songMetadata";
import { Version } from "domain/models/song/songMetadata/version/version";
import { Side, SideEnum } from "domain/models/song/songMetadata/side/side";
import { Difficulty } from "domain/models/song/difficulty/difficulty";
import { Level } from "domain/models/song/difficulty/level/level";
import { ChartData } from "domain/models/song/chartData/chartData";
import { Constant } from "domain/models/song/chartData/constant/constant";
import { SongNotes } from "domain/models/song/chartData/notes/songNotes";
import { Pack } from "domain/models/song/songMetadata/pack/pack";
// ...

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
    const newSong = Song.create(
        new SongTitle(dto.songTitle),
        new SongData({
            nameJp: dto.nameJp,
            nameEn: "", // 手動登録シートにないので空
            composer: wikiDetails.composer,
        }),
        new SongMetadata({
            pack: new Pack(wikiDetails.pack),
            version: Version.fromString(wikiDetails.version),
            side: new Side(SideEnum.COLORLESS), // 手動登録シートにないので仮の値
        }),
        new Difficulty({
            difficultyName: new DifficultyName(dto.difficulty as DifficultyEnum),
            level: new Level(dto.level),
        }),
        new ChartData({
            constant: new Constant(dto.constant),
            songNotes: new SongNotes(wikiDetails.notes),
        })
    );

    // 6. リポジトリに保存し、すぐにシートに書き出す
    songRepo.save(newSong);
    songRepo.flush();

    console.log("end manual register");
}
