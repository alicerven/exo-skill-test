/* Tanıtım videosu yönetmeni.
   index.html?kayit=1 ile açılınca yüklenir. Demoları sırayla kendisi oynatır,
   1280×720'lik bir kompozisyon tuvaline çizer, Türkçe sesleri WebAudio ile karıştırır
   ve MediaRecorder ile kaydedip sunucuya (/upload) yükler. */
(()=>{
"use strict";
const W=1280,H=720;
const q=s=>document.querySelector(s);

/* ---------- arayüz ---------- */
const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
const ov=document.createElement('div');
ov.style.cssText='position:fixed;inset:0;z-index:999;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;font:14px system-ui;color:#ccc';
cv.style.cssText='width:min(94vw,1280px);height:auto;background:#000';
const bar=document.createElement('div');bar.style.cssText='display:flex;gap:10px;align-items:center';
const mk=(id,label,bg)=>{const b=document.createElement('button');b.id=id;b.textContent=label;b.style.cssText=`font-size:15px;padding:8px 16px;background:${bg};color:#fff;border:0;border-radius:8px;cursor:pointer`;return b;};
const btnRec=mk('kayit-basla','● Kaydı başlat','#d1242f'),btnPrev=mk('kayit-onizle','▶ Önizle (kayıtsız)','#30363d');
const st=document.createElement('span');st.id='kayit-durum';st.textContent='hazır';
bar.append(btnRec,btnPrev,st);ov.append(cv,bar);document.body.append(ov);

/* ---------- ses: kliplerin WebAudio ile kayda karıştırılması ---------- */
let ac,dest;const buffers={};
const CLIPS=['g_i1','g_i2','g_n0_1','g_n0_2','g_n0_3','g_n0_4','g_n0_5','g_parca','g_hepsi','g_vurus','g_n1_1','g_n1_2','g_n1_3','ag_red','ag_bitti'];
async function loadAudio(){
  ac=new AudioContext();await ac.resume();dest=ac.createMediaStreamDestination();
  // kayıt ilk saniyeden başlasın diye sürekli, duyulmayacak kadar kısık bir sinyal (tamamen sıfır sinyal bazı kaydedicilerde boşluk sayılıyor)
  const osc=ac.createOscillator(),gn=ac.createGain();osc.frequency.value=40;gn.gain.value=1e-4;osc.connect(gn).connect(dest);osc.start();
  await Promise.all(CLIPS.map(async id=>{const r=await fetch('ses/'+id+'.mp3');buffers[id]=await ac.decodeAudioData(await r.arrayBuffer());}));
}
let cur=null,queue=[];
const BUSY_SKIP=new Set(['g_parca','g_hepsi','g_vurus']),SKIP=new Set(['ag_basla']);
function playClip(id){const b=buffers[id];if(!b)return;const s=ac.createBufferSource();s.buffer=b;s.connect(dest);s.connect(ac.destination);
  s.onended=()=>{if(cur===s){cur=null;const n=queue.shift();if(n)playClip(n);}};cur=s;s.start();}
function stopClip(){queue=[];if(cur){const c=cur;cur=null;try{c.stop();}catch(e){}}}
function patchSES(){
  SES.play=(id,opt={})=>{if(!id||SKIP.has(id)||!ac)return;if(cur&&BUSY_SKIP.has(id))return;if(opt.queue&&cur){queue.push(id);return;}stopClip();playClip(id);};
  SES.stop=stopClip;
}

/* ---------- çizim yardımcıları ---------- */
const SANS='Inter,"Segoe UI",system-ui,sans-serif',MONO='ui-monospace,"DejaVu Sans Mono",Menlo,Consolas,monospace';
function font(size,weight='',mono=false){g.font=`${weight} ${size}px ${mono?MONO:SANS}`;}
function txt(s,x,y,size,color,weight='',align='left',mono=false){font(size,weight,mono);g.fillStyle=color;g.textAlign=align;g.textBaseline='alphabetic';g.fillText(s,x,y);}
function wrap(s,x,y,maxW,lh,size,color,weight='',mono=false){font(size,weight,mono);g.fillStyle=color;g.textAlign='left';let line='';for(const w of s.split(' ')){const t=line?line+' '+w:w;if(g.measureText(t).width>maxW&&line){g.fillText(line,x,y);y+=lh;line=w;}else line=t;}if(line)g.fillText(line,x,y);return y+lh;}
function rr(x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r);}
function panel(x,y,w,h,label){rr(x,y,w,h,12);g.fillStyle='#111821';g.fill();g.strokeStyle='#263040';g.lineWidth=1;g.stroke();if(label)txt(label,x+18,y+28,12,'#6e7d90','700');}
function fit(src,x,y,w,h){const s=Math.min(w/src.width,h/src.height),dw=src.width*s,dh=src.height*s,dx=x+(w-dw)/2,dy=y+(h-dh)/2;
  g.save();rr(dx-1,dy-1,dw+2,dh+2,10);g.fillStyle='#263040';g.fill();rr(dx,dy,dw,dh,9);g.clip();g.drawImage(src,dx,dy,dw,dh);g.restore();return{dx,dy,dw,dh};}
const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
const en=s=>s.replace(/\./g,',');
const clickTab=id=>[...document.querySelectorAll('#tabs button')].find(b=>b.dataset.id===id).click();
function once(seg,key,cond,fn){if(cond&&!seg.fired.has(key)){seg.fired.add(key);fn();}}

/* ---------- çerçeve ---------- */
function chrome(seg,T,total){
  const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,'#0a0e15');gr.addColorStop(1,'#121a26');g.fillStyle=gr;g.fillRect(0,0,W,H);
  if(seg.bare)return;
  rr(40,22,56,26,13);g.fillStyle='#58a6ff';g.fill();txt('exo',68,41,15,'#04111f','700','center');
  txt('free stealth model on OpenCode',108,41,15,'#8b96a5');
  if(seg.n)txt(`${seg.n} / 7`,W-40,41,15,'#8b96a5','600','right');
  txt(seg.title,40,92,34,'#f0f4f8','700');
  txt(seg.sub,40,122,18,'#9aa7b6');
  txt('1 HTML file · 0 libraries · written from scratch & self-tested by the model',40,H-18,14,'#56647a');
  if(seg.voice)txt('🔊 Turkish voice: AI-generated locally (EMA Lightning)',W-40,H-18,14,'#56647a','','right');
}
function progress(T,total){g.fillStyle='#1d2633';g.fillRect(0,H-4,W,4);g.fillStyle='#58a6ff';g.fillRect(0,H-4,W*T/total,4);}

/* ---------- sahneler ---------- */
// 0. açılış
function drawTitle(t){
  const a1=ease(t/0.6),a2=ease((t-0.5)/0.7),a3=ease((t-1.3)/0.7),a4=ease((t-2.1)/0.6);
  g.globalAlpha=a1;txt('OpenCode just added a free stealth model…',W/2,250,26,'#8b96a5','500','center');
  g.globalAlpha=a2;txt('I gave “exo” one session.',W/2,250+80-20*(1-a2),64,'#f0f4f8','800','center');
  g.globalAlpha=a3;txt('7 working demos  ·  1 HTML file  ·  0 libraries',W/2,420,30,'#58a6ff','700','center');
  g.globalAlpha=a4;txt('language · physics · ray tracing · math · game AI · agents · ML',W/2,470,20,'#6e7d90','500','center');
  g.globalAlpha=1;
}
// 1. dil
const KW=/^(fn|let|if|else|while|return|true|false|nil)$/;
function codeLine(s,x,y){
  font(17,'',true);const re=/(\/\/.*)|("[^"]*"?)|([A-Za-z_\u00c0-\u017f][\w\u00c0-\u017f]*)|(\d+(?:\.\d+)?)|(\s+)|(.)/g;let m;
  while((m=re.exec(s))){const p=m[0];let c='#e6edf3';
    if(m[1])c='#6a7a8c';else if(m[2])c='#a5d6ff';else if(m[3])c=KW.test(p)?'#ff7b72':s[re.lastIndex]==='('?'#d2a8ff':'#e6edf3';else if(m[4])c='#79c0ff';
    g.fillStyle=c;g.textAlign='left';g.fillText(p,x,y);x+=g.measureText(p).width;}
}
function drawLang(t){
  const code=q('#lang-src').value.split('\n'),out=q('#lang-out').textContent.split('\n');
  panel(40,145,640,535,'SOURCE  ·  Minik language');
  let left=Math.floor(t*300);
  for(let i=0;i<code.length&&left>0;i++){codeLine(code[i].slice(0,left),62,200+i*26);left-=code[i].length+1;}
  panel(700,145,540,350,'OUTPUT  ·  run on its own VM');
  const n=Math.max(0,Math.min(out.length,Math.floor((t-2.4)*9)));
  for(let i=0;i<n;i++)txt(out[i],722,198+i*18.5,15,'#7ee787','',undefined,true);
  panel(700,510,540,170,'PIPELINE');
  const st=['source','tokens','AST','bytecode','VM'];const k=Math.min(st.length,Math.floor(t*1.6));
  st.forEach((s,i)=>{const x=722+i*104;rr(x,555,88,40,8);g.fillStyle=i<k?'#1f6feb':'#1d2633';g.fill();txt(s,x+44,581,15,i<k?'#fff':'#6e7d90','600','center');if(i<4)txt('→',x+96,581,16,'#6e7d90','','center');});
  const s=q('#lang-stat').textContent.match(/([\d.]+) token · ([\d.]+) komut · ([\d.]+) VM/);
  if(s&&t>2.4)txt(`${en(s[1])} tokens · ${en(s[2])} instructions · ${en(s[3])} VM steps`,722,640,15,'#9aa7b6','',undefined,true);
}
// 2. fizik
function drawPhys(t,seg){
  once(seg,'r1',t>0.2,()=>q('#phys-rain').click());once(seg,'r2',t>2.4,()=>q('#phys-rain').click());once(seg,'r3',t>4.6,()=>q('#phys-rain').click());
  fit(q('#phys-cv'),40,145,1200,505);
  const m=q('#phys-stat').textContent.match(/^(\d+) cisim.*?(\d+) fps/);
  if(m)txt(`${m[1]} bodies · 8 sub-steps per frame · ${m[2]} fps`,W/2,676,15,'#9aa7b6','','center',true);
}
// 3. ray tracer
function drawRay(t){
  fit(q('#rt-cv'),40,145,1200,505);
  const s=q('#rt-stat').textContent;const m=s.match(/%(\d+)/),d=s.match(/([\d.]+) birincil ışın, ([\d.]+) sn/);
  txt(m?`rendering… ${m[1]}%`:d?`✓ ${en(d[1])} primary rays · ${d[2]} s · pure JavaScript, no GPU`:'',W/2,676,15,'#9aa7b6','','center',true);
}
// 4. sarkaç
const PL=['Textbook formula (small-angle)','Series approximation','Exact (elliptic integral + AGM)','Independent RK4 simulation','Exact vs RK4 difference','Textbook formula error'];
function drawPend(t){
  fit(q('#pend-cv'),40,145,780,535);
  panel(840,145,400,535,'θ₀ = 150°   ·   L = 1 m');
  const rows=[...q('#pend-calc').querySelectorAll('tr')];
  rows.forEach((r,i)=>{const v=r.querySelector('.n').textContent.replace('✓ doğrulandı','✓ verified').replace('%','')+(i===5?' %':'');
    const y=200+i*78,a=ease((t-0.4-i*0.35)/0.4);g.globalAlpha=a;
    txt(PL[i],862,y,15,'#8b96a5','500');
    txt(v,862,y+30,i===2?24:21,i===4?'#3fb950':i===5?'#d29922':i===2?'#f0f4f8':'#c9d1d9',i===2||i===4?'700':'500',undefined,true);
  });g.globalAlpha=1;
}
// 5. oyun
const auto={on:false,targets:[]};
function autopilot(){
  const O=window.__oyun;O.keys.clear();if(!auto.on||O.dialog)return;
  const tgt=auto.targets[0];if(!tgt)return;const p=O.player,[px,py]=O.tileOf(p);
  // eşikler: varış < 6 px, yönlendirme ölü bölgesi 2 px (varış eşiği ölü bölgenin köşegeninden büyük olmalı)
  const steer=c=>{const dx=c.x-p.x,dy=c.y-p.y;if(dx>2)O.keys.add('d');else if(dx<-2)O.keys.add('a');if(dy>2)O.keys.add('s');else if(dy<-2)O.keys.add('w');};
  if(px===tgt[0]&&py===tgt[1]){const c=O.C(...tgt);if(Math.hypot(c.x-p.x,c.y-p.y)<6){auto.targets.shift();return;}steer(c);return;}
  const path=O.bfs(px,py,tgt[0],tgt[1]);if(path.length)steer(O.C(...path[0]));
}
const SEN={'DEVRİYE':['PATROL','#b07cff'],'KOVALA':['CHASE','#ff5c5c'],'ARA':['SEARCH','#ffa64d'],'DÖN':['RETURN','#7aa2c7']};
const QUEST=['Talk to Nuri, the old keeper','Collect the 3 lens shards','Return to Nuri','Light the lighthouse','Town saved'];
function drawGame(t,seg){
  const O=window.__oyun;
  once(seg,'i1',t>0.6,()=>O.interact());
  once(seg,'i2',t>1.2,()=>{O.interact();auto.on=true;auto.targets=[[2,2]];});
  once(seg,'talk',t>1.3&&auto.targets.length===0&&!O.dialog&&O.stage===0,()=>{O.interact();seg.tTalk=t;});
  once(seg,'skip',seg.tTalk&&t>seg.tTalk+3.5,()=>{for(let i=0;i<5;i++)O.interact();SES.play('g_n0_3');auto.targets=[[10,2],[17,9],[2,10]];});
  autopilot();
  fit(q('#game-cv'),40,145,860,535);
  panel(920,145,320,535,'ENEMY AI  ·  live state');
  O.enemies.forEach((e,i)=>{const [s,c]=SEN[e.state];txt(`Shadow-${e.id}`,940,200+i*34,17,'#c9d1d9','600');rr(1080,183+i*34,130,24,12);g.fillStyle=c+'33';g.fill();txt(s,1145,200+i*34,14,c,'700','center');});
  txt('FSM: patrol → chase → search → return',940,318,13,'#6e7d90');
  txt('+ line of sight + BFS pathfinding',940,338,13,'#6e7d90');
  txt('QUEST',940,385,12,'#6e7d90','700');
  QUEST.forEach((s,i)=>txt((i<O.stage?'✓ ':i===O.stage?'▶ ':'   ')+s+(i===1&&O.stage===1?` (${O.got}/3)`:''),940,412+i*25,15,i<O.stage?'#3fb950':i===O.stage?'#f0f4f8':'#56647a',i===O.stage?'600':''));
  txt('Story & dialogue voiced in Turkish',940,560,14,'#9aa7b6');
  txt('Hearts: '+'♥'.repeat(Math.max(0,O.hearts))+'♡'.repeat(3-Math.max(0,O.hearts)),940,590,16,'#ff7b72');
}
// 6. ajan ekibi
const TRN=[[/^Planlayıcı$/,'Planner'],[/^Denetçi$/,'Reviewer'],[/^Birleştirici$/,'Merger'],[/^İşçi-/,'Worker-'],[/^Yedek-/,'Spare-']];
const tr2en=s=>TRN.reduce((a,[r,v])=>a.replace(r,v),s);
const BTR=s=>s.replace('bekliyor','idle').replace('boşta','idle').replace('planlıyor','planning').replace('tamam','done').replace('denetimde','in review').replace('birleştiriyor','merging').replace('KARANTİNA','QUARANTINED').replace(/#(\d+) çalışıyor/,'working #$1').replace(/#(\d+) kontrol/,'checking #$1').replace(/(\d+) parça ✓/,'$1 chunks ✓');
function drawAgent(t){
  panel(40,145,600,535,'AGENTS');
  [...document.querySelectorAll('#ag-lanes .lane')].slice(0,11).forEach((l,i)=>{
    const y=185+i*44,name=tr2en(l.querySelector('b').textContent),b=l.children[1],w=parseFloat(l.querySelector('i').style.width)||0;
    txt(name,60,y+16,16,'#e6edf3','600');
    const cls=b.className,col=cls.includes('q')?'#ff7b72':cls.includes('done')?'#7ee787':cls.includes('busy')?'#79c0ff':'#8b96a5';
    rr(200,y,150,24,12);g.fillStyle=col+'22';g.fill();txt(BTR(b.textContent),275,y+17,13,col,'600','center');
    rr(368,y+7,250,10,5);g.fillStyle='#1d2633';g.fill();if(w){rr(368,y+7,250*w/100,10,5);g.fillStyle=cls.includes('q')?'#f85149':'#1f6feb';g.fill();}
  });
  panel(660,145,580,535,'WHAT HAPPENED');
  const log=q('#ag-log').innerText;const cards=[];
  const ok=(log.match(/ONAYLANDI/g)||[]).length;
  const rej=log.match(/#(\d+) REDDEDİLDİ ✗ — ([\d.]+) asal diye raporlandı ama (\d+) × ([\d.]+)/);
  const quar=log.match(/(İşçi-\d+) karantinaya alındı\. Yerine (Yedek-\d+)/);
  const fin=log.match(/toplam ([\d.]+) asal/),match=log.match(/π\(([\d.]+)\) = ([\d.]+) ile birebir eşleşti/);
  if(log.includes('parçaya böldüm'))cards.push(['#58a6ff','Planner split the job (primes up to 2,000,000) into 12 chunks for 4 parallel workers']);
  if(rej)cards.push(['#f85149',`Reviewer REJECTED chunk #${rej[1]}: ${en(rej[2])} was reported as prime — but it's ${rej[3]} × ${en(rej[4])}`]);
  if(quar)cards.push(['#d29922',`${tr2en(quar[1])} quarantined → ${tr2en(quar[2])} spawned, chunk re-queued`]);
  if(ok)cards.push(['#3fb950',`${ok} chunk${ok>1?'s':''} independently verified (Miller–Rabin + random sampling)`]);
  if(fin)cards.push(['#3fb950',`Merged: ${en(fin[1])} primes`+(match?` — matches the known π(${en(match[1])}) exactly ✓`:'')]);
  let y=195;for(const [c,s] of cards){g.fillStyle=c;g.fillRect(680,y-16,4,48);y=wrap(s,698,y,515,24,17,'#e6edf3')+22;}
}
// 7. model
const MLS=[['kargo hızlı geldi, çok memnunum','“fast delivery, very happy”'],['bu otel berbat, bir daha gelmem','“awful hotel, never again”'],['film tam bir hayal kırıklığı','“the movie was a total letdown”']];
function drawModel(t,seg){
  fit(q('#ml-cv'),40,145,620,330);
  txt('━ training loss    ━ test accuracy',60,500,14,'#9aa7b6');g.fillStyle='#ffcf5c';g.fillRect(60,494,0,0);
  const m=q('#ml-stat').textContent.match(/epok (\d+)\/(\d+) · kayıp ([\d.]+) · eğitim doğruluğu %(\d+) · test doğruluğu %(\d+)/);
  if(m)txt(`epoch ${m[1]}/${m[2]} · loss ${m[3]} · train ${m[4]}% · test ${m[5]}%`,60,530,17,'#e6edf3','600',undefined,true);
  txt('2048 → 16 → 1 net · hand-written backprop · hashed char-trigrams for Turkish suffixes',60,560,13,'#6e7d90');
  rr(40,590,620,90,12);g.fillStyle='#2a1f0b';g.fill();g.strokeStyle='#d29922';g.stroke();
  wrap('Self-correction: first run scored 29% on the test set. It diagnosed mirrored train/test sentences, fixed the dataset → 73%.',60,622,580,24,16,'#f2cc60','600');
  panel(680,145,560,535,'TRY IT  ·  live predictions');
  MLS.forEach(([tr,gl],i)=>{
    once(seg,'p'+i,t>2.6+i*1.1,()=>{const inp=q('#ml-in');inp.value=tr;inp.oninput();seg['r'+i]=q('#ml-pred').textContent;});
    const r=seg['r'+i];if(!r)return;const y=205+i*140,pos=r.startsWith('Olumlu'),pct=(r.match(/%([\d.]+)/)||[])[1];
    txt(tr,700,y,19,'#e6edf3','600');txt(gl,700,y+28,15,'#8b96a5');
    rr(700,y+45,520,30,8);g.fillStyle=pos?'#12361f':'#3d1414';g.fill();
    txt(`${pos?'Positive':'Negative'} · ${pct}%`,716,y+66,16,pos?'#7ee787':'#ff7b72','700');
  });
}
// kapanış
function drawOutro(t){
  const a=ease(t/0.6),b=ease((t-0.8)/0.6),c=ease((t-1.6)/0.6);
  g.globalAlpha=a;txt('Every demo was written, run and tested',W/2,250,36,'#f0f4f8','700','center');txt('by the model itself — in one OpenCode session.',W/2,298,36,'#f0f4f8','700','center');
  g.globalAlpha=b;rr(W/2-150,350,300,56,28);g.fillStyle='#58a6ff';g.fill();txt('exo  ·  free on OpenCode',W/2,387,24,'#04111f','800','center');
  g.globalAlpha=c;txt('Try it yourself — link in the post 👇',W/2,470,24,'#9aa7b6','500','center');
  g.globalAlpha=1;
}

const SEGS=[
  {dur:4.5,bare:true,draw:drawTitle},
  {n:1,dur:7,title:'Its own programming language',sub:'Lexer → parser → AST → bytecode compiler → stack-based VM. Written from scratch.',
    enter(){clickTab('dil');const s=q('#lang-ex');s.value='Fibonacci ve döngü';s.onchange();},draw:drawLang},
  {n:2,dur:7,title:'A 2D physics engine',sub:'Impulse-based collisions, sub-stepping, restitution. No Box2D, no Matter.js.',
    enter(){clickTab('fizik');q('#phys-clear').click();},draw:drawPhys},
  {n:3,dur:7,title:'A ray tracer in plain JavaScript',sub:'Shadows, recursive reflections, glass with Snell refraction + Fresnel.',
    enter(){clickTab('isin');q('#rt-ang').value=20;q('#rt-aa').checked=false;q('#rt-depth').value=4;q('#rt-go').click();},draw:drawRay},
  {n:4,dur:8,title:'Real math, independently verified',sub:'Exact large-angle pendulum period (elliptic integral + AGM), cross-checked with RK4.',
    enter(){clickTab('mat');const s=q('#pend-th');s.value=150;s.oninput();},draw:drawPend},
  {n:5,dur:15,voice:true,title:'A playable story game',sub:'Quest system, voiced dialogue, enemies with an FSM + line of sight + BFS pathfinding.',
    enter(){window.__oyun.reset();clickTab('oyun');},draw:drawGame,leave(){auto.on=false;window.__oyun.keys.clear();}},
  {n:6,dur:12,voice:true,title:'An agent team that checks its own work',sub:'Planner → parallel Web Worker agents → independent reviewer → merger. One worker is secretly broken.',
    enter(){clickTab('ajan');q('#ag-n').value='2000000';q('#ag-k').value=4;q('#ag-fault').checked=true;q('#ag-slow').checked=true;q('#ag-run').click();},draw:drawAgent},
  {n:7,dur:8,title:'A neural net trained live in the browser',sub:'No ML libraries. Turkish sentiment classifier, train/test split, live loss curve.',
    enter(){clickTab('model');q('#ml-reset').click();q('#ml-train').click();},draw:drawModel},
  {dur:5,bare:true,draw:drawOutro},
];
const TOTAL=SEGS.reduce((a,s)=>a+s.dur,0);

/* ---------- ana döngü ---------- */
let t0=null,idx=-1,rec=null,chunks=[],mime='',vtrack=null;
function loop(now){
  const T=(now-t0)/1000;let acc=0,i=0;
  while(i<SEGS.length&&T>=acc+SEGS[i].dur){acc+=SEGS[i].dur;i++;}
  if(i>=SEGS.length){finish();return;}
  const s=SEGS[i],t=T-acc;
  if(i!==idx){if(idx>=0&&SEGS[idx].leave)SEGS[idx].leave();idx=i;s.fired=new Set();s.enter&&s.enter();}
  chrome(s,T,TOTAL);s.draw(t,s);
  const f=Math.max(0,1-t/0.35);if(f>0){g.fillStyle=`rgba(0,0,0,${f})`;g.fillRect(0,0,W,H);}
  const fo=s===SEGS[SEGS.length-1]?Math.max(0,(t-(s.dur-0.6))/0.6):0;if(fo>0){g.fillStyle=`rgba(0,0,0,${fo})`;g.fillRect(0,0,W,H);}
  progress(T,TOTAL);
  if(vtrack)vtrack.requestFrame();
  st.textContent=`${rec?'● kayıt':'▶ önizleme'} ${T.toFixed(1)} / ${TOTAL.toFixed(1)} sn`;
  requestAnimationFrame(loop);
}
async function start(record){
  btnRec.disabled=btnPrev.disabled=true;st.textContent='sesler yükleniyor…';
  await loadAudio();patchSES();
  if(record){
    const stream=cv.captureStream(0);vtrack=stream.getVideoTracks()[0];dest.stream.getAudioTracks().forEach(tr=>stream.addTrack(tr));
    mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
    rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:10e6,audioBitsPerSecond:160e3});
    rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);rec.start(500);
  }
  idx=-1;t0=performance.now();requestAnimationFrame(loop);
}
function finish(){
  stopClip();if(idx>=0&&SEGS[idx].leave)SEGS[idx].leave();
  if(!rec){st.textContent='✓ önizleme bitti';btnRec.disabled=btnPrev.disabled=false;return;}
  rec.onstop=async()=>{
    const blob=new Blob(chunks,{type:mime});st.textContent=`yükleniyor… ${(blob.size/1e6).toFixed(1)} MB`;
    try{const r=await fetch('/upload',{method:'PUT',body:blob});st.textContent=r.ok?`✓ KAYIT TAMAM (${(blob.size/1e6).toFixed(1)} MB) → video/kayit.webm`:'✗ yükleme hatası '+r.status;}
    catch(e){st.textContent='✗ yükleme hatası: '+e.message;}
    window.__kayitBitti=true;
  };
  rec.stop();
}
btnRec.onclick=()=>start(true);btnPrev.onclick=()=>start(false);
// ilk kare
chrome({bare:true});drawTitle(3);
})();
