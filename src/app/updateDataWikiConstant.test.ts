import { vi } from "vitest";

import { repositories } from "@/app/dependencies";
import { Constant } from "@/domain/models/song/chartData/constant/constant";
import { SongNotes } from "@/domain/models/song/chartData/notes/songNotes";
import {
    DifficultyEnum,
    DifficultyName,
} from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { Level } from "@/domain/models/song/difficulty/level/level";

import { updateData } from "./updateData";

function createExistingSong(isRegularlyPlayable: boolean) {
    const song = {
        songData: { nameJp: "曲" },
        difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
        level: new Level("10"),
        constant: new Constant(0),
        songNotes: new SongNotes(1000),
        isRegularlyPlayable: vi.fn().mockReturnValue(isRegularlyPlayable),
        changeDifficulty: vi.fn(),
        changeChartData: vi.fn(),
    };
    song.changeDifficulty.mockReturnValue(song);
    song.changeChartData.mockReturnValue(song);
    return song;
}

function createDto() {
    return {
        songTitle: "song",
        nameJp: "曲",
        nameEn: "Song",
        composer: "Composer",
        side: "光",
        difficulty: DifficultyEnum.FUTURE,
        level: "10",
        constant: 0,
        notes: "1000",
        urlName: "song-page",
    };
}

describe("updateData wiki constant backfill", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("定常的に遊べるconstant 0の譜面をWiki定数で更新する", () => {
        const existingSong = createExistingSong(true);
        const songRepository = {
            findSong: vi.fn().mockReturnValue(existingSong),
            save: vi.fn(),
            flush: vi.fn(),
        };
        const collectionRepository = {
            fetchByDifficulty: vi.fn().mockReturnValue([createDto()]),
        };
        const wikiProvider = {
            fetchSongData: vi.fn().mockReturnValue({
                composer: "Composer",
                pack: "Arcaea",
                version: "1.0",
                side: "光(光)",
                charts: [
                    {
                        difficulty: DifficultyEnum.FUTURE,
                        level: "10",
                        notes: 1000,
                        constant: 10.5,
                    },
                ],
            }),
        };
        vi.spyOn(repositories, "song").mockReturnValue(
            songRepository as unknown as ReturnType<typeof repositories.song>
        );
        vi.spyOn(repositories, "songCollection").mockReturnValue(
            collectionRepository as unknown as ReturnType<typeof repositories.songCollection>
        );

        const result = updateData(DifficultyEnum.FUTURE, wikiProvider);

        expect(wikiProvider.fetchSongData).toHaveBeenCalledWith("song-page");
        expect(existingSong.changeChartData).toHaveBeenCalledTimes(1);
        const chartData = existingSong.changeChartData.mock.calls[0][0];
        expect(chartData.constant.value).toBe(10.5);
        expect(songRepository.save).toHaveBeenCalledTimes(1);
        expect(songRepository.flush).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ changed: 1, failures: [] });
    });

    it("定常的に遊べないconstant 0の譜面はWikiを取得しない", () => {
        const existingSong = createExistingSong(false);
        const songRepository = {
            findSong: vi.fn().mockReturnValue(existingSong),
            save: vi.fn(),
            flush: vi.fn(),
        };
        const collectionRepository = {
            fetchByDifficulty: vi.fn().mockReturnValue([createDto()]),
        };
        const wikiProvider = { fetchSongData: vi.fn() };
        vi.spyOn(repositories, "song").mockReturnValue(
            songRepository as unknown as ReturnType<typeof repositories.song>
        );
        vi.spyOn(repositories, "songCollection").mockReturnValue(
            collectionRepository as unknown as ReturnType<typeof repositories.songCollection>
        );

        const result = updateData(DifficultyEnum.FUTURE, wikiProvider);

        expect(wikiProvider.fetchSongData).not.toHaveBeenCalled();
        expect(songRepository.save).not.toHaveBeenCalled();
        expect(songRepository.flush).not.toHaveBeenCalled();
        expect(result).toMatchObject({ changed: 0, failures: [] });
    });
});
