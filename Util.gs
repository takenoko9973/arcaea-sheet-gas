/**
 * カタカナ以外を全角から半角へ変換
 **/
function toHalfWidth(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

/**
 * 行検索
 */
function findRow(dat, val, col, sRow = 0){
  var row = -1;

  if(col >= 0) {
    //指定の行だけ抜き出し
    var colList = dat.map((row) => row[col]);
    //リスト検索
    row = colList.indexOf(val, sRow);
  }
  return row;
}
