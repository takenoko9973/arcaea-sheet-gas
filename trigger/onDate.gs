function setDataByDate() {
  const lastRow = SUM_SCORE_DATE_SHEET.getLastRow();

  const today = Utilities.formatDate(new Date(),"Asia/Tokyo","yyyy/MM/dd");
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

const transpose = a => a[0].map((_, c) => a.map(r => r[c]));
