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
const SCORE_NORMAL = 10;     // 通常フルーツの得点
const SCORE_BONUS = 50;      // 高得点フルーツの得点
const SEC_ADD = 3;           // 時計を取ったときに足される秒数
const FPS = 60;              // 1秒あたりのフレーム数


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
  isFinished: true
};

let gameFrameCount = 0;     // 今の1秒の中で、何フレーム経ったか


// ===== p5.js の入口 =====

function setup() {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent("canvas-wrapper");
  frameRate(FPS);

  showTitle();   // screens.js
}

function draw() {
  // --- 更新:ゲーム中だけ ---
  if (!gameState.isFinished) {
    updatePlayer();                          // character.js
    updateFruits();                          // fruit.js
    updateExtra();                           // extra.js
    applyCaughtFruits(checkCollisions());    // collision.js
    updateTimer();
  }

  // --- 描画:いつでも ---
  background(135, 206, 235);                 // p5.js(仮の空色)
  drawPlayer();                              // character.js
  drawFruits();                              // fruit.js
  drawEffects();                             // assets.js
  updateUI();                                // ui.js
}


// ===== ゲームロジック担当の処理 =====

/**
 * 当たり判定の結果を受け取って、スコア・時間・ライフに反映します。
 * @param {Array} caught キャッチしたフルーツの配列
 */
function applyCaughtFruits(caught) {
  for (const fruit of caught) {
    if(gameState.isFinished) return;
  
    switch(fruit.type){
    case "apple" :
    case "banana" :
    case "grape" :
      gameState.score += SCORE_NORMAL;
      playEffect("catch");
      break;

    case "bonus":
      gameState.score += SCORE_BONUS;
      playEffect("catch");
      break;
    
    case "clock":
      gameState.timeLeft = Math.min(gameState.timeLeft + SEC_ADD, TIME_MAX);
      playEffect("catch");
      break;
    
    case "damage":
      decreaseLife();
      playEffect("damage");
      break;
    
    default:
      console.warn("Unknown fruit type:", fruit.type);
    }
  }
}


/**
 * 残り時間を減らし、0になったらゲームを終了します。
 */
function updateTimer() {
  gameFrameCount++;

  if(gameFrameCount >= FPS){
    gameState.timeLeft--;
    gameFrameCount = 0;
  }

  if (gameState.timeLeft <= 0){
    gameState.timeLeft = 0;
    endGame();
  }
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
  showResult();
}

/**
 * ゲームを最初の状態に戻します。スタート時とリトライ時に呼ばれます。
 */
function resetGame() {
  // main.js が持っている値
  gameState.score = 0;
  gameState.timeLeft = TIME_LIMIT;
  gameState.life = LIFE_INIT;
  gameFrameCount = 0;

  // 他の担当の値
  resetPlayer();     // character.js
  resetFruits();     // fruit.js
  resetExtra();      // extra.js
  resetEffects();    // assets.js

  gameState.isFinished = false;
}
