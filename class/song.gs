class Song {
  constructor(record, difficulty) {
    [this.songTitle, this.nameJp, this.nameEn, this.composer, this.side, level, notes, constant] = record;
    this.chartInfo = new chartInfo(difficulty, level, constant, notes);

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
      this.chartInfo.notes,
      this.chartInfo.constant,
      0, // スコア
    ];
  }

  /**
   * 不足しているデータがあるかどうか
   */
  isLuckData() {
    return getMusicDataList().include(null);
  }
}
