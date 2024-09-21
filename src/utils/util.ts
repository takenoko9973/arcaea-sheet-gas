/**
 * カタカナ以外を全角から半角へ変換
 **/
export function toHalfWidth(str: string) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s: string) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
}

/**
 * ある要素のインデックスをすべて返す
 * 存在しない場合は空配列を返す
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function allIndexesOf(array: any[], val: any): number[] {
    const indexes = [];

    for (let i = 0; i < array.length; i++) {
        if (array[i] === val) {
            indexes.push(i);
        }
    }
    return indexes;
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
