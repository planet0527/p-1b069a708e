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
    <div class="reference-tools" aria-label="学習メモの絞り込み"><button type="button" class="btn" data-ref-all aria-pressed="true">すべて</button><button type="button" class="btn" data-ref-saved aria-pressed="false">保存した項目</button><button type="button" class="btn" data-ref-clear hidden>検索を消す</button></div>
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
  let onlySaved = false, listScroll = 0;
  let loaded = false, entries = [], active = null, previousFocus = null, previousOverflow = "";
  const pinned = title => Array.isArray(S.ui?.referencePins) && S.ui.referencePins.includes(title);
  function updatePins(){
    const total = entries.filter(entry => pinned(entry.title)).length;
    savedButton.textContent = "保存 " + total + "件";
    allButton.setAttribute("aria-pressed", String(!onlySaved));
    savedButton.setAttribute("aria-pressed", String(onlySaved));
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
    entries.forEach(entry => {
      const visible = (!onlySaved || pinned(entry.title)) && words.every(word => entry.text.includes(word));
      entry.row.hidden = !visible;
      if(visible) matches++;
    });
    count.textContent = matches ? matches + "件から選べます" : onlySaved && !entries.some(entry => pinned(entry.title)) ? "☆を押すと、よく見る項目をここに保存できます。" : "見つかりません。検索を消すか、すべての項目から探してください。";
    clearButton.hidden = !search.value;
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
      const entry = {section, button, row, pin, title:title.textContent, text:section.textContent.normalize("NFKC").toLowerCase()};
      pin.onclick = () => {
        S.ui ||= {};
        const pins = new Set(Array.isArray(S.ui.referencePins) ? S.ui.referencePins.filter(x => typeof x === "string") : []);
        if(pins.has(entry.title)) pins.delete(entry.title); else pins.add(entry.title);
        S.ui.referencePins = [...pins]; save();
        updatePins();
        showList();
      };
      button.onclick = () => {
        listScroll = list.scrollTop;
        active = entry;
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
  allButton.onclick = () => { onlySaved = false; showList(); };
  savedButton.onclick = () => { onlySaved = true; showList(); };
  clearButton.onclick = () => { search.value = ""; showList(); search.focus({preventScroll:true}); };
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