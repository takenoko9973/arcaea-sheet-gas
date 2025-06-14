import { ChartData } from "domain/models/song/chartData/chartData";
import { Constant } from "domain/models/song/chartData/constant/constant";
import { SongNotes } from "domain/models/song/chartData/notes/songNotes";
import { Difficulty } from "domain/models/song/difficulty/difficulty";
import {
    DifficultyEnum,
    DifficultyName,
} from "domain/models/song/difficulty/difficultyName/difficultyName";
import { Level } from "domain/models/song/difficulty/level/level";
import { Song } from "domain/models/song/song";
import { SongData } from "domain/models/song/songData/songData";
import { SongId } from "domain/models/song/songId/songId";
import { SongTitle } from "domain/models/song/songId/songTitle/songTitle";
import { Pack } from "domain/models/song/songMetadata/pack/pack";
import { Side, SideEnum } from "domain/models/song/songMetadata/side/side";
import { SongMetadata } from "domain/models/song/songMetadata/songMetadata";
import { Version } from "domain/models/song/songMetadata/version/version";
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
        const details = WikiDataFetcherService.fetchDetails(dto);

        // ドメインエンティティを生成
        const newSong = Song.create(
            new SongTitle(dto.songTitle),
            new SongData({ nameJp: dto.nameJp, nameEn: dto.nameEn, composer: dto.composer }),
            new SongMetadata({
                pack: new Pack(details.pack),
                version: Version.fromString(details.version),
                side: new Side(dto.side as SideEnum),
            }),
            new Difficulty({
                difficultyName: new DifficultyName(difficulty as DifficultyEnum),
                level: new Level(dto.level),
            }),
            new ChartData({
                constant: new Constant(Number(dto.constant)),
                songNotes: new SongNotes(dto.notes !== "" ? Number(dto.notes) : details.notes),
            })
        );

        // リポジトリに保存
        songRepo.save(newSong);
        isRegistered = true;
    }

    // シートに書き込み
    if (isRegistered) songRepo.flush();

    console.log("End registering(%s)", difficulty);
}
