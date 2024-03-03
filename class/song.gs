class Song {
  constructor(record, difficulty, score = 0) {
    let constantOld, constantNow;

    [this.songTitle, this.nameJp, this.nameEn, this.composer, this.side, this.level, constantOld, constantNow, this.notes] = record;
    this.constant = (constantNow != "") ? constantNow : constantOld;
    this.difficulty = difficulty
    this.score = score

    // url用の名前も含んでいるので分離
    // また、文字コードもあるのでそれも変換
    this.urlName = extractionUrlName(this.nameJp);
    this.nameJp = extractionJaName(this.nameJp);

    this.pack = null;
    this.version = null;
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
    const existNull = this.getSongDataList().includes(null);
    const existBlank = this.getSongDataList().includes("");
    const existNegative = this.getSongDataList().includes(-1);
    return existNull || existBlank || existNegative;
  }
}
