import { GradeData } from "./greadeData/gradeData";
import { ScoreData } from "./scoreData/scoreData";

/**
 * 日次統計データを表すドメインオブジェクト
 */
export class DailyData {
    constructor(
        public readonly date: Date,
        public readonly potential: number,
        public readonly grade: GradeData,
        public readonly scoreData: ScoreData[]
    ) {}
}
