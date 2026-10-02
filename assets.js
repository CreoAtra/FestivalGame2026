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


/**
 * 画像の読み込みを行います。
 * p5.js が setup() より前に自動で呼び出します。
 */
function preload() {
  // TODO: loadImage() で画像を読み込む
}

/**
 * 演出を再生します。ゲームロジック担当から呼ばれます。
 * @param {string} type 演出の種類("catch" / "damage" など)
 */
function playEffect(type) {
  // TODO
}
