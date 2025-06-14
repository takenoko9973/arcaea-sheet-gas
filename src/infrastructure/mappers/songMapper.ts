import { ChartData } from "domain/models/song/chartData/chartData";
import { Constant } from "domain/models/song/chartData/constant/constant";
import { SongNotes } from "domain/models/song/chartData/notes/songNotes";
import { Difficulty } from "domain/models/song/difficulty/difficulty";
import {
    DifficultyEnum,
    DifficultyName,
} from "domain/models/song/difficulty/difficultyName/difficultyName";
import { Level } from "domain/models/song/difficulty/level/level";
import { Score } from "domain/models/song/score/score";
import { Song } from "domain/models/song/song";
import { SongData } from "domain/models/song/songData/songData";
import { SongId } from "domain/models/song/songId/songId";
import { Pack } from "domain/models/song/songMetadata/pack/pack";
import { Side, SideEnum } from "domain/models/song/songMetadata/side/side";
import { SongMetadata } from "domain/models/song/songMetadata/songMetadata";
import { Version } from "domain/models/song/songMetadata/version/version";

export class SongMapper {
    /**
     * スプレッドシートの1行データをSongドメインオブジェクトに変換する
     */
    static toDomain(row: unknown[]): Song | null {
        if (row[0] === "") return null;

        const songId = new SongId(String(row[0]));

        const songData = new SongData({
            nameJp: String(row[1]),
            nameEn: String(row[2]),
            composer: String(row[3]),
        });

        const songMetadata = new SongMetadata({
            pack: new Pack(String(row[4])),
            version: Version.fromString(String(row[5]).replace(/'/g, "")), // 文字列の ' を削除
            side: new Side(row[6] as SideEnum),
        });

        const difficulty = new Difficulty({
            difficultyName: new DifficultyName(row[7] as DifficultyEnum),
            level: new Level(String(row[8])),
        });

        const chartData = new ChartData({
            songNotes: new SongNotes(Number(row[10])),
            constant: new Constant(Number(row[9])),
        });

        const score = new Score(Number(row[11]));

        return Song.reconstruct(songId, songData, songMetadata, difficulty, chartData, score);
    }

    /**
     * Songドメインオブジェクトをスプレッドシートの1行データに変換する
     */
    static toPersistence(song: Song): unknown[] {
        return [
            song.songId.value,
            song.songData.nameJp,
            song.songData.nameEn,
            song.songData.composer,
            song.pack.value,
            "'" + song.version.toString(),
            song.side.value,
            song.difficultyName.value,
            song.level.value,
            song.constant.value,
            song.songNotes.value,
            song.score.value,
        ];
    }
}
