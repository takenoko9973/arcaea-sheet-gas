import { SongTitle } from "./songTitle";

describe("SongTitle", () => {
    it("正しい値を返すSongTitleを作る", () => {
        const title = "hoge";
        const version = new SongTitle(title);
        expect(version.value).toBe(title);
    });

    it("equals", () => {
        const title1 = new SongTitle("hoge");
        const title2 = new SongTitle("hoge");
        const title3 = new SongTitle("foo");
        expect(title1.equals(title2)).toBeTruthy();
        expect(title1.equals(title3)).toBeFalsy();
    });
});
