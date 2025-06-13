import { Song } from "./song";
import { SongId } from "./songId/songId";
import { DifficultyName, DifficultyEnum } from "./difficulty/difficultyName/difficultyName";
import { SongTitle } from "./songId/songTitle/songTitle";
import { SongData } from "./songData/songData";
import { Pack } from "./songMetadata/pack/pack";
import { Side, SideEnum } from "./songMetadata/side/side";
import { Version } from "./songMetadata/version/version";
import { Level } from "./difficulty/level/level";
import { SongNotes } from "./chartData/notes/songNotes";
import { Constant } from "./chartData/constant/constant";
import { ChartData } from "./chartData/chartData";
import { PureNotes } from "./chartData/notes/pureNotes";
import { ShinyPureNotes } from "./chartData/notes/shinyPureNotes";
import { Grade, GradeEnum } from "./score/grade/grade";
import { SongMetadata } from "./songMetadata/songMetadata";
import { Difficulty } from "./difficulty/difficulty";
import { Score } from "./score/score";

describe("Song", () => {
    const songTitle = new SongTitle("abc");

    const songData = new SongData({ nameJp: "abc", nameEn: "abc", composer: "hoge" });

    const pack = new Pack("foo");
    const side = new Side(SideEnum.LIGHT);
    const version = Version.fromString("1.0");
    const songMetadata = new SongMetadata({ pack: pack, side: side, version: version });

    const difficultyName = new DifficultyName(DifficultyEnum.FUTURE);
    const level = new Level("10+");
    const difficulty = new Difficulty({ difficultyName, level });

    const songNotes = new SongNotes(1000);
    const constant = new Constant(1.0);
    const chartData = new ChartData({ songNotes, constant });

    const songId = new SongId({
        songTitle: songTitle,
        difficultyName: difficultyName,
    });

    describe("create", () => {
        it("デフォルト値で作成する", () => {
            const song = Song.create(songTitle, songData, songMetadata, difficulty, chartData);

            expect(song.songId.equals(songId)).toBeTruthy();
            expect(song.songData.equals(songData)).toBeTruthy();
            expect(song.pack.equals(pack)).toBeTruthy();
            expect(song.side.equals(side)).toBeTruthy();
            expect(song.version.equals(version)).toBeTruthy();
            expect(song.difficultyName.equals(difficultyName)).toBeTruthy();
            expect(song.level.equals(level)).toBeTruthy();
            expect(song.songNotes.equals(songNotes)).toBeTruthy();
            expect(song.constant.equals(constant)).toBeTruthy();
        });
    });

    describe("Notes関連", () => {
        const chartData2 = new ChartData({
            songNotes: new SongNotes(1212),
            constant,
        });
        const song = Song.reconstruct(
            songId,
            songData,
            songMetadata,
            difficulty,
            chartData2,
            new Score(9964050)
        );

        it("PureNotes", () => {
            expect(song.hitPureNotes().equals(new PureNotes(1207.5))).toBeTruthy();
        });

        it("ShinyPureNotes", () => {
            expect(song.hitShinyPureNotes().equals(new ShinyPureNotes(1179))).toBeTruthy();
        });
    });

    describe("grade", () => {
        it("スコアに対して、適切なグレードが表示されるかどうか", () => {
            const song = Song.reconstruct(
                songId,
                songData,
                songMetadata,
                difficulty,
                chartData,
                new Score(10000000)
            );

            expect(song.scoreGrade().equals(new Grade(GradeEnum.PM)));

            song.changeScore(new Score(10000000 + songNotes.value));
            expect(song.scoreGrade().equals(new Grade(GradeEnum.PM_PLUS)));
        });
    });
});
