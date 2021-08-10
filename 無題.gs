function myFunction() {
  Logger.log(changeCodeToString("L&#246;schen"))
}

/**
 * 文字コード化しているところを置き換え
 */
function changeCodeToString(s) {
  var chars = s.match(/&#(\d+);/);
  if (chars == null)
    return s;

  //文字コード化している部分を一つずつ変換
  for (i = 1; i < chars.length; i++) {
    var char = chars[i];
    var cs = String.fromCharCode(char);
    var replaceWord = new RegExp("&#" + char + ";", "g");
    s = s.replace(replaceWord, cs);
  }
  return s;
}
