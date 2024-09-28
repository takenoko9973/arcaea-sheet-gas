import { SongData } from "./songData";

describe("SongData", () => {
    it("正しい値を返すSongDataを作る", () => {
        const value = { nameJp: "hoge", nameEn: "foo", composer: "dog" };
        expect(new SongData(value).nameJp).toBe("hoge");
        expect(new SongData(value).nameEn).toBe("foo");
        expect(new SongData(value).composer).toBe("dog");
    });

    it("equals", () => {
        const songData1 = new SongData({ nameJp: "hoge", nameEn: "foo", composer: "dog" });
        const songData2 = new SongData({ nameJp: "hoge", nameEn: "foo", composer: "dog" });
        // nameJpが異なる
        const songData3 = new SongData({ nameJp: "hoge2", nameEn: "foo", composer: "dog" });
        // nameEnが異なる
        const songData4 = new SongData({ nameJp: "hoge", nameEn: "foo2", composer: "dog" });
        // composerが異なる
        const songData5 = new SongData({ nameJp: "hoge", nameEn: "foo", composer: "dog3" });
        expect(songData1.equals(songData2)).toBeTruthy();
        expect(songData1.equals(songData3)).toBeFalsy();
        expect(songData1.equals(songData4)).toBeFalsy();
        expect(songData1.equals(songData5)).toBeFalsy();
    });
});
