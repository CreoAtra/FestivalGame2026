/*
  fruit.js
  担当: フルーツ生成

  フルーツの出現・落下・削除を担当します。
  書き換え可能なのは fruits のみです(player や gameState は読むだけにしてください)。
*/


// フルーツの type は要件定義書 6.1 の通りに揃えてください。
//   "apple" / "banana" / "grape" / "bonus" / "damage" / "clock"

// x と y は「左上の角」です(詳しくは main.js のコメント)。

let fruitSpawnInterval = 500; //! 出現頻度をミリ秒で指定(仮置き)
let fruitLastSpawnTime = 0; // 最後に生成した時間

//フルーツの種類を格納
const fruitsTypes = [
  "apple",
  "banana",
  "grape",
  "bonus",
  "damage",
  "clock"
];

/**
 * 毎フレーム呼ばれます。
 * - 一定の間隔で新しいフルーツを fruits に追加する
 * - fruits の中身を下に移動させる(y に speed を足す)
 * - 画面の下まで落ちたフルーツを fruits から取り除く
 *
 * キャッチされたフルーツを取り除くのは当たり判定担当です。
 * ここで消すのは「取り逃して画面外まで落ちたもの」だけで大丈夫です。
 *
 * fruits に入れるオブジェクトの形:
 *   { type: "apple", x: 100, y: 0, width: 40, height: 40, speed: 3 }
 */
function updateFruits() {
  // Todo
  let now = millis();  // 開始からの経過時間

  if (now - fruitLastSpawnTime > fruitSpawnInterval) {
    let rate = Math.random();
    let fruitsNumber = -1;

    //! フルーツの出現率(仮置き)
    if (rate < 0.25) {  // apple:25%
      fruitsNumber = 0;
    }
    else if (rate < 0.50) {  // banana:25%
      fruitsNumber = 1;
    }
    else if (rate < 0.75) {  // grape:25%
      fruitsNumber = 2;
    }
    else if (rate < 0.8) {  // bonus:5%
      fruitsNumber = 3;
    }
    else if (rate < 0.95) {  // damage:15%
      fruitsNumber = 4;
    }
    else {   // clock:5%
      fruitsNumber = 5;
    }

    //フルーツを生成
    fruits.push({
      type: fruitsTypes[fruitsNumber],
      x: random(0, CANVAS_WIDTH - 40),
      y: 0,
      width: 40,
      height: 40,
      speed: 3
    })

    fruitLastSpawnTime = millis();
  }

  for (let i = fruits.length - 1; i >= 0; i--) {
    let fruit = fruits[i];

    fruit.y += fruit.speed;   //フルーツを落とす

    if (fruit.y > CANVAS_HEIGHT) {   // 画面外のフルーツを削除
      fruits.splice(i, 1);
    }
  }
}

/**
 * 毎フレーム呼ばれます。fruits の中身を描画してください。
 */
function drawFruits() {
  //Todo
  for (let fruit of fruits) {
    let img = assetImages[fruit.type];

    if (img) {   // 画像を読み込めたとき
      image(
        assetImages[fruit.type],
        fruit.x,
        fruit.y,
        fruit.width,
        fruit.height
      );
    } else {    // 読み込めなかったとき(仮の四角形を描画)
      rect(
        fruit.x,
        fruit.y,
        fruit.width,
        fruit.height
      );
    }
  }
}

function resetFruits() {
  fruits.length = 0;
  fruitLastSpawnTime = millis();
}