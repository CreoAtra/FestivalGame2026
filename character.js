/*
  character.js
  担当: キャラクター操作

  キャラクターの左右移動とジャンプを担当します。

  player は、ここだけが書き換えます。
  fruits と gameState は読むだけにしてください。
*/

// 関数の外に変数を置くときは、名前の先頭に player を付けてください。
// 例: let playerSpeed = 5;


/* ============================================================
  実装にあたって知っておいてほしいこと
  ============================================================

  ■ 座標の見かた

  画面の左上の角が (0, 0) です。
  X座標は右に行くほど大きくなり、画面の右端が 400 です。
  Y座標は下に行くほど大きくなり、画面の一番下が 700 です。
  数学のグラフと違って、Yが増えると下に進むことに注意してください。

    (0, 0) ──────────────→ X  (400, 0)
      │
      │        画面
      │
      ↓
      Y
    (0, 700)              (400, 700)


  ■ player の中身

  main.js で次のように用意してあります。

    let player = {
      x: 175,              // 左上の角のX座標
      y: GROUND_Y - 60,    // 左上の角のY座標
      width:  50,
      height: 60,
      velocityY: 0         // ジャンプ用。上向きがマイナスです
    };

  x と y は「左上の角」です。中心ではありません。
  そのため、キャラクターが画面上で占める範囲はこうなります。

    左端 = player.x
    右端 = player.x + player.width
    上端 = player.y
    下端 = player.y + player.height   ← これが足元です

  地面の線は y = 640 です(main.js の GROUND_Y)。


  ■ 1フレームあたりで考えます

  draw() は1秒におよそ60回呼ばれます。updatePlayer() もその都度
  呼ばれるので、速度は「1回の呼び出しで何px動かすか」で考えます。

  移動速度の目安は 4〜5px です。この場合、画面の端から端(400px)まで
  およそ1.7秒で移動できます。
  遅すぎると取りに行けず、速すぎると狙った位置で止めにくくなるので、
  実際に動かしながら決めてもらえると助かります。


  ■ 移動速度は、関数の外に置いてください

  発展機能担当が「残り時間が少なくなったら移動速度を上げる」処理を
  入れる予定です。そのとき速度の値を書き換えられるようにしておきたいので、
  速度は updatePlayer() の中ではなく、関数の外に置いておいてください。

    let playerSpeed = 5;   // ファイルの先頭あたり

  名前は playerSpeed にしてもらえると、発展機能担当がそのまま使えます。
  変えたい場合は Discord で一声かけてください。


  ■ 呼ばれるタイミング

  main.js の draw() から、毎フレーム次の順番で呼ばれます。
  updatePlayer() が一番最初なので、ここで決めた位置をもとに
  そのあとの当たり判定が行われます。

    updatePlayer()     ← 位置を更新する
    updateFruits()
    checkCollisions()
    drawPlayer()       ← 描画する
    drawFruits()

  位置を変えるのは updatePlayer()、描くのは drawPlayer() と
  役割が分かれています。drawPlayer() の中で player.x や player.y を
  書き換えないようにしてください。

  ============================================================ */


/**
 * 毎フレーム呼ばれます。キャラクターの位置を更新してください。
 * - 押されているボタンに合わせて左右に動かす
 * - ジャンプしている最中に再びジャンプボタンが押されても反応しないようにする
 * - player.x が 0 〜 CANVAS_WIDTH - player.width の中に収まるようにする
 * - 足元(player.y + player.height)が GROUND_Y より下に行かないようにする
 */

/*
  character.js
  担当: キャラクター操作

  キャラクターの左右移動とジャンプを担当します。

  player は、ここだけが書き換えます。
  fruits と gameState は読むだけにしてください。
*/

// ============================================================
// キャラクターの設定
// ============================================================

// 移動速度（発展機能担当が変更可能）
let playerSpeed = 5;

// ジャンプの強さ
let playerJumpPower = 12;

// 重力
let playerGravity = 0.6;

// ボタンの入力状態
let playerIsPressingLeft = false;
let playerIsPressingRight = false;
let playerIsPressingJump = false;

// ジャンプボタンの前フレームの状態
let playerJumpWasPressed = false;



function updatePlayer() {

  // ゲーム終了State
  if (gameState.isFinished) {
    return;
  }


  // スマホのボタン操作とPCのキーボード操作
  const leftPressed =
    playerIsPressingLeft ||
    (typeof keyIsDown === "function" &&
      (keyIsDown(37) || keyIsDown(65)));

  const rightPressed =
    playerIsPressingRight ||
    (typeof keyIsDown === "function" &&
      (keyIsDown(39) || keyIsDown(68)));

  const jumpPressed =
    playerIsPressingJump ||
    (typeof keyIsDown === "function" &&
      (keyIsDown(32) || keyIsDown(38) || keyIsDown(87)));


  
  // 左右同時押しの場合は停止
  if (leftPressed && !rightPressed) {
    player.x -= playerSpeed;
  }

  if (rightPressed && !leftPressed) {
    player.x += playerSpeed;
  }


  //Map Boundaries:
  // Left Boundary
  if (player.x < 0) {
    player.x = 0;
  }

  // Right Boundary
  if (player.x + player.width > CANVAS_WIDTH) {
    player.x = CANVAS_WIDTH - player.width;
  }


 //地面の確認

  const playerOnGround =
    player.y + player.height >= GROUND_Y &&
    player.velocityY >= 0;



  //ジャンプ

  if (
    playerOnGround &&
    jumpPressed &&
    !playerJumpWasPressed
  ) {
    // 上向きの速度を設定
    player.velocityY = -playerJumpPower;
  }

  playerJumpWasPressed = jumpPressed;


  //重力
  player.velocityY += playerGravity;

  // Y座標を更新
  player.y += player.velocityY;


  // 7. 地面との判定

  // 足元と地面の判定
  if (player.y + player.height >= GROUND_Y) {

    // 地面の上に戻す
    player.y = GROUND_Y - player.height;

    // 落下速度をリセット
    player.velocityY = 0;
  }
}


//キャラ


/**
 * 毎フレーム呼ばれます。
 * キャラクターを描画してください。
 * 位置の計算は updatePlayer() で行います。
 */

console.log("drawPlayer called", player.x, player.y);
function drawPlayer() {
  // 画像を一度だけ読み込む
  if (!drawPlayer.playerImage) {

    drawPlayer.playerImage = new Image();

    drawPlayer.playerImage.onload = function() {
      console.log("player.png loaded successfully!");
    };

    drawPlayer.playerImage.onerror = function() {
      console.error("Failed to load player.png");
    };

    drawPlayer.playerImage.src = "assets/player.png";
  }

  const img = drawPlayer.playerImage;

  // 画像の読み込みが完了していれば描画
  if (img.complete && img.naturalWidth > 0) {

    drawingContext.drawImage(
      img,
      player.x,
      player.y,
      player.width,
      player.height
    );

  }
}
