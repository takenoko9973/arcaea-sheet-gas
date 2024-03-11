import { COLLECT_SHEET_DATA, SONG_SHEET_DATA } from "./const";

/**
 * カタカナ以外を全角から半角へ変換
 **/
export function toHalfWidth(str: string) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s: string) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
}

/**
 * 行検索
 */
function findRow(dat: unknown[][], val: unknown, col: number, sRow = 0) {
    let row = -1;

    if (col >= 0) {
        //指定の行だけ抜き出し
        const colList = dat.map((row: unknown[]) => row[col]);
        //リスト検索
        row = colList.indexOf(val, sRow);
    }
    return row;
}

/**
 * 指定の楽曲が何行目にあるか (存在しない場合、-1)
 */
export function registeredSongRow(difficulty: string, songTitle: string) {
    let row = -1;

    //指定の楽曲の難易度が一致するまで検索
    do {
        row = findRow(SONG_SHEET_DATA, songTitle, 0, row + 1);
        if (row < 0) {
            return -1;
        } else {
            //指定の難易度か確認
            const isExist = SONG_SHEET_DATA[row].includes(difficulty);
            if (isExist) return row;
        }
    } while (true);
}

/**
 * 指定の楽曲とレベルが登録されているかどうか
 */
export function isRegisteredSong(difficulty: string, songTitle: string) {
    const row = registeredSongRow(difficulty, songTitle);
    return row > 0;
}

/**
 * 指定の難易度のデータのみを取り出し
 */
export function fetchDifficultyCollectData(difficulty: string) {
    //指定の難易度の曲データの行番号を取得
    const col = COLLECT_SHEET_DATA[0].indexOf(difficulty) + 1;
    // 指定の難易度のみのデータを取り出し
    const fetchedDiffData = COLLECT_SHEET_DATA.map((item: unknown[]) => item.slice(col, col + 9));

    return fetchedDiffData;
}

/**
 * Url用の名前を取得
 */
export function extractionUrlName(name: string) {
    const match = name.match(/>(.+)/);

    if (match !== null) {
        name = match[1];
    } else if (name === "") {
        return "";
    }
    name = changeCodeToString(name); // Löschenだけコード標記なので、変換して対応

    return name;
}

/**
 * 日本語用曲名を取得
 */
export function extractionJaName(name: string) {
    const match = name.match(/(.+)>/);

    if (match !== null) {
        name = match[1];
    } else if (name === "") {
        return "";
    }
    return changeCodeToString(name);
}

/**
 * 文字コード化しているところを置き換え
 */
export function changeCodeToString(s: string) {
    const chars = s.match(/&#([0-9]+);/);
    if (chars === null) return s;

    //文字コード化している部分を一つずつ変換
    for (let i = 1; i < chars.length; i++) {
        const char = Number(chars[i]);
        const cs = String.fromCharCode(char);
        const replaceWord = new RegExp("&#" + char + ";", "g");
        s = s.replace(replaceWord, cs);
    }
    return s;
}

/**
 * 配列をチャンク数ごとに分ける
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function splitArrayIntoChunks(array: any[], chunkSize: number) {
    const result = [];

    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}
