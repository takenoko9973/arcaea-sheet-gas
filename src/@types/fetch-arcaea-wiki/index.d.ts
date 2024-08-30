import { Difficulty } from "src/types";

interface IFetchArcaeaWiki {
    createSongData(urlName: string): IArcaeaWikiSong;
}

interface IArcaeaWikiSong {
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

    difficultyInfoList(): IDifficultyInfo[];
    difficulties(): Difficulty[];
    getDifficultyInfoByName(name: Difficulty): IDifficultyInfo[];
    getLevelByDiff(name: Difficulty): string[];
    getNotesByDiff(name: Difficulty): number[];
    getConstantByDiff(name: Difficulty): number[];
}

interface IDifficultyInfo {
    difficulty: Difficulty;
    level: string;
    notes: number;
    constant: number;
}
