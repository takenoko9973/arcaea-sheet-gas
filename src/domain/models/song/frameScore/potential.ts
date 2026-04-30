import { ValueObject } from "@/domain/models/shared/valueObject";

type FrameScoreValue = number;
export class FrameScore extends ValueObject<FrameScoreValue, "FrameScore"> {
    constructor(value: FrameScoreValue) {
        super(value);
    }

    protected validate(value: FrameScoreValue): void {
        if (value < 0) {
            throw new Error(`フレーム値は0以上の数値である必要があります (${value})`);
        }
    }

    equals(other: ValueObject<FrameScoreValue, "FrameScore">): boolean {
        return this.value === other.value;
    }
}
