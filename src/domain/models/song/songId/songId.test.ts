import { DifficultyEnum, DifficultyName } from "../difficulty/difficultyName/difficultyName";
import { SongId } from "./songId";
import { SongTitle } from "./songTitle/songTitle";

describe("SongId", () => {
    it("正しい値とバージョン表記を返すSongIdを作る", () => {
        const songId = new SongId("hoge");
        expect(songId.value).toBe(`hoge`);
    });

    it("equals", () => {
        const songId1 = new SongId("hoge");
        const songId2 = new SongId("hoge");
        const songId3 = new SongId("foo");

        expect(songId1.equals(songId2)).toBeTruthy();
        expect(songId1.equals(songId3)).toBeFalsy();
    });
});
