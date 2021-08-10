class Music {
  constructor(name, nameEn, composer, difficulty, level, constant) {
    this.name = name;
    this.nameEn = nameEn;
    this.composer = composer;
    this.difficulty = difficulty;
    this.level = level;
    this.constant = constant;
    
    this.pack = null;
    this.version = null;
    this.note = null;
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
  
  /**
   * テーブル内の任意の行、列にある値を取得
   */
  getValFromTable(table, row, col, regex) {
    try {
      const notes = Parser.data(table).from('<tr>').to('</tr>').iterate()[row];
      const vals = Parser.data(notes).from('<td ').to('</td>').iterate();

      //列が足りなかったとき一番後ろの列を取得するよう調整
      col = Math.min(col, vals.length - 1)

      return vals[col].match(regex)[1];
    } catch(e) {
      //値が取れなかったとき、nullを返す
      return null;
    }
  }
  
  /**
   * Arcaea wikiからノーツ数、パック名、追加バージョンを取得
   */
  getDataFromWiki(url) {
    try {
      const html = UrlFetchApp.fetch(url).getContentText('UTF-8');
      const table = Parser.data(html).from('<table>').to('</table>').iterate()[0];

      const noteIndex = this.getNotesIndex(this.difficulty);
      const verIndex = this.getVerIndex(this.difficulty);

      this.note = this.getValFromTable(table, 4, noteIndex, "(\\d+)$");
      this.pack = this.getValFromTable(table, 7, 0, 'class="rel-wiki-page">([^<]+)<');
      this.version = this.getValFromTable(table, 9, verIndex, "ver.([\\d.]+)[.]\\d");
    } catch {
      Logger.log("Wiki error (" + url + ")")
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
            this.note,
            0,
            this.constant];
  }
  
  /**
   * 必要なデータがすべてあるかどうかを取得
   */
  isGettedData() {
    var dataList = this.getMusicDataList()
    var getted = !dataList.includes(null); //一つでも空のデータがあればfalseを返す
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
