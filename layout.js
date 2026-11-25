/* 画面の配置を学習者向けに整理する
   ホーム：「今日やること」→「練習メニュー」→「合格への道」→「記録」→「設定」の順に。
   入口のボタンは縦に長く並べず、2列のタイルにまとめる。 */

const MENU = [
  {go:"#practice", icon:"問", title:"問題演習", color:"#16865a", sub:() => "10問ずつ・分野を選べる"},
  {go:"#mock", icon:"模", title:"模擬試験", color:"#18233b", sub:() => S.mockCur ? `再開する（${S.mockCur.ans.filter(x=>x!==null).length}/60）` : S.mocks?.length ? `前回 ${S.mocks[0].score}点` : "60問・90分"},
  {go:"#cards", icon:"札", title:"単語カード", color:"#0d7c66", sub:() => "めくる・聞き流す"},
  {go:"#terms", icon:"図", title:"用語ずかん", color:"#2b62cf", sub:() => `覚えた ${Object.keys(S.terms||{}).length}/${TERMS.length}`},
  {go:"#glossary", icon:"略", title:"略語ずかん", color:"#16919f", sub:() => `${Object.keys(GLOSS).length}語・意味からも検索`},
  {go:"#notebook", icon:"✎", title:"間違いノート", color:"#cc3f3f", sub:() => { const n = wrongIds().length; return n ? `${n}問たまっている` : "間違いがここに集まる"; }, badge:() => wrongIds().length},
  {go:"#drill", icon:"計", title:"計算ドリル", color:"#c75f12", sub:() => "数字が毎回かわる"},
  {go:"#test", icon:"闘", title:"ボス戦", color:"#7a55e0", sub:() => S.best?.test ? `最高 ${S.best.test}/10` : "ランダム10問・ライフ3"},
  {go:"#guide", icon:"攻", title:"攻略ガイド", color:"#a8771c", sub:() => "時間配分・解き方のコツ"}
];
function tileGrid(items){
  const g = document.createElement("div");
  g.className = "tiles";
  items.forEach(m => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "tile";
    b.style.setProperty("--c", m.color);
    const badge = m.badge ? m.badge() : 0;
    b.innerHTML = `<span class="tile-ic">${m.icon}</span><b>${m.title}</b><span class="tile-sub">${m.sub()}</span>${badge ? `<span class="tile-badge num">${badge}</span>` : ""}`;
    b.onclick = () => go(m.go);
    g.appendChild(b);
  });
  return g;
}
function block(title, sub, ...nodes){
  const s = document.createElement("div");
  s.className = "block";
  s.innerHTML = `<div class="block-h"><h2>${title}</h2>${sub ? `<span class="small muted">${sub}</span>` : ""}</div>`;
  nodes.filter(Boolean).forEach(n => s.appendChild(n));
  return s;
}
function tabbed(id, tabs){
  const wrap = document.createElement("section");
  wrap.className = "panel tabbed";
  S.ui ||= {};
  const cur = S.ui[id] && tabs.some(t => t.key === S.ui[id]) ? S.ui[id] : tabs[0].key;
  const bar = document.createElement("div");
  bar.className = "seg"; bar.setAttribute("role", "tablist");
  tabs.forEach(t => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = t.label; b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", String(t.key === cur));
    b.onclick = () => { S.ui[id] = t.key; save(); bar.querySelectorAll("button").forEach(x => x.setAttribute("aria-selected", String(x === b))); tabs.forEach(x => { if(x.node) x.node.hidden = x.key !== t.key; }); };
    bar.appendChild(b);
  });
  wrap.appendChild(bar);
  tabs.forEach(t => { if(!t.node) return; t.node.classList.add("tabpane"); t.node.hidden = t.key !== cur; wrap.appendChild(t.node); });
  return wrap;
}
const strip = el => { if(el){ el.classList.remove("panel"); el.removeAttribute("style"); } return el; };

const homeBase3 = ROUTES.home;
ROUTES.home = function(){
  homeBase3();
  const q = s => app.querySelector(s), lab = l => app.querySelector(`[aria-label="${l}"]`);
  const hero = q(".hero"), next = q("#nextBtn"), exam = q(".examcd"), stats = q(".stats");
  const daily = q(".daily"), road = q(".road-wrap"), missions = lab("今日のミッション");
  const cal = lab("学習カレンダー"), weak = q("#weakPanel"), badges = lab("バッジ"), timer = lab("勉強タイマー");
  const settings = q("#exDate")?.closest(".panel"), backup = lab("記録の保存"), reset = q("#resetBtn")?.closest("p");

  /* 上部：あいさつ＋状態をひとまとまりに */
  const top = document.createElement("header");
  top.className = "home-top";
  const dl = examDays();
  top.innerHTML = `<div class="ht-row"><span class="ht-logo">科目A</span><span class="ht-chips">
      ${dl !== null && dl >= 0 ? `<span class="chip-lg bad">試験まで <b class="num">${dl}</b>日</span>` : `<button type="button" class="chip-lg" id="setExam">試験日を設定</button>`}
      <span class="chip-lg">連続 <b class="num">${streak()}</b>日</span>
      <button type="button" class="gear" id="toSettings" aria-label="設定とバックアップ">⚙</button></span></div>`;
  top.appendChild(hero);
  const lesson = nextLesson();
  next.textContent = lesson.label;
  next.onclick = () => { resumeLesson(lesson); };
  top.appendChild(next);
  const review = document.createElement("button");
  review.type = "button"; review.className = "btn wide home-review";
  const due = dueList().length;
  review.textContent = due ? `今日の復習をする（${due}問）` : "復習ボックスを見る（今日の出題なし）";
  review.onclick = () => go("#review");
  top.appendChild(review);
  if(stats){ stats.classList.add("stats-compact"); top.appendChild(stats); }
  if(exam) exam.remove();

  /* 今日やること：ミッションと今日の1問 */
  if(missions){ const h = missions.querySelector("h2"); if(h) h.textContent = "今日のミッション"; }
  const today1 = block("今日やること", "毎日少しずつ", missions, daily);

  /* 練習メニュー：タイル */
  app.querySelectorAll(".termlink").forEach(b => b.remove());
  lab("ボス戦")?.remove();
  const menu = block("練習メニュー", "やりたいことを選ぶ", tileGrid(MENU));

  /* 合格への道 */
  const roadBlock = document.createElement("details");
  roadBlock.className = "panel road-details";
  roadBlock.innerHTML = `<summary>合格への道<span class="small muted">全${SECTIONS.length}ステージの進み具合を見る</span></summary>`;
  roadBlock.appendChild(road);
  road.querySelector(".row.between")?.remove();

  /* 記録：タブで切り替え */
  [cal, weak, badges, timer].forEach(strip);
  const rec = block("学習の記録", "", tabbed("rec", [
    {key:"cal", label:"カレンダー", node:cal}, {key:"weak", label:"苦手分析", node:weak},
    {key:"badge", label:"バッジ", node:badges}, {key:"timer", label:"タイマー", node:timer}
  ]));

  /* 設定とバックアップ：たたんでおく */
  const det = document.createElement("details");
  det.className = "panel settings-box"; det.id = "settingsBox";
  det.innerHTML = `<summary><span class="gear-s">⚙</span> 設定とバックアップ<span class="small muted">試験日・文字の大きさ・記録の保存</span></summary>`;
  [settings, backup].forEach(n => { if(n){ strip(n); n.classList.add("sub-sec"); det.appendChild(n); } });

  /* 試験日の設定前に、直近の公式日程を確認できるようにする */
  const examNotice = document.createElement("div");
  examNotice.className = "callout";
  examNotice.setAttribute("aria-label", "試験日程の公式情報");
  const inPauseNoticeWindow = Date.now() < Date.parse("2027-02-01T00:00:00+09:00");
  examNotice.innerHTML = inPauseNoticeWindow
    ? `<strong>試験日程の確認</strong><br>
      IPAは、2026年12月28日から基本情報技術者試験を一時休止し、2027年1月下旬に再開予定と案内しています（2026年11月20日更新）。受験日を設定する前に、最新の実施予定を確認してください。<br>
      <a href="https://www.ipa.go.jp/shiken/mousikomi/cbt_sg_fe.html" target="_blank" rel="noopener noreferrer">IPA公式の試験実施案内</a>`
    : `試験日程は変更されることがあります。受験前に<a href="https://www.ipa.go.jp/shiken/mousikomi/cbt_sg_fe.html" target="_blank" rel="noopener noreferrer">IPA公式の試験実施案内</a>で最新情報を確認してください。`;
  det.appendChild(examNotice);
  if(reset) det.appendChild(reset);

  app.innerHTML = "";
  app.append(top, today1, menu, roadBlock, rec, det);
  const openSettings = () => { det.open = true; det.scrollIntoView({behavior: reduceMotion() ? "auto" : "smooth", block:"start"}); };
  $("#toSettings").onclick = openSettings;
  const se = $("#setExam"); if(se) se.onclick = () => { openSettings(); setTimeout(() => $("#exDate")?.focus(), 300); };
};

const lessonsBase3 = ROUTES.lessons;
ROUTES.lessons = function(){
  lessonsBase3();
  app.querySelectorAll(".termlink").forEach(b => b.remove());
  const head = app.querySelector(".pagehead"), list = app.querySelector(".seclist");
  const stagesHelp = document.createElement("p");
  stagesHelp.className = "small muted";
  stagesHelp.textContent = "上から順に進めると、基礎から無理なく理解できる並びになっています。各ステージは最初に入門カード（そもそも何？）、そのあと試験によく出るカードが続きます。";
  app.innerHTML = "";
  app.append(...[head,
    block("ステージ一覧", `${CARDS.length}枚のカード`, stagesHelp, list),
    block("用語を覚える・振り返る", "", tileGrid(MENU.filter(m => ["#cards","#terms","#glossary","#notebook","#guide"].includes(m.go))))
  ].filter(Boolean));
};

/* 回答済みのカードを最初から繰り返さず、未読のカードから再開する。
   同じ起動中のレッスンは、解説ページを含めてそのまま再開する。 */
function nextLesson(){
  const session = LP && LP.i < LP.list.length ? LP : restoreLessonSession(S.lessonSession);
  if(session){
    const sec = secOf(session.sec);
    if(sec) return {sec:sec.id, label:`学習を続ける：${sec.title}（${session.i+1}/${session.list.length}枚）`, active:true, session};
  }
  const isRead = i => !!(S.cards[i]?.read ?? S.cards[i]?.seen);
  const section = roadOrder().find(s => secStats(s.id).idx.some(i => !isRead(i))) || currentSec();
  if(!section) return {label:"全カードを学習済み！ 問題演習へ", route:"#practice"};
  const list = secStats(section.id).idx;
  let index = list.findIndex(i => !isRead(i));
  if(index < 0) index = list.findIndex(i => !learned(i));
  index = Math.max(0, index);
  return {sec:section.id, list, index, label:`${Object.keys(S.cards).length ? "学習を続ける" : "学習をはじめる"}：${section.title}（${index+1}/${list.length}枚）`};
}
function resumeLesson(lesson){
  if(lesson.route){ go(lesson.route); return; }
  LP = lesson.active ? lesson.session : {sec:lesson.sec, list:lesson.list, i:lesson.index, phase:"predict", res:[], xp:0, ok:false};
  go("#lesson-" + lesson.sec);
}

/* ステージの中身をドロップダウンで確認する */
const STAGE_OPEN = new Set();
function addStageDrop(btn, s){
  const t = secStats(s.id);
  const wrap = document.createElement("div");
  wrap.className = "stage";
  wrap.style.setProperty("--c", COLORS[s.id]);
  btn.replaceWith(wrap);
  wrap.appendChild(btn);
  const tg = document.createElement("button");
  tg.type = "button"; tg.className = "stage-tg";
  const body = document.createElement("ol");
  body.className = "stage-body";
  body.id = "stage-" + s.id;
  tg.setAttribute("aria-controls", body.id);
  const set = open => {
    body.hidden = !open;
    tg.setAttribute("aria-expanded", open);
    tg.innerHTML = `<span>${open ? "閉じる" : "このステージの中身を見る"}</span><span class="small num">${t.done}/${t.total} 理解</span><span class="caret">▾</span>`;
    open ? STAGE_OPEN.add(s.id) : STAGE_OPEN.delete(s.id);
  };
  tg.onclick = () => set(body.hidden);
  t.idx.forEach((ci, k) => {
    const c = CARDS[ci], ok = learned(ci);
    const li = document.createElement("li");
    li.innerHTML = `<button type="button" class="${ok ? "ok" : ""}"><span class="st-mark">${ok ? "✓" : k + 1}</span><span class="st-t">${c.title}</span>${c.intro ? '<span class="st-tag">入門</span>' : '<span class="st-tag ex">試験</span>'}<span class="st-go">›</span></button>`;
    li.firstChild.onclick = () => {
      LP = {sec: s.id, list: t.idx, i: k, phase: "predict", res: [], xp: 0, ok: false};
      go("#lesson-" + s.id);
    };
    body.appendChild(li);
  });
  const foot = document.createElement("li");
  foot.className = "stage-foot";
  foot.innerHTML = `<span class="small muted">✓ は理解済み。タップでそのカードから始められます</span>`;
  body.appendChild(foot);
  wrap.append(tg, body);
  set(STAGE_OPEN.has(s.id));
}

/* レッスン一覧のステージにも、入門カードの数を見せる */
const baseRender4 = render;
render = function(){
  baseRender4();
  if((location.hash || "") === "#lessons"){
    app.querySelectorAll(".seclist .sec").forEach((b, i) => {
      const s = SECTIONS[i]; if(!s) return;
      const n = CARDS.filter(c => c.sec === s.id && c.intro).length;
      const pill = b.querySelector(".pill");
      if(pill && n) pill.textContent = `入門${n}＋${CARDS.filter(c => c.sec === s.id).length - n}枚`;
      b.insertAdjacentHTML("afterbegin", `<span class="stage-no num">${i+1}</span>`);
      addStageDrop(b, s);
    });
  }
};
window.removeEventListener("hashchange", baseRender4);
window.addEventListener("hashchange", render);
render();

