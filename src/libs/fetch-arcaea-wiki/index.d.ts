import { Difficulty } from "src/types";

interface FetchArcaeaWiki {
    createSongData(urlName: string): ArcaeaWikiSong;
}

interface ArcaeaWikiSong {
    songName: string;
    composer: string;
    illustrator: string;
    levels: string[];
    notes: number[];
    constants: number[];
    length: string;
    bpm: string;
    pack: string;
    side: string;
    version: string;

    difficultyInfoList(): DifficultyInfo[];
    difficulties(): Difficulty[];
    getDifficultyInfoByName(name: Difficulty): DifficultyInfo[];
    getLevelByDiff(name: Difficulty): string[];
    getNotesByDiff(name: Difficulty): number[];
    getConstantByDiff(name: Difficulty): number[];
}

interface DifficultyInfo {
    difficulty: Difficulty;
    level: string;
    notes: number;
    constant: number;
}
