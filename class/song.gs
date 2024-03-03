class Song {
  constructor(record) {
    [this.songTitle, this.nameJp, this.nameEn, this.composer, this.pack, this.version, this.side, this.difficulty, this.level, this.constant, this.notes, this.score] = record;
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
      this.difficulty,
      this.level,
      this.constant,
      this.notes,
      this.score
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
