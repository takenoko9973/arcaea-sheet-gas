class Music {
  constructor(name, nameEn, composer, difficulty, level, constant, pack = null, version = null, notes = null) {
    this.name = name;
    this.nameEn = nameEn;
    this.composer = composer;
    this.difficulty = difficulty;
    this.level = level;
    this.constant = constant;
    
    this.pack = pack;
    this.version = version;
    this.notes = notes;
  }
  
  getNotesIndex() {
    switch(this.difficulty) {
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
  
  getVerIndex() {
    switch(this.difficulty) {
      case "PST":
      case "PRS":
      case "FTR":
        return 0;
      case "BYD":
        return 1;
    }
  }
  
  getMusicDataList() {
    return [this.name,
            this.nameEn,
            this.composer,
            this.pack,
            this.version,
            this.difficulty,
            this.level,
            this.notes,
            0,
            this.constant];
  }
  
  /**
   * 必要なデータがすべてあるかどうかを取得
   */
  isGettedData() {
    var dataList = this.getMusicDataList()
    var getted = !(dataList.includes(null) || dataList.includes("")); //一つでも空のデータがあればfalseを返す
    return getted;
  }

  addMusic() { 
    if (this.isGettedData()) {
      var addInfo = [this.getMusicDataList()];

      var aCol = musicSheet.getRange("A:A").getValues();
      //空白の要素を除いた最後の行を取得
      var lastRow = aCol.filter(String).length + 1;
      //行追加
      musicSheet.insertRowAfter(lastRow);

      musicSheet.getRange("A" + lastRow + ":J" + lastRow).setValues(addInfo);
    }
  }
}
