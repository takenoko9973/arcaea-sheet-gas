import { SongCollectionDto } from "domain/dto/songCollectionDto";
import { ChartData } from "domain/models/song/chartData/chartData";
import { Constant } from "domain/models/song/chartData/constant/constant";
import { SongNotes } from "domain/models/song/chartData/notes/songNotes";
import { Difficulty } from "domain/models/song/difficulty/difficulty";
import {
    DifficultyEnum,
    DifficultyName,
} from "domain/models/song/difficulty/difficultyName/difficultyName";
import { Level } from "domain/models/song/difficulty/level/level";
import { Song } from "domain/models/song/song";
import { SongId } from "domain/models/song/songId/songId";
import { SongCollectionRepository } from "infrastructure/repositories/songCollectionRepository";
import { SongRepository } from "infrastructure/repositories/songRepository";

export function updateData(difficulty: DifficultyEnum) {
    console.log("Start updating(%s)", difficulty);

    const songRepo = SongRepository.instance;
    const songCollectionRepo = SongCollectionRepository.instance;

    const collectionDtos = songCollectionRepo.fetchByDifficulty(difficulty);

    let isUpdated = false;
    for (const dto of collectionDtos) {
        if (!dto.nameJp) continue;

        // 存在するか確認
        const songId = new SongId(dto.songTitle);
        const difficultyName = new DifficultyName(difficulty);

        const existingSong = songRepo.findSong(songId, difficultyName);
        if (!existingSong) continue; // 登録されていなければスキップ

        const updatedSong = createUpdatedSongIfChanged(existingSong, dto);
        if (updatedSong) {
            console.log(
                "Update data of %s(%s)",
                updatedSong.songData.nameJp,
                updatedSong.difficultyName
            );

            songRepo.save(updatedSong);
            isUpdated = true;
        }
    }

    // 更新があった場合\、最後にシートに書き込む
    if (isUpdated) {
        songRepo.flush();
    }

    console.log("End updating(%s)", difficulty);
}

/**
 * SongエンティティとDTOを比較し、変更があれば更新された新しいSongインスタンスを返す
 * 変更がなければnullを返す
 * @param existingSong - DBに保存されている既存のSongエンティティ
 * @param dto - 収集元の楽曲情報DTO
 */
function createUpdatedSongIfChanged(existingSong: Song, dto: SongCollectionDto): Song | null {
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
    const newConstantValue =
        dto.constant !== "" && isFinite(Number(dto.constant))
            ? Number(dto.constant)
            : existingSong.constant.value;
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

    // 変更があった場合のみ、更新されたインスタンスを返す
    return hasChanged ? songToUpdate : null;
}
