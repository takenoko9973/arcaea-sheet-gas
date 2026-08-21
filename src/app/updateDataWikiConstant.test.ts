import { vi } from "vitest";

import { providers, repositories } from "@/app/dependencies";
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

function createDto(constant: number | "--" = 0) {
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
    vi.spyOn(repositories, "songCollection").mockReturnValue(collectionRepository);
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
        const chartData = existingSong.changeChartData.mock.calls[0][0] as unknown as {
            constant: { value: number };
        };
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
        const chartData = existingSong.changeChartData.mock.calls[0][0] as unknown as {
            constant: { value: number };
        };
        expect(chartData.constant.value).toBe(10.4);
        expect(songRepository.save).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ changed: 1, failures: [] });
    });

    it("Collection定数が--でも既存constant 0を維持し、Wikiを取得せずLevelとNotesを更新する", () => {
        const existingSong = createExistingSong(true);
        const dto = { ...createDto("--"), level: "10+", notes: "1100" };
        const songRepository = mockRepositories(existingSong, dto);
        const wikiProvider = { fetchSongData: vi.fn() };

        const result = updateData(DifficultyEnum.FUTURE, wikiProvider);

        expect(wikiProvider.fetchSongData).not.toHaveBeenCalled();
        expect(existingSong.changeDifficulty).toHaveBeenCalledTimes(1);
        expect(
            (existingSong.changeDifficulty.mock.calls[0][0] as { level: { value: string } }).level
                .value
        ).toBe("10+");
        expect(existingSong.changeChartData).toHaveBeenCalledTimes(1);
        const chartData = existingSong.changeChartData.mock.calls[0][0] as unknown as {
            constant: { value: number };
            songNotes: { value: number };
        };
        expect(chartData.constant.value).toBe(0);
        expect(chartData.songNotes.value).toBe(1100);
        expect(songRepository.save).toHaveBeenCalledTimes(1);
        expect(songRepository.flush).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ changed: 1, failures: [] });
    });

    it("登録済みconstantが非0ならCollectionが異なってもWikiを取得せず上書きしない", () => {
        const existingSong = createExistingSong(true, 10.3);
        const songRepository = mockRepositories(existingSong, createDto(10.4));
        const wikiProvider = { fetchSongData: vi.fn() };

        const result = updateData(DifficultyEnum.FUTURE, wikiProvider);

        expect(wikiProvider.fetchSongData).not.toHaveBeenCalled();
        expect(existingSong.changeChartData).not.toHaveBeenCalled();
        expect(songRepository.save).not.toHaveBeenCalled();
        expect(result).toMatchObject({ changed: 0, failures: [] });
    });

    it.each([
        ["null", null],
        ["非数値", "not-a-number"],
        ["0", 0],
        ["負数", -1],
    ])("Wiki定数が%sなら曲単位の失敗として記録し、0のまま更新しない", (_label, wikiConstant) => {
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
                        // Wikiからの実値を型の外側から注入し、定数検証の境界を確認する。
                        constant: wikiConstant as unknown as number,
                    },
                ],
            }),
        };

        const result = updateData(DifficultyEnum.FUTURE, wikiProvider);

        expect(wikiProvider.fetchSongData).toHaveBeenCalledWith("song-page");
        expect(existingSong.changeChartData).not.toHaveBeenCalled();
        expect(songRepository.save).not.toHaveBeenCalled();
        expect(songRepository.flush).not.toHaveBeenCalled();
        expect(result).toMatchObject({ processed: 0, changed: 0, skipped: 0 });
        expect(result.failures).toHaveLength(1);
        expect(result.failures[0]).toMatchObject({
            song: "song",
            difficulty: DifficultyEnum.FUTURE,
            operation: "update",
        });
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

    it("providerを省略したupdateData呼び出しではWiki providerを1回だけ生成する", () => {
        const existingSong = createExistingSong(true, 10.3);
        mockRepositories(existingSong, createDto(10.4));
        const wikiProvider = { fetchSongData: vi.fn() };
        const wikiProviderFactory = vi.spyOn(providers, "wiki").mockReturnValue(wikiProvider);

        updateData(DifficultyEnum.FUTURE);

        expect(wikiProviderFactory).toHaveBeenCalledTimes(1);
        expect(wikiProvider.fetchSongData).not.toHaveBeenCalled();
    });

    it("同一呼び出し内の複数Wiki補完で同じprovider instanceを共有する", () => {
        const firstSong = createExistingSong(true);
        const secondSong = createExistingSong(true);
        const firstDto = { ...createDto(), songTitle: "first-song", urlName: "first-page" };
        const secondDto = { ...createDto(), songTitle: "second-song", urlName: "second-page" };
        const songRepository = {
            findSong: vi.fn().mockReturnValueOnce(firstSong).mockReturnValueOnce(secondSong),
            save: vi.fn(),
            flush: vi.fn(),
        };
        const collectionRepository = {
            fetchByDifficulty: vi.fn().mockReturnValue([firstDto, secondDto]),
        };
        vi.spyOn(repositories, "song").mockReturnValue(
            songRepository as unknown as ReturnType<typeof repositories.song>
        );
        vi.spyOn(repositories, "songCollection").mockReturnValue(collectionRepository);

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
        const wikiProviderFactory = vi.spyOn(providers, "wiki").mockReturnValue(wikiProvider);

        updateData(DifficultyEnum.FUTURE);

        expect(wikiProviderFactory).toHaveBeenCalledTimes(1);
        expect(wikiProvider.fetchSongData).toHaveBeenNthCalledWith(1, "first-page");
        expect(wikiProvider.fetchSongData).toHaveBeenNthCalledWith(2, "second-page");
        expect(firstSong.changeChartData).toHaveBeenCalledTimes(1);
        expect(secondSong.changeChartData).toHaveBeenCalledTimes(1);
        expect(
            (firstSong.changeChartData.mock.calls[0][0] as { constant: { value: number } }).constant
                .value
        ).toBe(10.5);
        expect(
            (secondSong.changeChartData.mock.calls[0][0] as { constant: { value: number } })
                .constant.value
        ).toBe(10.5);
    });
});
