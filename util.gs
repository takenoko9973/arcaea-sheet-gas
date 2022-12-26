/**
 * カタカナ以外を全角から半角へ変換
 **/
function toHalfWidth(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

/**
 * 行検索
 */
function findRow(dat, val, col, sRow = 0){
  var row = -1;

  if(col >= 0) {
    //指定の行だけ抜き出し
    var colList = dat.map((row) => row[col]);
    //リスト検索
    row = colList.indexOf(val, sRow);
  }
  return row;
}

/**
 * 指定の難易度のデータのみを取り出し
 */
function fetchDifficultyCollectData(difficulty) {
  //指定の難易度の曲データの行番号を取得
  const col = diffData[0].indexOf(difficulty) + 1;
  // 指定の難易度のみのデータを取り出し
  const fetchedDiffData = diffData.map(item => item.slice(col, col + 8));
  
  return fetchedDiffData;
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
