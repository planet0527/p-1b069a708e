/* 操作ごとの状態を図で追う入門用シミュレーター。 */
function motionHTML(){
  return `<p>「次へ」で1操作ずつ進みます。図の強調部分と、その下の説明を一緒に見てください。「前へ」で直前の状態に戻せます。</p>
  <details class="usage"><summary>スタックとキュー：入れたものは、どちらから出る？</summary><div class="usage-body" data-motion="containers"></div></details>
  <details class="usage"><summary>二分探索：探す範囲が半分ずつになる様子</summary><div class="usage-body" data-motion="binary"></div></details>
  <details class="usage"><summary>キャッシュ：ヒット・ミスと、データの入れ替え</summary><div class="usage-body" data-motion="cache"></div></details>`;
}
function containerSteps(){
  const stack=[],queue=[],states=[{stack:[],queue:[],outStack:"—",outQueue:"—",text:"まだ何も入っていません。スタックは右端、キューは左端から取り出す図です。"}];
  let outStack="—",outQueue="—";
  for(const value of ["A","B","C",null,"D",null]){
    if(value){ stack.push(value);queue.push(value); }
    else {outStack=stack.pop();outQueue=queue.shift();}
    states.push({stack:[...stack],queue:[...queue],outStack,outQueue,text:value ? value+"を追加。どちらも右端へ入れます。" : "取り出すと、スタックは"+outStack+"、キューは"+outQueue+"。最後に入れたものと、最初に入れたものの違いです。"});
  }
  return states;
}
function binarySteps(target){
  const values=[3,8,12,19,25,31,42],states=[{values,low:0,high:6,mid:null,text:"昇順に並んだ7個から"+target+"を探します。まず全体が候補です。"}];
  let low=0,high=values.length-1;
  while(low<=high){
    const mid=Math.floor((low+high)/2),value=values[mid],found=value===target;
    states.push({values,low,high,mid,found,text:found ? "中央の"+value+"が探す値と一致。見つかりました。" : "中央は"+value+"。探す"+target+"のほうが"+(target>value?"大きいので、次は中央より右":"小さいので、次は中央より左")+"だけを候補にします。"});
    if(found)return states;
    if(target>value)low=mid+1;else high=mid-1;
  }
  states.push({values,low,high,mid:null,text:"候補がなくなりました。"+target+"はこの配列にはありません。"});
  return states;
}
function cacheSteps(){
  const slots=[null,null],states=[{slots:[...slots],request:null,hit:null,hits:0,misses:0,text:"小さく速いキャッシュが2枠ある簡略例です。ブロック番号を2で割った余りが、入れる枠番号になります。"}];
  let hits=0,misses=0;
  for(const request of [0,1,0,2,0,1]){
    const slot=request%2,hit=slots[slot]===request,previous=slots[slot];
    if(hit)hits++;else {misses++;slots[slot]=request;}
    states.push({slots:[...slots],request,slot,hit,hits,misses,text:hit ? "ブロック"+request+"は枠"+slot+"にありました。ヒットなので、この例では主記憶からの読み出しは不要です。" : "ブロック"+request+"は枠"+slot+"にありません。ミスなので主記憶から読み、枠"+slot+"へ保存します。"+(previous===null?"":"前にあったブロック"+previous+"は置き換わります。")});
  }
  return states;
}

function sortSteps(){
 const a=[3,1,4,2],s=[{values:[...a],pair:[],fixed:4,text:"バブルソートでは隣同士を比較し、大きい値を右へ送ります。"}];
 for(let p=0;p<3;p++){const end=3-p;for(let j=0;j<end;j++){const swap=a[j]>a[j+1];s.push({values:[...a],pair:[j,j+1],fixed:end+1,text:a[j]+"と"+a[j+1]+"を比較。"+(swap?"左が大きいので次に入れ替えます。":"順序は正しいので、そのままです。")});if(swap){[a[j],a[j+1]]=[a[j+1],a[j]];s.push({values:[...a],pair:[j,j+1],fixed:end+1,text:"入れ替えると、大きい値が右へ1個動きます。"});}}s.push({values:[...a],pair:[],fixed:end,text:"この周が終了。右側の"+a[end]+"の位置が確定しました。次は確定部分を除いて比較します。"});}
 s.push({values:[...a],pair:[],fixed:0,text:"1、2、3、4になりました。比較することと、入れ替えることは別の操作です。"});return s;
}
function networkSteps(local){
 const ip=local?"192.0.2.20":"198.51.100.20",mac=local?"相手PCのMAC":"ルータのMAC";
 return [
 {ip:"未確認",mac:"未確認",stage:"名前を指定",text:"PCは192.0.2.10/24。shop.exampleへ送る例です。各確認の役割を順番に見ます。"},
 {ip,mac:"未確認",stage:"DNS",text:"DNSで名前に対応するIPアドレスを確認。DNSがWebページ本体を返すわけではありません。"},
 {ip,mac:"未確認",stage:"経路を確認",text:local?"同じ192.0.2.0/24内なので、相手へ直接渡します。":"別ネットワークなので、経路に従ってデフォルトゲートウェイへ渡す例です。"},
 {ip,mac,stage:"ARP",text:local?"ARPで同じLAN上の相手PCのIPに対応するMACを調べます。":"ARPで同じLAN上のルータのIPに対応するMACを調べます。遠くのサーバのMACを直接ARPで探しません。"},
 {ip,mac,stage:"フレームを送信",text:"IPの宛先は"+ip+"。このLANのフレームの宛先は"+mac+"。最終的な宛先と、次に渡す機器を区別します。"},
 {ip,mac,stage:local?"相手に到着":"ルータで中継",text:local?"同じLAN内の相手へ届きました。この例ではルータによる中継は不要です。":"ルータは次のリンクへ中継し、フレームを作り直します。NATを扱わないこの例では、宛先IPはサーバのままです。"}
 ];
}
function lockSteps(deadlock){
 const rows=deadlock?[
 ["X:空き／Y:空き","開始","開始","AとBの両方が資源XとYを使いたい場面です。"],
 ["X:A／Y:空き","Xを確保","開始","AがXをロックします。"],
 ["X:A／Y:B","Xを保持","Yを確保","Bは逆の順番でYをロックしました。"],
 ["X:A／Y:B","Yを待つ（Xは保持）","Yを保持","AはBが持つYを待ちます。"],
 ["X:A／Y:B","Yを待つ（Xは保持）","Xを待つ（Yは保持）","BもAが持つXを待ちます。互いに解放を待って進めないデッドロックです。"],
 ["X:A／Y:空き","Yを待つ","取消し・ロック解放","対処例としてDBがBを取り消します。Bの更新を巻き戻し、ロックを解放します。"],
 ["X:A／Y:A","両方を確保して続行","後で再試行","AがYを確保して進めます。予防策のひとつは、両方がX→Yのように同じ順でロックすることです。"]
 ]:[
 ["残り1席／ロック:空き","開始","開始","席数を読む前に行を排他ロックし、残り1席の予約を処理する例です。"],
 ["残り1席／ロック:A","ロックして残り1席を確認","開始","Aがロックを取って席数を読みます。"],
 ["残り1席／ロック:A","予約処理中","ロック待ち","Bは同じ行のロックを取ろうとしますが、Aが持つため待ちます。"],
 ["残り0席（未確定）／ロック:A","残り0席へ更新","ロック待ち","まだコミット前なのでAはロックを保持しています。"],
 ["残り0席／ロック:空き","コミット・予約確定","待機終了","Aがコミットし、ロックを解放しました。"],
 ["残り0席／ロック:B","予約完了","ロック後に0席を確認","Bはロック後の値を確認して予約できないと判断します。古い1席を使い回しません。"],
 ["残り0席／ロック:空き","予約完了","予約せず終了・解放","予約できたのはAだけ。順番待ちで同時更新の矛盾を防ぎました。"]
 ];return rows.map(([resource,a,b,text])=>({resource,a,b,text}));
}


function logicResult(op,a,b){return op==="AND"?(a&b):op==="OR"?(a|b):op==="XOR"?(a^b):1-a;}
function subnetResult(prefix){
 const bits=32-prefix,mask=(256-2**bits)&255,network=154&mask,broadcast=network+2**bits-1;
 return {bits,mask,network,broadcast,hosts:2**bits-2};
}
function pathResult(mode){
 const top=[3,mode==="top-short"?3:mode==="top-long"?9:5],bottom=[4,mode==="bottom-short"?3:6];
 const t=top[0]+top[1],b=bottom[0]+bottom[1];return {top,bottom,t,b,total:Math.max(t,b)};
}
function wireInteractive(box){
 const type=box.dataset.motion;
 let a=0,b=1,op="AND",prefix=26,step=0,mode="base";
 function draw(){
  if(type==="logic"){
   const out=logicResult(op,a,b),names={AND:"両方が1のとき1",OR:"どちらかが1なら1",XOR:"2つが違うとき1",NOT:"0と1を反転"};
   box.innerHTML=`<label class="motion-target">演算<select data-op>${Object.keys(names).map(x=>`<option ${x===op?"selected":""}>${x}</option>`).join("")}</select></label><div class="motion-cells"><button type="button" class="btn" data-bit="a" aria-pressed="${!!a}">入力A：${a}</button>${op==="NOT"?"":`<button type="button" class="btn" data-bit="b" aria-pressed="${!!b}">入力B：${b}</button>`}<span>→</span><span class="motion-cell">${op}</span><span>→</span><span class="motion-cell ${out?"found":""}">出力 ${out}</span></div><p role="status">${names[op]}。今の入力では出力は${out}です。入力ボタンで0と1を切り替えられます。</p><details class="usage"><summary>真理値表で全組合せを確認する</summary><div class="usage-body"><div class="guide-table-wrap"><table class="guide-table"><thead><tr><th scope="col">A</th>${op==="NOT"?"":'<th scope="col">B</th>'}<th scope="col">出力</th></tr></thead><tbody>${(op==="NOT"?[[0,0],[1,0]]:[[0,0],[0,1],[1,0],[1,1]]).map(([x,y])=>`<tr class="${x===a&&(op==="NOT"||y===b)?"motion-tr-current":""}"><td>${x}</td>${op==="NOT"?"":`<td>${y}</td>`}<td>${logicResult(op,x,y)}</td></tr>`).join("")}</tbody></table></div><p class="small">強調行は今の入力です。XORはORと違い、両方1だと0になります。</p></div></details>`;
   box.querySelector("[data-op]").onchange=e=>{op=e.target.value;draw();box.querySelector("[data-op]").focus({preventScroll:true});};
   box.querySelectorAll("[data-bit]").forEach(btn=>btn.onclick=()=>{const key=btn.dataset.bit;if(key==="a")a=1-a;else b=1-b;draw();box.querySelector('[data-bit="'+key+'"]').focus({preventScroll:true});});
  }else if(type==="subnet"){
   const r=subnetResult(prefix),binary=n=>n.toString(2).padStart(8,"0"),texts=[
    "左から"+prefix+"ビットがネットワーク部。残る"+r.bits+"ビットがホスト部です。",
    "IPとマスクのANDを取ります。マスクの1の位置は元の値が残り、0の位置は0になります。",
    "ネットワークアドレスは192.0.2."+r.network+"。ホスト部をすべて0にした、その範囲の先頭です。",
    "範囲の末尾192.0.2."+r.broadcast+"がブロードキャスト。通常のホスト用は192.0.2."+(r.network+1)+"〜"+(r.broadcast-1)+"で"+r.hosts+"台です。"
   ];
   box.innerHTML=`<label class="motion-target">プレフィックス<select data-prefix>${[24,26,28].map(x=>`<option value="${x}" ${x===prefix?"selected":""}>/${x}</option>`).join("")}</select></label><p><b>IPアドレス：192.0.2.154</b><br>最初の24ビット（192.0.2）は全てネットワーク部。</p><div class="motion-diagram"><b>最後の8ビット：青＝ネットワーク部、点線＝ホスト部</b><div class="motion-bits" role="img" aria-label="最後の8ビットは10011010。左${prefix-24}ビットがネットワーク部">${binary(154).split("").map((x,i)=>`<span class="motion-cell ${i<prefix-24?"active":"motion-host"}">${x}</span>`).join("")}</div>${step>=1?`<p>IP：${binary(154)}<br>マスク：${binary(r.mask)}<br>AND結果：${binary(r.network)}</p><p>サブネットマスク：255.255.255.${r.mask}</p>`:""}${step>=2?`<p><b>ネットワーク：192.0.2.${r.network}/${prefix}</b></p>`:""}${step>=3?`<p>アドレス数：2の${r.bits}乗＝${r.hosts+2}個<br>通常のホスト用：${r.hosts+2}−2＝${r.hosts}台</p>`:""}</div><p role="status">手順 ${step} / 3：${texts[step]}</p><div class="motion-controls"><button type="button" class="btn" data-ip-step="-1" ${step===0?"disabled":""}>前へ</button><button type="button" class="btn primary" data-ip-step="1" ${step===3?"disabled":""}>次へ</button><button type="button" class="btn" data-ip-reset>最初から</button></div><p class="small muted">通常のIPv4サブネットの例です。/31・/32などの特殊な用途に「−2」を機械的に適用しません。</p>`;
   box.querySelector("[data-prefix]").onchange=e=>{prefix=Number(e.target.value);step=0;draw();box.querySelector("[data-prefix]").focus({preventScroll:true});};
   box.querySelectorAll("[data-ip-step]").forEach(btn=>btn.onclick=()=>{step+=Number(btn.dataset.ipStep);draw();box.querySelector(step===3?'[data-ip-step="-1"]':'[data-ip-step="1"]').focus({preventScroll:true});});
   box.querySelector("[data-ip-reset]").onclick=()=>{step=0;draw();box.querySelector('[data-ip-step="1"]').focus({preventScroll:true});};
  }else{
   const p=pathResult(mode);
   box.innerHTML=`<label class="motion-target">変更する条件<select data-path><option value="base" ${mode==="base"?"selected":""}>変更なし</option><option value="top-short" ${mode==="top-short"?"selected":""}>Bを5日→3日</option><option value="bottom-short" ${mode==="bottom-short"?"selected":""}>Dを6日→3日</option><option value="top-long" ${mode==="top-long"?"selected":""}>Bを5日→9日</option></select></label><p>A→BとC→Dを同時に開始し、両方が終わると完了する仕事です。</p><div class="motion-diagram"><b>開始（0日）</b>${[[p.top,p.t,["A","B"]],[p.bottom,p.b,["C","D"]]].map(([durations,total,labels])=>`<div><p>${labels.join(" → ")}：${total}日 ${total===p.total?"（クリティカルパス）":""}</p><div class="motion-timeline" role="img" aria-label="${labels[0]}が${durations[0]}日、その後${labels[1]}が${durations[1]}日">${durations.map((n,i)=>`<span style="width:${n/12*100}%">${labels[i]}<br>${n}日</span>`).join("")}</div></div>`).join("")}<b>全体の最短日数：${p.total}日</b></div><p role="status">${mode==="top-short"?"Bを短くしても、C→Dの10日を待つため全体は短くなりません。":mode==="bottom-short"?"Dを短くするとC→Dは7日。今度はA→Bの8日がクリティカルパスになります。":mode==="top-long"?"Bが延びるとA→Bは12日。長いほうの経路が切り替わり、全体も12日になります。":"A→Bは8日、C→Dは10日。順番に行う分は足し、同時に進める経路は長いほうを待ちます。"}</p><p class="small muted">人員などの資源制約や余分な待機はない簡略例です。図の横幅は12日を共通の尺度にしています。</p>`;
   box.querySelector("[data-path]").onchange=e=>{mode=e.target.value;draw();box.querySelector("[data-path]").focus({preventScroll:true});};
  }
 }
 draw();
}


function recoveryPlan(kind,day){
 const snapshots=[["A","B"],["A","B改"],["A","B改","C"],["B改","C"]];
 const required=kind==="diff"?[0,day]:Array.from({length:day+1},(_,i)=>i);
 return {snapshots,required};
}
function availability(kind,a,b){return kind==="series"?a*b:1-(1-a)*(1-b);}
function wireProtection(box){
 const type=box.dataset.motion;
 let mode=type==="crypto"?"encrypt":type==="backup"?"diff":"series",step=0,day=2,failedA=false,failedB=false;
 function draw(){
  if(type==="crypto"){
   const encrypt=mode==="encrypt",texts=encrypt?[
    "受信者だけが内容を読めるように、公開鍵暗号で送る簡略例です。公開鍵が正しい相手のものかは、事前に確認されているとします。",
    "送信者が、受信者の公開鍵で文書を暗号化します。受信者の公開鍵を他の人が知っていても構いません。",
    "暗号文を送ります。ここで使うのは受信者の鍵で、送信者自身の公開鍵ではありません。",
    "受信者が、自分だけが持つ秘密鍵で復号します。公開鍵は復号用の秘密鍵の代わりになりません。"
   ]:[
    "送信者が署名し、受信者が署名者と改変の有無を確かめる簡略例です。署名だけでは文書を隠しません。",
    "送信者が、自分の秘密鍵で署名を作ります。秘密鍵は受信者に渡しません。",
    "文書と署名を送ります。文書が秘密になるわけではなく、秘密にしたければ別に暗号化を組み合わせます。",
    "受信者が、送信者の公開鍵で署名を検証します。その公開鍵が誰のものかを信頼できることも必要です。署名は文書の内容が事実であることまで保証しません。"
   ];
   box.innerHTML=`<label class="motion-target">目的<select data-protect-mode><option value="encrypt" ${encrypt?"selected":""}>内容を秘密にする（暗号化）</option><option value="sign" ${!encrypt?"selected":""}>送信者と改変を確認（署名）</option></select></label><div class="motion-diagram"><span class="motion-cell">送信者</span><p><b>使う鍵：</b>${step===0?"まだ使わない":encrypt?"受信者の公開鍵":"送信者の秘密鍵"}</p><div class="motion-cells"><span>↓ 送るもの</span><span class="motion-cell active">${encrypt?(step===0?"元の文書":step===3?"復号後の文書":"暗号文"):(step===0?"元の文書":"文書 ＋ 署名")}</span></div><span class="motion-cell">受信者</span><p><b>受け取った後の鍵：</b>${step<3?"次へ進めて確認":encrypt?"受信者の秘密鍵で復号":"送信者の公開鍵で検証"}</p></div><p role="status">手順 ${step} / 3：${texts[step]}</p>${controls(step,3)}`;
   wireSteps(3);
  }else if(type==="backup"){
   const p=recoveryPlan(mode,day),max=p.required.length,snapshot=step===0?[]:p.snapshots[p.required[step-1]],names=["日","月","火","水"];
   box.innerHTML=`<label class="motion-target">保存方式<select data-protect-mode><option value="diff" ${mode==="diff"?"selected":""}>差分：最後のフル以降</option><option value="increment" ${mode==="increment"?"selected":""}>増分：前回の保存以降</option></select></label><label class="motion-target">復元する時点<select data-backup-day><option value="2" ${day===2?"selected":""}>火曜の保存後</option><option value="3" ${day===3?"selected":""}>水曜の保存後</option></select></label><p>日曜のフルはA・B。月曜にBを変更、火曜にCを追加、水曜にAを削除します。</p><div class="motion-diagram"><div class="motion-cells">${names.map((name,index)=>`<span class="motion-cell ${p.required.includes(index)?"active":""}">${name}曜<br>${index===0?"フル":mode==="diff"?"差分":"増分"}${step>0&&p.required.indexOf(index)>=0&&p.required.indexOf(index)<step?"<br>適用済み":""}</span>`).join("")}</div><p><b>使う保存データ：</b>${p.required.map(i=>names[i]+"曜").join(" → ")}</p><p><b>いま復元された内容：</b>${snapshot.length?snapshot.join("・"):"まだなし"}</p></div><p role="status">手順 ${step} / ${max}：${step===0?"まず日曜のフルから戻します。太枠が復元に必要な保存データです。":step===1?"フルを読み込み、AとBが戻りました。":step===max?"目標の時点まで復元できました。"+(mode==="diff"?"差分はフルと目標日の差分で戻します。":"増分は途中の増分も順番に必要です。"):"次の増分を適用しました。次へ進めて目標時点まで反映します。"}</p>${controls(step,max)}<p class="small muted">復元に必要な組合せを学ぶ簡略例です。削除も変更として記録される方式を想定し、データは指定時点の保存分まで戻します。</p>`;
   wireSteps(max);
   box.querySelector("[data-backup-day]").onchange=e=>{day=Number(e.target.value);step=0;draw();box.querySelector("[data-backup-day]").focus({preventScroll:true});};
  }else{
   const series=mode==="series",running=series?!failedA&&!failedB:!failedA||!failedB,prob=availability(mode,.9,.8);
   box.innerHTML=`<label class="motion-target">構成<select data-protect-mode><option value="series" ${series?"selected":""}>直列：両方必要</option><option value="parallel" ${!series?"selected":""}>並列：片方で動く</option></select></label><p>装置Aの稼働率90%、Bは80%。故障は独立で、並列時は片方だけでサービスを継続できる前提です。</p><div class="motion-diagram"><p><b>${series?"処理にはAもBも必要":"処理はAかBのどちらかでよい"}</b></p><div class="motion-cells"><button type="button" class="btn" data-failure="a" aria-pressed="${failedA}">A：${failedA?"故障":"稼働"}</button><span>${series?"→":"または"}</span><button type="button" class="btn" data-failure="b" aria-pressed="${failedB}">B：${failedB?"故障":"稼働"}</button></div><p role="status"><b>この状態のサービス：${running?"動く":"止まる"}</b></p><p><b>構成全体の稼働率：</b>${Math.round(prob*100)}%</p><p>${series?"0.9 × 0.8 ＝ 0.72":"1 − (1−0.9) × (1−0.8) ＝ 0.98"}</p></div><p>装置ボタンで「その装置が故障した場合」を試せます。下の稼働率は、その場の動作状態ではなく、設定した確率から計算した値です。</p><p class="small muted">共通電源などによる同時故障、切替失敗、修理の事情は省略しています。</p>`;
   box.querySelectorAll("[data-failure]").forEach(btn=>btn.onclick=()=>{const key=btn.dataset.failure;if(key==="a")failedA=!failedA;else failedB=!failedB;draw();box.querySelector('[data-failure="'+key+'"]').focus({preventScroll:true});});
  }
  box.querySelector("[data-protect-mode]").onchange=e=>{mode=e.target.value;step=0;draw();box.querySelector("[data-protect-mode]").focus({preventScroll:true});};
 }
 function controls(n,max){return `<div class="motion-controls"><button type="button" class="btn" data-protect-step="-1" ${n===0?"disabled":""}>前へ</button><button type="button" class="btn primary" data-protect-step="1" ${n===max?"disabled":""}>次へ</button><button type="button" class="btn" data-protect-reset>最初から</button></div>`;}
 function wireSteps(max){
  box.querySelectorAll("[data-protect-step]").forEach(btn=>btn.onclick=()=>{step+=Number(btn.dataset.protectStep);draw();box.querySelector(step===max?'[data-protect-step="-1"]':'[data-protect-step="1"]').focus({preventScroll:true});});
  box.querySelector("[data-protect-reset]").onclick=()=>{step=0;draw();box.querySelector('[data-protect-step="1"]').focus({preventScroll:true});};
 }
 draw();
}

function wireMotions(root){
  root.querySelectorAll("[data-motion]").forEach(box=>{
    const type=box.dataset.motion;
    if(["crypto","backup","availability"].includes(type)){wireProtection(box);return;}
    if(["logic","subnet","path"].includes(type)){wireInteractive(box);return;}
    let i=0,target=25,local=false,deadlock=false;
    let states=type==="containers"?containerSteps():type==="binary"?binarySteps(target):type==="sort"?sortSteps():type==="network"?networkSteps(local):type==="lock"?lockSteps(deadlock):cacheSteps();
    const cells=(values,extra=()=> "")=>values.map((value,index)=>`<span class="motion-cell ${extra(index)}">${value===null?"空":esc(String(value))}</span>`).join("");
    function draw(){
      const state=states[i];
      let diagram="";
      if(type==="containers"){
        diagram=`<div class="motion-diagram" role="img" aria-label="スタックは ${state.stack.join("、")||"空"}、キューは ${state.queue.join("、")||"空"}"><b>スタック：後入れ先出し</b><div class="motion-cells">${cells(state.stack)}<span class="motion-side">右端から出す →</span></div><p>取り出したもの：${state.outStack}</p><b>キュー：先入れ先出し</b><div class="motion-cells"><span class="motion-side">← 左端から出す</span>${cells(state.queue)}</div><p>取り出したもの：${state.outQueue}</p></div>`;
      }else if(type==="binary"){
        diagram=`<label class="motion-target">探す値<select data-target><option value="25" ${target===25?"selected":""}>25（ある値）</option><option value="26" ${target===26?"selected":""}>26（ない値）</option></select></label><div class="motion-diagram"><div class="motion-cells" role="img" aria-label="候補範囲は ${state.values.filter((v,j)=>j>=state.low&&j<=state.high).join("、")||"なし"}${state.mid===null?"":"。今回調べる中央は"+state.values[state.mid]}">${cells(state.values,j=>j<state.low||j>state.high?"excluded":j===state.mid?(state.found?"found":"active"):"")}</div><p class="small">薄い枠：候補から外れた値 ／ 太枠：今回の中央</p></div>`;

      }else if(type==="sort"){
        diagram=`<div class="motion-diagram"><div class="motion-cells" role="img" aria-label="配列 ${state.values.join("、")}">${cells(state.values,j=>state.pair.includes(j)?"active":j>=state.fixed?"found":"")}</div><p class="small">太枠：比較中 ／ 二重枠：位置が確定</p></div>`;
      }else if(type==="network"){
        diagram=`<label class="motion-target">宛先<select data-network><option value="remote" ${!local?"selected":""}>別ネットワーク</option><option value="local" ${local?"selected":""}>同じLAN</option></select></label><div class="motion-diagram"><div class="motion-cells"><span class="motion-cell">送信PC<br>192.0.2.10/24</span><span>→</span>${local?'<span class="motion-cell">同じLANの相手</span>':'<span class="motion-cell">ルータ</span><span>→</span><span class="motion-cell">別ネットワークのサーバ</span>'}</div><p><b>宛先IP：</b>${state.ip}</p><p><b>このLANの宛先MAC：</b>${state.mac}</p><p><b>いまの段階：</b>${state.stage}</p></div><p class="small muted">IPv4とEthernetの簡略例です。キャッシュは省略しています。DNSの問い合わせ自体にも経路・アドレス解決が必要になる場合があり、実通信の全パケット順を表してはいません。</p>`;
      }else if(type==="lock"){
        diagram=`<label class="motion-target">場面<select data-lock><option value="normal" ${!deadlock?"selected":""}>残り1席の予約</option><option value="deadlock" ${deadlock?"selected":""}>デッドロック</option></select></label><div class="motion-diagram"><div class="motion-cell">${state.resource}</div><p><b>処理A：</b>${state.a}</p><p><b>処理B：</b>${state.b}</p></div><p class="small muted">競合するロックを待たせる例です。通常の参照もすべて止まるという意味ではありません。</p>`;
      }else{
        diagram=`<div class="motion-diagram"><p><b>CPUの要求：${state.request===null?"まだなし":"ブロック"+state.request}</b> ${state.hit===null?"":state.hit?"→ キャッシュで見つかる":"→ 主記憶から読む"}</p><div class="motion-cells" role="img" aria-label="キャッシュ枠0は${state.slots[0]===null?"空":state.slots[0]}、枠1は${state.slots[1]===null?"空":state.slots[1]}">${state.slots.map((v,j)=>`<span class="motion-cell ${j===state.slot?"active":""}">枠${j}<br>${v===null?"空":"ブロック"+v}</span>`).join("")}</div><p><b>主記憶</b>：ブロック0・1・2を保管</p><p>ヒット ${state.hits}回 ／ ミス ${state.misses}回</p></div><p class="small muted">実際には1枠にデータのまとまりを保存します。この図は2枠の直接マッピング方式に限った例です。</p>`;
      }
      box.innerHTML=`${diagram}<p class="motion-explain" role="status">手順 ${i} / ${states.length-1}：${esc(state.text)}</p><div class="motion-controls"><button type="button" class="btn" data-step="-1" ${i===0?"disabled":""}>前へ</button><button type="button" class="btn primary" data-step="1" ${i===states.length-1?"disabled":""}>次へ</button><button type="button" class="btn" data-reset>最初から</button></div>`;
      box.querySelectorAll("[data-step]").forEach(b=>b.onclick=()=>{i=Math.max(0,Math.min(states.length-1,i+Number(b.dataset.step)));draw();box.querySelector(i===states.length-1?'[data-step="-1"]':'[data-step="1"]').focus({preventScroll:true});});
      box.querySelector("[data-reset]").onclick=()=>{i=0;draw();box.querySelector('[data-step="1"]').focus({preventScroll:true});};
      const select=box.querySelector("[data-target]");
      const network=box.querySelector("[data-network]");
      if(network)network.onchange=()=>{local=network.value==="local";i=0;states=networkSteps(local);draw();box.querySelector("[data-network]").focus({preventScroll:true});};
      const lock=box.querySelector("[data-lock]");
      if(lock)lock.onchange=()=>{deadlock=lock.value==="deadlock";i=0;states=lockSteps(deadlock);draw();box.querySelector("[data-lock]").focus({preventScroll:true});};
      if(select)select.onchange=()=>{target=Number(select.value);i=0;states=binarySteps(target);draw();box.querySelector("[data-target]").focus({preventScroll:true});};
    }
    draw();
  });
}
