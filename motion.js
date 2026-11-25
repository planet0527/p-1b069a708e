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
function wireMotions(root){
  root.querySelectorAll("[data-motion]").forEach(box=>{
    const type=box.dataset.motion;
    let i=0,target=25,states=type==="containers"?containerSteps():type==="binary"?binarySteps(target):cacheSteps();
    const cells=(values,extra=()=> "")=>values.map((value,index)=>`<span class="motion-cell ${extra(index)}">${value===null?"空":esc(String(value))}</span>`).join("");
    function draw(){
      const state=states[i];
      let diagram="";
      if(type==="containers"){
        diagram=`<div class="motion-diagram" role="img" aria-label="スタックは ${state.stack.join("、")||"空"}、キューは ${state.queue.join("、")||"空"}"><b>スタック：後入れ先出し</b><div class="motion-cells">${cells(state.stack)}<span class="motion-side">右端から出す →</span></div><p>取り出したもの：${state.outStack}</p><b>キュー：先入れ先出し</b><div class="motion-cells"><span class="motion-side">← 左端から出す</span>${cells(state.queue)}</div><p>取り出したもの：${state.outQueue}</p></div>`;
      }else if(type==="binary"){
        diagram=`<label class="motion-target">探す値<select data-target><option value="25" ${target===25?"selected":""}>25（ある値）</option><option value="26" ${target===26?"selected":""}>26（ない値）</option></select></label><div class="motion-diagram"><div class="motion-cells" role="img" aria-label="候補範囲は ${state.values.filter((v,j)=>j>=state.low&&j<=state.high).join("、")||"なし"}${state.mid===null?"":"。今回調べる中央は"+state.values[state.mid]}">${cells(state.values,j=>j<state.low||j>state.high?"excluded":j===state.mid?(state.found?"found":"active"):"")}</div><p class="small">薄い枠：候補から外れた値 ／ 太枠：今回の中央</p></div>`;
      }else{
        diagram=`<div class="motion-diagram"><p><b>CPUの要求：${state.request===null?"まだなし":"ブロック"+state.request}</b> ${state.hit===null?"":state.hit?"→ キャッシュで見つかる":"→ 主記憶から読む"}</p><div class="motion-cells" role="img" aria-label="キャッシュ枠0は${state.slots[0]===null?"空":state.slots[0]}、枠1は${state.slots[1]===null?"空":state.slots[1]}">${state.slots.map((v,j)=>`<span class="motion-cell ${j===state.slot?"active":""}">枠${j}<br>${v===null?"空":"ブロック"+v}</span>`).join("")}</div><p><b>主記憶</b>：ブロック0・1・2を保管</p><p>ヒット ${state.hits}回 ／ ミス ${state.misses}回</p></div><p class="small muted">実際には1枠にデータのまとまりを保存します。この図は2枠の直接マッピング方式に限った例です。</p>`;
      }
      box.innerHTML=`${diagram}<p class="motion-explain" role="status">手順 ${i} / ${states.length-1}：${esc(state.text)}</p><div class="motion-controls"><button type="button" class="btn" data-step="-1" ${i===0?"disabled":""}>前へ</button><button type="button" class="btn primary" data-step="1" ${i===states.length-1?"disabled":""}>次へ</button><button type="button" class="btn" data-reset>最初から</button></div>`;
      box.querySelectorAll("[data-step]").forEach(b=>b.onclick=()=>{i=Math.max(0,Math.min(states.length-1,i+Number(b.dataset.step)));draw();box.querySelector(i===states.length-1?'[data-step="-1"]':'[data-step="1"]').focus({preventScroll:true});});
      box.querySelector("[data-reset]").onclick=()=>{i=0;draw();box.querySelector('[data-step="1"]').focus({preventScroll:true});};
      const select=box.querySelector("[data-target]");
      if(select)select.onchange=()=>{target=Number(select.value);i=0;states=binarySteps(target);draw();box.querySelector("[data-target]").focus({preventScroll:true});};
    }
    draw();
  });
}
