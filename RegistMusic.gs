/**
 * 手動登録ルーチン
 */
function manualRegist() {
  Logger.log("start manual regist")

  const col = 0;
  const dat = manualSheet.getDataRange().getValues()[1];

  //各局情報を取得
  const url = toHalfWidth(dat[col]);
  var name = dat[col + 1];
  const nameEn = dat[col + 2];
  const composer = dat[col + 3];
  const difficulty = dat[col + 4];
  const level = dat[col + 5];
  const constant = dat[col + 6];

  //url用の名前を取り除く
  var match = name.match("(.+)>");
  if (match != null)
    name = match[1];
  else if (name == "")
    return;

  //存在確認
  var isUnregist = isUnregistedMusic(name, difficulty);
  if(isUnregist) {
    Logger.log(Utilities.formatString("%s(%s)", name, difficulty));
    //wikiで残りデータを取得
    const othersData = getMusicData(url, difficulty);
    addMusic(name, nameEn, composer, othersData[0], othersData[1], difficulty, level, othersData[2], 0, constant);
  }
  Logger.log("end manual regist")
}

/**
 * 日本語用曲名を取得
 */
function extractionJaName(name) {
    var match = name.match(/(.+)>/);

    if (match != null) {
      name = changeCodeToString(match[1]);
    } else if (name == "") {
      return "";
    }
    return name;
}

/**
 * 文字コード化しているところを置き換え
 */
function changeCodeToString(s) {
  var chars = s.match(/&#(\d+);/);
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
  for(var i = 1; i < dat.length; i++) {
    const name = extractionJaName(dat[i][col + 1])
    if (name == "") {
      continue;
    }

    //存在確認
    const isUnregist = isUnregistedMusic(name, difficulty);
    if(isUnregist) {
      const nameEn = dat[i][col + 2];
      const composer = dat[i][col + 3];
      const level = dat[i][col + 4];
      const constant = dat[i][col + 5];
      const url = toHalfWidth(dat[i][col]);
      var music = new Music(name, nameEn, composer, difficulty, level, constant)

      Logger.log(Utilities.formatString("%s(%s)", name, difficulty));
      //wikiで残りデータを取得
      music.getDataFromWiki(url);

      //すべてのデータが取得できているか確認
      if (music.isGettedData()) {
        music.addMusic();
      } else {
        //wikiにデータがなければ飛ばす
        Logger.log("No wiki data");
      }

      //サーバーに負荷をかけないようにする
      Utilities.sleep(2000);
    }
  }
  Logger.log(Utilities.formatString("End registing(%s)", difficulty))
}

const musicSheetData = musicSheet.getRange(1, 1, musicSheet.getLastRow(), musicSheet.getRange(1, 1).getNextDataCell(SpreadsheetApp.Direction.NEXT).getColumn()).getValues();
function isUnregistedMusic(name, difficulty) {
  var row = -1;

  //指定の楽曲の難易度が一致するまで検索
  do {
    row = findRow(musicSheetData, name, 0, row + 1);
    if (row < 0) {
      return true;
    } else {
      //指定の難易度か確認
      var isExist = musicSheetData[row].includes(difficulty);
      if(isExist) {
        return false;
      }
    }
  } while(true)
}
