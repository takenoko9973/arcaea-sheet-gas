import { Difficulty } from "../types";

export interface FetchArcaeaWiki {
    createSongData(urlName: string): ArcaeaWikiSong;
}

export interface ArcaeaWikiSong {
    get songName(): string;
    get composer(): string;
    get illustrator(): string;
    get levels(): string[];
    get notes(): number[];
    get constants(): number[];
    get length(): string;
    get bpm(): string;
    get pack(): string;
    get side(): string;
    get version(): string;

    difficultyInfoList(): DifficultyInfo[];
    difficulties(): Difficulty[];
    getDifficultyInfoByName(name: Difficulty): DifficultyInfo[];
    getLevelByDiff(name: Difficulty): string[];
    getNotesByDiff(name: Difficulty): number[];
    getConstantByDiff(name: Difficulty): number[];
}

export interface DifficultyInfo {
    difficulty: Difficulty;
    level: string;
    notes: number;
    constant: number;
}

export declare const FetchArcaeaWiki: FetchArcaeaWiki;
