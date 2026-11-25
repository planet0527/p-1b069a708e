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
  dialog.innerHTML = `<div class="reference-head"><h2 id="reference-title">いつでも学習メモ</h2><button type="button" class="btn" data-ref-close>閉じて学習に戻る</button></div>
    <p class="small muted">問題を開いたまま確認できます。制限時間のある練習では、タイマーは進みます。</p>
    <label class="guide-search">知りたいことを探す<input type="search" data-ref-search placeholder="例：キャッシュ、SQL、誰の鍵"></label>
    <div class="row between"><p class="small muted" data-ref-count role="status"></p><button type="button" class="btn" data-ref-list hidden>項目一覧へ</button></div>
    <div class="reference-list"></div><div class="reference-content"></div>`;
  document.body.appendChild(dialog);
  const search = dialog.querySelector("[data-ref-search]");
  const count = dialog.querySelector("[data-ref-count]");
  const list = dialog.querySelector(".reference-list");
  const content = dialog.querySelector(".reference-content");
  const listButton = dialog.querySelector("[data-ref-list]");
  let loaded = false, entries = [], active = null, previousFocus = null, previousOverflow = "";

  function showList(){
    active = null;
    content.hidden = true;
    list.hidden = false;
    listButton.hidden = true;
    const words = search.value.normalize("NFKC").toLowerCase().trim().split(/\s+/).filter(Boolean);
    let matches = 0;
    entries.forEach(entry => {
      const visible = words.every(word => entry.text.includes(word));
      entry.button.hidden = !visible;
      if(visible) matches++;
    });
    count.textContent = matches ? matches + "件から選べます" : "見つかりません。別の言葉で探してください。";
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
      const entry = {section, button, text:section.textContent.normalize("NFKC").toLowerCase()};
      button.onclick = () => {
        active = entry;
        entries.forEach(item => item.section.hidden = item !== entry);
        list.hidden = true; content.hidden = false; listButton.hidden = false;
        count.textContent = title.textContent;
        content.scrollTop = 0;
        title.focus({preventScroll:true});
      };
      title.tabIndex = -1;
      section.hidden = true;
      content.appendChild(section);
      list.appendChild(button);
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
  search.oninput = showList;
  listButton.onclick = () => {
    const lastButton = active?.button;
    showList();
    lastButton?.focus({preventScroll:true});
  };
})();