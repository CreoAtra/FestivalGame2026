/*
  assets.js
  担当: アセット・演出

  画像の読み込みと、キャッチ時などの演出を担当します。
*/

// 関数の外に変数を置くときは、名前の先頭に asset か effect を付けてください。
// 例: let assetImages = {};

// 画像ファイルは assets/ フォルダに置きます(要件定義書 6.1 を参照)。
//   assets/player.png / apple.png / banana.png / grape.png
//   assets/bonus.png / damage.png / clock.png
let assetImages = {};
// SEファイルも assets/ フォルダに置きました
//  assets/catch.mp3 / damage.mp3 / gameover.mp3 / bonus.mp3 / clock.mp3
let assetSounds = {};

/**
 * 画像の読み込みを行います。
 * p5.js が setup() より前に自動で呼び出します。
 */
function preload() {
  const names = ["player", "apple", "banana", "grape", "bonus", "damage", "clock"];
  for (const name of names) {
    assetImages[name] = loadImage(
      "assets/" + name + ".png",
      () => {},   // 読み込めたとき（何もしない）
      () => {     // 読み込めなかったとき
        console.warn("画像を読み込めませんでした: assets/" + name + ".png");
        assetImages[name] = null;
      }
    );
  }
  // SEの読み込み
  const soundnames = ["catch", "damage", "gameover", "bonus", "clock"];
  for (const name of soundnames) {
    assetSounds[name] = loadSound(
      "assets/" + name + ".mp3",
      () => {},
      () => {
        console.warn("SEを読み込めませんでした: assets/" + name + ".mp3");
        assetSounds[name] = null;
      }
    );
  }
}

// 演出制御用
let effectActiveList = [];
let effectPlayerColor = null;

// ゲームオーバー用
let effectGameOverActive = false;


// SE再生用
function assetPlaySound(name) {
  if (assetSounds[name] && typeof assetSounds[name].play === "function") {
    try {
      // もし再生中であれば一度止めてから鳴らす
      if (assetSounds[name].isPlaying()) {
        assetSounds[name].stop();
      }
      assetSounds[name].setVolume(0.1);
      assetSounds[name].play();
    } catch (e) {
      console.warn("SE再生エラー:", e);
    }
  }
}

/**
 * 演出を再生します。ゲームロジック担当から呼ばれます。
 * @param {string} type 演出の種類。catch / bonus / clock / damage / gameover / gameover_damage
 */
function playEffect(type) {

  // エフェクトの位置 定義されていなかった場合はX=200 Y=600とする。
  const px = (typeof player !== "undefined" && player) ? player.x + player.width / 2 : 200;
  const py = (typeof player !== "undefined" && player) ? player.y + player.height / 2 : 600;

  // ポップアップ 定義されていなかった場合は通常＝10 ボーナス＝50 秒追加＝3とする。
  const scoreNorm = (typeof SCORE_NORMAL !== "undefined") ? SCORE_NORMAL : 10;
  const scoreBonus = (typeof SCORE_BONUS !== "undefined") ? SCORE_BONUS : 50;
  const secAdd = (typeof SEC_ADD !== "undefined") ? SEC_ADD : 3;

  // エフェクトのデザイン
  // 1. 通常フルーツ取得時
  if (type === "catch") {
    assetPlaySound("catch");
    effectPlayerColor = { r: 255, g: 255, b: 255, alpha: 255, timer: 12 };
    addParticles(px, py, [255, 255, 255], 8);
    addPopText("+" + scoreNorm, px, py - 10, [255, 255, 255]);
  }
  // 2. ボーナスフルーツ（黄色）
  else if (type === "bonus") {
    assetPlaySound("bonus");
    effectPlayerColor = { r: 255, g: 215, b: 0, alpha: 240, timer: 14 };
    addParticles(px, py, [255, 215, 0], 15);
    addPopText("+" + scoreBonus + "!", px, py - 15, [255, 215, 0]);
  }
 // 3. 時計（水色）
  else if (type === "clock") {
    assetPlaySound("clock");
    effectPlayerColor = { r: 100, g: 220, b: 255, alpha: 240, timer: 14 };
    addParticles(px, py, [100, 220, 255], 15);
    addPopText("+" + secAdd + " SEC!", px, py - 15, [0, 80, 255]);
  }
  // 4. ダメージフルーツ（赤）
  else if (type === "damage") {
    assetPlaySound("damage");
    effectPlayerColor = { r: 255, g: 40, b: 40, alpha: 240, timer: 10 };
    addPopText("DAMAGE!", px, py - 10, [255, 50, 50]);
  }
  // 5. ゲームオーバー演出
  else if (type === "gameover" || type === "gameover_damage") {
    effectGameOverActive = true;
    assetPlaySound("gameover");
  }
}
//パーティクルデザイン
function addParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    let angle = random(TWO_PI);
    let speed = random(2, 6);
    effectActiveList.push({
      kind: "particle",
      x: x,
      y: y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed - 1,
      color: color,
      size: random(4, 8),
      life: 15
    });
  }
}
// ポップアップテキストデザイン
function addPopText(txt, x, y, color) {
  effectActiveList.push({
    kind: "text",
    text: txt,
    x: x,
    y: y,
    vy: -1.5,
    color: color,
    life: 25
  });
}

// 毎フレーム描画処理
function drawEffects() {

  // player.pngのシルエットへマスキングする。
  if (effectPlayerColor && effectPlayerColor.timer > 0 && typeof player !== "undefined" && player && assetImages.player) {
    push();
    tint(effectPlayerColor.r, effectPlayerColor.g, effectPlayerColor.b, effectPlayerColor.alpha);
    image(assetImages.player, player.x, player.y, player.width, player.height);
    pop();
    effectPlayerColor.timer--;
    if (effectPlayerColor.timer <= 0) {
      effectPlayerColor = null;
    }
  }

  // パーティクルおよびテキストポップアップ
  for (let i = effectActiveList.length - 1; i >= 0; i--) {
    let item = effectActiveList[i];

    if (item.kind === "particle") {
      push();
      noStroke();
      fill(item.color[0], item.color[1], item.color[2], map(item.life, 0, 15, 0, 255));
      ellipse(item.x, item.y, item.size);
      pop();

      item.x += item.vx;
      item.y += item.vy;
      item.life--;
    } else if (item.kind === "text") {
      push();
      textAlign(CENTER);
      textSize(18);
      textStyle(BOLD);
      fill(item.color[0], item.color[1], item.color[2], map(item.life, 0, 25, 0, 255));
      text(item.text, item.x, item.y);
      pop();

      item.y += item.vy;
      item.life--;
    }

    if (item.life <= 0) {
      effectActiveList.splice(i, 1);
    }
  }
}
/**
 * スタート・リトライのときに呼ばれます。再生中の演出を全部消します。
 */
function resetEffects() {
  effectActiveList = [];
  effectPlayerColor = null;
  effectGameOverActive = false;
}
