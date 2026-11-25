/* 科目A攻略ガイド：知っておくと受験が楽になること */
function renderGuide(target = app){
  const host = target;
  host.innerHTML = pageHead("科目A攻略ガイド", "知識とは別に、知っているだけで点が取りやすくなるコツをまとめたよ。", "happy");
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

  host.insertAdjacentHTML("beforeend",

  sec("迷ったら、今の状態から選ぼう", "学び方", `
    <p>全部のメニューを毎回使う必要はありません。いま困っていることに合わせて、ひとつ選びましょう。</p>
    <div class="gcards">
      <div><b>説明を読んでも、そもそも何の話か分からない</b><span>レッスンの入門カードから。まず「何をするものか」をつかみ、細かい名前はあとで覚えます。</span><button type="button" class="btn wide" data-go="#lessons">入門から学ぶ</button></div>
      <div><b>用語は見たことがあるけれど、使う場面が浮かばない</b><span>用語ずかんで「使う場面を具体例で見る」を開きます。「どんな困りごとを解決するか」を一言で説明してみましょう。</span><button type="button" class="btn wide" data-go="#terms">利用例を読む</button></div>
      <div><b>説明を見れば分かるけれど、見ないと思い出せない</b><span>単語カードをめくる前に、意味を声に出すか頭で答えます。完璧な文章でなくても、役割を言えれば第一歩です。</span><button type="button" class="btn wide" data-go="#cards">思い出す練習をする</button></div>
      <div><b>知識が問題で使えるか確かめたい</b><span>問題演習で分野を選び、5問から。点数だけでなく、選んだ理由も確かめます。</span><button type="button" class="btn wide" data-go="#practice">5問から練習する</button></div>
    </div>`) +

  sec("ネット通販で、用語をつなげて考える", "全体像", `
    <p>用語はひとつずつ暗記するより、「同じサービスの中で担当が違う」と考えると整理できます。</p>
    <ol class="glist">
      <li><b>サイトを開く：</b>DNSがドメイン名に対応するIPアドレスを調べる。HTTPSでブラウザとサーバの通信内容を保護する。</li>
      <li><b>ログインする：</b>認証は「誰か」を確かめること。認可は「その人に何を許すか」を決めること。ログインできても、他人の注文まで見られるわけではありません。</li>
      <li><b>商品を探す：</b>データベースに商品や在庫を保存し、SQLで条件に合うデータを取り出す。データベースは整理された保管先、SQLは操作するための言語です。</li>
      <li><b>注文を確定する：</b>トランザクションで注文登録と在庫の減算をひとまとまりにする。排他制御で、最後の1個を複数の人が同時に確保する矛盾を防ぐ。</li>
      <li><b>サービスを続ける：</b>負荷分散でアクセスを複数のサーバに振り分ける。バックアップは失ったデータを復元するため、監視は異常に気づくために使う。</li>
    </ol>
    <p class="small muted">仕組みをつかむための簡略例です。実際のサービスでは、これらを組み合わせて設計します。</p>
    <button type="button" class="btn wide" data-go="#terms">気になった用語を調べる</button>`) +

  sec("間違いを4種類に分けて、次の練習を決める", "復習", `
    <div class="gcards">
      <div><b>① 知らなかった</b><span>定義と利用例を読む → 解説を閉じて「何のために使うか」を言う。名前だけ覚えて終わりにしません。</span></div>
      <div><b>② 似た言葉と混ざった</b><span>2語を並べて、違う所をひとつ言います。例：認証は「誰？」、認可は「何をしてよい？」。</span></div>
      <div><b>③ 計算の途中で間違えた</b><span>最初に単位をそろえ、式と代入した数字を分けて書きます。答えだけでなく、どの行からずれたかを確認します。</span></div>
      <div><b>④ 問題文を読み違えた</b><span>「適切でない」「最も」「単位」など、見落とした条件を一言メモ。次の問題ではその条件を先に確認します。</span></div>
    </div>
    <p>解説を読んだ直後に解けても、覚えたとは限りません。次の学習時にも、解説を見ずに答えと理由を確かめましょう。</p>
    <button type="button" class="btn wide" data-go="#notebook">間違いノートを確認する</button>`) +

  sec("「分かった」を確かめる3つの質問", "理解", `
    <ol class="glist">
      <li><b>何のために使う？</b> 解決する困りごとを一言で言えるか。</li>
      <li><b>実際にはどこで使う？</b> 通販・学校・仕事など、自分が想像できる場面をひとつ挙げられるか。</li>
      <li><b>似た用語と何が違う？</b> 選択肢を見て、正解の理由と別の選択肢が違う理由を言えるか。</li>
    </ol>
    <div class="callout"><b>例：バックアップ</b><br>目的はデータを失ったときに戻せるようにすること。例は注文データのコピーを別の保存先に残すこと。二重化は故障時も動かし続けるための構成で、誤削除まで自動で防げるとは限りません。</div>
    <p class="small muted">キーワードは答えを考える手がかりです。同じ言葉が出ても、問われる条件が違えば答えは変わります。最後は問題文の条件と照らし合わせましょう。</p>`) +


  sec("計算前の単位チェック", "単位", `
    <p>式が合っていても、単位が違うと答えがずれます。計算の前に「何を求めるか」と「最後の単位」を書きましょう。</p>
    <details class="usage"><summary>単位のそろえ方と、伝送時間の例を見る</summary><div class="usage-body">
      <div class="ftable">
        <div><b>バイトとビット</b><span>1 B（バイト）＝8 bit。Bからbitへは×8、bitからBへは÷8。通信速度のbit/sと、ファイル容量のBをそのまま割りません。</span></div>
        <div><b>割合</b><span>80％＝0.8。式へ代入するときは100で割る。利用できる速度が80％なら、100 Mbit/s × 0.8＝80 Mbit/sです。</span></div>
        <div><b>時間</b><span>1秒＝1,000 ms＝1,000,000 μs＝1,000,000,000 ns。10 ns＝0.00000001秒。アクセス時間を足す前にも単位をそろえます。</span></div>
        <div><b>回転数</b><span>6,000回転/分なら、1秒に100回転。1回転は0.01秒＝10 ms、平均回転待ち時間はその半分の5 msです。</span></div>
        <div><b>k・MとKi・Mi</b><span>1 kB＝1,000 B、1 MB＝1,000,000 B。1 KiB＝1,024 B、1 MiB＝1,048,576 B。問題文に「1 M＝10の6乗」「1 K＝1,024」などの指定があれば、その指定で計算します。</span></div>
      </div>
      <p><b>例：10 MBを100 Mbit/s、伝送効率80％で送る</b>ここでは1 M＝1,000,000とします。容量をbitにすると10×8＝80 Mbit。実際に使える速度は100×0.8＝80 Mbit/s。時間＝80÷80＝1秒です。効率が下がれば時間は長くなる、という方向も確かめます。</p>
      <p class="small muted">参考：<a href="https://pml.nist.gov/cuu/Units/binary.html" target="_blank" rel="noopener noreferrer">NIST：ビット・バイトと接頭語</a></p>
      <button type="button" class="btn calc wide" data-go="#drill">単位を意識して計算ドリルへ</button>
    </div></details>`) +

  sec("公式を使う前に、条件を確認する", "計算の条件", `
    <p>公式は、前提が合うときに使える道具です。数字を入れる前に、問題文のこの部分を確認しましょう。</p>
    <details class="usage"><summary>その式を使える条件と、よくある取り違えを見る</summary><div class="usage-body">
      <div class="gcards">
        <div><b>稼働率：直列か、並列か</b><span>両方が動いていないと使えないなら直列。どちらか一方が動けば使えるなら並列です。故障が独立という前提で、直列はA×B、並列は1−(1−A)(1−B)。共通の電源故障などを含むと、単純にこの式だけでは扱えません。</span></div>
        <div><b>キャッシュ：主記憶の時間は何を含む？</b><span>問題が示す「ヒット時の所要時間」と「ミス時の所要時間」を分け、ヒット時×ヒット率＋ミス時×ミス率で考えます。ミス時にキャッシュ確認時間も別途かかる設定なら、それも含めます。</span></div>
        <div><b>IPアドレス：ホスト部は何ビット？</b><span>通常のIPv4サブネットなら、/24はホスト部が32−24＝8ビット。アドレスは256個、ネットワークアドレスとブロードキャストを除くホスト用は254個。特殊な/31・/32などに「−2」を機械的に当てはめません。</span></div>
        <div><b>工数：人数を増やせば必ず短くなる？</b><span>12人日を3人で行うと4日になるのは、同じ能率で均等に分担できる設定のとき。前の作業が終わるまで始められない工程や、連絡・引継ぎの時間があれば別に考えます。</span></div>
        <div><b>日数：全部足すか、長い経路を選ぶか</b><span>順番に行う作業は足し、並行する経路は長いほうを待ちます。A→Bが3＋5＝8日、C→Dが4＋6＝10日なら、両方が終わるまで10日です。</span></div>
      </div>
      <button type="button" class="btn calc wide" data-go="#drill">条件を読みながら練習する</button>
    </div></details>`) +

  sec("似た用語は、場面で選び分ける", "確認問題", `
    <p>先に自分で答えてから開きましょう。正解したかだけでなく、「もう一方ではない理由」まで説明できれば理解が進んでいます。</p>
    <details class="usage"><summary>① 学籍番号とパスワードで本人か確かめる。認証？ 認可？</summary><div class="usage-body"><p><b>答え：認証</b>認証は「あなたは誰か」を確かめること。認可は「成績を見てよい」「編集してよい」といった操作を許可することです。ログインできたことと、全員の成績を編集できることは別です。</p></div></details>
    <details class="usage"><summary>② 商品表から「価格が1,000円以下の行」を取り出す。選択？ 射影？</summary><div class="usage-body"><p><b>答え：選択</b>選択は条件に合う行を取り出すこと。射影は「商品名と価格だけ」のように列を取り出すことです。行は商品の1件分、列は商品名や価格という項目です。</p></div></details>
    <details class="usage"><summary>③ 障害中なので、まず代替手段でサービスを復旧する。インシデント管理？ 問題管理？</summary><div class="usage-body"><p><b>答え：インシデント管理</b>まず利用できる状態へ戻すことを重視します。問題管理は、再発を防ぐために原因や対策を扱うこと。原因調査の完了を待たずに復旧を進める場合があります。</p></div></details>
    <details class="usage"><summary>④ 日曜にフル、月曜と火曜に変更分を保存。火曜分を戻すのに月曜分も必要なのは、差分？ 増分？</summary><div class="usage-body"><p><b>答え：増分バックアップ</b>この例では、増分は直前のバックアップからの変更なので、日曜フル＋月曜増分＋火曜増分を順に使います。差分なら最後のフルからの変更をまとめるので、日曜フル＋火曜差分で戻します。</p></div></details>
    <details class="usage"><summary>⑤ 停電したとき、機械を安全な状態へ停止させる設計は、フェールセーフ？ フェールソフト？</summary><div class="usage-body"><p><b>答え：フェールセーフ</b>故障時の安全を優先する設計です。フェールソフトは、故障しても機能や性能を落として動き続ける考え方。「止まるか」だけでなく「安全を守る目的か、機能を縮小して継続する目的か」を見ます。</p></div></details>
    <button type="button" class="btn wide" data-go="#game">仕分けゲームで区別を練習する</button>`) +


  sec("処理を1行ずつ追う練習", "アルゴリズム", `
    <p>プログラムを頭の中だけで動かそうとせず、変数の値を紙に書きます。代入のたびに更新し、条件を判定した時点の値を使いましょう。</p>
    <details class="usage"><summary>① 代入と入れ替え：a ← b は、何をする？</summary><div class="usage-body">
      <p><b>代入は、右の値を左へ保存すること</b>a ← b は「bの値をaへ入れる」。数学の等式と違い、aとbをずっと同じ値に保つ約束ではありません。bの元の値も消えません。</p>
      <p>最初にa＝2、b＝5として、a ← b、b ← a の順に行うと、aもbも5になります。最初の処理でaの2が上書きされるからです。</p>
      <div class="ftable">
        <div><b>入れ替えたいなら</b><span>一時保存する変数tempを用意します。</span></div>
        <div><b>temp ← a</b><span>temp＝2、a＝2、b＝5</span></div>
        <div><b>a ← b</b><span>temp＝2、a＝5、b＝5</span></div>
        <div><b>b ← temp</b><span>temp＝2、a＝5、b＝2。元の値を失わず入れ替えられました。</span></div>
      </div>
      <p class="small muted">このガイドでは「←」を代入に使います。実際の問題では、代入・比較・配列の添字などの表記ルールを先に確認してください。</p>
    </div></details>
    <details class="usage"><summary>② 繰り返し：合計が変わる様子を追ってみる</summary><div class="usage-body">
      <p><b>例：1から3まで足す</b>最初はsum＝0、i＝1。「iが3以下なら、sum ← sum＋i、i ← i＋1を行って、また条件を調べる」とします。</p>
      <div class="ftable">
        <div><b>1回目</b><span>i＝1なので条件は真。sumは0＋1＝1へ、iは2へ更新。</span></div>
        <div><b>2回目</b><span>i＝2なので条件は真。sumは1＋2＝3へ、iは3へ更新。</span></div>
        <div><b>3回目</b><span>i＝3なので条件は真。sumは3＋3＝6へ、iは4へ更新。</span></div>
        <div><b>終了の確認</b><span>i＝4では「3以下」が偽。処理は行わず終了。最終値はsum＝6、i＝4です。</span></div>
      </div>
      <p><b>間違いやすい所</b>足す前にiを増やすと別の計算になります。「3未満」と「3以下」でも回数が変わります。答えが合計か、繰り返し回数か、終了時のiかも確認しましょう。</p>
    </div></details>
    <details class="usage"><summary>③ スタックとキュー：同じ順に入れても、出る順は違う</summary><div class="usage-body">
      <p>A、B、Cの順に入れたとします。スタックは本を積むイメージで、最後に入れたCから取り出します。キューは行列のイメージで、先に入れたAから取り出します。</p>
      <div class="ftable">
        <div><b>スタック：後入れ先出し</b><span>A、B、Cを入れる → Cを出す → Dを入れる → 次に出るのはD。残るのはA、Bです。</span></div>
        <div><b>キュー：先入れ先出し</b><span>A、B、Cを入れる → Aを出す → Dを入れる → 次に出るのはB。残るのはC、Dです。</span></div>
      </div>
      <p><b>紙に書くとき</b>スタックなら「取り出す側」を、キューなら「先頭と末尾」を決めて書きます。追加・取り出しのたびに、残った要素を更新しましょう。</p>
    </div></details>
    <details class="usage"><summary>確認：同時に更新するつもりでも、順番に代入すると？</summary><div class="usage-body">
      <p>最初はx＝3、y＝4。x ← x＋y、y ← x−y の順に行うと、最後のxとyはいくつでしょう？ 答えを見る前に、1行目の後の値を書いてみましょう。</p>
      <details class="usage"><summary>答えと理由を見る</summary><div class="usage-body"><p><b>x＝7、y＝3</b>1行目でxは3＋4＝7に変わります。2行目は更新後のxを使うので、yは7−4＝3。最初のx＝3を使って「−1」とするのが取り違えです。</p></div></details>
    </div></details>
    <button type="button" class="btn wide" data-go="#lessons">基礎理論・アルゴリズムを学ぶ</button>`) +


  sec("暗号化・ハッシュ・エンコードは、目的で分ける", "データの保護", `
    <p>見た目が読めない文字列になっていても、同じ仕組みとは限りません。「元に戻す必要があるか」「秘密を守りたいか」を考えます。</p>
    <details class="usage"><summary>3つの違いを、同じデータで比べる</summary><div class="usage-body">
      <div class="gcards">
        <div><b>暗号化：許可された相手が元の内容を読めるように守る</b><span>例：住所を暗号文にして保管し、配送処理のときに適切な鍵で復号する。鍵の管理が必要です。「暗号化したから誰でも安全に配れる」とは限りません。</span></div>
        <div><b>ハッシュ：元の内容から、照合に使う値を計算する</b><span>例：配布ファイルのハッシュ値を計算し、信頼できる場所で公開された値と比べる。値が違えば内容は同じではありません。ハッシュ値から元のファイルへ復号する操作はありません。</span></div>
        <div><b>エンコード：やり取りできる表現へ変える</b><span>例：ABCをBase64にするとQUJD。決まったルールでABCへ戻せますが、秘密鍵は不要なので、これだけでは内容を隠せません。文字化けや送受信の都合に対応する表現変換です。</span></div>
      </div>
      <p><b>ハッシュの注意点</b>同じ方式では出力の長さが決まるため、異なる入力が同じ値になる「衝突」はあり得ます。ハッシュ値が一致することを、数学的に絶対同一という意味で扱いません。また、ファイルと確認用の値が両方すり替わると見抜けないので、比較する値の入手元も大切です。</p>
      <p><b>パスワード保存は、単に一度ハッシュすればよい？</b>いいえ。専用のパスワードハッシュ方式とソルトを使います。ソルトは利用者ごとなどに付けるランダムな値で、同じパスワードの計算結果をそのまま使い回しにくくします。短い候補の総当たりまで不可能にするわけではありません。</p>
      <p class="small muted">参考：<a href="https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer">OWASP：パスワード保存</a></p>
    </div></details>
    <details class="usage"><summary>確認：Base64にしたパスワードなら、安全に公開できる？</summary><div class="usage-body"><p><b>答え：できません</b>Base64は表現の変換で、ルールを知っていれば元へ戻せます。「読めない見た目」と「秘密として保護されていること」を分けて考えましょう。</p></div></details>
    <button type="button" class="btn wide" data-go="#terms">関連する用語を調べる</button>`) +

  sec("認証・認可・署名は、確かめる対象が違う", "セキュリティの役割", `
    <p>「確認する仕組み」とだけ覚えると混ざりやすくなります。何を確かめたいのかまでセットで覚えましょう。</p>
    <details class="usage"><summary>学校の成績システムで、役割を比べる</summary><div class="usage-body">
      <div class="ftable">
        <div><b>認証：誰なのか</b><span>ログインした人が、登録された学生本人かを確認する。多要素認証は、知っているもの・持っているもの・身体の特徴など、異なる種類の要素を組み合わせる考え方です。</span></div>
        <div><b>認可：何をしてよいか</b><span>学生には自分の成績の閲覧を、担当教員には担当科目の成績入力を許可する。本人確認ができても、全員に同じ権限を与えるわけではありません。</span></div>
        <div><b>デジタル署名：誰が署名し、変更されていないか</b><span>学校が発行する電子文書へ秘密鍵で署名し、受け取った人が対応する公開鍵で検証する。公開鍵が学校のものだと信頼できることも必要です。署名だけでは文書の中身は隠れません。</span></div>
      </div>
      <p><b>多要素と、手順が2回あることは同じ？</b>同じではありません。パスワードと秘密の質問は、どちらも「知っているもの」。入力が2回でも、それだけで異なる要素を使ったことにはなりません。</p>
      <p class="small muted">参考：<a href="https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer">OWASP：認可</a> ／ <a href="https://csrc.nist.gov/glossary/term/digital_signature" target="_blank" rel="noopener noreferrer">NIST：デジタル署名</a></p>
    </div></details>
    <details class="usage"><summary>確認：ログインできた学生が、他人の成績も見られる。どの確認が足りない？</summary><div class="usage-body"><p><b>答え：認可・アクセス制御の確認</b>ログインで本人を確かめることと、そのデータを閲覧してよいか確かめることは別です。画面のボタンを隠すだけでなく、データを返す側でも権限を確認する必要があります。</p></div></details>
    <details class="usage"><summary>確認：署名が正しく検証できれば、文書は暗号化されている？</summary><div class="usage-body"><p><b>答え：暗号化されているとは限りません</b>署名は署名者や内容の改変を確かめるためのもの。第三者に内容を読まれないようにするには、別に適切な暗号化などを組み合わせます。</p></div></details>
    <button type="button" class="btn wide" data-go="#practice">役割の違いを問題演習で確かめる</button>`) +


  sec("小さな注文表で、SQLの結果を読む", "データベース", `
    <p>最初に「1行が何を表すか」を確認しましょう。この注文表は1行が1件の注文です。同じ会員が何度も注文するので、会員IDは重複します。</p>
    <div class="guide-table-wrap" role="region" aria-label="例に使う注文表" tabindex="0"><table class="guide-table"><caption>注文表 orders（金額は円）</caption><thead><tr><th scope="col">order_id</th><th scope="col">member_id</th><th scope="col">amount</th></tr></thead><tbody><tr><td>101</td><td>A</td><td>500</td></tr><tr><td>102</td><td>A</td><td>1,200</td></tr><tr><td>103</td><td>B</td><td>800</td></tr><tr><td>104</td><td>B</td><td>800</td></tr></tbody></table></div>
    <p class="small muted">order_id＝注文ID、member_id＝会員ID、amount＝注文金額。以下はこの4件だけを使う練習です。</p>
    <details class="usage"><summary>① WHEREとSELECT：どの行から、どの列を出す？</summary><div class="usage-body">
      <pre class="guide-sql"><code>SELECT order_id, amount
FROM orders
WHERE amount &gt;= 800
ORDER BY order_id;</code></pre>
      <p><b>結果：102・1,200円、103・800円、104・800円の3行</b>WHEREで金額が800円以上の行を残し、SELECTで注文IDと金額の列を出します。ORDER BYで注文IDの順に並べます。</p>
      <p>SELECTはSQL文のキーワードです。関係代数で「条件に合う行を取り出す」操作を選択、「列を取り出す」操作を射影と呼ぶこととは、名前を分けて理解しましょう。</p>
      <p class="small muted">ORDER BYがない場合、結果の並び順は保証されません。表の上から順に返ると思い込まないようにします。</p>
    </div></details>
    <details class="usage"><summary>② GROUP BYとHAVING：注文を会員ごとにまとめると？</summary><div class="usage-body">
      <pre class="guide-sql"><code>SELECT member_id, SUM(amount) AS total
FROM orders
GROUP BY member_id
HAVING SUM(amount) &gt;= 1700
ORDER BY member_id;</code></pre>
      <p><b>結果：会員A、合計1,700円の1行</b>Aは500＋1,200＝1,700円、Bは800＋800＝1,600円。GROUP BYで会員ごとに分けて合計し、HAVINGで合計1,700円以上のグループを残します。</p>
      <p><b>WHEREとの違い</b>WHEREは集計前の行、HAVINGは集計後のグループに条件を付けます。先にWHERE amount &gt;= 800を追加すると、Aの500円が集計から外れ、Aは1,200円、Bは1,600円。どちらもHAVINGを満たさず、結果は0行になります。</p>
      <p class="small muted">学習では「表を読む → WHEREで行を絞る → GROUP BYでまとめる → HAVINGでグループを絞る → 出す列を選ぶ → 並べる」と考えます。データベース内部の実行手順そのものを表すわけではありません。</p>
    </div></details>
    <details class="usage"><summary>③ 主キーと外部キー：同じ会員IDが2回あってもよい？</summary><div class="usage-body">
      <p><b>注文表の主キーはorder_id</b>この例では注文を一意に識別するIDです。主キーは重複もNULLも許しません。会員IDでは、Aの注文が2件あるので1件を特定できません。</p>
      <p><b>会員表 membersが別にあるとします</b>会員表の主キーmember_idに、A＝あおい、B＝ひなたが登録されているとします。注文表のmember_idをそれへの外部キーにすれば、どの会員の注文かを対応付けられます。注文側のAやBは何回現れても構いません。</p>
      <pre class="guide-sql"><code>SELECT o.order_id, m.name
FROM orders AS o
JOIN members AS m
  ON o.member_id = m.member_id
ORDER BY o.order_id;</code></pre>
      <p><b>結合した結果</b>101＝あおい、102＝あおい、103＝ひなた、104＝ひなた。注文と会員は「何行目か」ではなく、IDが一致するかで結びます。</p>
      <p class="small muted">外部キー制約は、参照先に存在しないIDを入れる矛盾を防ぎます。外部キー自体の重複を禁止するものではありません。NULLも禁止したい場合はNOT NULLなどの指定が必要です。</p>
    </div></details>
    <details class="usage"><summary>確認：会員Bの金額800円の注文は、1件？ 2件？</summary><div class="usage-body">
      <p><b>答え：2件</b>注文ID103と104は別の注文です。金額が同じでも、勝手に1行へまとめません。COUNT(*)で会員Bの注文を数えると2件、SUM(amount)なら1,600円です。</p>
      <p>SELECT DISTINCT amount FROM orders WHERE member_id = 'B' は「異なる金額」を出すので、800の1行になります。「注文が何件あるか」と「金額の種類がいくつあるか」は別の質問です。</p>
      <p class="small muted">補足：COUNT(*)は行数、COUNT(列名)はその列がNULLでない行数を数えます。NULLを0や空文字と同じ値として扱わないようにしましょう。</p>
    </div></details>
    <p class="small muted">参考：PostgreSQL公式 <a href="https://www.postgresql.org/docs/current/tutorial-agg.html" target="_blank" rel="noopener noreferrer">集計</a> ／ <a href="https://www.postgresql.org/docs/current/ddl-constraints.html" target="_blank" rel="noopener noreferrer">制約とキー</a></p>
    <button type="button" class="btn wide" data-go="#lessons">データベースのレッスンを選ぶ</button>`) +

  sec("動かして理解する：入れる・探す・読み出す", "アルゴリズム", motionHTML()) +

  sec("動かして理解する：整列・通信・ロック", "全体像", `<p>値の移動、宛先の確認、順番待ちを、図と途中の状態で追います。</p><details class="usage"><summary>バブルソート：比較と入れ替えの違い</summary><div class="usage-body" data-motion="sort"></div></details><details class="usage"><summary>DNS・ARP・ルータ：どの宛先を調べる？</summary><div class="usage-body" data-motion="network"></div></details><details class="usage"><summary>排他制御とデッドロック：なぜ待つ？</summary><div class="usage-body" data-motion="lock"></div></details><p class="small muted">参考：<a href="https://www.rfc-editor.org/rfc/rfc826" target="_blank" rel="noopener noreferrer">ARP（RFC 826）</a> ／ <a href="https://www.postgresql.org/docs/current/explicit-locking.html" target="_blank" rel="noopener noreferrer">PostgreSQL：ロック</a></p>`) +

  sec("条件を変えて理解する：論理・IP・日程", "全体像", `<p>入力や条件を変え、結果の変化を図で確かめます。初めの値と変えた後の値を比べてみましょう。</p><details class="usage"><summary>論理演算：AND・OR・XOR・NOTを切り替える</summary><div class="usage-body" data-motion="logic"></div></details><details class="usage"><summary>IPアドレス：ネットワーク部とホスト部を色分けする</summary><div class="usage-body" data-motion="subnet"></div></details><details class="usage"><summary>クリティカルパス：短縮する作業で全体の日数は変わる？</summary><div class="usage-body" data-motion="path"></div></details>`) +

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
      <div><b>③ 言い切りの条件を確かめる</b><span>「必ず」「すべて」とあったら、例外がないか確認する。強い表現という理由だけでは消さず、定義と条件で判断する</span></div>
      <div><b>④ キーワードから候補を考える</b><span>「バンク」→インタリーブ、「魚の骨」→特性要因図、「試作品」→プロトタイピング、「報酬」→強化学習</span></div>
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

  sec("まぎらわしい用語の見分け表", "ひっかけ", `
    <p class="small muted">選択肢でよく入れ替えられるペア。左右の違いを1語で覚えます。</p>
    <div class="ftable">
      ${[["フェールセーフ","壊れたら安全側に止める（信号を赤に）"],["フェールソフト","壊れても機能を落として動き続ける"],["フールプルーフ","人が間違えても事故にならない"],["フォールトトレランス","壊れても全体は止まらない（二重化）"],
         ["IDS","侵入を検知して知らせる"],["IPS","侵入を検知して止める"],
         ["射影","列を選ぶ"],["選択","行を選ぶ"],
         ["ロールバック","更新前ログで元に戻す"],["ロールフォワード","更新後ログでやり直す"],
         ["インシデント管理","まず早く復旧させる"],["問題管理","根本原因を突き止める"],
         ["差分バックアップ","前回のフル以降の変更すべて"],["増分バックアップ","前回のバックアップ以降の変更だけ"],
         ["請負","完成に責任・受注側が指示"],["派遣","派遣先が指示"],
         ["ホットスタンバイ","予備機が起動済みですぐ切替"],["コールドスタンバイ","予備機は止まっていて準備が必要"],
         ["結合テスト","モジュールのつなぎ目を確認"],["システムテスト","システム全体を要件と照らす"]]
        .map(([a,b])=>`<div><b>${gl(a)}</b><span>${gl(b)}</span></div>`).join("")}
    </div>`) +

  sec("問題文のキーワード → 答え", "即答", `
    <p class="small muted">この言い回しが出たら、まずこの答えを疑う。</p>
    <div class="ftable">
      ${[["改ざんされていないか確かめる","ハッシュ値・デジタル署名"],["送信者が本人か確かめる","デジタル署名（送信者の秘密鍵）"],["公開鍵が本物か保証する","認証局（CA）のデジタル証明書"],
         ["社内も信用せず毎回確認","ゼロトラスト"],["1つの装置に複数の防御機能","UTM"],["Webアプリへの攻撃を防ぐ","WAF"],
         ["IPからMACアドレスを調べる","ARP"],["IPアドレスを自動で割り当て","DHCP"],["ドメイン名からIPアドレス","DNS"],
         ["列の値が別の表の主キーにある","外部キー（参照制約）"],["同時に更新して矛盾しない","排他制御（ロック）"],
         ["いちばん長い経路","クリティカルパス"],["要員を増やして短縮","クラッシング"],["作業を並行して短縮","ファストトラッキング"],
         ["正解データで学習","教師あり学習"],["試行錯誤と報酬で学習","強化学習"],["もっともらしい誤り","ハルシネーション"],
         ["強み・弱み・機会・脅威","SWOT分析"],["花形・金のなる木・問題児・負け犬","PPM"],["魚の骨","特性要因図"],["上位の少数で大部分","パレート図・ABC分析"]]
        .map(([a,b])=>`<div><b>${gl(a)}</b><span>${gl(b)}</span></div>`).join("")}
    </div>`) +

  sec("略語は分解すれば読める", "略語", `
    <p class="small muted">知らない略語でも、よく出る部品から意味を推測できます。くわしくは<button type="button" class="linkbtn" data-go="#glossary">略語ずかん</button>で。</p>
    <div class="ftable">
      ${[["…M","Management（管理）：ISMS、ITSM、CRM、SCM、MDM"],["…P","Protocol（通信の約束）／Plan（計画）：HTTP、DHCP、BCP"],["…S","System／Service：DNS、IDS、IPS、SaaS"],
         ["…A","Agreement（合意）：SLA、NDA"],["I…","Information／Internet：IoT、ISMS"],["R","Request（依頼）／Response（対応）：RFP、RFI、EDR"],
         ["Ia／Pa／Saa","Infrastructure／Platform／Software as a Service"],["KG／KP／KS","Key Goal／Performance／Success"]]
        .map(([a,b])=>`<div><b>${a}</b><span>${b}</span></div>`).join("")}
    </div>`) +

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


  const guideSections = [...host.querySelectorAll("section.guide")];
  const guideMenu = guideSections.map((section, i) => {
    const heading = section.querySelector("h2");
    heading.tabIndex = -1;
    return `<button type="button" class="btn" data-guide-jump="${i}">${esc(heading.textContent)}</button>`;
  }).join("");
  guideSections[0]?.insertAdjacentHTML("beforebegin", `<nav class="panel guide-index" aria-label="攻略ガイドの目次"><h2>読みたい項目を選ぶ</h2><p class="small muted">目的の説明へ移動します。ページ上部の「項目一覧へ」で、ここへ戻れます。</p><details class="usage"><summary>目次を開く</summary><div class="usage-body guide-index-list">${guideMenu}</div></details></nav><button type="button" class="btn guide-index-back">↑ 項目一覧へ</button>`);
  const guideIndex = host.querySelector(".guide-index");
  guideIndex?.insertAdjacentHTML("afterbegin", '<label class="guide-search">説明を探す<input type="search" data-guide-search placeholder="例：単位、SQL、認証"></label><p class="small muted" data-guide-count role="status"></p>');
  const guideSearch = host.querySelector("[data-guide-search]");
  const guideCount = host.querySelector("[data-guide-count]");
  if(guideSearch) guideSearch.oninput = () => {
    const words = guideSearch.value.normalize("NFKC").toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    guideSections.forEach((section, i) => {
      const text = section.textContent.normalize("NFKC").toLowerCase();
      const visible = words.every(word => text.includes(word));
      section.hidden = !visible;
      const button = host.querySelector(`[data-guide-jump="${i}"]`);
      if(button) button.hidden = !visible;
      if(visible) count++;
    });
    guideCount.textContent = words.length ? (count ? count + "件の説明が見つかりました" : "見つかりません。短い言葉で探すか、検索欄を空にしてください。") : "";
    const details = guideIndex.querySelector("details");
    if(words.length && details) details.open = true;
  };
  host.querySelectorAll("[data-guide-jump]").forEach(button => button.onclick = () => {
    const heading = guideSections[Number(button.dataset.guideJump)]?.querySelector("h2");
    heading?.focus({preventScroll:true});
    heading?.scrollIntoView({block:"start",behavior:"auto"});
  });
  const indexBack = host.querySelector(".guide-index-back");
  if(indexBack) indexBack.onclick = () => {
    const summary = host.querySelector(".guide-index summary");
    summary.focus({preventScroll:true});
    summary.scrollIntoView({block:"start",behavior:"auto"});
  };

  wireMotions(host);
  host.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  host.querySelectorAll("[data-ck]").forEach(c => c.onchange = () => { S.guideCk ||= {}; S.guideCk[c.dataset.ck] = c.checked; save(); if(c.checked) burst(c, 8); });
}
