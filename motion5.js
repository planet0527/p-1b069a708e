/* アドレス変換と音のデジタル化を操作して確かめる。 */
(() => {
if(!window.M2) return;
const {stepper,slider}=window.M2;
const X=window.M2EXT=window.M2EXT||{};
const PAGE_TABLE=[2,0,null,5],PAGE_SIZE=4;
function addressSteps(value){
 const address=Number(value),page=Math.floor(address/PAGE_SIZE),offset=address%PAGE_SIZE,frame=PAGE_TABLE[page];
 const base={address,page,offset,frame};
 return [
 {...base,stage:0,text:"CPUが仮想アドレス"+address+"を指定しました。ページサイズは4バイト。この例ではページ表を直接調べ、TLBは省略します。"},
 {...base,stage:1,text:address+" ÷ 4 の商は"+page+"、余りは"+offset+"。商がページ番号、余りがページ内の位置（オフセット）です。"},
 {...base,stage:2,text:frame===null?"ページ"+page+"は実メモリ上にありません。ページフォールトが起き、OSが必要なページを読み込む処理を行います。":"ページ表でページ"+page+"を調べると、実メモリのフレーム"+frame+"に対応しています。"},
 {...base,stage:3,text:frame===null?"読み込み後にはページ表が更新され、命令が再実行されます。この図は読み込み前までを示すため、物理アドレスはまだ決められません。":"物理アドレス ＝ フレーム番号 × ページサイズ ＋ オフセット ＝ "+frame+" × 4 ＋ "+offset+" ＝ "+(frame*4+offset)+"。ページ内の位置は変わりません。"}
 ];
}
function sampleValues(rate,bits){
 const levels=2**bits;
 return Array.from({length:rate},(_,i)=>{
  const t=i/rate,value=(Math.sin(4*Math.PI*t)+1)/2,code=Math.round(value*(levels-1)+1e-12);
  return {t,value,code,quantized:code/(levels-1)};
 });
}
window.M5={addressSteps,sampleValues};
X.virtualAddress=box=>stepper(box,{select:{label:"CPUが指定する仮想アドレス",value:"10",options:[["0","0：ページ0"],["5","5：ページ1"],["10","10：実メモリにないページ2"],["15","15：ページ3"]]},build:addressSteps,render:st=>{
 const physical=st.frame===null?null:st.frame*4+st.offset;
 return `<div class="motion-cells"><span class="motion-cell active">仮想アドレス<br><b>${st.address}</b></span>${st.stage>=1?`<span class="motion-cell">ページ番号<br><b>${st.page}</b></span><span class="motion-cell">オフセット<br><b>${st.offset}</b></span>`:""}</div><div class="m2-tbl"><table><caption>ページ表（ページサイズ4バイト）</caption><thead><tr><th scope="col">ページ番号</th><th scope="col">フレーム番号</th></tr></thead><tbody>${PAGE_TABLE.map((f,p)=>`<tr class="${st.stage>=2&&p===st.page?"hl":""}"><th scope="row">${p}</th><td>${f===null?"実メモリにない":f}</td></tr>`).join("")}</tbody></table></div>${st.stage===3?`<p role="status"><b>${physical===null?"ページフォールト：読み込み待ち":"物理アドレス："+physical}</b></p>`:""}`;
},note:"仮想ページと物理フレームは同じ大きさです。仮想アドレスと物理アドレスの数値が同じになる場合もあります。ページフォールトは、必ずしもアプリの異常終了ではありません。"});
X.digitalSound=box=>slider(box,{sliders:[
 {key:"rate",label:"標本化周波数（1秒あたりの標本数）",min:4,max:24,step:1,value:12,show:n=>n+" Hz"},
 {key:"bits",label:"量子化ビット数（1標本あたり）",min:2,max:5,step:1,value:3,show:n=>n+" bit"}
],render:v=>{
 const values=sampleValues(v.rate,v.bits),levels=2**v.bits;
 const x=t=>26+t*280,y=a=>132-a*106;
 const path=Array.from({length:201},(_,i)=>(i?"L":"M")+x(i/200).toFixed(2)+","+y((Math.sin(4*Math.PI*i/200)+1)/2).toFixed(2)).join(" ");
 const svg=`<svg class="m5-wave" viewBox="0 0 332 164" role="img" aria-label="2ヘルツの元の波形と、1秒あたり${v.rate}個、${v.bits}ビットで数値化した標本"><line x1="26" y1="138" x2="306" y2="138" stroke="var(--muted)"/><text x="26" y="157" font-size="12" fill="var(--ink)">0秒</text><text x="280" y="157" font-size="12" fill="var(--ink)">1秒</text><path d="${path}" fill="none" stroke="var(--muted)" stroke-width="2"/>${values.map(s=>`<line x1="${x(s.t)}" y1="138" x2="${x(s.t)}" y2="${y(s.quantized)}" stroke="var(--accent)" stroke-width="1"/><rect x="${x(s.t)-3}" y="${y(s.quantized)-3}" width="6" height="6" fill="var(--accent)"/>`).join("")}</svg>`;
 return svg+`<p class="small">灰色の線：元の音（2 Hzの正弦波） ／ 四角：数値化した標本</p><p><b>標本化：</b>1秒を${v.rate}回に分けて測定。標本間隔は約${(1000/v.rate).toFixed(1)}ミリ秒。</p><p><b>量子化：</b>${v.bits}ビット → 2<sup>${v.bits}</sup> ＝ ${levels}段階。大きさを近い段階へ丸めます。</p><p class="small">数値にした最初の8標本：${values.slice(0,8).map(s=>s.code).join("、")}（範囲0〜${levels-1}）</p><p><b>1秒・モノラルのデータ量：</b>${v.rate} × ${v.bits} ＝ ${v.rate*v.bits} bit（圧縮・ヘッダなし）</p>${v.rate===4?'<p class="m5-notice"><b>波があるのに標本が一直線！</b>この位相では、ちょうど中間の高さばかり測っています。最高周波数の2倍を超える標本化周波数が必要です。</p>':""}<p class="small">試す順：ビット数を固定して標本数を減らす → 標本数を固定してビット数を減らす。それぞれ時間の細かさと、大きさの細かさが変わります。</p>`;
},note:"説明用に振幅を0〜1へ移し、両端を含む等間隔の段階へ丸めています。実際の音声の符号化方式によって数値の対応は異なります。この図から音は鳴りません。"});
window.motion5HTML=()=>`<p>見えない変換を、途中の数値と図で確かめます。</p><details class="usage"><summary>仮想記憶：ページ番号・オフセット・ページフォールト</summary><div class="usage-body" data-motion2="virtualAddress"></div></details><details class="usage"><summary>音のデジタル化：標本化と量子化を別々に変える</summary><div class="usage-body" data-motion2="digitalSound"></div></details>`;
Object.assign(window.MOTION_MAP||{},{"仮想記憶":"virtualAddress","標本化・量子化・符号化":"digitalSound"});
})();

