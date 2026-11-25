/* 用語ずかん：頻出度（f：3＝よく出る〜1）と NEW（2024年10月以降のシラバス改訂で増えた分野の用語）付き
   fig の種類：flow（流れ）/ vs（比較）/ cycle（循環）/ layers（層）/ rows（一覧）/ formula（式）/ tree（分類）/ grid（4象限） */
const TCATS = [
  {id:"ai",   name:"AI・データ",       color:"#0d7c66"},
  {id:"sec",  name:"セキュリティ",     color:"#d0405a"},
  {id:"nw",   name:"ネットワーク",     color:"#1680c4"},
  {id:"db",   name:"データベース",     color:"#2b9457"},
  {id:"hw",   name:"コンピュータ",     color:"#2b62cf"},
  {id:"basic",name:"基礎理論",         color:"#7a55e0"},
  {id:"dev",  name:"開発",             color:"#dd7a12"},
  {id:"mgmt", name:"マネジメント",     color:"#a8771c"},
  {id:"st",   name:"ストラテジ",       color:"#b23c96"}
];

const TERMS = [
/* ---------- AI・データ ---------- */
{t:"生成AI", y:"Generative AI", c:"ai", f:2, n:1, d:"学習したデータをもとに、文章・画像・音声などを新しく作り出すAI。", k:"「作る」AI。画像を見分けるだけのAIとは別物。",
 fig:{type:"flow", items:["プロンプト\n（指示）","生成AI","文章・画像\nを作る"]}},
{t:"大規模言語モデル", y:"LLM：Large Language Model", c:"ai", f:2, n:1, d:"大量の文章で事前学習した言語モデル。次に来る言葉を予測して文章を作る。生成AIの中心。", k:"事前学習 → 追加学習（ファインチューニング）の流れとセットで。",
 fig:{type:"flow", items:["大量の文章","事前学習","LLM"]}},
{t:"プロンプトエンジニアリング", y:"Prompt Engineering", c:"ai", f:2, n:1, d:"生成AIから望む答えを引き出すために、指示文（プロンプト）の書き方を工夫すること。", k:"役割・条件・例を具体的に書くほど狙った答えになる。",
 fig:{type:"vs", a:["あいまいな指示","ぼんやりした答え"], b:["具体的な指示＋例","狙いどおりの答え"]}},
{t:"ハルシネーション", y:"Hallucination", c:"ai", f:1, n:1, d:"生成AIが、事実と違う内容をもっともらしく答えてしまう現象。", k:"出力は必ず人が事実確認する。",
 fig:{type:"flow", items:["質問","生成AI","自信満々の\nまちがい"]}},
{t:"機械学習の3種類", y:"教師あり・教師なし・強化学習", c:"ai", f:3, d:"正解つきデータで学ぶ（教師あり）、正解なしで傾向を見つける（教師なし）、試行錯誤して報酬を最大にする（強化学習）。", k:"「報酬」と出たら強化学習。「グループ分け（クラスタリング）」は教師なし。",
 fig:{type:"tree", root:"機械学習", items:["教師あり\n正解つき","教師なし\n正解なし","強化学習\n報酬で学ぶ"]}},
{t:"ディープラーニング", y:"Deep Learning", c:"ai", f:2, d:"人の脳の神経回路をまねたニューラルネットワークを何層も重ねた機械学習。特徴を自動で見つける。", k:"「多層のニューラルネットワーク」がキーワード。",
 fig:{type:"flow", items:["入力層","隠れ層\n（何層も）","出力層"]}},
{t:"過学習", y:"Overfitting", c:"ai", f:2, n:1, d:"学習データに合わせすぎて、新しいデータではうまく当たらなくなること。", k:"学習データでは高得点、本番では低得点。",
 fig:{type:"vs", a:["学習データ","高得点"], b:["新しいデータ","低得点"]}},
{t:"転移学習・ファインチューニング", y:"Transfer Learning / Fine-tuning", c:"ai", f:1, n:1, d:"学習済みのモデルを土台にして、少しのデータで別の目的向けに追加学習すること。", k:"ゼロから学習しないので早く安く作れる。",
 fig:{type:"flow", items:["学習済み\nモデル","少しだけ\n追加学習","専用モデル"]}},
{t:"GAN（敵対的生成ネットワーク）", y:"Generative Adversarial Network", c:"ai", f:1, n:1, d:"偽物を作る生成器と、見破る識別器を競わせて、本物そっくりのデータを作る仕組み。", k:"「生成器と識別器が競う」がキーワード。",
 fig:{type:"vs", a:["生成器","偽物を作る"], b:["識別器","見破る"]}},
{t:"ディープフェイク", y:"Deepfake", c:"ai", f:1, n:1, d:"AIで作られた、本物そっくりの偽の画像・動画・音声。なりすましや詐欺に悪用される。", k:"AIに対する・AIを使った脅威の代表。",
 fig:{type:"flow", items:["本人の映像","AIで合成","偽の動画"]}},
{t:"敵対的サンプル", y:"Adversarial Examples", c:"ai", f:1, n:1, d:"人には分からないほど小さな細工を加えて、AIに誤認識させる入力データ。", k:"見た目は同じなのにAIだけがだまされる。",
 fig:{type:"flow", items:["画像＋\n小さなノイズ","AI","別の物と\n誤認識"]}},
{t:"データウェアハウスとデータレイク", y:"DWH / Data Lake", c:"ai", f:1, n:1, d:"データウェアハウスは分析しやすく整理したデータの倉庫。データレイクは画像やログなどを生のまま何でもためる湖。", k:"整理して保存＝ウェアハウス、そのまま保存＝レイク。",
 fig:{type:"vs", a:["ウェアハウス","整理して保存"], b:["データレイク","生のまま保存"]}},
{t:"ETL", y:"Extract・Transform・Load", c:"ai", f:1, n:1, d:"データを取り出し（抽出）、使える形に変え（変換）、分析用の倉庫に書き込む（書出し）処理。", k:"順番は E → T → L。",
 fig:{type:"flow", items:["抽出\nExtract","変換\nTransform","書出し\nLoad"]}},
{t:"データマイニング", y:"Data Mining", c:"ai", f:2, d:"大量のデータを分析して、検索だけでは分からない隠れた規則や相関関係を見つけること。", k:"「隠れた規則・相関を発見」がキーワード。",
 fig:{type:"flow", items:["大量のデータ","分析","隠れた規則"]}},
{t:"DX（デジタルトランスフォーメーション）", y:"Digital Transformation", c:"ai", f:2, n:1, d:"デジタル技術を使って、製品・サービス・ビジネスモデルや組織そのものを変革すること。", k:"単なるIT化（効率化）ではなく「変革」まで。",
 fig:{type:"flow", items:["デジタル化","業務の\n効率化","ビジネスの\n変革"]}},
{t:"IoTとエッジコンピューティング", y:"Internet of Things / Edge", c:"ai", f:2, d:"IoTはモノにセンサや通信をつけてネットにつなぐこと。エッジはデータの発生源の近くで処理して速く応答すること。", k:"エッジ＝「近く」で処理、リアルタイム性。",
 fig:{type:"flow", items:["センサ\n（モノ）","エッジで\nすぐ処理","クラウドで\n分析"]}},

/* ---------- セキュリティ ---------- */
{t:"情報セキュリティの3要素", y:"機密性・完全性・可用性（CIA）", c:"sec", f:3, d:"許可された人だけが見られる（機密性）、正しく改ざんされていない（完全性）、必要なときに使える（可用性）。", k:"DDoSは可用性、改ざんは完全性、漏えいは機密性への脅威。",
 fig:{type:"rows", items:[["機密性","見せない"],["完全性","改ざんさせない"],["可用性","止めない"]]}},
{t:"共通鍵暗号と公開鍵暗号", y:"Common Key / Public Key", c:"sec", f:3, d:"共通鍵は暗号化と復号に同じ鍵を使う。公開鍵暗号は受信者の公開鍵で暗号化し、受信者の秘密鍵で復号する。", k:"鍵の数：共通鍵 n(n−1)/2、公開鍵 2n。",
 fig:{type:"flow", items:["受信者の\n公開鍵で暗号化","暗号文","受信者の\n秘密鍵で復号"]}},
{t:"デジタル署名", y:"Digital Signature", c:"sec", f:3, d:"送信者の秘密鍵で署名し、受信者は送信者の公開鍵で確かめる。本人確認と改ざん検知ができる。", k:"暗号化とは逆で、使うのは「送る人」の鍵。",
 fig:{type:"flow", items:["送信者の\n秘密鍵で署名","送る","送信者の\n公開鍵で検証"]}},
{t:"ハッシュ関数", y:"Hash Function", c:"sec", f:2, d:"データから決まった長さの要約値を作る関数。元には戻せず、1文字変わっても値が大きく変わる。", k:"改ざん検知やパスワードの保存に使う。暗号化ではない。",
 fig:{type:"flow", items:["文書","ハッシュ関数","固定長の値\n（戻せない）"]}},
{t:"認証局とデジタル証明書", y:"CA / PKI", c:"sec", f:2, d:"認証局（CA）が、公開鍵が確かに本人のものだとデジタル証明書で証明する。この仕組みがPKI。", k:"証明書には認証局のデジタル署名が付いている。",
 fig:{type:"flow", items:["認証局","デジタル証明書\nを発行","公開鍵が\n本人のものと証明"]}},
{t:"SQLインジェクション", y:"SQL Injection", c:"sec", f:3, d:"入力欄に不正なSQL文を入れて、データベースを不正に操作する攻撃。", k:"対策はプレースホルダ（バインド機構）。",
 fig:{type:"flow", items:["入力欄に\nSQL文","データベース","不正に\n読み書き"]}},
{t:"クロスサイトスクリプティング", y:"XSS", c:"sec", f:3, d:"掲示板などに悪意あるスクリプトを埋め込み、閲覧した人のブラウザで実行させる攻撃。", k:"対策はエスケープ（特殊文字の無害化）。",
 fig:{type:"flow", items:["掲示板に\nスクリプト","閲覧者","ブラウザで\n実行される"]}},
{t:"CSRF", y:"Cross-Site Request Forgery", c:"sec", f:2, d:"ログイン中の利用者に罠のリンクを踏ませ、本人が意図しない操作（送金・投稿など）を実行させる攻撃。", k:"「ログイン中」「意図しない操作」がキーワード。",
 fig:{type:"flow", items:["罠のリンク","ログイン中の\n利用者","勝手に\n操作される"]}},
{t:"DoS攻撃とDDoS攻撃", y:"Denial of Service", c:"sec", f:2, d:"大量のアクセスを送りつけてサーバを止める攻撃。多数の機器から一斉に行うのがDDoS。", k:"可用性への攻撃。",
 fig:{type:"flow", items:["大量の機器","一斉に\nアクセス","サービス\n停止"]}},
{t:"ランサムウェアと二重脅迫", y:"Ransomware / Double Extortion", c:"sec", f:2, n:1, d:"データを暗号化して身代金を要求するマルウェア。最近は盗んだデータを公開すると脅す二重脅迫も多い。", k:"対策はオフラインや書換え不可のバックアップ。",
 fig:{type:"flow", items:["データを\n暗号化","身代金を\n要求","「公開するぞ」\nと二重に脅す"]}},
{t:"ビジネスメール詐欺", y:"BEC：Business Email Compromise", c:"sec", f:1, n:1, d:"取引先や経営者になりすましたメールで、偽の口座に送金させる詐欺。", k:"振込先の変更依頼は別の手段で本人確認する。",
 fig:{type:"flow", items:["取引先に\nなりすまし","「振込先が\n変わりました」","偽の口座へ\n送金"]}},
{t:"標的型攻撃とソーシャルエンジニアリング", y:"Targeted Attack / Social Engineering", c:"sec", f:2, d:"特定の組織を狙い、業務を装ったメールでマルウェアを送り込むのが標的型攻撃。電話やのぞき見など人のすきを突くのがソーシャルエンジニアリング。", k:"技術ではなく「人」をだますのがソーシャルエンジニアリング。",
 fig:{type:"vs", a:["標的型攻撃","業務を装うメール"], b:["ソーシャル\nエンジニアリング","人のすきを突く"]}},
{t:"プロンプトインジェクション", y:"Prompt Injection", c:"sec", f:1, n:1, d:"生成AIへの入力に悪意ある指示を紛れ込ませ、想定外の回答や情報漏えいを起こさせる攻撃。", k:"AIそのものを狙う新しい攻撃。",
 fig:{type:"flow", items:["悪意ある\n指示を混ぜる","生成AI","情報漏えい・\n誤動作"]}},
{t:"ファイアウォール・WAF・IDS・IPS", y:"FW / WAF / IDS / IPS", c:"sec", f:3, d:"ファイアウォールは通信を通すか止めるか決める。WAFはWebアプリへの攻撃を防ぐ。IDSは侵入を検知して知らせ、IPSは検知して遮断する。", k:"IDS＝知らせるだけ、IPS＝止める。",
 fig:{type:"rows", items:[["FW","通信を通す・止める"],["WAF","Webアプリへの攻撃を防ぐ"],["IDS","侵入を検知して通知"],["IPS","侵入を検知して遮断"]]}},
{t:"DMZ", y:"DeMilitarized Zone", c:"sec", f:2, d:"インターネットと社内ネットワークの間に置く緩衝地帯。Webサーバなど公開するサーバを置く。", k:"社内LANには直接入らせない。",
 fig:{type:"layers", items:["インターネット","DMZ（公開サーバ）","社内LAN"], hl:1}},
{t:"VPN", y:"Virtual Private Network", c:"sec", f:1, d:"インターネットなどの公衆網の上に、暗号化した仮想の専用線を作る技術。", k:"「仮想の専用線」「暗号化トンネル」。",
 fig:{type:"flow", items:["本社","暗号化した\nトンネル","支店・在宅"]}},
{t:"多要素認証", y:"Multi-Factor Authentication", c:"sec", f:3, d:"知識（パスワード）・所有（ICカード、スマホ）・生体（指紋、顔）のうち、違う種類を2つ以上組み合わせる認証。", k:"パスワード＋秘密の質問は知識×2なので多要素ではない。",
 fig:{type:"rows", items:[["知識","パスワード・暗証番号"],["所有","ICカード・スマホ"],["生体","指紋・顔・静脈"]]}},
{t:"リスク対応の4種類", y:"回避・低減・移転・受容", c:"sec", f:2, d:"原因の活動をやめる（回避）、対策で減らす（低減）、保険などで他に移す（移転）、小さいので受け入れる（受容）。", k:"保険・外部委託＝移転。",
 fig:{type:"grid", items:["回避\nやめる","低減\n減らす","移転\n保険で移す","受容\n受け入れる"]}},
{t:"ISMS", y:"Information Security Management System", c:"sec", f:2, d:"組織として情報セキュリティを管理する仕組み。PDCAサイクルで継続的に改善する。", k:"Plan → Do → Check → Act を回し続ける。",
 fig:{type:"cycle", items:["Plan\n計画","Do\n実行","Check\n評価","Act\n改善"]}},
{t:"SBOM", y:"Software Bill of Materials", c:"sec", f:1, n:1, d:"ソフトウェアに使われている部品（ライブラリなど）の一覧表。脆弱性が見つかったときに影響をすぐ調べられる。", k:"ソフトウェアの「部品表」。",
 fig:{type:"rows", items:[["部品A","ver 2.1"],["部品B","ver 1.0 ← 脆弱性！"],["部品C","ver 3.4"]]}},
{t:"3-2-1ルール", y:"バックアップの原則", c:"sec", f:1, n:1, d:"データのコピーを3つ持ち、2種類の媒体に保存し、1つは別の場所（オフサイト）に置くというバックアップの原則。", k:"ランサムウェア対策としても重要。",
 fig:{type:"rows", items:[["3","コピーを3つ"],["2","2種類の媒体"],["1","1つは別の場所"]]}},
{t:"クラウドの責任共有モデル", y:"Shared Responsibility Model", c:"sec", f:1, n:1, d:"クラウドのセキュリティを、事業者と利用者で分担する考え方。SaaSほど事業者の範囲が広い。", k:"利用者のデータやID管理は、どの形でも利用者の責任。",
 fig:{type:"layers", items:["データ・ID：利用者","アプリ：SaaSなら事業者","設備：事業者"], hl:0}},

/* ---------- ネットワーク ---------- */
{t:"OSI参照モデルと中継機器", y:"OSI", c:"nw", f:3, d:"通信の機能を7つの層に分けたモデル。ルータは3層、L2スイッチとブリッジは2層、リピータとハブは1層で中継する。", k:"IPアドレス＝ルータ、MACアドレス＝スイッチ。",
 fig:{type:"layers", items:["7〜4層：ゲートウェイ","3層 ネットワーク：ルータ","2層 データリンク：スイッチ","1層 物理：リピータ・ハブ"], hl:1}},
{t:"TCPとUDP", y:"Transmission Control / User Datagram", c:"nw", f:2, d:"TCPは到着を確認して確実に届ける。UDPは確認をせず速さを優先する（動画・音声など）。", k:"確実＝TCP、速さ＝UDP。",
 fig:{type:"vs", a:["TCP","確実に届ける"], b:["UDP","速さ優先"]}},
{t:"メールのプロトコル", y:"SMTP / POP3 / IMAP", c:"nw", f:3, d:"送信と転送はSMTP。受信はPOP3（端末に取り込む）かIMAP（サーバ上で管理）。", k:"送る＝SMTP、受け取る＝POP3・IMAP。",
 fig:{type:"flow", items:["送信者","SMTPで\n送る","POP3・IMAP\nで受け取る"]}},
{t:"DNS", y:"Domain Name System", c:"nw", f:3, d:"ドメイン名（www.example.jp など）をIPアドレスに変換する仕組み。インターネットの電話帳。", k:"名前 → IPアドレス。",
 fig:{type:"flow", items:["www.example.jp","DNS","203.0.113.5"]}},
{t:"DHCP", y:"Dynamic Host Configuration Protocol", c:"nw", f:2, d:"ネットワークにつないだ機器に、IPアドレスなどの設定を自動で割り当てる仕組み。", k:"「自動で割り当て」がキーワード。",
 fig:{type:"flow", items:["PCをつなぐ","DHCPサーバ","IPアドレスを\n自動で配布"]}},
{t:"NAT・NAPT", y:"Network Address (Port) Translation", c:"nw", f:2, d:"社内のプライベートIPアドレスと、インターネット用のグローバルIPアドレスを変換する仕組み。NAPTはポート番号も使い、1つのグローバルアドレスを複数台で共有する。", k:"プライベート ⇔ グローバルの変換。",
 fig:{type:"flow", items:["社内PC\n192.168.x.x","NAPT\n（ルータ）","インターネット\nグローバルIP"]}},
{t:"サブネットマスクとホスト数", y:"Subnet Mask", c:"nw", f:3, d:"IPアドレスのどこまでがネットワーク部かを示す。つなげる台数は 2の（ホスト部のビット数）乗 − 2。", k:"/24 なら 2の8乗 − 2 ＝ 254台。",
 fig:{type:"formula", main:"2 の（32 − ネットワーク部）乗 − 2", sub:"−2 はネットワーク自身とブロードキャスト"}},
{t:"IPv6", y:"Internet Protocol version 6", c:"nw", f:1, d:"IPアドレスを128ビットに増やした新しい規格。IPv4（32ビット）のアドレス不足を解決する。", k:"IPv4＝32ビット、IPv6＝128ビット。",
 fig:{type:"vs", a:["IPv4","32ビット"], b:["IPv6","128ビット"]}},
{t:"ARP", y:"Address Resolution Protocol", c:"nw", f:1, d:"IPアドレスから、通信相手のMACアドレスを調べる仕組み。", k:"IP → MAC。DNSは名前 → IP。",
 fig:{type:"flow", items:["IPアドレス","ARP","MACアドレス"]}},
{t:"伝送時間の計算", y:"Transmission Time", c:"nw", f:3, d:"データ量（ビット）を、回線速度に伝送効率を掛けた値で割る。", k:"バイトは ×8 でビットに。効率の掛け忘れに注意。",
 fig:{type:"formula", main:"ビット数 ÷（回線速度 × 伝送効率）", sub:"1バイト ＝ 8ビット"}},

/* ---------- データベース ---------- */
{t:"正規化", y:"Normalization", c:"db", f:3, d:"データの重複や矛盾をなくすために表を分割すること。第1正規形→第2→第3と進める。", k:"第2：部分関数従属をなくす、第3：推移的関数従属をなくす。",
 fig:{type:"flow", items:["第1正規形\n繰返しをなくす","第2正規形\n部分従属をなくす","第3正規形\n推移従属をなくす"]}},
{t:"主キーと外部キー", y:"Primary Key / Foreign Key", c:"db", f:3, d:"主キーは行を1つに特定できる列（重複・空なし）。外部キーは他の表の主キーを参照する列。", k:"外部キーで表どうしをつなぎ、存在しない値を入れさせない（参照制約）。",
 fig:{type:"vs", a:["主キー","行を1つに特定"], b:["外部キー","他の表の主キーを参照"]}},
{t:"関係演算", y:"射影・選択・結合", c:"db", f:3, d:"射影は特定の列を、選択は条件に合う行を取り出す。結合は複数の表をつないで1つにする。", k:"列＝射影、行＝選択。",
 fig:{type:"rows", items:[["射影","列を取り出す"],["選択","行を取り出す"],["結合","表をつなぐ"]]}},
{t:"SQLの集計", y:"GROUP BY / HAVING", c:"db", f:3, d:"GROUP BYでグループにまとめ、集計結果（平均・合計など）の条件はHAVINGで指定する。", k:"まとめる前の条件はWHERE、まとめた後はHAVING。",
 fig:{type:"flow", items:["WHERE\n行を絞る","GROUP BY\nまとめる","HAVING\nグループを絞る"]}},
{t:"トランザクションとACID特性", y:"Atomicity・Consistency・Isolation・Durability", c:"db", f:3, d:"原子性（全部か無か）、一貫性（矛盾なし）、独立性（他に邪魔されない）、耐久性（完了したら消えない）。", k:"「全部実行か全部取消し」は原子性。",
 fig:{type:"grid", items:["A 原子性\n全部か無か","C 一貫性\n矛盾なし","I 独立性\n邪魔されない","D 耐久性\n消えない"]}},
{t:"ロールバックとロールフォワード", y:"Rollback / Rollforward", c:"db", f:3, d:"途中で失敗した処理は更新前ログで取り消す（ロールバック）。障害時はバックアップに更新後ログで完了済みの処理を再現する（ロールフォワード）。", k:"取消し＝更新前、再現＝更新後。",
 fig:{type:"vs", a:["ロールバック","更新前ログで取消し"], b:["ロールフォワード","更新後ログで再現"]}},
{t:"排他制御とデッドロック", y:"Lock / Deadlock", c:"db", f:2, d:"同時更新の矛盾を防ぐためにデータをロックする。お互いが相手のロック解除を待って進まない状態がデッドロック。", k:"ロックを取る順番をそろえると防げる。",
 fig:{type:"cycle", items:["Aが\nXを持つ","AがYを待つ","Bが\nYを持つ","BがXを待つ"]}},
{t:"E-R図", y:"Entity-Relationship Diagram", c:"db", f:2, d:"データを実体（エンティティ）と、その関連（リレーションシップ）で表す図。1対多などの関係を示す。", k:"「顧客 1 ― 多 注文」のように読む。",
 fig:{type:"flow", items:["顧客","1 対 多","注文"]}},

/* ---------- コンピュータ ---------- */
{t:"キャッシュメモリと実効アクセス時間", y:"Cache Memory", c:"hw", f:3, d:"CPUと主記憶の間に置く高速なメモリ。よく使うデータを置いて全体を速くする。", k:"実効アクセス時間 ＝ キャッシュ × ヒット率 ＋ 主記憶 ×（1 − ヒット率）。",
 fig:{type:"formula", main:"キャッシュ×ヒット率 ＋ 主記憶×(1−ヒット率)", sub:"ヒット率は小数にしてから掛ける"}},
{t:"仮想記憶とページング", y:"Virtual Memory / Paging", c:"hw", f:3, d:"補助記憶を使って主記憶を大きく見せる仕組み。ページ単位で出し入れする。必要なページが主記憶にないとページフォールトが起きる。", k:"出し入ればかりで遅くなる状態はスラッシング。",
 fig:{type:"flow", items:["主記憶","ページアウト\nページイン","補助記憶"]}},
{t:"ページ置換えアルゴリズム", y:"LRU / FIFO", c:"hw", f:2, d:"主記憶がいっぱいのとき、どのページを追い出すかの決め方。LRUは最も長く使われていないもの、FIFOは最も古く入ったもの。", k:"LRU＝最後に使ってから一番時間がたったもの。",
 fig:{type:"vs", a:["LRU","最も長く使っていない"], b:["FIFO","最も古く入った"]}},
{t:"RAID", y:"Redundant Arrays of Inexpensive Disks", c:"hw", f:3, d:"複数のディスクをまとめて速さや信頼性を上げる技術。", k:"0＝分散（速い）、1＝ミラーリング、5＝パリティで1台の故障から復元。",
 fig:{type:"rows", items:[["RAID0","ストライピング（速い）"],["RAID1","ミラーリング（同じものを2台）"],["RAID5","パリティで復元"]]}},
{t:"稼働率", y:"Availability", c:"hw", f:3, d:"システムが動いている割合。直列は掛け算、並列は1から「全部止まる確率」を引く。", k:"直列 A×B、並列 1−(1−A)(1−B)。",
 fig:{type:"formula", main:"MTBF ÷（MTBF ＋ MTTR）", sub:"MTBF＝動いている時間、MTTR＝直している時間"}},
{t:"信頼性設計", y:"フールプルーフ・フェールセーフ・フェールソフト", c:"hw", f:3, d:"人のミスに備えるのがフールプルーフ。故障時に安全に止めるのがフェールセーフ、機能を落として続けるのがフェールソフト。", k:"フール＝人、フェール＝故障。",
 fig:{type:"rows", items:[["フールプルーフ","人のミスでも安全"],["フェールセーフ","故障したら安全に止める"],["フェールソフト","機能を落として続ける"],["フォールトトレランス","二重化で影響なく続ける"]]}},
{t:"デュアルとデュプレックス", y:"Dual / Duplex System", c:"hw", f:2, d:"デュアルは2系統で同じ処理をして結果を照合。デュプレックスは現用系と待機系を用意し、故障したら切り替える。", k:"現用系・待機系と出たらデュプレックス。",
 fig:{type:"vs", a:["デュアル","同じ処理で照合"], b:["デュプレックス","現用系＋待機系"]}},
{t:"クラウドサービスの種類", y:"SaaS / PaaS / IaaS", c:"hw", f:3, d:"SaaSはアプリまで、PaaSはOSなどの実行環境まで、IaaSはサーバなどの設備だけを提供する。", k:"S＝Software、P＝Platform、I＝Infrastructure。",
 fig:{type:"layers", items:["アプリ：SaaS","実行環境：PaaS 〜","設備：IaaS 〜"], hl:0}},
{t:"仮想化とコンテナ", y:"Virtualization / Container", c:"hw", f:1, n:1, d:"仮想化は1台の物理マシンで複数のOSを動かす。コンテナはOSを共有してアプリを分けるので、軽くて起動が速い。", k:"コンテナ＝OSを共有して軽い。",
 fig:{type:"vs", a:["仮想マシン","OSごと分ける"], b:["コンテナ","OSを共有して軽い"]}},
{t:"性能の指標", y:"スループット・レスポンスタイム・ターンアラウンドタイム", c:"hw", f:2, d:"スループットは単位時間の処理量。レスポンスタイムは入力から最初の応答まで。ターンアラウンドタイムは依頼してから結果を全部受け取るまで。", k:"量＝スループット、最初の反応＝レスポンス、全部＝ターンアラウンド。",
 fig:{type:"rows", items:[["スループット","単位時間の処理量"],["レスポンスタイム","最初の応答まで"],["ターンアラウンド","結果を全部受け取るまで"]]}},
{t:"パイプライン", y:"Pipeline", c:"hw", f:2, d:"命令の実行を段階に分け、少しずつずらして重ねて実行することで、全体を速くするCPUの技術。", k:"分岐があると予測が外れて効率が落ちる（ハザード）。",
 fig:{type:"flow", items:["取出し","解読","実行"]}},
{t:"タスクの状態とディスパッチ", y:"Dispatch", c:"hw", f:2, d:"タスクは実行可能・実行・待ちの3状態を移る。実行可能なタスクにCPUを渡すのがディスパッチ。", k:"順番を決める＝スケジューリング、CPUを渡す＝ディスパッチ。",
 fig:{type:"cycle", items:["実行可能","ディスパッチ\n→ 実行","入出力で\n待ち","完了で\n実行可能へ"]}},

/* ---------- 基礎理論 ---------- */
{t:"2進数と基数変換", y:"Binary", c:"basic", f:3, d:"2進数は右から1・2・4・8…の重み。1の場所の重みを足すと10進数になる。", k:"10進→2進は2で割り続けて余りを下から読む。",
 fig:{type:"formula", main:"1011 ＝ 8 ＋ 2 ＋ 1 ＝ 11", sub:"右から 1・2・4・8 の重み"}},
{t:"補数", y:"Complement", c:"basic", f:2, d:"負の数を表す方法。2の補数は、全ビットを反転して1を足す。", k:"反転して＋1。",
 fig:{type:"flow", items:["0101（5）","反転\n1010","＋1 → 1011\n（−5）"]}},
{t:"論理演算", y:"AND / OR / XOR / NOT", c:"basic", f:3, d:"ANDは両方1で1、ORはどちらかが1で1、XORは違うときだけ1、NOTは反転。", k:"XOR＝同じなら0。",
 fig:{type:"rows", items:[["AND","両方1 → 1"],["OR","どちらか1 → 1"],["XOR","違う → 1"],["NOT","反転"]]}},
{t:"スタックとキュー", y:"LIFO / FIFO", c:"basic", f:3, d:"スタックは後から入れたものが先に出る（お皿の山）。キューは先に入れたものが先に出る（行列）。", k:"スタック＝LIFO、キュー＝FIFO。",
 fig:{type:"vs", a:["スタック","後入れ先出し"], b:["キュー","先入れ先出し"]}},
{t:"探索アルゴリズム", y:"線形探索・2分探索・ハッシュ探索", c:"basic", f:2, d:"線形探索は先頭から順に探す。2分探索は整列済みデータを半分ずつ絞る。ハッシュ探索は計算で位置を求める。", k:"2分探索の最大比較回数は約 log₂n 回。",
 fig:{type:"rows", items:[["線形探索","最大 n 回"],["2分探索","最大 約 log₂n 回"],["ハッシュ探索","計算で一発"]]}},
{t:"木構造", y:"2分木・2分探索木", c:"basic", f:2, d:"親から子へ枝分かれするデータ構造。2分探索木は、左の子 ＜ 親 ＜ 右の子 になるように並べる。", k:"左は小さく、右は大きく。",
 fig:{type:"tree", root:"50", items:["30\n（小さい）","70\n（大きい）"]}},

/* ---------- 開発 ---------- */
{t:"開発モデル", y:"ウォーターフォール・アジャイルなど", c:"dev", f:2, d:"順番に進めて戻らないウォーターフォール、試作品で確認するプロトタイピング、繰り返すスパイラル、短い期間で少しずつ作るアジャイル。", k:"試作品＝プロトタイピング。",
 fig:{type:"rows", items:[["ウォーターフォール","順番に進めて戻らない"],["プロトタイピング","試作品で確認"],["スパイラル","繰り返して大きく"],["アジャイル","短い期間で少しずつ"]]}},
{t:"スクラム", y:"Scrum", c:"dev", f:2, n:1, d:"アジャイル開発の進め方の一つ。1〜4週間のスプリントを繰り返し、毎日短い打合せ（デイリースクラム）をする。", k:"スプリント・プロダクトバックログ・振り返り（レトロスペクティブ）。",
 fig:{type:"cycle", items:["計画","開発\n（スプリント）","レビュー","振り返り"]}},
{t:"DevOpsとMLOps", y:"Development + Operations", c:"dev", f:1, n:1, d:"DevOpsは開発と運用が協力して、素早く安定してリリースし続ける考え方。MLOpsは機械学習モデルの運用に応用したもの。", k:"開発（Dev）と運用（Ops）の協力。",
 fig:{type:"cycle", items:["開発","テスト","リリース","運用"]}},
{t:"ブラックボックスとホワイトボックス", y:"Black-box / White-box Test", c:"dev", f:3, d:"ブラックボックスは中身を見ずに入力と出力でテスト。ホワイトボックスは中の命令や分岐を通してテスト。", k:"同値分割・限界値分析＝ブラック、命令網羅・分岐網羅＝ホワイト。",
 fig:{type:"vs", a:["ブラックボックス","入力と出力だけ"], b:["ホワイトボックス","中の分岐を通す"]}},
{t:"同値分割と限界値分析", y:"Equivalence Partitioning / Boundary Value", c:"dev", f:3, d:"同値分割は入力をグループに分けて代表値で試す。限界値分析は境目の値を試す。", k:"1〜100が有効なら、限界値は 0・1・100・101。",
 fig:{type:"flow", items:["0\n無効","1 〜 100\n有効","101\n無効"]}},
{t:"スタブとドライバ", y:"Stub / Driver", c:"dev", f:2, d:"スタブは下位モジュールの代わり（トップダウンテスト）。ドライバは上位モジュールの代わり（ボトムアップテスト）。", k:"下の代わり＝スタブ、上の代わり＝ドライバ。",
 fig:{type:"layers", items:["上位：ドライバが代役","テストするモジュール","下位：スタブが代役"], hl:1}},
{t:"モジュールの強度と結合度", y:"Cohesion / Coupling", c:"dev", f:2, d:"良い設計は、モジュールの中のまとまり（強度）が高く、モジュール間のつながり（結合度）が低い。", k:"強度は高く、結合度は低く。",
 fig:{type:"vs", a:["強度","高いほど良い"], b:["結合度","低いほど良い"]}},
{t:"オブジェクト指向", y:"Object-Oriented", c:"dev", f:2, d:"データと処理をまとめて隠す（カプセル化）、親の性質を子が受け継ぐ（継承）、同じ命令でも違う動きをする（多態性）。", k:"クラス＝型、インスタンス＝実物。",
 fig:{type:"tree", root:"クラス（型）", items:["インスタンス1","インスタンス2","インスタンス3"]}},
{t:"UMLの図", y:"Unified Modeling Language", c:"dev", f:1, d:"設計を図で表す共通ルール。クラス図は構造、シーケンス図はやり取りの順番、ユースケース図は利用者から見た機能。", k:"時間の順番＝シーケンス図。",
 fig:{type:"rows", items:[["クラス図","構造（クラスと関係）"],["シーケンス図","やり取りの順番"],["ユースケース図","利用者から見た機能"]]}},
{t:"ローコード・ノーコード", y:"Low-code / No-code", c:"dev", f:1, n:1, d:"プログラムをほとんど（ローコード）、または全く（ノーコード）書かずに、画面操作でアプリを作る開発手法。", k:"現場の担当者でも作れる。",
 fig:{type:"vs", a:["ローコード","少しだけ書く"], b:["ノーコード","書かない"]}},

/* ---------- マネジメント ---------- */
{t:"クリティカルパス", y:"Critical Path", c:"mgmt", f:3, d:"アローダイアグラムで、最も時間がかかる作業の経路。この経路の日数が全体の日数になる。", k:"同時に進む経路の「長いほう」。全部足さない。",
 fig:{type:"vs", a:["経路1","3＋4＝7日"], b:["経路2（最長）","2＋6＝8日"]}},
{t:"WBS", y:"Work Breakdown Structure", c:"mgmt", f:2, d:"プロジェクトの作業を、管理しやすい大きさまで階層的に分解した図。", k:"「作業を分解」がキーワード。",
 fig:{type:"tree", root:"プロジェクト", items:["設計","製造","テスト"]}},
{t:"EVM", y:"Earned Value Management", c:"mgmt", f:1, d:"作業の出来高（EV）を計画（PV）や実際のコスト（AC）と比べて、進み具合と予算を管理する手法。", k:"EV＜PV なら遅れ、EV＜AC なら予算オーバー。",
 fig:{type:"rows", items:[["PV","予定していた価値"],["EV","実際にできた価値"],["AC","実際にかかったコスト"]]}},
{t:"工数（人月）", y:"Man-month", c:"mgmt", f:3, d:"作業量を「人数 × 期間」で表したもの。期間は工数 ÷ 人数で求める。", k:"24人月を6人で → 4か月。",
 fig:{type:"formula", main:"期間 ＝ 工数 ÷ 人数", sub:"工数（人月）＝ 人数 × 月数"}},
{t:"インシデント管理と問題管理", y:"Incident / Problem Management", c:"mgmt", f:2, d:"インシデント管理はサービスをとにかく早く元に戻す。問題管理は根本原因を調べて再発を防ぐ。", k:"早く戻す＝インシデント、原因と再発防止＝問題。",
 fig:{type:"flow", items:["障害発生","インシデント管理\nまず復旧","問題管理\n根本原因"]}},
{t:"SLA", y:"Service Level Agreement", c:"mgmt", f:2, d:"サービスの品質（稼働率、復旧時間など）について、提供者と利用者が合意した文書。", k:"「合意」がキーワード。",
 fig:{type:"flow", items:["提供者","品質を合意\n（SLA）","利用者"]}},
{t:"バックアップの種類", y:"フル・差分・増分", c:"mgmt", f:2, d:"フルは全部。差分はフルからの変更分すべて。増分は前回のバックアップからの変更分だけ。", k:"復元が楽＝差分（フル＋最後の差分）、取得が速い＝増分。",
 fig:{type:"rows", items:[["フル","全部"],["差分","フル以降の変更すべて"],["増分","前回以降の変更だけ"]]}},
{t:"システム監査", y:"System Audit", c:"mgmt", f:2, d:"監査対象から独立した監査人が、証拠に基づいて評価し、経営者に報告して改善を勧告する。", k:"監査人は直さない。改善するのは監査を受けた部門。",
 fig:{type:"flow", items:["証拠を集める","評価する","報告・\n改善勧告"]}},

/* ---------- ストラテジ ---------- */
{t:"SWOT分析", y:"Strengths・Weaknesses・Opportunities・Threats", c:"st", f:2, d:"自社の強み・弱み（内部）と、機会・脅威（外部）を整理する手法。", k:"内部＝強み・弱み、外部＝機会・脅威。",
 fig:{type:"grid", items:["強み\n内部・プラス","弱み\n内部・マイナス","機会\n外部・プラス","脅威\n外部・マイナス"]}},
{t:"PPM", y:"Product Portfolio Management", c:"st", f:3, d:"市場成長率と市場占有率の2軸で事業を4つに分ける。花形、金のなる木、問題児、負け犬。", k:"成長率 低・シェア 高＝金のなる木。",
 fig:{type:"grid", items:["花形\n成長◎ シェア◎","問題児\n成長◎ シェア△","金のなる木\n成長△ シェア◎","負け犬\n成長△ シェア△"]}},
{t:"損益分岐点", y:"Break-even Point", c:"st", f:3, d:"利益がちょうど0になる売上高。", k:"変動費率で割るのはひっかけ。「1 − 変動費率」で割る。",
 fig:{type:"formula", main:"固定費 ÷（1 − 変動費率）", sub:"変動費率 ＝ 変動費 ÷ 売上高"}},
{t:"ROI", y:"Return On Investment", c:"st", f:1, d:"投資した額に対して、どれだけ利益が出たかの割合。", k:"利益 ÷ 投資額。",
 fig:{type:"formula", main:"ROI ＝ 利益 ÷ 投資額", sub:"大きいほど効率の良い投資"}},
{t:"KGIとKPI", y:"Key Goal / Performance Indicator", c:"st", f:1, n:1, d:"KGIは最終的に達成したいゴールの指標。KPIはゴールに向けた途中の達成度を測る指標。", k:"ゴール＝KGI、途中の目印＝KPI。",
 fig:{type:"flow", items:["KPI\n途中の指標","KPI\n途中の指標","KGI\n最終ゴール"]}},
{t:"バランススコアカード", y:"Balanced Scorecard", c:"st", f:1, d:"財務だけでなく、顧客・業務プロセス・学習と成長の4つの視点で業績を評価する手法。", k:"4つの視点を覚える。",
 fig:{type:"grid", items:["財務","顧客","業務プロセス","学習と成長"]}},
{t:"QC七つ道具", y:"パレート図・特性要因図など", c:"st", f:2, d:"品質管理の図。パレート図は多い順で重点がわかる、特性要因図は原因と結果を魚の骨の形で整理、散布図は2つの関係、管理図は工程の安定を見る。", k:"魚の骨＝特性要因図、ABC分析＝パレート図。",
 fig:{type:"rows", items:[["パレート図","多い順＋累積"],["特性要因図","原因と結果（魚の骨）"],["散布図","2つの関係"],["管理図","工程が安定しているか"]]}},
{t:"業務システムの用語", y:"ERP・CRM・SCM・SFA", c:"st", f:2, d:"ERPは基幹業務の統合、CRMは顧客との関係管理、SCMは調達から販売までの最適化、SFAは営業の支援。", k:"C＝Customer（顧客）、S＝Supply（供給）。",
 fig:{type:"rows", items:[["ERP","基幹業務を統合"],["CRM","顧客との関係を管理"],["SCM","供給の流れを最適化"],["SFA","営業を支援"]]}},
{t:"BPRとBPM", y:"Business Process Re-engineering / Management", c:"st", f:2, d:"BPRは業務の流れを根本から作り直す。BPMは業務の流れを継続的に改善する。", k:"作り直し＝BPR、少しずつ改善＝BPM。",
 fig:{type:"vs", a:["BPR","根本から作り直す"], b:["BPM","少しずつ改善"]}},
{t:"RFIとRFP", y:"Request For Information / Proposal", c:"st", f:2, d:"RFIはベンダに情報の提供を求める文書。RFPは要件を示して提案を求める文書。", k:"I＝Information、P＝Proposal（提案）。",
 fig:{type:"flow", items:["RFI\n情報をもらう","RFP\n提案を求める","選定・契約"]}},
{t:"著作権と知的財産", y:"Copyright", c:"st", f:3, d:"プログラム本体は著作権で保護されるが、アルゴリズム・プログラム言語・規約は保護されない。会社の仕事で作ったものは原則会社の著作物。", k:"保護されるのは「表現」。",
 fig:{type:"vs", a:["保護される","プログラム"], b:["保護されない","アルゴリズム・言語"]}},
{t:"派遣と請負", y:"Dispatch / Contract", c:"st", f:3, d:"派遣は派遣先が作業者に指揮命令する。請負は受けた会社が自社の作業者に指揮命令し、成果物に責任を持つ。", k:"請負で注文者が直接指示するのは偽装請負。",
 fig:{type:"vs", a:["派遣","派遣先が指示"], b:["請負","受けた会社が指示"]}},
{t:"セキュリティ関連の法律", y:"不正アクセス禁止法・個人情報保護法", c:"st", f:2, d:"不正アクセス禁止法は他人のIDとパスワードで無断ログインすることなどを禁止。個人情報保護法は個人情報の利用目的の特定や第三者提供の制限などを定める。", k:"他人のIDの無断利用＝不正アクセス禁止法。",
 fig:{type:"rows", items:[["不正アクセス禁止法","他人のIDで無断ログイン"],["個人情報保護法","個人情報の扱いのルール"],["著作権法","作品・プログラムの保護"]]}}
];

/* ---------- ミニ図解の描画 ---------- */
const TFig = (() => {
  const W = 320;
  const lines = s => String(s).split("\n");
  const width = (s, fs) => [...s].reduce((w,ch) => w + (/[\x20-\x7e]/.test(ch) ? fs*0.58 : fs), 0);
  const fitSize = (ls, maxW, base=12) => { let fs = base; while(fs > 8.5 && ls.some(l => width(l, fs) > maxW)) fs -= 0.5; return fs; };
  const txt = (x, y, s, maxW, {base=12, bold=false, color="var(--ink)", lh=1.25} = {}) => {
    const ls = lines(s), fs = fitSize(ls, maxW, base), y0 = y - (ls.length-1) * fs * lh / 2;
    return `<text x="${x}" y="${y0}" text-anchor="middle" dominant-baseline="middle" style="font-size:${fs}px;font-weight:${bold?700:400};fill:${color};font-family:var(--font-body)">${ls.map((l,i)=>`<tspan x="${x}" dy="${i?fs*lh:0}">${l}</tspan>`).join("")}</text>`;
  };
  const soft = c => `color-mix(in srgb, ${c} 14%, var(--card))`;
  const box = (x,y,w,h,c,strong) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" style="fill:${strong ? c : soft(c)};stroke:${c};stroke-width:1.5"/>`;
  const arrow = (x1,y1,x2,y2,c,id) => `<path d="M${x1} ${y1} L${x2} ${y2}" style="stroke:${c};stroke-width:2;fill:none" marker-end="url(#${id})"/>`;
  const marker = (id,c) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:${c}"/></marker></defs>`;
  const wrap = (h, body, label) => `<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="${label}">${body}</svg>`;
  let uid = 0;

  function flow(items, c){
    const id = "tf" + (uid++), n = items.length, gap = 18, bw = (W - gap*(n-1)) / n, h = 64;
    let s = marker(id, c);
    items.forEach((t,i) => {
      const x = i*(bw+gap);
      s += box(x, 8, bw, 48, c, i === n-1) + txt(x+bw/2, 32, t, bw-10, {bold:true, color: i === n-1 ? "#fff" : "var(--ink)"});
      if(i < n-1) s += arrow(x+bw+2, 32, x+bw+gap-2, 32, c, id);
    });
    return wrap(h, s, items.join(" → ").replace(/\n/g,""));
  }
  function vs(a, b, c){
    const bw = 136, h = 76;
    const side = (x, [t, d], strong) => box(x, 6, bw, 64, c, strong) + txt(x+bw/2, 28, t, bw-12, {base:13, bold:true, color: strong ? "#fff" : "var(--ink)"}) + txt(x+bw/2, 52, d, bw-12, {base:11, color: strong ? "#fff" : "var(--muted)"});
    return wrap(h, side(0, a, false) + side(W-bw, b, true) +
      `<circle cx="${W/2}" cy="38" r="17" style="fill:var(--card);stroke:${c};stroke-width:2"/>` + txt(W/2, 38, "vs", 26, {base:13, bold:true, color:c}), `${a[0]}と${b[0]}の比較`);
  }
  function rows(items, c){
    const rh = 26, h = items.length*rh + 6, lw = 112;
    return wrap(h, items.map(([l, d], i) => {
      const y = 3 + i*rh;
      return box(0, y, lw, rh-4, c, true) + txt(lw/2, y+11, l, lw-10, {base:12, bold:true, color:"#fff"}) +
        `<rect x="${lw+6}" y="${y}" width="${W-lw-6}" height="${rh-4}" rx="7" style="fill:${soft(c)}"/>` + `<text x="${lw+16}" y="${y+11}" dominant-baseline="middle" style="font-size:${fitSize([d], W-lw-26, 12)}px;fill:var(--ink);font-family:var(--font-body)">${d}</text>`;
    }).join(""), items.map(r => r.join("：")).join("、"));
  }
  function layers(items, hl, c){
    const rh = 28, h = items.length*rh + 4;
    return wrap(h, items.map((t, i) => {
      const y = 2 + i*rh, inset = i*10, strong = i === hl;
      return box(inset, y, W - inset*2, rh-4, c, strong) + txt(W/2, y+12, t, W - inset*2 - 16, {base:12, bold:strong, color: strong ? "#fff" : "var(--ink)"});
    }).join(""), items.join("、"));
  }
  function formula(main, sub, c){
    return wrap(70, box(0, 4, W, 44, c, true) + txt(W/2, 26, main, W-20, {base:15, bold:true, color:"#fff"}) + txt(W/2, 62, sub, W-10, {base:11, color:"var(--muted)"}), main + "。" + sub);
  }
  function tree(root, items, c){
    const n = items.length, gap = 12, bw = (W - gap*(n-1)) / n, h = 112;
    let s = box(W/2-70, 4, 140, 32, c, true) + txt(W/2, 20, root, 128, {base:13, bold:true, color:"#fff"});
    items.forEach((t, i) => {
      const x = i*(bw+gap);
      s += `<path d="M${W/2} 36 V50 H${x+bw/2} V62" style="stroke:${c};stroke-width:1.5;fill:none"/>` + box(x, 62, bw, 46, c, false) + txt(x+bw/2, 85, t, bw-10, {base:12, bold:true});
    });
    return wrap(h, s, root + "：" + items.join("、").replace(/\n/g,""));
  }
  function grid(items, c){
    const bw = (W-8)/2, bh = 48, h = bh*2 + 12;
    return wrap(h, items.map((t, i) => {
      const x = (i%2)*(bw+8), y = 2 + Math.floor(i/2)*(bh+8);
      return box(x, y, bw, bh, c, i === 0) + txt(x+bw/2, y+bh/2, t, bw-12, {base:13, bold:true, color: i === 0 ? "#fff" : "var(--ink)"});
    }).join(""), items.join("、").replace(/\n/g,""));
  }
  function cycle(items, c){
    const id = "tc" + (uid++), bw = 120, bh = 40, h = 150;
    const pos = [[W/2-bw/2, 4], [W-bw, 55], [W/2-bw/2, 106], [0, 55]];
    let s = marker(id, c);
    items.forEach((t, i) => { const [x,y] = pos[i]; s += box(x, y, bw, bh, c, i === 0) + txt(x+bw/2, y+bh/2, t, bw-10, {base:12, bold:true, color: i === 0 ? "#fff" : "var(--ink)"}); });
    s += `<path d="M${W/2+bw/2} 24 Q${W-40} 24 ${W-50} 53" style="stroke:${c};stroke-width:2;fill:none" marker-end="url(#${id})"/>`;
    s += `<path d="M${W-50} 97 Q${W-40} 126 ${W/2+bw/2+2} 126" style="stroke:${c};stroke-width:2;fill:none" marker-end="url(#${id})"/>`;
    s += `<path d="M${W/2-bw/2} 126 Q40 126 50 97" style="stroke:${c};stroke-width:2;fill:none" marker-end="url(#${id})"/>`;
    s += `<path d="M50 53 Q40 24 ${W/2-bw/2-2} 24" style="stroke:${c};stroke-width:2;fill:none" marker-end="url(#${id})"/>`;
    return wrap(h, s, items.join(" → ").replace(/\n/g,"") + " → 最初に戻る");
  }
  return function(f, c){
    switch(f.type){
      case "flow": return flow(f.items, c);
      case "vs": return vs(f.a, f.b, c);
      case "rows": return rows(f.items, c);
      case "layers": return layers(f.items, f.hl, c);
      case "formula": return formula(f.main, f.sub, c);
      case "tree": return tree(f.root, f.items, c);
      case "grid": return grid(f.items, c);
      case "cycle": return cycle(f.items, c);
      case "tables": return typeof TTables === "function" ? TTables(f, c) : "";
    }
    return "";
  };
})();

/* ---------- 用語ずかんの画面 ---------- */
let TM = {q:"", cat:"all", mode:"all", hide:false, open:{}};
function termId(t){ return t.t; }
function renderTerms(){
  S.terms ||= {};
  const total = TERMS.length, done = TERMS.filter(t => S.terms[termId(t)]).length;
  const hot = TERMS.filter(t => t.f === 3).length, nw = TERMS.filter(t => t.n).length;
  app.innerHTML = pageHead("用語ずかん", `基本情報の科目Aによく出る用語と、新しく出題範囲に加わった用語${total}語を図でまとめたよ。`, "happy");
  const head = document.createElement("section");
  head.className = "panel";
  head.innerHTML = `
    <div class="row"><div class="bar good"><i style="width:${done/total*100}%;background:var(--good)"></i></div><span class="small muted num">覚えた ${done} / ${total}</span></div>
    <div class="legend small"><span><b class="stars">★★★</b> 過去問でくり返し出る定番　<b class="stars">★★</b> ときどき出る　<b class="stars">★</b> 知っておくと点になる</span><span><b class="newb">NEW</b> 2024年10月からの出題範囲改訂で増えたAI・データ・セキュリティなどの用語（${nw}語）</span></div>
    <input id="tq" class="search" type="search" placeholder="用語・略語・意味で探す（例：署名、RAID、生成AI）" value="${esc(TM.q)}" autocomplete="off" aria-label="用語を探す">
    <div class="chips" id="tmode"></div>
    <div class="catscroll" id="tcat"></div>
    <button type="button" class="toggle-hide" id="thide" aria-pressed="${TM.hide}">${TM.hide ? "かくして覚えるモード：オン" : "かくして覚えるモード：オフ"}</button>`;
  app.appendChild(head);
  const cntF = f => TERMS.filter(x => x.f === f).length;
  const modes = [["all",`すべて ${total}`],["f3",`★★★ ${cntF(3)}`],["f2",`★★ ${cntF(2)}`],["f1",`★ ${cntF(1)}`],["new",`NEW ${TERMS.filter(x=>x.n).length}`],["todo","まだ覚えてない"]];
  const mEl = head.querySelector("#tmode");
  modes.forEach(([k,l]) => { const b = document.createElement("button"); b.type="button"; b.className="chipbtn"; b.textContent=l; b.setAttribute("aria-pressed", String(TM.mode===k)); b.onclick=()=>{ TM.mode=k; drawList(); syncChips(); }; mEl.appendChild(b); });
  const cEl = head.querySelector("#tcat");
  [{id:"all", name:"全分野", color:"var(--ink)"}, ...TCATS].forEach(cat => {
    const b = document.createElement("button"); b.type="button"; b.className="catbtn"; b.style.setProperty("--c", cat.color);
    b.textContent = cat.name; b.setAttribute("aria-pressed", String(TM.cat===cat.id));
    b.onclick = () => { TM.cat = cat.id; drawList(); syncChips(); };
    cEl.appendChild(b);
  });
  function syncChips(){
    mEl.querySelectorAll("button").forEach((b,i) => b.setAttribute("aria-pressed", String(TM.mode === modes[i][0])));
    const ids = ["all", ...TCATS.map(c=>c.id)];
    cEl.querySelectorAll("button").forEach((b,i) => b.setAttribute("aria-pressed", String(TM.cat === ids[i])));
  }
  head.querySelector("#tq").addEventListener("input", e => { TM.q = e.target.value; drawList(); });
  head.querySelector("#thide").onclick = e => { TM.hide = !TM.hide; TM.open = {}; e.target.setAttribute("aria-pressed", String(TM.hide)); e.target.textContent = TM.hide ? "かくして覚えるモード：オン" : "かくして覚えるモード：オフ"; drawList(); };

  const list = document.createElement("div");
  list.className = "termlist";
  app.appendChild(list);
  const order = TERMS.map((t,i)=>({t,i})).sort((a,b) => (b.t.f - a.t.f) || ((b.t.n?1:0) - (a.t.n?1:0)) || (a.i - b.i)).map(x => x.t);

  function drawList(){
    const q = TM.q.trim().toLowerCase();
    const hit = order.filter(t =>
      (TM.cat === "all" || t.c === TM.cat) &&
      (!/^f\d$/.test(TM.mode) || t.f === +TM.mode[1]) && (TM.mode !== "new" || t.n) && (TM.mode !== "todo" || !S.terms[termId(t)]) &&
      (!q || [t.t, t.y, t.d, t.k].join(" ").toLowerCase().includes(q)));
    list.innerHTML = hit.length ? "" : `<p class="panel muted">見つかりませんでした。言葉を短くするか、絞り込みを「すべて」に戻してみてね。</p>`;
    const cnt = document.createElement("p");
    cnt.className = "small muted"; cnt.style.textAlign = "center";
    cnt.textContent = `${hit.length}語（よく出る順）`;
    if(hit.length) list.appendChild(cnt);
    let shown = 0;
    const more = document.createElement("button");
    more.type = "button"; more.className = "btn wide";
    const page = () => {
      hit.slice(shown, shown + 30).forEach((x, k) => {
        const prev = hit[shown + k - 1];
        if(!prev || prev.f !== x.f){
          const h = document.createElement("h2");
          h.className = "stargroup";
          const n = hit.filter(y => y.f === x.f).length;
          h.innerHTML = `<span class="stars">${"★".repeat(x.f)}<span class="off">${"★".repeat(3-x.f)}</span></span>${["","知っておくと点になる","ときどき出る","よく出る"][x.f]}<span class="small muted num">${n}語</span>`;
          list.insertBefore(h, more);
        }
        list.insertBefore(termCard(x), more);
      });
      shown = Math.min(hit.length, shown + 30);
      more.hidden = shown >= hit.length;
      more.textContent = `もっと見る（あと${hit.length - shown}語）`;
    };
    more.onclick = page;
    list.appendChild(more);
    page();
  }
  function termCard(t){
    const cat = TCATS.find(c => c.id === t.c), id = termId(t), memo = !!S.terms[id];
    const gl = glosser();
    const el = document.createElement("article");
    el.className = "term" + (memo ? " memo" : "");
    el.style.setProperty("--c", cat.color);
    const hidden = TM.hide && !TM.open[id];
    el.innerHTML = `
      <div class="term-top"><span class="tcat">${cat.name}</span><span class="stars" aria-label="頻出度${t.f}">${"★".repeat(t.f)}<span class="off">${"★".repeat(3-t.f)}</span></span>${t.n ? '<span class="newb">NEW</span>' : ""}<span style="flex:1"></span>${typeof bmBtn === "function" ? bmBtn("t:" + t.t) : ""}</div>
      <h3>${t.t}</h3><p class="ty">${t.y}</p>
      ${hidden ? `<button type="button" class="reveal">答えを見る（図と説明）</button>` :
      `<figure class="tfig">${TFig(t.fig, cat.color)}</figure>
      <p class="tdesc">${gl(t.d)}</p>
      ${t.ex ? `<p class="tex"><span class="klbl">具体例</span>${gl(t.ex)}</p>` : ""}
      <p class="tkey"><span class="klbl">見分け方</span>${gl(t.k)}</p>`}
      <button type="button" class="memo-btn" aria-pressed="${memo}">${memo ? "✓ 覚えた" : "覚えたらチェック"}</button>`;
    if(typeof wireBm === "function") wireBm(el);
    const rv = el.querySelector(".reveal");
    if(rv) rv.onclick = () => { TM.open[id] = true; el.replaceWith(termCard(t)); };
    el.querySelector(".memo-btn").onclick = (e) => {
      S.terms[id] = !S.terms[id]; if(!S.terms[id]) delete S.terms[id];
      save();
      if(S.terms[id]){ burst(e.target, 10); gainXP(2); }
      const doneN = TERMS.filter(x => S.terms[termId(x)]).length;
      head.querySelector(".bar i").style.width = (doneN/total*100) + "%";
      head.querySelector(".num").textContent = `覚えた ${doneN} / ${total}`;
      el.replaceWith(termCard(t));
    };
    return el;
  }
  drawList();
}
