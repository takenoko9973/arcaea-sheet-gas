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
    //wikiで残りデータを取得
    const othersData = getMusicData(url, difficulty);
    addMusic(name, nameEn, composer, othersData[0], othersData[1], difficulty, level, othersData[2], 0, constant);

    Logger.log(Utilities.formatString("%s(%s), note: %4d", name, difficulty, note));
  }
  Logger.log("end manual regist")
}

/**
 * url用の名前を取り除く
 */
function deleteNameForUrl(name) {
    var match = name.match("(.+)>");

    if (match != null) {
      name = match[1];
    } else if (name == "") {
      return "";
    }
    return name;
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
    const name = deleteNameForUrl(dat[i][col + 1])
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

      //wikiで残りデータを取得
      music.getDataFromWiki(url);

      if (music.isGettedData()) {
        music.addMusic();
        Logger.log(Utilities.formatString("%s, note: %4d", music.name, music.note));
      } else {
        //wikiにデータがなければ飛ばす
        Logger.log(Utilities.formatString("%s, note: no wiki data", music.name));
      }

      //サーバーに負荷をかけないようにする
      Utilities.sleep(2000);
    }
  }

  Logger.log(Utilities.formatString("End registing(%s)", difficulty))
}

function isUnregistedMusic(name, difficulty) {
  const mDat = musicSheet.getRange(1, 1, musicSheet.getLastRow(), musicSheet.getRange(1, 1).getNextDataCell(SpreadsheetApp.Direction.NEXT).getColumn()).getValues();
  var row = -1;

  //指定の楽曲の難易度が一致するまで検索
  do {
    row = findRow(mDat, name, 0, row + 1);
    if (row < 0) {
      return true;
    } else {
      //指定の難易度か確認
      var isExist = mDat[row].includes(difficulty);
      if(isExist) {
        return false;
      }
    }
  } while(true)
}
