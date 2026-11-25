/* 科目A 見て解いて覚える：学習アプリ本体
   設計の柱
   1. 予想してから学ぶ（事前テスト効果）：レッスンは「勘で答える → 解説」の順
   2. 間違いは間隔をあけて再出題（復習ボックス：当日 → 1日後 → 3日後で卒業）
   3. 計算は数字が毎回変わるドリル。誤答の選択肢は典型的なミスから作る
   4. 似た用語は1分間の仕分けゲームで、速く・何度も区別する
   5. 今日のミッション・連続日数・レベル・バッジで「今日もやる理由」を作る */

const STORE = "fe-kamokuA-public-v1";

/* ---------- 保存 ---------- */
const blank = () => ({terms:{}, xp:0, cards:{}, review:{}, days:{}, badges:{}, best:{game:0, test:0}, drillOk:0, reviewOk:0, maxCombo:0, timer:{start:null}, minutes:{}});
function normalizeRecord(raw, requireXP=false){
  const map = x => x !== null && typeof x === "object" && !Array.isArray(x);
  const number = x => typeof x === "number" && Number.isFinite(x) && x >= 0;
  if(!map(raw) || (requireXP && !Object.hasOwn(raw,"xp"))) throw new Error("bad record");
  const out = {...blank(), ...raw};
  for(const key of ["terms","cards","review","days","badges","best","timer","minutes","log","bm","daily","ui","practice"]){
    if(out[key] !== undefined && !map(out[key])) throw new Error("bad " + key);
  }
  for(const key of ["xp","drillOk","reviewOk","maxCombo","savedAt"]){
    if(out[key] !== undefined && !number(out[key])) throw new Error("bad " + key);
  }
  out.best = {game:0, test:0, ...out.best};
  if(!number(out.best.game) || !number(out.best.test)) throw new Error("bad best");
  out.timer = {start:null, ...out.timer};
  if(out.timer.start !== null && !number(out.timer.start)) throw new Error("bad timer");
  for(const card of Object.values(out.cards)){
    if(!map(card) || ["seen","ok","read"].some(k => card[k] !== undefined && typeof card[k] !== "boolean")) throw new Error("bad card");
  }
  const validCardKey = k => /^\d+$/.test(k) && Number(k) < CARDS.length;
  if(!Object.keys(out.cards).every(validCardKey) || !Object.keys(out.review).every(validCardKey)) throw new Error("bad card id");
  for(const review of Object.values(out.review)){
    if(!map(review) || ![1,2,3].includes(review.lv) || typeof review.due !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(review.due) || !Number.isFinite(Date.parse(review.due))) throw new Error("bad review");
  }
  for(const day of Object.values(out.days)){
    if(!map(day) || ["lesson","drill","game","review","practice"].some(k => day[k] !== undefined && !number(day[k]))) throw new Error("bad day");
  }
  if(Object.values(out.minutes).some(x => !number(x))) throw new Error("bad minutes");
  if(out.log && Object.values(out.log).some(x => !map(x) || !number(x.n) || !number(x.ok) || ![0,1].includes(x.last))) throw new Error("bad log");
  if(out.practice){
    out.practice = {done:0, ok:0, best:{}, ...out.practice};
    if(!number(out.practice.done) || !number(out.practice.ok) || !map(out.practice.best)) throw new Error("bad practice");
  }
  const validQuestion = q => map(q) && typeof q.q === "string" && Array.isArray(q.opts) && q.opts.length >= 2 && q.opts.length <= 4 && q.opts.every(x => typeof x === "string") && Number.isInteger(q.a) && q.a >= 0 && q.a < q.opts.length && SECTIONS.some(s => s.id === q.sec);
  for(const key of ["mockCur","mockLast"]){
    const m = out[key]; if(m === undefined || m === null) continue;
    if(!map(m) || !Array.isArray(m.list) || !m.list.length || m.list.length > 60 || !m.list.every(validQuestion) || !Array.isArray(m.ans) || m.ans.length !== m.list.length || !m.ans.every((a,i) => a === null || (Number.isInteger(a) && a >= 0 && a < m.list[i].opts.length))) throw new Error("bad mock");
    if(key === "mockCur" && (!Array.isArray(m.flag) || m.flag.length !== m.list.length || !m.flag.every(x => typeof x === "boolean") || !Number.isInteger(m.i) || m.i < 0 || m.i >= m.list.length || !number(m.used))) throw new Error("bad mock progress");
    if(key === "mockLast" && (!map(m.byF) || !map(m.bySec) || !number(m.score) || !number(m.right) || !number(m.total) || !number(m.min))) throw new Error("bad mock result");
  }
  if(out.mocks !== undefined && (!Array.isArray(out.mocks) || !out.mocks.every(m => map(m) && number(m.score) && number(m.min) && typeof m.date === "string"))) throw new Error("bad mock history");
  return out;
}
/* 記録はスマホ（ブラウザ）の中に保存する。localStorage と IndexedDB の2か所に書いて、片方が消えても戻せるようにする */
let S;
let storageReady = false;
const IDB = {
  db: null,
  open(){ return new Promise(res => { try { const r = indexedDB.open("kamokuA", 1); r.onupgradeneeded = () => r.result.createObjectStore("kv"); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => res(null); } catch(e){ res(null); } }); },
  async get(){ const db = this.db || await this.open(); if(!db) return null; return new Promise(res => { try { const q = db.transaction("kv").objectStore("kv").get(STORE); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); } catch(e){ res(null); } }); },
  async set(v){ const db = this.db || await this.open(); if(!db) return; try { db.transaction("kv","readwrite").objectStore("kv").put(v, STORE); } catch(e){} }
};
let lastSaved = null;
try { S = normalizeRecord(JSON.parse(localStorage.getItem(STORE) || "{}")); } catch(e){ S = blank(); }
function save(){
  if(!storageReady) return;
  S.savedAt = Date.now();
  const txt = JSON.stringify(S);
  try { localStorage.setItem(STORE, txt); } catch(e){}
  IDB.set(txt);
  lastSaved = new Date();
}
/* 起動時：localStorage が空で IndexedDB に記録が残っていれば戻す（新しいほうを使う） */
async function restoreFromIDB(){
  const txt = await IDB.get();
  if(!txt) return false;
  try {
    const d = normalizeRecord(JSON.parse(txt), true);
    if((d.savedAt || 0) > (S.savedAt || 0)){ S = d; try { localStorage.setItem(STORE, JSON.stringify(S)); } catch(e){} return true; }
  } catch(e){}
  return false;
}
/* ブラウザに「この記録を勝手に消さないで」と頼む（対応している端末のみ） */
async function askPersist(){
  try { if(navigator.storage && navigator.storage.persist) return await navigator.storage.persist(); } catch(e){}
  return false;
}
document.addEventListener("visibilitychange", () => { if(document.visibilityState === "hidden") save(); });
window.addEventListener("pagehide", save);

/* ---------- 小道具 ---------- */
const $ = s => document.querySelector(s);
const app = $("#app");
const pad = n => String(n).padStart(2, "0");
const dstr = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today = () => dstr(new Date());
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate()+n); return dstr(d); };
const day = () => (S.days[today()] ||= {lesson:0, drill:0, game:0, review:0});
const pick = a => a[Math.floor(Math.random()*a.length)];
const rint = (a,b) => a + Math.floor(Math.random()*(b-a+1));
const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const r = (n, d=4) => Math.round(n * 10**d) / 10**d;
const fmt = n => typeof n === "number" ? (Number.isInteger(n) ? n.toLocaleString("ja-JP") : String(r(n))) : n;
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const searchKey = s => String(s).normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function toast(msg){
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2700);
}

/* ---------- 分野の色と略称 ---------- */
const COLORS = {basic:"#7a55e0", hw:"#2b62cf", sys:"#16919f", db:"#2b9457", nw:"#1680c4", sec:"#d0405a", dev:"#dd7a12", mgmt:"#a8771c", sysst:"#b23c96", st:"#4f8a2e"};
const ABBR = {basic:"基礎", hw:"HW", sys:"構成", db:"DB", nw:"NW", sec:"鍵", dev:"開発", mgmt:"PM", sysst:"戦略", st:"経営"};
const secOf = id => SECTIONS.find(s => s.id === id);

/* ---------- マスコット「ビット」 ---------- */
function mascot(mood="normal", extra=""){
  const eyes = mood === "happy"
    ? `<path d="M21 29 q4 -5 8 0 M35 29 q4 -5 8 0" class="ant" fill="none" stroke-linecap="round" style="stroke:#18233b"/>`
    : mood === "sad"
    ? `<circle class="eye" cx="25" cy="30" r="3"/><circle class="eye" cx="39" cy="30" r="3"/><path d="M20 23 l8 2 M44 23 l-8 2" style="stroke:#18233b;stroke-width:2;stroke-linecap:round"/>`
    : `<circle class="eye" cx="25" cy="29" r="3.4"/><circle class="eye" cx="39" cy="29" r="3.4"/><circle cx="26.2" cy="27.8" r="1.1" fill="#fff"/><circle cx="40.2" cy="27.8" r="1.1" fill="#fff"/>`;
  const mouth = mood === "happy" ? `<path d="M26 35 q6 6 12 0" style="fill:#ff7b8f;stroke:#18233b;stroke-width:2;stroke-linejoin:round"/>`
    : mood === "sad" ? `<path d="M27 38 q5 -4 10 0" style="fill:none;stroke:#18233b;stroke-width:2;stroke-linecap:round"/>`
    : `<path d="M28 36 q4 3 8 0" style="fill:none;stroke:#18233b;stroke-width:2;stroke-linecap:round"/>`;
  return `<svg class="mascot ${extra}" viewBox="0 0 64 70" role="img" aria-label="マスコットのビット">
    <line class="ant" x1="32" y1="11" x2="32" y2="4"/><circle class="bulb" cx="32" cy="4" r="3.5"/>
    <rect class="body" x="9" y="11" width="46" height="38" rx="15"/>
    <rect class="face" x="15" y="18" width="34" height="24" rx="9"/>
    ${eyes}<circle class="cheek" cx="20" cy="36" r="2.6"/><circle class="cheek" cx="44" cy="36" r="2.6"/>${mouth}
    <rect class="body" x="21" y="51" width="22" height="12" rx="5" style="filter:brightness(.85)"/>
    <text x="32" y="60.5" text-anchor="middle" style="font-family:var(--font-display);font-size:7px;fill:#fff">01</text>
    <rect class="body" x="20" y="64" width="8" height="5" rx="2"/><rect class="body" x="36" y="64" width="8" height="5" rx="2"/>
  </svg>`;
}

/* ---------- 正解の演出 ---------- */
const SPARK_COLORS = ["#ffcf33","#16865a","#2b62cf","#d0405a","#dd7a12","#b23c96"];
function burst(el, n=14){
  if(reduceMotion() || !el) return;
  const r0 = el.getBoundingClientRect(), cx = r0.left + r0.width/2, cy = r0.top + r0.height/2;
  for(let i=0;i<n;i++){
    const s = document.createElement("i");
    s.className = "spark";
    const ang = Math.random()*Math.PI*2, dist = 50 + Math.random()*70;
    s.style.cssText = `left:${cx}px;top:${cy}px;background:${pick(SPARK_COLORS)};--dx:${Math.cos(ang)*dist}px;--dy:${Math.sin(ang)*dist}px`;
    document.body.appendChild(s);
    setTimeout(()=>s.remove(), 800);
  }
}
function floatXP(el, n){
  if(reduceMotion() || !el || !n) return;
  const r0 = el.getBoundingClientRect(), f = document.createElement("span");
  f.className = "floatxp"; f.textContent = `+${n}XP`;
  f.style.cssText = `left:${r0.right - 70}px;top:${r0.top - 6}px`;
  document.body.appendChild(f);
  setTimeout(()=>f.remove(), 950);
}
function confetti(){
  if(reduceMotion()) return;
  for(let k=0;k<5;k++) setTimeout(()=>{
    const fake = {getBoundingClientRect:()=>({left:Math.random()*innerWidth, top:innerHeight*0.25 + Math.random()*innerHeight*0.3, width:0, height:0})};
    burst(fake, 18);
  }, k*140);
}

/* ---------- レベル・XP・連続日数 ---------- */
const TITLES = ["IT見習い","用語ハンター","計算ルーキー","過去問ファイター","合格チャレンジャー","合格ライン到達","科目Aマスター"];
const level = () => Math.floor(S.xp / 100) + 1;
const title = () => TITLES[Math.min(TITLES.length-1, Math.floor((level()-1)/2))];
function gainXP(n){
  const before = level();
  S.xp += n;
  markActive();
  if(level() > before) toast(`レベルアップ！ Lv.${level()}「${title()}」`);
  save();
  checkBadges();
}
function markActive(){ day().active = true; }
function activeOn(k){
  const d = S.days[k];
  return !!(d?.active || ["lesson","drill","game","review","practice"].some(key => Number(d?.[key]) > 0) || Number(S.minutes?.[k]) > 0);
}
function streak(){
  let n = 0;
  const d = new Date();
  if(!activeOn(dstr(d))) d.setDate(d.getDate()-1);   // 今日まだなら昨日から数える
  while(activeOn(dstr(d))){ n++; d.setDate(d.getDate()-1); }
  return n;
}

/* ---------- カードの理解度 ---------- */
const learned = i => !!(S.cards[i] && S.cards[i].ok);
function secStats(id){
  const idx = CARDS.map((c,i)=>i).filter(i => CARDS[i].sec === id).sort((x,y) => (CARDS[x].ord ?? 100) - (CARDS[y].ord ?? 100) || x - y);
  return {idx, total: idx.length, done: idx.filter(learned).length};
}

/* ---------- 復習ボックス（間隔反復） ---------- */
const GAPS = [0, 0, 1, 3];   // レベル1は当日、2は1日後、3は3日後。レベル3で正解すれば卒業
function toReview(i){ S.review[i] = {lv:1, due: today()}; }
const dueList = () => Object.keys(S.review).map(Number).filter(i => S.review[i].due <= today());
function updateBadge(){
  const n = dueList().length, el = $("#reviewCnt");
  el.hidden = n === 0; el.textContent = n;
}

/* ---------- 今日のミッション ---------- */
function missions(){
  const d = S.days[today()] || {lesson:0, drill:0, game:0, review:0};
  const due = dueList().length;
  return [
    {key:"lesson", label:"レッスンで3枚学ぶ", now:Math.min(d.lesson,3), goal:3, go:"#lessons"},
    {key:"drill", label:"計算ドリルで5問正解する", now:Math.min(d.drill,5), goal:5, go:"#drill"},
    {key:"game", label:"仕分けゲームを1回遊ぶ", now:Math.min(d.game,1), goal:1, go:"#game"},
    {key:"review", label: due ? `復習ボックスを空にする（あと${due}問）` : (d.review ? "復習ボックスを空にする" : "復習ボックスを空にする（今日の分はなし）"), now: due ? 0 : 1, goal:1, go:"#review"}
  ].map(m => ({...m, done: m.now >= m.goal}));
}
let missionWasDone = false;
function checkMissions(){
  const all = missions().every(m => m.done);
  const flag = S.days[today()] && S.days[today()].allDone;
  if(all && !flag && S.days[today()]){
    S.days[today()].allDone = true;
    S.xp += 30; save();
    toast("今日のミッションをすべて達成！ ボーナス +30XP"); setTimeout(confetti, 100);
  }
}

/* ---------- バッジ ---------- */
const BADGES = [
  {id:"first", mark:"1", m:"#2b62cf", name:"はじめの一歩", test:()=>Object.keys(S.cards).length >= 1},
  {id:"streak3", mark:"3日", m:"#dd7a12", name:"3日連続", test:()=>streak() >= 3},
  {id:"calc10", mark:"10", m:"#c75f12", name:"計算10問正解", test:()=>S.drillOk >= 10},
  {id:"half", mark:"5", m:"#b23c96", name:"5ステージクリア", test:()=>SECTIONS.filter(s=>{ const t = secStats(s.id); return t.done === t.total; }).length >= 5},
  {id:"combo10", mark:"×10", m:"#d0405a", name:"10コンボ", test:()=>S.maxCombo >= 10},
  {id:"review10", mark:"復", m:"#16919f", name:"復習10問正解", test:()=>S.reviewOk >= 10},
  {id:"pass", mark:"8/10", m:"#2b9457", name:"ボス戦で合格ライン", test:()=>S.best.test >= 8},
  {id:"all", mark:"全", m:"#a8771c", name:"全カード理解", test:()=>CARDS.every((c,i)=>learned(i))},
  {id:"terms30", mark:"語", m:"#0d7c66", name:"用語を30語覚えた", test:()=>Object.keys(S.terms||{}).length >= 30}
];
function checkBadges(){
  BADGES.forEach(b => {
    if(!S.badges[b.id] && b.test()){ S.badges[b.id] = today(); save(); toast(`バッジ獲得「${b.name}」`); }
  });
}

/* ---------- 勉強タイマー ---------- */
function timerMs(){ return S.timer.start ? Date.now() - S.timer.start : 0; }
function minutesToday(){ return (S.minutes[today()] || 0) + Math.floor(timerMs()/60000); }
function minutesTotal(){ return Object.values(S.minutes).reduce((a,b)=>a+b,0) + Math.floor(timerMs()/60000); }
function toggleTimer(){
  if(S.timer.start){
    const m = Math.floor(timerMs()/60000);
    S.minutes[today()] = (S.minutes[today()] || 0) + m;
    S.timer.start = null;
    if(m > 0) toast(`${m}分の勉強を記録しました`);
  } else {
    S.timer.start = Date.now();
  }
  save(); render();
}
const hm = m => `${Math.floor(m/60)}時間${pad(m%60)}分`;

/* ---------- 説明パーツ（data.js のカードを描く） ---------- */
function explainHTML(c, gl = glosser()){
  let h = `<p class="point">${gl(c.point)}</p>`;
  if(c.svg) h += `<figure>${SVG[c.svg]}</figure>`;
  if(c.analogy) h += `<p class="analogy"><span class="lbl">たとえると</span>${gl(c.analogy)}</p>`;
  if(c.formula) h += `<div class="formula">${gl(c.formula)}</div>`;
  if(c.compare) h += `<div class="compare">${c.compare.map(([a,b])=>`<div><b>${gl(a)}</b><span>${gl(b)}</span></div>`).join("")}</div>`;
  return h;
}
function stepper(steps, label, gl = glosser()){
  const box = document.createElement("div");
  box.className = "steps";
  box.innerHTML = `${steps.ex ? `<p><b>${gl(steps.ex)}</b></p>` : ""}<ol>${steps.list.map((t,i)=>`<li${i>0?" hidden":""}>${gl(t)}</li>`).join("")}</ol>`;
  const n = steps.list.length;
  if(n > 1){
    const b = document.createElement("button");
    b.type = "button"; b.className = "btn";
    let shown = 1;
    const set = () => { b.textContent = shown < n ? `${label || "次のステップを見る"}（${shown}/${n}）` : "全部のステップを表示中"; b.disabled = shown >= n; };
    set();
    b.onclick = () => { box.querySelectorAll("li")[shown].hidden = false; shown++; set(); };
    box.appendChild(b);
  }
  return box;
}

/* 選択式クイズ。onAnswer(ok, i) を返す */
function quiz(q, opts, ans, onAnswer, expHTML, previousChoice){
  const box = document.createElement("div");
  box.style.cssText = "display:flex;flex-direction:column;gap:10px";
  box.innerHTML = `<p class="q">${q}</p><div class="opts"></div><div class="fb" hidden></div>`;
  const wrap = box.querySelector(".opts"), fb = box.querySelector(".fb");
  let answered = false;
  const replay = Number.isInteger(previousChoice) && previousChoice >= 0 && previousChoice < opts.length;
  opts.forEach((t,i)=>{
    const b = document.createElement("button");
    b.type = "button"; b.className = "opt"; b.innerHTML = t;
    b.onclick = () => {
      if(answered) return;
      answered = true;
      wrap.querySelectorAll("button").forEach((x,j)=>{ x.disabled = true; if(j===ans) x.classList.add("ok"); });
      const ok = i === ans;
      if(!ok) b.classList.add("ng");
      fb.hidden = false;
      fb.className = "fb " + (ok ? "ok" : "ng");
      const extra = replay ? "" : onAnswer(ok, i) || "";
      const cheer = ok ? pick(["正解！","やったね！","その調子！","完ぺき！"]) : pick(["おしい！","ドンマイ！","ここで覚えよう！"]);
      fb.innerHTML = `${mascot(ok ? "happy" : "sad")}<div><strong>${cheer}${ok ? "" : ` 正解は「${opts[ans]}」`}</strong>${expHTML || ""}${extra}</div>`;
      if(ok && !replay) burst(b);
    };
    wrap.appendChild(b);
  });
  if(replay) wrap.querySelectorAll("button")[previousChoice].click();
  return box;
}

/* =========================================================
   画面
   ========================================================= */
let tick = null;
function clearTick(){ if(tick){ clearInterval(tick); tick = null; } }

const ROUTES = {home:renderHome, lessons:renderLessons, drill:renderDrill, game:renderGame, review:renderReview, test:renderTest, terms:renderTerms, guide:renderGuide, practice:renderPractice};
function render(){
  if(!storageReady){ app.innerHTML = '<section class="panel" role="status">学習記録を読み込んでいます…</section>'; return; }
  clearTick();
  let v = (location.hash || "#home").slice(1);
  let fn = ROUTES[v];
  if(v.startsWith("lesson-")) fn = () => renderLesson(v.slice(7));
  if(!fn){ v = "home"; fn = renderHome; }
  const tab = (v.startsWith("lesson-") || v === "terms" || v === "glossary" || v === "practice" || v === "notebook") ? "lessons" : (v === "test" || v === "guide" || v === "mock" || v === "mock-result") ? "home" : v;
  document.querySelectorAll(".tabs button").forEach(b => { if(b.dataset.tab === tab) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current"); });
  app.innerHTML = "";
  app.style.removeProperty("--sec");
  fn();
  updateBadge();
  window.scrollTo(0,0);
}
const go = h => { if(location.hash === h) render(); else location.hash = h; };
window.addEventListener("hashchange", render);
document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => go("#" + b.dataset.tab));

/* ---------- ホーム ---------- */
function roadOrder(){ return SECTIONS.slice(); }
function currentSec(){ return roadOrder().find(s => { const t = secStats(s.id); return t.done < t.total; }); }
function nextStep(){
  const due = dueList().length;
  if(due) return {btn:`復習${due}問から始める`, go:"#review"};
  const s = currentSec();
  if(s) return {btn:`「${s.title}」に進む`, go:"#lesson-" + s.id};
  return {btn:"ボス戦に挑む", go:"#test"};
}
function bitSays(){
  const due = dueList().length, st = streak(), ms = missions(), s = currentSec();
  const h = new Date().getHours();
  if(ms.every(m=>m.done)) return {mood:"happy", text:"今日のミッションぜんぶ達成！ えらい！ 仕分けゲームで自己ベストも狙ってみる？"};
  if(due) return {mood:"normal", text:`復習ボックスに${due}問たまってるよ。忘れかけた今がいちばん覚えどき！`};
  if(st >= 2) return {mood:"happy", text:`${st}日連続！ この調子で、次は「${s ? s.title : "ボス戦"}」に行こう。`};
  if(s) return {mood:"normal", text:`${h < 11 ? "おはよう！" : h < 18 ? "こんにちは！" : "おつかれさま！"} 次のステージは「${s.title}」。予想して、解説を読んで、覚えよう！`};
  return {mood:"happy", text:"全ステージクリア！ ボス戦で仕上げよう。"};
}
function roadHTML(){
  const order = roadOrder(), cur = currentSec();
  const GAP = 112, TOP = 54, H = TOP + order.length*GAP + 70;
  const pts = order.map((s,i)=>({x: 50 + Math.sin(i*1.15 + 0.4)*26, y: TOP + i*GAP}));
  const goal = {x:50, y: TOP + order.length*GAP + 4};
  const all = [...pts, goal];
  let d = `M${all[0].x} ${all[0].y}`;
  let dDone = "";
  for(let i=1;i<all.length;i++){
    const a = all[i-1], b = all[i], my = (a.y+b.y)/2;
    const seg = ` C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
    d += seg;
    const t = i-1 < order.length ? secStats(order[i-1].id) : null;
    if(t && t.done === t.total) dDone += `M${a.x} ${a.y}` + seg;
  }
  const nodes = order.map((s,i)=>{
    const t = secStats(s.id), p = t.done/t.total*100, done = t.done === t.total, now = cur && cur.id === s.id;
    const {x,y} = pts[i], right = x < 50;
    const lab = `<div class="nlabel" style="top:${y}px;${right ? `left:calc(${x}% + 44px)` : `right:calc(${100-x}% + 44px);text-align:right`}"><b>${s.title}</b><span class="muted">理解 ${t.done}/${t.total}</span></div>`;
    return `<button type="button" class="node ${now?"now":""} ${t.done===0?"lock":""}" data-go="#lesson-${s.id}" aria-label="${s.title}、理解 ${t.done}/${t.total}" style="left:${x}%;top:${y}px;--c:${COLORS[s.id]};--p:${p}%">${now?'<span class="next">NEXT</span>':""}<span class="in">${ABBR[s.id]}</span>${done?'<span class="done-mark">✓</span>':""}</button>${lab}`;
  }).join("");
  const flag = `<svg class="flag" viewBox="0 0 72 56" aria-hidden="true"><line x1="14" y1="4" x2="14" y2="54" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><path d="M15 5 h40 l-8 10 l8 10 h-40z" fill="var(--bad)"/><text x="33" y="19" text-anchor="middle" style="font-family:var(--font-display);font-size:10px;fill:#fff">GOAL</text></svg>`;
  return `<div class="road" style="height:${H}px">
    <svg class="path" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" vector-effect="non-scaling-stroke"/>${dDone?`<path class="done" d="${dDone}" vector-effect="non-scaling-stroke"/>`:""}</svg>
    ${nodes}
    <div class="goal" style="left:${goal.x}%;top:${goal.y + 30}px">${flag}科目A 合格！</div>
  </div>`;
}
function renderHome(){
  checkMissions();
  const st = streak(), ms = missions(), ns = nextStep(), say = bitSays();
  const cardsDone = CARDS.filter((c,i)=>learned(i)).length;
  const xpIn = S.xp % 100, doneCnt = ms.filter(m=>m.done).length;
  app.innerHTML = `
  <div class="hero">${mascot(say.mood, "bob")}<div class="bubble">${say.text}</div></div>
  <button type="button" class="btn primary wide" id="nextBtn">${ns.btn}</button>

  <div class="stats">
    <div class="stat"><span class="v num">${cardsDone}<small>/${CARDS.length}</small></span><span class="k">理解したカード</span></div>
    <div class="stat"><span class="v num">${st}<small>日</small></span><span class="k">連続学習</span></div>
    <div class="stat"><span class="ring" style="--p:${xpIn}%"><span>${level()}</span></span><span class="k">${title()}</span></div>
  </div>

  <section class="road-wrap" aria-label="合格への道">
    <div class="row between" style="padding:0 4px 4px"><h2>合格への道</h2><span class="small muted">基礎から順に攻略</span></div>
    ${roadHTML()}
  </section>

  <button type="button" class="termlink practicelink" data-go="#practice"><span class="ic">問</span><span><b>問題演習</b><br><span class="small">分野を選んで10問ずつ・過去問風＋用語クイズ</span></span><span class="go">解く</span></button>
  <button type="button" class="termlink guidelink" data-go="#guide"><span class="ic">攻</span><span><b>科目A攻略ガイド</b><br><span class="small">時間配分・選択肢の消し方・計算の型・直前チェック</span></span><span class="go">開く</span></button>
  <button type="button" class="termlink" data-go="#terms"><span class="ic">図</span><span><b>用語ずかん</b><br><span class="small">覚えた ${Object.keys(S.terms||{}).length} / ${TERMS.length}語・★★★とNEWを優先</span></span><span class="go">開く</span></button>

  <section class="panel" aria-label="今日のミッション">
    <div class="row between"><h2>今日のミッション</h2><span class="pill ${doneCnt===ms.length?"good":""} num">${doneCnt} / ${ms.length}</span></div>
    <div class="bar"><i style="width:${doneCnt/ms.length*100}%;background:var(--good)"></i></div>
    <div class="mission">${ms.map(m=>`<button type="button" class="m ${m.done?"done":""}" data-go="${m.go}"><span class="chk">${m.done?"✓":""}</span><span class="lbl">${m.label}</span><span class="small muted num">${m.goal>1?`${m.now}/${m.goal}`:""}</span></button>`).join("")}</div>
    <p class="small muted">全部そろうとボーナス +30XP。1時間なら「復習5分 → レッスン30分 → 計算ドリル15分 → ゲーム5分」が目安。</p>
  </section>

  <section class="panel" aria-label="勉強タイマー">
    <h2>勉強タイマー</h2>
    <div class="timer">
      <span class="clock" id="clock">00:00:00</span>
      <button type="button" class="btn ${S.timer.start ? "" : "primary"}" id="timerBtn">${S.timer.start ? "ストップして記録" : "スタート"}</button>
    </div>
    <p class="small muted">今日 <b class="num">${hm(minutesToday())}</b>　累計 <b class="num">${hm(minutesTotal())}</b></p>
  </section>

  <section class="panel" aria-label="ボス戦" style="--sec:var(--bad)">
    <div class="row between"><h2>ボス戦：総まとめテスト</h2>${S.best.test ? `<span class="pill bad num">最高 ${S.best.test}/10</span>` : ""}</div>
    <p>全分野からランダムに10問。ライフは3つ、8問以上で合格ライン。</p>
    <button type="button" class="btn wide" data-go="#test">挑戦する</button>
  </section>

  <section class="panel" aria-label="バッジ">
    <div class="row between"><h2>バッジ</h2><span class="small muted num">${Object.keys(S.badges).length} / ${BADGES.length}</span></div>
    <div class="badges">${BADGES.map(b=>`<div class="badge ${S.badges[b.id]?"on":""}" style="--m:${b.m}"><span class="b">${b.mark}</span>${b.name}</div>`).join("")}</div>
  </section>

  <section class="panel" aria-label="記録の保存">
    <div class="row between"><h2>記録の保存</h2><span class="pill good" id="saveState">このスマホに保存中</span></div>
    <p class="small">答えた問題・レベル・用語のチェックなどは、自動でこのスマホの中に保存されます。アカウント登録はいりません。</p>
    <ul class="small muted" style="margin:0;padding-left:1.2em">
      <li>ホーム画面に追加して使うと、記録が消えにくくなります</li>
      <li>機種変更やブラウザのデータ削除の前は、下のバックアップを取っておいてください</li>
    </ul>
    <div class="bkbtns">
      <button type="button" class="btn" id="bkSave">バックアップを保存</button>
      <button type="button" class="btn" id="bkLoad">バックアップから戻す</button>
    </div>
    <details class="small"><summary style="cursor:pointer;font-weight:700;color:var(--accent)">ファイルが使えないとき（コピーで移す）</summary>
      <div style="display:grid;gap:8px;margin-top:8px">
        <button type="button" class="btn" id="bkCopy">記録をコードでコピー</button>
        <textarea id="bkCode" class="search" rows="3" placeholder="別のスマホでコピーしたコードをここに貼り付け" aria-label="記録のコード"></textarea>
        <button type="button" class="btn" id="bkPaste">貼り付けたコードで戻す</button>
      </div>
    </details>
    <input type="file" id="bkFile" accept="application/json,.json,.txt" hidden>
    <p class="small muted" id="bkMsg" aria-live="polite"></p>
  </section>

  <p class="small muted" style="text-align:center"><button type="button" class="linkbtn" id="resetBtn">記録をすべて消す</button></p>`;

  $("#nextBtn").onclick = () => go(ns.go);
  app.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { LP = null; go(b.dataset.go); });
  $("#timerBtn").onclick = toggleTimer;
  setupBackup();
  const resetBtn = $("#resetBtn");
  resetBtn.onclick = () => {
    if(resetBtn.dataset.sure){ LP = null; S = blank(); save(); render(); }
    else { resetBtn.dataset.sure = "1"; resetBtn.textContent = "本当に消す場合はもう一度押す"; }
  };
  const showClock = () => { const s = Math.floor(timerMs()/1000); $("#clock").textContent = `${pad(Math.floor(s/3600))}:${pad(Math.floor(s/60)%60)}:${pad(s%60)}`; };
  showClock();
  if(S.timer.start) tick = setInterval(showClock, 1000);
}
function pageHead(title, sub, mood="normal"){
  return `<header class="pagehead">${mascot(mood)}<div><h1>${title}</h1><p class="small muted">${sub}</p></div></header>`;
}

/* ---------- レッスン一覧 ---------- */
function renderLessons(){
  const counts = SECTIONS.map(s => secStats(s.id).total);
  app.innerHTML = pageHead("レッスン", `1分野は${Math.min(...counts)}〜${Math.max(...counts)}枚。1枚ずつ、好きなところで区切って学べます。まず予想してから解説を読もう。`) +
    `<button type="button" class="termlink" id="toTerms"><span class="ic">図</span><span><b>用語ずかん</b><br><span class="small">よく出る用語・新しい用語${TERMS.length}語を図解で</span></span><span class="go">開く</span></button>`;
  $("#toTerms").onclick = () => go("#terms");
  app.querySelector(".pagehead").insertAdjacentHTML("afterend", `<button type="button" class="termlink guidelink" id="toGuide"><span class="ic">攻</span><span><b>科目A攻略ガイド</b><br><span class="small">知っておくと受験が楽になるコツ</span></span><span class="go">開く</span></button>`);
  $("#toGuide").onclick = () => go("#guide");
  app.querySelector(".pagehead").insertAdjacentHTML("afterend", `<button type="button" class="termlink practicelink" id="toPractice"><span class="ic">問</span><span><b>問題演習</b><br><span class="small">オリジナル問題＋用語クイズを10問ずつ</span></span><span class="go">解く</span></button>`);
  $("#toPractice").onclick = () => go("#practice");
  const list = document.createElement("div");
  list.className = "seclist";
  roadOrder().forEach(s => {
    const t = secStats(s.id);
    const b = document.createElement("button");
    b.type = "button"; b.className = "sec";
    b.style.setProperty("--c", COLORS[s.id]);
    b.innerHTML = `<span class="ic">${ABBR[s.id]}</span><div class="row between"><b>${s.title}</b><span class="pill num">${t.total}枚</span></div><span class="small muted">${s.desc}</span><div class="row"><div class="bar"><i style="width:${t.done/t.total*100}%"></i></div><span class="small muted num">${t.done}/${t.total}</span></div>`;
    b.onclick = () => { LP = null; go("#lesson-" + s.id); };
    list.appendChild(b);
  });
  app.appendChild(list);
}
ROUTES.glossary = function(){
  app.innerHTML = pageHead("略語ずかん", "略語・正式名称・日本語の意味から検索できます。");
  const back = document.createElement("button");
  back.type = "button"; back.className = "btn"; back.textContent = "レッスン一覧に戻る";
  back.onclick = () => go("#lessons");
  app.appendChild(back);
  renderGlossary();
};
function renderGlossary(){
  const p = document.createElement("section");
  p.className = "panel";
  p.innerHTML = `<div class="row between"><h2>略語ずかん</h2><span class="small muted num" id="glCount" role="status"></span></div>
    <label class="small muted" for="glq">略語や意味で探す</label>
    <input id="glq" class="search" type="search" placeholder="例：SMTP、提案、クラウド" autocomplete="off">
    <div class="gloss" id="glList"></div>`;
  app.appendChild(p);
  const list = p.querySelector("#glList"), input = p.querySelector("#glq");
  const keys = Object.keys(GLOSS).sort((a,b) => a.localeCompare(b, "en"));
  const draw = () => {
    const words = searchKey(input.value).split(" ").filter(Boolean);
    const hit = keys.filter(k => words.every(word => searchKey(k + " " + GLOSS[k].join(" ")).includes(word)));
    p.querySelector("#glCount").textContent = words.length ? `${hit.length} / ${keys.length}語` : `${keys.length}語`;
    list.innerHTML = hit.length ? hit.map(k => `<div><b>${esc(k)}</b><span>${esc(GLOSS[k][0])}<br><span class="muted">${esc(GLOSS[k][1])}</span></span></div>`).join("") : `<p class="small muted">見つかりませんでした</p>`;
  };
  input.addEventListener("input", draw);
  draw();
}

/* ---------- レッスン（予想 → 解説） ---------- */
function restoreLessonSession(raw){
  if(!raw || typeof raw !== "object" || !secOf(raw.sec)) return null;
  const list = secStats(raw.sec).idx;
  if(!Array.isArray(raw.list) || raw.list.length !== list.length || raw.list.some((i,k) => i !== list[k])) return null;
  if(!Number.isInteger(raw.i) || raw.i < 0 || raw.i >= list.length || !["predict","learn"].includes(raw.phase)) return null;
  if(!Array.isArray(raw.res) || raw.res.length > list.length || raw.res.some(x => x !== null && typeof x !== "boolean")) return null;
  const res = raw.res.map(x => x === null ? undefined : x);
  // 回答直後に閉じた場合は、同じ問題への二重加点を避けて解説から再開。
  const phase = typeof res[raw.i] === "boolean" ? "learn" : "predict";
  return {sec:raw.sec, list, i:raw.i, phase, res, xp:Math.max(0, Number(raw.xp) || 0), ok:res[raw.i] === true};
}
let LP = restoreLessonSession(S.lessonSession);
function checkpointLesson(){
  S.lessonSession = LP && LP.i < LP.list.length ? {...LP, list:LP.list.slice(), res:Array.from(LP.res, x => typeof x === "boolean" ? x : null)} : null;
  save();
}
function renderLesson(id){
  const sec = secOf(id);
  if(!sec){ go("#lessons"); return; }
  app.style.setProperty("--sec", COLORS[id]);
  if(!LP || LP.sec !== id){
    const saved = restoreLessonSession(S.lessonSession);
    LP = saved?.sec === id ? saved : {sec:id, list: secStats(id).idx, i:0, phase:"predict", res:[], xp:0, ok:false};
  }
  checkpointLesson();
  const n = LP.list.length;
  const prog = Math.min(n, LP.i + (LP.phase === "learn" ? 0.5 : 0)) / n * 100;
  const top = document.createElement("div");
  top.className = "lesson-top";
  top.innerHTML = `<button type="button" class="close" aria-label="レッスンを閉じる">×</button><div class="lbar"><i style="width:${prog}%"></i></div><span class="small muted num">${Math.min(LP.i+1,n)}/${n}</span>`;
  top.querySelector(".close").onclick = () => { LP = null; go("#lessons"); };
  app.appendChild(top);

  if(LP.i >= n){ lessonSummary(sec); return; }
  const idx = LP.list[LP.i], c = CARDS[idx];
  const p = document.createElement("section");
  p.className = "panel";
  app.appendChild(p);
  const band = (ph) => `<div class="band"><span class="ic">${ABBR[id]}</span><div><span class="ph">${ph}</span><h2>${c.title}</h2></div></div>`;

  if(LP.phase === "predict"){
    p.innerHTML = band("STEP 1　まず予想！ 勘でOK") + (c.calc ? `<div><span class="pill calc">計算</span></div>` : "");
    const next = document.createElement("button");
    next.type = "button"; next.className = "btn primary wide"; next.textContent = "解説を見る"; next.hidden = true;
    const gl = glosser();
    p.appendChild(quiz(gl(c.quiz.q), c.quiz.opts, c.quiz.a, ok => {
      LP.res[LP.i] = ok; LP.ok = ok;
      rec({id:"c:" + idx, sec:c.sec}, ok);
      const prev = S.cards[idx] || {};
      S.cards[idx] = {...prev, seen:true, read: !!(prev.read ?? prev.seen), ok: !!(prev.ok || ok)};
      if(!ok) toReview(idx);
      const g = ok ? 10 : 3; LP.xp += g; gainXP(g);
      checkpointLesson();
      next.hidden = false;
      return `<p class="xp-pop">+${g} XP</p>${ok ? "" : "<p class='small'>この問題は復習ボックスに入れたよ。あとでもう一度出すね。</p>"}`;
    }, c.quiz.exp ? `<p>${gl(c.quiz.exp)}</p>` : ""));
    next.onclick = () => { LP.phase = "learn"; render(); };
    p.appendChild(next);
  } else {
    const gl = glosser();
    p.innerHTML = band("STEP 2　しくみを理解しよう") + explainHTML(c, gl);
    if(c.steps) p.appendChild(stepper(c.steps, "手を動かして次へ", gl));
    const recap = document.createElement("div");
    recap.className = "fb " + (LP.ok ? "ok" : "ng");
    recap.innerHTML = `${mascot(LP.ok ? "happy" : "normal")}<div><strong>さっきの答え：${c.quiz.opts[c.quiz.a]}</strong>${LP.ok ? "予想、当たってたね！" : "解説を読んだ今なら、理由まで説明できるはず。"}</div>`;
    p.appendChild(recap);
    const next = document.createElement("button");
    next.type = "button"; next.className = "btn primary wide";
    next.textContent = LP.i === n-1 ? "わかった！ 結果を見る（+5XP）" : "わかった！ 次へ（+5XP）";
    next.onclick = () => {
      S.cards[idx] = {...S.cards[idx], read:true};
      day().lesson++; LP.xp += 5; gainXP(5);
      LP.i++; LP.phase = "predict"; checkMissions(); render();
    };
    p.appendChild(next);
  }
}
function lessonSummary(sec){
  const hit = LP.res.filter(x=>x===true).length, n = LP.res.filter(x=>typeof x === "boolean").length, t = secStats(sec.id);
  const nextSec = roadOrder().find(s => s.id !== sec.id && secStats(s.id).done < secStats(s.id).total);
  const p = document.createElement("section");
  p.className = "panel";
  p.style.textAlign = "center";
  p.style.alignItems = "center";
  p.innerHTML = `${mascot(hit >= n/2 ? "happy" : "normal", "bob")}
    <h2>「${sec.title}」ステージ${t.done === t.total ? "クリア！" : "おつかれさま！"}</h2>
    <span class="big">${hit}<span style="font-size:22px"> / ${n}</span></span><p>予想が当たった数</p>
    <p class="xp-pop">このレッスンで +${LP.xp} XP</p>
    <div class="row" style="width:100%"><div class="bar"><i style="width:${t.done/t.total*100}%"></i></div><span class="small muted num">理解 ${t.done}/${t.total}</span></div>
    <p class="small muted">${hit < n ? "外れた問題は復習ボックスへ。少し時間をおいて解き直すと定着するよ。" : "全問的中！ 計算ドリルや仕分けゲームで仕上げよう。"}</p>`;
  const btns = document.createElement("div");
  btns.style.cssText = "display:grid;gap:10px;width:100%";
  if(hit < n){ const b = document.createElement("button"); b.type="button"; b.className="btn primary"; b.textContent="間違えた問題を復習する"; b.onclick=()=>{ LP=null; go("#review"); }; btns.appendChild(b); }
  if(nextSec){ const b = document.createElement("button"); b.type="button"; b.className="btn" + (hit < n ? "" : " primary"); b.textContent=`次のステージ「${nextSec.title}」へ`; b.onclick=()=>{ LP=null; go("#lesson-"+nextSec.id); }; btns.appendChild(b); }
  const back = document.createElement("button"); back.type="button"; back.className="btn"; back.textContent="マップに戻る"; back.onclick=()=>{ LP=null; go("#home"); };
  btns.appendChild(back);
  p.appendChild(btns);
  app.appendChild(p);
  setTimeout(confetti, 150);
}

/* ---------- 計算ドリル（数字が毎回変わる） ---------- */
function opts4(ans, wrongs, show){
  const seen = new Set([show(ans)]), out = [];
  wrongs.forEach(w => { const s = show(w); if(!seen.has(s) && s !== "NaN"){ seen.add(s); out.push(s); } });
  let k = 2;
  while(out.length < 3 && k < 40){
    const s = typeof ans === "number" ? show(r(ans * (k % 2 ? 2 : 0.5) + (k > 3 ? k : 0))) : show(rint(0,15).toString(2).padStart(4,"0"));
    if(!seen.has(s)){ seen.add(s); out.push(s); }
    k++;
  }
  const all = shuffle([show(ans), ...out.slice(0,3)]);
  return {opts: all, a: all.indexOf(show(ans))};
}
const GENS = [
 {key:"cache", label:"キャッシュ", make(){
   const c = pick([5,10,20]), m = pick([50,60,80,100]), h = pick([0.7,0.8,0.9,0.95]), miss = r(1-h), ans = r(c*h + m*miss);
   const u = x => `${fmt(x)}ナノ秒`;
   return {q:`キャッシュ ${c}ナノ秒、主記憶 ${m}ナノ秒、ヒット率 ${Math.round(h*100)}%。実効アクセス時間は？`, ans, show:u,
     wrongs:[r(c*h), r(c*miss + m*h), r((c+m)/2)],
     steps:[`ヒット率を小数に：${h}。ヒットしない割合は 1 − ${h} ＝ ${miss}`,`キャッシュの分：${c} × ${h} ＝ ${fmt(r(c*h))}`,`主記憶の分：${m} × ${miss} ＝ ${fmt(r(m*miss))}`,`足す：<mark>${u(ans)}</mark>`],
     trap:"キャッシュの分だけで止める、ヒット率を逆に掛ける、がよくあるミスです。"};
 }},
 {key:"avail", label:"稼働率", make(){
   const t = pick(["series","parallel","mtbf"]);
   if(t === "series"){
     const a = pick([0.8,0.9,0.95]), b = pick([0.8,0.9,0.95]), ans = r(a*b);
     return {q:`稼働率 ${a} の装置と ${b} の装置を「直列」につないだ。全体の稼働率は？`, ans, show:fmt,
       wrongs:[r(1-(1-a)*(1-b)), r((a+b)/2), r(Math.min(a,b))],
       steps:["直列は両方動いて初めて動く → 掛け算",`${a} × ${b} ＝ <mark>${fmt(ans)}</mark>`],
       trap:"直列にすると、どちらの装置1台よりも稼働率は下がります。"};
   }
   if(t === "parallel"){
     const a = pick([0.7,0.8,0.9]), f = r(1-a), ans = r(1 - f*f);
     return {q:`稼働率 ${a} の装置を2台「並列」につないだ。全体の稼働率は？`, ans, show:fmt,
       wrongs:[r(a*a), r(f*f), a],
       steps:[`1台が止まる確率：1 − ${a} ＝ ${f}`,`2台とも止まる確率：${f} × ${f} ＝ ${fmt(r(f*f))}`,`1から引く：1 − ${fmt(r(f*f))} ＝ <mark>${fmt(ans)}</mark>`],
       trap:"並列は「止まる確率」を掛けてから1から引く。稼働率どうしを掛けるのは直列です。"};
   }
   const [b, m] = pick([[900,100],[450,50],[800,200],[1900,100],[300,100],[950,50]]), ans = r(b/(b+m));
   return {q:`MTBF が ${b}時間、MTTR が ${m}時間。稼働率は？`, ans, show:fmt,
     wrongs:[r(m/(b+m)), r((b-m)/b), r(b/(b+2*m))],
     steps:["稼働率 ＝ MTBF ÷（MTBF ＋ MTTR）",`${b} ÷（${b} ＋ ${m}）＝ ${b} ÷ ${b+m}`,`＝ <mark>${fmt(ans)}</mark>`],
     trap:"MTBFは動いている時間、MTTRは直している時間。分子はMTBFです。"};
 }},
 {key:"binary", label:"2進数", make(){
   const n = rint(5,31), b = n.toString(2), rev = parseInt(b.split("").reverse().join(""),2);
   const w = b.split("").map((d,i)=>[d, 2**(b.length-1-i)]);
   return {q:`2進数 ${b} を10進数に直すと？`, ans:n, show:fmt,
     wrongs:[rev, n+1, n-1, n+2],
     steps:[`右から重みを書く：${w.map(([,x])=>x).join("・")}`,`1が立っている所：${w.filter(([d])=>d==="1").map(([,x])=>x).join("・")}`,`足す：<mark>${n}</mark>`],
     trap:"重みは右（1の位）から。左から数えると別の数になります。"};
 }},
 {key:"bit", label:"論理演算", make(){
   const x = rint(1,15), y = rint(1,15), op = pick(["AND","OR","XOR"]);
   const bs = v => v.toString(2).padStart(4,"0");
   const f = {AND:x&y, OR:x|y, XOR:x^y};
   const others = Object.keys(f).filter(k=>k!==op).map(k=>bs(f[k]));
   const rule = {AND:"両方1のときだけ1", OR:"どちらかが1なら1", XOR:"違うときだけ1"}[op];
   return {q:`${bs(x)} ${op} ${bs(y)} の結果は？`, ans:bs(f[op]), show:s=>s,
     wrongs:[...others, bs((~f[op])&15), bs((f[op]+1)&15)],
     steps:[`${op} は「${rule}」`,`桁ごとに縦に計算：${bs(x)} と ${bs(y)}`,`答え：<mark>${bs(f[op])}</mark>`],
     trap:"AND・OR・XORを取り違えないこと。XORは「同じなら0」です。"};
 }},
 {key:"host", label:"IPアドレス", make(){
   const p = pick([24,25,26,27,28,29]), hb = 32-p, ans = 2**hb - 2;
   return {q:`サブネットマスク 255.255.255.${256 - 2**hb}（/${p}）のネットワーク。つなげる機器は最大何台？`, ans, show:x=>`${fmt(x)}台`,
     wrongs:[2**hb, 2**hb - 1, 2**(hb+1) - 2],
     steps:[`ホスト部のビット数：32 − ${p} ＝ ${hb}ビット`,`2の${hb}乗 ＝ ${2**hb}`,`2つ（ネットワーク自身とブロードキャスト）引く：<mark>${ans}台</mark>`],
     trap:"最後の「−2」を忘れると、ひっかけの選択肢を選んでしまいます。"};
 }},
 {key:"trans", label:"伝送時間", make(){
   const size = pick([1,2,4,5]), sp = pick([10,20,40,50,100]), e = pick([0.5,0.8,1]), ans = r(size*8/(sp*e));
   return {q:`${size}Mバイトのデータを、${sp}Mビット/秒・伝送効率${Math.round(e*100)}%の回線で送る。伝送時間は？`, ans, show:x=>`${fmt(x)}秒`,
     wrongs:[r(size/(sp*e)), r(size*8/sp), r(size/sp)],
     steps:[`バイトをビットに：${size} × 8 ＝ ${size*8}Mビット`,`実際の速さ：${sp} × ${e} ＝ ${fmt(r(sp*e))}Mビット/秒`,`割る：${size*8} ÷ ${fmt(r(sp*e))} ＝ <mark>${fmt(ans)}秒</mark>`],
     trap:"×8（バイト→ビット）と伝送効率の掛け忘れが2大ミスです。"};
 }},
 {key:"disk", label:"回転待ち", make(){
   const rpm = pick([3000,4000,5000,6000,7500]), full = r(60000/rpm), ans = r(full/2);
   return {q:`${rpm.toLocaleString("ja-JP")}回転/分の磁気ディスク。平均回転待ち時間は？`, ans, show:x=>`${fmt(x)}ミリ秒`,
     wrongs:[full, r(rpm/60), r(full*2)],
     steps:[`1秒あたりの回転数：${rpm} ÷ 60 ＝ ${fmt(r(rpm/60))}回転`,`1回転の時間：1,000ミリ秒 ÷ ${fmt(r(rpm/60))} ＝ ${fmt(full)}ミリ秒`,`平均は半周：<mark>${fmt(ans)}ミリ秒</mark>`],
     trap:"平均回転待ちは「1回転の半分」。半分にし忘れに注意。"};
 }},
 {key:"bep", label:"損益分岐点", make(){
   const [fx, vr] = pick([[120,0.4],[240,0.4],[300,0.4],[600,0.4],[100,0.5],[300,0.5],[200,0.6],[400,0.6],[100,0.75],[150,0.75]]), ans = r(fx/(1-vr),1);
   return {q:`固定費 ${fx}万円、変動費率 ${vr}。損益分岐点売上高は？`, ans, show:x=>`${fmt(x)}万円`,
     wrongs:[r(fx/vr,1), r(fx/(1+vr),1), r(fx*(1-vr),1)],
     steps:[`1 − 変動費率：1 − ${vr} ＝ ${r(1-vr)}`,`固定費を割る：${fx} ÷ ${r(1-vr)}`,`＝ <mark>${fmt(ans)}万円</mark>`],
     trap:"変動費率そのもので割るのはひっかけ。「1 − 変動費率」で割ります。"};
 }},
 {key:"pm", label:"日数・工数", make(){
   if(Math.random() < 0.5){
     let a,b,c,d; do { a=rint(2,7); b=rint(2,7); c=rint(2,7); d=rint(2,7); } while(a+b === c+d);
     const ans = Math.max(a+b, c+d);
     return {q:`作業A（${a}日）→B（${b}日）の経路と、作業C（${c}日）→D（${d}日）の経路が同時に進む。全体の最短日数は？`, ans, show:x=>`${x}日`,
       wrongs:[Math.min(a+b,c+d), a+b+c+d, Math.max(a,b,c,d)],
       steps:[`経路1：${a} ＋ ${b} ＝ ${a+b}日`,`経路2：${c} ＋ ${d} ＝ ${c+d}日`,`長いほう（クリティカルパス）：<mark>${ans}日</mark>`],
       trap:"全部足すのはひっかけ。同時に進む経路の「長いほう」で決まります。"};
   }
   const ppl = pick([2,3,4,6]), months = rint(2,8), total = ppl*months;
   return {q:`${total}人月の作業を${ppl}人で行う。何か月かかる？`, ans:months, show:x=>`${fmt(x)}か月`,
     wrongs:[total*ppl, total-ppl, months*2],
     steps:["期間 ＝ 工数 ÷ 人数",`${total} ÷ ${ppl} ＝ <mark>${months}か月</mark>`],
     trap:"掛け算にしないこと。人数が多いほど期間は短くなります。"};
 }}
];
let DR = {type:"all", cur:null, streak:0};
function newDrill(){
  const pool = DR.type === "all" ? GENS : GENS.filter(g => g.key === DR.type);
  const g = pick(pool), p = g.make(), o = opts4(p.ans, p.wrongs, p.show);
  DR.cur = {...p, ...o, label:g.label};
}
function renderDrill(){
  if(!DR.cur) newDrill();
  const p = DR.cur;
  app.innerHTML = pageHead("計算ドリル", "数字が毎回変わるから何回でも練習できるよ。間違いの選択肢は、よくあるミスの答えになってる。");
  app.style.setProperty("--sec", "var(--calc)");
  const f = document.createElement("div");
  f.className = "chips";
  [["all","全部"], ...GENS.map(g=>[g.key,g.label])].forEach(([k,l])=>{
    const b = document.createElement("button");
    b.type = "button"; b.className = "chipbtn"; b.textContent = l;
    b.setAttribute("aria-pressed", String(DR.type === k));
    b.onclick = () => { DR.type = k; newDrill(); render(); };
    f.appendChild(b);
  });
  app.appendChild(f);
  const panel = document.createElement("section");
  panel.className = "panel";
  panel.innerHTML = `<div class="row between"><span class="pill calc">${p.label}</span><span class="small muted num">連続正解 ${DR.streak}　今日の正解 ${(S.days[today()]||{}).drill||0}</span></div>`;
  const next = document.createElement("button");
  next.type = "button"; next.className = "btn calc wide"; next.textContent = "次の問題"; next.hidden = true;
  const gl = glosser();
  panel.appendChild(quiz(gl(p.q), p.opts, p.a, ok => {
    if(ok){ DR.streak++; day().drill++; S.drillOk++; gainXP(6); } else { DR.streak = 0; gainXP(1); }
    if(ok && DR.streak > 0 && DR.streak % 5 === 0) toast(`計算 ${DR.streak}問連続正解！`);
    checkMissions(); save();
    next.hidden = false;
    return `<p class="xp-pop">+${ok?6:1} XP</p>`;
  }, ""));
  const sol = document.createElement("div");
  sol.className = "panel";
  sol.style.cssText = "background:var(--paper);border:0;padding:12px";
  sol.innerHTML = `<b>解き方</b>`;
  sol.appendChild(stepper({list:p.steps}, "ヒントを1つずつ見る", gl));
  sol.insertAdjacentHTML("beforeend", `<p class="small muted">ひっかけ注意：${p.trap}</p>`);
  panel.appendChild(sol);
  next.onclick = () => { newDrill(); render(); };
  panel.appendChild(next);
  app.appendChild(panel);
}

/* ---------- 仕分けゲーム（似た用語を1分で区別） ---------- */
const PAIRS = [
 ["射影","選択",[["特定の「列」を取り出す",0],["条件に合う「行」を取り出す",1]]],
 ["ロールバック","ロールフォワード",[["途中で失敗した処理を取り消す",0],["完了済みの処理をやり直して復元",1],["更新前ログを使う",0],["更新後ログを使う",1]]],
 ["フェールセーフ","フェールソフト",[["故障したら安全に止める",0],["故障しても機能を落として動き続ける",1],["故障すると信号が全部赤になる",0],["エンジン1基でも飛び続ける",1]]],
 ["デュアル","デュプレックス",[["2系統で同じ処理をして結果を照合",0],["現用系と待機系に分ける",1],["待機系は普段バッチ処理をしている",1]]],
 ["スタブ","ドライバ",[["下位モジュールの代わり",0],["上位モジュールの代わり",1],["トップダウンテストで使う",0],["ボトムアップテストで使う",1]]],
 ["インシデント管理","問題管理",[["とにかく早くサービスを元に戻す",0],["根本原因を突き止めて再発を防ぐ",1]]],
 ["RFI","RFP",[["どんな製品や技術があるか情報を求める",0],["要件を示して提案を求める",1]]],
 ["BPR","BPM",[["業務を根本から作り直す",0],["業務を継続的に改善していく",1]]],
 ["SaaS","IaaS",[["アプリケーションまで提供",0],["サーバなどの設備だけ提供",1],["Webメールなど",0]]],
 ["スタック","キュー",[["後入れ先出し（LIFO）",0],["先入れ先出し（FIFO）",1],["積み重ねたお皿",0],["レジの行列",1]]],
 ["SMTP","POP3",[["メールを送信する",0],["メールを受信する",1]]],
 ["ルータ","L2スイッチ",[["IPアドレスで中継",0],["MACアドレスで中継",1],["ネットワーク層",0],["データリンク層",1]]],
 ["受信者の公開鍵","送信者の秘密鍵",[["公開鍵暗号で暗号化に使う",0],["デジタル署名を作るのに使う",1]]],
 ["WHERE","HAVING",[["グループ化の前に行を絞る",0],["平均や合計などの集計結果で絞る",1]]],
 ["メモリインタリーブ","仮想記憶",[["バンクに分けて並行で読む",0],["主記憶を実際より大きく見せる",1]]],
 ["アーカイブ","ログ",[["複数のファイルを1つにまとめる",0],["更新の履歴を記録する",1]]],
 ["派遣","請負",[["派遣先の会社が指揮命令する",0],["受けた会社が自社の社員に指揮命令する",1]]],
 ["ブラックボックス","ホワイトボックス",[["入力と出力だけを見てテスト",0],["分岐や命令を網羅してテスト",1],["限界値分析",0],["命令網羅",1]]],
 ["機密性","可用性",[["許可された人だけが見られる",0],["必要なときに使える",1],["DDoS攻撃で損なわれる",1]]],
 ["花形","金のなる木",[["成長率が高く、シェアも高い",0],["成長率は低いが、シェアが高い",1]]],
 ["直列","並列",[["稼働率を掛け算する",0],["1 −（止まる確率の積）",1]]],
 ["DNS","DHCP",[["ドメイン名をIPアドレスに変換",0],["IPアドレスを自動で割り当てる",1]]]
];
const ITEMS = PAIRS.flatMap(([a,b,list]) => list.map(([d,c]) => ({d, a, b, c})));
const GAME_SEC = 60;
let GM = {state:"ready"};
function renderGame(){
  if(GM.state === "play") GM.state = "ready";   // 画面を離れたら中断
  app.innerHTML = pageHead("仕分けゲーム", "説明を見て、どっちの用語か1分間でどんどん仕分けよう。連続正解でコンボボーナス！", "happy");
  const p = document.createElement("section");
  p.className = "panel";
  app.appendChild(p);
  if(GM.state === "end") return gameEnd(p);
  p.style.textAlign = "center";
  p.innerHTML = `<p>出題例：「条件に合う行を取り出す」 → <b>射影</b> と <b>選択</b> のどっち？</p><p class="small muted">自己ベスト <b class="num">${S.best.game}</b> 点</p>`;
  const b = document.createElement("button");
  b.type = "button"; b.className = "btn primary wide"; b.textContent = "スタート（60秒）";
  b.onclick = () => gameStart(p);
  p.appendChild(b);
}
function gameStart(p){
  GM = {state:"play", pts:0, ok:0, n:0, combo:0, max:0, missed:[], deck:shuffle(ITEMS), k:0, end: Date.now() + GAME_SEC*1000, lock:false};
  p.style.textAlign = "";
  p.innerHTML = `
    <div class="row between"><span class="num"><b id="gTime">${GAME_SEC}</b>秒</span><span class="combo num" id="gCombo">コンボ 0</span><span class="num"><b id="gPts">0</b>点</span></div>
    <div class="bar"><i id="gBar" style="width:100%"></i></div>
    <div class="game-q" id="gQ"></div>
    <div class="game-btns"><button type="button" id="gA"></button><button type="button" id="gB"></button></div>`;
  const show = () => {
    if(GM.k >= GM.deck.length){ GM.deck = shuffle(ITEMS); GM.k = 0; }
    const it = GM.deck[GM.k];
    $("#gQ").textContent = it.d; $("#gQ").className = "game-q";
    const lab = t => GLOSS[t] ? `${t}<small class="gfull">${GLOSS[t][0]}</small>` : t;
    $("#gA").innerHTML = lab(it.a); $("#gB").innerHTML = lab(it.b);
  };
  const answer = (choice) => {
    if(GM.lock || GM.state !== "play") return;
    const it = GM.deck[GM.k]; GM.n++;
    const ok = choice === it.c;
    if(ok){ GM.ok++; GM.combo++; GM.max = Math.max(GM.max, GM.combo); GM.pts += 10 + Math.min(GM.combo-1, 10)*2; }
    else { GM.combo = 0; GM.missed.push(it); }
    $("#gQ").className = "game-q " + (ok ? "ok" : "ng");
    if(!ok) $("#gQ").textContent = `正解は「${choice ? it.a : it.b}」`;
    $("#gPts").textContent = GM.pts; const cb = $("#gCombo"); cb.textContent = `コンボ ${GM.combo}`; cb.classList.toggle("hot", GM.combo >= 5); if(ok && GM.combo % 5 === 0) burst(cb, 10);
    GM.lock = true;
    setTimeout(() => { GM.lock = false; GM.k++; if(GM.state === "play" && $("#gQ")) show(); }, ok ? 180 : 700);
  };
  $("#gA").onclick = () => answer(0);
  $("#gB").onclick = () => answer(1);
  show();
  tick = setInterval(() => {
    const left = Math.max(0, GM.end - Date.now());
    const t = $("#gTime"); if(!t){ clearTick(); return; }
    t.textContent = Math.ceil(left/1000);
    $("#gBar").style.width = (left / (GAME_SEC*1000) * 100) + "%";
    if(left <= 0){
      clearTick(); GM.state = "end";
      const newBest = GM.pts > S.best.game;
      if(newBest) S.best.game = GM.pts;
      S.maxCombo = Math.max(S.maxCombo, GM.max);
      GM.newBest = newBest;
      day().game++; gainXP(GM.ok * 2); checkMissions(); save();
      render();
    }
  }, 100);
}
function gameEnd(p){
  if(GM.newBest) setTimeout(confetti, 150);
  const uniq = [];
  GM.missed.forEach(m => { if(!uniq.some(u => u.d === m.d)) uniq.push(m); });
  p.innerHTML = `<div style="text-align:center;display:flex;flex-direction:column;gap:6px;align-items:center">
    ${mascot(GM.newBest ? "happy" : "normal","bob")}<span class="phase">${GM.newBest ? "自己ベスト更新！" : "タイムアップ"}</span>
    <span class="big">${GM.pts}<span style="font-size:18px">点</span></span>
    <p class="num">${GM.n}問中 ${GM.ok}問正解　最大コンボ ${GM.max}</p>
    <p class="xp-pop">+${GM.ok*2} XP</p></div>
    ${uniq.length ? `<div><b>間違えた説明（ここだけ覚え直そう）</b><div class="missed">${uniq.map(m=>`<div>${esc(m.d)} → <b>${esc(m.c ? m.b : m.a)}</b></div>`).join("")}</div></div>` : "<p>ノーミス！ 完ぺきです。</p>"}`;
  const b = document.createElement("button");
  b.type = "button"; b.className = "btn primary wide"; b.textContent = "もう1回";
  b.onclick = () => { GM = {state:"ready"}; gameStart(p); };
  p.appendChild(b);
}

/* ---------- 復習ボックス ---------- */
let RV = null;
function renderReview(){
  app.innerHTML = pageHead("復習ボックス", "外した問題を「当日 → 1日後 → 3日後」と間隔をあけて出すよ。3回正解で卒業！");
  const p = document.createElement("section");
  p.className = "panel";
  app.appendChild(p);
  const due = dueList();
  const waiting = Object.keys(S.review).length - due.length;
  if(!RV || RV.i >= RV.list.length){
    if(RV && RV.list.length){
      p.style.textAlign = "center";
      p.style.alignItems = "center";
      p.innerHTML = `${mascot("happy","bob")}<span class="phase">復習おわり！</span><span class="big">${RV.ok} / ${RV.list.length}</span><p>正解した問題は次の出番まで間隔があきます。</p>`;
      RV = null;
      const b = document.createElement("button"); b.type="button"; b.className="btn primary wide"; b.textContent="ホームに戻る"; b.onclick=()=>go("#home");
      p.appendChild(b);
      return;
    }
    if(!due.length){
      p.innerHTML = `<h2>今日の復習はありません</h2><p>${waiting ? `あと${waiting}問が、間隔をあけて出番を待っています。` : "まだ復習ボックスは空です。レッスンで予想を外した問題がここに入ります。"}</p>`;
      const b = document.createElement("button"); b.type="button"; b.className="btn primary wide"; b.textContent="レッスンに進む"; b.onclick=()=>go("#lessons");
      p.appendChild(b);
      return;
    }
    p.innerHTML = `<h2>今日の復習：${due.length}問</h2><p>少し忘れかけた頃に思い出すのが、いちばん記憶に残ります。</p>`;
    const b = document.createElement("button"); b.type="button"; b.className="btn primary wide"; b.textContent="はじめる";
    b.onclick = () => { RV = {list: shuffle(due), i:0, ok:0}; render(); };
    p.appendChild(b);
    return;
  }
  const idx = RV.list[RV.i], c = CARDS[idx], st = S.review[idx] || {lv:1};
  p.innerHTML = `<div class="row between"><span class="small muted num">${RV.i+1} / ${RV.list.length}</span><span class="pill num">段階 ${st.lv} / 3</span></div><h2>${c.title}</h2>`;
  const next = document.createElement("button");
  next.type = "button"; next.className = "btn primary wide"; next.textContent = RV.i === RV.list.length-1 ? "結果を見る" : "次へ"; next.hidden = true;
  const gl = glosser();
  p.appendChild(quiz(gl(c.quiz.q), c.quiz.opts, c.quiz.a, ok => {
    let msg;
    rec({id:"c:" + idx, sec:c.sec}, ok);
    if(ok){
      RV.ok++; S.reviewOk++;
      const lv = (S.review[idx]?.lv || 1) + 1;
      if(lv > 3){ delete S.review[idx]; S.cards[idx] = {seen:true, ok:true}; msg = "卒業！ もう大丈夫です。"; }
      else { S.review[idx] = {lv, due: addDays(GAPS[lv])}; msg = `次は${GAPS[lv]}日後にもう一度。`; }
      gainXP(8);
    } else {
      S.review[idx] = {lv:1, due: addDays(1)};
      msg = "明日もう一度出します。下の解説で確認しておきましょう。";
      gainXP(2);
    }
    day().review++; checkMissions(); save();
    next.hidden = false;
    return `<p>${gl(c.quiz.exp)}</p><p class="small"><b>${msg}</b></p>`;
  }));
  const det = document.createElement("details");
  det.innerHTML = `<summary style="cursor:pointer;font-weight:700;color:var(--accent)">解説をもう一度読む</summary><div style="display:flex;flex-direction:column;gap:12px;margin-top:10px">${explainHTML(c)}</div>`;
  p.appendChild(det);
  next.onclick = () => { RV.i++; render(); };
  p.appendChild(next);
}

/* ---------- ボス戦（総まとめテスト） ---------- */
let TS = null;
function renderTest(){
  app.innerHTML = pageHead("ボス戦", "全分野からランダムに10問。ライフは3つ、8問以上で合格ライン！");
  app.style.setProperty("--sec", "var(--bad)");
  const p = document.createElement("section");
  p.className = "panel";
  app.appendChild(p);
  if(!TS){
    p.innerHTML = `<p>自己ベスト：<b class="num">${S.best.test} / 10</b></p>`;
    const b = document.createElement("button"); b.type="button"; b.className="btn primary wide"; b.textContent="挑戦する";
    b.onclick = () => { TS = {list: shuffle(FINAL_POOL).slice(0,10), i:0, ok:0, hp:3, miss:[]}; render(); };
    p.appendChild(b);
    return;
  }
  if(TS.i >= TS.list.length || TS.hp <= 0){
    const done = TS.i >= TS.list.length, pass = done && TS.ok >= 8;
    if(done && TS.ok > S.best.test) S.best.test = TS.ok;
    save(); checkBadges();
    p.style.textAlign = "center";
    if(pass) setTimeout(confetti, 150);
    p.style.alignItems = "center";
    p.innerHTML = `${mascot(pass ? "happy" : "sad","bob")}<span class="phase">${pass ? "合格ライン突破！" : done ? "あと少し！" : "ライフがなくなりました"}</span>
      <span class="big">${TS.ok} / 10</span>
      <p>${pass ? "この調子なら本番の科目Aも見えてきます。" : "間違えた問題の分野をレッスンで見直してから、再挑戦しましょう。"}</p>
      ${TS.miss.length ? `<div class="missed" style="text-align:left">${TS.miss.map(q=>`<div>${esc(q.q)} → <b>${esc(q.opts[q.a])}</b></div>`).join("")}</div>` : ""}`;
    const b = document.createElement("button"); b.type="button"; b.className="btn primary wide"; b.textContent="もう一度挑戦";
    b.onclick = () => { TS = {list: shuffle(FINAL_POOL).slice(0,10), i:0, ok:0, hp:3, miss:[]}; render(); };
    p.appendChild(b);
    const h = document.createElement("button"); h.type="button"; h.className="btn wide"; h.textContent="ホームに戻る"; h.onclick=()=>{ TS=null; go("#home"); };
    p.appendChild(h);
    return;
  }
  const q = TS.list[TS.i];
  p.innerHTML = `<div class="row between"><span class="num">第${TS.i+1}問 / 10</span><span class="hearts" aria-label="ライフ ${TS.hp}">${"♥".repeat(TS.hp)}<span style="opacity:.25">${"♥".repeat(3-TS.hp)}</span></span></div>`;
  const next = document.createElement("button");
  next.type = "button"; next.className = "btn primary wide"; next.textContent = "次へ"; next.hidden = true;
  const gl = glosser();
  p.appendChild(quiz(gl(q.q), q.opts, q.a, ok => {
    if(q.id) rec(q, ok);
    if(ok){ TS.ok++; gainXP(5); } else { TS.hp--; TS.miss.push(q); }
    next.hidden = false;
    if(TS.hp <= 0 || TS.i === 9) next.textContent = "結果を見る";
    return "";
  }, `<p>${gl(q.exp)}</p>`));
  next.onclick = () => { TS.i++; render(); };
  p.appendChild(next);
}

/* ---------- バックアップ ---------- */
function encodeRecord(){ return "KA1:" + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
function decodeRecord(t){
  t = String(t).trim();
  if(t.startsWith("KA1:")) t = decodeURIComponent(escape(atob(t.slice(4))));
  return normalizeRecord(JSON.parse(t), true);
}
function applyRecord(d, msg){
  const next = normalizeRecord(d, true);
  S = next; save();
  LP = restoreLessonSession(S.lessonSession);
  toast("記録を戻しました");
  render();
}
function setupBackup(){
  const msg = t => { const m = $("#bkMsg"); if(m) m.textContent = t; };
  const st = $("#saveState");
  askPersist().then(ok => { if(st && ok) st.textContent = "このスマホに保存中（消えにくい設定）"; });
  $("#bkSave").onclick = () => {
    save();
    const d = new Date(), name = `kamokuA-backup-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}.json`;
    const blob = new Blob([JSON.stringify(S)], {type:"application/json"});
    const file = new File([blob], name, {type:"application/json"});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      navigator.share({files:[file], title:"科目Aの記録"}).then(() => msg("共有メニューから保存しました。「ファイルに保存」などを選ぶとスマホに残ります。")).catch(() => {});
      return;
    }
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    msg(`「${name}」をダウンロードしました。`);
  };
  $("#bkLoad").onclick = () => $("#bkFile").click();
  $("#bkFile").onchange = e => {
    const f = e.target.files[0]; if(!f) return;
    f.text().then(t => { try { applyRecord(decodeRecord(t)); } catch(err){ msg("このファイルは読み込めませんでした。保存したバックアップのファイルを選んでください。"); } });
  };
  $("#bkCopy").onclick = () => {
    save();
    const code = encodeRecord();
    const done = () => msg("コードをコピーしました。別のスマホで貼り付けて「貼り付けたコードで戻す」を押してください。");
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(code).then(done).catch(() => { $("#bkCode").value = code; $("#bkCode").select(); msg("下の欄のコードを長押ししてコピーしてください。"); }); }
    else { $("#bkCode").value = code; $("#bkCode").select(); msg("下の欄のコードを長押ししてコピーしてください。"); }
  };
  $("#bkPaste").onclick = () => {
    try { applyRecord(decodeRecord($("#bkCode").value)); } catch(err){ msg("コードが正しくありません。コピーしたコードを全部貼り付けてください。"); }
  };
}

/* ---------- 起動 ---------- */
render();
restoreFromIDB().then(() => {
  LP = restoreLessonSession(S.lessonSession);
  storageReady = true;
  checkBadges();
  save(); render();
});

