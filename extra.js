/*
  extra.js
  担当: 発展機能

  残り時間が少なくなったときの速度上昇と、ライフ制を担当します。
  なるべく他の担当のファイルは書き換えず、必要があればDiscordの方に連絡して下さい。
*/

// 速度上昇の発動タイミングは、残り10秒からを仮の値としています。
// 違和感などあれば自由に調整してください。
const EXTRA_BOOST_DURATION = 10_000; // 残り何ミリ秒から加速を始めるか

// 加速開始からの経過時間 (ミリ秒) と速度倍率の対応です。
// 制御点は加速区間に対する割合で置いているので、EXTRA_BOOST_DURATION を変えても曲線の形は変わりません。
const EXTRA_ACCELERATE_START = Object.freeze({
  startTime: 0,
  startFactor: 1.0,
});

const EXTRA_ACCELERATE = Object.freeze([
  { time: EXTRA_BOOST_DURATION * (6 / 9), factor: 1.3333 },
  { time: EXTRA_BOOST_DURATION * (7 / 9), factor: 1.5 },
  { time: EXTRA_BOOST_DURATION * (8 / 9), factor: 1.75 },
]);

const EXTRA_ACCELERATE_END = Object.freeze({
  endTime: EXTRA_BOOST_DURATION,
  endFactor: 2.0,
});

// 加速前の移動速度。character.js は extra.js より先に読み込まれるので、ここで読めます。
const extraBaseSpeed = playerSpeed;

/**
 * 加速開始からの経過時間 (ミリ秒) を、ゲームの残り時間から求めます。
 * 時計フルーツで残り時間が増えると値も戻るので、速度も元に戻ります。
 */
function extraBoostTimer() {
  const remaining = (gameState.timeLeft - gameFrameCount / FPS) * 1000;
  return EXTRA_BOOST_DURATION - remaining;
}

/**
 * 時刻に応じた速度倍率を、区分3次エルミート補間 (PCHIP) で滑らかに変化させます。
 * - 各節点の接線は Fritsch–Butland の重み付き調和平均で決めるため、倍率曲線は C^1 級で、
 *   制御点の間で値が行き過ぎる (オーバーシュートする) こともありません。
 * - 始点・終点の接線は 0 にしているので、範囲外の一定区間とも C^1 でつながります。
 */
function extraAccelerateMiddleware(
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
        "extraAccelerateMiddleware: times must be strictly increasing",
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
    while (true) {
      yield factorAt(timer());
    }
  };
}

const extraUpdateFnBuilder = () => {
  const factors = extraAccelerateMiddleware(
    EXTRA_ACCELERATE_START,
    EXTRA_ACCELERATE,
    EXTRA_ACCELERATE_END,
  )(extraBoostTimer);
  return () => {
    playerSpeed = extraBaseSpeed * factors.next().value;
  };
};

/**
 * 毎フレーム呼ばれます。
 * - 残り時間が一定以下になったら、プレイヤーの移動速度を上げる
 * - 落下速度も上げるかどうかは、決めてもらって構いません
 */
let updateExtra = extraUpdateFnBuilder();

const extraDecreaseLifeFnBuilder = () => {
  return () => {
    gameState.life--;
    if (gameState.life < 0) gameState.life = 0;
    if (gameState.life === 0) endGame();
  };
};

/**
 * ライフを1減らします。ダメージフルーツをキャッチしたときに呼ばれます。
 * ライフが0になったら endGame() を呼んでゲームを終了してください。
 *
 * ライフが0になった際は時間切れと同じように、そこまでのスコアで終了という扱いです。
 */
let decreaseLife = extraDecreaseLifeFnBuilder();

const resetExtra = () => {
  updateExtra = extraUpdateFnBuilder();
  decreaseLife = extraDecreaseLifeFnBuilder();
  playerSpeed = extraBaseSpeed;
};
