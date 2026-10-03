/*
  extra.js
  担当: 発展機能

  残り時間が少なくなったときの速度上昇と、ライフ制を担当します。
  なるべく他の担当のファイルは書き換えず、必要があればDiscordの方に連絡して下さい。
*/

const ACCELERATE_START = Object.freeze({
  startTime: 0,
  startFactor: 1.0,
});

const ACCELERATE = Object.freeze([
  { time: 60_000, factor: 1.3333 },
  { time: 70_000, factor: 1.5 },
  { time: 80_000, factor: 1.75 },
]);

const ACCELERATE_END = Object.freeze({
  endTime: 90_000,
  endFactor: 2.0,
});

function getAccurateTimer() {
  const startTime = performance.now();
  let currentTime = startTime;
  return () => {
    currentTime = performance.now();
    return currentTime - startTime;
  };
}

function vectorAmplify(factor) {
  return (vec) => vec.map((v) => v * factor);
}

function acclerateMiddleware(
  { startTime, startFactor },
  controlPoints,
  { endTime, endFactor },
) {
  // do something
  return function* (timer) {
    // calculate the factor based on current time
    while (timer() < endTime) {
      const currentTime = timer();
      const factor = NaN;
      yield vectorAmplify(factor);
    }
  };
}

// 速度上昇の発動タイミングは、残り10秒からを仮の値としています。
// 違和感などあれば自由に調整してください。

/**
 * 毎フレーム呼ばれます。
 * - 残り時間が一定以下になったら、プレイヤーの移動速度を上げる
 * - 落下速度も上げるかどうかは、決めてもらって構いません
 */
const updateExtra = (() => {
  const timer = getAccurateTimer();
  const amplifiers = acclerateMiddleware(
    ACCELERATE_START,
    ACCELERATE,
    ACCELERATE_END,
  )(timer);
  return () => {
    const currentTime = timer();
    const factor = amplifiers.next(currentTime).value;
    return factor;
  };
})();

/**
 * ライフを1減らします。ダメージフルーツをキャッチしたときに呼ばれます。
 * ライフが0になったら endGame() を呼んでゲームを終了してください。
 *
 * ライフが0になった際は時間切れと同じように、そこまでのスコアで終了という扱いです。
 */
const decreaseLife = (() => {
  let life = LIFE_INIT;
  return () => {
    life--;
    if (life < 0) life = 0;
    if (life === 0) endGame();
  };
})();
