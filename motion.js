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

function wireMotions(root){
  root.querySelectorAll("[data-motion]").forEach(box=>{
    const type=box.dataset.motion;
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
