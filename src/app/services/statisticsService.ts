import { BASE_MAX_SCORE } from "const";
import { GradeData } from "domain/models/daily/greadeData/gradeData";
import { ScoreData } from "domain/models/daily/scoreData/scoreData";
import { DifficultyEnum } from "domain/models/song/difficulty/difficultyName/difficultyName";
import { Song } from "domain/models/song/song";
import { Version } from "domain/models/song/songMetadata/version/version";
import * as math from "utils/math";
import { uniq } from "utils/util";

export class StatisticsService {
    /**
     * Best枠の平均ポテンシャルを計算する
     */
    static calculateBestPotential(songs: Song[]): number {
        const bestPotentials = StatisticsService.filterPlayableSongs(songs)
            .map(song => song.obtainPotential().value)
            .sort((a, b) => b - a)
            .slice(0, 30);

        if (bestPotentials.length === 0) return 0;
        return math.average(bestPotentials);
    }

    /**
     * Best枠の理論値ポテンシャルを計算する
     */
    static calculateBestMaxPotential(songs: Song[]): number {
        const bestMaxPotentials = StatisticsService.filterPlayableSongs(songs)
            .map(song => song.constant.value)
            .sort((a, b) => b - a)
            .slice(0, 30);

        if (bestMaxPotentials.length === 0) return 0;
        return math.average(bestMaxPotentials) + 2.0;
    }

    /**
     * 指定難易度のグレードを集計する
     */
    static calculateGrades(songs: Song[], difficulty: DifficultyEnum): GradeData {
        let gradeData = GradeData.createEmpty();

        const targetSongs = StatisticsService.filterPlayableSongs(songs).filter(
            song => song.difficultyName.value === difficulty
        );

        for (const song of targetSongs) {
            const gradeEnum = song.scoreGrade().value;
            gradeData = gradeData.increment(gradeEnum);
        }
        return gradeData;
    }

    /**
     * 指定難易度の合計スコアと失点を計算する
     */
    static calculateScoreData(songs: Song[], difficulty: DifficultyEnum): ScoreData {
        const targetSongs = StatisticsService.filterPlayableSongs(songs).filter(
            song => song.difficultyName.value === difficulty
        );

        let sumScore = 0;
        let maximumSumScore = 0;
        let farNotes = 0;
        let luckShinyPureNotes = 0;

        for (const song of targetSongs) {
            sumScore += song.score.value;
            maximumSumScore += BASE_MAX_SCORE + song.songNotes.value;
            farNotes += (song.songNotes.value - song.hitPureNotes().value) * 2;
            luckShinyPureNotes += song.songNotes.value - song.hitShinyPureNotes().value;
        }

        return new ScoreData(sumScore, maximumSumScore - sumScore, farNotes, luckShinyPureNotes);
    }

    static latestVersion(songs: Song[]): Version {
        const versions = uniq(songs.map(it => it.version)) as Version[];

        return (
            versions
                .sort((a, b) => {
                    if (a.major != b.major) return a.major - b.major;

                    return a.minor - b.minor;
                })
                .at(-1) ?? Version.fromString("1.0")
        );
    }

    private static filterPlayableSongs(songs: Song[]) {
        return songs.filter(song => song.level.value !== "?" && !song.isDeleted());
    }
}
