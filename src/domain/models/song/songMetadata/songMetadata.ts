import { ValueObject } from "@/domain/models/shared/valueObject";

import { Pack } from "./pack/pack";
import { Side } from "./side/side";
import { Version } from "./version/version";

type SongMetadataValue = { pack: Pack; version: Version; side: Side };
export class SongMetadata extends ValueObject<SongMetadataValue, "Difficulty"> {
    constructor(value: SongMetadataValue) {
        super(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected validate(value: SongMetadataValue): void {}

    equals(other: SongMetadata): boolean {
        return (
            this.pack.equals(other.pack) &&
            this.version.equals(other.version) &&
            this.side.equals(other.side)
        );
    }

    get pack(): SongMetadataValue["pack"] {
        return this.value.pack;
    }

    get version(): SongMetadataValue["version"] {
        return this.value.version;
    }

    get side(): SongMetadataValue["side"] {
        return this.value.side;
    }
}
