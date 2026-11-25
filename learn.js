/* 学習者向けの機能：今日の1問・計算メモ（手書き）・単語カード・聞き流し・ブックマーク・問題の共有 */
const APP_URL = "https://planet0527.github.io/p-1b069a708e/";

/* ---------- ブックマーク ---------- */
function isBm(id){ return !!(S.bm && S.bm[id]); }
function toggleBm(id){ S.bm ||= {}; if(S.bm[id]) delete S.bm[id]; else S.bm[id] = today(); save(); return isBm(id); }
function bmBtn(id){ const on = isBm(id); return `<button type="button" class="bm-btn" data-bm="${esc(id)}" aria-pressed="${on}" aria-label="ブックマーク">${on ? "★" : "☆"}<span>${on ? "保存済み" : "あとで見る"}</span></button>`; }
function wireBm(root){
  root.querySelectorAll("[data-bm]").forEach(b => b.onclick = ev => {
    ev.stopPropagation();
    const on = toggleBm(b.dataset.bm);
    b.setAttribute("aria-pressed", String(on));
    b.innerHTML = `${on ? "★" : "☆"}<span>${on ? "保存済み" : "あとで見る"}</span>`;
    if(on) toast("ブックマークしました（間違いノートの画面にあります）");
  });
}

/* ---------- 問題の共有 ---------- */
function shareText(q){
  return `【基本情報 科目A】${q.q}\n${q.opts.map((o,i)=>`${"アイウエ"[i]}：${o}`).join("\n")}\n\n答えと解説はアプリで → ${APP_URL}`;
}
async function shareQ(q){
  const text = shareText(q);
  try {
    if(navigator.share){ await navigator.share({text}); return; }
  } catch(e){ if(e && e.name === "AbortError") return; }
  try { await navigator.clipboard.writeText(text); toast("問題をコピーしました。LINEやDiscordに貼り付けてね"); }
  catch(e){ toast("共有できませんでした"); }
}
function qTools(q){
  const d = document.createElement("div");
  d.className = "qtools";
  d.innerHTML = `${q.id ? bmBtn(q.id) : ""}<button type="button" class="share-btn">共有</button>`;
  wireBm(d);
  d.querySelector(".share-btn").onclick = () => shareQ(q);
  return d;
}

/* ---------- 今日の1問 ---------- */
function dailyPool(){ return [...QBANK, ...CARDS.map((c,i)=>({...c.quiz, id:"c:"+i, sec:c.sec}))]; }
function dailyQ(){
  const pool = dailyPool(), k = today();
  let h = 0; for(const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[h % pool.length];
}
function dailyStreak(){
  let n = 0; const d = new Date();
  if(!(S.daily||{})[dstr(d)]) d.setDate(d.getDate()-1);
  while((S.daily||{})[dstr(d)]){ n++; d.setDate(d.getDate()-1); }
  return n;
}
function dailyPanel(){
  const q = dailyQ(), done = (S.daily||{})[today()], gl = glosser();
  const p = document.createElement("section");
  p.className = "panel daily";
  p.innerHTML = `<div class="row between"><h2>今日の1問</h2><span class="pill num">${dailyStreak() ? `${dailyStreak()}日連続` : "毎日かわる"}</span></div>`;
  if(done){
    p.insertAdjacentHTML("beforeend", `<p class="q">${gl(q.q)}</p><div class="fb ${done.ok ? "ok" : "ng"}" style="grid-template-columns:1fr"><div><strong>${done.ok ? "正解済み！" : "今日は不正解。"} 答え：${esc(q.opts[q.a])}</strong>${gl(q.exp || "")}<p class="small muted" style="margin-top:4px">明日も新しい1問が出るよ。</p></div></div>`);
    p.appendChild(qTools(q));
    return p;
  }
  p.appendChild(quiz(gl(q.q), q.opts, q.a, ok => {
    S.daily ||= {}; S.daily[today()] = {ok};
    rec(q, ok); gainXP(ok ? 8 : 2); save();
    return `<p class="xp-pop">+${ok?8:2} XP</p>`;
  }, `<p>${gl(q.exp || "")}</p>`));
  p.appendChild(qTools(q));
  return p;
}

/* ---------- 単語カード（めくって覚える） ---------- */
let FC = null;
function fcDeck(mode){
  let list = TERMS.slice();
  if(mode === "hot") list = list.filter(t => t.f === 3);
  if(mode === "new") list = list.filter(t => t.n);
  if(mode === "bm") list = list.filter(t => isBm("t:" + t.t));
  if(mode !== "bm") list = list.filter(t => !(S.terms||{})[t.t]);
  return shuffle(list).sort((a,b) => b.f - a.f);
}
function renderCards(){
  app.innerHTML = pageHead("単語カード", "用語を見て、意味を思い出してからタップでめくる。覚えたものは次から出なくなるよ。", "happy");
  const p = document.createElement("section");
  p.className = "panel";
  app.appendChild(p);
  if(!FC){
    const cnt = m => fcDeck(m).length;
    p.innerHTML = `<h2>どのカードで練習する？</h2><div class="fc-modes">
      ${[["hot","★★★ よく出る","まだ覚えていない★★★"],["new","NEW","新しく増えた分野"],["all","すべて","まだ覚えていない全部"],["bm","ブックマーク","あとで見るに保存した用語"]]
        .map(([k,l,s])=>`<button type="button" class="fc-mode" data-m="${k}"><b>${l}</b><span class="small muted">${s}</span><span class="pill num">${cnt(k)}枚</span></button>`).join("")}
    </div>`;
    p.querySelectorAll("[data-m]").forEach(b => b.onclick = () => {
      const deck = fcDeck(b.dataset.m);
      if(!deck.length){ toast(b.dataset.m === "bm" ? "ブックマークした用語はまだありません" : "このカードは全部覚えました！"); return; }
      FC = {deck, i:0, flip:false, known:0, mode:b.dataset.m};
      render();
    });
    const lis = document.createElement("section");
    lis.className = "panel";
    lis.innerHTML = `<h2>聞き流しモード</h2><p class="small">用語と説明を音声で読み上げます。通学中や家事の合間に、画面を見ずに覚えられます（イヤホン推奨）。</p>`;
    const lb = document.createElement("button"); lb.type="button"; lb.className="btn primary wide"; lb.textContent="★★★の用語を聞く";
    lb.onclick = () => go("#listen");
    lis.appendChild(lb);
    app.appendChild(lis);
    return;
  }
  if(FC.i >= FC.deck.length){
    setTimeout(confetti, 150);
    p.style.alignItems = "center"; p.style.textAlign = "center";
    p.innerHTML = `${mascot("happy","bob")}<span class="phase">1周おわり！</span><span class="big">${FC.known}<span style="font-size:22px"> 枚</span></span><p>今回「覚えた」にした数</p>`;
    const b = document.createElement("button"); b.type="button"; b.className="btn primary wide"; b.textContent="もう1周する";
    b.onclick = () => { const deck = fcDeck(FC.mode); if(!deck.length){ FC = null; render(); return; } FC = {deck, i:0, flip:false, known:0, mode:FC.mode}; render(); };
    const b2 = document.createElement("button"); b2.type="button"; b2.className="btn wide"; b2.textContent="カードの種類を選び直す"; b2.onclick=()=>{ FC = null; render(); };
    p.append(b, b2);
    return;
  }
  const t = FC.deck[FC.i], cat = TCATS.find(c => c.id === t.c);
  p.style.setProperty("--c", cat.color);
  p.innerHTML = `<div class="row between"><span class="small muted num">${FC.i+1} / ${FC.deck.length}</span>${bmBtn("t:" + t.t)}</div>
    <button type="button" class="fc ${FC.flip ? "back" : ""}" id="fcCard" aria-label="${FC.flip ? "表に戻す" : "めくって答えを見る"}">
      <span class="tcat">${cat.name}</span>
      <b class="fc-term">${t.t}</b>
      <span class="small muted">${t.y}</span>
      ${FC.flip ? `<figure class="tfig" style="width:100%">${TFig(t.fig, cat.color)}</figure><span class="fc-desc">${glosser()(t.d)}</span>${t.ex ? `<span class="tex" style="text-align:left;width:100%"><span class="klbl">具体例</span>${glosser()(t.ex)}</span>` : ""}<span class="tkey"><span class="klbl">見分け方</span>${glosser()(t.k)}</span>` : `<span class="fc-hint">意味を思い出したら、タップしてめくる</span>`}
    </button>
    <div class="fc-btns" ${FC.flip ? "" : 'style="visibility:hidden"'}>
      <button type="button" class="btn" id="fcNo">まだ</button>
      <button type="button" class="btn primary" id="fcYes">覚えた！</button>
    </div>`;
  wireBm(p);
  $("#fcCard").onclick = () => { FC.flip = !FC.flip; render(); };
  const next = known => {
    if(known){ S.terms ||= {}; S.terms[t.t] = true; FC.known++; gainXP(2); }
    else FC.deck.push(t);
    save(); FC.i++; FC.flip = false; render();
  };
  if($("#fcYes")){ $("#fcYes").onclick = () => next(true); $("#fcNo").onclick = () => next(false); }
}

/* ---------- 聞き流し（読み上げ） ---------- */
let LS = {mode:"hot", i:0, playing:false, rate:1, list:null};
function plain(s){ return String(s).replace(/<[^>]+>/g, "").replace(/[★☆]/g, ""); }
function speak(text, onend){
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP"; u.rate = LS.rate;
    const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith("ja"));
    if(v) u.voice = v;
    u.onend = onend;
    speechSynthesis.speak(u);
  } catch(e){ toast("この端末では読み上げが使えません"); LS.playing = false; }
}
function listenList(){
  let l = TERMS.slice();
  if(LS.mode === "hot") l = l.filter(t => t.f === 3);
  if(LS.mode === "new") l = l.filter(t => t.n);
  if(LS.mode === "bm") l = l.filter(t => isBm("t:" + t.t));
  return l;
}
function renderListen(){
  if(!LS.list) LS.list = listenList();
  app.innerHTML = pageHead("聞き流しモード", "用語 → 説明 → 見分け方の順に読み上げて、自動で次へ進むよ。", "happy");
  const p = document.createElement("section");
  p.className = "panel";
  app.appendChild(p);
  const supported = "speechSynthesis" in window;
  const t = LS.list[LS.i % Math.max(1, LS.list.length)];
  p.innerHTML = `
    <div class="chips" id="lsMode">${[["hot","★★★"],["new","NEW"],["all","すべて"],["bm","ブックマーク"]].map(([k,l])=>`<button type="button" class="chipbtn" data-m="${k}" aria-pressed="${LS.mode===k}">${l}</button>`).join("")}</div>
    ${!supported ? `<p class="small" style="color:var(--bad)">この端末・ブラウザは読み上げに対応していません。</p>` : ""}
    ${t ? `<div class="ls-now"><span class="small muted num">${(LS.i % LS.list.length)+1} / ${LS.list.length}</span><b>${t.t}</b><span>${t.d}</span></div>` : `<p>この種類の用語はありません。</p>`}
    <div class="ls-ctrl">
      <button type="button" class="btn" id="lsPrev" aria-label="前の用語">⏮</button>
      <button type="button" class="btn primary" id="lsPlay">${LS.playing ? "一時停止" : "再生"}</button>
      <button type="button" class="btn" id="lsNext" aria-label="次の用語">⏭</button>
    </div>
    <div class="setrow"><span>速さ</span><div class="chips">${[[0.8,"ゆっくり"],[1,"ふつう"],[1.3,"速め"]].map(([r,l])=>`<button type="button" class="chipbtn" data-r="${r}" aria-pressed="${LS.rate===r}">${l}</button>`).join("")}</div></div>
    <p class="small muted">画面を消すと止まる端末があります。止まったら再生を押し直してね。</p>`;
  const play = () => {
    if(!LS.list.length) return;
    const t = LS.list[LS.i % LS.list.length];
    speak(`${plain(t.t)}。${plain(t.d)}。見分け方。${plain(t.k)}`, () => {
      if(!LS.playing) return;
      setTimeout(() => { if(!LS.playing) return; LS.i++; if(location.hash === "#listen") render(); play(); }, 900);
    });
  };
  p.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { LS.mode = b.dataset.m; LS.list = listenList(); LS.i = 0; LS.playing = false; try { speechSynthesis.cancel(); } catch(e){} render(); });
  p.querySelectorAll("[data-r]").forEach(b => b.onclick = () => { LS.rate = +b.dataset.r; render(); });
  $("#lsPlay").onclick = () => { if(!supported) return; LS.playing = !LS.playing; if(LS.playing) play(); else try { speechSynthesis.cancel(); } catch(e){} render(); };
  $("#lsNext").onclick = () => { LS.i++; if(LS.playing) play(); render(); };
  $("#lsPrev").onclick = () => { LS.i = Math.max(0, LS.i-1); if(LS.playing) play(); render(); };
}

/* ---------- 計算メモ（手書き） ---------- */
const MEMO_ROUTES = ["drill","practice","mock","test","lesson-","review"];
let memoOpen = false;
function setupMemo(){
  const fab = document.createElement("button");
  fab.type = "button"; fab.id = "memoFab"; fab.className = "memo-fab"; fab.innerHTML = "✎<span>メモ</span>";
  fab.setAttribute("aria-label", "計算メモを開く");
  document.body.appendChild(fab);
  const ov = document.createElement("div");
  ov.id = "memoOv"; ov.className = "memo-ov"; ov.hidden = true;
  ov.innerHTML = `<div class="memo-bar"><b>計算メモ</b><div class="chips"><button type="button" class="chipbtn" data-tool="pen" aria-pressed="true">ペン</button><button type="button" class="chipbtn" data-tool="eraser" aria-pressed="false">消しゴム</button><button type="button" class="chipbtn" id="memoClear">全部消す</button></div><button type="button" class="btn primary" id="memoClose">閉じる</button></div><canvas id="memoCv" aria-label="手書きメモ"></canvas>`;
  document.body.appendChild(ov);
  const cv = ov.querySelector("#memoCv"), ctx = cv.getContext && cv.getContext("2d");
  if(!ctx){ fab.remove(); ov.remove(); return; }
  let tool = "pen", drawing = false, last = null, snapshot = null;
  const size = () => {
    const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    if(cv.width) snapshot = cv.toDataURL();
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if(snapshot){ const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, r.width, r.height); im.src = snapshot; }
  };
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener("pointerdown", e => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", e => {
    if(!drawing) return;
    const p = pos(e);
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#18233b";
    ctx.lineWidth = tool === "eraser" ? 24 : 2.6; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
    last = p;
  });
  ["pointerup","pointercancel","pointerleave"].forEach(ev => cv.addEventListener(ev, () => drawing = false));
  ov.querySelectorAll("[data-tool]").forEach(b => b.onclick = () => { tool = b.dataset.tool; ov.querySelectorAll("[data-tool]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); });
  ov.querySelector("#memoClear").onclick = () => { const r = cv.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height); snapshot = null; };
  const close = () => { memoOpen = false; ov.hidden = true; fab.focus(); };
  ov.querySelector("#memoClose").onclick = close;
  fab.onclick = () => { memoOpen = true; ov.hidden = false; requestAnimationFrame(size); };
  window.addEventListener("resize", () => { if(memoOpen) size(); });
}
function updateMemoFab(){
  const v = (location.hash || "#home").slice(1), fab = $("#memoFab");
  if(fab) fab.hidden = !MEMO_ROUTES.some(r => v === r || (r.endsWith("-") && v.startsWith(r)));
}

/* ---------- 画面に組み込む ---------- */
const homeBase2 = ROUTES.home;
ROUTES.home = function(){
  homeBase2();
  const anchor = app.querySelector(".mocklink");
  anchor.before(dailyPanel());
  anchor.insertAdjacentHTML("afterend", `<button type="button" class="termlink cardslink" data-go3="#cards"><span class="ic">札</span><span><b>単語カード・聞き流し</b><br><span class="small">めくって覚える／音声で聞いて覚える</span></span><span class="go">開く</span></button>`);
  app.querySelectorAll("[data-go3]").forEach(b => b.onclick = () => go(b.dataset.go3));
};
const lessonsBase2 = ROUTES.lessons;
ROUTES.lessons = function(){
  lessonsBase2();
  app.querySelector(".pagehead").insertAdjacentHTML("afterend", `<button type="button" class="termlink cardslink" id="toCards"><span class="ic">札</span><span><b>単語カード・聞き流し</b><br><span class="small">用語をめくって覚える／音声で聞く</span></span><span class="go">開く</span></button>`);
  $("#toCards").onclick = () => go("#cards");
};
const nbBase = ROUTES.notebook;
ROUTES.notebook = function(){
  nbBase();
  const ids = Object.keys(S.bm || {});
  const qs = ids.filter(id => !id.startsWith("t:")).map(questionById).filter(Boolean);
  const ts = ids.filter(id => id.startsWith("t:")).map(id => TERMS.find(t => "t:" + t.t === id)).filter(Boolean);
  const p = document.createElement("section");
  p.className = "panel";
  p.innerHTML = `<div class="row between"><h2>ブックマーク</h2><span class="pill num">問題 ${qs.length}・用語 ${ts.length}</span></div>
    ${!qs.length && !ts.length ? `<p class="small muted">問題や用語の「☆ あとで見る」を押すと、ここに集まります。</p>` : ""}
    ${ts.length ? `<div class="bm-terms">${ts.map(t=>`<span class="bm-chip">${esc(t.t)}</span>`).join("")}</div>` : ""}`;
  if(qs.length){ const b = document.createElement("button"); b.type="button"; b.className="btn primary wide"; b.textContent=`ブックマークした問題を解く（${Math.min(10, qs.length)}問）`; b.onclick=()=>startSet(qs.slice(0,10)); p.appendChild(b); }
  if(ts.length){ const b = document.createElement("button"); b.type="button"; b.className="btn wide"; b.textContent="ブックマークした用語を単語カードで"; b.onclick=()=>{ FC = {deck: shuffle(ts), i:0, flip:false, known:0, mode:"bm"}; go("#cards"); }; p.appendChild(b); }
  app.appendChild(p);
};
const termsBase = ROUTES.terms;
ROUTES.terms = function(){
  termsBase();
  app.querySelector(".pagehead").insertAdjacentHTML("afterend", `<button type="button" class="termlink cardslink" id="toCards2"><span class="ic">札</span><span><b>単語カードで覚える</b><br><span class="small">めくって確認／音声で聞き流し</span></span><span class="go">開く</span></button>`);
  $("#toCards2").onclick = () => go("#cards");
};
ROUTES.cards = renderCards;
ROUTES.listen = renderListen;

const renderBase3 = render;
render = function(){
  if((location.hash || "") !== "#listen" && LS.playing){ LS.playing = false; try { speechSynthesis.cancel(); } catch(e){} }
  renderBase3();
  updateMemoFab();
  const v = (location.hash || "#home").slice(1);
  if(v === "cards" || v === "listen"){
    document.querySelectorAll(".tabs button").forEach(b => { if(b.dataset.tab === "lessons") b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current"); });
  }
};
window.removeEventListener("hashchange", renderBase3);
window.addEventListener("hashchange", render);
setupMemo();
render();
