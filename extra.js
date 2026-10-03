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

/**
 * 時刻に応じた速度倍率を、区分3次エルミート補間 (PCHIP) で滑らかに変化させます。
 * - 各節点の接線は Fritsch–Butland の重み付き調和平均で決めるため、倍率曲線は C^1 級で、
 *   制御点の間で値が行き過ぎる (オーバーシュートする) こともありません。
 * - 始点・終点の接線は 0 にしているので、範囲外の一定区間とも C^1 でつながります。
 */
function accelerateMiddleware(
  { startTime, startFactor },
  controlPoints,
  { endTime, endFactor },
) {
  const times = [startTime, ...controlPoints.map((p) => p.time), endTime];
  const factors = [
    startFactor,
    ...controlPoints.map((p) => p.factor),
    endFactor,
  ];
  const n = times.length;
  for (let i = 1; i < n; i++) {
    if (!(times[i] > times[i - 1])) {
      throw new RangeError(
        "accelerateMiddleware: times must be strictly increasing",
      );
    }
  }

  // 各区間の傾き
  const secants = [];
  for (let i = 0; i < n - 1; i++) {
    secants.push((factors[i + 1] - factors[i]) / (times[i + 1] - times[i]));
  }

  // 各節点での接線 (端点は 0)
  const tangents = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const d0 = secants[i - 1];
    const d1 = secants[i];
    if (d0 * d1 <= 0) continue; // 極値・平坦部では接線 0
    const h0 = times[i] - times[i - 1];
    const h1 = times[i + 1] - times[i];
    const w0 = 2 * h1 + h0;
    const w1 = h1 + 2 * h0;
    tangents[i] = (w0 + w1) / (w0 / d0 + w1 / d1);
  }

  const factorAt = (t) => {
    if (t <= times[0]) return factors[0];
    if (t >= times[n - 1]) return factors[n - 1];
    let i = 0;
    while (t >= times[i + 1]) i++;
    const h = times[i + 1] - times[i];
    const s = (t - times[i]) / h;
    const s2 = s * s;
    const s3 = s2 * s;
    return (
      (2 * s3 - 3 * s2 + 1) * factors[i] +
      (s3 - 2 * s2 + s) * h * tangents[i] +
      (-2 * s3 + 3 * s2) * factors[i + 1] +
      (s3 - s2) * h * tangents[i + 1]
    );
  };

  return function* (timer) {
    let currentTime;
    while (true) {
      currentTime = timer();
      if (currentTime >= endTime) break;
      yield vectorAmplify(factorAt(currentTime));
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
  const amplifiers = accelerateMiddleware(
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
