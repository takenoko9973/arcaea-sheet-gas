import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

export interface IFetchArcaeaWiki {
    createSongData(pageName: string): IArcaeaWikiSong;
}

export interface IArcaeaWikiSong {
    composer: string | null;
    pack: string | null;
    version: string | null;
    side: string | null;
    charts: IArcaeaWikiChart[];
}

export interface IArcaeaWikiChart {
    difficulty: DifficultyEnum;
    level: string | null;
    notes: number | null;
    constant: number | null;
}
