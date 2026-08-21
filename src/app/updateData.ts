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

    // 共通ループ処理で更新対象だけを処理する
    const result = processCollectionDtos({
        dtos: collectionDtos,
        difficulty,
        operation: "update",
        // 名前が空の場合はスキップ
        shouldSkip: dto => !dto.nameJp,
        process: dto => {
            // 存在するか確認
            const songId = new SongId(dto.songTitle);
            const difficultyName = new DifficultyName(difficulty);

            const existingSong = songRepo.findSong(songId, difficultyName);
            if (!existingSong) return false; // 登録されていなければスキップ

            let constantValue = existingSong.constant.value;
            if (constantValue === 0 && existingSong.isRegularlyPlayable()) {
                const collectionConstant = dto.constant;
                constantValue =
                    collectionConstant !== 0
                        ? collectionConstant
                        : resolveWikiConstant(dto, difficulty, wikiProvider);
            }

            const updatedSong = createUpdatedSongIfChanged(existingSong, dto, constantValue);
            if (!updatedSong) return false;

            console.log(
                "Update data of %s(%s)",
                updatedSong.songData.nameJp,
                updatedSong.difficultyName
            );

            // 更新できたらtrue
            songRepo.save(updatedSong);
            return true;
        },
    });

    // 更新があった場合、最後にシートに書き込む
    if (result.changed > 0) {
        songRepo.flush();
    }

    console.log("End updating(%s)", difficulty);
    return result;
}

/**
 * SongエンティティとDTOを比較し、変更があれば更新された新しいSongインスタンスを返す
 * 変更がなければnullを返す
 * @param existingSong - DBに保存されている既存のSongエンティティ
 * @param dto - 収集元の楽曲情報DTO
 * @param constantValue - 更新後の譜面定数。既知定数は維持し、未判明時だけCollection/Wikiで補完する
 */
function createUpdatedSongIfChanged(
    existingSong: Song,
    dto: SongCollectionDto,
    constantValue: number
): Song | null {
    let songToUpdate = existingSong;
    let hasChanged = false;

    // Levelの更新チェック
    const newLevel = dto.level.trim() !== "" ? new Level(dto.level) : existingSong.level;
    if (!newLevel.equals(existingSong.level)) {
        const newDifficulty = new Difficulty({
            difficultyName: existingSong.difficultyName,
            level: newLevel,
        });
        songToUpdate = songToUpdate.changeDifficulty(newDifficulty);
        hasChanged = true;
    }

    // ChartData (Constant, Notes) の更新チェック
    const newConstant = new Constant(constantValue);
    const newNotesValue =
        dto.notes !== "" && isFinite(Number(dto.notes))
            ? Number(dto.notes)
            : existingSong.songNotes.value;
    const newNotes = new SongNotes(newNotesValue);
    if (!newConstant.equals(existingSong.constant) || !newNotes.equals(existingSong.songNotes)) {
        const newChartData = new ChartData({ constant: newConstant, songNotes: newNotes });

        songToUpdate = songToUpdate.changeChartData(newChartData);
        hasChanged = true;
    }

    // 変更があった場合のみ、更新されたインスタンスを返す
    return hasChanged ? songToUpdate : null;
}
