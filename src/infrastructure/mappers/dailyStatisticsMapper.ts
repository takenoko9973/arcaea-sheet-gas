import { DailyData } from "domain/models/daily/dailyData";
import { GradeData, GradeDataValue } from "domain/models/daily/greadeData/gradeData";
import { ScoreData } from "domain/models/daily/scoreData/scoreData";
import { GradeEnum } from "domain/models/song/score/grade/grade";
import { Version } from "domain/models/song/songMetadata/version/version";
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
            "'" + data.version.toString(),
            data.potential,
            data.potentialMax,
            ...gradeList,
            ...scoreList,
        ];
    }

    /**
     * スプレッドシートの行データ（配列）からDailyDataドメインオブジェクトに変換
     */
    public static toDomain(row: unknown[]): DailyData {
        const date = new Date(row.shift() as string);
        const version = Version.fromString(row.shift() as string);
        const potential = Number(row.shift());
        const potentialMax = Number(row.shift());

        const counts: GradeDataValue = {
            [GradeEnum.PM_PLUS]: Number(row.shift()),
            [GradeEnum.PM]: Number(row.shift()),
            [GradeEnum.EX_PLUS]: Number(row.shift()),
            [GradeEnum.EX]: Number(row.shift()),
            [GradeEnum.AA]: Number(row.shift()),
            [GradeEnum.A]: Number(row.shift()),
            [GradeEnum.B]: 0,
            [GradeEnum.C]: 0,
            [GradeEnum.D]: 0,
            [GradeEnum.NOT_PLAYED]: Number(row.shift()),
        };
        const grade = new GradeData(counts);

        const scoreDataArray = row.splice(0, 12);
        const scoreData = splitArrayIntoChunks(scoreDataArray, 4).map(
            array => new ScoreData(array[0], array[1], array[2], array[3])
        );

        return new DailyData(date, version, potential, potentialMax, grade, scoreData);
    }
}
