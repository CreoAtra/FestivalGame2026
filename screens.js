/*
  screens.js
  担当: タイトル・結果・ランキング

  タイトル画面、結果画面、ローカルランキングと、画面の切り替えを担当します。
*/

// ランキングは localStorage に保存します。

/**
 * タイトル画面を表示します。
 */
function showTitle() {
  // TODO
}

/**
 * 結果画面を表示します。ゲームが終了しときに呼ばれます。
 */
function showResult() {
  // TODO
}

/**
 * スコアを localStorage に保存します。上位5件だけ残してください。
 * 終わり方(時間切れ / ライフ0)にかかわらず、どちらも保存します。
 * @param {number} score 今回のスコア
 */
function saveScore(score) {
  // TODO
}

/**
 * 保存されているスコアを取り出します。
 * @return {Array<number>} 高い順に並んだスコアの配列
 */
function loadScores() {
  // TODO
  return [];
}
