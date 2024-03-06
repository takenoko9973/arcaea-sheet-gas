import {
    BEST_POTENTIAL_CELL,
    GRADE_CELL,
    POTENTIAL_SHEET,
    SCORE_STATISTICS_SHEET,
    SUM_SCORE_DATE_SHEET,
    SUM_SCORE_INFO_CELL,
} from '../const';

export function setDataByDate() {
    const lastRow = SUM_SCORE_DATE_SHEET.getLastRow();

    const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');
    const bestPotential = POTENTIAL_SHEET.getRange(BEST_POTENTIAL_CELL).getValue();
    const score = SCORE_STATISTICS_SHEET.getRange(SUM_SCORE_INFO_CELL).getValues().flat();
    const grade = SCORE_STATISTICS_SHEET.getRange(GRADE_CELL).getValues().flat();

    const inputData = [today];
    inputData.push(bestPotential);
    inputData.push(...grade);
    inputData.push(...score);

    SUM_SCORE_DATE_SHEET.insertRowAfter(lastRow);

    const inputCell = SUM_SCORE_DATE_SHEET.getRange(lastRow + 1, 1, 1, inputData.length);
    inputCell.setValues([inputData]);
}

export const transpose = (a: unknown[][]) =>
    a[0].map((_: unknown, c: number) => a.map((r: unknown[]) => r[c]));
