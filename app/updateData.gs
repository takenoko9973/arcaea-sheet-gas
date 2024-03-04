function updateData(difficulty) {
  console.log("Start updating(%s)", difficulty);

  // 指定の難易度のみのデータを取り出し
  const diffData = fetchDifficultyCollectData(difficulty);
  //全データチェック
  for (var i = 1; i < diffData.length; i++) {
    
  }
  console.log("End updating(%s)", difficulty);
}
