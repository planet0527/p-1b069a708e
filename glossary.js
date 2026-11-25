/* 略語ずかん：[正式名称, 日本語の意味] */
const GLOSS = {
  "CPU":["Central Processing Unit","中央処理装置"],
  "GHz":["Gigahertz","1秒間に10億回"],
  "MIPS":["Million Instructions Per Second","1秒間に実行できる命令数（百万単位）"],
  "MTBF":["Mean Time Between Failures","平均故障間隔＝動いている平均時間"],
  "MTTR":["Mean Time To Repair","平均修復時間＝直している平均時間"],
  "RAID":["Redundant Arrays of Inexpensive Disks","複数のディスクをまとめて使う技術"],
  "RAID0":["RAID level 0","ストライピング"],
  "RAID1":["RAID level 1","ミラーリング"],
  "RAID5":["RAID level 5","パリティで復元"],
  "OS":["Operating System","基本ソフト"],
  "SQL":["Structured Query Language","データベースを操作する言語"],
  "DBMS":["DataBase Management System","データベース管理システム"],
  "ACID":["Atomicity・Consistency・Isolation・Durability","原子性・一貫性・独立性・耐久性"],
  "AVG":["average","平均"],
  "SUM":["summation","合計"],
  "DDL":["Data Definition Language","データ定義言語"],
  "DML":["Data Manipulation Language","データ操作言語"],
  "LIFO":["Last In First Out","後入れ先出し"],
  "FIFO":["First In First Out","先入れ先出し"],
  "AND":["論理積","両方1のときだけ1"],
  "OR":["論理和","どちらかが1なら1"],
  "XOR":["eXclusive OR","排他的論理和"],
  "NOT":["否定","0と1を反転"],
  "OSI":["Open Systems Interconnection","開放型システム間相互接続"],
  "IP":["Internet Protocol","インターネットで宛先を決めるルール"],
  "MAC":["Media Access Control","機器ごとの固有の番号"],
  "L2":["Layer 2","第2層＝データリンク層"],
  "LAN":["Local Area Network","建物内などの狭い範囲のネットワーク"],
  "WAN":["Wide Area Network","離れた拠点を結ぶ広い範囲のネットワーク"],
  "TCP":["Transmission Control Protocol","確実に届けるルール"],
  "UDP":["User Datagram Protocol","速さ優先で届けるルール"],
  "HTTP":["HyperText Transfer Protocol","Webページをやり取りするルール"],
  "HTTPS":["HTTP Secure","暗号化したHTTP"],
  "SMTP":["Simple Mail Transfer Protocol","メールを送信・転送するルール"],
  "POP3":["Post Office Protocol version 3","メールを受信して端末に取り込むルール"],
  "IMAP":["Internet Message Access Protocol","メールをサーバ上で管理して読むルール"],
  "DNS":["Domain Name System","ドメイン名をIPアドレスに変える仕組み"],
  "DHCP":["Dynamic Host Configuration Protocol","IPアドレスを自動で割り当てる仕組み"],
  "NTP":["Network Time Protocol","時刻を合わせるルール"],
  "XSS":["Cross Site Scripting","クロスサイトスクリプティング"],
  "DoS":["Denial of Service","サービス妨害攻撃"],
  "DDoS":["Distributed Denial of Service","大量の機器からの分散型サービス妨害攻撃"],
  "CA":["Certification Authority","認証局"],
  "PKI":["Public Key Infrastructure","公開鍵基盤"],
  "XP":["eXtreme Programming","エクストリームプログラミング"],
  "UML":["Unified Modeling Language","設計図の書き方の統一ルール"],
  "IT":["Information Technology","情報技術"],
  "SPOC":["Single Point Of Contact","単一窓口"],
  "SLA":["Service Level Agreement","サービスレベル合意書"],
  "PPM":["Product Portfolio Management","事業の組合せを分析する手法"],
  "SWOT":["Strengths・Weaknesses・Opportunities・Threats","強み・弱み・機会・脅威"],
  "3C":["Customer・Competitor・Company","顧客・競合・自社"],
  "QC":["Quality Control","品質管理"],
  "ABC":["ABC analysis","重要度でA・B・Cの3つに分ける分析"],
  "PDCA":["Plan・Do・Check・Act","計画・実行・評価・改善のサイクル"],
  "SaaS":["Software as a Service","アプリケーションまで提供するクラウド"],
  "PaaS":["Platform as a Service","実行環境まで提供するクラウド"],
  "IaaS":["Infrastructure as a Service","設備だけ提供するクラウド"],
  "DaaS":["Desktop as a Service","デスクトップ環境を提供するクラウド"],
  "RFI":["Request For Information","情報提供依頼書"],
  "RFP":["Request For Proposal","提案依頼書"],
  "RFQ":["Request For Quotation","見積依頼書"],
  "NDA":["Non-Disclosure Agreement","秘密保持契約"],
  "BPR":["Business Process Re-engineering","業務プロセスの根本的な作り直し"],
  "BPM":["Business Process Management","業務プロセスの継続的な改善"],
  "SOA":["Service Oriented Architecture","サービス指向アーキテクチャ"],
  "EA":["Enterprise Architecture","組織全体の業務とシステムの設計手法"],
  "ERP":["Enterprise Resource Planning","基幹業務を統合する仕組み"],
  "CRM":["Customer Relationship Management","顧客関係管理"],
  "SFA":["Sales Force Automation","営業支援システム"],
  "SCM":["Supply Chain Management","供給連鎖の管理"]
};

/* 1画面の中で、略語の最初の1回だけ「（正式名称：意味）」を付ける */
const GL_KEYS = Object.keys(GLOSS).sort((a,b) => b.length - a.length);
const GL_RE = new RegExp(`(?<![A-Za-z0-9])(${GL_KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")})(?![A-Za-z0-9])`, "g");
function glossText(k){ const [en, ja] = GLOSS[k]; return en === ja || !ja ? en : `${en}：${ja}`; }
function glosser(){
  const used = new Set();
  return html => String(html).split(/(<[^>]+>)/).map(part =>
    part.startsWith("<") ? part : part.replace(GL_RE, m => {
      if(used.has(m)) return m;
      used.add(m);
      return `${m}<span class="abbr">（${glossText(m)}）</span>`;
    })).join("");
}
