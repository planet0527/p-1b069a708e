/* 科目A攻略ガイド：知っておくと受験が楽になること */
function renderGuide(){
  app.innerHTML = pageHead("科目A攻略ガイド", "知識とは別に、知っているだけで点が取りやすくなるコツをまとめたよ。", "happy");
  const sec = (title, tag, body) => `<section class="panel guide"><div class="row" style="gap:8px"><span class="gtag">${tag}</span><h2>${title}</h2></div>${body}</section>`;
  const gl = glosser();

  const timeline = `<figure><svg viewBox="0 0 340 128" role="img" aria-label="90分の使い方。1周目50分で解ける問題、2周目25分で計算と迷った問題、3周目10分で見直し、残り5分で空欄チェック">
    <rect x="4" y="34" width="${332*50/90}" height="36" rx="8" style="fill:var(--accent)"/>
    <rect x="${4+332*50/90}" y="34" width="${332*25/90}" height="36" rx="0" style="fill:var(--calc)"/>
    <rect x="${4+332*75/90}" y="34" width="${332*10/90}" height="36" style="fill:var(--good)"/>
    <rect x="${4+332*85/90}" y="34" width="${332*5/90}" height="36" rx="0" style="fill:var(--bad)"/>
    <text class="tw" x="${4+332*25/90}" y="57" text-anchor="middle">1周目 50分</text>
    <text class="tw" x="${4+332*62.5/90}" y="57" text-anchor="middle">2周目 25分</text>
    <text class="ts" x="336" y="26" text-anchor="end">見直し10分＋空欄チェック5分</text>
    
    <text class="ts" x="4" y="84">0分</text><text class="ts" x="336" y="84" text-anchor="end">90分</text>
    <text class="t" x="${4+332*25/90}" y="100" text-anchor="middle">すぐ解ける問題だけ</text>
    <text class="t" x="${4+332*62.5/90}" y="110" text-anchor="middle">計算・迷った問題</text>
    
  </svg></figure>`;

  app.insertAdjacentHTML("beforeend",
  sec("まず試験の形を知る", "基本", `
    <div class="gstats">
      <div><b class="num">60</b><span>問</span><small>四肢択一</small></div>
      <div><b class="num">90</b><span>分</span><small>1問あたり1.5分</small></div>
      <div><b class="num">600</b><span>点</span><small>1000点満点中</small></div>
    </div>
    <p class="small muted">基本情報技術者試験の科目Aの形です。受験の前に、IPAの公式サイトで最新の試験要項を確認してください。</p>`) +

  sec("90分の使い方：3周作戦", "時間", `
    ${timeline}
    <ol class="glist">
      <li><b>1周目は「すぐ解ける問題」だけ</b>。30秒考えて分からなければ、仮の答えを選んで印を付け、次へ進む</li>
      <li><b>2周目で計算問題と迷った問題</b>。印を付けた問題だけに時間を使う</li>
      <li><b>最後に空欄がないか確認</b>。間違いで減点はないので、分からなくても必ずどれかを選ぶ（4択なので25%は当たる）</li>
    </ol>
    <p class="small muted">1問目から順に全部考えると、後半のすぐ解ける問題までたどり着けなくなるのがいちばんの失敗パターンです。</p>`) +

  sec("選択肢の消し方", "テクニック", `
    <div class="gcards">
      <div><b>① 問題文の最後を先に読む</b><span>「適切な<u>もの</u>」か「適切で<u>ない</u>もの」か。逆に読むと、知っていても落とす</span></div>
      <div><b>② 似た用語の入れ替えを疑う</b><span>選択肢の多くは「別の用語の正しい説明」。射影⇔選択、フェールセーフ⇔フェールソフト、ロールバック⇔ロールフォワードなど</span></div>
      <div><b>③ 言い切りは怪しい</b><span>「必ず」「すべて」「〜できない」と強く言い切る選択肢は誤りのことが多い</span></div>
      <div><b>④ キーワードで即答</b><span>「バンク」→インタリーブ、「魚の骨」→特性要因図、「試作品」→プロトタイピング、「報酬」→強化学習</span></div>
      <div><b>⑤ 2つに絞れたら違いを比べる</b><span>残った2つで違う部分だけを見る。そこが問われているポイント</span></div>
    </div>`) +

  sec("計算問題は「型」で解く", "計算", `
    <p>科目Aの計算は難しい数学ではなく、決まった型の当てはめです。出たら下の型を思い出すだけ。</p>
    <div class="ftable">
      ${[["実効アクセス時間","キャッシュ×ヒット率 ＋ 主記憶×(1−ヒット率)"],
         ["稼働率","MTBF ÷ (MTBF＋MTTR)"],["直列 / 並列","A×B ／ 1−(1−A)(1−B)"],
         ["平均回転待ち","1回転の時間 ÷ 2"],["伝送時間","ビット数 ÷ (速度×効率)"],
         ["つなげる台数","2の(ホスト部)乗 − 2"],["命令数/秒","クロック周波数 ÷ CPI"],
         ["損益分岐点","固定費 ÷ (1−変動費率)"],["期間","工数 ÷ 人数"],["全体の日数","いちばん長い経路"]]
        .map(([a,b])=>`<div><b>${gl(a)}</b><span>${gl(b)}</span></div>`).join("")}
    </div>
    <div class="callout"><b>ひっかけの選択肢は「よくあるミスの答え」</b><br>×8を忘れる、2で割り忘れる、−2を忘れる、1−を忘れる。自分の答えが選択肢にあっても、この4つをもう一度確認。</div>
    <button type="button" class="btn calc wide" data-go="#drill">計算ドリルで練習する</button>`) +

  sec("覚えておくと一瞬で解ける数字", "暗記", `
    <div class="ftable">
      ${[["2の10乗","1,024（約1,000）"],["2の8乗","256（1バイトで表せる数）"],["k / M / G / T","千 / 100万 / 10億 / 1兆"],
         ["m / μ / n","1000分の1 / 100万分の1 / 10億分の1"],["1バイト","8ビット"],["1分","60秒（回転数/分は60で割る）"],
         ["IPv4 / IPv6","32ビット / 128ビット"],["HTTP / HTTPS","ポート80 / 443"],["ACID","原子性・一貫性・独立性・耐久性"],
         ["セキュリティ3要素","機密性・完全性・可用性"]].map(([a,b])=>`<div><b>${gl(a)}</b><span>${gl(b)}</span></div>`).join("")}
    </div>`) +

  sec("「誰の鍵？」は1行で覚える", "頻出", `
    <div class="gcards two">
      <div class="blue"><b>暗号化</b><span>受信者の<u>公開鍵</u>で閉める → 受信者の<u>秘密鍵</u>で開ける</span></div>
      <div class="orange"><b>デジタル署名</b><span>送信者の<u>秘密鍵</u>で署名 → 送信者の<u>公開鍵</u>で確かめる</span></div>
    </div>
    <p class="small muted">合言葉：「暗号化は受け取る人の鍵、署名は送る人の鍵」。毎回のように出ます。</p>`) +

  sec("点を取りやすい分野から固める", "戦略", `
    <p>全部を完ぺきにしなくても、600点（6割）あれば合格です。限られた時間は、点になりやすい所から使いましょう。</p>
    <ol class="glist">
      <li><b>暗記で取れる分野を先に固める</b>：ストラテジ系・マネジメント系は用語を覚えれば取れる問題が多い</li>
      <li><b>苦手な分野は★★★だけ</b>：テクノロジ系で苦手な所は、よく出る用語と計算の型に絞って深追いしない</li>
      <li><b>得意を落とさない</b>：得意な分野も直前に軽く復習して、取りこぼしを防ぐ</li>
    </ol>
    <button type="button" class="btn wide" data-go="#terms">用語ずかんで★★★を確認する</button>`) +

  sec("前日と当日のチェックリスト", "直前", `
    <ul class="checks">
      ${["受験日時・試験会場と、本人確認書類などの持ち物を確認した",
         "この攻略ガイドの「計算の型」と「誰の鍵？」を見直した",
         "用語ずかんの★★★を「かくして覚えるモード」で一周した",
         "前日はボス戦で8問以上を一度取って、自信をつけておく",
         "当日は「問題文の最後を先に読む」「空欄ゼロ」だけ意識する"]
        .map((t,i)=>`<li><label><input type="checkbox" data-ck="${i}" ${S.guideCk?.[i]?"checked":""}><span>${t}</span></label></li>`).join("")}
    </ul>`)
  );

  app.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  app.querySelectorAll("[data-ck]").forEach(c => c.onchange = () => { S.guideCk ||= {}; S.guideCk[c.dataset.ck] = c.checked; save(); if(c.checked) burst(c, 8); });
}
