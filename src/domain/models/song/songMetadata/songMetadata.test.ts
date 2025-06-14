import { Pack } from "./pack/pack";
import { Side, SideEnum } from "./side/side";
import { SongMetadata } from "./songMetadata";
import { Version } from "./version/version";

describe("SongMetadata", () => {
    it("正しい値とバージョン表記を返すSongMetadataを作る", () => {
        const songMetadata = new SongMetadata({
            pack: new Pack("hoge"),
            side: new Side(SideEnum.LIGHT),
            version: Version.fromString("1.1"),
        });
        expect(songMetadata.pack.value).toBe("hoge");
        expect(songMetadata.side.value).toBe(SideEnum.LIGHT);
        expect(songMetadata.version.toString()).toBe("1.1");
    });

    it("equals", () => {
        const difficulty1 = new SongMetadata({
            pack: new Pack("hoge"),
            side: new Side(SideEnum.LIGHT),
            version: Version.fromString("1.1"),
        });
        const difficulty2 = new SongMetadata({
            pack: new Pack("hoge"),
            side: new Side(SideEnum.LIGHT),
            version: Version.fromString("1.1"),
        });
        const difficulty3 = new SongMetadata({
            pack: new Pack("hoge2"),
            side: new Side(SideEnum.LIGHT),
            version: Version.fromString("1.1"),
        });
        const difficulty4 = new SongMetadata({
            pack: new Pack("hoge"),
            side: new Side(SideEnum.CONFLICT),
            version: Version.fromString("1.1"),
        });
        const difficulty5 = new SongMetadata({
            pack: new Pack("hoge"),
            side: new Side(SideEnum.LIGHT),
            version: Version.fromString("6.1"),
        });
        expect(difficulty1.equals(difficulty2)).toBeTruthy();
        expect(difficulty1.equals(difficulty3)).toBeFalsy();
        expect(difficulty1.equals(difficulty4)).toBeFalsy();
        expect(difficulty1.equals(difficulty5)).toBeFalsy();
    });
});
