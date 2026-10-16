/*
  screens.js
  担当: タイトル・結果・ランキング

  タイトル画面、結果画面、ローカルランキングと、画面の切り替えを担当します。
*/

// ランキングは localStorage に保存します。
const SCREEN_STORAGE_KEY = "fruitCatchScores";
const SCREEN_RANKING_MAX = 5;   // ランキングに残す件数


/**
 * 画面を1つだけ表示します。
 * @param {string|null} id 表示する画面のID。null を渡すと全部隠します(ゲーム画面)
 */
function screenShow(id) {
  $(".screen").removeClass("is-active");
  if (id) $(id).addClass("is-active");
}

/**
 * タイトル画面を表示します。
 */
function showTitle() {
  $("#screen-title-best").text(loadScores()[0] || 0);
  screenShow("#screen-title");
}

/**
 * 結果画面を表示します。ゲームが終了しときに呼ばれます。
 */
function showResult() {
  const score = gameState.score;
  const isBest = score > (loadScores()[0] || 0);   // 保存する前に比べます
  saveScore(score);

  $("#screen-result-score").text(score);
  $("#screen-result-best").toggleClass("is-hidden", !isBest);
  $("#screen-result-ranking").html(
    loadScores().map((s) => `<li>${s}</li>`).join("")
  );
  screenShow("#screen-result");
}

/**
 * スコアを localStorage に保存します。上位5件だけ残してください。
 * 終わり方(時間切れ / ライフ0)にかかわらず、どちらも保存します。
 * @param {number} score 今回のスコア
 */
function saveScore(score) {
  const scores = loadScores();
  scores.push(score);
  scores.sort((a, b) => b - a);
  localStorage.setItem(
    SCREEN_STORAGE_KEY,
    JSON.stringify(scores.slice(0, SCREEN_RANKING_MAX))
  );
}

/**
 * 保存されているスコアを取り出します。
 * @return {Array<number>} 高い順に並んだスコアの配列
 */
function loadScores() {
  return JSON.parse(localStorage.getItem(SCREEN_STORAGE_KEY) || "[]");
}


// ===== ボタンの操作 =====

$(function () {
  // スタートとリトライは、どちらもゲームを最初から始めます
  $("#screen-btn-start, #screen-btn-retry").on("click", function () {
    screenShow(null);
    resetGame();   // main.js
  });

  $("#screen-btn-title").on("click", showTitle);
});
