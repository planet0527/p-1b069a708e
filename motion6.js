/* 探索順と、一連の更新を確定する単位を可視化する。 */
(() => {
if(!window.M2)return;
const {stepper}=window.M2, X=window.M2EXT=window.M2EXT||{};
const ADJ={A:["B","C"],B:["A","D","E"],C:["A","E"],D:["B"],E:["B","C"]};
function traversalSteps(mode){
 const visited=[],seen=new Set(),states=[];
 const snap=(current,pending,text)=>states.push({current,visited:[...visited],pending:[...pending],text});
 snap(null,[],"Aから出発します。つながる先はアルファベット順に調べ、訪問済みの頂点にはもう進みません。このグラフには巡回路があります。");
 if(mode==="bfs"){
  const queue=["A"];seen.add("A");
  snap(null,queue,"幅優先探索はキューを使います。Aを発見し、キューへ入れました。発見時に印を付けるので、同じ頂点を重複して入れません。");
  while(queue.length){
   const current=queue.shift();visited.push(current);const added=[];
   for(const n of ADJ[current])if(!seen.has(n)){seen.add(n);queue.push(n);added.push(n);}
   snap(current,queue,current+"をキューの先頭から取り出して訪問。"+(added.length?added.join("、")+"を発見し、末尾へ追加。":"新しく追加する頂点はありません。")+(queue.length?"次は"+queue[0]+"。":"キューが空になり探索完了。"));
  }
 }else{
  const stack=[];
  function visit(current){
   seen.add(current);visited.push(current);stack.push(current);
   snap(current,stack,current+"を訪問。未訪問の隣接頂点があれば、そこへ深く進みます。"+(current==="C"?"Cの隣は全て訪問済みなので、この後は呼び出し元へ戻ります。":""));
   for(const n of ADJ[current])if(!seen.has(n))visit(n);
   stack.pop();
  }
  visit("A");snap(null,[],"全ての呼び出しが戻って探索完了。訪問済みを記録しているため、巡回路があっても同じ頂点を繰り返し訪問しません。");
 }
 return states;
}
function transactionSteps(mode){
 let work={A:1000,B:500},saved={...work};const states=[];
 const snap=(phase,text)=>states.push({work:{...work},saved:{...saved},phase,text});
 const unsafe=mode==="unsafe",fail=mode!=="success";
 snap("開始前","Aの残高1000、Bの残高500。AからBへ300を移す2つの更新を考えます。合計は1500です。");
 snap(unsafe?"更新を別々に確定":"BEGIN",unsafe?"各更新を別々に確定する比較例です。2つの更新をまとめて取り消す単位がありません。":"トランザクションを開始します。Aの減額とBの増額を、1つの確定単位にまとめます。");
 work.A-=300;if(unsafe)saved={...work};
 snap("Aを300減額",unsafe?"Aを700へ減額し、この更新だけ確定しました。Bはまだ500です。":"処理中のAは700。まだコミットしていないので、この例の確定済みの値は1000のままです。");
 if(fail){
  snap("Bの更新でエラー","Bを増額する前にエラーが発生しました。Aだけ減った途中状態を、どう扱うでしょう？");
  if(!unsafe){work={...saved};snap("ROLLBACK","ロールバックで、このトランザクションの変更を全て取り消します。Aは1000、Bは500へ戻り、合計1500を保ちます。");}
  else snap("途中の更新が残る","Aの減額は既に確定しているため、この失敗だけでは元に戻りません。Aは700、Bは500、合計1200。関連する更新を1つの単位にまとめる必要があります。");
 }else{
  work.B+=300;snap("Bを300増額","処理中のBは800。2つの更新が終わりましたが、まだコミット前です。");
  saved={...work};snap("COMMIT","コミットで2つの更新をまとめて確定。Aは700、Bは800、合計1500です。");
 }
 return states;
}
window.M6={traversalSteps,transactionSteps};
X.graphTraversal=box=>stepper(box,{select:{label:"グラフの探索方式",value:"bfs",options:[["bfs","幅優先探索：近い頂点から"],["dfs","深さ優先探索：行ける所まで進む"]]},build:traversalSteps,render:(st,mode)=>{
 const xy={A:[28,90],B:[130,30],C:[130,150],D:[262,30],E:[262,150]},edges=[["A","B"],["A","C"],["B","D"],["B","E"],["C","E"]];
 return `<svg class="m6-graph" viewBox="0 0 290 178" role="img" aria-label="A-B、A-C、B-D、B-E、C-Eがつながる無向グラフ。現在の頂点は${st.current||"なし"}">${edges.map(([a,b])=>`<line x1="${xy[a][0]}" y1="${xy[a][1]}" x2="${xy[b][0]}" y2="${xy[b][1]}" stroke="var(--muted)" stroke-width="2"/>`).join("")}${Object.entries(xy).map(([n,[x,y]])=>`<circle cx="${x}" cy="${y}" r="19" fill="${n===st.current?"var(--accent)":"var(--card)"}" stroke="var(--accent)" stroke-width="${st.visited.includes(n)?4:2}"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="16" fill="${n===st.current?"white":"var(--ink)"}">${n}</text>`).join("")}</svg><p><b>訪問順：</b>${st.visited.join(" → ")||"まだなし"}</p><p><b>${mode==="bfs"?"待ちキュー（左が次）":"呼び出しスタック（右が現在）"}：</b>${st.pending.join(" → ")||"空"}</p><p class="small">太い枠は訪問済み、塗りつぶしは今の頂点。頂点の並び順を変えると、探索順も変わる場合があります。</p>`;
},note:"幅優先探索では辺の本数が少ない順に訪問します。これは重み付きグラフの最小コスト探索とは異なります。深さ優先探索は再帰で実装した例です。"});
X.transaction=box=>stepper(box,{select:{label:"更新の結果を比べる",value:"success",options:[["success","成功：まとめてコミット"],["rollback","失敗：まとめてロールバック"],["unsafe","失敗：更新を別々に確定した場合"]]},build:transactionSteps,render:st=>`<p><b>現在の処理：${st.phase}</b></p><div class="m2-tbl"><table><caption>残高の変化（説明用の単位）</caption><thead><tr><th scope="col">状態</th><th scope="col">A</th><th scope="col">B</th><th scope="col">合計</th></tr></thead><tbody><tr><th scope="row">処理中の値</th><td>${st.work.A}</td><td>${st.work.B}</td><td>${st.work.A+st.work.B}</td></tr><tr><th scope="row">確定済みの値</th><td>${st.saved.A}</td><td>${st.saved.B}</td><td>${st.saved.A+st.saved.B}</td></tr></tbody></table></div><p class="small">処理中に一時的に合計が変わっても、成功なら両方を確定、失敗なら両方を取り消します。</p>`,note:"ACIDの原子性（一連の処理を全て行うか、全て取り消すか）を示す図です。他の利用者からの見え方、同時更新、障害後の復旧手順は省略しています。"});
window.motion6HTML=()=>({graph:`<p>同じつながりを、キューとスタックでどうたどるか比べます。</p><details class="usage"><summary>幅優先・深さ優先探索：巡回路があっても止まる理由</summary><div class="usage-body" data-motion2="graphTraversal"></div></details>`,db:`<p>途中の状態と確定済みの状態を見比べ、一連の更新をまとめる意味を確かめます。</p><details class="usage"><summary>トランザクション：コミット・ロールバックと原子性</summary><div class="usage-body" data-motion2="transaction"></div></details>`});
Object.assign(window.MOTION_MAP||{},{"深さ優先探索と幅優先探索":"graphTraversal","トランザクション":"transaction","ACID特性":"transaction"});
})();
