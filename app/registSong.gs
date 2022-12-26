/**
 * songをリストの一番後ろに追加する
 */
function addSong(song) {
  if (song.isLuckData()) return;

  const addInfo = [song.getSongDataList()];

  const aCol = songSheet.getRange("A:A").getValues();
  //空白の要素を除いた最後の行を取得
  const lastRow = aCol.filter(String).length + 1;
  //行追加
  songSheet.insertRowAfter(lastRow);

  songSheet.getRange("A" + lastRow + ":L" + lastRow).setValues(addInfo);
}

function registSongData(difficulty) {
  Logger.log(Utilities.formatString("Start registing(%s)", difficulty))

  // 指定の難易度のみのデータを取り出し
  const diffData = fetchDifficultyCollectData(difficulty);

  //全データチェック
  for (var i = 1; i < diffData.length; i++) {
    const song = new Song(diffData[i], difficulty);
    if (song.nameJp == "") continue;
    if (song.nameJp == null) continue;

    //存在確認
    const isRegisted = isRegistedSong(song);
    if (isRegisted) continue;
    
    // まだ定数が判明していなければ、無視
    if (song.chartInfo.constant == null) continue;

    Logger.log(Utilities.formatString("getting data of %s(%s)", song.nameJp, song.chartInfo.difficulty));

    // wikiから、追加のデータを取得
    const musicData = ArcaeaWikiAPI.getMusicFromWiki(song.urlName)
    Utilities.sleep(1500); //サーバーに負荷をかけないようにする

    if (musicData == null) continue;

    // wikiからのデータを取り込む
    song.pack = musicData.pack;
    song.version = musicData.version;

    // 欠けがあるか確認
    if (song.isLuckData()) {
      //wikiにデータがなければ飛ばす
      Logger.log(Utilities.formatString("No wiki data (%s)", name));
      continue;
    }

    addSong(song);
  }
  Logger.log(Utilities.formatString("End registing(%s)", difficulty))
}

/**
 * 指定の楽曲とレベルが登録されているかどうか
 */
function isRegistedSong(song) {
  var row = -1;

  //指定の楽曲の難易度が一致するまで検索
  do {
    row = findRow(songSheetData, song.songTitle, 0, row + 1);
    if (row < 0) {
      return false;
    } else {
      //指定の難易度か確認
      var isExist = songSheetData[row].includes(song.chartInfo.difficulty);
      if (isExist) return true;
    }
  } while (true)
}
