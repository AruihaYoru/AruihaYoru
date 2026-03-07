const getRandomString = (length) => {
  const charset = "0123456789ABCDEF雅MIYABI夜";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

/**
 * テキストアニメーションのメインロジック
 */
const initTextAnimation = () => {
  // 対象となるクラスを持つ要素をすべて取得
  const targets = document.querySelectorAll('.random-text');

  const observerOptions = {
    root: null, // ビューポートを基準にする
    threshold: 0.1 // 10%が見えたら実行
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 画面内に入った場合：アニメーション開始
        startAnimation(entry.target);
      } else {
        // 画面外に出た場合：リセット（再抽選の準備）
        resetAnimation(entry.target);
      }
    });
  }, observerOptions);

  targets.forEach(target => {
    // 元のテキストをデータ属性に保存し、初期状態を隠す
    target.dataset.original = target.textContent.trim();
    observer.observe(target);
  });
};

const startAnimation = (el) => {
  const originalText = el.dataset.original;
  const len = originalText.length;
  let iteration = 0;
  // MIYABI EFFECT: Random duration for 'instability'
  const maxIterations = 15 + Math.floor(Math.random() * 20);

  if (el.dataset.running === "true") return;
  el.dataset.running = "true";

  const timer = setInterval(() => {
    // MIYABI EFFECT: Occasionally show the full keyword
    if (Math.random() > 0.92) {
      el.textContent = "MIYABI";
    } else if (Math.random() > 0.92) {
      el.textContent = "雅";
    } else {
      el.textContent = getRandomString(len);
    }

    iteration++;

    if (iteration >= maxIterations) {
      clearInterval(timer);
      el.textContent = originalText;
      el.dataset.running = "false";
      el.classList.add('is-finished');
    }
  }, 40 + Math.floor(Math.random() * 40)); // Variable speed
};

const resetAnimation = (el) => {
  el.dataset.running = "false";
  el.classList.remove('is-finished');
  // 再び画面に入った時に新しいランダムから始まるようクリア
  el.textContent = getRandomString(el.dataset.original.length);
};

// 実行
document.addEventListener('DOMContentLoaded', initTextAnimation);