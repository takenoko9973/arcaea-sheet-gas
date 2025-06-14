import { ChartData } from "./chartData/chartData";
import { Constant } from "./chartData/constant/constant";
import { PureNotes } from "./chartData/notes/pureNotes";
import { ShinyPureNotes } from "./chartData/notes/shinyPureNotes";
import { SongNotes } from "./chartData/notes/songNotes";
import { Difficulty } from "./difficulty/difficulty";
import { DifficultyEnum, DifficultyName } from "./difficulty/difficultyName/difficultyName";
import { Level } from "./difficulty/level/level";
import { Grade, GradeEnum } from "./score/grade/grade";
import { Score } from "./score/score";
import { Song } from "./song";
import { SongData } from "./songData/songData";
import { SongId } from "./songId/songId";
import { SongTitle } from "./songId/songTitle/songTitle";
import { Pack } from "./songMetadata/pack/pack";
import { Side, SideEnum } from "./songMetadata/side/side";
import { SongMetadata } from "./songMetadata/songMetadata";
import { Version } from "./songMetadata/version/version";

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

    const songId = new SongId(songTitle.value);

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

            expect(song.uniqueChartId).toBe(`${songId.value}_${difficultyName.value}`);
        });
    });

    describe("Notes関連", () => {
        const chartData2 = new ChartData({ songNotes: new SongNotes(1212), constant });
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
            let song = Song.reconstruct(
                songId,
                songData,
                songMetadata,
                difficulty,
                chartData,
                new Score(10000000)
            );

            expect(song.scoreGrade().equals(new Grade(GradeEnum.PM)));

            song = Song.reconstruct(
                songId,
                songData,
                songMetadata,
                difficulty,
                chartData,
                new Score(10000000 + songNotes.value)
            );
            expect(song.scoreGrade().equals(new Grade(GradeEnum.PM_PLUS)));
        });
    });
});
