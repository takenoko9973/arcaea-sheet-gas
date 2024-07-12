import { Song } from "../src/class/song";
describe("shinyPure", (): void => {
    test("shiny pure notes calc1", (): void => {
        const record = ["", "", "", "", "", "", "", "", "", 0, 1046, 10001032];
        const song = new Song(record);
        const luckShinyPure = song.notes - song.getHitShinyPureNotes();

        expect(luckShinyPure).toBe(14);
    });

    test("shiny pure notes calc2", (): void => {
        const record = ["", "", "", "", "", "", "", "", "", 0, 1183, 10001145];
        const song = new Song(record);
        const luckShinyPure = song.notes - song.getHitShinyPureNotes();

        expect(luckShinyPure).toBe(38);
    });
});
