import { DAILY_REPOSITORY_SHEET_NAME } from "@/const";
import { DailyData } from "@/domain/models/daily/dailyData";
import { IDailyDataRepository } from "@/domain/repositories/dailyStatisticsRepositoryImpl";
import { DailyDataMapper } from "@/infrastructure/mappers/dailyStatisticsMapper";
import { getSheet } from "@/utils/sheetHelper";

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export class DailyStatisticsRepository implements IDailyDataRepository {
    private static singleton: DailyStatisticsRepository;

    private sheet: Sheet;

    private constructor(sheet: Sheet) {
        this.sheet = sheet;
    }

    static get instance() {
        if (!this.singleton)
            this.singleton = new DailyStatisticsRepository(getSheet(DAILY_REPOSITORY_SHEET_NAME));

        return this.singleton;
    }

    public add(data: DailyData): void {
        const rowData = DailyDataMapper.toPersistence(data);
        const lastRow = this.sheet.getLastRow();
        this.sheet.insertRowAfter(lastRow);

        const inputCells = this.sheet.getRange(lastRow + 1, 1, 1, rowData.length);
        inputCells.setValues([rowData]);
    }

    public fetchData(): DailyData[] {
        const values = this.sheet.getDataRange().getValues();
        values.shift(); // ヘッダーを削除

        return values.map(row => DailyDataMapper.toDomain(row));
    }
}
