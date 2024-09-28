import { Version } from "./version";

describe("Version", () => {
    it("正しい値とバージョン表記を返すVersionを作る", () => {
        const major = 1;
        const minor = 10;

        const version = new Version({ major, minor });
        expect(version.versionString()).toBe("1.10");
        expect(version.major).toBe(major);
        expect(version.minor).toBe(minor);
    });

    it("equals", () => {
        const version1 = new Version({ major: 3, minor: 4 });
        const version2 = new Version({ major: 3, minor: 4 });
        const version3 = new Version({ major: 1, minor: 10 });
        expect(version1.equals(version2)).toBeTruthy();
        expect(version1.equals(version3)).toBeFalsy();
    });

    describe("fromString", () => {
        it("正しい文字列", () => {
            expect(Version.fromString("1.5").versionString()).toBe("1.5");

            const version = Version.fromString("4.10");
            expect(version.major).toBe(4);
            expect(version.minor).toBe(10);
        });

        it("不正な文字列", () => {
            expect(() => Version.fromString("foo")).toThrow("Versionの入力が不正です");
        });
    });
});
