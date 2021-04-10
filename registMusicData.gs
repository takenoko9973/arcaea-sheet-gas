function manualRegist() {
  Logger.log("start manual regist")

  const dat = manualSheet.getDataRange().getValues();
  const mDat = musicSheet.getDataRange().getValues();
  const col = 0;

  var url = dat[1][col];
  var name = dat[1][col + 1];
  var nameEn = dat[1][col + 2];
  var composer = dat[1][col + 3];
  var difficulty = dat[1][col + 4];
  var level = dat[1][col + 5];
  var constant = dat[1][col + 6];

  var match = name.match("(.+)>");
  if (match != null)
    name = match[1];
  else if (name == "")
    return;

  var isUnregist = isUnregistedMusic(mDat, name, difficulty);

  if(isUnregist) {
    var addData = getMusicData(url, difficulty);
    addMusic(name, nameEn, composer, addData[0], addData[1], difficulty, level, addData[2], 0, constant);
    Logger.log(Utilities.formatString("%s(%s), note: %4d", name, difficulty, addData[2]));
  }
}

function registMusic() {
  // addUnregistedData("PST");
  // addUnregistedData("PRS");
  addUnregistedData("FTR");
  addUnregistedData("BYD");
}

function addUnregistedData(difficulty) {
  const dat = dataSheet.getDataRange().getValues();
  const mDat = musicSheet.getDataRange().getValues();
  const col = findCol(dat, difficulty, 0) + 1;
  
  for(var i = 1; i < dat.length; i++) {
    var name = (dat[i][col + 2].match("(.+)>") || ["", dat[i][col + 2]])[1];
    if(name == "") {
      continue;
    }

    var isUnregist = isUnregistedMusic(mDat, name, difficulty);

    if(isUnregist) {
      var url = toHalfWidth(dat[i][col]);
      var nameEn = dat[i][col + 3];
      var composer = dat[i][col + 4];
      var level = dat[i][col + 5];
      var constant = dat[i][col + 6];
      var addData = getMusicData(url, difficulty);

      addMusic(name, nameEn, composer, addData[0], addData[1], difficulty, level, addData[2], 0, constant);
      Logger.log(Utilities.formatString("%s(%s), note: %4d", name, difficulty, addData[2]));
      Utilities.sleep(2000);
    }
  }

  Logger.log(Utilities.formatString("Regist complete(%s)", difficulty))
}

function addMusic(name, nameEn, composer, pack, version, difficulty, level, note, score, constant) { 
  var addInfo = [[name, nameEn, composer, pack, version, difficulty, level, note, score, constant]];
  
  var AValues = musicSheet.getRange("A:A").getValues();
  //空白の要素を除いた最後の行を取得
  var lastRow = AValues.filter(String).length + 1;

  musicSheet.getRange("A" + lastRow + ":J" + lastRow).setValues(addInfo);
}

function isUnregistedMusic(dat, name, difficulty) {
    var row = -1;

    //複数ある場合もすべて検索
    do {
      row = findRow(dat, name, 0, row + 1);
      var col = findCol(dat, difficulty, row);
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

function getVal(html, row, col, regex) {
  const table = Parser.data(html).from('<table>').to('</table>').iterate()[0];
  const notes = Parser.data(table).from('<tr>').to('</tr>').iterate()[row];
  const vals = Parser.data(notes).from('<td ').to('</td>').iterate();
  if(col >= vals.length) {
    col = vals.length - 1
  }

  return vals[col].match(regex)[1];
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