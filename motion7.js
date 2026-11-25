/* 圧縮を、入力・途中状態・符号長の比較で理解する。 */
(() => {
if(!window.M2)return;
const {stepper}=window.M2, X=window.M2EXT=window.M2EXT||{};
function rleSteps(mode){
 const input=mode==="repeat"?"AAAAABBBCC":"ABABABABAB",pairs=[],states=[];
 const snapshot=(end,text)=>({input,end,pairs:pairs.map(p=>({...p})),text});
 states.push(snapshot(0,"元の文字列は"+input+"。同じ文字が続く部分を、文字と個数の組へ置き換えます。"));
 let i=0;
 while(i<input.length){let j=i+1;while(j<input.length&&input[j]===input[i])j++;pairs.push({char:input[i],count:j-i});states.push(snapshot(j,input[i]+"が"+(j-i)+"個連続。組（"+input[i]+", "+(j-i)+"）を追加します。"));i=j;}
 const bytes=pairs.length*2;
 states.push(snapshot(i,"元は"+input.length+"バイト、圧縮後は"+pairs.length+"組 × 2 ＝ "+bytes+"バイト。"+(bytes<input.length?"連続が長いので小さくなりました。":"連続が短いので、個数を持つ分だけ大きくなりました。")+"文字を個数分ずつ並べれば元に戻せます。"));
 return states;
}
function huffmanSteps(mode){
 const freq=mode==="equal"?{A:2,B:2,C:2,D:2}:{A:5,B:2,C:1,D:1},forest=Object.entries(freq).map(([symbol,weight])=>({key:symbol,symbol,weight})),states=[];
 let root=null,codes={};
 const snap=text=>states.push({freq:{...freq},forest:[...forest],root,codes:{...codes},text});
 const sort=()=>forest.sort((a,b)=>a.weight-b.weight||a.key.localeCompare(b.key));
 sort();snap("小さい重みを2つずつ結びます。重みは出現回数。同じ重みなら、含む文字のアルファベット順で選ぶ例です。");
 while(forest.length>1){
  sort();const left=forest.shift(),right=forest.shift(),node={key:[...left.key,...right.key].sort().join(""),weight:left.weight+right.weight,left,right};forest.push(node);sort();
  if(forest.length===1){root=node;const walk=(n,p)=>{if(n.symbol)codes[n.symbol]=p;else{walk(n.left,p+"0");walk(n.right,p+"1");}};walk(root,"");}
  snap(left.key+"（"+left.weight+"）と"+right.key+"（"+right.weight+"）を結び、重み"+node.weight+"の節点を作ります。"+(root?"根から左は0、右は1として符号を読み取ります。":"できた節点を候補へ戻します。"));
 }
 const total=Object.values(freq).reduce((a,b)=>a+b,0),bits=Object.entries(freq).reduce((sum,[s,n])=>sum+n*codes[s].length,0);
 snap("4種類を固定長で表すと1文字2ビット、合計"+total*2+"ビット。作った符号では合計"+bits+"ビットです。"+(bits<total*2?"よく出る文字を短い符号にして、本文を小さくできます。":"今回は頻度が同じなので、本文の長さは固定長と同じです。"));
 return states;
}
function treeSVG(root){
 let leaf=0;const placed=[],edges=[];
 const walk=(n,depth)=>{let x;if(n.symbol)x=35+(leaf++)*74;else{const l=walk(n.left,depth+1),r=walk(n.right,depth+1);x=(l.x+r.x)/2;edges.push({from:{x,y:25+depth*65},to:l,bit:0},{from:{x,y:25+depth*65},to:r,bit:1});}const p={x,y:25+depth*65,n};placed.push(p);return p;};
 walk(root,0);
 return `<svg class="m7-tree" viewBox="0 0 292 245" role="img" aria-label="ハフマン木。根から左の枝は0、右の枝は1。葉の文字に着くまでの数字が符号">${edges.map(({from,to,bit})=>`<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="var(--muted)" stroke-width="2"/><text x="${(from.x+to.x)/2+(bit?7:-12)}" y="${(from.y+to.y)/2}" font-size="13" fill="var(--ink)">${bit}</text>`).join("")}${placed.map(({x,y,n})=>`<rect x="${x-23}" y="${y-15}" width="46" height="30" rx="9" fill="var(--card)" stroke="var(--accent)" stroke-width="2"/><text x="${x}" y="${y+5}" font-size="14" text-anchor="middle" fill="var(--ink)">${n.symbol?n.symbol+":"+n.weight:n.weight}</text>`).join("")}</svg>`;
}
window.M7={rleSteps,huffmanSteps};
X.runLength=box=>stepper(box,{select:{label:"連続の多さを比べる",value:"repeat",options:[["repeat","同じ文字が長く続く例"],["alternate","文字が交互に並ぶ例"]]},build:rleSteps,render:st=>`<p><b>元の文字列：</b></p><div class="motion-cells">${[...st.input].map((c,i)=>`<span class="motion-cell ${i<st.end?"found":""}">${c}</span>`).join("")}</div><p><b>作った組（文字・個数）：</b></p><div class="motion-cells">${st.pairs.map(p=>`<span class="motion-cell">（${p.char}, ${p.count}）</span>`).join("")||"まだなし"}</div><p>処理した文字：${st.end} / ${st.input.length} ／ 組を保存する量：${st.pairs.length*2}バイト</p><p>復元した処理済み部分：${st.pairs.map(p=>p.char.repeat(p.count)).join("")||"まだなし"}</p>`,note:"文字はASCIIで1バイト、個数も1バイトで保存し、ヘッダは付けない説明用の形式です。画素が同じ色で長く続く画像などで考え方が使われます。実際の形式では長さ制限や区切り方も決めます。"});
X.huffman=box=>stepper(box,{select:{label:"文字の出現頻度",value:"skew",options:[["skew","Aが多い：A5・B2・C1・D1"],["equal","全て同じ：A2・B2・C2・D2"]]},build:huffmanSteps,render:st=>{
 const table=Object.entries(st.freq),bits=table.reduce((sum,[s,n])=>sum+n*(st.codes[s]?.length||0),0);
 return `<p><b>結び合わせる候補：</b></p><div class="motion-cells">${st.forest.map(n=>`<span class="motion-cell">${n.key}：${n.weight}</span>`).join("")}</div>${st.root?treeSVG(st.root):'<p class="small">小さい候補を順にまとめ、木を作ります。</p>'}${st.root?`<div class="m2-tbl"><table><caption>文字ごとの符号と本文のビット数</caption><thead><tr><th scope="col">文字</th><th scope="col">回数</th><th scope="col">符号</th><th scope="col">回数×長さ</th></tr></thead><tbody>${table.map(([s,n])=>`<tr><th scope="row">${s}</th><td>${n}</td><td>${st.codes[s]}</td><td>${n} × ${st.codes[s].length} ＝ ${n*st.codes[s].length}</td></tr>`).join("")}</tbody></table></div><p><b>本文の合計：${bits}ビット</b> ／ 固定長なら${table.reduce((a,[,n])=>a+n,0)*2}ビット</p>`:""}<p class="small">文字は木の葉にあります。ある文字の符号が別の文字の符号の先頭にならないため、区切り記号なしで復号できます。</p>`;
},note:"比較は同じ4種類の文字を2ビットずつ表す場合との比較です。符号表・木・ヘッダを保存する量は含めません。短いデータでは、それらを含むファイル全体は大きくなる場合があります。同じ頻度でも別の正しい木や符号を作れる場合があります。"});
window.motion7HTML=()=>`<p>どちらも元へ戻せる可逆圧縮です。圧縮する前後の量と、元に戻すための情報を比べます。</p><details class="usage"><summary>ランレングス圧縮：繰り返しが少ないと逆に大きくなる？</summary><div class="usage-body" data-motion2="runLength"></div></details><details class="usage"><summary>ハフマン符号化：頻出文字を短い符号にする木</summary><div class="usage-body" data-motion2="huffman"></div></details>`;
Object.assign(window.MOTION_MAP||{},{"ランレングス圧縮":"runLength","ハフマン符号化":"huffman"});
})();
