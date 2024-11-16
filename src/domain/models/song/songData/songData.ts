import { ValueObject } from "../../shared/valueObject";

type SongDataValue = {
    nameJp: string;
    nameEn: string;
    composer: string;
};

export class SongData extends ValueObject<SongDataValue, "SongData"> {
    constructor(value: SongDataValue) {
        super(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected validate(value: SongDataValue): void {}

    equals(other: SongData): boolean {
        return (
            this.nameJp === other.nameJp &&
            this.nameEn === other.nameEn &&
            this.composer === other.composer
        );
    }

    get nameJp(): SongDataValue["nameJp"] {
        return this.value.nameJp;
    }

    get nameEn(): SongDataValue["nameEn"] {
        return this.value.nameEn;
    }

    get composer(): SongDataValue["composer"] {
        return this.value.composer;
    }
}
