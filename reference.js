/* 学習画面を再描画せずに、既存のガイドを参照する。 */
(() => {
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "reference-fab";
  trigger.textContent = "学習メモ";
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-controls", "learning-reference");
  document.body.appendChild(trigger);

  const dialog = document.createElement("dialog");
  dialog.id = "learning-reference";
  dialog.className = "reference-dialog";
  dialog.setAttribute("aria-labelledby", "reference-title");
  dialog.innerHTML = `<div class="reference-head"><h2 id="reference-title">いつでも学習メモ</h2><button type="button" class="btn" data-ref-close aria-label="閉じて学習に戻る">学習に戻る</button></div>
    <p class="small muted">問題を開いたまま確認できます。制限時間のある練習では、タイマーは進みます。</p>
    <label class="guide-search">知りたいことを探す<input type="search" data-ref-search placeholder="例：キャッシュ、SQL、誰の鍵"></label>
    <div class="reference-tools" aria-label="学習メモの絞り込み"><button type="button" class="btn" data-ref-all aria-pressed="true">すべて</button><button type="button" class="btn" data-ref-saved aria-pressed="false">保存した項目</button><button type="button" class="btn" data-ref-recent aria-pressed="false">最近見た</button></div><div class="reference-filter-row"><label>表示範囲<select data-ref-category><option value="">全分野</option><option value="numbers">計算・数字</option><option value="terms">用語・仕組み</option><option value="algorithm">アルゴリズム</option><option value="study">学び方・試験</option><option value="notes">自分のメモあり</option></select></label><button type="button" class="btn" data-ref-clear hidden>絞り込み解除</button></div>
    <div class="row between"><p class="small muted" data-ref-count role="status"></p><button type="button" class="btn" data-ref-list hidden>項目一覧へ</button></div>
    <div class="reference-list"></div><div class="reference-content"></div>`;
  document.body.appendChild(dialog);
  const search = dialog.querySelector("[data-ref-search]");
  const count = dialog.querySelector("[data-ref-count]");
  const list = dialog.querySelector(".reference-list");
  const content = dialog.querySelector(".reference-content");
  const listButton = dialog.querySelector("[data-ref-list]");
  const allButton = dialog.querySelector("[data-ref-all]");
  const savedButton = dialog.querySelector("[data-ref-saved]");
  const clearButton = dialog.querySelector("[data-ref-clear]");
  const recentButton = dialog.querySelector("[data-ref-recent]");
  const category = dialog.querySelector("[data-ref-category]");
  let mode = "all", listScroll = 0;
  const history = () => Array.isArray(S.ui?.referenceRecent) ? S.ui.referenceRecent.filter(x => typeof x === "string").slice(0,6) : [];
  const group = section => {
    const tag = section.querySelector(".gtag")?.textContent || "";
    if(["単位","計算の条件","計算","暗記"].includes(tag)) return "numbers";
    if(tag === "アルゴリズム") return "algorithm";
    if(["全体像","確認問題","データの保護","セキュリティの役割","データベース","仕組み","基礎理論","ネットワーク","頻出","ひっかけ","即答","略語"].includes(tag)) return "terms";
    return "study";
  };
  let loaded = false, entries = [], active = null, previousFocus = null, previousOverflow = "";
  const readNote = title => typeof S.ui?.referenceNotes?.[title] === "string" ? S.ui.referenceNotes[title].slice(0,2000) : "";
  const hasNote = title => readNote(title).trim().length > 0;
  function refreshNote(entry){
    const text = readNote(entry.title);
    entry.noteSummary.textContent = text.trim() ? "自分のメモを読む・編集する" : "自分のメモを書く";
    entry.noteStatus.textContent = text.length + " / 2000字（入力すると自動で記録）";
    entry.button.title = text.trim() ? "自分のメモがあります" : "";
  }
  const pinned = title => Array.isArray(S.ui?.referencePins) && S.ui.referencePins.includes(title);
  function updatePins(){
    const total = entries.filter(entry => pinned(entry.title)).length;
    savedButton.textContent = "保存 " + total + "件";
    allButton.setAttribute("aria-pressed", String(mode === "all"));
    savedButton.setAttribute("aria-pressed", String(mode === "saved"));
    recentButton.setAttribute("aria-pressed", String(mode === "recent"));
    entries.forEach(entry => {
      const yes = pinned(entry.title);
      entry.pin.textContent = yes ? "★" : "☆";
      entry.pin.setAttribute("aria-label", entry.title + (yes ? "の保存を解除" : "を保存"));
      entry.pin.setAttribute("aria-pressed", String(yes));
    });
  }

  function showList(){
    active = null;
    content.hidden = true;
    list.hidden = false;
    listButton.hidden = true;
    const words = search.value.normalize("NFKC").toLowerCase().trim().split(/\s+/).filter(Boolean);
    let matches = 0;
    const recent = history();
    entries.forEach((entry, i) => {
      const visible = (mode !== "saved" || pinned(entry.title)) && (mode !== "recent" || recent.includes(entry.title)) && (!category.value || (category.value === "notes" ? hasNote(entry.title) : entry.group === category.value)) && words.every(word => (entry.text + " " + readNote(entry.title).normalize("NFKC").toLowerCase()).includes(word));
      
      entry.row.hidden = !visible;
      if(visible) matches++;
    });
    const ordered = mode === "recent" ? [...entries].sort((a,b) => {
      const ai = recent.indexOf(a.title), bi = recent.indexOf(b.title);
      return (ai < 0 ? entries.length : ai) - (bi < 0 ? entries.length : bi);
    }) : entries;
    ordered.forEach(entry => list.appendChild(entry.row));
    count.textContent = matches ? matches + "件から選べます" : mode === "saved" && !entries.some(entry => pinned(entry.title)) ? "☆を押すと、よく見る項目をここに保存できます。" : mode === "recent" && !recent.length ? "説明を開くと、最近見た6件がここに並びます。" : "見つかりません。絞り込み解除で、全項目に戻れます。";
    clearButton.hidden = !search.value && !category.value && mode === "all";
    updatePins();
  }
  function load(){
    if(loaded) return;
    const source = document.createElement("div");
    renderGuide(source);
    source.querySelectorAll("section.guide").forEach(section => {
      const title = section.querySelector("h2");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn";
      button.textContent = title.textContent;
      const row = document.createElement("div");
      row.className = "reference-item";
      const pin = document.createElement("button");
      pin.type = "button"; pin.className = "btn reference-pin";
      const entry = {section, button, row, pin, title:title.textContent, group:group(section), text:section.textContent.normalize("NFKC").toLowerCase()};
      const noteBox = document.createElement("details");
      noteBox.className = "reference-own-note";
      const noteSummary = document.createElement("summary");
      const noteLabel = document.createElement("label");
      noteLabel.textContent = "この項目の自分のメモ";
      const noteInput = document.createElement("textarea");
      noteInput.rows = 4; noteInput.maxLength = 2000;
      noteInput.placeholder = "例：間違えた理由、自分で考えた覚え方、次に確認すること";
      noteInput.value = readNote(entry.title);
      noteLabel.appendChild(noteInput);
      const noteStatus = document.createElement("p");
      noteStatus.className = "small muted";
      noteStatus.setAttribute("role", "status");
      noteBox.appendChild(noteSummary);
      noteBox.appendChild(noteLabel);
      noteBox.appendChild(noteStatus);
      section.insertBefore(noteBox, section.children[1] || null);
      Object.assign(entry, {noteSummary, noteStatus, noteInput});
      refreshNote(entry);
      noteInput.oninput = () => {
        S.ui ||= {};
        if(!S.ui.referenceNotes || typeof S.ui.referenceNotes !== "object" || Array.isArray(S.ui.referenceNotes)) S.ui.referenceNotes = {};
        const text = noteInput.value.slice(0,2000);
        if(text) S.ui.referenceNotes[entry.title] = text;
        else delete S.ui.referenceNotes[entry.title];
        save();
        refreshNote(entry);
      };
      pin.onclick = () => {
        S.ui ||= {};
        const pins = new Set(Array.isArray(S.ui.referencePins) ? S.ui.referencePins.filter(x => typeof x === "string") : []);
        if(pins.has(entry.title)) pins.delete(entry.title); else pins.add(entry.title);
        S.ui.referencePins = [...pins]; save();
        updatePins();
        showList();
        if(entry.row.hidden) savedButton.focus({preventScroll:true});
      };
      button.onclick = () => {
        listScroll = list.scrollTop;
        active = entry;
        noteInput.value = readNote(entry.title);
        refreshNote(entry);
        S.ui ||= {};
        S.ui.referenceRecent = [entry.title, ...history().filter(name => name !== entry.title)].slice(0,6);
        save();
        entries.forEach(item => item.section.hidden = item !== entry);
        list.hidden = true; content.hidden = false; listButton.hidden = false;
        count.textContent = "説明を表示中";
        content.scrollTop = 0;
        title.focus({preventScroll:true});
      };
      title.tabIndex = -1;
      section.hidden = true;
      content.appendChild(section);
      row.appendChild(button);
      row.appendChild(pin);
      list.appendChild(row);
      entries.push(entry);
    });
    content.querySelectorAll("[data-go]").forEach(button => button.onclick = () => {
      const destination = button.dataset.go;
      dialog.close();
      go(destination);
    });
    loaded = true;
    showList();
  }
  trigger.onclick = () => {
    previousFocus = document.activeElement;
    load();
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    search.focus({preventScroll:true});
  };
  dialog.querySelector("[data-ref-close]").onclick = () => dialog.close();
  dialog.addEventListener("close", () => {
    document.body.style.overflow = previousOverflow;
    if(previousFocus?.isConnected) previousFocus.focus({preventScroll:true});
  });
  window.addEventListener("hashchange", () => { if(dialog.open) dialog.close(); });
  search.oninput = () => { list.scrollTop = 0; showList(); };
  allButton.onclick = () => { mode = "all"; showList(); };
  savedButton.onclick = () => { mode = "saved"; showList(); };
  recentButton.onclick = () => { mode = "recent"; showList(); };
  category.onchange = () => { list.scrollTop = 0; showList(); };
  clearButton.onclick = () => { search.value = ""; category.value = ""; mode = "all"; showList(); search.focus({preventScroll:true}); };
  dialog.addEventListener("keydown", event => {
    if(event.key === "Escape"){ event.preventDefault(); event.stopPropagation(); dialog.close(); }
  });
  listButton.onclick = () => {
    const lastButton = active?.button;
    showList();
    list.scrollTop = listScroll;
    lastButton?.focus({preventScroll:true});
  };
})();