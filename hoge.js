/**
 * シート名とセル場所のセット
 * セル場所はA1方式推奨
 */
class SheetCellPair {
    constructor(sheet_name, cell_location) {
        this.sheet_name = sheet_name;
        this.cell_location = cell_location;
    }
    // シート名が一致しているか
    equalSheetName(pair) {
        return this.sheet_name === pair.sheet_name;
    }
    // セルの場所が一致しているか (ただし、片方が空白だった場合は常にtrue)
    equalCellLocation(pair) {
        if (this.cell_location === "") return true;
        if (pair.cell_location === "") return true;
        return this.cell_location === pair.cell_location;
    }
    // シート、セルが共に一致しているかどうか (セルが空白の場合はシートのみで判断)
    equal(pair) {
        if (!this.equalSheetName(pair)) return false;
        if (!this.equalCellLocation(pair)) return false;
        return true;
    }
}

const Difficulty = { Past: "PST", Present: "PRS", Future: "FTR", Beyond: "BYD", Eternal: "ETR" };

const Grade = {
    PMPlus: "PM+",
    PM: "PM",
    EXPlus: "EX+",
    EX: "EX",
    AA: "AA",
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    NotPlayed: "NP",
};

class Song {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(record) {
        var _a, _b;
        [
            this.songTitle,
            this.nameJp,
            this.nameEn,
            this.composer,
            this.pack,
            this.version,
            this.side,
            this.difficulty,
            this.level,
            this.constant,
            this.notes,
            this.score,
        ] = record;
        this.version =
            (_b =
                (_a = this.version.match(/(\d+\.\d+)/)) === null || _a === void 0
                    ? void 0
                    : _a.at(1)) !== null && _b !== void 0
                ? _b
                : ""; // アポストロフィが付くので排除
    }
    getSongDataList() {
        return [
            this.songTitle,
            this.nameJp,
            this.nameEn,
            this.composer,
            this.pack,
            "'" + this.version,
            this.side,
            this.difficulty,
            this.level,
            this.constant,
            this.notes,
            this.score,
        ];
    }
    /**
     * 不足しているデータがあるかどうか
     */
    isLuckData() {
        const existBlank = this.getSongDataList().includes("");
        const existNegative = this.getSongDataList().includes(-1);
        return existBlank || existNegative;
    }
    isDeleted() {
        return this.pack === "Deleted";
    }
    getMaximumScore() {
        return 10000000 + this.notes;
    }
    getGrade() {
        if (this.score === this.getMaximumScore()) {
            return Grade.PMPlus;
        } else if (this.score >= 10000000) {
            return Grade.PM;
        } else if (this.score >= 9900000) {
            return Grade.EXPlus;
        } else if (this.score >= 9800000) {
            return Grade.EX;
        } else if (this.score >= 9500000) {
            return Grade.AA;
        } else if (this.score >= 9200000) {
            return Grade.A;
        } else if (this.score >= 8900000) {
            return Grade.B;
        } else if (this.score >= 8600000) {
            return Grade.C;
        } else if (this.score > 0) {
            return Grade.D;
        } else {
            return Grade.NotPlayed;
        }
    }
    getSongPotential() {
        if (this.score >= 10000000) {
            return this.constant + 2.0;
        } else if (this.score >= 9800000) {
            return this.constant + 1.0 + (this.score - 9800000) / 200000;
        } else {
            const potential = this.constant + (this.score - 9500000) / 300000;
            return potential >= 0 ? potential : 0; // 0を下回らない
        }
    }
    /**
     * Pure数を計算 (Farは0.5として計算)
     */
    getPureNotes() {
        return Math.floor((this.score * this.notes * 2) / 10000000) / 2;
    }
    /**
     * 内部数計算
     */
    getHitShinyPureNotes() {
        return this.score - Math.floor(10000000 * (this.getPureNotes() / this.notes));
    }
}

const SHEET_ID = PropertiesService.getScriptProperties().getProperty("sheetId");
const SHEET_BOOK = SpreadsheetApp.openById(SHEET_ID);
const COLLECT_SHEET_NAME = "SongCollection";
const SONG_SCORE_SHEET_NAME = "SongScore";
const MANUAL_REGISTER_SHEET_NAME = "ManualRegister";
const DAILY_REPOSITORY_SHEET_NAME = "DailyRepository";
const IGNORE_CONSTANT_CONFIG_CELL = "Y10";
const MANUAL_REGISTER_SHEET = SHEET_BOOK.getSheetByName(MANUAL_REGISTER_SHEET_NAME);

/**
 * カタカナ以外を全角から半角へ変換
 **/
function toHalfWidth(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
}
/**
 * ある要素のインデックスをすべて返す
 * 存在しない場合は空配列を返す
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function allIndexesOf(array, val) {
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
function extractionUrlName(name) {
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
function extractionJaName(name) {
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
function changeCodeToString(s) {
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
function splitArrayIntoChunks(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}

class GradeData {
    constructor() {
        this.gradeCounts = {
            "PM+": 0,
            "PM": 0,
            "EX+": 0,
            "EX": 0,
            "AA": 0,
            "A": 0,
            "B": 0,
            "C": 0,
            "D": 0,
            "NP": 0,
        };
    }
    plus(gradeData) {
        const newGradeData = new GradeData();
        for (const grade of Object.values(Grade)) {
            newGradeData.gradeCounts[grade] =
                this.gradeCounts[grade] + gradeData.gradeCounts[grade];
        }
        return newGradeData;
    }
}

class ScoreData {
    constructor(sumScore, lostScore, farNotes, luckShinyPureNotes) {
        this.sumScore = sumScore;
        this.lostScore = lostScore;
        this.farNotes = farNotes;
        this.luckShinyPureNotes = luckShinyPureNotes;
    }
}

class DailyRepositorySheet {
    constructor(sheet) {
        this.sheet = sheet;
    }
    static get instance() {
        return this.singleton;
    }
    addData(data) {
        const dataArray = data.getRowData();
        // 最終行の後に新しい行を挿入
        const lastRow = this.sheet.getLastRow();
        this.sheet.insertRowAfter(lastRow);
        const inputCells = this.sheet.getRange(lastRow + 1, 1, 1, dataArray.length);
        inputCells.setValues([dataArray]);
    }
}
DailyRepositorySheet.singleton = new DailyRepositorySheet(
    SHEET_BOOK.getSheetByName(DAILY_REPOSITORY_SHEET_NAME)
);
class DailyArcaeaData {
    constructor(date, potential, grade, scoreData) {
        this.date = date;
        this.potential = potential;
        this.grade = grade;
        this.scoreData = scoreData;
    }
    getRowData() {
        const dataArray = [];
        dataArray.push(Utilities.formatDate(this.date, "JST", "yyyy/MM/dd"));
        dataArray.push(this.potential);
        dataArray.push(...grade2List(this.grade));
        dataArray.push(
            ...this.scoreData.flatMap(value => [
                value.sumScore,
                value.lostScore,
                value.farNotes,
                value.luckShinyPureNotes,
            ])
        );
        return dataArray;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static createDataByRow(rowData) {
        const date = Utilities.parseDate(rowData[0], "JST", "yyyy/MM/dd");
        const potential = rowData[1];
        const grade = list2Grade(rowData.slice(2, 2 + this.gradeNum_));
        const scoreDataArray = rowData.slice(
            2 + this.gradeNum_,
            2 + this.gradeNum_ + this.diffNum_ * 4
        );
        const scoreData = splitArrayIntoChunks(scoreDataArray, 4).map(
            array => new ScoreData(array[0], array[1], array[2], array[3])
        );
        return new this(date, potential, grade, scoreData);
    }
}
DailyArcaeaData.gradeNum_ = 7;
DailyArcaeaData.diffNum_ = 3;
function grade2List(gradeData) {
    const list = [
        gradeData.gradeCounts[Grade.PMPlus],
        gradeData.gradeCounts[Grade.PM],
        gradeData.gradeCounts[Grade.EXPlus],
        gradeData.gradeCounts[Grade.EX],
        gradeData.gradeCounts[Grade.AA],
        gradeData.gradeCounts[Grade.A] +
            gradeData.gradeCounts[Grade.B] +
            gradeData.gradeCounts[Grade.C] +
            gradeData.gradeCounts[Grade.D],
        gradeData.gradeCounts[Grade.NotPlayed],
    ];
    return list;
}
function list2Grade(list) {
    const gradeData = new GradeData();
    gradeData.gradeCounts[Grade.PMPlus] = list[0];
    gradeData.gradeCounts[Grade.PM] = list[1];
    gradeData.gradeCounts[Grade.EXPlus] = list[2];
    gradeData.gradeCounts[Grade.EX] = list[3];
    gradeData.gradeCounts[Grade.AA] = list[4];
    gradeData.gradeCounts[Grade.A] = list[5];
    gradeData.gradeCounts[Grade.NotPlayed] = list[6];
    return gradeData;
}

class CollectionSong {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(difficulty, data) {
        let constantOld, constantNow;
        this.difficulty = difficulty;
        [
            this.songTitle,
            this.nameJp,
            this.nameEn,
            this.composer,
            this.side,
            this.level,
            constantOld,
            constantNow,
            this.notes,
        ] = data;
        this.constant = constantNow !== "" ? constantNow : constantOld;
        this.constant = Number.isNaN(Number(this.constant)) ? 0 : Number(this.constant);
        // url用の名前も含んでいるので分離
        // また、文字コードもあるのでそれも変換
        this.urlName = extractionUrlName(this.nameJp);
        this.nameJp = extractionJaName(this.nameJp);
        this.pack = "";
        this.version = "";
    }
    toSongData() {
        return new Song([
            this.songTitle,
            this.nameJp,
            this.nameEn,
            this.composer,
            this.pack,
            this.version,
            this.side,
            this.difficulty,
            this.level,
            this.constant,
            Number(this.notes),
            0,
        ]);
    }
}
function fetchSongDataFromWiki(collectSong) {
    var _a, _b;
    // wikiから、追加のデータを取得
    const songData = FetchArcaeaWiki.createSongData(collectSong.urlName);
    Utilities.sleep(1500); //サーバーに負荷をかけないようにする
    // wikiからのデータを取り込む
    collectSong.notes =
        collectSong.notes !== ""
            ? collectSong.notes
            : songData.getNotesByDiff(collectSong.difficulty)[0].toString();
    collectSong.pack = songData.pack;
    collectSong.version =
        (_b =
            (_a = songData.version.match(/^(\d+\.\d+)/)) === null || _a === void 0
                ? void 0
                : _a.at(1)) !== null && _b !== void 0
            ? _b
            : collectSong.version;
}

class SongCollectionSheet {
    static get instance() {
        return this.singleton;
    }
    constructor(sheet) {
        this.sheet = sheet;
        this.collectedSongData = { PST: [], PRS: [], FTR: [], BYD: [], ETR: [] };
        const values = this.sheet.getDataRange().getValues();
        for (const difficulty of Object.values(Difficulty)) {
            //指定の難易度の曲データの行番号を取得
            const diffCol = values[0].indexOf(difficulty) + 1;
            const diffVal = values
                .slice(1)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map(item => item.slice(diffCol, diffCol + 9));
            // 指定の難易度のみのデータを取り出し
            this.collectedSongData[difficulty] = diffVal
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map(item => new CollectionSong(difficulty, item))
                .filter(collectedSong => collectedSong.songTitle !== "");
        }
    }
    getCollectionData(difficulty) {
        return this.collectedSongData[difficulty];
    }
}
SongCollectionSheet.singleton = new SongCollectionSheet(
    SHEET_BOOK.getSheetByName(COLLECT_SHEET_NAME)
);

function sum(array) {
    return array.reduce((sum, val) => sum + val);
}
function average(array) {
    const len = array.length;
    return sum(array) / len;
}

class SongScoreSheet {
    static get instance() {
        return this.singleton;
    }
    constructor(sheet) {
        this.sheet = sheet;
        const values = this.sheet.getDataRange().getValues();
        this.columns = values.slice(0, 1)[0]; // 1行目のみを取得
        this.songData = values
            .slice(1) // 目次無視
            .map(row => new Song(row.slice(0, 12)))
            .filter(song => song.songTitle !== "");
    }
    isIgnoreConstant() {
        return this.sheet.getRange(IGNORE_CONSTANT_CONFIG_CELL);
    }
    /**
     * 楽曲情報をシートに更新
     */
    updateSheet() {
        // 不足分の行を追加
        const sheetRowNum = this.sheet.getLastRow();
        const songNum = this.registeredSongNum();
        if (sheetRowNum < songNum + 5) {
            this.sheet.insertRowsAfter(sheetRowNum, songNum + 5 - sheetRowNum);
        }
        const values = this.songData.map(song => song.getSongDataList());
        this.sheet.getRange(2, 1, songNum, values[0].length).setValues(values);
    }
    /**
     * 目次指定でソートする
     */
    sort(colName, ascending = false) {
        var _a;
        const colNum = this.columns.indexOf(colName) + 1;
        this.sheet.getRange("A1").activate();
        (_a = this.sheet.getActiveCell().getFilter()) === null || _a === void 0
            ? void 0
            : _a.sort(colNum, ascending);
    }
    /**
     * 登録楽曲数
     */
    registeredSongNum() {
        const songNum = this.songData.length;
        return songNum;
    }
    /**
     * 登録されている指定の楽曲のデータ行番号 (存在しない場合は-1)
     */
    searchRegisteredSongIndex(difficulty, songTitle) {
        const registeredSongTitles = this.songData.map(song => song.songTitle);
        const indexes = allIndexesOf(registeredSongTitles, songTitle);
        for (const index of indexes) {
            const song = this.songData[index];
            if (song.difficulty === difficulty) {
                return index;
            }
        }
        return -1;
    }
    /**
     * 登録されている指定の楽曲のデータを取得 (存在しない場合はnull)
     */
    searchRegisteredSong(difficulty, songTitle) {
        const index = this.searchRegisteredSongIndex(difficulty, songTitle);
        return this.songData[index];
    }
    /**
     * 楽曲データが登録されてるか否か
     */
    isRegistered(difficulty, songTitle) {
        const index = this.searchRegisteredSongIndex(difficulty, songTitle);
        return index >= 0;
    }
    /**
     * 楽曲データを追加する
     * 既に楽曲データが存在する場合は、追加しない
     */
    addSong(song) {
        const isRegistered = this.isRegistered(song.difficulty, song.songTitle);
        if (!isRegistered) {
            this.songData.push(song);
        }
    }
    /**
     * 指定した楽曲データの入れ替え
     * 該当する楽曲が無い場合は更新しない
     */
    overwriteSong(song) {
        const index = this.searchRegisteredSongIndex(song.difficulty, song.songTitle);
        if (index >= 0) {
            this.songData[index] = song;
        }
    }
    /**
     * 通常利用可能な楽曲群
     */
    getAvailableSongData() {
        return this.songData
            .filter(song => song.level !== "?") // エイプリルフール
            .filter(song => !song.isDeleted()); // 削除曲
    }
    /**
     * 指定難易度の最大合計スコアを取得
     */
    getMaximumSumScore(difficulty) {
        const maximumScores = this.getAvailableSongData()
            .filter(song => song.difficulty === difficulty)
            .map(song => song.getMaximumScore());
        return sum(maximumScores);
    }
    /**
     * 指定難易度の合計スコアを取得
     */
    getSumScore(difficulty) {
        const scores = this.getAvailableSongData()
            .filter(song => song.difficulty === difficulty)
            .map(song => song.score);
        return sum(scores);
    }
    /**
     * 指定難易度の各グレード数を取得
     */
    getGrades(difficulty) {
        const grades = this.getAvailableSongData()
            .filter(song => song.difficulty === difficulty)
            .map(song => song.getGrade());
        const gradeData = new GradeData();
        for (const grade of grades) {
            gradeData.gradeCounts[grade] = gradeData.gradeCounts[grade] + 1;
        }
        return gradeData;
    }
    /**
     * ベスト枠のみの平均ポテンシャルを取得
     */
    getBestPotential() {
        const bestPotentials = this.getAvailableSongData()
            .map(song => song.getSongPotential())
            .sort((a, b) => a - b)
            .reverse()
            .slice(0, 30);
        return average(bestPotentials);
    }
    /**
     * 指定難易度のFar数を取得 (Lostは2)
     */
    getFarNotes(difficulty) {
        const farCounts = this.getAvailableSongData()
            .filter(song => song.difficulty === difficulty)
            .map(song => (song.notes - song.getPureNotes()) * 2);
        return sum(farCounts);
    }
    /**
     * 指定難易度の残り内部数を計算
     */
    getLuckShinyPureNotes(difficulty) {
        const farCounts = this.getAvailableSongData()
            .filter(song => song.difficulty === difficulty)
            .map(song => song.notes - song.getHitShinyPureNotes());
        return sum(farCounts);
    }
}
SongScoreSheet.singleton = new SongScoreSheet(SHEET_BOOK.getSheetByName(SONG_SCORE_SHEET_NAME));

function updateData(difficulty) {
    console.log("Start updating(%s)", difficulty);
    const songScoreSheet = SongScoreSheet.instance;
    const songCollectionSheet = SongCollectionSheet.instance;
    // 指定の難易度のみのデータを取り出し
    const diffData = songCollectionSheet.getCollectionData(difficulty);
    //全データチェック
    for (const collectedSong of diffData) {
        if (collectedSong.nameJp === "") continue;
        // 登録済みかどうか
        const registeredSong = songScoreSheet.searchRegisteredSong(
            collectedSong.difficulty,
            collectedSong.songTitle
        );
        if (registeredSong === null || registeredSong === undefined) continue;
        // 整合性確認
        const equalSongData = checkSongDataConsistency(registeredSong, collectedSong.toSongData());
        if (equalSongData) continue;
        // 更新
        console.log("update data of %s(%s)", registeredSong.nameJp, registeredSong.difficulty);
        const newSongData = updateSongDataWithDelta(registeredSong, collectedSong.toSongData());
        songScoreSheet.overwriteSong(newSongData);
    }
    songScoreSheet.updateSheet();
    console.log("End updating(%s)", difficulty);
}
function checkSongDataConsistency(registeredSong, collectedSong) {
    const equalLevel = registeredSong.level === collectedSong.level;
    const equalConstant = registeredSong.constant === collectedSong.constant;
    const equalNotes = registeredSong.notes === collectedSong.notes;
    return equalLevel && equalConstant && equalNotes;
}
function updateSongDataWithDelta(songData, newSongData) {
    const updateSongData = new Song(songData.getSongDataList());
    updateSongData.level = newSongData.level;
    updateSongData.constant =
        newSongData.constant !== "" && newSongData.constant !== 0
            ? newSongData.constant
            : updateSongData.constant;
    updateSongData.notes =
        newSongData.notes !== "" && newSongData.notes !== 0
            ? newSongData.notes
            : updateSongData.notes;
    return updateSongData;
}

function registerSongData(difficulty) {
    console.log("Start registering(%s)", difficulty);
    const songScoreSheet = SongScoreSheet.instance;
    const songCollectionSheet = SongCollectionSheet.instance;
    // 指定の難易度のみのデータを取り出し
    const diffData = songCollectionSheet.getCollectionData(difficulty);
    // 定数情報が未登録でも強制登録
    const isIgnoreConstant = songScoreSheet.isIgnoreConstant();
    //全データチェック
    for (const collectedSong of diffData) {
        if (collectedSong.nameJp === "") continue;
        if (collectedSong.nameJp === null) continue;
        //存在確認
        const isRegistered = songScoreSheet.isRegistered(
            collectedSong.difficulty,
            collectedSong.songTitle
        );
        if (isRegistered) continue;
        // まだ定数が判明していなければ、無視
        if (collectedSong.constant === "" && !isIgnoreConstant) continue;
        console.log("getting data of %s(%s)", collectedSong.nameJp, collectedSong.difficulty);
        try {
            fetchSongDataFromWiki(collectedSong);
        } catch (e) {
            console.warn("fetch error (%s): ", collectedSong.nameJp, e);
            continue;
        }
        // 欠けがあるか確認
        const song = collectedSong.toSongData();
        if (song.isLuckData()) {
            // データが足りなければ飛ばす
            console.warn("Exist luck data (%s)", song.nameJp);
            continue;
        }
        songScoreSheet.addSong(song);
        songScoreSheet.updateSheet();
    }
    console.log("End registering(%s)", difficulty);
}

function checkCollectedSong() {
    autoRegister();
    update();
}
function autoRegister() {
    console.log("Start auto register");
    // registerSongData("PST");
    // registerSongData("PRS");
    registerSongData("FTR");
    registerSongData("BYD");
    registerSongData("ETR");
    console.log("End auto register");
}
function update() {
    console.log("Start update");
    updateData("FTR");
    updateData("BYD");
    updateData("ETR");
    console.log("End update");
}

/**
 * 手動登録ルーチン
 */
function manualRegister() {
    console.log("start manual register");
    const songScoreSheet = SongScoreSheet.instance;
    const col = 0;
    const dat = MANUAL_REGISTER_SHEET.getDataRange().getValues()[1];
    //各曲情報を取得
    let name = extractionJaName(dat[col]);
    name = changeCodeToString(name);
    const songTitle = dat[col + 1];
    const difficulty = dat[col + 2];
    //存在確認
    const isRegistered = songScoreSheet.isRegistered(difficulty, songTitle);
    if (isRegistered) return;
    const urlName = extractionUrlName(toHalfWidth(dat[col]));
    const level = dat[col + 3];
    const constant = dat[col + 4];
    console.log("%s(%s)", name, difficulty);
    //wikiで残りデータを取得
    const musicData = FetchArcaeaWiki.createSongData(urlName);
    const song = new Song([
        name,
        songTitle,
        musicData.composer,
        difficulty,
        level,
        constant,
        musicData.pack,
        musicData.version,
        musicData.getNotesByDiff(difficulty)[0],
        0,
    ]);
    //すべてのデータが取得できているか確認
    if (song.isLuckData()) {
        songScoreSheet.addSong(song);
    } else {
        console.log("No wiki data (%s)", name);
    }
    console.log("end manual register");
}

const triggerList = [
    { pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, "Y5"), func: songDifficultySort },
    { pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, "Y6"), func: songNameSort },
    { pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, "Y7"), func: songLevelSort },
    { pair: new SheetCellPair(SONG_SCORE_SHEET_NAME, "Y9"), func: checkCollectedSong },
    { pair: new SheetCellPair(MANUAL_REGISTER_SHEET_NAME, "G2"), func: manualRegister },
];
/**
 * 難易度順に並び替え
 */
function songDifficultySort() {
    const songScoreSheet = SongScoreSheet.instance;
    songScoreSheet.sort("Song Title (English)", true);
    songScoreSheet.sort("レベル(ソート用)", true);
    songScoreSheet.sort("難易度", true);
}
/**
 * 曲名順に並び替え
 */
function songNameSort() {
    const songScoreSheet = SongScoreSheet.instance;
    songScoreSheet.sort("Song Title (English)", true);
    songScoreSheet.sort("難易度", true);
}
/**
 * レベル順に並び替え
 */
function songLevelSort() {
    const songScoreSheet = SongScoreSheet.instance;
    songScoreSheet.sort("Song Title (English)", true);
    songScoreSheet.sort("レベル(ソート用)", true);
}
function runTrigger(changedPair) {
    const pairIndex = triggerList.findIndex(pair => pair["pair"].equal(changedPair));
    if (pairIndex === -1) return;
    // チェックボックスの場合、falseに変更 (チェックされてない場合は終了)
    if (changedPair.cell_location !== "") {
        const changeSheet = SHEET_BOOK.getSheetByName(changedPair.sheet_name);
        const cell = changeSheet.getRange(changedPair.cell_location);
        if (cell.getValue() === false) return;
        cell.setValue(false);
    }
    triggerList[pairIndex]["func"]();
}

function updateDailyStatistics() {
    console.log("Update daily statistics");
    const statisticsDifficulties = [Difficulty.Future, Difficulty.Beyond, Difficulty.Eternal];
    const dailySheet = DailyRepositorySheet.instance;
    const songScoreSheet = SongScoreSheet.instance;
    const today = new Date();
    const bestPotential = songScoreSheet.getBestPotential();
    let gradeData = new GradeData();
    const scoreData = [];
    for (const difficulty of statisticsDifficulties) {
        const grade = songScoreSheet.getGrades(difficulty);
        gradeData = gradeData.plus(grade);
        const maximumScore = songScoreSheet.getMaximumSumScore(difficulty);
        const score = songScoreSheet.getSumScore(difficulty);
        const farNotes = songScoreSheet.getFarNotes(difficulty);
        const luckShinyPure = songScoreSheet.getLuckShinyPureNotes(difficulty);
        scoreData.push(new ScoreData(score, maximumScore - score, farNotes, luckShinyPure));
    }
    const dailyData = new DailyArcaeaData(today, bestPotential, gradeData, scoreData);
    dailySheet.addData(dailyData);
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function onChangeData(e) {
    const sheet = e.source.getActiveSheet();
    const cell = e.source.getActiveRange();
    if (cell === null) return;
    const lock = LockService.getScriptLock(); // 二重実行防止
    if (!lock.tryLock(1)) return;
    const changedPair = new SheetCellPair(sheet.getName(), cell.getA1Notation());
    console.log("Changed %s(%s)", changedPair.cell_location, changedPair.sheet_name);
    runTrigger(changedPair);
    lock.releaseLock();
}

/**
 * 日付変更で実行
 */
function setDataByDate() {
    console.log("Run daily task");
    updateDailyStatistics();
    console.log("End daily task");
}
