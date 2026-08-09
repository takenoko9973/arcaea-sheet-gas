import {
    IArcaeaWikiChart,
    IArcaeaWikiSong,
    IFetchArcaeaWiki,
} from "@/@types/fetch-arcaea-wiki";
import { ManualRegisterDto } from "@/domain/dto/manualRegisterDto";
import { SongCollectionDto } from "@/domain/dto/songCollectionDto";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

declare const FetchArcaeaWiki: IFetchArcaeaWiki;

export type WikiSongDetails = {
    composer: string;
    pack: string;
    version: string;
    side: string;
    level: string;
    notes: number;
    constant: number;
};

export interface IWikiProvider {
    fetchSongData(pageName: string): IArcaeaWikiSong;
}

type CachedWikiSong =
    | { status: "success"; data: IArcaeaWikiSong }
    | { status: "failure"; error: unknown };

/**
 * 1回の登録処理で共有するWiki取得境界。
 * cacheはインスタンスに閉じ、実行をまたいで保持しない。
 */
export class WikiProvider implements IWikiProvider {
    private readonly songCache = new Map<string, CachedWikiSong>();

    constructor(private readonly gateway: IFetchArcaeaWiki = FetchArcaeaWiki) {}

    fetchSongData(pageName: string): IArcaeaWikiSong {
        const cached = this.songCache.get(pageName);
        if (cached) {
            if (cached.status === "failure") throw cached.error;
            return cached.data;
        }

        try {
            const songData = this.gateway.createSongData(pageName);
            Utilities.sleep(1500); // Wikiへの連続アクセスを避けるため、取得成功後に待機する
            this.songCache.set(pageName, { status: "success", data: songData });
            return songData;
        } catch (error) {
            this.songCache.set(pageName, { status: "failure", error });
            throw error;
        }
    }
}

type RegistrationDto = SongCollectionDto | ManualRegisterDto;

type KnownChartValues = {
    level: string | null;
    notes: number | null;
    constant: number | null;
};

export type ResolvedChartDetails = {
    level: string;
    notes: number;
    constant: number;
};

/**
 * Collection/ManualRegisterの既知値をconstraintとしてWiki chartを一意に解決する。
 */
export function resolveWikiChart(
    dto: RegistrationDto,
    difficulty: DifficultyEnum,
    charts: IArcaeaWikiChart[]
): ResolvedChartDetails {
    const known = readKnownChartValues(dto);
    const candidates = charts.filter(
        chart => chart.difficulty === difficulty && matchesKnownValues(chart, known)
    );

    if (candidates.length !== 1) {
        throw new Error(
            `Wiki chart候補を一意に解決できません (${difficulty}, candidates=${candidates.length})`
        );
    }

    const candidate = candidates[0];
    const level = known.level ?? candidate.level;
    const notes = known.notes ?? candidate.notes;
    const constant = known.constant ?? candidate.constant;

    if (
        typeof level !== "string" ||
        level.trim() === "" ||
        typeof notes !== "number" ||
        !Number.isFinite(notes) ||
        typeof constant !== "number" ||
        !Number.isFinite(constant)
    ) {
        throw new Error(`Wiki chartの必須値が欠損しています (${difficulty})`);
    }

    return { level, notes, constant };
}

/**
 * SongCollection/ManualRegisterの既知metadataを優先し、不足分をWikiで補完する。
 */
export function resolveWikiSongDetails(
    dto: RegistrationDto,
    difficulty: DifficultyEnum,
    provider: IWikiProvider
): WikiSongDetails {
    const wikiSong = provider.fetchSongData(dto.urlName);
    const chart = resolveWikiChart(dto, difficulty, wikiSong.charts);

    return {
        composer: resolveComposer(dto, wikiSong),
        pack: requireMetadata(wikiSong.pack, "pack"),
        version: requireMetadata(wikiSong.version, "version"),
        side: resolveSide(dto, wikiSong),
        ...chart,
    };
}

function readKnownChartValues(dto: RegistrationDto): KnownChartValues {
    return {
        level: readKnownText(dto.level),
        notes: readKnownNumber(isSongCollectionDto(dto) ? dto.notes : undefined),
        constant: readKnownNumber(dto.constant),
    };
}

function readKnownText(value: string | undefined): string | null {
    return value !== undefined && value.trim() !== "" ? value : null;
}

function readKnownNumber(value: string | undefined): number | null {
    const text = readKnownText(value);
    if (text === null) return null;

    const number = Number(text);
    if (!Number.isFinite(number)) throw new Error(`数値として解釈できない既知値です (${text})`);
    return number;
}

function matchesKnownValues(chart: IArcaeaWikiChart, known: KnownChartValues): boolean {
    return (
        (known.level === null || chart.level === null || chart.level === known.level) &&
        (known.notes === null || chart.notes === null || chart.notes === known.notes) &&
        (known.constant === null || chart.constant === null || chart.constant === known.constant)
    );
}

function resolveComposer(dto: RegistrationDto, wikiSong: IArcaeaWikiSong): string {
    if (isSongCollectionDto(dto) && dto.composer.trim() !== "") return dto.composer;
    return requireMetadata(wikiSong.composer, "composer");
}

function resolveSide(dto: RegistrationDto, wikiSong: IArcaeaWikiSong): string {
    if (isSongCollectionDto(dto) && dto.side.trim() !== "") return dto.side;
    if (typeof wikiSong.side !== "string" || wikiSong.side.trim() === "") {
        throw new Error("Wiki metadataのsideが欠損しています");
    }

    const match = /.+\((.+)\)/.exec(wikiSong.side);
    if (!match?.[1]) throw new Error(`Wiki metadataのsideを解釈できません (${wikiSong.side})`);
    return match[1];
}

function requireMetadata(value: string | null, name: string): string {
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`Wiki metadataの${name}が欠損しています`);
    }
    return value;
}

function isSongCollectionDto(dto: RegistrationDto): dto is SongCollectionDto {
    return "composer" in dto && "side" in dto;
}
