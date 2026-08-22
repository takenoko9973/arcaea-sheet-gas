import { vi } from "vitest";

import { Constant } from "@/domain/models/song/chartData/constant/constant";
import { SongNotes } from "@/domain/models/song/chartData/notes/songNotes";
import {
    DifficultyEnum,
    DifficultyName,
} from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { Level } from "@/domain/models/song/difficulty/level/level";
import { SongCollectionRepository } from "@/infrastructure/repositories/songCollectionRepository";
import { SongRepository } from "@/infrastructure/repositories/songRepository";

import { updateData } from "./updateData";

vi.mock("@/infrastructure/repositories/songRepository");
vi.mock("@/infrastructure/repositories/songCollectionRepository");

describe("updateData", () => {
    const mockedSongRepository = vi.mocked(SongRepository);
    const mockedSongCollectionRepository = vi.mocked(SongCollectionRepository);

    const mockSongRepositoryInstance = {
        findSong: vi.fn(),
        save: vi.fn(),
        flush: vi.fn(),
    };
    const mockSongCollectionRepositoryInstance = {
        fetchByDifficulty: vi.fn(),
    };
    const mockWikiProvider = {
        fetchSongData: vi.fn(),
    };

    beforeAll(() => {
        Object.defineProperty(mockedSongRepository, "instance", {
            get: vi.fn().mockReturnValue(mockSongRepositoryInstance),
        });
        Object.defineProperty(mockedSongCollectionRepository, "instance", {
            get: vi.fn().mockReturnValue(mockSongCollectionRepositoryInstance),
        });
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Levelは更新するが、既知の譜面定数はCollection値で上書きしない", () => {
        const dto = {
            songTitle: "test-song",
            nameJp: "更新曲名",
            level: "11+",
            constant: 11.7,
            notes: "1300",
        };
        const existingSong = {
            songData: { nameJp: "テストソング" },
            difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
            level: new Level("11"),
            constant: new Constant(11.6),
            songNotes: new SongNotes(1300),
            changeDifficulty: vi.fn(),
            changeChartData: vi.fn(),
        };
        existingSong.changeDifficulty.mockReturnValue(existingSong);
        existingSong.changeChartData.mockReturnValue(existingSong);

        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([dto]);
        mockSongRepositoryInstance.findSong.mockReturnValue(existingSong);

        updateData(DifficultyEnum.FUTURE, mockWikiProvider);

        expect(existingSong.changeDifficulty).toHaveBeenCalledTimes(1);
        expect(existingSong.changeChartData).not.toHaveBeenCalled();
        expect(mockSongRepositoryInstance.save).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.flush).toHaveBeenCalledTimes(1);
    });

    it("更新がない場合、更新処理が実行されない", () => {
        const dto = {
            songTitle: "test-song",
            nameJp: "同じ曲名",
            level: "11",
            constant: 11.4,
            notes: "1300",
        };
        const existingSong = {
            songData: { nameJp: "同じ曲名" },
            difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
            level: new Level("11"),
            constant: new Constant(11.4),
            songNotes: new SongNotes(1300),
            changeDifficulty: vi.fn(),
            changeChartData: vi.fn(),
        };

        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([dto]);
        mockSongRepositoryInstance.findSong.mockReturnValue(existingSong);

        updateData(DifficultyEnum.FUTURE, mockWikiProvider);

        expect(existingSong.changeDifficulty).not.toHaveBeenCalled();
        expect(existingSong.changeChartData).not.toHaveBeenCalled();
        expect(mockSongRepositoryInstance.save).not.toHaveBeenCalled();
        expect(mockSongRepositoryInstance.flush).not.toHaveBeenCalled();
    });

    it("1曲の処理失敗後も後続曲を更新する", () => {
        const changedSong = {
            songData: { nameJp: "後続曲" },
            difficultyName: new DifficultyName(DifficultyEnum.FUTURE),
            level: new Level("11"),
            constant: new Constant(11.0),
            songNotes: new SongNotes(1000),
            changeDifficulty: vi.fn(),
            changeChartData: vi.fn(),
        };
        changedSong.changeDifficulty.mockReturnValue(changedSong);
        changedSong.changeChartData.mockReturnValue(changedSong);
        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([
            {
                songTitle: "failed-song",
                nameJp: "失敗曲",
                level: "11",
                constant: 11,
                notes: "1000",
            },
            {
                songTitle: "following-song",
                nameJp: "後続曲",
                level: "11+",
                constant: 11,
                notes: "1000",
            },
        ]);
        mockSongRepositoryInstance.findSong
            .mockImplementationOnce(() => {
                throw new Error("Collection processing failure");
            })
            .mockReturnValueOnce(changedSong);

        const result = updateData(DifficultyEnum.FUTURE, mockWikiProvider);

        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalledTimes(2);
        expect(mockSongRepositoryInstance.save).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.flush).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ processed: 1, changed: 1, skipped: 0 });
        expect(result.failures).toHaveLength(1);
        expect(result.failures[0]).toMatchObject({
            song: "failed-song",
            difficulty: DifficultyEnum.FUTURE,
            operation: "update",
        });
    });
});
