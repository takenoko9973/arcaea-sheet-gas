import { ValueObject } from "domain/models/shared/valueObject";

type VersionValue = { major: number; minor: number };

export class Version extends ValueObject<VersionValue, "Version"> {
    constructor(value: VersionValue) {
        super(value);
    }

    static fromString(version: string) {
        const versionPattern = /(\d+)\.(\d+)/;
        const match = version.match(versionPattern);

        if (match === null) {
            throw new Error(`Versionの入力が不正です (${version})`);
        }

        const major = Number(match?.at(1) ?? "0");
        const minor = Number(match?.at(2) ?? "0");
        return new Version({ major, minor });
    }

    protected validate(value: VersionValue): void {
        if (value.major < 0) {
            throw new Error(`メジャーバージョンが負です (${value.major})`);
        }
        if (value.minor < 0) {
            throw new Error(`マイナーバージョンが負です (${value.minor})`);
        }
    }

    equals(other: Version): boolean {
        return this.value.major === other.value.major && this.value.minor === other.value.minor;
    }

    toString(): string {
        return `${this.value.major}.${this.value.minor}`;
    }

    get major(): VersionValue["major"] {
        return this.value.major;
    }

    get minor(): VersionValue["minor"] {
        return this.value.minor;
    }
}
