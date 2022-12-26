class Song {
  constructor(record, difficulty) {
    let level, notes, constant;

    [this.songTitle, this.nameJp, this.nameEn, this.composer, this.side, level, constant, notes] = record;
    this.chartInfo = new ChartInfo(difficulty, level, constant, notes);

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
      this.version,
      this.side,
      this.chartInfo.difficulty,
      this.chartInfo.level,
      this.chartInfo.constant,
      this.chartInfo.notes,
      0, // スコア
    ];
  }

  /**
   * 不足しているデータがあるかどうか
   */
  isLuckData() {
    return this.getSongDataList().includes(null);
  }
}
