import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { Song } from "@/domain/models/song/song";
import { SongFactory } from "@/domain/models/song/songFactory";
import { SongCollectionRepository } from "@/infrastructure/repositories/songCollectionRepository";
import { SongRepository } from "@/infrastructure/repositories/songRepository";

import { registerSongData } from "./registerSong";

jest.mock("domain/models/song/songFactory");
jest.mock("infrastructure/repositories/songRepository");
jest.mock("infrastructure/repositories/songCollectionRepository");

describe("registerSongData", () => {
    const mockedSongFactory = jest.mocked(SongFactory);
    const mockedSongRepository = jest.mocked(SongRepository);
    const mockedSongCollectionRepository = jest.mocked(SongCollectionRepository);

    const mockSongRepositoryInstance = {
        findSong: jest.fn(),
        save: jest.fn(),
        flush: jest.fn(),
        isIgnoreConstant: jest.fn(),
    };

    const mockSongCollectionRepositoryInstance = {
        fetchByDifficulty: jest.fn(),
    };

    beforeAll(() => {
        Object.defineProperty(mockedSongRepository, "instance", {
            get: jest.fn().mockReturnValue(mockSongRepositoryInstance),
        });
        Object.defineProperty(mockedSongCollectionRepository, "instance", {
            get: jest.fn().mockReturnValue(mockSongCollectionRepositoryInstance),
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    function createWikiProvider(constant = 11.0) {
        return {
            fetchSongData: jest.fn().mockReturnValue({
                composer: "Wiki Composer",
                pack: "Test Pack",
                version: "2.0.0",
                side: "光(光)",
                charts: [
                    {
                        difficulty: DifficultyEnum.FUTURE,
                        level: "11",
                        notes: 1200,
                        constant,
                    },
                ],
            }),
        };
    }

    function expectFactoryConstant(expected: number) {
        const calls = mockedSongFactory.createFromCollectionDto.mock.calls;
        expect(calls[calls.length - 1]?.[1]).toEqual(
            expect.objectContaining({ constant: expected })
        );
    }

    it("新曲を登録し、WikiProviderから詳細を取得する", () => {
        const mockWikiProvider = createWikiProvider(10.5);
        const mockSongDto = {
            songTitle: "new-song",
            nameJp: "新しい曲",
            nameEn: "new-song",
            composer: "Collection Composer",
            side: "光",
            difficulty: DifficultyEnum.FUTURE,
            level: "11",
            constant: "10.5",
            notes: "1200",
            urlName: "new-song-url",
        };

        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([mockSongDto]);
        mockSongRepositoryInstance.isIgnoreConstant.mockReturnValue(false);
        mockSongRepositoryInstance.findSong.mockReturnValue(null);

        const result = registerSongData(DifficultyEnum.FUTURE, mockWikiProvider);

        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalledTimes(1);
        expect(mockWikiProvider.fetchSongData).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.save).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.flush).toHaveBeenCalledTimes(1);
        expectFactoryConstant(10.5);
        expect(result).toMatchObject({ processed: 1, changed: 1, skipped: 0, failures: [] });
    });

    it("登録済みの曲はWikiProviderを呼ばずにスキップする", () => {
        const mockWikiProvider = createWikiProvider();
        const mockSongDto = {
            songTitle: "existing-song",
            nameJp: "既存の曲",
            nameEn: "existing-song",
            composer: "Collection Composer",
            side: "光",
            difficulty: DifficultyEnum.FUTURE,
            level: "10",
            constant: "10.0",
            notes: "1000",
            urlName: "existing-song-url",
        };

        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([mockSongDto]);
        mockSongRepositoryInstance.isIgnoreConstant.mockReturnValue(false);
        mockSongRepositoryInstance.findSong.mockReturnValue({} as Song);

        registerSongData(DifficultyEnum.FUTURE, mockWikiProvider);

        expect(mockSongRepositoryInstance.findSong).toHaveBeenCalledTimes(1);
        expect(mockWikiProvider.fetchSongData).not.toHaveBeenCalled();
        expect(mockSongRepositoryInstance.save).not.toHaveBeenCalled();
        expect(mockSongRepositoryInstance.flush).not.toHaveBeenCalled();
    });

    it("1曲のWiki失敗後も後続曲の登録を継続する", () => {
        const mockWikiProvider = createWikiProvider();
        mockWikiProvider.fetchSongData
            .mockImplementationOnce(() => {
                throw new Error("Wiki failure");
            })
            .mockReturnValueOnce({
                composer: "Wiki Composer",
                pack: "Test Pack",
                version: "2.0.0",
                side: "光(光)",
                charts: [
                    {
                        difficulty: DifficultyEnum.FUTURE,
                        level: "11",
                        notes: 1200,
                        constant: 11.0,
                    },
                ],
            });
        const createDto = (songTitle: string, urlName: string) => ({
            songTitle,
            nameJp: songTitle,
            nameEn: songTitle,
            composer: "Collection Composer",
            side: "光",
            difficulty: DifficultyEnum.FUTURE,
            level: "11",
            constant: "11.0",
            notes: "1200",
            urlName,
        });

        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([
            createDto("failed-song", "failed-url"),
            createDto("following-song", "following-url"),
        ]);
        mockSongRepositoryInstance.isIgnoreConstant.mockReturnValue(false);
        mockSongRepositoryInstance.findSong.mockReturnValue(null);

        const result = registerSongData(DifficultyEnum.FUTURE, mockWikiProvider);

        expect(mockWikiProvider.fetchSongData).toHaveBeenCalledTimes(2);
        expect(mockSongRepositoryInstance.save).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.flush).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ processed: 1, changed: 1, skipped: 0 });
        expect(result.failures).toHaveLength(1);
        expect(result.failures[0]).toMatchObject({
            song: "failed-song",
            name: "failed-song",
            difficulty: DifficultyEnum.FUTURE,
            operation: "register",
        });
    });

    it("定数確認無視設定ではCollectionの定数欠損をWikiで補完して登録する", () => {
        const mockWikiProvider = createWikiProvider(10.5);
        const mockSongDto = {
            songTitle: "constant-missing-song",
            nameJp: "定数欠損曲",
            nameEn: "constant-missing-song",
            composer: "Collection Composer",
            side: "光",
            difficulty: DifficultyEnum.FUTURE,
            level: "11",
            constant: "",
            notes: "1200",
            urlName: "constant-missing-url",
        };

        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([mockSongDto]);
        mockSongRepositoryInstance.isIgnoreConstant.mockReturnValue(true);
        mockSongRepositoryInstance.findSong.mockReturnValue(null);

        const result = registerSongData(DifficultyEnum.FUTURE, mockWikiProvider);

        expect(mockWikiProvider.fetchSongData).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.save).toHaveBeenCalledTimes(1);
        expectFactoryConstant(10.5);
        expect(result).toMatchObject({ processed: 1, changed: 1, skipped: 0, failures: [] });
    });

    it("定数欠損でもignore設定が無効ならWikiの定数で登録を試行する", () => {
        const mockWikiProvider = createWikiProvider(10.5);
        const mockSongDto = {
            songTitle: "constant-missing-without-ignore-song",
            nameJp: "定数欠損・無視設定なし曲",
            nameEn: "constant-missing-without-ignore-song",
            composer: "Collection Composer",
            side: "光",
            difficulty: DifficultyEnum.FUTURE,
            level: "11",
            constant: "",
            notes: "1200",
            urlName: "constant-missing-without-ignore-url",
        };

        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([mockSongDto]);
        mockSongRepositoryInstance.isIgnoreConstant.mockReturnValue(false);
        mockSongRepositoryInstance.findSong.mockReturnValue(null);

        const result = registerSongData(DifficultyEnum.FUTURE, mockWikiProvider);

        expect(mockWikiProvider.fetchSongData).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.save).toHaveBeenCalledTimes(1);
        expectFactoryConstant(10.5);
        expect(result).toMatchObject({ processed: 1, changed: 1, skipped: 0, failures: [] });
    });

    it("定数欠損かつWikiの定数がnullなら0補完せず失敗する", () => {
        const mockWikiProvider = {
            fetchSongData: jest.fn().mockReturnValue({
                composer: "Wiki Composer",
                pack: "Test Pack",
                version: "2.0.0",
                side: "光(光)",
                charts: [
                    {
                        difficulty: DifficultyEnum.FUTURE,
                        level: "11",
                        notes: 1200,
                        constant: null,
                    },
                ],
            }),
        };
        const mockSongDto = {
            songTitle: "constant-missing-wiki-null-song",
            nameJp: "定数欠損・Wiki null曲",
            nameEn: "constant-missing-wiki-null-song",
            composer: "Collection Composer",
            side: "光",
            difficulty: DifficultyEnum.FUTURE,
            level: "11",
            constant: "",
            notes: "1200",
            urlName: "constant-missing-wiki-null-url",
        };

        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([mockSongDto]);
        mockSongRepositoryInstance.isIgnoreConstant.mockReturnValue(false);
        mockSongRepositoryInstance.findSong.mockReturnValue(null);

        const result = registerSongData(DifficultyEnum.FUTURE, mockWikiProvider);

        expect(mockWikiProvider.fetchSongData).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.save).not.toHaveBeenCalled();
        expect(mockSongRepositoryInstance.flush).not.toHaveBeenCalled();
        expect(result).toMatchObject({ processed: 0, changed: 0, skipped: 0 });
        expect(result.failures).toHaveLength(1);
    });

    it("定数欠損かつWikiの定数がnullでもignore設定が有効なら0で登録する", () => {
        const mockWikiProvider = {
            fetchSongData: jest.fn().mockReturnValue({
                composer: "Wiki Composer",
                pack: "Test Pack",
                version: "2.0.0",
                side: "光(光)",
                charts: [
                    {
                        difficulty: DifficultyEnum.FUTURE,
                        level: "11",
                        notes: 1200,
                        constant: null,
                    },
                ],
            }),
        };
        const mockSongDto = {
            songTitle: "constant-missing-wiki-null-with-ignore-song",
            nameJp: "定数欠損・Wiki null・無視設定あり曲",
            nameEn: "constant-missing-wiki-null-with-ignore-song",
            composer: "Collection Composer",
            side: "光",
            difficulty: DifficultyEnum.FUTURE,
            level: "11",
            constant: "",
            notes: "1200",
            urlName: "constant-missing-wiki-null-with-ignore-url",
        };

        mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([mockSongDto]);
        mockSongRepositoryInstance.isIgnoreConstant.mockReturnValue(true);
        mockSongRepositoryInstance.findSong.mockReturnValue(null);

        const result = registerSongData(DifficultyEnum.FUTURE, mockWikiProvider);

        expect(mockSongRepositoryInstance.save).toHaveBeenCalledTimes(1);
        expect(mockSongRepositoryInstance.flush).toHaveBeenCalledTimes(1);
        expectFactoryConstant(0);
        expect(result).toMatchObject({ processed: 1, changed: 1, skipped: 0, failures: [] });
    });

    it.each([false, true])(
        "定数確認無視設定(%s)でも既知のCollection定数との矛盾は失敗にする",
        ignoreConstant => {
            const mockWikiProvider = {
                fetchSongData: jest.fn().mockReturnValue({
                    composer: "Wiki Composer",
                    pack: "Test Pack",
                    version: "2.0.0",
                    side: "光(光)",
                    charts: [
                        {
                            difficulty: DifficultyEnum.FUTURE,
                            level: "11",
                            notes: 1200,
                            constant: 10.6,
                        },
                    ],
                }),
            };
            const mockSongDto = {
                songTitle: "constant-conflict-song",
                nameJp: "定数矛盾曲",
                nameEn: "constant-conflict-song",
                composer: "Collection Composer",
                side: "光",
                difficulty: DifficultyEnum.FUTURE,
                level: "11",
                constant: "10.5",
                notes: "1200",
                urlName: "constant-conflict-url",
            };

            mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([mockSongDto]);
            mockSongRepositoryInstance.isIgnoreConstant.mockReturnValue(ignoreConstant);
            mockSongRepositoryInstance.findSong.mockReturnValue(null);

            const result = registerSongData(DifficultyEnum.FUTURE, mockWikiProvider);

            expect(mockWikiProvider.fetchSongData).toHaveBeenCalledTimes(1);
            expect(mockSongRepositoryInstance.save).not.toHaveBeenCalled();
            expect(mockSongRepositoryInstance.flush).not.toHaveBeenCalled();
            expect(result).toMatchObject({ processed: 0, changed: 0, skipped: 0 });
            expect(result.failures).toHaveLength(1);
        }
    );

    it.each([false, true])(
        "Collection既知定数はWikiがnullでもignore設定(%s)に関わらず優先する",
        ignoreConstant => {
            const mockWikiProvider = {
                fetchSongData: jest.fn().mockReturnValue({
                    composer: "Wiki Composer",
                    pack: "Test Pack",
                    version: "2.0.0",
                    side: "光(光)",
                    charts: [
                        {
                            difficulty: DifficultyEnum.FUTURE,
                            level: "11",
                            notes: 1200,
                            constant: null,
                        },
                    ],
                }),
            };
            const mockSongDto = {
                songTitle: "constant-known-wiki-null-song",
                nameJp: "Collection既知・Wiki null曲",
                nameEn: "constant-known-wiki-null-song",
                composer: "Collection Composer",
                side: "光",
                difficulty: DifficultyEnum.FUTURE,
                level: "11",
                constant: "10.5",
                notes: "1200",
                urlName: "constant-known-wiki-null-url",
            };

            mockSongCollectionRepositoryInstance.fetchByDifficulty.mockReturnValue([mockSongDto]);
            mockSongRepositoryInstance.isIgnoreConstant.mockReturnValue(ignoreConstant);
            mockSongRepositoryInstance.findSong.mockReturnValue(null);

            const result = registerSongData(DifficultyEnum.FUTURE, mockWikiProvider);

            expect(mockSongRepositoryInstance.save).toHaveBeenCalledTimes(1);
            expectFactoryConstant(10.5);
            expect(result).toMatchObject({ processed: 1, changed: 1, skipped: 0, failures: [] });
        }
    );
});
