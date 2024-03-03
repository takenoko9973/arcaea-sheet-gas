function registSongData(difficulty) {
  console.log("Start registing(%s)", difficulty);

  // 指定の難易度のみのデータを取り出し
  const diffData = fetchDifficultyCollectData(difficulty);

  //全データチェック
  for (var i = 1; i < diffData.length; i++) {
    const collectSong = new CollectionSong(difficulty, diffData[i]);
    if (collectSong.nameJp == "") continue;
    if (collectSong.nameJp == null) continue;

    //存在確認
    const isRegisted = isRegistedSong(collectSong);
    if (isRegisted) continue;

    // まだ定数が判明していなければ、無視
    if (collectSong.constant == "") continue;

    console.log("getting data of %s(%s)", collectSong.nameJp, collectSong.difficulty);
    fetchSongDataFromWiki(collectSong)

    // 欠けがあるか確認
    const song = collectSong.toSongData();
    if (song.isLuckData()) {
      // データが足りなければ飛ばす
      console.warn("Exist luck data (%s)", song.nameJp);
      continue;
    }
    addSong(song);
  }
  console.log("End registing(%s)", difficulty);
}

/**
 * songをリストの一番後ろに追加する
 */
function addSong(song) {
  const addInfo = [song.getSongDataList()];

  const aCol = SONG_SHEET.getRange("A:A").getValues();
  const lastRow = aCol.filter(String).length + 1; //空白の要素を除いた最後の行を取得

  //行追加
  SONG_SHEET.insertRowAfter(lastRow);
  SONG_SHEET.getRange("A" + lastRow + ":L" + lastRow).setValues(addInfo);
}

/**
 * 指定の楽曲とレベルが登録されているかどうか
 */
function isRegistedSong(song) {
  var row = -1;

  //指定の楽曲の難易度が一致するまで検索
  do {
    row = findRow(SONG_SHEET_DATA, song.songTitle, 0, row + 1);
    if (row < 0) {
      return false;
    } else {
      //指定の難易度か確認
      var isExist = SONG_SHEET_DATA[row].includes(song.difficulty);
      if (isExist) return true;
    }
  } while (true)
}
