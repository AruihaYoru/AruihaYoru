/**
 * 指定された文字セットからランダムな文字列を生成する関数
 * @param {number} length - 生成する文字列の長さ
 * @returns {string}
 */
const getRandomString = (length) => {
  const charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
  const maxIterations = 20; // 止まるまでの「揺らぎ」の回数

  // すでに動いている場合は重複させない
  if (el.dataset.running === "true") return;
  el.dataset.running = "true";

  const timer = setInterval(() => {
    // ランダムな文字列を表示
    el.textContent = getRandomString(len);
    iteration++;

    // 一定回数繰り返したら元の文字列に戻して停止
    if (iteration >= maxIterations) {
      clearInterval(timer);
      el.textContent = originalText;
      el.dataset.running = "false";
      el.classList.add('is-finished'); // 終了後のスタイル用
    }
  }, 50); // 50ms間隔で更新
};

const resetAnimation = (el) => {
  el.dataset.running = "false";
  el.classList.remove('is-finished');
  // 再び画面に入った時に新しいランダムから始まるようクリア
  el.textContent = getRandomString(el.dataset.original.length);
};

// 実行
document.addEventListener('DOMContentLoaded', initTextAnimation);