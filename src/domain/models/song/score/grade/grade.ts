import { ValueObject } from "../../../shared/valueObject";

export enum GradeEnum {
    PM_PLUS = "PM+",
    PM = "PM",
    EX_PLUS = "EX+",
    EX = "EX",
    AA = "AA",
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    NOT_PLAYED = "NP",
}

type GradeValue = GradeEnum;
export class Grade extends ValueObject<GradeValue, "Grade"> {
    constructor(value: GradeValue) {
        super(value);
    }

    protected validate(value: GradeValue): void {
        if (!Object.values(GradeEnum).includes(value)) {
            throw new Error("無効なグレードです。");
        }
    }

    equals(others: Grade): boolean {
        return this.value === others.value;
    }
}
