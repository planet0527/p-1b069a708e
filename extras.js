/* 追加機能：模擬試験・分野別の成績と苦手分析・間違いノート・学習カレンダー・試験日カウントダウン・文字サイズ */

/* ---------- 解答の記録 ---------- */
function rec(q, ok){
  if(!q || !q.id) return;
  S.log ||= {};
  const r = S.log[q.id] ||= {n:0, ok:0, sec:q.sec};
  r.n++; if(ok) r.ok++; r.last = ok ? 1 : 0; r.sec = q.sec || r.sec; r.at = today();
  const d = day(); d.practice = (d.practice || 0) + 1;
  save();
}
function secRates(){
  const out = {};
  Object.values(S.log || {}).forEach(r => {
    if(!r.sec) return;
    const o = out[r.sec] ||= {ids:0, right:0, tries:0};
    o.ids++; o.right += r.last ? 1 : 0; o.tries += r.n;
  });
  return out;
}
function questionById(id){
  if(id.startsWith("b:")) return QBANK[+id.slice(2)];
  if(id.startsWith("c:")){ const i = +id.slice(2), c = CARDS[i]; return c && {...c.quiz, id, sec:c.sec}; }
  if(id.startsWith("t:")){ const name = id.slice(2); return termQuestions().find(x => x.id === id) || null; }
  return null;
}
function wrongIds(){ return Object.entries(S.log || {}).filter(([,r]) => r.last === 0).map(([id]) => id); }
function startSet(list){
  PR.set = {list: shuffle(list), i:0, ok:0, miss:[]};
  go("#practice");
}

/* ---------- 間違いノート ---------- */
function renderNotebook(){
  app.innerHTML = pageHead("間違いノート", "最後に間違えた問題がたまるよ。正解すると自動でノートから消える。");
  const ids = wrongIds(), qs = ids.map(questionById).filter(Boolean);
  const p = document.createElement("section");
  p.className = "panel";
  app.appendChild(p);
  if(!qs.length){
    p.innerHTML = `<h2>ノートは空です</h2><p>問題演習・レッスン・ボス戦・模擬試験で間違えた問題が、ここに集まります。</p>`;
    const b = document.createElement("button"); b.type="button"; b.className="btn primary wide"; b.textContent="問題演習へ"; b.onclick=()=>go("#practice"); p.appendChild(b);
    return;
  }
  const bySec = {};
  qs.forEach(q => (bySec[q.sec || "other"] ||= []).push(q));
  p.innerHTML = `<div class="row between"><h2>${qs.length}問たまっています</h2></div><p class="small muted">分野ごとに解き直せます。まとめて解くときは下のボタンから10問ずつ。</p>`;
  const all = document.createElement("button"); all.type="button"; all.className="btn primary wide"; all.textContent=`ノートから10問解き直す`;
  all.onclick = () => startSet(shuffle(qs).slice(0,10));
  p.appendChild(all);
  const list = document.createElement("div");
  list.className = "nb-list";
  Object.entries(bySec).sort((a,b)=>b[1].length-a[1].length).forEach(([sec, arr]) => {
    const s = secOf(sec);
    const row = document.createElement("button");
    row.type = "button"; row.className = "nb-row";
    row.style.setProperty("--c", COLORS[sec] || "var(--accent)");
    row.innerHTML = `<span class="ic">${ABBR[sec] || "他"}</span><b>${s ? s.title : "その他"}</b><span class="pill bad num">${arr.length}問</span>`;
    row.onclick = () => startSet(arr.slice(0,10));
    list.appendChild(row);
  });
  p.appendChild(list);
  const det = document.createElement("details");
  det.innerHTML = `<summary style="cursor:pointer;font-weight:700;color:var(--accent)">問題と答えを一覧で見る</summary><div class="missed" style="margin-top:8px">${qs.map(q=>`<div>${esc(q.q)}<br>→ <b>${esc(q.opts[q.a])}</b></div>`).join("")}</div>`;
  p.appendChild(det);
}

/* ---------- 模擬試験（60問・90分） ---------- */
const FIELDS = [
  {id:"tech", name:"テクノロジ系", secs:["basic","hw","sys","db","nw","sec","dev"], n:41, color:"#2b62cf"},
  {id:"mgmt", name:"マネジメント系", secs:["mgmt"], n:7, color:"#a8771c"},
  {id:"strat", name:"ストラテジ系", secs:["sysst","st"], n:12, color:"#b23c96"}
];
const MOCK_MIN = 90;
function mockPool(){
  const items = [
    ...QBANK.map(q => ({q:q.q, opts:q.opts, a:q.a, exp:q.exp, id:q.id, sec:q.sec})),
    ...CARDS.map((c,i) => ({q:c.quiz.q, opts:c.quiz.opts, a:c.quiz.a, exp:c.quiz.exp, id:"c:"+i, sec:c.sec})),
    ...termQuestions()
  ];
  const seen = new Set();
  return items.filter(x => x.sec && !seen.has(x.id) && seen.add(x.id));
}
function newMock(){
  const pool = mockPool(), list = [];
  FIELDS.forEach(f => {
    const inF = shuffle(pool.filter(x => f.secs.includes(x.sec)));
    const bank = inF.filter(x => !x.term), term = inF.filter(x => x.term);
    list.push(...shuffle([...bank.slice(0, Math.ceil(f.n*0.7)), ...term]).slice(0, f.n));
  });
  return {list, ans: Array(list.length).fill(null), flag: Array(list.length).fill(false), i:0, used:0, started: Date.now(), grid:false};
}
function mockLeft(m){ return Math.max(0, MOCK_MIN*60000 - m.used); }
const mmss = ms => { const s = Math.ceil(ms/1000); return `${pad(Math.floor(s/60))}:${pad(s%60)}`; };
function finishMock(){
  const m = S.mockCur; if(!m) return;
  let right = 0;
  const byF = {}, bySec = {};
  m.list.forEach((q, i) => {
    const ok = m.ans[i] === q.a;
    if(ok) right++;
    const f = FIELDS.find(f => f.secs.includes(q.sec)).id;
    (byF[f] ||= {n:0, ok:0}).n++; if(ok) byF[f].ok++;
    (bySec[q.sec] ||= {n:0, ok:0}).n++; if(ok) bySec[q.sec].ok++;
    rec(q, ok);
  });
  const score = Math.round(right / m.list.length * 1000);
  const result = {date: today(), score, right, total: m.list.length, min: Math.round(m.used/60000), byF, bySec, list: m.list, ans: m.ans};
  S.mocks ||= [];
  S.mocks.unshift({date: result.date, score, min: result.min});
  S.mocks = S.mocks.slice(0, 20);
  S.mockLast = result;
  S.mockCur = null;
  gainXP(right * 2);
  save();
  if(score >= 600) setTimeout(confetti, 150);
}
function renderMock(){
  app.innerHTML = "";
  const m = S.mockCur;
  if(!m) return S.mockLast && location.hash === "#mock-result" ? mockResult() : mockStart();
  app.style.setProperty("--sec", "var(--accent)");
  if(mockLeft(m) <= 0){ finishMock(); location.hash = "#mock-result"; return; }

  const q = m.list[m.i], gl = glosser(), answered = m.ans.filter(x => x !== null).length;
  const top = document.createElement("div");
  top.className = "mock-top";
  top.innerHTML = `<button type="button" class="close" id="mkPause" aria-label="中断してホームへ">×</button>
    <div class="mock-clock"><span class="small muted">残り</span><b class="num" id="mkClock">${mmss(mockLeft(m))}</b></div>
    <span class="small muted num">解答 ${answered}/${m.list.length}</span>`;
  app.appendChild(top);
  const bar = document.createElement("div"); bar.className = "lbar"; bar.innerHTML = `<i style="width:${(m.i+1)/m.list.length*100}%"></i>`; app.appendChild(bar);

  const p = document.createElement("section");
  p.className = "panel";
  const field = FIELDS.find(f => f.secs.includes(q.sec));
  p.innerHTML = `<div class="row between"><span class="pill" style="background:${field.color};color:#fff">問${m.i+1}　${field.name}</span>
      <button type="button" class="flagbtn" id="mkFlag" aria-pressed="${m.flag[m.i]}">${m.flag[m.i] ? "★ 見直し" : "☆ あとで見直す"}</button></div>
    <p class="q">${gl(q.q)}</p>
    <div class="opts">${q.opts.map((o,k)=>`<button type="button" class="opt mk ${m.ans[m.i]===k?"sel":""}" data-k="${k}" aria-pressed="${m.ans[m.i]===k}"><span class="mk-l">${"アイウエ"[k]}</span>${esc(o)}</button>`).join("")}</div>
    <div class="mock-nav">
      <button type="button" class="btn" id="mkPrev" ${m.i===0?"disabled":""}>前へ</button>
      <button type="button" class="btn" id="mkGrid">一覧</button>
      <button type="button" class="btn primary" id="mkNext">${m.i===m.list.length-1 ? "最後の問題" : "次へ"}</button>
    </div>`;
  app.appendChild(p);

  const g = document.createElement("section");
  g.className = "panel"; if(!m.grid) g.style.display = "none";
  g.innerHTML = `<div class="row between"><h2>問題一覧</h2><span class="small muted">★＝見直し</span></div>
    <div class="mgrid">${m.list.map((_,k)=>`<button type="button" data-j="${k}" class="${m.ans[k]!==null?"done":""} ${m.flag[k]?"fl":""} ${k===m.i?"cur":""}">${k+1}</button>`).join("")}</div>`;
  app.appendChild(g);

  const fin = document.createElement("section");
  fin.className = "panel";
  const un = m.list.length - answered, fl = m.flag.filter(Boolean).length;
  fin.innerHTML = `<p class="small">${un ? `<b style="color:var(--bad)">未解答が${un}問</b>あります。` : "全問に解答しました。"}${fl ? ` 見直し印が${fl}問。` : ""}</p>
    <button type="button" class="btn wide" id="mkEnd">試験を終了して採点する</button>`;
  app.appendChild(fin);

  p.querySelectorAll(".opt.mk").forEach(b => b.onclick = () => { m.ans[m.i] = +b.dataset.k; save(); if(m.i < m.list.length-1){ m.i++; } render(); });
  $("#mkFlag").onclick = () => { m.flag[m.i] = !m.flag[m.i]; save(); render(); };
  $("#mkPrev").onclick = () => { m.i = Math.max(0, m.i-1); render(); };
  $("#mkNext").onclick = () => { if(m.i < m.list.length-1){ m.i++; render(); } else { m.grid = true; render(); } };
  $("#mkGrid").onclick = () => { m.grid = !m.grid; render(); };
  g.querySelectorAll("[data-j]").forEach(b => b.onclick = () => { m.i = +b.dataset.j; m.grid = false; render(); });
  $("#mkPause").onclick = () => { save(); go("#home"); };
  const endBtn = $("#mkEnd");
  endBtn.onclick = () => {
    if(!endBtn.dataset.sure){ endBtn.dataset.sure = "1"; endBtn.textContent = "本当に終了する場合はもう一度押す"; endBtn.classList.add("primary"); return; }
    finishMock(); go("#mock-result");
  };
  let last = Date.now();
  tick = setInterval(() => {
    if(document.visibilityState !== "visible"){ last = Date.now(); return; }
    const now = Date.now(); m.used += now - last; last = now;
    const c = $("#mkClock"); if(!c){ clearTick(); return; }
    c.textContent = mmss(mockLeft(m));
    c.parentElement.classList.toggle("warn", mockLeft(m) < 10*60000);
    if(Math.floor(m.used/1000) % 10 === 0) save();
    if(mockLeft(m) <= 0){ clearTick(); finishMock(); go("#mock-result"); }
  }, 1000);
}
function mockStart(){
  app.innerHTML = pageHead("模擬試験", "本番と同じ60問・90分。答え合わせは最後にまとめて。600点以上で合格ライン！");
  const p = document.createElement("section");
  p.className = "panel";
  const hist = S.mocks || [];
  p.innerHTML = `
    <div class="gstats">
      <div><b class="num">60</b><span>問</span><small>4択</small></div>
      <div><b class="num">90</b><span>分</span><small>中断OK</small></div>
      <div><b class="num">600</b><span>点で合格</span><small>1000点満点</small></div>
    </div>
    <ul class="small muted" style="margin:0;padding-left:1.2em">
      <li>テクノロジ系41問・マネジメント系7問・ストラテジ系12問（本番と同じ割合）</li>
      <li>迷った問題は「あとで見直す」で印を付けて、一覧から戻れます</li>
      <li>アプリを閉じても途中から再開でき、閉じている間はタイマーが止まります</li>
    </ul>`;
  const b = document.createElement("button"); b.type="button"; b.className="btn primary wide"; b.textContent="模擬試験を始める";
  b.onclick = () => { S.mockCur = newMock(); save(); render(); };
  p.appendChild(b);
  if(S.mockLast){ const r = document.createElement("button"); r.type="button"; r.className="btn wide"; r.textContent="前回の結果を見る"; r.onclick=()=>go("#mock-result"); p.appendChild(r); }
  app.appendChild(p);
  if(hist.length){
    const h = document.createElement("section");
    h.className = "panel";
    const max = 1000;
    h.innerHTML = `<h2>これまでの点数</h2><div class="mhist">${hist.slice(0,10).reverse().map(x=>`<div class="mh"><span class="num small">${x.score}</span><i style="height:${x.score/max*100}%;background:${x.score>=600?"var(--good)":"var(--calc)"}"></i><span class="small muted">${x.date.slice(5).replace("-","/")}</span></div>`).join("")}</div>`;
    app.appendChild(h);
  }
}
function mockResult(){
  const r = S.mockLast;
  if(!r){ go("#mock"); return; }
  const pass = r.score >= 600;
  app.innerHTML = pageHead("模擬試験の結果", `${r.date}・${r.min}分`, pass ? "happy" : "normal");
  const p = document.createElement("section");
  p.className = "panel";
  p.style.alignItems = "center"; p.style.textAlign = "center";
  p.innerHTML = `${mascot(pass ? "happy" : "normal", "bob")}<span class="phase">${pass ? "合格ライン突破！" : "あと" + (600 - r.score) + "点！"}</span>
    <span class="big">${r.score}<span style="font-size:22px"> 点</span></span><p class="num">${r.total}問中 ${r.right}問正解</p>`;
  app.appendChild(p);
  const f = document.createElement("section");
  f.className = "panel";
  f.innerHTML = `<h2>分野ごとの正答率</h2>${FIELDS.map(x => { const v = r.byF[x.id] || {n:0, ok:0}; const pc = v.n ? Math.round(v.ok/v.n*100) : 0; return `<div class="frow"><b>${x.name}</b><div class="bar"><i style="width:${pc}%;background:${x.color}"></i></div><span class="num small">${v.ok}/${v.n}（${pc}%）</span></div>`; }).join("")}
    <details><summary style="cursor:pointer;font-weight:700;color:var(--accent)">さらに細かい分野</summary>${SECTIONS.map(s => { const v = r.bySec[s.id]; if(!v) return ""; const pc = Math.round(v.ok/v.n*100); return `<div class="frow"><b class="small">${s.title}</b><div class="bar"><i style="width:${pc}%;background:${COLORS[s.id]}"></i></div><span class="num small">${v.ok}/${v.n}</span></div>`; }).join("")}</details>`;
  app.appendChild(f);
  const wrong = r.list.map((q,i)=>({q, a:r.ans[i]})).filter(x => x.a !== x.q.a);
  const w = document.createElement("section");
  w.className = "panel";
  w.innerHTML = `<div class="row between"><h2>間違えた問題</h2><span class="pill bad num">${wrong.length}問</span></div>
    <p class="small muted">間違えた問題は間違いノートに入りました。</p>
    <details><summary style="cursor:pointer;font-weight:700;color:var(--accent)">解説を見る</summary><div class="missed" style="margin-top:8px">${wrong.map(x=>`<div>${esc(x.q.q)}<br><span class="small">あなたの答え：${x.a===null?"未解答":esc(x.q.opts[x.a])}</span><br>→ 正解 <b>${esc(x.q.opts[x.q.a])}</b><br><span class="small muted">${esc(x.q.exp||"")}</span></div>`).join("")}</div></details>`;
  const b1 = document.createElement("button"); b1.type="button"; b1.className="btn primary wide"; b1.textContent="間違えた問題を解き直す"; b1.onclick=()=>startSet(wrong.map(x=>x.q).slice(0,10));
  const b2 = document.createElement("button"); b2.type="button"; b2.className="btn wide"; b2.textContent="もう一度模擬試験を受ける"; b2.onclick=()=>{ S.mockCur = newMock(); save(); go("#mock"); };
  if(wrong.length) w.appendChild(b1);
  w.appendChild(b2);
  app.appendChild(w);
}

/* ---------- ホームに足すパネル ---------- */
function heatmapHTML(){
  const days = 84, cells = [];
  const d = new Date(); d.setDate(d.getDate() - days + 1);
  const pad0 = (d.getDay() + 6) % 7;      // 月曜始まり
  for(let i=0;i<pad0;i++) cells.push(`<i class="hm e"></i>`);
  for(let i=0;i<days;i++){
    const k = dstr(d), x = S.days[k], m = (S.minutes||{})[k] || 0;
    const v = Math.max(activeOn(k) ? 1 : 0, (x?.lesson||0) + (x?.drill||0) + (x?.game||0)*3 + (x?.review||0) + (x?.practice||0) + Math.floor(m/10));
    const lv = v === 0 ? 0 : v < 5 ? 1 : v < 15 ? 2 : v < 30 ? 3 : 4;
    cells.push(`<i class="hm l${lv} ${k===today()?"t":""}" title="${k}"></i>`);
    d.setDate(d.getDate()+1);
  }
  const first = new Date(); first.setDate(first.getDate() - days + 1);
  const active = [...new Set([...Object.keys(S.days), ...Object.keys(S.minutes || {})])].filter(k => k >= dstr(first) && k <= today() && activeOn(k)).length;
  return `<div class="row between"><h2>学習カレンダー</h2><span class="small muted num">12週間で${active}日</span></div>
    <div class="hmwrap"><div class="hmlabels small muted"><span>月</span><span></span><span>水</span><span></span><span>金</span><span></span><span>日</span></div><div class="hmgrid">${cells.join("")}</div></div>
    <div class="row small muted" style="justify-content:flex-end;gap:4px">少<i class="hm l1"></i><i class="hm l2"></i><i class="hm l3"></i><i class="hm l4"></i>多</div>`;
}
function weakHTML(){
  const rates = secRates();
  const rows = SECTIONS.map(s => ({s, v: rates[s.id]})).filter(x => x.v && x.v.ids >= 1);
  if(!rows.length) return `<h2>分野別の正答率</h2><p class="small muted">問題を解くと、分野ごとの正答率がここに出て、苦手が分かるようになります。</p>`;
  rows.sort((a,b) => a.v.right/a.v.ids - b.v.right/b.v.ids);
  return `<div class="row between"><h2>分野別の正答率</h2><span class="small muted">低い順</span></div>
    ${rows.map(({s,v}) => { const pc = Math.round(v.right/v.ids*100); return `<div class="frow"><b class="small">${s.title}</b><div class="bar"><i style="width:${pc}%;background:${pc<50?"var(--bad)":pc<70?"var(--calc)":"var(--good)"}"></i></div><span class="num small">${pc}%</span></div>`; }).join("")}
    <p class="small muted">それぞれの問題の、最後に答えたときの結果で計算しています。</p>`;
}
function examDays(){
  if(!S.examDate) return null;
  const t = new Date(S.examDate + "T00:00:00"), n = new Date(); n.setHours(0,0,0,0);
  return Math.round((t - n) / 86400000);
}
function settingsHTML(){
  return `<h2>設定</h2>
    <label class="setrow"><span>試験日</span><input type="date" id="exDate" value="${S.examDate||""}" class="search" style="width:auto"></label>
    <div class="setrow"><span>文字の大きさ</span><div class="chips" id="fsz">${[["normal","ふつう"],["large","大きめ"],["xl","特大"]].map(([k,l])=>`<button type="button" class="chipbtn" data-f="${k}" aria-pressed="${(S.font||"normal")===k}">${l}</button>`).join("")}</div></div>`;
}
function applyFont(){
  const z = {normal:1, large:1.12, xl:1.25}[S.font || "normal"];
  document.querySelector(".wrap").style.zoom = z === 1 ? "" : z;
}
const baseHome = ROUTES.home;
ROUTES.home = function(){
  baseHome();
  const nextBtn = $("#nextBtn");
  const dleft = examDays();
  if(dleft !== null && dleft >= 0){
    nextBtn.insertAdjacentHTML("beforebegin", `<div class="examcd"><span>試験まで</span><b class="num">${dleft}</b><span>日</span></div>`);
  }
  const wrongN = wrongIds().length;
  const stats = app.querySelector(".stats");
  stats.insertAdjacentHTML("afterend", `
    <button type="button" class="termlink mocklink" data-go2="#mock"><span class="ic">模</span><span><b>模擬試験</b><br><span class="small">${S.mockCur ? `途中から再開（${S.mockCur.ans.filter(x=>x!==null).length}/60問）` : S.mocks?.length ? `前回 ${S.mocks[0].score}点・60問90分` : "本番と同じ60問・90分で実力チェック"}</span></span><span class="go">${S.mockCur ? "再開" : "挑戦"}</span></button>
    ${wrongN ? `<button type="button" class="termlink nblink" data-go2="#notebook"><span class="ic">✎</span><span><b>間違いノート</b><br><span class="small">${wrongN}問たまっています。解き直して消そう</span></span><span class="go">開く</span></button>` : ""}`);
  const road = app.querySelector(".road-wrap");
  const extra = document.createElement("div");
  extra.innerHTML = `<section class="panel" aria-label="学習カレンダー">${heatmapHTML()}</section><section class="panel" aria-label="分野別の正答率" id="weakPanel">${weakHTML()}</section>`;
  road.before(...extra.children);
  const wp = $("#weakPanel"), rates = secRates();
  const weakest = SECTIONS.filter(s => rates[s.id] && rates[s.id].ids >= 3).sort((a,b) => rates[a.id].right/rates[a.id].ids - rates[b.id].right/rates[b.id].ids)[0];
  if(weakest){
    const b = document.createElement("button"); b.type="button"; b.className="btn wide"; b.textContent=`いちばん苦手な「${weakest.title}」を10問`;
    b.onclick = () => { PR.sec = weakest.id; PR.src = "mix"; startPractice(); go("#practice"); };
    wp.appendChild(b);
  }
  const set = document.createElement("section");
  set.className = "panel"; set.innerHTML = settingsHTML();
  app.querySelector('[aria-label="記録の保存"]').before(set);
  $("#exDate").onchange = e => { S.examDate = e.target.value || null; save(); render(); };
  set.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { S.font = b.dataset.f; save(); applyFont(); set.querySelectorAll("[data-f]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); });
  app.querySelectorAll("[data-go2]").forEach(b => b.onclick = () => go(b.dataset.go2));
};
ROUTES.mock = renderMock;
ROUTES["mock-result"] = () => { app.innerHTML = ""; mockResult(); };
ROUTES.notebook = renderNotebook;

/* レッスン一覧にも入口を足す */
const baseLessons = ROUTES.lessons;
ROUTES.lessons = function(){
  baseLessons();
  const wrongN = wrongIds().length;
  app.querySelector(".pagehead").insertAdjacentHTML("afterend", `<button type="button" class="termlink nblink" id="toNb"><span class="ic">✎</span><span><b>間違いノート</b><br><span class="small">${wrongN ? `${wrongN}問たまっています` : "間違えた問題がここに集まる"}</span></span><span class="go">開く</span></button>`);
  $("#toNb").onclick = () => go("#notebook");
};

/* 画面を描くたびに文字の大きさをそろえる */
const baseRender = render;
render = function(){ baseRender(); applyFont(); };
window.removeEventListener("hashchange", baseRender);
window.addEventListener("hashchange", render);
render();

