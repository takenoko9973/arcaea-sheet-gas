/**
 * 手動登録ルーチン
 */
function manualRegist() {
  Logger.log("start manual regist")

  const col = 0;
  const dat = manualSheet.getDataRange().getValues()[1];

  //各曲情報を取得
  var name = extractionJaName(dat[col]);
  name = changeCodeToString(name);
  const songTitle = dat[col + 1];
  const difficulty = dat[col + 2];

  //存在確認
  const isUnregist = isUnregistedMusic(songTitle, difficulty);
  if (!isUnregist) return;

  const urlName = extractionUrlName(toHalfWidth(dat[col]));
  const level = dat[col + 3];
  const constant = dat[col + 4];

  Logger.log(Utilities.formatString("%s(%s)", name, difficulty));
  //wikiで残りデータを取得
  const musicData = ArcaeaWikiAPI.getMusicFromWiki(urlName)
  var song = new Song(
    name,
    songTitle,
    musicData.composer,
    difficulty,
    level,
    constant,
    musicData.pack,
    musicData.version,
    musicData.notes[difficulty]
  )

  //すべてのデータが取得できているか確認
  if (song.isLuckData()) {
    addMusic(song);
  } else {
    Logger.log(Utilities.formatString("No wiki data (%s)", name));
  }

  Logger.log("end manual regist")
}

function addMusic(song) {
  if (song.isLuckData()) return;

  var addInfo = [song.getSongDataList()];

  var aCol = songSheet.getRange("A:A").getValues();
  //空白の要素を除いた最後の行を取得
  var lastRow = aCol.filter(String).length + 1;
  //行追加
  songSheet.insertRowAfter(lastRow);

  songSheet.getRange("A" + lastRow + ":J" + lastRow).setValues(addInfo);
}

function autoRegist() {
  Logger.log("Start auto regist");
  // registMusicData("PST");
  // registMusicData("PRS");
  registMusicData("FTR");
  registMusicData("BYD");
  Logger.log("End auto regist");
}

function registMusicData(difficulty) {
  Logger.log(Utilities.formatString("Start registing(%s)", difficulty))

  const dat = collectSheet.getRange(1, 1, collectSheet.getLastRow(), collectSheet.getLastColumn()).getValues();
  //指定の難易度の曲データの行番号を取得
  const col = dat[0].indexOf(difficulty) + 1;

  //全データチェック
  for (var i = 1; i < dat.length; i++) {
    //曲名取得
    var name = extractionJaName(dat[i][col + 1]);
    if (name == "") continue;
    name = changeCodeToString(name);

    //存在確認
    const isUnregist = isUnregistedMusic(name, difficulty);
    if (isUnregist) {
      const nameEn = dat[i][col + 2];
      const constant = dat[i][col + 5];
      const urlName = extractionUrlName(dat[i][col + 1]);
      if (constant == null) continue

      Logger.log(Utilities.formatString("getting data of %s(%s)", name, difficulty));

      const musicData = ArcaeaWikiAPI.getMusicFromWiki(urlName)
      if (musicData == null) {
        Utilities.sleep(1500);
        continue;
      }

      var music = new Song(
        name,
        nameEn,
        musicData.composer,
        difficulty,
        musicData.level[difficulty],
        constant,
        musicData.pack,
        musicData.version,
        musicData.notes[difficulty]
      )

      //すべてのデータが取得できているか確認
      if (music.isLuckData()) {
        addMusic();
      } else {
        //wikiにデータがなければ飛ばす
        Logger.log(Utilities.formatString("No wiki data (%s)", name));
      }

      //サーバーに負荷をかけないようにする
      Utilities.sleep(1500);
    }
  }
  Logger.log(Utilities.formatString("End registing(%s)", difficulty))
}

function isUnregistedMusic(songTitle, difficulty) {
  var row = -1;

  //指定の楽曲の難易度が一致するまで検索
  do {
    row = findRow(songSheetData, songTitle, 1, row + 1);
    if (row < 0) {
      return true;
    } else {
      //指定の難易度か確認
      var isExist = songSheetData[row].includes(difficulty);
      if (isExist) {
        return false;
      }
    }
  } while (true)
}

/**
 * Url用の名前を取得
 */
function extractionUrlName(name) {
  var match = name.match(/>(.+)/);

  if (match != null) {
    name = match[1];
  } else if (name == "") {
    return "";
  }
  name = changeCodeToString(name); // Löschenだけコード標記なので、変換して対応

  return name;
}

/**
 * 日本語用曲名を取得
 */
function extractionJaName(name) {
  var match = name.match(/(.+)>/);

  if (match != null) {
    name = match[1];
  } else if (name == "") {
    return "";
  }
  return changeCodeToString(name);
}

/**
 * 文字コード化しているところを置き換え
 */
function changeCodeToString(s) {
  var chars = s.match(/&#([0-9]+);/);
  if (chars == null)
    return s;

  //文字コード化している部分を一つずつ変換
  for (i = 1; i < chars.length; i++) {
    var char = chars[i];
    var cs = String.fromCharCode(char);
    var replaceWord = new RegExp("&#" + char + ";", "g");
    s = s.replace(replaceWord, cs);
  }
  return s;
}
