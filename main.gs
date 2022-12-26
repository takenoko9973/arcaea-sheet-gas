function musicDataSort_(num) {
  songSheet.getRange('A1').activate();
  songSheet.getActiveCell().getFilter().sort(num, true);
}
