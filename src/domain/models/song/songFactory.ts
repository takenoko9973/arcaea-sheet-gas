import { WikiSongDetails } from "@/app/services/wikiDataFetcherService";
import { ManualRegisterDto } from "@/domain/dto/manualRegisterDto";
import { SongCollectionDto } from "@/domain/dto/songCollectionDto";

import { ChartData } from "./chartData/chartData";
import { Constant } from "./chartData/constant/constant";
import { SongNotes } from "./chartData/notes/songNotes";
import { Difficulty } from "./difficulty/difficulty";
import { DifficultyEnum, DifficultyName } from "./difficulty/difficultyName/difficultyName";
import { Level } from "./difficulty/level/level";
import { Song } from "./song";
import { SongData } from "./songData/songData";
import { SongTitle } from "./songId/songTitle/songTitle";
import { Pack } from "./songMetadata/pack/pack";
import { Side, SideEnum } from "./songMetadata/side/side";
import { SongMetadata } from "./songMetadata/songMetadata";
import { Version } from "./songMetadata/version/version";

export class SongFactory {
    /**
     * SongCollectionのDTOからSongエンティティを生成する
     * @param dto - SongCollectionシートから収集したDTO
     * @param details - Wikiから補足した情報
     * @returns 生成されたSongエンティティ
     */
    static createFromCollectionDto(dto: SongCollectionDto, details: WikiSongDetails): Song {
        return Song.create(
            new SongTitle(dto.songTitle),
            new SongData({ nameJp: dto.nameJp, nameEn: dto.nameEn, composer: dto.composer }),
            new SongMetadata({
                pack: new Pack(details.pack),
                version: Version.fromString(details.version),
                side: new Side(dto.side as SideEnum),
            }),
            new Difficulty({
                difficultyName: new DifficultyName(dto.difficulty as DifficultyEnum),
                level: new Level(dto.level !== "" ? dto.level : details.level),
            }),
            new ChartData({
                constant: new Constant(
                    dto.constant !== "" ? Number(dto.constant) : details.constant
                ),
                songNotes: new SongNotes(dto.notes !== "" ? Number(dto.notes) : details.notes),
            })
        );
    }

    /**
     * 手動登録のDTOからSongエンティティを生成する
     * @param dto - ManualRegisterシートから収集したDTO
     * @param details - Wikiから補足した情報
     * @returns 生成されたSongエンティティ
     */
    static createFromManualRegisterDto(dto: ManualRegisterDto, details: WikiSongDetails): Song {
        return Song.create(
            new SongTitle(dto.songTitle),
            new SongData({
                nameJp: dto.nameJp,
                nameEn: dto.nameEn,
                composer: details.composer,
            }),
            new SongMetadata({
                pack: new Pack(details.pack),
                version: Version.fromString(details.version),
                side: new Side(details.side as SideEnum),
            }),
            new Difficulty({
                difficultyName: new DifficultyName(dto.difficulty as DifficultyEnum),
                level: new Level(dto.level !== "" ? dto.level : details.level),
            }),
            new ChartData({
                constant: new Constant(
                    dto.constant !== "" ? Number(dto.constant) : details.constant
                ),
                songNotes: new SongNotes(details.notes),
            })
        );
    }
}
