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

function autoRegist() {
  Logger.log("start auto regist");
  // registMusicData("PST");
  // registMusicData("PRS");
  registMusicData("FTR");
  registMusicData("BYD");
  Logger.log("end auto regist");
}

function registMusicData(difficulty) {
  Logger.log(Utilities.formatString("Start registing(%s)", difficulty))

  const dat = dataSheet.getDataRange().getValues();
  const col = findCol(dat, difficulty, 0) + 1;
  
  //全部チェック
  for(var i = 1; i < dat.length; i++) {
    const url = toHalfWidth(dat[i][col]);
    var name = dat[i][col + 1]
    const nameEn = dat[i][col + 2];
    const composer = dat[i][col + 3];
    const level = dat[i][col + 4];
    const constant = dat[i][col + 5];

    //url用の名前を取り除く
    var match = name.match("(.+)>");
    if (match != null)
      name = match[1];
    else if (name == "")
      return;

    //存在確認
    const isUnregist = isUnregistedMusic(name, difficulty);
    if(isUnregist) {
      //wikiで残りデータを取得
      var othersData = getMusicData(url, difficulty);
      if (othersData.includes(null)) {
        //wikiにデータがなければ飛ばす
        Logger.log(Utilities.formatString("%s(%s), note: no wiki data", name, difficulty));
        continue;
      }

      addMusic(name, nameEn, composer, othersData[0], othersData[1], difficulty, level, othersData[2], 0, constant);
      Logger.log(Utilities.formatString("%s(%s), note: %4d", name, difficulty, othersData[2]));
      
      //サーバーに負荷をかけないようにする
      Utilities.sleep(2000);
    }
  }

  Logger.log(Utilities.formatString("End registing(%s)", difficulty))
}

function addMusic(name, nameEn, composer, pack, version, difficulty, level, note, score, constant) { 
  var addInfo = [[name, nameEn, composer, pack, version, difficulty, level, note, score, constant]];
  
  var AValues = musicSheet.getRange("A:A").getValues();
  //空白の要素を除いた最後の行を取得
  var lastRow = AValues.filter(String).length + 1;

  musicSheet.getRange("A" + lastRow + ":J" + lastRow).setValues(addInfo);
}

function isUnregistedMusic(name, difficulty) {
    const mDat = musicSheet.getDataRange().getValues();
    var row = -1;

    //指定の楽曲の難易度が一致するまで検索
    do {
      row = findRow(mDat, name, 0, row + 1);
      var col = findCol(mDat, difficulty, row);
      if(col != -1) {
        return false;
      }
    } while(row >= 0)
    
    return true;
}

//パック、バージョン、ノーツ数
function getMusicData(url, difficulty) {
  const html = UrlFetchApp.fetch(url).getContentText('UTF-8');
  const noteIndex = getNotesIndex(difficulty);
  const versionIndex = getVersionIndex(difficulty);

  var notes = getVal(html, 4, noteIndex, "(\\d+)$");
  var pack = getVal(html, 7, 0, ">(.+)");
  var version = getVal(html, 9, versionIndex, "ver.([\\d.]+)[.]\\d");

  return [pack, version, notes];
}

//テーブル内の任意の行、列にある値を取得
function getVal(html, row, col, regex) {
  try {
    const table = Parser.data(html).from('<table>').to('</table>').iterate()[0];
    const notes = Parser.data(table).from('<tr>').to('</tr>').iterate()[row];
    const vals = Parser.data(notes).from('<td ').to('</td>').iterate();

    //列が足りなかったとき一番後ろの列を取得するよう調整
    if(col >= vals.length) {
      col = vals.length - 1
    }
    return vals[col].match(regex)[1];
  } catch(e) {
    //値が取れなかったとき、nullを返す
    return null;
  }
}

function getNotesIndex(difficulty) {
  switch(difficulty) {
    case "PST":
      return 0;
    case "PRS":
      return 1;
    case "FTR":
      return 2;
    case "BYD":
      return 3;
  }
}

function getVersionIndex(difficulty) {
  switch(difficulty) {
    case "PST":
    case "PRS":
    case "FTR":
      return 0;
    case "BYD":
      return 1;
  }
}