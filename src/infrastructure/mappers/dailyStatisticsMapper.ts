import { DailyData } from "domain/models/daily/dailyData";
import { GradeData, GradeDataValue } from "domain/models/daily/greadeData/gradeData";
import { ScoreData } from "domain/models/daily/scoreData/scoreData";
import { GradeEnum } from "domain/models/song/score/grade/grade";
import { splitArrayIntoChunks } from "utils/util";

export class DailyDataMapper {
    /**
     * DailyDataドメインオブジェクトをスプレッドシートの行データ（配列）に変換
     */
    public static toPersistence(data: DailyData): unknown[] {
        const gradeCounts = data.grade.counts;
        const gradeList = [
            gradeCounts[GradeEnum.PM_PLUS],
            gradeCounts[GradeEnum.PM],
            gradeCounts[GradeEnum.EX_PLUS],
            gradeCounts[GradeEnum.EX],
            gradeCounts[GradeEnum.AA],
            gradeCounts[GradeEnum.A] +
                gradeCounts[GradeEnum.B] +
                gradeCounts[GradeEnum.C] +
                gradeCounts[GradeEnum.D],
            gradeCounts[GradeEnum.NOT_PLAYED],
        ];

        const scoreList = data.scoreData.flatMap(value => [
            value.sumScore,
            value.lostScore,
            value.farNotes,
            value.luckShinyPureNotes,
        ]);

        return [
            Utilities.formatDate(data.date, "JST", "yyyy/MM/dd"),
            data.potential,
            ...gradeList,
            ...scoreList,
        ];
    }

    /**
     * スプレッドシートの行データ（配列）からDailyDataドメインオブジェクトに変換
     */
    public static toDomain(row: unknown[]): DailyData {
        const date = new Date(row[0] as string);
        const potential = Number(row[1]);

        const counts: GradeDataValue = {
            [GradeEnum.PM_PLUS]: Number(row[2]),
            [GradeEnum.PM]: Number(row[3]),
            [GradeEnum.EX_PLUS]: Number(row[4]),
            [GradeEnum.EX]: Number(row[5]),
            [GradeEnum.AA]: Number(row[6]),
            [GradeEnum.A]: Number(row[7]),
            [GradeEnum.B]: 0,
            [GradeEnum.C]: 0,
            [GradeEnum.D]: 0,
            [GradeEnum.NOT_PLAYED]: Number(row[8]),
        };
        const grade = new GradeData(counts);

        const scoreDataArray = row.slice(9, 21);
        const scoreData = splitArrayIntoChunks(scoreDataArray, 4).map(
            array => new ScoreData(array[0], array[1], array[2], array[3])
        );

        return new DailyData(date, potential, grade, scoreData);
    }
}
