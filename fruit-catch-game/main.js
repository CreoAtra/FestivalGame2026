/*
  main.js
  担当: ゲームロジック(結合役)

  ゲーム全体の進行と、各担当の関数の呼び出しを行います。
  共通変数(player / fruits / gameState)もここで定義しています。
*/

// ===== 定数 =====

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;
const GROUND_Y = 640;        // 地面の線のY座標。キャラクターの足元がここに乗ります
const TIME_LIMIT = 60;       // 制限時間(秒)
const TIME_MAX = 90;         // 時間の上限(秒)
const LIFE_INIT = 3;         // ライフの初期値

// ===== 共通変数 =====
// 他の担当からも読み込まれます。
// 書き換えるのは、それぞれの担当者だけにしてください。
//
// player も fruits も、x と y は「左上の角」を指します。中心ではありません。
//   左端 = x        右端 = x + width
//   上端 = y        下端 = y + height

// キャラクター(書き換えるのはキャラクター操作担当)
let player = {
  x: 175,               // 画面の中央に置いた状態(400 / 2 - 50 / 2)
  y: GROUND_Y - 60,     // 地面に立っている状態。下端が GROUND_Y に来ます
  width: 50,
  height: 60,
  velocityY: 0   // ジャンプ用。上向きがマイナスです
};

// 落下中のフルーツ(書き換えるのはフルーツ生成担当)
// 中身の例:
// { type: "apple", x: 100, y: 0, width: 40, height: 40, speed: 3 }
let fruits = [];

// ゲーム全体の状態(書き換えるのはゲームロジック担当)
let gameState = {
  score: 0,
  timeLeft: TIME_LIMIT,
  life: LIFE_INIT,
  isFinished: false
};


// ===== p5.js の入口 =====

function setup() {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent("canvas-wrapper");

  // TODO(アセット・演出担当): 画像の読み込み
  // TODO(タイトル・結果・ランキング担当): タイトル画面の表示
}

function draw() {
  background(135, 206, 235);   // 仮の空色。変えて構いません

  if (gameState.isFinished) {
    return;
  }

  // --- 更新 ---
  updatePlayer();      // character.js
  updateFruits();      // fruit.js
  updateExtra();       // extra.js

  const caught = checkCollisions();   // collision.js
  applyCaughtFruits(caught);

  updateTimer();

  // --- 描画 ---
  drawPlayer();        // character.js
  drawFruits();        // fruit.js

  updateUI();          // ui.js
}


// ===== ゲームロジック担当の処理 =====

/**
 * 当たり判定の結果を受け取って、スコア・時間・ライフに反映します。
 * @param {Array} caught キャッチしたフルーツの配列
 */
function applyCaughtFruits(caught) {
  // TODO: フルーツの種類ごとにスコア加算・時間延長・ライフ減少を行う
}

/**
 * 残り時間を減らし、0になったらゲームを終了します。
 */
function updateTimer() {
  // TODO: 残り時間の管理
}

/**
 * ゲームを終了します。
 *
 * 終わり方は「時間切れ」と「ライフが0になった」の2つですが、
 * どちらも失敗ではなく、そこまでのスコアで終了という扱いです。
 * スコアは無効になりませんし、ランキングにもそのまま登録されます。
 */
function endGame() {
  gameState.isFinished = true;
  // TODO(タイトル・結果・ランキング担当): 結果画面の表示
}

/**
 * ゲームを最初の状態に戻します。リトライ時に呼ばれます。
 */
function resetGame() {
  // TODO: 各変数を初期値に戻す
}
