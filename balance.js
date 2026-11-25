/* 正解の位置がかたよらないように、選択肢の並びを整える。
   毎回ランダムにすると記録とずれるので、問題ごとに決まった位置へ正解を置く。
   数値が並ぶ選択肢は、小さい順などの並びを崩さないようにそのままにする。 */
(() => {
  const numeric = opts => opts.every(o => /^[\d０-９.,，\-−＋+]/.test(String(o).trim()));
  const hash = s => { let h = 0; for(const ch of String(s)) h = (h * 31 + ch.codePointAt(0)) >>> 0; return h; };
  const place = (q, key) => {
    if(!q || !Array.isArray(q.opts) || q.a == null || numeric(q.opts)) return;
    const n = q.opts.length, to = hash(key) % n;
    if(to === q.a) return;
    const o = q.opts.slice();
    [o[q.a], o[to]] = [o[to], o[q.a]];
    q.opts = o; q.a = to;
  };
  if(typeof QBANK !== "undefined") QBANK.forEach((q, i) => place(q, q.id || "b" + i));
  if(typeof CARDS !== "undefined") CARDS.forEach((c, i) => place(c.quiz, "c" + i + (c.title || "")));
})();
