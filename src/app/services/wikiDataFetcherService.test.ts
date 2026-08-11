import { vi } from "vitest";

import { IArcaeaWikiSong } from "@/@types/fetch-arcaea-wiki";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

import { resolveWikiChart, resolveWikiSongDetails, WikiProvider } from "./wikiDataFetcherService";

function createWikiSong(overrides: Partial<IArcaeaWikiSong> = {}): IArcaeaWikiSong {
    return {
        composer: "Wiki Composer",
        pack: "Test Pack",
        version: "6.11.8",
        side: "光(光)",
        charts: [
            {
                difficulty: DifficultyEnum.FUTURE,
                level: "11",
                notes: 1200,
                constant: 11.0,
            },
        ],
        ...overrides,
    };
}

describe("WikiProvider", () => {
    it("取得するまでGatewayを呼ばない", () => {
        const gateway = { createSongData: vi.fn().mockReturnValue(createWikiSong()) };

        new WikiProvider(gateway);

        expect(gateway.createSongData).not.toHaveBeenCalled();
    });

    it("同じpageの成功結果をrun内でcacheする", () => {
        const song = createWikiSong();
        const gateway = { createSongData: vi.fn().mockReturnValue(song) };
        const provider = new WikiProvider(gateway);

        expect(provider.fetchSongData("same-page")).toBe(song);
        expect(provider.fetchSongData("same-page")).toBe(song);

        expect(gateway.createSongData).toHaveBeenCalledTimes(1);
    });

    it("FTRからBYD、ETRへ進んでも同一楽曲のGateway通信を1回にする", () => {
        const song = createWikiSong({
            charts: [
                {
                    difficulty: DifficultyEnum.FUTURE,
                    level: "10",
                    notes: 1000,
                    constant: 10.0,
                },
                {
                    difficulty: DifficultyEnum.BEYOND,
                    level: "10+",
                    notes: 1100,
                    constant: 10.5,
                },
                {
                    difficulty: DifficultyEnum.ETERNAL,
                    level: "11",
                    notes: 1200,
                    constant: 11.0,
                },
            ],
        });
        const gateway = { createSongData: vi.fn().mockReturnValue(song) };
        const provider = new WikiProvider(gateway);
        const createDto = (
            difficulty: DifficultyEnum,
            level: string,
            notes: string,
            constant: string
        ) => ({
            songTitle: "same-song",
            nameJp: "同じ曲",
            nameEn: "same-song",
            composer: "Collection Composer",
            side: "光",
            difficulty,
            level,
            constant,
            notes,
            urlName: "same-page",
        });

        resolveWikiSongDetails(
            createDto(DifficultyEnum.FUTURE, "10", "1000", "10.0"),
            DifficultyEnum.FUTURE,
            provider
        );
        resolveWikiSongDetails(
            createDto(DifficultyEnum.BEYOND, "10+", "1100", "10.5"),
            DifficultyEnum.BEYOND,
            provider
        );
        resolveWikiSongDetails(
            createDto(DifficultyEnum.ETERNAL, "11", "1200", "11.0"),
            DifficultyEnum.ETERNAL,
            provider
        );

        expect(gateway.createSongData).toHaveBeenCalledTimes(1);
    });

    it("同じpageの取得失敗もrun内でcacheする", () => {
        const error = new Error("Gateway failure");
        const gateway = {
            createSongData: vi.fn().mockImplementation(() => {
                throw error;
            }),
        };
        const provider = new WikiProvider(gateway);

        expect(() => provider.fetchSongData("failed-page")).toThrow(error);
        expect(() => provider.fetchSongData("failed-page")).toThrow(error);

        expect(gateway.createSongData).toHaveBeenCalledTimes(1);
    });
});

describe("resolveWikiChart", () => {
    const collectionDto = {
        songTitle: "song",
        nameJp: "曲",
        nameEn: "song",
        composer: "Composer",
        side: "光",
        difficulty: DifficultyEnum.BEYOND,
        level: "9+",
        constant: "9.7",
        notes: "1000",
        urlName: "song",
    };

    it("既知値で対象difficultyの一意な候補を採用する", () => {
        expect(
            resolveWikiChart(collectionDto, DifficultyEnum.BEYOND, [
                {
                    difficulty: DifficultyEnum.BEYOND,
                    level: "9+",
                    notes: 1000,
                    constant: 9.7,
                },
                {
                    difficulty: DifficultyEnum.FUTURE,
                    level: "10",
                    notes: 1100,
                    constant: 10.0,
                },
            ])
        ).toEqual({ level: "9+", notes: 1000, constant: 9.7 });
    });

    it("候補が0件なら失敗する", () => {
        expect(() =>
            resolveWikiChart(collectionDto, DifficultyEnum.BEYOND, [
                {
                    difficulty: DifficultyEnum.BEYOND,
                    level: "9+",
                    notes: 1001,
                    constant: 9.7,
                },
            ])
        ).toThrow();
    });

    it("Wiki chartのnull値は未知値としてCollection既知値を採用する", () => {
        expect(
            resolveWikiChart(collectionDto, DifficultyEnum.BEYOND, [
                {
                    difficulty: DifficultyEnum.BEYOND,
                    level: null,
                    notes: null,
                    constant: null,
                },
            ])
        ).toEqual({ level: "9+", notes: 1000, constant: 9.7 });
    });

    it("候補が複数件なら推測せず失敗する", () => {
        const dto = { ...collectionDto, level: "", constant: "", notes: "" };

        expect(() =>
            resolveWikiChart(dto, DifficultyEnum.BEYOND, [
                {
                    difficulty: DifficultyEnum.BEYOND,
                    level: "9+",
                    notes: 1000,
                    constant: 9.7,
                },
                {
                    difficulty: DifficultyEnum.BEYOND,
                    level: "9+",
                    notes: 1001,
                    constant: 9.8,
                },
            ])
        ).toThrow();
    });

    it("Wiki chartのnull値を未知値としても複数候補なら失敗する", () => {
        const dto = { ...collectionDto, level: "", constant: "", notes: "" };

        expect(() =>
            resolveWikiChart(dto, DifficultyEnum.BEYOND, [
                {
                    difficulty: DifficultyEnum.BEYOND,
                    level: null,
                    notes: 1000,
                    constant: 9.7,
                },
                {
                    difficulty: DifficultyEnum.BEYOND,
                    level: null,
                    notes: 1001,
                    constant: 9.8,
                },
            ])
        ).toThrow();
    });

    it("Last相当の複数BYDを1件に推測選択しない", () => {
        const dto = {
            ...collectionDto,
            level: "",
            constant: "",
            notes: "",
        };
        const charts = [
            {
                difficulty: DifficultyEnum.BEYOND,
                level: "9+",
                notes: 1000,
                constant: 9.6,
            },
            {
                difficulty: DifficultyEnum.BEYOND,
                level: "9+",
                notes: 1100,
                constant: 9.7,
            },
        ];

        expect(() => resolveWikiChart(dto, DifficultyEnum.BEYOND, charts)).toThrow();
        expect(
            resolveWikiChart(
                { ...dto, notes: "1100", constant: "9.7" },
                DifficultyEnum.BEYOND,
                charts
            )
        ).toEqual({ level: "9+", notes: 1100, constant: 9.7 });
    });
});

describe("resolveWikiSongDetails", () => {
    const provider = (song: IArcaeaWikiSong) => ({
        fetchSongData: vi.fn().mockReturnValue(song),
    });

    it("Collectionのcomposer/sideをWiki値より優先する", () => {
        const dto = {
            songTitle: "song",
            nameJp: "曲",
            nameEn: "song",
            composer: "Collection Composer",
            side: "対立",
            difficulty: DifficultyEnum.FUTURE,
            level: "11",
            constant: "11.0",
            notes: "1200",
            urlName: "song",
        };
        const wikiProvider = provider(
            createWikiSong({ composer: "Wiki Composer", side: "光(光)" })
        );

        expect(resolveWikiSongDetails(dto, DifficultyEnum.FUTURE, wikiProvider)).toMatchObject({
            composer: "Collection Composer",
            side: "対立",
        });
    });

    it("Collectionのcomposer/side欠損時はWiki値で補完する", () => {
        const dto = {
            songTitle: "song",
            nameJp: "曲",
            nameEn: "song",
            composer: "",
            side: "",
            difficulty: DifficultyEnum.FUTURE,
            level: "11",
            constant: "11.0",
            notes: "1200",
            urlName: "song",
        };
        const wikiProvider = provider(
            createWikiSong({ composer: "Wiki Composer", side: "対立(対立)" })
        );

        expect(resolveWikiSongDetails(dto, DifficultyEnum.FUTURE, wikiProvider)).toMatchObject({
            composer: "Wiki Composer",
            side: "対立",
        });
    });

    it("packがnullなら登録詳細の解決に失敗する", () => {
        const dto = {
            songTitle: "song",
            nameJp: "曲",
            nameEn: "song",
            composer: "Composer",
            side: "光",
            difficulty: DifficultyEnum.FUTURE,
            level: "11",
            constant: "11.0",
            notes: "1200",
            urlName: "song",
        };

        expect(() =>
            resolveWikiSongDetails(
                dto,
                DifficultyEnum.FUTURE,
                provider(createWikiSong({ pack: null }))
            )
        ).toThrow();
    });

    it("versionがnullなら登録詳細の解決に失敗する", () => {
        const dto = {
            songTitle: "song",
            nameJp: "曲",
            nameEn: "song",
            composer: "Composer",
            side: "光",
            difficulty: DifficultyEnum.FUTURE,
            level: "11",
            constant: "11.0",
            notes: "1200",
            urlName: "song",
        };

        expect(() =>
            resolveWikiSongDetails(
                dto,
                DifficultyEnum.FUTURE,
                provider(createWikiSong({ version: null }))
            )
        ).toThrow();
    });

    it("Wiki sideがnullなら推測defaultせず失敗する", () => {
        const dto = {
            songTitle: "song",
            nameJp: "曲",
            nameEn: "song",
            composer: "",
            side: "",
            difficulty: DifficultyEnum.FUTURE,
            level: "11",
            constant: "11.0",
            notes: "1200",
            urlName: "song",
        };

        expect(() =>
            resolveWikiSongDetails(
                dto,
                DifficultyEnum.FUTURE,
                provider(createWikiSong({ side: null }))
            )
        ).toThrow();
    });
});
