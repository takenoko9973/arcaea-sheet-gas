import { SongId } from "./songId/songId";
import { Difficulty, DifficultyEnum } from "./difficulty/difficulty";
import { SongTitle } from "./songId/songTitle/songTitle";
import { SongData } from "./songData/songData";
import { Pack } from "./pack/pack";
import { Side, SideEnum } from "./side/side";
import { Version } from "./version/version";
import { Level } from "./difficultyData/level/level";
import { SongNotes } from "./difficultyData/notes/songNotes";
import { Constant } from "./difficultyData/constant/constant";
import { DifficultyData } from "./difficultyData/difficultyData";
import { Song } from "./song";
import { Score } from "./score/score";
import { PureNotes } from "./difficultyData/notes/pureNotes";
import { ShinyPureNotes } from "./difficultyData/notes/shinyPureNotes";
import { Grade, GradeEnum } from "./score/grade/grade";

describe("Song", () => {
    const difficulty = new Difficulty(DifficultyEnum.FUTURE);
    const songTitle = new SongTitle("abc");

    const songId = new SongId({
        difficulty,
        songTitle,
    });
    const songData = new SongData({ nameJp: "abc", nameEn: "abc", composer: "hoge" });
    const pack = new Pack("foo");
    const side = new Side(SideEnum.LIGHT);
    const version = Version.fromString("1.0");

    const level = new Level("10+");
    const songNotes = new SongNotes(1000);
    const constant = new Constant(1.0);

    describe("create", () => {
        it("デフォルト値で作成する", () => {
            const difficultyData = new DifficultyData({ difficulty, level, songNotes, constant });
            const song = Song.create(songId, songData, pack, side, version, difficultyData);

            expect(song.songId.equals(songId)).toBeTruthy();
            expect(song.songData.equals(songData)).toBeTruthy();
            expect(song.pack.equals(pack)).toBeTruthy();
            expect(song.side.equals(side)).toBeTruthy();
            expect(song.version.equals(version)).toBeTruthy();
            expect(song.difficulty.equals(difficulty)).toBeTruthy();
            expect(song.level.equals(level)).toBeTruthy();
            expect(song.songNotes.equals(songNotes)).toBeTruthy();
            expect(song.constant.equals(constant)).toBeTruthy();
        });
    });

    describe("Notes関連", () => {
        it("PureNotes", () => {
            const difficultyData = new DifficultyData({
                difficulty,
                level,
                songNotes: new SongNotes(1212),
                constant,
            });
            const song = Song.reconstruct(
                songId,
                songData,
                pack,
                side,
                version,
                difficultyData,
                new Score(9964050)
            );

            expect(song.hitPureNotes().equals(new PureNotes(1207.5))).toBeTruthy();
        });

        it("ShinyPureNotes", () => {
            const difficultyData = new DifficultyData({
                difficulty,
                level,
                songNotes: new SongNotes(1212),
                constant,
            });
            const song = Song.reconstruct(
                songId,
                songData,
                pack,
                side,
                version,
                difficultyData,
                new Score(9964050)
            );

            expect(song.hitShinyPureNotes().equals(new ShinyPureNotes(1179))).toBeTruthy();
        });
    });

    describe("grade", () => {
        it("スコアに対して、適切なグレードが表示されるかどうか", () => {
            const difficultyData = new DifficultyData({
                difficulty,
                level,
                songNotes,
                constant,
            });
            const song = Song.reconstruct(
                songId,
                songData,
                pack,
                side,
                version,
                difficultyData,
                new Score(10000000)
            );

            expect(song.scoreGrade().equals(new Grade(GradeEnum.PM)));

            song.changeScore(new Score(10000000 + songNotes.value));
            expect(song.scoreGrade().equals(new Grade(GradeEnum.PM_PLUS)));
        });
    });
});
