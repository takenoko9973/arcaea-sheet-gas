class CollectionSong {
  constructor(difficulty, data) {
    let constantOld, constantNow;

    this.difficulty = difficulty;
    [this.songTitle, this.nameJp, this.nameEn, this.composer, this.side, this.level, constantOld, constantNow, this.notes] = data;
    this.constant = (constantNow != "") ? constantNow : constantOld;

    // url用の名前も含んでいるので分離
    // また、文字コードもあるのでそれも変換
    this.urlName = extractionUrlName(this.nameJp);
    this.nameJp = extractionJaName(this.nameJp);
  }

  toSongData() {
    return new Song([
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
      0
    ]);
  }
}

function fetchSongDataFromWiki(collectSong) {
  // wikiから、追加のデータを取得
  const songData = FetchArcaeaWiki.createSongData(collectSong.urlName)
  Utilities.sleep(1500); //サーバーに負荷をかけないようにする

  // wikiからのデータを取り込む
  collectSong.notes = (collectSong.notes != "") ? collectSong.notes : songData.notes;
  collectSong.pack = songData.pack;
  collectSong.version = songData.version.match(/^(\d+\.\d+)/)[1];
}
