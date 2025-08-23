import { ValueObject } from "@/domain/models/shared/valueObject";

type SongIdValue = string;
export class SongId extends ValueObject<SongIdValue, "SongId"> {
    constructor(value: SongIdValue) {
        super(value);
    }

    protected validate(value: SongIdValue): void {
        if (value.trim() === "") {
            throw new Error("SongId が入力されていません");
        }
    }

    equals(other: SongId): boolean {
        return this.value === other.value;
    }
}
