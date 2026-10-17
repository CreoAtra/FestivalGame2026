/*
  ui.js
  担当: UI

  ゲーム中の表示(スコア・残り時間・ライフ)と、操作ボタンを担当します。
  gameState は読むだけにしてください。
  */

// 関数の外に変数を置くときは、名前の先頭に ui を付けてください。
// 例: let uiFontSize = 16;


let uiElements;
let uiPreviousState = {};
let uiPressedPointers = new Map();

$(function() {
  document.querySelectorAll("#controls .control-btn, #result-screen .result-button").forEach(function(button) {
    button.addEventListener("pointerdown", function(event) {
      if (event.button !== 0) return;

      uiPressedPointers.set(event.pointerId, button);
      button.classList.add("is-pressed");
    });
  });

  document.querySelectorAll("#result-screen .result-button").forEach(function(button) {
    button.addEventListener("click", function() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      button.animate([
        { transform: "translateY(3px) scale(.98)" },
        { transform: "translateY(-2px)", offset: .65 },
        { transform: "translateY(0)" }
      ], {
        duration: 220,
        easing: "ease-out"
      });
    });
  });

  // ボタンの外で指を離した場合も解除します。
  document.addEventListener("pointerup", uiReleaseControlFeedback, true);
  document.addEventListener("pointercancel", uiReleaseControlFeedback, true);
  window.addEventListener("blur", uiResetControlFeedback);
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) uiResetControlFeedback();
  });
});

function uiReleaseControlFeedback(event) {
  const button = uiPressedPointers.get(event.pointerId);
  uiPressedPointers.delete(event.pointerId);

  if (button && !Array.from(uiPressedPointers.values()).includes(button)) {
    button.classList.remove("is-pressed");
  }
}

function uiResetControlFeedback() {
  uiPressedPointers.forEach(function(button) {
    button.classList.remove("is-pressed");
  });
  uiPressedPointers.clear();
}


/**
 * 毎フレーム呼ばれます。
 * gameState の中身を画面に表示してください。
 * - gameState.score
 * - gameState.timeLeft
 * - gameState.life
 *
 */
function updateUI() {
  if (!uiElements) {
    uiElements = {
      score: $("#score"),
      timeLeft: $("#time-left"),
      life: $("#life"),
      lifeHearts: $("#life .life-icon"),
      timeStat: $("#time-stat")
    };
  }

  if (uiPreviousState.score !== gameState.score) {
    uiElements.score.text(gameState.score);
    uiPreviousState.score = gameState.score;
  }

  if (uiPreviousState.timeLeft !== gameState.timeLeft) {
    uiElements.timeLeft.text(gameState.timeLeft);
    uiElements.timeStat.toggleClass("is-urgent", gameState.timeLeft <= 10);
    uiPreviousState.timeLeft = gameState.timeLeft;
  }

  if (uiPreviousState.life !== gameState.life) {
    const uiLife = Math.max(0, Math.min(uiElements.lifeHearts.length, gameState.life));
    uiElements.lifeHearts.each(function(index) {
      $(this).toggleClass("is-empty", index >= uiLife);
    });
    uiElements.life.attr("aria-label", "残りライフ" + uiLife);
    uiPreviousState.life = gameState.life;
  }
}

// index.html に以下のボタンを用意してあります:
//   #btn-left / #btn-right / #btn-jump
