/* データベースの用語カードを、実際の小さな表で見せる */

/* 表の図：items は表かラベル
   表：{title, cols:[..], rows:[[..]], key:[列番号], fk:[列番号], hlRows:[..], hlCols:[..], hlCells:[[r,c]], xRows:[..], note}
   矢印：{arrow:"ラベル"} */
function TTables(f, c){
  const W = 320, RH = 22, soft = `color-mix(in srgb, ${c} 14%, var(--card))`, yel = "var(--mark)";
  const fit = (s, w, base = 12) => { s = String(s); let fs = base; const wid = x => [...x].reduce((a,ch) => a + (/[\x20-\x7e]/.test(ch) ? fs*0.58 : fs), 0); while(fs > 8.5 && wid(s) > w) fs -= 0.5; return fs; };
  const T = (x, y, s, w, {bold=false, color="var(--ink)", anchor="middle", base=12} = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" style="font-size:${fit(s, w, base)}px;font-weight:${bold?700:400};fill:${color};font-family:var(--font-body)">${s}</text>`;
  let y = 4, out = "", uid = "tt" + Math.random().toString(36).slice(2, 7);
  out += `<defs><marker id="${uid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:${c}"/></marker></defs>`;
  const row = f.side ? null : 0;
  /* 横並び（side:true）は2つの表を左右に、それ以外は縦に積む */
  const drawTable = (tb, x0, y0, w) => {
    const n = tb.cols.length, cw = w / n;
    let s = "";
    if(tb.title) s += T(x0 + w/2, y0 + 9, tb.title, w, {bold:true, color:c, base:12});
    const top = y0 + (tb.title ? 20 : 0);
    tb.cols.forEach((h, j) => {
      const isK = (tb.key||[]).includes(j), isF = (tb.fk||[]).includes(j), hl = (tb.hlCols||[]).includes(j);
      s += `<rect x="${x0 + j*cw}" y="${top}" width="${cw}" height="${RH}" style="fill:${hl ? yel : c};stroke:var(--card);stroke-width:1"/>`;
      s += T(x0 + j*cw + cw/2, top + RH/2 + 1, (isK ? "🔑" : isF ? "↗" : "") + h, cw - 6, {bold:true, color: hl ? "#18233b" : "#fff", base:11.5});
    });
    tb.rows.forEach((r, i) => {
      const ry = top + RH*(i+1), x = (tb.xRows||[]).includes(i), hr = (tb.hlRows||[]).includes(i);
      r.forEach((v, j) => {
        const hc = hr || (tb.hlCols||[]).includes(j) || (tb.hlCells||[]).some(([a,b]) => a === i && b === j);
        s += `<rect x="${x0 + j*cw}" y="${ry}" width="${cw}" height="${RH}" style="fill:${hc ? yel : (i%2 ? soft : "var(--card)")};stroke:var(--line);stroke-width:1"/>`;
        s += T(x0 + j*cw + cw/2, ry + RH/2 + 1, v, cw - 6, {color: x ? "var(--muted)" : "var(--ink)", base:11.5});
      });
      if(x) s += `<line x1="${x0+4}" y1="${ry + RH/2}" x2="${x0 + w - 4}" y2="${ry + RH/2}" style="stroke:var(--bad);stroke-width:2"/><text x="${x0 + w + 2}" y="${ry + RH/2 + 1}" dominant-baseline="middle" style="font-size:13px;font-weight:700;fill:var(--bad)">✕</text>`;
    });
    const h = (tb.title ? 20 : 0) + RH*(tb.rows.length + 1) + (tb.note ? 18 : 0);
    if(tb.note) s += T(x0 + w/2, y0 + h - 6, tb.note, w, {color:"var(--muted)", base:10.5});
    return {s, h};
  };
  if(f.side){
    const [a, b] = f.items.filter(x => x.cols), mid = f.items.find(x => x.arrow);
    const wa = a.w || 140, wb = b.w || 140, gap = W - wa - wb;
    const ta = drawTable(a, 0, y, wa), tb = drawTable(b, W - wb, y, wb);
    out += ta.s + tb.s;
    const hh = Math.max(ta.h, tb.h);
    if(mid){
      const ay = y + (mid.y || 40);
      out += `<path d="M${wa + 4} ${ay} L${W - wb - 6} ${ay}" style="stroke:${c};stroke-width:2;fill:none" marker-end="url(#${uid})"/>`;
      out += T(wa + gap/2, ay - 10, mid.arrow, gap + 10, {bold:true, color:c, base:10.5});
    }
    y += hh + 6;
  } else {
    f.items.forEach(it => {
      if(it.arrow){
        out += `<path d="M${W/2} ${y + 2} L${W/2} ${y + 20}" style="stroke:${c};stroke-width:2;fill:none" marker-end="url(#${uid})"/>`;
        out += T(W/2 + 10, y + 12, it.arrow, W/2 - 14, {bold:true, color:c, anchor:"start", base:11});
        y += 26;
      } else if(it.pair){
        const [a, b] = it.pair, wa = a.w || 154, wb = b.w || 154;
        const ta = drawTable(a, 0, y, wa), tb = drawTable(b, W - wb, y, wb);
        out += ta.s + tb.s; y += Math.max(ta.h, tb.h) + 6;
      } else {
        const w = it.w || W, x0 = (W - w) / 2, t = drawTable(it, x0, y, w);
        out += t.s; y += t.h + 6;
      }
    });
  }
  return `<svg viewBox="0 0 ${W + 14} ${y}" role="img" aria-label="${(f.label || "表の例").replace(/"/g,"")}">${out}</svg>`;
}

/* 各用語に、表の図と具体例を付ける */
const DBFIX = {
"正規化": {
  ex:"「注文表」に顧客の住所を毎回書くと、田中さんが引っ越したとき全部の行を直す必要があり、直し忘れると住所が食い違う。顧客の情報を別の表に分ければ、直すのは1か所だけ。",
  fig:{type:"tables", label:"正規化の前と後", items:[
    {title:"正規化の前：住所が何度も出てくる", cols:["注文番号","顧客名","住所","商品"], rows:[["1","田中","東京","ペン"],["2","田中","東京","ノート"],["3","佐藤","大阪","ペン"]], hlCols:[1,2]},
    {arrow:"顧客の情報を別の表に分ける"},
    {pair:[{title:"注文", cols:["注文番号","顧客番号","商品"], rows:[["1","C1","ペン"],["2","C1","ノート"],["3","C2","ペン"]], key:[0], fk:[1]},
           {title:"顧客", cols:["顧客番号","名前","住所"], rows:[["C1","田中","東京"],["C2","佐藤","大阪"]], key:[0], hlRows:[0]}]}
  ]}},
"主キーと外部キー": {
  ex:"社員表の「部署コード」は、部署表の主キー「部署コード」を指している外部キー。これで「鈴木さんは営業部」と2つの表をつなげられる。",
  fig:{type:"tables", side:true, label:"社員表の外部キーが部署表の主キーを指す", items:[
    {title:"社員", cols:["社員番号","氏名","部署"], rows:[["101","鈴木","D1"],["102","高橋","D2"],["103","伊藤","D1"]], key:[0], fk:[2], hlCols:[2], w:168},
    {arrow:"参照", y:60},
    {title:"部署", cols:["部署","部署名"], rows:[["D1","営業"],["D2","経理"]], key:[0], hlCols:[0], w:112}
  ]}},
"関係演算": {
  ex:"元の表から、「名前」と「点数」の列だけを取るのが射影、「点数が80以上」の行だけを取るのが選択。",
  fig:{type:"tables", label:"射影は列、選択は行を取り出す", items:[
    {title:"元の表", cols:["番号","名前","組","点数"], rows:[["1","青木","A","72"],["2","井上","B","85"],["3","上田","A","91"]]},
    {pair:[{title:"射影（列を取る）", cols:["名前","点数"], rows:[["青木","72"],["井上","85"],["上田","91"]], hlCols:[0,1]},
           {title:"選択（点数≧80の行）", cols:["番号","名前","点数"], rows:[["2","井上","85"],["3","上田","91"]], hlRows:[0,1]}]}
  ]}},
"SQLの集計": {
  ex:"学生ごとに平均点を出し（GROUP BY 学生）、平均が80点以上の学生だけ残す（HAVING AVG(点数) >= 80）。1行ずつの条件ならWHERE。",
  fig:{type:"tables", label:"GROUP BYでまとめてHAVINGで絞る", items:[
    {title:"得点表", cols:["学生","科目","点数"], rows:[["A","国語","90"],["A","数学","80"],["B","国語","60"],["B","数学","70"]], hlCols:[0]},
    {arrow:"GROUP BY 学生 で平均"},
    {title:"HAVING AVG(点数) >= 80", cols:["学生","平均点"], rows:[["A","85"],["B","65"]], hlRows:[0], xRows:[1], w:220}
  ]}},
"トランザクションとACID特性": {
  ex:"Aさんの口座から1万円を引いてBさんの口座に足す振込は、2つの更新でひとまとまり（トランザクション）。途中で止まったら両方とも取り消して、お金が消えないようにする（原子性）。",
  fig:{type:"tables", label:"振込は2つの更新をまとめて行う", items:[
    {title:"振込前", cols:["口座","残高"], rows:[["A","50,000"],["B","10,000"]], w:200},
    {arrow:"Aから1万円をBへ（両方セットで）"},
    {title:"振込後：両方そろって初めて完了", cols:["口座","残高"], rows:[["A","40,000"],["B","20,000"]], hlRows:[0,1], w:200, note:"片方だけ成功はダメ → 全部取り消す"}
  ]}},
"ロールバックとロールフォワード": {
  ex:"振込の途中で止まったら、更新前ログを使って振込前の残高に戻す（ロールバック）。ディスクが壊れたら、バックアップに更新後ログを順に当てて、完了した振込を再現する（ロールフォワード）。",
  fig:{type:"tables", label:"ログの更新前と更新後の値", items:[
    {title:"ログ（更新の記録）", cols:["処理","口座","更新前","更新後"], rows:[["T1","A","50,000","40,000"],["T1","B","10,000","20,000"]], hlCols:[2,3]},
    {pair:[{title:"ロールバック", cols:["使う値"], rows:[["更新前"]], hlCols:[0], note:"途中の処理を取り消す"},
           {title:"ロールフォワード", cols:["使う値"], rows:[["更新後"]], hlCols:[0], note:"完了した処理を再現する"}]}
  ]}},
"排他制御とデッドロック": {
  ex:"在庫が1個のとき、AさんとBさんが同時に買うと、両方とも「在庫1」を読んで売れてしまい、在庫が−1になる。Aさんが使っている間はロックしてBさんを待たせれば防げる。",
  fig:{type:"tables", label:"ロックしないと同時に更新して在庫がマイナスになる", items:[
    {title:"ロックなし：同時に買うと…", cols:["順番","Aさん","Bさん","在庫"], rows:[["1","在庫を読む(1)","","1"],["2","","在庫を読む(1)","1"],["3","1個買う","","0"],["4","","1個買う","−1"]], hlCells:[[3,3]]},
    {arrow:"Aさんの間はロックしてBさんは待つ"},
    {title:"ロックあり", cols:["順番","Aさん","Bさん","在庫"], rows:[["1","ロックして読む","待つ","1"],["2","買って解除","待つ","0"],["3","","在庫0で買えない","0"]], hlRows:[1]}
  ]}},
"E-R図": {
  ex:"1人の顧客は何回も注文できるが、1つの注文の客は1人だけ → 顧客と注文は「1対多」。注文表に顧客番号（外部キー）を持たせて表す。",
  fig:{type:"tables", side:true, label:"顧客1人に対して注文が多", items:[
    {title:"顧客（1）", cols:["顧客番号","名前"], rows:[["C1","田中"],["C2","佐藤"]], key:[0], hlRows:[0], w:126},
    {arrow:"1 対 多", y:50},
    {title:"注文（多）", cols:["注文番号","顧客番号"], rows:[["1","C1"],["2","C1"],["3","C2"]], key:[0], fk:[1], hlRows:[0,1], w:150}
  ]}},
"インデックス": {
  ex:"「名前」で並べた索引を作っておけば、全部の行を上から探さなくても、索引を見て「上田は3行目」とすぐ分かる。ただし行を追加するたびに索引も直すので、更新は少し遅くなる。",
  fig:{type:"tables", side:true, label:"名前のインデックスから行の場所が分かる", items:[
    {title:"インデックス（名前順）", cols:["名前","行"], rows:[["青木","2"],["井上","4"],["上田","3"],["江藤","1"]], hlRows:[2], w:120},
    {arrow:"3行目へ", y:80},
    {title:"表（追加された順）", cols:["行","名前","点数"], rows:[["1","江藤","70"],["2","青木","72"],["3","上田","91"],["4","井上","85"]], hlRows:[2], w:156}
  ]}},
"ビュー": {
  ex:"社員表には給与も入っているが、営業部の人には見せたくない。「営業部の氏名だけ」を取り出すビューを作って見せれば、給与は隠したまま使える。",
  fig:{type:"tables", label:"実表から一部だけを見せる仮想の表", items:[
    {title:"社員（実表）", cols:["氏名","部署","給与"], rows:[["鈴木","営業","30万"],["高橋","経理","28万"],["伊藤","営業","32万"]], hlCells:[[0,0],[2,0]]},
    {arrow:"SELECT 氏名 … WHERE 部署='営業'"},
    {title:"ビュー：営業部名簿（データは持たない）", cols:["氏名"], rows:[["鈴木"],["伊藤"]], hlCols:[0], w:220, note:"給与は見えない"}
  ]}},
"参照制約": {
  ex:"部署表にない部署コード「D9」の社員は登録できない。存在しない部署を指す、ちぐはぐなデータを防ぐ。",
  fig:{type:"tables", side:true, label:"存在しない部署コードは登録できない", items:[
    {title:"社員に追加しようとした行", cols:["社員","部署"], rows:[["104","D1"],["105","D9"]], fk:[1], hlRows:[0], xRows:[1], w:128},
    {arrow:"ある？", y:52},
    {title:"部署", cols:["部署","部署名"], rows:[["D1","営業"],["D2","経理"]], key:[0], hlRows:[0], w:126}
  ]}},
"NoSQLとKVS": {
  ex:"KVSは「キー」と「値」の組だけで保存する。決まった列の形がないので、ログイン情報やゲームのセーブデータなど、大量で形のバラバラなデータを高速に出し入れできる。",
  fig:{type:"tables", label:"キーと値の組で保存する", items:[
    {title:"KVS（キーと値の組）", cols:["キー","値"], rows:[["user:101","{名前:鈴木}"],["cart:101","[ペン, ノート]"],["score:101","1250"]], hlCols:[0]},
    {arrow:"キーを指定すると値がすぐ出る"},
    {title:"取り出し", cols:["キー","値"], rows:[["score:101","1250"]], hlRows:[0], w:220}
  ]}},
"2相コミット": {
  ex:"東京と大阪の2つのデータベースにまたがる振込。まず両方に「確定できる？」と聞き（第1相）、両方OKなら一斉に確定（第2相）。1つでもNGなら両方取り消す。",
  fig:{type:"tables", label:"全拠点がOKなら確定、1つでもNGなら取り消す", items:[
    {title:"第1相：準備できた？", cols:["拠点","返事"], rows:[["東京","OK"],["大阪","OK"]], hlCols:[1], w:220},
    {arrow:"全員OKなら"},
    {title:"第2相：一斉に確定（コミット）", cols:["拠点","結果"], rows:[["東京","確定"],["大阪","確定"]], hlRows:[0,1], w:220, note:"1つでもNGなら全員取り消し（ロールバック）"}
  ]}},
"チェックポイント": {
  ex:"更新のたびにディスクへ書くと遅いので、メモリにためて、ときどき（チェックポイントで）まとめて書き出す。障害時はチェックポイントから先のログだけ処理し直せばよいので、回復が早い。",
  fig:{type:"tables", label:"チェックポイントより後だけやり直せばよい", items:[
    {title:"時間の流れ（CP＝チェックポイント）", cols:["更新1","更新2","CP","更新3","障害"], rows:[["ディスク済","ディスク済","書き出し","やり直す","✕"]], hlCells:[[0,3]], note:"回復は CP より後の更新3だけやり直せばよい"}
  ]}},
"3層スキーマ": {
  ex:"利用者が見る画面用の表（外部スキーマ）、データベース全体の表の設計（概念スキーマ）、ディスクへのしまい方（内部スキーマ）を分けておくと、どれかを変えても他に影響しにくい。",
  fig:{type:"layers", items:["外部スキーマ：利用者ごとの見え方（ビュー）","概念スキーマ：全体の表の設計","内部スキーマ：ディスクへのしまい方"], hl:1}},
"ストアドプロシージャ": {
  ex:"「在庫を減らす → 売上を記録する → ポイントを足す」という3つのSQLを、DBに『購入処理』として保存。アプリは名前を1回呼ぶだけで済み、通信の回数が減る。",
  fig:{type:"tables", label:"よく使うSQLのまとまりをDB側に保存する", items:[
    {title:"購入処理（DBに保存）", cols:["順番","中身のSQL"], rows:[["1","在庫を減らす"],["2","売上を記録"],["3","ポイントを足す"]], hlCols:[1], note:"アプリは「購入処理」を1回呼ぶだけ"}
  ]}}
};
TERMS.forEach(t => { const fx = DBFIX[t.t]; if(fx){ t.ex = fx.ex; t.fig = fx.fig; } });
