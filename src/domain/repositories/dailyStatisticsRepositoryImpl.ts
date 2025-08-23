import { DailyData } from "@/domain/models/daily/dailyData";

export interface IDailyDataRepository {
    /**
     * 新しい日次データを保存する
     * @param data 保存するデータ
     */
    add(data: DailyData): void;

    /**
     * すべての日次データを取得する
     */
    fetchData(): DailyData[];
}
