import { COLLECT_SHEET_NAME, SHEET_BOOK } from "../../const";
import { Difficulty } from "../../types";
import { CollectionSong } from "../collectionSong";

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export class SongCollectionSheet {
    private collectedSongData: {
        [index in Difficulty]: CollectionSong[];
    } = {
        PST: [],
        PRS: [],
        FTR: [],
        BYD: [],
        ETR: [],
    };

    static get instance() {
        return new SongCollectionSheet(SHEET_BOOK.getSheetByName(COLLECT_SHEET_NAME)!);
    }

    constructor(private readonly sheet: Sheet) {
        const values = this.sheet.getDataRange().getValues();

        for (const difficulty of Object.values(Difficulty)) {
            //指定の難易度の曲データの行番号を取得
            const diffCol = values[0].indexOf(difficulty) + 1;
            const diffVal = values
                .slice(1)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((item: any[]) => item.slice(diffCol, diffCol + 9));

            // 指定の難易度のみのデータを取り出し
            this.collectedSongData[difficulty] = diffVal
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((item: any[]) => new CollectionSong(difficulty, item))
                .filter(collectedSong => collectedSong.songTitle !== "");
        }
    }

    getCollectionData(difficulty: Difficulty) {
        return this.collectedSongData[difficulty];
    }
}
