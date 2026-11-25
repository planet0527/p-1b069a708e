/* 動かして理解する（第3弾）：マネジメント・ネットワーク・アルゴリズム・SQL */
(() => {
if(!window.M2) return;
const {stepper, slider, cell, fmt} = M2;
const X = window.M2EXT = window.M2EXT || {};

/* ---------- EVM ---------- */
X.evm = box => slider(box, {sliders:[
  {key:"pv", label:"PV 計画価値（今日までに予定していた作業の予算）", min:10, max:100, step:5, value:60, show:x => x + "万円"},
  {key:"ev", label:"EV 出来高（実際に終わった作業の予算）", min:10, max:100, step:5, value:50, show:x => x + "万円"},
  {key:"ac", label:"AC 実コスト（実際に使ったお金）", min:10, max:100, step:5, value:55, show:x => x + "万円"}],
  render:v => {
    const sv = v.ev - v.pv, cv = v.ev - v.ac, spi = v.ev / v.pv, cpi = v.ev / v.ac;
    const judge = (x, good, bad) => `<b style="color:${x >= 0 ? "var(--good)" : "var(--bad)"}">${x >= 0 ? good : bad}</b>`;
    const max = Math.max(v.pv, v.ev, v.ac);
    const bar = (lab, x, col) => `<div><span>${lab}</span><em class="trk"><i style="width:${x / max * 100}%;background:${col}"></i></em><b>${x}</b></div>`;
    return `<div class="m2-bars">${bar("PV 予定", v.pv, "var(--muted)")}${bar("EV 出来高", v.ev, "var(--accent)")}${bar("AC 実コスト", v.ac, "var(--calc)")}</div>
    <p><b>進み具合：</b>SV ＝ EV − PV ＝ ${sv}　SPI ＝ EV ÷ PV ＝ ${fmt(v.ev / v.pv)}　→ ${judge(sv, "予定どおりか早い", "遅れている")}</p>
    <p><b>お金：</b>CV ＝ EV − AC ＝ ${cv}　CPI ＝ EV ÷ AC ＝ ${fmt(cpi)}　→ ${judge(cv, "予算内", "予算オーバー")}</p>
    <p class="small">覚え方：どちらも「EVから引く」。マイナス（指数なら1未満）は悪い状態。${spi < 1 && cpi < 1 ? "いまは遅れていて、しかも予算オーバーです。" : ""}</p>`;
  }});

/* ---------- MTBF・MTTRと稼働率 ---------- */
X.mtbf = box => slider(box, {sliders:[
  {key:"f", label:"MTBF 平均故障間隔（動いている平均時間）", min:10, max:500, step:10, value:190, show:x => x + "時間"},
  {key:"r", label:"MTTR 平均修理時間", min:1, max:50, step:1, value:10, show:x => x + "時間"}],
  render:v => {
    const a = v.f / (v.f + v.r), tot = v.f + v.r;
    return `<div class="m2-bars"><div><span>1サイクル</span><em class="trk"><i style="width:${v.f / tot * 100}%;background:var(--good)"></i><i style="width:${v.r / tot * 100}%;background:var(--bad)"></i></em><b>${tot}h</b></div></div>
    <p class="small muted">緑：動いている時間（MTBF） ／ 赤：修理中（MTTR）</p>
    <p><b>稼働率 ＝ MTBF ÷（MTBF ＋ MTTR）</b></p><p>${v.f} ÷ (${v.f} ＋ ${v.r}) ＝ <b>${fmt(a)}</b>（${fmt(a * 100)}%）</p>
    <p class="small">稼働率を上げるには、故障しにくくする（MTBFを長く）か、早く直す（MTTRを短く）。</p>`;
  }});

/* ---------- 減価償却 ---------- */
X.dep = box => {
  const rate = {4:.5, 5:.4, 6:.333};
  stepper(box, {select:{label:"方法", value:"line", options:[["line","定額法（毎年同じ額）"],["rate","定率法（残りに一定の率）"]]},
    build:v => {
      const cost = 100, life = 5, st = [{y:0, rows:[], left:cost, text:`100万円のパソコンを買い、耐用年数5年で費用にしていきます。${v === "line" ? "定額法は毎年同じ額。" : "定率法は、残っている価値に毎年同じ率（ここでは40%）を掛けます。"}`}];
      let left = cost; const rows = [];
      for(let y = 1; y <= life; y++){
        const d = v === "line" ? cost / life : (y === life ? left : Math.round(left * rate[5] * 10) / 10);
        left = Math.round((left - d) * 10) / 10; rows.push([y, d, left]);
        st.push({y, rows:[...rows], left, text:`${y}年目の償却費は${fmt(d)}万円。${v === "line" ? "100 ÷ 5 ＝ 20万円で毎年同じ。" : `残り${fmt(left + d)}万円 × 40% ＝ ${fmt(d)}万円。最初に多く、だんだん少なくなります。`}${y === life && v === "rate" ? "（最終年は残りを全部費用にする簡略化）" : ""}`});
      }
      return st;
    },
    render:st => `<div class="m2-bars">${[1,2,3,4,5].map(y => { const r = st.rows.find(r => r[0] === y); return `<div><span>${y}年目</span><em class="trk">${r ? `<i style="width:${r[1]}%;background:var(--calc)"></i>` : ""}</em><b>${r ? fmt(r[1]) + "万" : "—"}</b></div>`; }).join("")}</div><p><b>帳簿上の残りの価値：</b>${fmt(st.left)}万円</p>`});
};

/* ---------- パイプライン ---------- */
X.pipe = box => slider(box, {sliders:[
  {key:"n", label:"命令の数", min:1, max:8, step:1, value:4},
  {key:"k", label:"パイプラインの段数", min:2, max:5, step:1, value:4}],
  render:v => {
    const cyc = v.k + v.n - 1, seq = v.k * v.n, names = ["F","D","E","M","W"];
    const rows = Array.from({length:v.n}, (_, i) => `<tr><th>命令${i + 1}</th>${Array.from({length:cyc}, (_, c) => { const s = c - i; return `<td class="${s >= 0 && s < v.k ? "on s" + s : ""}">${s >= 0 && s < v.k ? names[s] : ""}</td>`; }).join("")}</tr>`).join("");
    return `<div class="m2-pipe"><table><tr><th></th>${Array.from({length:cyc}, (_, c) => `<th>${c + 1}</th>`).join("")}</tr>${rows}</table></div>
    <p class="small muted">F：取り出し D：解読 E：実行 M：メモリ W：書き戻し（段数に合わせて先頭から使用）</p>
    <p><b>パイプラインあり：</b>段数 ＋（命令数 − 1）＝ ${v.k} ＋ ${v.n - 1} ＝ <b>${cyc}サイクル</b></p>
    <p><b>パイプラインなし：</b>段数 × 命令数 ＝ ${v.k} × ${v.n} ＝ ${seq}サイクル</p>
    <p class="small">1つの命令が速くなるのではなく、前の命令が終わる前に次の命令を始めるので、全体が速くなります。</p>`;
  }});

/* ---------- 探索回数の比較 ---------- */
X.search = box => slider(box, {sliders:[{key:"p", label:"データの件数", min:1, max:20, step:1, value:10, show:p => (2 ** p).toLocaleString() + "件"}],
  render:v => {
    const n = 2 ** v.p, lin = n / 2, bin = v.p;
    const lg = x => Math.log2(x + 1) / Math.log2(2 ** 20) * 100;
    return `<div class="m2-bars"><div><span>線形探索</span><em class="trk"><i style="width:${lg(lin)}%;background:var(--calc)"></i></em><b>約${lin.toLocaleString()}回</b></div><div><span>二分探索</span><em class="trk"><i style="width:${lg(bin)}%;background:var(--accent)"></i></em><b>約${bin}回</b></div></div>
    <p class="small muted">棒の長さは対数の目盛りです。</p>
    <p><b>線形探索：</b>先頭から順に調べる。平均 n ÷ 2 ＝ ${lin.toLocaleString()}回（オーダ O(n)）</p>
    <p><b>二分探索：</b>半分ずつ絞る。最大 log₂n ≒ ${bin}回（オーダ O(log n)）。ただし先に整列が必要。</p>
    <p class="small">件数が2倍になっても、二分探索は1回増えるだけです。</p>`;
  }});

/* ---------- 半加算器 ---------- */
X.adder = box => {
  let a = 1, b = 1;
  const draw = () => {
    const s = a ^ b, c = a & b;
    box.innerHTML = `<p>入力AとBを押して切り替えます。</p><div class="motion-diagram">
      <div class="motion-cells"><button type="button" class="motion-cell ${a ? "active" : ""} m2-in" data-in="a">A＝${a}</button><button type="button" class="motion-cell ${b ? "active" : ""} m2-in" data-in="b">B＝${b}</button></div>
      <svg viewBox="0 0 320 120" role="img" aria-label="AとBがXORとANDの両方に入る回路"><g style="stroke:var(--muted);stroke-width:2;fill:none"><path d="M24 40 H70 M70 40 V30 H120 M70 40 V74 H120 M24 90 H92 M92 90 V48 H120 M92 90 V92 H120 M220 40 H286 M220 82 H286"/><circle cx="70" cy="40" r="3" style="fill:var(--muted)"/><circle cx="92" cy="90" r="3" style="fill:var(--muted)"/></g><rect x="120" y="22" width="100" height="36" rx="8" style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:2"/><text x="170" y="45" text-anchor="middle" style="font-weight:700;fill:var(--ink)">XOR</text>
      <rect x="120" y="64" width="100" height="36" rx="8" style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:2"/><text x="170" y="87" text-anchor="middle" style="font-weight:700;fill:var(--ink)">AND</text>
      <text x="8" y="45" style="fill:var(--ink);font-weight:700">A</text><text x="8" y="95" style="fill:var(--ink);font-weight:700">B</text>
      <circle cx="300" cy="40" r="14" style="fill:${s ? "var(--good)" : "var(--card)"};stroke:var(--good);stroke-width:2"/><text x="300" y="45" text-anchor="middle" style="fill:${s ? "#fff" : "var(--ink)"};font-weight:700">${s}</text>
      <circle cx="300" cy="82" r="14" style="fill:${c ? "var(--calc)" : "var(--card)"};stroke:var(--calc);stroke-width:2"/><text x="300" y="87" text-anchor="middle" style="fill:${c ? "#fff" : "var(--ink)"};font-weight:700">${c}</text></svg>
      <p><b>和 S（XOR）＝ ${s}</b>　<b>桁上がり C（AND）＝ ${c}</b></p>
      <p>${a} ＋ ${b} ＝ 2進数で <b>${c}${s}</b>（10進数の${a + b}）</p></div>
      <p class="small">XORは「違うときだけ1」、ANDは「両方1のときだけ1」。1＋1のとき和は0、桁上がりが1になります。</p>`;
    box.querySelectorAll("[data-in]").forEach(btn => btn.onclick = () => { if(btn.dataset.in === "a") a ^= 1; else b ^= 1; draw(); box.querySelector(`[data-in="${btn.dataset.in}"]`).focus({preventScroll:true}); });
  };
  draw();
};

/* ---------- パリティチェック ---------- */
X.parity = box => {
  const orig = [1,0,1,1,0,0,1]; let data = [...orig], made = false;
  const draw = () => {
    const p = orig.reduce((a, b) => a + b, 0) % 2; // 偶数パリティ
    const ones = data.reduce((a, b) => a + b, 0) + p, ok = ones % 2 === 0;
    box.innerHTML = `<p>偶数パリティ：1の個数が偶数になるようにパリティビットを付けます。データのビットを押すと「通信中に1ビット化けた」状態を試せます。</p>
    <div class="motion-diagram"><p><b>送信側：</b>データの1は${orig.filter(Boolean).length}個 → パリティビットは <b>${p}</b></p>
    <div class="motion-bits">${data.map((d, k) => `<button type="button" class="motion-cell ${d !== orig[k] ? "active" : ""}" data-pb="${k}">${d}</button>`).join("")}<span class="motion-cell found">${p}</span></div>
    <p class="small muted">左7つ：データ ／ 右端：パリティビット</p>
    <p role="status"><b>受信側：</b>1の個数は${ones}個 → ${ok ? `<b style="color:var(--good)">偶数なので誤りなしと判断</b>` : `<b style="color:var(--bad)">奇数なので誤りを検出</b>`}</p>
    <p class="small">${data.filter((d, k) => d !== orig[k]).length >= 2 ? "2ビット化けると偶数に戻ってしまい、誤りを見逃します。パリティは1ビットの誤り検出しかできず、どこが誤りかも分かりません（訂正はハミング符号など）。" : "1ビットの誤りは検出できます。2ビット変えるとどうなるか試してみましょう。"}</p></div>
    <div class="motion-controls"><button type="button" class="btn" data-preset>元に戻す</button></div>`;
    box.querySelectorAll("[data-pb]").forEach(b => b.onclick = () => { const k = +b.dataset.pb; data[k] ^= 1; draw(); box.querySelector(`[data-pb="${k}"]`).focus({preventScroll:true}); });
    box.querySelector("[data-preset]").onclick = () => { data = [...orig]; draw(); };
  };
  draw();
};

/* ---------- ハッシュ値（SHA-256） ---------- */
X.hash = box => {
  box.innerHTML = `<p>文字を1文字変えるだけで、ハッシュ値は全く別物になります。同じ入力からは必ず同じ値になり、ハッシュ値から元の文を戻すことはできません。</p>
  <div class="motion-diagram"><label class="m2-slider">文章<input type="text" data-hin value="10万円を振り込みます" style="font:inherit;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink)"></label>
  <p><b>SHA-256のハッシュ値：</b></p><p class="m2-hash" data-hout></p>
  <p><b>最初の値：</b></p><p class="m2-hash muted" data-hfirst></p><p data-hdiff></p></div>
  <div class="motion-controls"><button type="button" class="btn" data-hpre="10万円を振り込みます">元の文章</button><button type="button" class="btn" data-hpre="90万円を振り込みます">1文字だけ改ざん</button></div>
  <p class="small">受け取った文章のハッシュ値を、送信者から届いたハッシュ値と比べれば改ざんに気付けます（デジタル署名はこの値に署名します）。</p>`;
  const inp = box.querySelector("[data-hin]"), out = box.querySelector("[data-hout]"), first = box.querySelector("[data-hfirst]"), diff = box.querySelector("[data-hdiff]");
  let base = null;
  const calc = async () => {
    const t = inp.value;
    let h = "";
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
      h = [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, "0")).join("");
    } catch(err){ h = "（この環境では計算できません）"; }
    if(base === null){ base = h; first.textContent = h; }
    out.innerHTML = [...h].map((ch, k) => base[k] === ch ? ch : `<mark>${ch}</mark>`).join("");
    const same = [...h].filter((ch, k) => base[k] === ch).length;
    diff.innerHTML = h === base ? "最初の文章と同じハッシュ値です。" : `<b style="color:var(--bad)">64文字中 ${64 - same}文字が変わりました</b>（色付きの文字）。`;
  };
  inp.oninput = calc;
  box.querySelectorAll("[data-hpre]").forEach(b => b.onclick = () => { inp.value = b.dataset.hpre; calc(); });
  calc();
};

/* ---------- TCPの3ウェイハンドシェイク ---------- */
const seqRender = st => `<div class="m2-seq"><div class="m2-seq-h"><b>${st.L}</b><b>${st.R}</b></div>${st.msgs.map((m, k) => `<div class="m2-msg ${m.dir} ${k === st.msgs.length - 1 ? "now" : ""}"><span>${m.t}</span></div>`).join("")}</div>`;
X.tcp = box => stepper(box, {build:() => {
  const all = [{dir:"r", t:"SYN（つないでいい？ 番号は100から）"},{dir:"l", t:"SYN＋ACK（いいよ。101を待つ。こちらは300から）"},{dir:"r", t:"ACK（了解。301を待つ）"},{dir:"r", t:"データ送信（確認応答をもらいながら）"}];
  const txt = ["TCPは送る前に、相手と3回のやり取りで接続を確立します（3ウェイハンドシェイク）。","クライアントが接続要求のSYNを送ります。","サーバが了解のACKと、自分からの接続要求SYNをまとめて返します。","クライアントがACKを返して接続確立。ここまでで3回です。","接続後、データを送ります。届いたらACKが返り、届かなければ再送します。これがTCPの信頼性。UDPはこの手順を省いて速さを優先します。"];
  return txt.map((t, k) => ({L:"クライアント", R:"サーバ", msgs:all.slice(0, k), text:t}));
}, render:seqRender});

/* ---------- DHCP ---------- */
X.dhcp = box => stepper(box, {build:() => {
  const all = [{dir:"r", t:"DISCOVER（DHCPサーバはいますか？）全員宛て"},{dir:"l", t:"OFFER（192.168.1.20はどう？）"},{dir:"r", t:"REQUEST（それを使わせて）"},{dir:"l", t:"ACK（どうぞ。期限は24時間）"}];
  const txt = ["PCをLANにつなぐと、IPアドレスを自動でもらう手順が始まります。まだIPアドレスがないので、最初は全員宛て（ブロードキャスト）で送ります。","PCが「DHCPサーバはいますか？」と全員に呼びかけます。","DHCPサーバが、空いているIPアドレスを提案します。","PCが「そのアドレスを使います」と申し込みます。","サーバが承認。PCはIPアドレス・サブネットマスク・デフォルトゲートウェイ・DNSサーバの情報を受け取ります。頭文字をとって「DORA」と覚えます。"];
  return txt.map((t, k) => ({L:"PC", R:"DHCPサーバ", msgs:all.slice(0, k), text:t}));
}, render:seqRender});

/* ---------- NAPT ---------- */
X.napt = box => stepper(box, {build:() => {
  const T = [["192.168.1.10:5000","203.0.113.1:40001"],["192.168.1.11:5000","203.0.113.1:40002"]];
  return [
    {rows:[], pkt:null, text:"社内のPCはプライベートIPアドレス。インターネットに出るとき、ルータが1つのグローバルIPアドレス（203.0.113.1）に変換します。"},
    {rows:[T[0]], pkt:["PC1 192.168.1.10:5000","→ 203.0.113.1:40001"], text:"PC1が外のサーバへ送信。ルータは送信元を「203.0.113.1:40001」に書き換え、対応を変換表に記録します。"},
    {rows:T, pkt:["PC2 192.168.1.11:5000","→ 203.0.113.1:40002"], text:"PC2も送信。グローバルIPは同じでも、ポート番号を40002にして区別します。これがNAPT（IPマスカレード）。"},
    {rows:T, pkt:["返事 宛先 203.0.113.1:40002","→ 192.168.1.11:5000"], text:"サーバからの返事は宛先ポート40002。変換表を見て、PC2に戻します。ポート番号まで使うので、1つのグローバルIPを複数台で共有できます。"}
  ];
}, render:st => `<div class="m2-tbl"><b>ルータの変換表</b><table><tr><th>社内のIP:ポート</th><th>外向けのIP:ポート</th></tr>${st.rows.length ? st.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("") : '<tr><td colspan="2">まだ空</td></tr>'}</table></div>${st.pkt ? `<div class="m2-flow"><span>${st.pkt[0]}</span><b>ルータで変換</b><span>${st.pkt[1]}</span></div>` : ""}`});

/* ---------- 再帰（階乗） ---------- */
X.recur = box => stepper(box, {build:() => {
  const st = [{stack:[], ret:null, text:"fact(n) ＝ n × fact(n−1)、ただし fact(1) ＝ 1。自分自身を呼び出す関数です。fact(4) を計算します。"}];
  const stack = [];
  for(let n = 4; n >= 1; n--){ stack.push(`fact(${n})`); st.push({stack:[...stack], ret:null, text:n > 1 ? `fact(${n}) は「${n} × fact(${n - 1})」なので、fact(${n - 1}) を呼び出して待ちます。呼び出しが積み重なります。` : "fact(1) は1と決まっているので、ここで呼び出しが止まります（終了条件）。"}); }
  let v = 1;
  for(let n = 1; n <= 4; n++){ v = n === 1 ? 1 : v * n; stack.pop(); st.push({stack:[...stack], ret:`fact(${n}) ＝ ${v}`, text:n === 1 ? "fact(1) が 1 を返します。ここから戻りながら掛け算していきます。" : `fact(${n}) ＝ ${n} × ${v / n} ＝ ${v} を返します。`}); }
  st.push({stack:[], ret:"fact(4) ＝ 24", text:"答えは24。終了条件がないと、呼び出しが永遠に積み重なってしまいます。"});
  return st;
}, render:st => `<p><b>呼び出し中（いちばん上が今動いている関数）：</b></p><div class="m2-callstack">${st.stack.length ? [...st.stack].reverse().map((s, k) => `<span class="motion-cell ${k === 0 ? "active" : ""}">${s}</span>`).join("") : '<span class="small muted">なし</span>'}</div><p><b>返した値：</b>${st.ret || "まだなし"}</p>`});

/* ---------- ハッシュ表（衝突と線形探査） ---------- */
X.hashtbl = box => stepper(box, {build:() => {
  const keys = [15, 22, 8, 29, 1], tbl = Array(7).fill(null), st = [{tbl:[...tbl], k:null, at:null, text:"7つの箱がある表に、キーを「キー mod 7（7で割った余り）」番目に入れます。"}];
  keys.forEach(key => {
    let h = key % 7, tries = [h];
    while(tbl[h] !== null){ h = (h + 1) % 7; tries.push(h); }
    tbl[h] = key;
    st.push({tbl:[...tbl], k:key, at:h, text:tries.length === 1 ? `${key} mod 7 ＝ ${key % 7}。${h}番が空いているので入れます。` : `${key} mod 7 ＝ ${key % 7}。でも${key % 7}番は使用中（衝突＝シノニム）。次の箱を順に見て、${h}番に入れます（線形探査）。`});
  });
  st.push({...st[st.length - 1], k:null, text:"探すときも同じ計算をするので、1回の計算でほぼ場所が分かります。衝突が多いと、探す回数が増えて遅くなります。"});
  return st;
}, render:st => `<div class="motion-cells">${st.tbl.map((v, k) => `<span class="motion-cell ${k === st.at && st.k !== null ? "active" : ""}"><small>${k}番</small><br>${v ?? "空"}</span>`).join("")}</div>`});

/* ---------- SQL ---------- */
const ORD = [["1","山田","ペン",100],["2","佐藤","ノート",300],["3","山田","ノート",300],["4","鈴木","ペン",100],["5","佐藤","ペン",100],["6","山田","はさみ",500]];
X.sql = box => stepper(box, {select:{label:"SQL", value:"where", options:[["where","WHERE：行を選ぶ"],["group","GROUP BY：グループごとに集計"],["having","HAVING：集計結果で絞る"],["order","ORDER BY：並べ替え"]]},
  build:v => {
    const q = {where:"SELECT * FROM 注文 WHERE 商品 = 'ペン'", group:"SELECT 顧客, SUM(金額) FROM 注文 GROUP BY 顧客", having:"SELECT 顧客, SUM(金額) FROM 注文 GROUP BY 顧客 HAVING SUM(金額) >= 500", order:"SELECT * FROM 注文 ORDER BY 金額 DESC"}[v];
    const sums = {}; ORD.forEach(r => sums[r[1]] = (sums[r[1]] || 0) + r[3]);
    const groups = Object.entries(sums);
    const base = {q, view:"src", hl:[], text:"注文表から始めます。"};
    if(v === "where") return [base, {...base, hl:ORD.map((r, k) => r[2] === "ペン" ? k : -1).filter(k => k >= 0), text:"WHEREは1行ずつ条件を調べ、商品がペンの行だけを選びます（色付き）。"}, {...base, view:"res", res:[["注文番号","顧客","商品","金額"], ORD.filter(r => r[2] === "ペン")], text:"結果は3行。WHEREは集計の前に行を絞り込みます。"}];
    if(v === "group") return [base, {...base, view:"grp", text:"GROUP BY 顧客で、同じ顧客の行を1つのグループにまとめます。"}, {...base, view:"res", res:[["顧客","SUM(金額)"], groups], text:"グループごとにSUMで合計。結果はグループの数（3行）になります。"}];
    if(v === "having") return [base, {...base, view:"res", res:[["顧客","SUM(金額)"], groups], text:"まずGROUP BYで顧客ごとに合計します。"}, {...base, view:"res", res:[["顧客","SUM(金額)"], groups], hl:groups.map((g, k) => g[1] >= 500 ? k : -1).filter(k => k >= 0), text:"HAVINGは「集計した後」の値で絞ります。合計が500以上のグループだけ残ります。"}, {...base, view:"res", res:[["顧客","SUM(金額)"], groups.filter(g => g[1] >= 500)], text:"結果は山田さんと佐藤さん。WHEREは集計前の行、HAVINGは集計後のグループを絞る、が違いです。"}];
    return [base, {...base, view:"res", res:[["注文番号","顧客","商品","金額"], [...ORD].sort((a, b) => b[3] - a[3])], text:"ORDER BY 金額 DESC で、金額の大きい順（降順）に並べます。ASCまたは省略なら小さい順です。"}];
  },
  render:st => {
    const t = (head, rows, hl = []) => `<div class="m2-tbl"><table><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr>${rows.map((r, k) => `<tr class="${hl.includes(k) ? "hl" : ""}">${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`;
    const sql = `<p class="m2-sql">${st.q}</p>`;
    if(st.view === "src") return sql + "<b>注文</b>" + t(["注文番号","顧客","商品","金額"], ORD, st.hl);
    if(st.view === "grp") return sql + ["山田","佐藤","鈴木"].map(c => `<b>${c}さんのグループ</b>` + t(["注文番号","顧客","商品","金額"], ORD.filter(r => r[1] === c))).join("");
    return sql + "<b>結果</b>" + t(st.res[0], st.res[1], st.hl);
  }});

/* ---------- 攻略ガイドへの項目と、用語カードからのリンク ---------- */
window.motion3HTML = () => {
  const d = (sum, key) => `<details class="usage"><summary>${sum}</summary><div class="usage-body" data-motion2="${key}"></div></details>`;
  return {
    mgmt: `<p>数字を動かして、公式の意味を確かめます。</p>${d("EVM：PV・EV・ACから遅れと予算超過を判断","evm")}${d("MTBF・MTTR：稼働率を上げるには？","mtbf")}${d("減価償却：定額法と定率法の違い","dep")}${d("パイプライン：何サイクルで終わる？","pipe")}${d("探索回数：線形探索と二分探索の差","search")}`,
    nw: `<p>やり取りの順番や、ビットの変化を追います。</p>${d("TCP：3ウェイハンドシェイク","tcp")}${d("DHCP：IPアドレスを自動でもらう4ステップ","dhcp")}${d("NAPT：1つのグローバルIPを複数台で使う","napt")}${d("パリティ：1ビットの誤りを見つける","parity")}${d("ハッシュ値：1文字変えると全部変わる","hash")}`,
    algo: `<p>処理の中身を1手ずつ確かめます。</p>${d("SQL：WHERE・GROUP BY・HAVING・ORDER BY","sql")}${d("再帰：自分を呼び出す関数の積み重なり","recur")}${d("ハッシュ表：衝突したらどこに入る？","hashtbl")}${d("半加算器：XORとANDで足し算する","adder")}`
  };
};
Object.assign(window.MOTION_MAP || {}, {"EVM":"evm","RASIS":"mtbf","減価償却":"dep","パイプライン":"pipe","計算量（オーダ）":"search","TCPとUDP":"tcp","DHCP":"dhcp","NAT・NAPT":"napt",
  "誤り検出と訂正":"parity","ハッシュ関数":"hash","再帰":"recur","ハッシュ表":"hashtbl","論理回路と半加算器":"adder","SQLの集計":"sql"});
})();
