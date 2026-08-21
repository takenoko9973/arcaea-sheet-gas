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

function createExistingSong(isRegularlyPlayable: boolean, constant = 0) {
    const song = {
        songData: { nameJp: "曲" },
        difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
        level: new Level("10"),
        constant: new Constant(constant),
        songNotes: new SongNotes(1000),
        isRegularlyPlayable: vi.fn().mockReturnValue(isRegularlyPlayable),
        changeDifficulty: vi.fn(),
        changeChartData: vi.fn(),
    };
    song.changeDifficulty.mockReturnValue(song);
    song.changeChartData.mockReturnValue(song);
    return song;
}

function createDto(constant = 0) {
    return {
        songTitle: "song",
        nameJp: "曲",
        nameEn: "Song",
        composer: "Composer",
        side: "光",
        difficulty: DifficultyEnum.FUTURE,
        level: "10",
        constant,
        notes: "1000",
        urlName: "song-page",
    };
}

function mockRepositories(existingSong: ReturnType<typeof createExistingSong>, dto = createDto()) {
    const songRepository = {
        findSong: vi.fn().mockReturnValue(existingSong),
        save: vi.fn(),
        flush: vi.fn(),
    };
    const collectionRepository = {
        fetchByDifficulty: vi.fn().mockReturnValue([dto]),
    };
    vi.spyOn(repositories, "song").mockReturnValue(
        songRepository as unknown as ReturnType<typeof repositories.song>
    );
    vi.spyOn(repositories, "songCollection").mockReturnValue(
        collectionRepository as unknown as ReturnType<typeof repositories.songCollection>
    );
    return songRepository;
}

describe("updateData wiki constant backfill", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("定常的に遊べるconstant 0の譜面をWiki定数で更新する", () => {
        const existingSong = createExistingSong(true);
        const songRepository = mockRepositories(existingSong);
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

        const result = updateData(DifficultyEnum.FUTURE, wikiProvider);

        expect(wikiProvider.fetchSongData).toHaveBeenCalledWith("song-page");
        expect(existingSong.changeChartData).toHaveBeenCalledTimes(1);
        const chartData = existingSong.changeChartData.mock.calls[0][0];
        expect(chartData.constant.value).toBe(10.5);
        expect(songRepository.save).toHaveBeenCalledTimes(1);
        expect(songRepository.flush).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ changed: 1, failures: [] });
    });

    it("登録済みconstantが0でもCollectionに定数があればWikiを取得せず補完する", () => {
        const existingSong = createExistingSong(true);
        const songRepository = mockRepositories(existingSong, createDto(10.4));
        const wikiProvider = { fetchSongData: vi.fn() };

        const result = updateData(DifficultyEnum.FUTURE, wikiProvider);

        expect(wikiProvider.fetchSongData).not.toHaveBeenCalled();
        const chartData = existingSong.changeChartData.mock.calls[0][0];
        expect(chartData.constant.value).toBe(10.4);
        expect(songRepository.save).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ changed: 1, failures: [] });
    });

    it("登録済みconstantが非0ならCollectionが0でもWikiを取得しない", () => {
        const existingSong = createExistingSong(true, 10.3);
        const songRepository = mockRepositories(existingSong);
        const wikiProvider = { fetchSongData: vi.fn() };

        const result = updateData(DifficultyEnum.FUTURE, wikiProvider);

        expect(wikiProvider.fetchSongData).not.toHaveBeenCalled();
        expect(existingSong.changeChartData).not.toHaveBeenCalled();
        expect(songRepository.save).not.toHaveBeenCalled();
        expect(result).toMatchObject({ changed: 0, failures: [] });
    });

    it("定常的に遊べないconstant 0の譜面はWikiを取得しない", () => {
        const existingSong = createExistingSong(false);
        const songRepository = mockRepositories(existingSong);
        const wikiProvider = { fetchSongData: vi.fn() };

        const result = updateData(DifficultyEnum.FUTURE, wikiProvider);

        expect(wikiProvider.fetchSongData).not.toHaveBeenCalled();
        expect(songRepository.save).not.toHaveBeenCalled();
        expect(songRepository.flush).not.toHaveBeenCalled();
        expect(result).toMatchObject({ changed: 0, failures: [] });
    });
});
