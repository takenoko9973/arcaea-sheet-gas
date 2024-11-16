import { DifficultyData } from "./difficultyData/difficultyData";
import { Pack } from "./pack/pack";
import { Score } from "./score/score";
import { Side } from "./side/side";
import { SongData } from "./songData/songData";
import { SongId } from "./songId/songId";
import { Version } from "./version/version";
import { Difficulty } from "./difficulty/difficulty";
import { Level } from "./difficultyData/level/level";
import { Notes } from "./difficultyData/notes/notes";
import { Constant } from "./difficultyData/constant/constant";

export class Song {
    private constructor(
        private readonly _songId: SongId,
        private _songData: SongData,
        private _pack: Pack,
        private _side: Side,
        private _version: Version,
        private _difficultyData: DifficultyData,
        private _score: Score
    ) {}

    static create(
        songId: SongId,
        songData: SongData,
        pack: Pack,
        side: Side,
        version: Version,
        difficultyData: DifficultyData
    ) {
        const song = new Song(songId, songData, pack, side, version, difficultyData, new Score(0));

        return song;
    }

    static reconstruct(
        songId: SongId,
        songData: SongData,
        pack: Pack,
        side: Side,
        version: Version,
        difficultyData: DifficultyData,
        score: Score
    ) {
        return new Song(songId, songData, pack, side, version, difficultyData, score);
    }

    equals(other: Song) {
        return this.songId.equals(other.songId);
    }

    // 削除曲か否か
    isDeleted() {
        return this._pack.value === "Deleted";
    }

    changeDifficultyData(newDifficultyData: DifficultyData) {
        this._difficultyData = newDifficultyData;
    }

    get songId(): SongId {
        return this._songId;
    }

    get songData(): SongData {
        return this._songData;
    }

    get pack(): Pack {
        return this._pack;
    }

    get side(): Side {
        return this._side;
    }

    get version(): Version {
        return this._version;
    }

    get difficulty(): Difficulty {
        return this._difficultyData.difficulty;
    }

    get level(): Level {
        return this._difficultyData.level;
    }

    get notes(): Notes {
        return this._difficultyData.notes;
    }

    get constant(): Constant {
        return this._difficultyData.constant;
    }

    get score(): Score {
        return this._score;
    }
}
