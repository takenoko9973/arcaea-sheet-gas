import { SHEET_BOOK, SONG_SCORE_SHEET_NAME } from "../../const";
import { Song } from "../song";
import { allIndexesOf, average, sum } from "../../util";
import { GradeData } from "../gradeData";
import { Difficulty } from "../../types";

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export class SongScoreSheet {
    private static singleton = new SongScoreSheet(
        SHEET_BOOK.getSheetByName(SONG_SCORE_SHEET_NAME)!
    );

    private readonly songData: Song[];

    static get instance() {
        return this.singleton;
    }

    private constructor(private readonly sheet: Sheet) {
        const values = this.sheet.getDataRange().getValues();
        this.songData = values
            .slice(1) // 目次無視
            .map(row => new Song(row.slice(0, 12)))
            .filter(song => song.songTitle !== "");
    }

    /**
     * 楽曲情報をシートに更新
     */
    updateSheet() {
        // 不足分の行を追加
        const sheetRowNum = this.sheet.getLastRow();
        const songNum = this.registeredSongNum();
        if (sheetRowNum < songNum + 5) {
            this.sheet.insertRowsAfter(sheetRowNum, songNum + 5 - sheetRowNum);
        }

        const values = this.songData.map(song => song.getSongDataList());
        this.sheet.getRange(2, 1, songNum, values[0].length).setValues(values);
    }

    registeredSongNum() {
        const songNum = this.songData.length;
        return songNum;
    }

    searchRegisteredSongIndex(difficulty: string, songTitle: string): number {
        const registeredSongTitles = this.songData.map(song => song.songTitle);
        const indexes = allIndexesOf(registeredSongTitles, songTitle);

        for (const index of indexes) {
            const song = this.songData[index];
            if (song.difficulty === difficulty) {
                return index;
            }
        }
        return -1;
    }

    searchRegisteredSong(difficulty: string, songTitle: string): Song | null {
        const index = this.searchRegisteredSongIndex(difficulty, songTitle);
        return this.songData[index];
    }

    isRegistered(difficulty: string, songTitle: string): boolean {
        const index = this.searchRegisteredSongIndex(difficulty, songTitle);
        return index >= 0;
    }

    /**
     * 楽曲データを追加する
     * 既に楽曲データが存在する場合は、追加しない
     */
    addSong(song: Song) {
        const isRegistered = this.isRegistered(song.difficulty, song.songTitle);

        if (!isRegistered) {
            this.songData.push(song);
        }
    }

    /**
     * 指定した楽曲データの入れ替え
     * 該当する楽曲が無い場合は更新しない
     */
    overwriteSong(song: Song) {
        const index = this.searchRegisteredSongIndex(song.difficulty, song.songTitle);

        if (index >= 0) {
            this.songData[index] = song;
        }
    }

    /**
     * 指定難易度の最大合計スコアを取得
     */
    getMaximumSumScore(difficulty: Difficulty) {
        const maximumScores = this.songData
            .filter(song => song.level !== "?")
            .filter(song => song.difficulty === difficulty)
            .map(song => song.getMaximumScore());

        return sum(maximumScores);
    }

    /**
     * 指定難易度の合計スコアを取得
     */
    getSumScore(difficulty: Difficulty) {
        const scores = this.songData
            .filter(song => song.level !== "?")
            .filter(song => song.difficulty === difficulty)
            .map(song => song.score);

        return sum(scores);
    }

    /**
     * 指定難易度の各グレード数を取得
     */
    getGrades(difficulty: Difficulty) {
        const grades = this.songData
            .filter(song => song.level !== "?")
            .filter(song => song.difficulty === difficulty)
            .map(song => song.getGrade());

        const gradeData = new GradeData();
        for (const grade of grades) {
            gradeData.gradeCounts[grade] = gradeData.gradeCounts[grade] + 1;
        }
        return gradeData;
    }

    /**
     * ベスト枠のみの平均ポテンシャルを取得
     */
    getBestPotential() {
        const bestPotentials = this.songData
            .filter(song => song.level !== "?")
            .map(song => song.getSongPotential())
            .sort((a, b) => a - b)
            .reverse()
            .slice(0, 30);

        return average(bestPotentials);
    }

    /**
     * 指定難易度のFar数を取得 (Lostは2)
     */
    getFarNotes(difficulty: Difficulty) {
        const farCounts = this.songData
            .filter(song => song.level !== "?")
            .filter(song => song.difficulty === difficulty)
            .map(song => (song.notes - song.getPureNotes()) * 2);

        return sum(farCounts);
    }

    /**
     * 指定難易度の残り内部数を計算
     */
    getLuckShinyPureNotes(difficulty: Difficulty) {
        const farCounts = this.songData
            .filter(song => song.level !== "?")
            .filter(song => song.difficulty === difficulty)
            .map(song => song.notes - song.getHitShinyPureNotes());

        return sum(farCounts);
    }
}
