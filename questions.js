/* 問題集：科目Aの出題パターンに合わせたオリジナル問題（a は正解の番号、0始まり） */
const QBANK = [
/* ---------- システム戦略 ---------- */
{sec:"sysst", q:"利用者がアプリケーションを開発・実行するための環境（OSやデータベースなど）を、インターネット経由で提供するサービスは？", opts:["SaaS","PaaS","IaaS","DaaS"], a:1, exp:"アプリを動かす土台（Platform）までがPaaS。アプリまで＝SaaS、設備だけ＝IaaS。"},
{sec:"sysst", q:"仮想サーバやストレージなどのインフラを提供し、OSから上は利用者が管理するクラウドサービスは？", opts:["SaaS","PaaS","IaaS","ASP"], a:2, exp:"設備（Infrastructure）だけを借りるのがIaaS。"},
{sec:"sysst", q:"システムの調達で、要件を示してベンダに具体的な提案を求める文書は？", opts:["RFI","RFP","RFQ","SLA"], a:1, exp:"P＝Proposal（提案）。情報だけ求めるのはRFI、見積りだけ求めるのはRFQ。"},
{sec:"sysst", q:"調達の最初の段階で、どんな製品・技術があるか、ベンダに情報の提供を求める文書は？", opts:["RFI","RFP","NDA","SOW"], a:0, exp:"I＝Information（情報）。RFI → RFP → 提案書 → 選定・契約の順。"},
{sec:"sysst", q:"顧客との関係を深め、顧客満足度や収益を高めることを目的とした情報システムは？", opts:["ERP","SCM","CRM","SFA"], a:2, exp:"C＝Customer（顧客）のCRM。"},
{sec:"sysst", q:"資材の調達から生産・物流・販売までの一連の流れを、企業の枠を越えて最適化する手法は？", opts:["CRM","SCM","ERP","BPR"], a:1, exp:"S＝Supply Chain（供給の連鎖）。"},
{sec:"sysst", q:"会計・人事・生産・販売などの基幹業務を統合して管理し、経営資源を有効に活用する仕組みは？", opts:["ERP","CRM","SFA","EA"], a:0, exp:"基幹業務の統合＝ERP。"},
{sec:"sysst", q:"既存の業務の流れを根本的に見直し、抜本的に再設計して大幅な改善をめざす手法は？", opts:["BPM","BPR","BPO","SOA"], a:1, exp:"R＝Re-engineering（作り直し）。継続的に少しずつ改善はBPM。"},
{sec:"sysst", q:"自社の業務の一部（コールセンターや経理など）を、外部の専門業者に委託することは？", opts:["BPR","BPO","BPM","EA"], a:1, exp:"O＝Outsourcing（外部委託）のBPO。"},
{sec:"sysst", q:"パソコンで行う定型的な事務作業を、ソフトウェアのロボットに自動で実行させる仕組みは？", opts:["RPA","AI","IoT","ERP"], a:0, exp:"定型作業の自動化＝RPA。"},
{sec:"sysst", q:"システムを機能ごとの「サービス」という部品で作り、組み合わせて業務システムを構築する考え方は？", opts:["SOA","EA","BPR","SLA"], a:0, exp:"S＝Service（サービス）指向のSOA。"},
{sec:"sysst", q:"本格的な導入の前に、新しい技術やアイデアが実現可能かを小さく試して確かめることは？", opts:["PoC","PoS","SLA","KPI"], a:0, exp:"Proof of Concept（概念実証）。"},

/* ---------- コンピュータ・ソフトウェア ---------- */
{sec:"hw", q:"2GHzのCPUで、1命令の実行に平均4クロックかかる。このCPUの性能は何MIPSか。", opts:["0.5","50","500","8,000"], a:2, exp:"20億 ÷ 4 ＝ 5億命令/秒 ＝ 500MIPS（100万で割る）。"},
{sec:"hw", q:"キャッシュのアクセス時間10ナノ秒、主記憶100ナノ秒、ヒット率95%のときの実効アクセス時間は？", opts:["9.5ナノ秒","14.5ナノ秒","55ナノ秒","105ナノ秒"], a:1, exp:"10×0.95＋100×0.05＝9.5＋5＝14.5。"},
{sec:"hw", q:"主記憶に使われ、記憶内容を保つために定期的なリフレッシュが必要なメモリは？", opts:["SRAM","DRAM","フラッシュメモリ","ROM"], a:1, exp:"DRAMはコンデンサの電荷が漏れるのでリフレッシュが必要。キャッシュはSRAM。"},
{sec:"hw", q:"電源を切ってもデータが消えず、SSDやUSBメモリに使われる半導体メモリは？", opts:["DRAM","SRAM","フラッシュメモリ","レジスタ"], a:2, exp:"不揮発性のフラッシュメモリ。"},
{sec:"hw", q:"仮想記憶で、参照しようとしたページが主記憶に存在しないときに発生するのは？", opts:["スラッシング","ページフォールト","スワッピング","フラグメンテーション"], a:1, exp:"主記憶にないときだけページフォールト。多発して処理が進まない状態がスラッシング。"},
{sec:"hw", q:"ページ置換えで、最後に参照されてから最も長い時間が経過したページを追い出す方式は？", opts:["FIFO","LIFO","LRU","LFU"], a:2, exp:"Least Recently Used＝最も長く使っていない。最も古く入ったものはFIFO。"},
{sec:"hw", q:"プログラム中で0による除算が起きたときに発生する割込みは？", opts:["外部割込み","内部割込み","入出力割込み","タイマ割込み"], a:1, exp:"プログラム自身が原因＝内部割込み。入出力完了やタイマは外部割込み。"},
{sec:"hw", q:"ソースプログラム全体を機械語に翻訳してから実行する言語処理プログラムは？", opts:["インタプリタ","コンパイラ","リンカ","ローダ"], a:1, exp:"まとめて翻訳＝コンパイラ。1行ずつ解釈・実行＝インタプリタ。"},
{sec:"hw", q:"複数の目的プログラムやライブラリを結合して、実行可能なプログラムを作るのは？", opts:["コンパイラ","リンカ","ローダ","デバッガ"], a:1, exp:"つなぐ＝リンカ、主記憶に読み込む＝ローダ。"},
{sec:"hw", q:"プリンタへの出力をいったん補助記憶に書き出し、CPUが次の処理を進められるようにする機能は？", opts:["スプーリング","バッファリング","ページング","スワッピング"], a:0, exp:"遅い装置を待たないためのスプーリング。"},
{sec:"hw", q:"単純な命令に絞って命令長を固定し、パイプラインで高速に実行するCPUのアーキテクチャは？", opts:["CISC","RISC","SIMD","VLIW"], a:1, exp:"Reduced（減らした）命令セットのRISC。"},
{sec:"hw", q:"カレントディレクトリが /usr/a のとき、相対パス ../b/c.txt が指すファイルは？", opts:["/usr/a/b/c.txt","/usr/b/c.txt","/b/c.txt","/usr/a/../c.txt"], a:1, exp:"「..」で1つ上の /usr に上がり、その下の b/c.txt。"},

/* ---------- システム構成 ---------- */
{sec:"sys", q:"MTBFが450時間、MTTRが50時間の装置の稼働率は？", opts:["0.8","0.85","0.9","0.95"], a:2, exp:"450 ÷ (450＋50) ＝ 0.9。"},
{sec:"sys", q:"稼働率0.9の装置2台を直列につなぎ、それと稼働率0.9の装置1台を並列につないだ。全体の稼働率は？（小数第3位を四捨五入）", opts:["0.73","0.81","0.98","0.99"], a:2, exp:"直列部分0.81。並列：1−(1−0.81)(1−0.9)＝1−0.19×0.1＝0.981 → 0.98。"},
{sec:"sys", q:"サーバの台数を増やして処理を分散し、システム全体の処理能力を高めることは？", opts:["スケールアップ","スケールアウト","スケールダウン","フェールオーバ"], a:1, exp:"台数を増やす＝アウト、1台を強くする＝アップ。"},
{sec:"sys", q:"待機系をいつでも切り替えられる状態で起動しておき、障害時にすぐ処理を引き継ぐ方式は？", opts:["コールドスタンバイ","ホットスタンバイ","シンプレックス","デュアルシステム"], a:1, exp:"すぐ切り替え＝ホット。障害後に起動するのはコールド。"},
{sec:"sys", q:"ファイルサーバ専用の機器で、LANに直接接続してファイル単位で共有できるストレージは？", opts:["SAN","NAS","DAS","RAID"], a:1, exp:"LANにつなぐファイル共有＝NAS。専用ネットワーク＝SAN。"},
{sec:"sys", q:"RASISのうち、MTTRで評価される性質は？", opts:["信頼性","可用性","保守性","完全性"], a:2, exp:"直しやすさ（Serviceability）＝保守性＝MTTR。信頼性＝MTBF、可用性＝稼働率。"},
{sec:"sys", q:"利用者の端末には最小限の機能だけを持たせ、アプリやデータはサーバ側で管理する方式は？", opts:["シンクライアント","ファットクライアント","ピアツーピア","グリッドコンピューティング"], a:0, exp:"端末にデータを残さない＝シンクライアント。"},
{sec:"sys", q:"窓口が1つの待ち行列で、利用率が0.5、平均サービス時間が4分のときの平均待ち時間は？", opts:["2分","4分","6分","8分"], a:1, exp:"0.5 ÷ (1−0.5) × 4 ＝ 1 × 4 ＝ 4分。"},
{sec:"sys", q:"ディスク2台に同じデータを書き込み、1台が故障しても読み書きを続けられるRAIDは？", opts:["RAID0","RAID1","RAID3","RAID5"], a:1, exp:"ミラーリング＝RAID1。"},
{sec:"sys", q:"システムの性能評価で、単位時間あたりに処理できる仕事の量を表すのは？", opts:["レスポンスタイム","スループット","ターンアラウンドタイム","MIPS"], a:1, exp:"処理の量＝スループット。"},

/* ---------- 基礎理論 ---------- */
{sec:"basic", q:"10進数の 13 を2進数で表したものは？", opts:["1011","1101","1110","1001"], a:1, exp:"13 ＝ 8＋4＋1 → 1101。"},
{sec:"basic", q:"8ビットの2の補数で −1 を表したものは？", opts:["00000001","10000001","11111110","11111111"], a:3, exp:"00000001 を反転して 11111110、1を足して 11111111。"},
{sec:"basic", q:"ある値を左に3ビット論理シフトすると、元の値の何倍になるか（あふれはないものとする）。", opts:["3倍","6倍","8倍","9倍"], a:2, exp:"左に1ビットで2倍。3ビットで2×2×2＝8倍。"},
{sec:"basic", q:"1011 と 0110 の排他的論理和（XOR）は？", opts:["0010","1111","1101","0100"], a:2, exp:"違う桁だけ1：1と0→1、0と1→1、1と1→0、1と0→1 で 1101。"},
{sec:"basic", q:"データを後入れ先出し（LIFO）で扱うデータ構造は？", opts:["キュー","スタック","リスト","木"], a:1, exp:"お皿の山＝スタック。行列＝キュー。"},
{sec:"basic", q:"整列済みの1,000件のデータを2分探索するとき、最大の比較回数はおよそ何回か。", opts:["10回","100回","500回","1,000回"], a:0, exp:"2の10乗＝1,024なので、約10回。"},
{sec:"basic", q:"中置記法の (A＋B)×(C−D) を逆ポーランド記法で表したものは？", opts:["AB＋CD−×","A＋B×C−D","×＋AB−CD","ABCD＋−×"], a:0, exp:"かっこの中を先に：AB＋ と CD− を作り、最後に ×。"},
{sec:"basic", q:"隣り合う要素を比べて、順序が逆なら交換することを繰り返す整列方法は？", opts:["選択ソート","挿入ソート","バブルソート","クイックソート"], a:2, exp:"泡のように大きい値が浮かぶバブルソート。"},
{sec:"basic", q:"受け取ったデータの1ビットの誤りを検出するだけでなく、訂正もできる方式は？", opts:["パリティチェック","チェックサム","ハミング符号","CRC"], a:2, exp:"訂正までできるのはハミング符号。"},
{sec:"basic", q:"5人から2人の代表を選ぶ組合せは何通りか。", opts:["10通り","20通り","25通り","60通り"], a:0, exp:"5×4÷2＝10通り（順番は関係ない）。"},
{sec:"basic", q:"データ 3, 5, 5, 7, 20 の中央値は？", opts:["5","6","8","20"], a:0, exp:"並べた真ん中は5。平均は8で、外れ値の20に引っ張られる。"},

/* ---------- データベース ---------- */
{sec:"db", q:"関係データベースで、表の行を一意に識別するための列（の組）を何という？", opts:["外部キー","主キー","候補キー","インデックス"], a:1, exp:"重複も空（NULL）も許さない主キー。"},
{sec:"db", q:"外部キーに、参照先の表に存在しない値を入れられないようにする制約は？", opts:["一意性制約","参照制約","検査制約","NOT NULL制約"], a:1, exp:"参照制約（参照整合性制約）。"},
{sec:"db", q:"第3正規形にするために取り除くのは？", opts:["繰返し項目","部分関数従属","推移的関数従属","主キー"], a:2, exp:"第1＝繰返し、第2＝部分関数従属、第3＝推移的関数従属。"},
{sec:"db", q:"表の検索を高速にするために作るが、データの追加・更新は遅くなる仕組みは？", opts:["ビュー","インデックス","トリガ","カーソル"], a:1, exp:"索引（インデックス）は検索が速く、更新時は索引も直すので遅くなる。"},
{sec:"db", q:"SQLで、検索結果の重複した行を1つにまとめるために SELECT の後に付けるのは？", opts:["DISTINCT","UNIQUE","GROUP","HAVING"], a:0, exp:"SELECT DISTINCT 列名。"},
{sec:"db", q:"SQLで、検索結果を並べ替えるための句は？", opts:["GROUP BY","ORDER BY","SORT BY","HAVING"], a:1, exp:"ORDER BY 列名（DESCで降順）。"},
{sec:"db", q:"障害でトランザクションが途中で止まったとき、更新前ログを使ってデータベースを元に戻す処理は？", opts:["ロールフォワード","ロールバック","コミット","チェックポイント"], a:1, exp:"途中の処理を取り消す＝ロールバック（更新前ログ）。"},
{sec:"db", q:"複数のトランザクションが互いに相手の持つロックの解除を待ち続け、処理が進まなくなる状態は？", opts:["デッドロック","排他制御","スラッシング","オーバフロー"], a:0, exp:"ロックを取る順番をそろえれば防げる。"},
{sec:"db", q:"分散データベースで、全拠点の準備完了を確認してから一斉に確定（コミット）する方法は？", opts:["2相コミット","2相ロック","ロールフォワード","レプリケーション"], a:0, exp:"準備確認（第1相）→ 確定（第2相）。"},
{sec:"db", q:"実際の表からSELECT文で定義される仮想的な表は？", opts:["インデックス","ビュー","スキーマ","ストアドプロシージャ"], a:1, exp:"データを持たない仮想の表＝ビュー。"},

/* ---------- ネットワーク ---------- */
{sec:"nw", q:"OSI参照モデルのトランスポート層で動作し、確実にデータを届けるためのプロトコルは？", opts:["IP","TCP","HTTP","ARP"], a:1, exp:"TCPはトランスポート層（4層）。IPはネットワーク層。"},
{sec:"nw", q:"IPアドレスから、同じネットワーク内の機器のMACアドレスを調べるプロトコルは？", opts:["DNS","DHCP","ARP","NTP"], a:2, exp:"IP → MAC はARP。名前 → IP はDNS。"},
{sec:"nw", q:"社内のプライベートIPアドレスとグローバルIPアドレスを、ポート番号も使って変換し、1つのグローバルアドレスを複数台で共有する技術は？", opts:["NAT","NAPT","DNS","VLAN"], a:1, exp:"ポート番号も変換するのがNAPT（IPマスカレード）。"},
{sec:"nw", q:"IPアドレス 192.168.10.0/26 のネットワークに接続できるホストの最大数は？", opts:["30","62","64","126"], a:1, exp:"32−26＝6ビット → 2の6乗＝64 → 64−2＝62。"},
{sec:"nw", q:"HTTPSで通常使われるポート番号は？", opts:["25","80","110","443"], a:3, exp:"HTTP＝80、HTTPS＝443、SMTP＝25、POP3＝110。"},
{sec:"nw", q:"無線LANで使われる、衝突を事前に回避するためのアクセス制御方式は？", opts:["CSMA/CD","CSMA/CA","トークンパッシング","TDMA"], a:1, exp:"A＝Avoidance（回避）は無線。D＝Detection（検出）は有線。"},
{sec:"nw", q:"スイッチの設定によって、物理的な配線に関係なく論理的にネットワークを分割する技術は？", opts:["VPN","VLAN","NAT","DMZ"], a:1, exp:"仮想的にLANを分けるVLAN。"},
{sec:"nw", q:"10Mバイトのファイルを、100Mビット/秒・伝送効率50%の回線で送る時間は？", opts:["0.2秒","0.8秒","1.6秒","2秒"], a:2, exp:"10×8＝80Mビット、100×0.5＝50Mビット/秒、80÷50＝1.6秒。"},
{sec:"nw", q:"Webブラウザの代わりにインターネットへのアクセスを中継し、キャッシュやアクセス制限を行うサーバは？", opts:["DNSサーバ","DHCPサーバ","プロキシサーバ","メールサーバ"], a:2, exp:"代理でアクセスするプロキシサーバ。"},
{sec:"nw", q:"IPv6のアドレスの長さは何ビットか。", opts:["32ビット","48ビット","64ビット","128ビット"], a:3, exp:"IPv4は32ビット、IPv6は128ビット。MACアドレスが48ビット。"},

/* ---------- セキュリティ ---------- */
{sec:"sec", q:"10人がそれぞれ互いに共通鍵暗号で通信するとき、必要な鍵の総数は？", opts:["10個","20個","45個","90個"], a:2, exp:"n(n−1)/2 ＝ 10×9÷2 ＝ 45個。公開鍵暗号なら2n＝20個。"},
{sec:"sec", q:"AさんがBさんに送る文書にデジタル署名を付ける。署名の作成に使う鍵は？", opts:["Aの公開鍵","Aの秘密鍵","Bの公開鍵","Bの秘密鍵"], a:1, exp:"署名は送る人の秘密鍵で作り、送る人の公開鍵で確かめる。"},
{sec:"sec", q:"公開鍵が確かに本人のものであることを、デジタル証明書を発行して保証する機関は？", opts:["認証局（CA）","CSIRT","SOC","JVN"], a:0, exp:"Certification Authority＝認証局。"},
{sec:"sec", q:"Webアプリケーションの入力欄に不正なSQL文を入力して、データベースを不正に操作する攻撃への有効な対策は？", opts:["プレースホルダの利用","パスワードの複雑化","WAFの撤去","Cookieの削除"], a:0, exp:"SQL文の組立てにプレースホルダ（バインド機構）を使う。"},
{sec:"sec", q:"ログイン中の利用者に罠のページを開かせ、利用者が意図しない処理（送金や投稿など）を実行させる攻撃は？", opts:["XSS","CSRF","SQLインジェクション","DNSキャッシュポイズニング"], a:1, exp:"利用者になりすましてリクエストを送らせるCSRF。"},
{sec:"sec", q:"他のサービスから漏えいしたIDとパスワードの組を使って、不正ログインを試みる攻撃は？", opts:["ブルートフォース攻撃","辞書攻撃","パスワードリスト攻撃","リバースブルートフォース攻撃"], a:2, exp:"パスワードの使い回しを狙うのがパスワードリスト攻撃。"},
{sec:"sec", q:"ネットワークへの侵入を検知して管理者に通知するが、通信の遮断は行わないシステムは？", opts:["IDS","IPS","WAF","UTM"], a:0, exp:"検知して知らせる＝IDS、遮断まで＝IPS。"},
{sec:"sec", q:"インターネットと社内LANの間に設け、Webサーバなど外部に公開するサーバを置くネットワークセグメントは？", opts:["VLAN","DMZ","VPN","SAN"], a:1, exp:"緩衝地帯のDMZ。"},
{sec:"sec", q:"情報セキュリティの3要素のうち、DDoS攻撃によって主に損なわれるのは？", opts:["機密性","完全性","可用性","真正性"], a:2, exp:"サービスを使えなくする＝可用性への攻撃。"},
{sec:"sec", q:"リスク対応のうち、外部委託や保険の加入によって損失を他者に移すことは？", opts:["リスク回避","リスク低減","リスク移転","リスク受容"], a:2, exp:"他に移す＝移転。"},
{sec:"sec", q:"ICカードと暗証番号を組み合わせた認証は、どの要素を組み合わせているか。", opts:["知識と知識","所有と知識","所有と生体","知識と生体"], a:1, exp:"カード＝所有、暗証番号＝知識。違う種類なので多要素認証。"},
{sec:"sec", q:"ランサムウェア対策として有効なバックアップは？", opts:["常時接続のネットワークドライブだけに保存","書換えや削除ができない形で、ネットワークから切り離して保存","同じPCの別フォルダに保存","バックアップは取らずに暗号化しておく"], a:1, exp:"オフラインやイミュータブル（書換え不可）のバックアップ。つながったままだと一緒に暗号化される。"},
{sec:"sec", q:"ソフトウェアを構成する部品（ライブラリなど）とそのバージョンの一覧で、脆弱性の影響調査に役立つものは？", opts:["SBOM","SLA","WBS","CVSS"], a:0, exp:"Software Bill of Materials＝ソフトウェアの部品表。"},
{sec:"sec", q:"生成AIに入力する文章に悪意のある指示を紛れ込ませ、想定外の動作や情報漏えいを起こさせる攻撃は？", opts:["プロンプトインジェクション","SQLインジェクション","ハルシネーション","ディープフェイク"], a:0, exp:"AIへの指示（プロンプト）を注入する攻撃。ハルシネーションは攻撃ではなく、AIがもっともらしい誤りを答える現象。"},

/* ---------- 開発 ---------- */
{sec:"dev", q:"システムの応答時間や稼働率、セキュリティなどに関する要件は？", opts:["機能要件","非機能要件","業務要件","技術要件"], a:1, exp:"「何をするか」以外の品質に関するものは非機能要件。"},
{sec:"dev", q:"DFDで使われない要素は？", opts:["プロセス","データストア","外部実体","分岐条件"], a:3, exp:"DFDはデータの流れの図。制御の流れ（分岐）は書かない。"},
{sec:"dev", q:"条件の組合せと、それぞれのときに行う動作を表の形で整理するものは？", opts:["状態遷移図","デシジョンテーブル","E-R図","ガントチャート"], a:1, exp:"条件と動作の表＝デシジョンテーブル。"},
{sec:"dev", q:"V字モデルで、要件定義に対応するテストは？", opts:["単体テスト","結合テスト","システムテスト","運用テスト（受入れテスト）"], a:3, exp:"最上流の要件定義は、最後の運用テストで確認する。"},
{sec:"dev", q:"プログラムを修正した後、修正していない部分に悪い影響が出ていないかを確かめるテストは？", opts:["回帰テスト","負荷テスト","単体テスト","ペネトレーションテスト"], a:0, exp:"リグレッション（回帰）テスト。"},
{sec:"dev", q:"ボトムアップテストで、まだ完成していない上位モジュールの代わりに使うものは？", opts:["スタブ","ドライバ","テストデータ","デバッガ"], a:1, exp:"上の代わり＝ドライバ、下の代わり＝スタブ。"},
{sec:"dev", q:"作成者が説明役となり、参加者が順にたどりながら誤りを見つけるレビュー手法は？", opts:["インスペクション","ウォークスルー","ラウンドロビン","パスアラウンド"], a:1, exp:"作成者主導＝ウォークスルー。モデレータ主導の正式なもの＝インスペクション。"},
{sec:"dev", q:"テストケースを先に作成し、そのテストに合格するようにプログラムを作る開発手法は？", opts:["ペアプログラミング","テスト駆動開発","リファクタリング","継続的インテグレーション"], a:1, exp:"テストが先＝TDD。"},
{sec:"dev", q:"外部から見た動作を変えずに、プログラムの内部構造を分かりやすく整理することは？", opts:["リファクタリング","リバースエンジニアリング","デバッグ","マイグレーション"], a:0, exp:"中身の整理＝リファクタリング。"},
{sec:"dev", q:"スクラムで、1〜4週間程度の決まった期間で区切った開発の単位は？", opts:["イテレーション計画","スプリント","マイルストーン","フェーズ"], a:1, exp:"スクラムの開発単位はスプリント。"},
{sec:"dev", q:"オブジェクト指向で、上位クラスの属性や操作を下位クラスが引き継ぐことは？", opts:["カプセル化","継承","多態性","インスタンス化"], a:1, exp:"親の性質を受け継ぐ＝継承（インヘリタンス）。"},

/* ---------- マネジメント ---------- */
{sec:"mgmt", q:"プロジェクトの作業を、管理しやすい大きさまで階層的に分解したものは？", opts:["WBS","PERT","EVM","ガントチャート"], a:0, exp:"Work Breakdown Structure。"},
{sec:"mgmt", q:"作業A（3日）→作業B（5日）の経路と、作業C（4日）→作業D（2日）の経路が並行して進む。全体の所要日数は？", opts:["6日","8日","9日","14日"], a:1, exp:"3＋5＝8日と4＋2＝6日の長いほう。"},
{sec:"mgmt", q:"上の問題で、作業Cが2日遅れた。全体の所要日数は？", opts:["8日","9日","10日","16日"], a:0, exp:"C→Dは4＋2＋2＝8日。A→Bの8日と同じなので、全体は8日のまま。"},
{sec:"mgmt", q:"要員を追加するなど資源を投入して、クリティカルパス上の作業期間を短縮する手法は？", opts:["ファストトラッキング","クラッシング","リスケジューリング","ベースライン"], a:1, exp:"資源を足す＝クラッシング（コストが増える）。並行に進める＝ファストトラッキング。"},
{sec:"mgmt", q:"画面や帳票、ファイルなどの機能の数と複雑さから、ソフトウェアの規模を見積もる手法は？", opts:["COCOMO","ファンクションポイント法","類推見積法","三点見積法"], a:1, exp:"機能を数える＝ファンクションポイント法。"},
{sec:"mgmt", q:"36人月の開発を、最初の3か月は6人で行った。残りを3か月で終えるには何人必要か（生産性は全員同じ）。", opts:["4人","6人","9人","12人"], a:1, exp:"3か月×6人＝18人月。残り18人月÷3か月＝6人。"},
{sec:"mgmt", q:"ITサービスの障害で、根本原因を突き止めて再発を防ぐ活動は？", opts:["インシデント管理","問題管理","変更管理","構成管理"], a:1, exp:"早く戻す＝インシデント管理、原因究明と再発防止＝問題管理。"},
{sec:"mgmt", q:"フルバックアップの後、前回のバックアップ（フルまたは増分）以降に変更されたデータだけを保存する方式は？", opts:["フルバックアップ","差分バックアップ","増分バックアップ","ミラーリング"], a:2, exp:"前回から＝増分。フルからの変更すべて＝差分。"},
{sec:"mgmt", q:"システム監査人の役割として適切なものは？", opts:["システムの不具合を自ら修正する","独立した立場で評価し、改善を勧告する","システムの運用を担当する","開発チームのリーダーを務める"], a:1, exp:"監査人は評価と勧告まで。直すのは被監査部門。"},
{sec:"mgmt", q:"災害などで業務が中断したときに、重要な業務を継続・早期再開するための計画は？", opts:["BCP","BPR","SLA","ISMS"], a:0, exp:"Business Continuity Plan（事業継続計画）。"},

/* ---------- 経営戦略・法務 ---------- */
{sec:"st", q:"売上高1,000万円、変動費400万円、固定費300万円のとき、損益分岐点売上高は？", opts:["300万円","500万円","700万円","750万円"], a:1, exp:"変動費率0.4 → 300 ÷ (1−0.4) ＝ 500万円。"},
{sec:"st", q:"PPMで、市場成長率は高いが市場占有率が低く、投資するか撤退するかの判断が必要な事業は？", opts:["花形","金のなる木","問題児","負け犬"], a:2, exp:"伸びる市場でまだ弱い＝問題児。"},
{sec:"st", q:"SWOT分析で「機会」と「脅威」は何を分析するものか。", opts:["自社の内部環境","自社を取り巻く外部環境","競合の財務状況","顧客の購買行動"], a:1, exp:"強み・弱み＝内部、機会・脅威＝外部。"},
{sec:"st", q:"発生件数の多い順に棒グラフで並べ、累積比率を折れ線で示して、重点的に取り組む項目を見つける図は？", opts:["特性要因図","散布図","パレート図","管理図"], a:2, exp:"多い順＋累積＝パレート図（ABC分析）。"},
{sec:"st", q:"著作権法による保護の対象となるものは？", opts:["アルゴリズム","プログラム言語","プログラム","通信の規約（プロトコル）"], a:2, exp:"表現であるプログラム本体は保護。アイデアや言語・規約は対象外。"},
{sec:"st", q:"請負契約で、発注者が受注者の作業者に直接作業を指示していた。この状態は？", opts:["適法な請負","偽装請負","労働者派遣","準委任"], a:1, exp:"請負で注文者が直接指揮命令するのは偽装請負。"},
{sec:"st", q:"他人のIDとパスワードを無断で使ってシステムにログインする行為を禁止している法律は？", opts:["著作権法","不正アクセス禁止法","個人情報保護法","不正競争防止法"], a:1, exp:"不正アクセス禁止法。"},
{sec:"st", q:"会社の業務として従業員が作成したプログラムの著作権は、特に契約などがなければ原則誰のものか。", opts:["作成した従業員","会社","発注した顧客","共同所有"], a:1, exp:"職務著作として、原則会社（法人）に帰属する。"},
{sec:"st", q:"財務諸表のうち、一定期間の収益と費用から利益を示すものは？", opts:["貸借対照表","損益計算書","キャッシュフロー計算書","株主資本等変動計算書"], a:1, exp:"期間の儲け＝損益計算書。ある時点の財産＝貸借対照表。"},
{sec:"st", q:"営業秘密として保護されるための要件に含まれないものは？", opts:["秘密として管理されている","事業に役立つ情報である","公然と知られていない","特許庁に登録されている"], a:3, exp:"営業秘密は登録不要。要件は秘密管理性・有用性・非公知性。"},
{sec:"st", q:"品質マネジメントシステムの国際規格は？", opts:["ISO 9001","ISO 14001","ISO/IEC 27001","ISO/IEC 20000"], a:0, exp:"9001＝品質、14001＝環境、27001＝情報セキュリティ、20000＝ITサービス。"}
];
FINAL_POOL.push(...QBANK.map(({q,opts,a,exp}) => ({q,opts,a,exp})));

/* ---------- 用語ずかんから自動で作る「用語クイズ」 ---------- */
function termQuestions(cat){
  const pool = TERMS.filter(t => !cat || t.c === cat);
  const out = [];
  pool.forEach(t => {
    const parts = t.t.split(/[・と（）()\s]/).filter(p => p.length >= 2);
    if(parts.some(p => t.d.includes(p))) return;          // 説明に答えが入っているものは除く
    const same = TERMS.filter(x => x !== t && x.c === t.c);
    const others = shuffle(same.length >= 3 ? same : TERMS.filter(x => x !== t)).slice(0, 3);
    const opts = shuffle([t, ...others]);
    out.push({q:`「${t.d}」に当てはまる用語は？`, opts: opts.map(x => x.t), a: opts.indexOf(t), exp:`見分け方：${t.k}`, term:true});
  });
  return out;
}
/* 問題集の分野 → 用語ずかんの分野 */
const SEC2TCAT = {basic:"basic", hw:"hw", sys:"sys", db:"db", nw:"nw", sec:"sec", dev:"dev", mgmt:"mgmt", sysst:"st", st:"st"};

/* ---------- 問題演習の画面 ---------- */
let PR = {sec:"all", src:"mix", set:null};
function startPractice(){
  const bank = PR.src === "term" ? [] : QBANK.filter(q => PR.sec === "all" || q.sec === PR.sec);
  const terms = PR.src === "bank" ? [] : termQuestions(PR.sec === "all" ? null : SEC2TCAT[PR.sec]);
  let list = PR.src === "mix" ? [...shuffle(bank).slice(0,6), ...shuffle(terms).slice(0,4)] : shuffle([...bank, ...terms]);
  list = shuffle(list).slice(0, 10);
  if(list.length < 10) list = shuffle([...bank, ...terms]).slice(0, 10);
  PR.set = {list, i:0, ok:0, miss:[]};
  render();
}
function renderPractice(){
  S.practice ||= {done:0, ok:0, best:{}};
  app.innerHTML = pageHead("問題演習", `オリジナル問題${QBANK.length}問と、用語ずかんから作る用語クイズ。10問ずつ出題するよ。`);
  const p = document.createElement("section");
  p.className = "panel";
  app.appendChild(p);

  if(!PR.set){
    const tq = termQuestions().length;
    p.innerHTML = `
      <div class="row between"><h2>出題の設定</h2><span class="small muted num">これまで ${S.practice.ok} / ${S.practice.done}問 正解</span></div>
      <p class="small muted">分野</p><div class="chips" id="psec"></div>
      <p class="small muted">問題の種類</p><div class="chips" id="psrc"></div>
      <p class="small muted" id="pinfo"></p>`;
    const secs = [{id:"all", title:"全分野"}, ...SECTIONS];
    const sEl = p.querySelector("#psec"), cEl = p.querySelector("#psrc"), info = p.querySelector("#pinfo");
    const srcs = [["mix","ミックス"],["bank","過去問風"],["term","用語クイズ"]];
    const count = () => {
      const b = QBANK.filter(q => PR.sec === "all" || q.sec === PR.sec).length;
      const t = termQuestions(PR.sec === "all" ? null : SEC2TCAT[PR.sec]).length;
      return PR.src === "bank" ? b : PR.src === "term" ? t : b + t;
    };
    const draw = () => {
      sEl.innerHTML = ""; cEl.innerHTML = "";
      secs.forEach(s => { const b = document.createElement("button"); b.type="button"; b.className="chipbtn"; b.setAttribute("aria-pressed", String(PR.sec===s.id)); b.textContent = s.title; b.onclick=()=>{ PR.sec=s.id; draw(); }; sEl.appendChild(b); });
      srcs.forEach(([k,l]) => { const b = document.createElement("button"); b.type="button"; b.className="chipbtn"; b.setAttribute("aria-pressed", String(PR.src===k)); b.textContent=l; b.onclick=()=>{ PR.src=k; draw(); }; cEl.appendChild(b); });
      info.textContent = `この条件の問題：${count()}問`;
    };
    draw();
    const go1 = document.createElement("button");
    go1.type = "button"; go1.className = "btn primary wide"; go1.textContent = "10問スタート";
    go1.onclick = startPractice;
    p.appendChild(go1);
    p.insertAdjacentHTML("beforeend", `<p class="small muted">用語クイズは${tq}問あり、選択肢が毎回入れ替わります。</p>`);
    return;
  }

  const st = PR.set;
  if(st.i >= st.list.length){
    const pass = st.ok >= Math.ceil(st.list.length * 0.6);
    if(st.ok === st.list.length) setTimeout(confetti, 150);
    p.style.alignItems = "center"; p.style.textAlign = "center";
    p.innerHTML = `${mascot(pass ? "happy" : "normal", "bob")}<span class="phase">${st.ok === st.list.length ? "全問正解！" : pass ? "合格ライン（6割）クリア！" : "あと少し！"}</span>
      <span class="big">${st.ok}<span style="font-size:22px"> / ${st.list.length}</span></span>
      ${st.miss.length ? `<div class="missed" style="text-align:left;width:100%"><b>間違えた問題</b>${st.miss.map(q=>`<div>${esc(q.q.length > 60 ? q.q.slice(0,60)+"…" : q.q)}<br>→ <b>${esc(q.opts[q.a])}</b></div>`).join("")}</div>` : ""}`;
    const btns = document.createElement("div");
    btns.style.cssText = "display:grid;gap:10px;width:100%";
    if(st.miss.length){ const b = document.createElement("button"); b.type="button"; b.className="btn primary"; b.textContent=`間違えた${st.miss.length}問だけもう一度`; b.onclick=()=>{ PR.set = {list: shuffle(st.miss), i:0, ok:0, miss:[]}; render(); }; btns.appendChild(b); }
    const again = document.createElement("button"); again.type="button"; again.className="btn" + (st.miss.length ? "" : " primary"); again.textContent="同じ条件で次の10問"; again.onclick=startPractice;
    btns.appendChild(again);
    const back = document.createElement("button"); back.type="button"; back.className="btn"; back.textContent="条件を変える"; back.onclick=()=>{ PR.set = null; render(); };
    btns.appendChild(back);
    p.appendChild(btns);
    return;
  }

  const q = st.list[st.i], gl = glosser();
  const secName = q.sec ? (secOf(q.sec)?.title || "") : "用語クイズ";
  p.innerHTML = `<div class="row between"><span class="pill ${q.term ? "good" : ""}">${q.term ? "用語クイズ" : secName}</span><span class="small muted num">${st.i+1} / ${st.list.length}　正解 ${st.ok}</span></div>`;
  const next = document.createElement("button");
  next.type = "button"; next.className = "btn primary wide"; next.hidden = true;
  next.textContent = st.i === st.list.length-1 ? "結果を見る" : "次の問題";
  p.appendChild(quiz(gl(q.q), q.opts, q.a, ok => {
    S.practice.done++;
    if(ok){ st.ok++; S.practice.ok++; gainXP(4); } else { st.miss.push(q); gainXP(1); }
    save(); checkMissions();
    next.hidden = false;
    return `<p class="xp-pop">+${ok?4:1} XP</p>`;
  }, `<p>${gl(q.exp)}</p>`));
  next.onclick = () => { st.i++; render(); };
  p.appendChild(next);
}
