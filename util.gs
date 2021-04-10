function toHalfWidth(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

function findCol(dat, val, row, sCol = 0) {
  var col = -1;

  if(row >= 0) {
    //指定の値の列番号を取得
    for (var i = sCol; i < dat[row].length; i++) {
      if (dat[row][i] === val) {
        col = i;
        break;
      }
    }
  }
  return col;
}

function findRow(dat, val, col, sRow = 0){
  var row = -1;

  if(col >= 0) {
    //指定の値の行番号を取得
    for (var i = sRow; i < dat.length; i++) {
      if (dat[i][col] === val) {
        row = i;
        break;
      }
    }
  }
  return row;
}
