import { DAILY_REPOSITORY_SHEET_NAME, SHEET_BOOK } from "../../const";
import { splitArrayIntoChunks } from "../../util";
import { ScoreData } from "../scoreData";

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export class DailyRepositorySheet {
    sheet: Sheet;

    constructor(sheet: Sheet) {
        this.sheet = sheet;
    }

    static get instance() {
        return new DailyRepositorySheet(SHEET_BOOK.getSheetByName(DAILY_REPOSITORY_SHEET_NAME)!);
    }

    addData(data: DailyArcaeaData) {
        this.insertNewRow(data.getRowData());
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insertNewRow(dataArray: any[]) {
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
    grade: number[];
    scoreData: ScoreData[];

    private static gradeNum_ = 7;
    private static diffNum_ = 3;

    constructor(date: Date, potential: number, grade: number[], scoreData: ScoreData[]) {
        this.date = date;
        this.potential = potential;
        this.grade = grade;
        this.scoreData = scoreData;
    }

    getRowData() {
        const dataArray = [];

        dataArray.push(Utilities.formatDate(this.date, "JST", "yyyy/MM/dd"));
        dataArray.push(this.potential);
        dataArray.push(...this.grade);
        dataArray.push(...this.scoreData.flatMap(value => [value.sumScore, value.lostScore]));

        return dataArray;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static createDataByRow(rowData: any[]) {
        const date = Utilities.parseDate(rowData[0], "JST", "yyyy/MM/dd");
        const potential = rowData[1];
        const grade = rowData.slice(2, 2 + this.gradeNum_);
        const scoreDataArray = rowData.slice(
            2 + this.gradeNum_,
            2 + this.gradeNum_ + this.diffNum_ * 2
        );
        const scoreData = splitArrayIntoChunks(scoreDataArray, 2).map(
            array => new ScoreData(array[0], array[1])
        );

        return new this(date, potential, grade, scoreData);
    }
}
