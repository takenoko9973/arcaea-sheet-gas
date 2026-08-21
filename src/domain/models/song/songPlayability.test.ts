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

function createSong(level: string, pack: string): Song {
    return Song.create(
        new SongTitle("song"),
        new SongData({ nameJp: "曲", nameEn: "Song", composer: "Composer" }),
        new SongMetadata({
            pack: new Pack(pack),
            side: new Side(SideEnum.LIGHT),
            version: Version.fromString("1.0"),
        }),
        new Difficulty({
            difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
            level: new Level(level),
        }),
        new ChartData({ constant: new Constant(10), songNotes: new SongNotes(1000) })
    );
}

describe("Song.isRegularlyPlayable", () => {
    it("通常譜面はtrue", () => {
        expect(createSong("10", "Arcaea").isRegularlyPlayable()).toBe(true);
    });

    it("April Fool Sound相当のlevel ? はfalse", () => {
        expect(createSong("?", "Arcaea").isRegularlyPlayable()).toBe(false);
    });

    it("削除済み曲はfalse", () => {
        expect(createSong("10", "Deleted").isRegularlyPlayable()).toBe(false);
    });
});
