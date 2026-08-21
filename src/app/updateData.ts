import {
    createFailureResult,
    processCollectionDtos,
    ProcessingResult,
} from "@/app/collectionProcessing";
import { providers, repositories } from "@/app/dependencies";
import { SongCollectionDto } from "@/domain/dto/songCollectionDto";
import { isPersistenceFatalError } from "@/domain/errors/persistenceFatalError";
import { ChartData } from "@/domain/models/song/chartData/chartData";
import { Constant } from "@/domain/models/song/chartData/constant/constant";
import { SongNotes } from "@/domain/models/song/chartData/notes/songNotes";
import { Difficulty } from "@/domain/models/song/difficulty/difficulty";
import {
    DifficultyEnum,
    DifficultyName,
} from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { Level } from "@/domain/models/song/difficulty/level/level";
import { Song } from "@/domain/models/song/song";
import { SongId } from "@/domain/models/song/songId/songId";

import { IWikiProvider, resolveWikiConstant } from "./services/wikiDataFetcherService";

export function updateData(
    difficulty: DifficultyEnum,
    wikiProvider: IWikiProvider = providers.wiki()
): ProcessingResult {
    console.log("Start updating(%s)", difficulty);

    const songRepo = repositories.song();
    const songCollectionRepo = repositories.songCollection();

    let collectionDtos;
    try {
        collectionDtos = songCollectionRepo.fetchByDifficulty(difficulty);
    } catch (cause) {
        if (isPersistenceFatalError(cause)) throw cause;

        console.log("End updating(%s)", difficulty);
        return createFailureResult({ difficulty, operation: "collection fetch", cause });
    }

    const result = processCollectionDtos({
        dtos: collectionDtos,
        difficulty,
        operation: "update",
        shouldSkip: dto => !dto.nameJp,
        process: dto => {
            const songId = new SongId(dto.songTitle);
            const difficultyName = new DifficultyName(difficulty);

            const existingSong = songRepo.findSong(songId, difficultyName);
            if (!existingSong) return false;

            const wikiConstant =
                dto.constant === 0 && existingSong.isRegularlyPlayable()
                    ? resolveWikiConstant(dto, difficulty, wikiProvider)
                    : null;
            const updatedSong = createUpdatedSongIfChanged(existingSong, dto, wikiConstant);
            if (!updatedSong) return false;

            console.log(
                "Update data of %s(%s)",
                updatedSong.songData.nameJp,
                updatedSong.difficultyName
            );

            songRepo.save(updatedSong);
            return true;
        },
    });

    if (result.changed > 0) {
        songRepo.flush();
    }

    console.log("End updating(%s)", difficulty);
    return result;
}

function createUpdatedSongIfChanged(
    existingSong: Song,
    dto: SongCollectionDto,
    wikiConstant: number | null
): Song | null {
    let songToUpdate = existingSong;
    let hasChanged = false;

    const newLevel = dto.level.trim() !== "" ? new Level(dto.level) : existingSong.level;
    if (!newLevel.equals(existingSong.level)) {
        const newDifficulty = new Difficulty({
            difficultyName: existingSong.difficultyName,
            level: newLevel,
        });
        songToUpdate = songToUpdate.changeDifficulty(newDifficulty);
        hasChanged = true;
    }

    const newConstantValue =
        dto.constant !== 0 ? dto.constant : (wikiConstant ?? existingSong.constant.value);
    const newNotesValue =
        dto.notes !== "" && isFinite(Number(dto.notes))
            ? Number(dto.notes)
            : existingSong.songNotes.value;

    const newConstant = new Constant(newConstantValue);
    const newNotes = new SongNotes(newNotesValue);
    if (!newConstant.equals(existingSong.constant) || !newNotes.equals(existingSong.songNotes)) {
        const newChartData = new ChartData({ constant: newConstant, songNotes: newNotes });
        songToUpdate = songToUpdate.changeChartData(newChartData);
        hasChanged = true;
    }

    return hasChanged ? songToUpdate : null;
}
