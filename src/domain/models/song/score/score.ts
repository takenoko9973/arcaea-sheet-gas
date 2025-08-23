import { ValueObject } from "@/domain/models/shared/valueObject";

import { Grade, GradeEnum } from "./grade/grade";

type ScoreValue = number;
export class Score extends ValueObject<ScoreValue, "Score"> {
    static readonly MIN = 0;
    static readonly SEMI_MAX = 10000000;
    static readonly MAX = this.SEMI_MAX + 10000; // 余裕を持って、PM + 10000ノーツ分取る

    constructor(value: ScoreValue) {
        super(value);
    }

    protected validate(value: ScoreValue): void {
        if (value < Score.MIN || value > Score.MAX) {
            throw new Error(
                `スコアは${Score.MIN}から${Score.MAX}の間でなければなりません (${value})`
            );
        }
    }

    equals(other: Score): boolean {
        return this.value === other.value;
    }

    scoreGrade(): Grade {
        let nowGrade = GradeEnum.NOT_PLAYED;

        // 辞書配列のfor順番が不明のため、一応全てのグレードで処理
        for (const grade of Object.values(GradeEnum)) {
            const border_score = SCORE_GRADE_BORDERS[grade as GradeEnum];

            if (this.value < border_score) continue; // グレード条件
            if (SCORE_GRADE_BORDERS[nowGrade] > border_score) continue; // 上位のグレードかどうか

            nowGrade = grade as GradeEnum;
        }

        return new Grade(nowGrade);
    }
}

export const SCORE_GRADE_BORDERS: { [key in GradeEnum]: number } = {
    [GradeEnum.PM_PLUS]: Score.MAX, // 仮 (実装はchartData.tsで)
    [GradeEnum.PM]: Score.MAX, // 仮 (Pureの数で判定)
    [GradeEnum.EX_PLUS]: 9900000,
    [GradeEnum.EX]: 9800000,
    [GradeEnum.AA]: 9500000,
    [GradeEnum.A]: 9200000,
    [GradeEnum.B]: 8900000,
    [GradeEnum.C]: 8600000,
    [GradeEnum.D]: 1,
    [GradeEnum.NOT_PLAYED]: 0,
};
