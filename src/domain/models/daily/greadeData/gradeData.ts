import { ValueObject } from "domain/models/shared/valueObject";
import { GradeEnum } from "domain/models/song/score/grade/grade";

// GradeDataが持つ値の型を定義
export type GradeDataValue = Record<GradeEnum, number>;

/**
 * グレードの集計情報を表すバリューオブジェクト
 */
export class GradeData extends ValueObject<GradeDataValue, "GradeData"> {
    constructor(value: GradeDataValue) {
        super(value);
    }

    protected validate(value: GradeDataValue): void {
        for (const grade in value) {
            if (value[grade as GradeEnum] < 0) {
                throw new Error(
                    `不正な入力値です。グレード数が負の数 (GradeData[${grade}] : ${value[grade as GradeEnum]}) になりました。`
                );
            }
        }
    }

    /**
     * 空の (すべて0の) GradeDataを生成
     */
    public static createEmpty(): GradeData {
        const emptyCounts: GradeDataValue = {
            [GradeEnum.PM_PLUS]: 0,
            [GradeEnum.PM]: 0,
            [GradeEnum.EX_PLUS]: 0,
            [GradeEnum.EX]: 0,
            [GradeEnum.AA]: 0,
            [GradeEnum.A]: 0,
            [GradeEnum.B]: 0,
            [GradeEnum.C]: 0,
            [GradeEnum.D]: 0,
            [GradeEnum.NOT_PLAYED]: 0,
        };
        return new GradeData(emptyCounts);
    }

    equals(other: ValueObject<GradeDataValue, "GradeData">): boolean {
        for (const grade in this.value) {
            if (this.value[grade as GradeEnum] !== other.value[grade as GradeEnum]) return false;
        }
        return true;
    }

    /**
     * 特定のグレードを1つ増やす
     * @param grade インクリメントするグレード
     * @returns 新しいGradeDataインスタンス
     */
    public increment(grade: GradeEnum): GradeData {
        const newCounts = { ...this._value };
        newCounts[grade]++;
        return new GradeData(newCounts);
    }

    /**
     * 別のGradeDataを加算
     * @param other 加算するGradeData
     * @returns 新しいGradeDataインスタンス
     */
    public plus(other: GradeData): GradeData {
        const newCounts = { ...this._value };
        for (const grade in newCounts) {
            newCounts[grade as GradeEnum] += other._value[grade as GradeEnum];
        }
        return new GradeData(newCounts);
    }

    /**
     * 値を取得するためのgetter
     */
    public get counts(): GradeDataValue {
        // 外部で変更できないように、コピーを返す
        return { ...this._value };
    }
}
