import { SONG_SCORE_SHEET_NAME } from "@/const";
import {
    asPersistenceFatalError,
    PersistenceFatalError,
} from "@/domain/errors/persistenceFatalError";
import { DifficultyName } from "@/domain/models/song/difficulty/difficultyName/difficultyName";
import { Song } from "@/domain/models/song/song";
import { SongId } from "@/domain/models/song/songId/songId";
import { ISongRepository } from "@/domain/repositories/songRepositoryImpl";
import { SongMapper } from "@/infrastructure/mappers/songMapper";
import { ConfigSheet } from "@/infrastructure/repositories/configSheet";
import { getSheet } from "@/utils/sheetHelper";

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export class SongRepository implements ISongRepository {
    private static singleton: SongRepository;

    private songs: Song[]; // songDataからsongsに変更

    static get instance() {
        if (!this.singleton) {
            try {
                this.singleton = new SongRepository(getSheet(SONG_SCORE_SHEET_NAME));
            } catch (cause) {
                throw asPersistenceFatalError("SongRepository初期化", cause);
            }
        }

        return this.singleton;
    }

    private constructor(private readonly sheet: Sheet) {
        this.songs = this.loadSongs();
    }

    private loadSongs(): Song[] {
        const values = this.sheet.getDataRange().getValues();
        values.shift()!; // ヘッダー行を削除
        return values
            .map((row, index) =>
                SongMapper.toDomain(row, { sheet: this.sheet.getName(), row: index + 2 })
            )
            .filter(song => song && song.songId.value !== "") as Song[]; // 空の曲を除外
    }

    findSong(id: SongId, difficultyName: DifficultyName): Song | null {
        return (
            this.songs.find(
                song => song.songId.equals(id) && song.difficultyName.equals(difficultyName)
            ) || null
        );
    }

    save(savedSong: Song): void {
        const index = this.songs.findIndex(song => song.equals(savedSong));

        if (index > -1) {
            // 存在すれば更新
            this.songs[index] = savedSong;
        } else {
            // 存在しなければ追加
            this.songs.push(savedSong);
        }
    }

    /**
     * シートに書き込み
     */
    flush(): void {
        try {
            // 不足分の行を追加
            const sheetRowNum = this.sheet.getLastRow();
            const songNum = this.songs.length;
            if (sheetRowNum < songNum + 5) {
                this.sheet.insertRowsAfter(sheetRowNum, songNum + 5 - sheetRowNum);
            }

            const values = this.songs.map(song => SongMapper.toPersistence(song));
            if (values.length > 0) {
                this.sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
            }
        } catch (cause) {
            throw new PersistenceFatalError("SongScore flush", cause);
        }
    }

    /**
     * データ取得
     */
    fetchSongs(): Song[] {
        return this.songs;
    }

    // Configシートで指定されたセルを参照して判定する
    isIgnoreConstant(): boolean {
        try {
            const configSheet = ConfigSheet.instance;
            const targetCell = configSheet.ignoreConstantCell();
            const value = this.sheet.getRange(targetCell).getValue();
            return value === true;
        } catch (cause) {
            throw new PersistenceFatalError("Configセル参照", cause);
        }
    }
}
