/* 動かして理解する（追加分）：計算・データ・仕組み
   ・手順型：「次へ」で1操作ずつ進める
   ・スライダー型：数字を動かして、結果がどう変わるかを見る */
(() => {
const e = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cell = (v, cls = "") => `<span class="motion-cell ${cls}">${v}</span>`;
const fmt = n => Number(n).toLocaleString("ja-JP", {maximumFractionDigits: 2});

/* ---------- 手順型の共通部品 ---------- */
function stepper(box, cfg){
  let v = cfg.select ? cfg.select.value : null, i = 0, states = cfg.build(v);
  function draw(){
    const st = states[i], last = states.length - 1;
    const sel = cfg.select ? `<label class="motion-target">${cfg.select.label}<select data-m2sel>${cfg.select.options.map(([val, lab]) => `<option value="${val}" ${String(val) === String(v) ? "selected" : ""}>${lab}</option>`).join("")}</select></label>` : "";
    box.innerHTML = `${sel}<div class="motion-diagram">${cfg.render(st, v)}</div><p class="motion-explain" role="status">手順 ${i} / ${last}：${st.text}</p>
      <div class="motion-controls"><button type="button" class="btn" data-m2="-1" ${i === 0 ? "disabled" : ""}>前へ</button><button type="button" class="btn primary" data-m2="1" ${i === last ? "disabled" : ""}>次へ</button><button type="button" class="btn" data-m2reset>最初から</button></div>${cfg.note ? `<p class="small muted">${cfg.note}</p>` : ""}`;
    box.querySelectorAll("[data-m2]").forEach(b => b.onclick = () => { i = Math.max(0, Math.min(last, i + Number(b.dataset.m2))); draw(); box.querySelector(i === last ? '[data-m2="-1"]' : '[data-m2="1"]').focus({preventScroll:true}); });
    box.querySelector("[data-m2reset]").onclick = () => { i = 0; draw(); box.querySelector('[data-m2="1"]').focus({preventScroll:true}); };
    const s = box.querySelector("[data-m2sel]");
    if(s) s.onchange = () => { v = s.value; i = 0; states = cfg.build(v); draw(); box.querySelector("[data-m2sel]").focus({preventScroll:true}); };
  }
  draw();
}

/* ---------- スライダー型の共通部品 ---------- */
function slider(box, cfg){
  const vals = Object.fromEntries(cfg.sliders.map(s => [s.key, s.value]));
  box.innerHTML = `<div class="m2-sliders">${cfg.sliders.map(s => `<label class="m2-slider"><span>${s.label}<b data-m2out="${s.key}"></b></span><input type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${s.value}" data-m2key="${s.key}"></label>`).join("")}</div><div class="motion-diagram" data-m2body></div>${cfg.note ? `<p class="small muted">${cfg.note}</p>` : ""}`;
  const body = box.querySelector("[data-m2body]");
  const draw = () => {
    cfg.sliders.forEach(s => box.querySelector(`[data-m2out="${s.key}"]`).textContent = "：" + (s.show ? s.show(vals[s.key]) : vals[s.key]));
    body.innerHTML = cfg.render(vals);
  };
  box.querySelectorAll("[data-m2key]").forEach(inp => inp.oninput = () => { vals[inp.dataset.m2key] = Number(inp.value); draw(); });
  draw();
}

/* ========== 1. 2進数・16進数・2の補数（ビットを押して切り替え） ========== */
function wireBits(box){
  let bits = [0,0,0,0,1,0,1,1];
  const draw = () => {
    const u = bits.reduce((a, b) => a * 2 + b, 0), s = u >= 128 ? u - 256 : u;
    const hex = u.toString(16).toUpperCase().padStart(2, "0");
    const weights = [128,64,32,16,8,4,2,1];
    box.innerHTML = `<p>ビットを押すと0と1が切り替わります。1のビットの「重み」を足すと10進数になります。</p>
    <div class="motion-diagram"><div class="motion-bits">${bits.map((b, k) => `<button type="button" class="motion-cell ${b ? "active" : ""}" data-bit="${k}" aria-pressed="${!!b}" aria-label="${weights[k]}の位、いま${b}">${b}</button>`).join("")}</div>
    <div class="motion-bits m2-w">${weights.map(w => `<span>${w}</span>`).join("")}</div>
    <p><b>10進数：</b>${bits.map((b, k) => b ? weights[k] : null).filter(Boolean).join(" ＋ ") || "0"} ＝ <b>${u}</b></p>
    <p><b>16進数：</b>${bits.slice(0,4).join("")} ｜ ${bits.slice(4).join("")} → <b>${hex}</b>　<span class="small muted">4ビットずつ区切って読む</span></p>
    <p><b>2の補数として読むと：</b><b>${s}</b>　<span class="small muted">${u >= 128 ? "先頭が1なので負の数（" + u + " − 256）" : "先頭が0なので正の数（そのまま）"}</span></p></div>
    <div class="motion-controls"><button type="button" class="btn" data-bop="neg">−1倍にする（反転して＋1）</button><button type="button" class="btn" data-bop="shl">左へ1ビットシフト（×2）</button><button type="button" class="btn" data-bop="clr">0に戻す</button></div>`;
    box.querySelectorAll("[data-bit]").forEach(b => b.onclick = () => { const k = +b.dataset.bit; bits[k] ^= 1; draw(); box.querySelector(`[data-bit="${k}"]`).focus({preventScroll:true}); });
    box.querySelectorAll("[data-bop]").forEach(b => b.onclick = () => {
      const op = b.dataset.bop;
      let n = bits.reduce((a, x) => a * 2 + x, 0);
      if(op === "neg") n = ((~n) + 1) & 255;
      if(op === "shl") n = (n << 1) & 255;
      if(op === "clr") n = 0;
      bits = [...n.toString(2).padStart(8, "0")].map(Number);
      draw(); box.querySelector(`[data-bop="${op}"]`).focus({preventScroll:true});
    });
  };
  draw();
}

/* ========== 2. ページ置換え（FIFO・LRU） ========== */
function pageSteps(alg){
  const refs = [1,2,3,1,4,1,2,5], frames = [], st = [{frames:[], ref:null, fault:null, faults:0, refs, k:-1, text:"ページ枠は3つ。参照列 1,2,3,1,4,1,2,5 の順に使います。枠にないページを使うと「ページフォールト」です。"}];
  let faults = 0; const used = {}, loaded = {};
  refs.forEach((p, k) => {
    let text, out = null;
    if(frames.includes(p)){ text = `ページ${p}は枠にある → ヒット。`; }
    else {
      faults++;
      if(frames.length < 3){ frames.push(p); text = `ページ${p}は枠にない → フォールト。空き枠に読み込みます。`; }
      else {
        const victim = alg === "fifo" ? frames.reduce((a, b) => loaded[a] < loaded[b] ? a : b) : frames.reduce((a, b) => used[a] < used[b] ? a : b);
        out = victim; frames[frames.indexOf(victim)] = p;
        text = `ページ${p}は枠にない → フォールト。${alg === "fifo" ? "いちばん先に読み込んだ" : "いちばん長く使われていない"}ページ${victim}を追い出します。`;
      }
      loaded[p] = k;
    }
    used[p] = k;
    st.push({frames:[...frames], ref:p, out, fault:!text.includes("ヒット"), faults, refs, k, text});
  });
  st.push({...st[st.length - 1], text:`終了。ページフォールトは合計${faults}回。${alg === "fifo" ? "LRUに切り替えて回数を比べてみましょう。" : "FIFOに切り替えて回数を比べてみましょう。"}`});
  return st;
}

/* ========== 3. 逆ポーランド記法（スタックで計算） ========== */
function rpnSteps(v){
  const ex = {a:["2","3","+","4","×"], b:["8","2","−","3","2","+","×"]}[v];
  const infix = {a:"(2 ＋ 3) × 4", b:"(8 − 2) × (3 ＋ 2)"}[v];
  const stack = [], st = [{stack:[], k:-1, ex, text:`式 ${infix} を逆ポーランド記法にすると「${ex.join(" ")}」。左から読み、数はスタックに積み、演算子が来たら上の2つを取り出して計算します。`}];
  ex.forEach((t, k) => {
    if(/^\d+$/.test(t)){ stack.push(+t); st.push({stack:[...stack], k, ex, text:`${t} は数なので、スタックに積みます。`}); }
    else {
      const b = stack.pop(), a = stack.pop();
      const r = t === "+" ? a + b : t === "−" ? a - b : a * b;
      stack.push(r);
      st.push({stack:[...stack], k, ex, text:`${t} は演算子。上から2つ（${b} と ${a}）を取り出し、${a} ${t} ${b} ＝ ${r} を積みます。順番は「下のほう ${t} 上のほう」。`});
    }
  });
  st.push({stack:[...stack], k:ex.length, ex, text:`最後にスタックに残った ${stack[0]} が答えです。括弧がなくても計算の順番が決まるのが逆ポーランド記法の特徴です。`});
  return st;
}

/* ========== 4. 木の走査（先行・中間・後行） ========== */
const TREE = {A:["B","C"], B:["D","E"], C:["F","G"], D:[], E:[], F:[], G:[]};
const TPOS = {A:[170,24], B:[90,78], C:[250,78], D:[50,132], E:[130,132], F:[210,132], G:[290,132]};
function treeOrder(kind){
  const out = [];
  const walk = n => { if(!n) return; const [l, r] = TREE[n];
    if(kind === "pre") out.push(n); walk(l); if(kind === "in") out.push(n); walk(r); if(kind === "post") out.push(n); };
  walk("A"); return out;
}
function treeSteps(kind){
  const ord = treeOrder(kind), rule = {pre:"根 → 左 → 右（自分を先に出す）", in:"左 → 根 → 右（自分を真ん中で出す）", post:"左 → 右 → 根（自分を最後に出す）"}[kind];
  const st = [{done:[], cur:null, text:`ルールは「${rule}」。各節で同じルールをくり返します。`}];
  ord.forEach((n, k) => st.push({done:ord.slice(0, k + 1), cur:n, text:`${n} を出力。ここまで：${ord.slice(0, k + 1).join(" → ")}`}));
  st.push({done:ord, cur:null, text:`完成：${ord.join(" → ")}。${kind === "in" ? "2分探索木を中間順で読むと小さい順に並びます。" : ""}`});
  return st;
}
function treeSVG(state){
  const lines = Object.entries(TREE).flatMap(([p, cs]) => cs.map(c => `<line x1="${TPOS[p][0]}" y1="${TPOS[p][1]}" x2="${TPOS[c][0]}" y2="${TPOS[c][1]}" style="stroke:var(--line);stroke-width:2"/>`)).join("");
  const nodes = Object.keys(TREE).map(n => { const [x, y] = TPOS[n], idx = state.done.indexOf(n), cur = n === state.cur;
    return `<circle cx="${x}" cy="${y}" r="17" style="fill:${cur ? "var(--accent)" : idx >= 0 ? "var(--accent-soft)" : "var(--card)"};stroke:var(--accent);stroke-width:${cur ? 3 : 2}"/><text x="${x}" y="${y + 5}" text-anchor="middle" style="font-weight:700;font-size:15px;fill:${cur ? "#fff" : "var(--ink)"}">${n}</text>${idx >= 0 ? `<text x="${x + 19}" y="${y - 12}" style="font-size:11px;fill:var(--muted)">${idx + 1}</text>` : ""}`; }).join("");
  return `<svg viewBox="0 0 340 156" role="img" aria-label="2分木。出力済み ${state.done.join("、") || "なし"}">${lines}${nodes}</svg>`;
}

/* ========== 5. 正規化 ========== */
const tbl = (cap, head, rows, keys = [], hl = []) => `<div class="m2-tbl"><b>${cap}</b><table><tr>${head.map((h, j) => `<th class="${keys.includes(j) ? "pk" : ""} ${hl.includes(j) ? "hl" : ""}">${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map((c, j) => `<td class="${hl.includes(j) ? "hl" : ""}">${c}</td>`).join("")}</tr>`).join("")}</table></div>`;
function normSteps(){
  return [
    {html: tbl("受注（非正規形）", ["受注番号","顧客名","商品"], [["1","山田","ペン×2、ノート×1"],["2","佐藤","ペン×5"]], [0], [2]), text:"1つの欄に「ペン×2、ノート×1」と複数の値が入っています。これでは「ペンを注文した件数」なども数えにくい状態です。"},
    {html: tbl("受注明細（第1正規形）", ["受注番号","商品番号","顧客名","商品名","数量"], [["1","P1","山田","ペン","2"],["1","N1","山田","ノート","1"],["2","P1","佐藤","ペン","5"]], [0,1], []), text:"第1正規形：1つの欄に1つの値だけ。繰り返しを行に分けました。主キーは「受注番号＋商品番号」。でも顧客名が何度も出てきます。"},
    {html: tbl("受注明細（第1正規形）", ["受注番号","商品番号","顧客名","商品名","数量"], [["1","P1","山田","ペン","2"],["1","N1","山田","ノート","1"],["2","P1","佐藤","ペン","5"]], [0,1], [2,3]), text:"顧客名は受注番号だけで決まり、商品名は商品番号だけで決まります。主キーの「一部」だけで決まる列（部分関数従属）があると、同じ情報が重複します。"},
    {html: tbl("受注", ["受注番号","顧客番号","顧客名"], [["1","C1","山田"],["2","C2","佐藤"]], [0], []) + tbl("商品", ["商品番号","商品名"], [["P1","ペン"],["N1","ノート"]], [0], []) + tbl("受注明細", ["受注番号","商品番号","数量"], [["1","P1","2"],["1","N1","1"],["2","P1","5"]], [0,1], []), text:"第2正規形：主キーの一部だけで決まる列を別の表に分けました。数量は「受注番号＋商品番号」の両方で決まるので明細に残します。"},
    {html: tbl("受注", ["受注番号","顧客番号","顧客名"], [["1","C1","山田"],["2","C2","佐藤"]], [0], [1,2]), text:"受注表では、顧客名は顧客番号で決まります。主キーでない列が、別の主キーでない列で決まる関係（推移関数従属）が残っています。"},
    {html: tbl("受注", ["受注番号","顧客番号"], [["1","C1"],["2","C2"]], [0], []) + tbl("顧客", ["顧客番号","顧客名"], [["C1","山田"],["C2","佐藤"]], [0], []), text:"第3正規形：顧客名を顧客表に分けました。山田さんの名前を直すときは、顧客表の1か所だけ直せばよくなります。"}
  ];
}

/* ========== 6. RAIDの構成と故障 ========== */
function wireRaid(box){
  let lvl = "5", failed = [];
  const draw = () => {
    const n = lvl === "1" ? 2 : 4;
    failed = failed.filter(k => k < n);
    const ok = lvl === "0" ? failed.length === 0 : failed.length <= 1;
    const cap = lvl === "0" ? n : lvl === "1" ? 1 : n - 1;
    const disks = Array.from({length:n}, (_, k) => {
      const blocks = lvl === "0" ? [`A${k + 1}`, `B${k + 1}`] : lvl === "1" ? ["A", "B"] : [0, 1].map(r => { const p = (3 - r) % 4; return k === p ? `P${r + 1}` : `${"AB"[r]}${k < p ? k + 1 : k}`; });
      return `<button type="button" class="m2-disk ${failed.includes(k) ? "bad" : ""}" data-disk="${k}" aria-pressed="${failed.includes(k)}"><small>ディスク${k + 1}</small>${blocks.map(b => `<span class="${b[0] === "P" ? "par" : ""}">${b}</span>`).join("")}<small>${failed.includes(k) ? "故障" : "正常"}</small></button>`;
    }).join("");
    const desc = {"0":"ストライピング：データを分けて並べ、速く読み書きする。冗長性はない。","1":"ミラーリング：同じデータを2台に書く。容量は半分。","5":"分散パリティ：データとパリティ（P）を全ディスクに分散。1台壊れてもパリティから復元できる。"}[lvl];
    box.innerHTML = `<label class="motion-target">構成<select data-raid><option value="0" ${lvl === "0" ? "selected" : ""}>RAID0</option><option value="1" ${lvl === "1" ? "selected" : ""}>RAID1</option><option value="5" ${lvl === "5" ? "selected" : ""}>RAID5</option></select></label>
      <p>${desc}ディスクを押すと「故障」を試せます。</p>
      <div class="motion-diagram"><div class="m2-disks">${disks}</div>
      <p role="status"><b>データ：${ok ? "読める" : "失われる"}</b>　${!ok ? (lvl === "0" ? "1台でも壊れると全体が読めません。" : "2台以上壊れると復元できません。") : failed.length ? (lvl === "5" ? "残りのデータとパリティから、壊れた分を計算で復元できます。" : "もう1台にコピーがあるので読めます。") : ""}</p>
      <p><b>使える容量：</b>1台100Gバイト × ${n}台 → <b>${cap * 100}Gバイト</b>（${lvl === "0" ? "全部" : lvl === "1" ? "半分" : "1台分をパリティに使う"}）</p></div>`;
    box.querySelector("[data-raid]").onchange = ev => { lvl = ev.target.value; failed = []; draw(); box.querySelector("[data-raid]").focus({preventScroll:true}); };
    box.querySelectorAll("[data-disk]").forEach(b => b.onclick = () => { const k = +b.dataset.disk; failed = failed.includes(k) ? failed.filter(x => x !== k) : [...failed, k]; draw(); box.querySelector(`[data-disk="${k}"]`).focus({preventScroll:true}); });
  };
  draw();
}

/* ========== 7. カプセル化（データにヘッダが付いていく） ========== */
function capSteps(){
  const L = [
    {name:"アプリケーション層", add:"データ", cls:"d", text:"Webブラウザが「ページをください」というHTTPのデータを作ります。"},
    {name:"トランスポート層", add:"TCPヘッダ", cls:"t", text:"TCPヘッダを付けます。ポート番号（例：443）で、相手のどのアプリに渡すかを示します。"},
    {name:"ネットワーク層", add:"IPヘッダ", cls:"i", text:"IPヘッダを付けます。IPアドレスで、どのコンピュータに届けるかを示します。"},
    {name:"データリンク層", add:"Ethernetヘッダ", cls:"e", text:"Ethernetヘッダを付けます。MACアドレスで、同じLANの次の機器を示します。末尾には誤り検出用のFCSが付きます。"},
    {name:"受信側", add:"", cls:"", text:"受信側は逆に、下の層から順にヘッダを外して、最後にアプリがデータを受け取ります。"}
  ];
  return L.map((l, k) => ({k, L, text:l.text}));
}
function capRender(st){
  const parts = [];
  const k = Math.min(st.k, 3);
  if(k >= 3) parts.push('<span class="m2-pk e">Ethernet<br>ヘッダ</span>');
  if(k >= 2) parts.push('<span class="m2-pk i">IP<br>ヘッダ</span>');
  if(k >= 1) parts.push('<span class="m2-pk t">TCP<br>ヘッダ</span>');
  parts.push('<span class="m2-pk d">データ<br>（HTTP）</span>');
  if(k >= 3) parts.push('<span class="m2-pk e">FCS</span>');
  return `<p><b>いまの層：</b>${st.L[st.k].name}</p><div class="m2-packet">${parts.join("")}</div><p class="small">このヘッダで分かること：${["送るデータそのもの","ポート番号（どのアプリへ）","IPアドレス（どのコンピュータへ）","MACアドレス（LANの次の機器へ）","ヘッダを外して中身を取り出す"][st.k]}</p>`;
}

/* ========== 8. 損益分岐点 ========== */
function bepRender(v){
  const sales = v.sales, fixed = v.fixed, rate = v.rate / 100, varc = sales * rate, profit = sales - varc - fixed, bep = fixed / (1 - rate);
  const max = Math.max(sales, bep, varc + fixed) * 1.05;
  const w = x => Math.max(0, Math.min(100, x / max * 100));
  return `<div class="m2-bars"><div><span>売上高</span><em class="trk"><i style="width:${w(sales)}%;background:var(--accent)"></i></em><b>${fmt(sales)}</b></div>
    <div><span>費用</span><em class="trk"><i style="width:${w(fixed)}%;background:var(--muted)"></i><i style="width:${w(varc)}%;background:var(--calc)"></i></em><b>${fmt(fixed + varc)}</b></div></div>
    <p class="small muted">灰色：固定費（売上に関係なくかかる） ／ 橙：変動費（売上に比例）</p>
    <p><b>利益：</b>${fmt(sales)} − ${fmt(varc)} − ${fmt(fixed)} ＝ <b style="color:${profit >= 0 ? "var(--good)" : "var(--bad)"}">${fmt(profit)}</b>（${profit >= 0 ? "黒字" : "赤字"}）</p>
    <p><b>損益分岐点売上高：</b>固定費 ÷（1 − 変動費率）＝ ${fmt(fixed)} ÷ ${fmt(1 - rate)} ＝ <b>${fmt(bep)}</b></p>
    <p class="small">売上が ${fmt(bep)} を超えると黒字になります。固定費を下げるか、変動費率を下げると損益分岐点も下がります。</p>`;
}

/* ========== 9. 待ち行列（利用率と待ち時間） ========== */
function queueRender(v){
  const rho = v.rho / 100, ts = v.ts, wq = rho / (1 - rho) * ts;
  const pts = Array.from({length:19}, (_, k) => { const r = (k + 1) * 0.05; return [r, Math.min(r / (1 - r), 19)]; });
  const X = r => 20 + r * 300, Y = y => 130 - y / 19 * 115;
  const path = pts.map(([r, y], k) => (k ? "L" : "M") + X(r).toFixed(1) + " " + Y(y).toFixed(1)).join(" ");
  const cy = Math.min(rho / (1 - rho), 19);
  return `<svg viewBox="0 0 340 150" role="img" aria-label="利用率が上がると待ち時間が急に増えるグラフ"><line x1="20" y1="130" x2="330" y2="130" style="stroke:var(--line)"/><line x1="20" y1="10" x2="20" y2="130" style="stroke:var(--line)"/><path d="${path}" style="fill:none;stroke:var(--accent);stroke-width:2.5"/><circle cx="${X(rho)}" cy="${Y(cy)}" r="6" style="fill:var(--calc)"/><text x="325" y="146" text-anchor="end" style="font-size:11px;fill:var(--muted)">利用率 →</text><text x="24" y="18" style="font-size:11px;fill:var(--muted)">待ち時間</text><text x="${X(.5)}" y="146" text-anchor="middle" style="font-size:10px;fill:var(--muted)">50%</text></svg>
    <p><b>平均待ち時間 ＝ ρ ÷ (1 − ρ) × 平均サービス時間</b></p>
    <p>${fmt(rho)} ÷ ${fmt(1 - rho)} × ${ts}秒 ＝ <b>${fmt(wq)}秒</b>　→ 窓口に着いてから終わるまでは ${fmt(wq + ts)}秒</p>
    <p class="small">${rho >= .8 ? "利用率が80%を超えると、待ち時間は一気に長くなります。" : "利用率が低いうちは、待ち時間はあまり増えません。"}</p>`;
}

/* ========== 10. 伝送時間 ========== */
function transRender(v){
  const bits = v.size * 8, eff = v.eff / 100, speed = v.speed * eff, t = bits / speed;
  return `<div class="m2-flow"><span>${v.size}Mバイト</span><b>× 8</b><span>${fmt(bits)}Mビット</span><b>÷ (${v.speed}Mbps × ${fmt(eff)})</b><span>${fmt(t)}秒</span></div>
    <p><b>伝送時間 ＝ データ量（ビット） ÷（回線速度 × 伝送効率）</b></p>
    <p>${fmt(bits)} ÷ ${fmt(speed)} ＝ <b>${fmt(t)}秒</b></p>
    <p class="small">落とし穴は2つ。データ量は「バイト」、回線速度は「ビット毎秒（bps）」なので×8が必要。伝送効率が80%なら、実際に使える速度は0.8倍です。</p>`;
}

/* ========== 11. 実効アクセス時間 ========== */
function eatRender(v){
  const h = v.hit / 100, t = h * v.c + (1 - h) * v.m;
  const w = x => x / v.m * 100;
  return `<div class="m2-bars"><div><span>キャッシュ</span><em class="trk"><i style="width:${w(v.c)}%;background:var(--good)"></i></em><b>${v.c}ns</b></div><div><span>主記憶</span><em class="trk"><i style="width:100%;background:var(--muted)"></i></em><b>${v.m}ns</b></div><div><span>実効</span><em class="trk"><i style="width:${w(t)}%;background:var(--accent)"></i></em><b>${fmt(t)}ns</b></div></div>
    <p><b>実効アクセス時間 ＝ ヒット率 × キャッシュ ＋（1 − ヒット率）× 主記憶</b></p>
    <p>${fmt(h)} × ${v.c} ＋ ${fmt(1 - h)} × ${v.m} ＝ <b>${fmt(t)}ns</b></p>
    <p class="small">ヒット率が高いほど、キャッシュの速さに近づきます。</p>`;
}

/* ---------- 振り分け ---------- */
function wire(box){
  const t = box.dataset.motion2;
  if(window.M2EXT && window.M2EXT[t]) return window.M2EXT[t](box);
  if(t === "bits") return wireBits(box);
  if(t === "raid") return wireRaid(box);
  if(t === "page") return stepper(box, {select:{label:"置換え方式", value:"fifo", options:[["fifo","FIFO（先に入れたものを出す）"],["lru","LRU（最も長く使っていないものを出す）"]]}, build:pageSteps,
    render:st => `<p><b>参照列：</b></p><div class="motion-cells">${st.refs.map((r, k) => cell(r, k === st.k ? "active" : k < st.k ? "excluded" : "")).join("")}</div><p><b>ページ枠（3つ）：</b>${st.ref === null ? "" : st.fault ? `<span class="m2-tag bad">フォールト</span>` : `<span class="m2-tag good">ヒット</span>`}${st.out ? ` 追い出し：${st.out}` : ""}</p><div class="motion-cells">${[0,1,2].map(k => cell(st.frames[k] ?? "空", st.frames[k] === st.ref && st.ref !== null ? (st.fault ? "active" : "found") : "")).join("")}</div><p>ページフォールト：<b>${st.faults}回</b></p>`,
    note:"FIFOとLRUで、追い出すページが変わる場面（4を読み込むとき）に注目してください。"});
  if(t === "rpn") return stepper(box, {select:{label:"式", value:"a", options:[["a","(2＋3)×4"],["b","(8−2)×(3＋2)"]]}, build:rpnSteps,
    render:st => `<p><b>読む順番：</b></p><div class="motion-cells">${st.ex.map((x, k) => cell(x, k === st.k ? "active" : k < st.k ? "excluded" : "")).join("")}</div><p><b>スタック（右が上）：</b></p><div class="motion-cells">${st.stack.length ? st.stack.map((x, k) => cell(x, k === st.stack.length - 1 ? "found" : "")).join("") : '<span class="small muted">空</span>'}</div>`});
  if(t === "tree") return stepper(box, {select:{label:"なぞり方", value:"pre", options:[["pre","先行順（行きがけ）"],["in","中間順（通りがけ）"],["post","後行順（帰りがけ）"]]}, build:treeSteps,
    render:st => `${treeSVG(st)}<p><b>出力：</b>${st.done.join(" → ") || "まだなし"}</p>`, note:"数字は出力した順番です。"});
  if(t === "norm") return stepper(box, {build:normSteps, render:st => `<div class="m2-tbls">${st.html}</div><p class="small muted">太字の見出し＝主キー、色付きの列＝いま注目する列</p>`});
  if(t === "cap") return stepper(box, {build:capSteps, render:capRender});
  if(t === "bep") return slider(box, {sliders:[{key:"sales",label:"売上高（万円）",min:100,max:1000,step:10,value:500},{key:"fixed",label:"固定費（万円）",min:0,max:500,step:10,value:200},{key:"rate",label:"変動費率",min:10,max:90,step:5,value:60,show:x => x + "%"}], render:bepRender});
  if(t === "queue") return slider(box, {sliders:[{key:"rho",label:"利用率ρ",min:5,max:95,step:5,value:50,show:x => x + "%"},{key:"ts",label:"平均サービス時間（秒）",min:1,max:10,step:1,value:4}], render:queueRender, note:"M/M/1（窓口1つ、到着もサービス時間もランダム）の待ち行列モデルです。"});
  if(t === "trans") return slider(box, {sliders:[{key:"size",label:"データ量（Mバイト）",min:1,max:100,step:1,value:10},{key:"speed",label:"回線速度（Mbps）",min:10,max:1000,step:10,value:100},{key:"eff",label:"伝送効率",min:50,max:100,step:5,value:80,show:x => x + "%"}], render:transRender});
  if(t === "eat") return slider(box, {sliders:[{key:"hit",label:"ヒット率",min:50,max:100,step:1,value:90,show:x => x + "%"},{key:"c",label:"キャッシュのアクセス時間（ns）",min:1,max:20,step:1,value:10},{key:"m",label:"主記憶のアクセス時間（ns）",min:30,max:200,step:10,value:100}], render:eatRender});
}

window.M2 = {stepper, slider, cell, fmt, esc:e};
window.motion2HTML = () => {
  const d = (sum, key) => `<details class="usage"><summary>${sum}</summary><div class="usage-body" data-motion2="${key}"></div></details>`;
  return {
    calc: `<p>数字を動かすと、答えがその場で変わります。公式の「どこが効いているか」を体で覚えましょう。</p>${d("損益分岐点：固定費と変動費率を動かす","bep")}${d("伝送時間：バイトとビット、伝送効率","trans")}${d("実効アクセス時間：ヒット率を動かす","eat")}${d("待ち行列：利用率が上がると待ち時間は？","queue")}`,
    data: `<p>ボタンや「次へ」で1つずつ確かめます。</p>${d("2進数・16進数・2の補数：ビットを押して切り替える","bits")}${d("逆ポーランド記法：スタックで計算する","rpn")}${d("木の走査：先行・中間・後行の順番","tree")}${d("ページ置換え：FIFOとLRUで追い出すページの違い","page")}`,
    sys: `<p>表やディスクの変化を、手順を追って確かめます。</p>${d("正規化：第1・第2・第3正規形へ分けていく","norm")}${d("RAID0・1・5：ディスクが壊れたらどうなる？","raid")}${d("カプセル化：送るデータにヘッダが付いていく","cap")}`
  };
};
window.wireMotions2 = root => root.querySelectorAll("[data-motion2]").forEach(box => {
  const det = box.closest("details");
  const go = () => { if(!box.dataset.wired){ box.dataset.wired = 1; wire(box); } };
  if(det && !det.open) det.addEventListener("toggle", go, {once:true}); else go();
});
})();

/* 用語ずかんのカードから、対応する「動く図」へ飛べるようにする */
(() => {
  const MAP = window.MOTION_MAP = {"正規化":"norm","RAID":"raid","逆ポーランド記法":"rpn","木構造":"tree","ページ置換えアルゴリズム":"page","損益分岐点":"bep","待ち行列":"queue",
    "伝送時間の計算":"trans","キャッシュメモリと実効アクセス時間":"eat","補数":"bits","2進数と基数変換":"bits","OSI参照モデルと中継機器":"cap","スタックとキュー":"containers",
    "探索アルゴリズム":"binary","ソートの種類":"sort","排他制御とデッドロック":"lock","稼働率":"availability","バックアップの種類":"backup","共通鍵暗号と公開鍵暗号":"crypto",
    "デジタル署名":"crypto","論理演算":"logic","サブネットマスクとホスト数":"subnet","クリティカルパス":"path","ARP":"network","DNS":"network"};
  window.openMotion = key => {
    go("#guide");
    let n = 0;
    const tryOpen = () => {
      const box = document.querySelector(`#app [data-motion2="${key}"], #app [data-motion="${key}"]`);
      if(!box){ if(n++ < 20) setTimeout(tryOpen, 60); return; }
      const det = box.closest("details"); if(det) det.open = true;
      (det ? det.querySelector("summary") : box).scrollIntoView({block:"start"});
    };
    setTimeout(tryOpen, 60);
  };
  const add = card => {
    if(card.querySelector(".motion-link")) return;
    const key = MAP[card.querySelector("h3")?.textContent.trim()];
    const anchor = card.querySelector(".memo-btn");
    if(!key || !anchor) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "motion-link"; b.textContent = "▶ 動く図で確かめる";
    b.onclick = () => openMotion(key);
    anchor.before(b);
  };
  const app = document.getElementById("app");
  if(app) new MutationObserver(() => app.querySelectorAll("article.term").forEach(add)).observe(app, {childList:true, subtree:true});
})();
