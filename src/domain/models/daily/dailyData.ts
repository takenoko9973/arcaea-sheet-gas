import { Version } from "@/domain/models/song/songMetadata/version/version";

import { FrameScoreData } from "./frameScoreData/frameScoreData";
import { GradeData } from "./gradeData/gradeData";
import { ScoreData } from "./scoreData/scoreData";

/**
 * 日次統計データを表すドメインオブジェクト
 */
export class DailyData {
    constructor(
        public readonly date: Date,
        public readonly version: Version,
        public readonly potential: number,
        public readonly potentialMax: number,
        public readonly grade: GradeData,
        public readonly scoreData: ScoreData[],
        public readonly frameScoreData: FrameScoreData
    ) {}
}
