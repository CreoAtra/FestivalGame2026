/*
  fruit.js
  担当: フルーツ生成

  フルーツの出現・落下・削除を担当します。
  書き換え可能なのは fruits のみです(player や gameState は読むだけにしてください)。
*/


// フルーツの type は要件定義書 6.1 の通りに揃えてください。
//   "apple" / "banana" / "grape" / "bonus" / "damage" / "clock"

// x と y は「左上の角」です(詳しくは main.js のコメント)。


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
  // TODO
}

/**
 * 毎フレーム呼ばれます。fruits の中身を描画してください。
 */
function drawFruits() {
  // TODO
}
