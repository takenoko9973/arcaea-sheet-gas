import {
  BEST_POTENTIAL_CELL,
  GRADE_CELL,
  POTENTIAL_SHEET,
  SCORE_STATISTICS_SHEET,
  SUM_SCORE_DATE_SHEET,
  SUM_SCORE_INFO_CELL,
} from '../const';

/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export function setDataByDate() {
  const lastRow = SUM_SCORE_DATE_SHEET.getLastRow();

  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');
  const bestPotential =
    POTENTIAL_SHEET.getRange(BEST_POTENTIAL_CELL).getValue();
  const score = SCORE_STATISTICS_SHEET.getRange(SUM_SCORE_INFO_CELL)
    .getValues()
    .flat();
  const grade = SCORE_STATISTICS_SHEET.getRange(GRADE_CELL).getValues().flat();

  const inputData = [today];
  inputData.push(bestPotential);
  inputData.push(...grade);
  inputData.push(...score);

  SUM_SCORE_DATE_SHEET.insertRowAfter(lastRow);

  const inputCell = SUM_SCORE_DATE_SHEET.getRange(
    lastRow + 1,
    1,
    1,
    inputData.length
  );
  inputCell.setValues([inputData]);
}

export const transpose = (a: unknown[][]) =>
  a[0].map((_: unknown, c: number) => a.map((r: unknown[]) => r[c]));
