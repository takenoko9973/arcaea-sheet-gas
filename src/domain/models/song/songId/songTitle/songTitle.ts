import { ValueObject } from "domain/models/shared/valueObject";

type SongTitleValue = string;
export class SongTitle extends ValueObject<SongTitleValue, "SongTitle"> {
    constructor(value: SongTitleValue) {
        super(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected validate(value: string): void {}

    equals(other: SongTitle): boolean {
        return this.value === other.value;
    }
}
