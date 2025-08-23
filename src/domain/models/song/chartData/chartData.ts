import { ValueObject } from "@/domain/models/shared/valueObject";

import { Constant } from "./constant/constant";
import { SongNotes } from "./notes/songNotes";

type ChartDataValue = { songNotes: SongNotes; constant: Constant };
export class ChartData extends ValueObject<ChartDataValue, "DifficultyData"> {
    constructor(value: ChartDataValue) {
        super(value);
    }

    protected validate(value: ChartDataValue): void {
        if (value.songNotes.value <= 0) {
            throw new Error(`ノーツ数は0以下で入力しないでください (${value})`);
        }
    }

    equals(other: ChartData): boolean {
        return this.songNotes.equals(other.songNotes) && this.constant.equals(other.constant);
    }

    get songNotes(): ChartDataValue["songNotes"] {
        return this.value.songNotes;
    }

    get constant(): ChartDataValue["constant"] {
        return this.value.constant;
    }
}
