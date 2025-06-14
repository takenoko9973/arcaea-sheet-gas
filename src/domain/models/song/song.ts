import { ChartData as ChartData } from "./chartData/chartData";
import { Constant } from "./chartData/constant/constant";
import { PureNotes } from "./chartData/notes/pureNotes";
import { ShinyPureNotes } from "./chartData/notes/shinyPureNotes";
import { SongNotes } from "./chartData/notes/songNotes";
import { Difficulty } from "./difficulty/difficulty";
import { DifficultyName } from "./difficulty/difficultyName/difficultyName";
import { Level } from "./difficulty/level/level";
import { Potential } from "./potential/potential";
import { Grade, GradeEnum } from "./score/grade/grade";
import { Score, SCORE_GRADE_BORDERS } from "./score/score";
import { SongData } from "./songData/songData";
import { SongId } from "./songId/songId";
import { SongTitle } from "./songId/songTitle/songTitle";
import { Pack } from "./songMetadata/pack/pack";
import { Side } from "./songMetadata/side/side";
import { SongMetadata } from "./songMetadata/songMetadata";
import { Version } from "./songMetadata/version/version";

export class Song {
    private constructor(
        private readonly _songId: SongId,
        private _songData: SongData,
        private _songMetadata: SongMetadata,
        private _difficulty: Difficulty,
        private _chartData: ChartData,
        private _score: Score
    ) {
        this.validate();
    }

    static create(
        songTitle: SongTitle,
        songData: SongData,
        songMetadata: SongMetadata,
        difficulty: Difficulty,
        chartData: ChartData
    ) {
        const songId = new SongId(songTitle.value);
        const song = new Song(songId, songData, songMetadata, difficulty, chartData, new Score(0));

        return song;
    }

    static reconstruct(
        songId: SongId,
        songData: SongData,
        songMetadata: SongMetadata,
        difficulty: Difficulty,
        chartData: ChartData,
        score: Score
    ) {
        return new Song(songId, songData, songMetadata, difficulty, chartData, score);
    }

    private validate() {
        const pureNotes = this.hitPureNotes();
        if (pureNotes.value < 0) {
            throw new Error(
                `不正な入力値です。計算されたPureNotesが負の値 (${pureNotes.value}) になりました。`
            );
        }

        const shinyPureNotes = this.hitShinyPureNotes();
        if (shinyPureNotes.value > this.songNotes.value) {
            throw new Error(
                `不正な入力値です。計算されたShinyPureNotes (${shinyPureNotes.value}) がsongNotesを超えました。`
            );
        }

        // 内部はpure以上にはならない
        if (pureNotes.value < shinyPureNotes.value) {
            throw new Error(`不正な入力値です。PureNotesよりもShinyPureNotesが多くなりました。`);
        }
    }

    equals(other: Song): boolean {
        return this.uniqueChartId === other.uniqueChartId;
    }

    // 削除曲か否か
    isDeleted() {
        return this.pack.value === "Deleted";
    }

    /**
     * Pure数を計算 (Farは0.5として計算)
     */
    hitPureNotes(): PureNotes {
        const pureNotes = Math.floor((this.score.value * this.songNotes.value * 2) / 10000000) / 2;
        return new PureNotes(pureNotes);
    }

    /**
     * 内部数計算
     */
    hitShinyPureNotes(): ShinyPureNotes {
        const shinyPureNotes =
            this.score.value -
            Math.floor(10000000 * (this.hitPureNotes().value / this.songNotes.value));
        return new ShinyPureNotes(shinyPureNotes);
    }

    /**
     * スコアグレード
     */
    scoreGrade(): Grade {
        if (this.hitShinyPureNotes().equals(this.songNotes)) {
            return new Grade(GradeEnum.PM_PLUS);
        } else if (this.hitPureNotes().equals(this.songNotes)) {
            return new Grade(GradeEnum.PM);
        } else {
            return this.score.scoreGrade();
        }
    }

    /**
     * 楽曲ポテンシャル
     */
    obtainPotential(): Potential {
        let scorePotential = 0;

        if (
            this.scoreGrade().equals(new Grade(GradeEnum.PM)) ||
            this.scoreGrade().equals(new Grade(GradeEnum.PM_PLUS))
        ) {
            scorePotential = 2.0;
        } else if (this.score.value >= SCORE_GRADE_BORDERS.EX) {
            scorePotential = (this.score.value - SCORE_GRADE_BORDERS.EX) / 200000 + 1.0;
        } else {
            scorePotential = (this.score.value - SCORE_GRADE_BORDERS.AA) / 300000;
        }

        return new Potential(Math.max(this.constant.value + scorePotential, 0));
    }

    changeDifficulty(newDifficulty: Difficulty): Song {
        return new Song(
            this._songId,
            this._songData,
            this._songMetadata,
            newDifficulty,
            this._chartData,
            this._score
        );
    }

    changeChartData(newChartData: ChartData): Song {
        return new Song(
            this._songId,
            this._songData,
            this._songMetadata,
            this._difficulty,
            newChartData,
            this._score
        );
    }

    get songId(): SongId {
        return this._songId;
    }

    get songData(): SongData {
        return this._songData;
    }

    get pack(): Pack {
        return this._songMetadata.pack;
    }

    get side(): Side {
        return this._songMetadata.side;
    }

    get version(): Version {
        return this._songMetadata.version;
    }

    get difficultyName(): DifficultyName {
        return this._difficulty.difficultyName;
    }

    get level(): Level {
        return this._difficulty.level;
    }

    get songNotes(): SongNotes {
        return this._chartData.songNotes;
    }

    get constant(): Constant {
        return this._chartData.constant;
    }

    get score(): Score {
        return this._score;
    }

    get uniqueChartId(): string {
        return `${this._songId.value}_${this.difficultyName.value}`;
    }
}
