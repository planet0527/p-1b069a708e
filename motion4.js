
/* 順序による違いを比較する、CPU・最短経路・ディスクの図解。 */
(() => {
if(!window.M2) return;
const {stepper,esc:e}=window.M2;
const X=window.M2EXT=window.M2EXT||{};
function cpuSteps(mode){
 const remaining={A:6,B:2,C:1},queue=["A","B","C"],chunks=[],done={};
 let time=0;
 const states=[{remaining:{...remaining},chunks:[],done:{},time:0,text:"Aは6、Bは2、Cは1単位時間の処理。全て時刻0に到着し、同じCPUを使います。"+(mode==="rr"?"2単位ずつ交代します。":"到着順A→B→Cで、終了までCPUを使います。")}];
 while(queue.length){
  const job=queue.shift(),n=mode==="rr"?Math.min(2,remaining[job]):remaining[job],start=time;
  time+=n;remaining[job]-=n;chunks.push({job,start,end:time,n});
  if(remaining[job])queue.push(job);else done[job]=time;
  states.push({remaining:{...remaining},chunks:chunks.map(x=>({...x})),done:{...done},time,text:"時刻"+start+"〜"+time+"は"+job+"を処理。"+(remaining[job]?job+"は残り"+remaining[job]+"、待ち列の後ろへ戻ります。":job+"が完了しました。")+(queue.length?"次に待つ順は"+queue.join("→")+"。":"全て完了。切替時間を省略したこの例では全体は9単位時間です。")});
 }
 return states;
}
function graphSteps(mode){
 const names=["A","B","C","D"],dist={A:0,B:Infinity,C:Infinity,D:Infinity},prev={},fixed=[],edges=[["A","B",2],["A","C",5],["B","C",mode==="short"?1:7],["B","D",6],["C","D",2]];
 const snapshot=(current,text)=>({edges:edges.map(x=>[...x]),dist:{...dist},prev:{...prev},fixed:[...fixed],current,text});
 const states=[snapshot(null,"AからDまでの最短距離を求めます。線の数字は移動コスト。全て0以上で、矢印のない無向グラフです。")];
 while(fixed.length<4){
  const current=names.filter(x=>!fixed.includes(x)).sort((a,b)=>dist[a]-dist[b]||a.localeCompare(b))[0];
  fixed.push(current);
  const changes=[];
  for(const [a,b,w]of edges){const next=a===current?b:b===current?a:null;if(next&&!fixed.includes(next)&&dist[current]+w<dist[next]){dist[next]=dist[current]+w;prev[next]=current;changes.push(next+"を"+dist[next]+"へ更新");}}
  let text="未確定の中で距離が最小の"+current+"（"+dist[current]+"）を確定。"+(changes.length?changes.join("、")+"。":"より短い候補はありません。");
  if(current==="D"){const path=["D"];while(path[0]!=="A")path.unshift(prev[path[0]]);text+="最短経路は"+path.join("→")+"、合計"+dist.D+"です。";}
  states.push(snapshot(current,text));
 }
 return states;
}
function diskSteps(mode){
 let head=50,total=0,pending=[10,70,30,90],served=[],route=[50];
 const states=[{head,total,pending:[...pending],served:[],route:[...route],text:"ヘッドは位置50。要求は到着順に10、70、30、90。途中の新規到着と回転待ち・転送時間は省略します。"}];
 let targets=[];
 if(mode==="fcfs")targets=[10,70,30,90];
 else if(mode==="scan")targets=[70,90,100,30,10];
 else {let pos=head,q=[...pending];while(q.length){q.sort((a,b)=>Math.abs(a-pos)-Math.abs(b-pos)||a-b);pos=q.shift();targets.push(pos);}}
 for(const next of targets){const before=head,move=Math.abs(next-head);head=next;total+=move;route.push(head);const service=pending.includes(head);if(service){served.push(head);pending=pending.filter(x=>x!==head);}
 states.push({head,total,pending:[...pending],served:[...served],route:[...route],text:"位置"+before+"から"+head+"へ"+move+"移動。"+(service?"位置"+head+"の要求を処理。":"ここは折り返し端で、要求はありません。")+(mode==="scan"&&head===100?"SCANでは最後の要求90でなく、端100まで進んで折り返します。":"")});
 }
 return states;
}
window.M4={cpuSteps,graphSteps,diskSteps};
X.cpuSchedule=box=>stepper(box,{select:{label:"CPUの割当方式",value:"fcfs",options:[["fcfs","FCFS：到着順に処理"],["rr","ラウンドロビン：2単位ずつ"]]},build:cpuSteps,render:st=>{
 const color={A:"var(--accent)",B:"var(--calc)",C:"var(--good)"};
 return `<p><b>実行済みの時間割（全体9単位）</b></p><div class="m4-cpu" role="img" aria-label="${st.chunks.map(x=>x.job+"を"+x.start+"から"+x.end).join("、")||"まだ処理なし"}">${st.chunks.map(x=>`<span style="width:${x.n/9*100}%;background:${color[x.job]}">${x.job}<small>${x.start}〜${x.end}</small></span>`).join("")}</div><p>現在時刻：${st.time} ／ 残り A：${st.remaining.A}、B：${st.remaining.B}、C：${st.remaining.C}</p><p><b>完了時刻：</b>${["A","B","C"].map(x=>x+"："+(st.done[x]??"未完了")).join(" ／ ")}</p><p class="small muted">色に加え、区間に処理名と時刻を示しています。早く交代すれば、短い処理が先に終わる場合があります。</p>`;},note:"全処理の到着時刻は0、入出力待ちと切替コストはない例です。全体の完了時刻が同じでも、各処理の完了時刻は変わります。"});
X.shortestGraph=box=>stepper(box,{select:{label:"B-Cのコスト",value:"short",options:[["short","1：Bを経由すると近い"],["long","7：B-Cが遠回り"]]},build:graphSteps,render:st=>{
 const xy={A:[28,82],B:[145,25],C:[145,140],D:[262,82]};
 const svg=`<svg class="m4-graph" viewBox="0 0 290 166" role="img" aria-label="A-Bは2、A-Cは5、B-Cは${st.edges[2][2]}、B-Dは6、C-Dは2。現在の確定対象は${st.current||"なし"}">${st.edges.map(([a,b,w])=>{const [x,y]=xy[a],[u,v]=xy[b],mx=(x+u)/2,my=(y+v)/2;return `<line x1="${x}" y1="${y}" x2="${u}" y2="${v}" stroke="var(--muted)" stroke-width="2"/><rect x="${mx-10}" y="${my-10}" width="20" height="20" rx="4" fill="var(--card)"/><text x="${mx}" y="${my+5}" text-anchor="middle" fill="var(--ink)" font-size="15">${w}</text>`;}).join("")}${Object.entries(xy).map(([name,[x,y]])=>`<circle cx="${x}" cy="${y}" r="19" fill="${name===st.current?"var(--accent)":"var(--card)"}" stroke="var(--accent)" stroke-width="${st.fixed.includes(name)?4:2}"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="16" fill="${name===st.current?"white":"var(--ink)"}">${name}</text>`).join("")}</svg>`;
 return svg+`<div class="motion-cells">${["A","B","C","D"].map(n=>`<span class="motion-cell ${st.fixed.includes(n)?"found":""}">${n}：${Number.isFinite(st.dist[n])?st.dist[n]:"∞"}<br>${st.fixed.includes(n)?"確定":"候補"}</span>`).join("")}</div><p class="small">未確定のうち、距離の候補が最小の頂点を次に確定します。∞はまだ経路が分からない状態です。</p>`;},note:"ダイクストラ法の例です。辺のコストが負の場合には、そのまま適用できません。線の幾何的な長さではなく、線に付けた数字を使います。"});
X.diskSchedule=box=>stepper(box,{select:{label:"読み出す順番",value:"fcfs",options:[["fcfs","FCFS：要求が来た順"],["sstf","SSTF：近い要求から"],["scan","SCAN：端100で折り返す"]]},build:diskSteps,render:st=>`<div class="m4-track" role="img" aria-label="ヘッド位置${st.head}。未処理は${st.pending.join("、")||"なし"}"><div class="m4-track-line"></div>${[0,25,50,75,100].map(n=>`<span class="m4-tick" style="left:${n}%">${n}</span>`).join("")}${[10,70,30,90].map(n=>`<span class="m4-request ${st.served.includes(n)?"served":""}" style="left:${n}%" title="要求位置${n}">${st.served.includes(n)?"✓":"●"}</span>`).join("")}<span class="m4-head" style="left:${st.head}%">▼</span></div><p><b>ヘッド位置：${st.head} ／ 移動距離の合計：${st.total}</b></p><p>移動順：${st.route.join(" → ")}</p><p>未処理：${st.pending.join("、")||"なし"} ／ 処理済み：${st.served.join("、")||"なし"}</p>`,note:"ディスク位置を0〜100とした例です。SSTFの同距離時は小さい位置を先に選びます。SCANは上向きに進み端100で反転し、残る要求まで処理して終了します。"});
window.motion4HTML=()=>`<p>同じ仕事でも、選ぶ順番で完了時刻や移動量が変わります。方式を切り替えて途中の状態を比べましょう。</p><details class="usage"><summary>CPUスケジューリング：FCFSとラウンドロビン</summary><div class="usage-body" data-motion2="cpuSchedule"></div></details><details class="usage"><summary>ダイクストラ法：最短経路を確定する順番</summary><div class="usage-body" data-motion2="shortestGraph"></div></details><details class="usage"><summary>ディスクの読み出し：FCFS・SSTF・SCAN</summary><div class="usage-body" data-motion2="diskSchedule"></div></details>`;
Object.assign(window.MOTION_MAP||{},{"タスク管理とスケジューリング":"cpuSchedule","ダイクストラ法":"shortestGraph"});
})();
