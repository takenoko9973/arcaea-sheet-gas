import { DAILY_REPOSITORY_SHEET_NAME, SHEET_BOOK } from "../../const";
import { Grade } from "../../types";
import { splitArrayIntoChunks } from "../../util";
import { GradeData } from "../gradeData";
import { ScoreData } from "../scoreData";

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export class DailyRepositorySheet {
    private static singleton = new DailyRepositorySheet(
        SHEET_BOOK.getSheetByName(DAILY_REPOSITORY_SHEET_NAME)!
    );

    sheet: Sheet;

    private constructor(sheet: Sheet) {
        this.sheet = sheet;
    }

    static get instance() {
        return this.singleton;
    }

    addData(data: DailyArcaeaData) {
        const dataArray = data.getRowData();

        // 最終行の後に新しい行を挿入
        const lastRow = this.sheet.getLastRow();
        this.sheet.insertRowAfter(lastRow);

        const inputCells = this.sheet.getRange(lastRow + 1, 1, 1, dataArray.length);
        inputCells.setValues([dataArray]);
    }
}

export class DailyArcaeaData {
    date: Date;
    potential: number;
    grade: GradeData;
    scoreData: ScoreData[];

    private static gradeNum_ = 7;
    private static diffNum_ = 3;

    constructor(date: Date, potential: number, grade: GradeData, scoreData: ScoreData[]) {
        this.date = date;
        this.potential = potential;
        this.grade = grade;
        this.scoreData = scoreData;
    }

    getRowData() {
        const dataArray = [];

        dataArray.push(Utilities.formatDate(this.date, "JST", "yyyy/MM/dd"));
        dataArray.push(this.potential);
        dataArray.push(...grade2List(this.grade));
        dataArray.push(
            ...this.scoreData.flatMap(value => [
                value.sumScore,
                value.lostScore,
                value.farNotes,
                value.luckShinyPureNotes,
            ])
        );

        return dataArray;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static createDataByRow(rowData: any[]) {
        const date = Utilities.parseDate(rowData[0], "JST", "yyyy/MM/dd");
        const potential = rowData[1];
        const grade = list2Grade(rowData.slice(2, 2 + this.gradeNum_));
        const scoreDataArray = rowData.slice(
            2 + this.gradeNum_,
            2 + this.gradeNum_ + this.diffNum_ * 4
        );
        const scoreData = splitArrayIntoChunks(scoreDataArray, 4).map(
            array => new ScoreData(array[0], array[1], array[2], array[3])
        );

        return new this(date, potential, grade, scoreData);
    }
}

function grade2List(gradeData: GradeData) {
    const list = [
        gradeData.gradeCounts[Grade.PMPlus],
        gradeData.gradeCounts[Grade.PM],
        gradeData.gradeCounts[Grade.EXPlus],
        gradeData.gradeCounts[Grade.EX],
        gradeData.gradeCounts[Grade.AA],
        gradeData.gradeCounts[Grade.A] +
            gradeData.gradeCounts[Grade.B] +
            gradeData.gradeCounts[Grade.C] +
            gradeData.gradeCounts[Grade.D],
        gradeData.gradeCounts[Grade.NotPlayed],
    ];
    return list;
}

function list2Grade(list: number[]) {
    const gradeData = new GradeData();
    gradeData.gradeCounts[Grade.PMPlus] = list[0];
    gradeData.gradeCounts[Grade.PM] = list[1];
    gradeData.gradeCounts[Grade.EXPlus] = list[2];
    gradeData.gradeCounts[Grade.EX] = list[3];
    gradeData.gradeCounts[Grade.AA] = list[4];
    gradeData.gradeCounts[Grade.A] = list[5];
    gradeData.gradeCounts[Grade.NotPlayed] = list[6];
    return gradeData;
}
