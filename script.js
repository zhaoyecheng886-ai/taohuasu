/* ============================================================
   桃花酥 · Industrial Romance
   Zoom → Groups → Singles + BG
   ============================================================ */

// DOM
const canvas=document.getElementById('starfield'),ctx=canvas.getContext('2d');
const galleryStage=document.querySelector('.gallery-stage');
const brandTitle=document.querySelector('.brand-title');
const vinylRecord=document.getElementById('vinyl-record'),vinylBtn=document.getElementById('vinylBtn'),vinylDisc=document.getElementById('vinylDisc'),bgm=document.getElementById('bgm');

// Recording mode — bigger cards, hide video, keep ALL effects
const isRecord=new URLSearchParams(window.location.search).has('record');
if(isRecord){
  const rs=document.createElement('style');rs.textContent=`
    :root{--card-w:320px;--card-h:448px;--perspective:2400px}
    .brand-title{top:1.2rem}
    .vinyl-player{top:1rem;right:1.2rem}
    #videoIntro{display:none!important}
  `;document.head.appendChild(rs);
}

// Device detection
const isMobile=/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
const CANVAS_SCALE=isMobile?0.35:0.6;
let W,H;function rs(){W=Math.round(window.innerWidth*CANVAS_SCALE);H=Math.round(window.innerHeight*CANVAS_SCALE);canvas.width=W;canvas.height=H;canvas.style.width=window.innerWidth+'px';canvas.style.height=window.innerHeight+'px'}
window.addEventListener('resize',rs);rs();

// Animation pause flag — skip rendering during video playback
let animRunning=true;
function pauseAnim(){animRunning=false}
function resumeAnim(){animRunning=true}

// Video intro — pause canvas while playing, resume when hidden
(function(){
  const vi=document.getElementById('videoIntro');
  if(vi){
    function hideVi(){
      vi.style.transition='opacity 0.4s ease';
      vi.style.opacity='0';
      setTimeout(()=>{vi.style.display='none';resumeAnim()},450);
    }
    vi.addEventListener('play',pauseAnim);
    vi.addEventListener('playing',pauseAnim);
    vi.addEventListener('error',hideVi);
    vi.addEventListener('ended',hideVi);
    // Quick check: if video hasn't loaded meaningful data in 800ms, hide
    setTimeout(()=>{if(vi.readyState<2||vi.currentTime<0.1)hideVi()},800);
  }
})();

// Firefly — 100
const FFC=isRecord?60:(isMobile?40:100);let zoomActive=false;

// Phase 3 BG
const bgDiv=document.createElement('div');bgDiv.id='phase3-bg';document.body.appendChild(bgDiv);
const bgImgs=['图片背景/04e301bd5ecc25ae296bdeeba84f108d.jpg','图片背景/2be355f065f1b115e85e1fa56bbfd293.jpg','图片背景/5057f47032bba2a44e456423c5e455fe.jpg','图片背景/94f3781ab0c1e3c5c3e4e3ab51f58b9d.jpg','图片背景/b95d1d71011e6c28542c354e2b08cabf.jpg','图片背景/ea340aaaf4283708b45035358fe7d153.jpg'];
function rndBg(){bgDiv.style.backgroundImage=`url(${bgImgs[Math.floor(Math.random()*bgImgs.length)]})`}

// Preload background images so they're cached before phase 3
const bgPreloads=bgImgs.map(src=>{const img=new Image();img.src=src;return img});

class FF{constructor(){this.rst(true)}
rst(i,z){if(z){this.x=Math.random()*W;this.y=Math.random()*H;const dx=this.x-W/2,dy=this.y-H/2,d=Math.sqrt(dx*dx+dy*dy)||1,dist=700+Math.random()*1100;this.x=W/2+dx/d*dist;this.y=H/2+dy/d*dist}else{this.x=Math.random()*W;this.y=i?Math.random()*H:H+50}this.r=Math.random()*2.6+0.8;this.vy=-(Math.random()*0.42+0.12);this.vx=(Math.random()-0.5)*0.35;this.wA=Math.random()*0.2+0.05;this.wF=Math.random()*0.015+0.005;this.bA=Math.random()*0.32+0.16;this.ph=Math.random()*Math.PI*2;this.gR=this.r*4.5;this.exVx=0;this.exVy=0;this.inEx=false;this.bf=0;this.ps=Math.random()}
upd(now){if(zoomActive&&!this.inEx){const dx=W/2-this.x,dy=H/2-this.y,d=Math.sqrt(dx*dx+dy*dy)||1,spd=2+Math.random()*7;this.x+=dx/d*spd;this.y+=dy/d*spd;if(d<40&&Math.random()<0.1)zoomActive=false}else if(this.inEx){this.x+=this.exVx;this.y+=this.exVy;this.exVx*=0.885;this.exVy*=0.885;this.exVy+=0.025;if(Math.abs(this.exVx)<0.04&&Math.abs(this.exVy)<0.04){this.exVx=0;this.exVy=0;this.inEx=false}}else{this.y+=this.vy;this.x+=this.vx+Math.sin(now*this.wF+this.ph)*this.wA}if(this.bf>0.001)this.bf*=0.82;this.alpha=this.bA+Math.sin(now*0.0035+this.ph)*0.12;this.alpha=Math.max(0.04,Math.min(0.78,this.alpha));if(this.y<-40){this.y=H+30;this.x=Math.random()*W}if(this.x<-40)this.x=W+30;if(this.x>W+40)this.x=-30;if(this.inEx&&(this.y<-350||this.y>H+350||this.x<-350||this.x>W+350))this.rst()}
draw(ctx){const fa=this.bf>0.01?Math.min(1,this.alpha+this.bf*0.8):(this.inEx?Math.min(1,this.alpha*2.2):this.alpha);const g=this.bf>0.05?Math.round(215-this.ps*55*this.bf):215,b=this.bf>0.05?Math.round(145+this.ps*70*this.bf):145;const gl=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.gR);gl.addColorStop(0,`rgba(255,${g},${b},${fa})`);gl.addColorStop(0.3,`rgba(255,${Math.round(g*0.9)},${Math.round(b*0.75)},${fa*0.55})`);gl.addColorStop(0.65,`rgba(255,${Math.round(g*0.75)},${Math.round(b*0.5)},${fa*0.12})`);gl.addColorStop(1,'rgba(255,140,70,0)');ctx.beginPath();ctx.arc(this.x,this.y,this.gR,0,Math.PI*2);ctx.fillStyle=gl;ctx.fill();ctx.beginPath();ctx.arc(this.x,this.y,this.r*0.35,0,Math.PI*2);ctx.fillStyle=`rgba(255,245,210,${Math.min(1,fa*1.6)})`;ctx.fill()}}
const fireflies=Array.from({length:FFC},()=>new FF());

// Trail
const MAX_TR=isMobile?50:120;const trails=[];
class TP{constructor(x,y){this.x=x;this.y=y;this.vx=(Math.random()-0.5)*4.5;this.vy=-(Math.random()*3.5+1.2);this.g=0.09+Math.random()*0.14;this.l=0.8;this.mL=0.8;this.r=Math.random()*1.4+0.5}get alive(){return this.l>0}upd(dt){this.x+=this.vx;this.y+=this.vy;this.vy+=this.g;this.l-=dt}draw(cx){const a=this.l/this.mL;cx.beginPath();cx.arc(this.x,this.y,this.r,0,Math.PI*2);cx.fillStyle=`rgba(255,230,160,${a})`;cx.fill()}}
function spTr(x,y,c=isMobile?1:2){for(let i=0;i<c;i++){if(trails.length>=MAX_TR)trails.shift();trails.push(new TP(x+(Math.random()-0.5)*8,y+(Math.random()-0.5)*8))}}
let tMX=W/2,tMY=H/2,lTT=0;
document.addEventListener('mousemove',e=>{tMX=e.clientX;tMY=e.clientY});
function upTr(now,dt){if(now-lTT>25&&ceremonyDone){spTr(tMX,tMY,2);lTT=now}for(let i=trails.length-1;i>=0;i--){trails[i].upd(dt);if(!trails[i].alive)trails.splice(i,1)}}

// Shards (cold, for exit fx)
const MAX_SH=isMobile?80:180;const shards=[],SC=[[255,255,255],[215,248,255],[195,235,255],[235,248,255]];
class GS{constructor(x,y,a,s){this.x=x;this.y=y;this.vx=Math.cos(a)*s;this.vy=Math.sin(a)*s;this.g=0.05+Math.random()*0.09;this.l=0.6+Math.random()*0.2;this.mL=this.l;this.sz=2+Math.random()*5;this.rot=Math.random()*Math.PI*2;this.rS=(Math.random()-0.5)*0.35;this.c=SC[Math.floor(Math.random()*SC.length)]}get alive(){return this.l>0}upd(dt){this.x+=this.vx;this.y+=this.vy;this.vy+=this.g;this.vx*=0.985;this.vy*=0.985;this.rot+=this.rS;this.l-=dt}draw(cx){const a=this.l/this.mL,[r,g,b]=this.c;cx.save();cx.translate(this.x,this.y);cx.rotate(this.rot);cx.beginPath();cx.moveTo(0,-this.sz);cx.lineTo(this.sz*0.55,0);cx.lineTo(0,this.sz);cx.lineTo(-this.sz*0.55,0);cx.closePath();cx.fillStyle=`rgba(${r},${g},${b},${a*0.85})`;cx.fill();cx.restore()}}
function shatter(wel){const r=wel.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,md=Math.max(r.width,r.height)*0.45;for(let i=0;i<20;i++){const ea=Math.random()*Math.PI*2,ed=Math.random()*md,sx=cx+Math.cos(ea)*ed*(r.width/md),sy=cy+Math.sin(ea)*ed*(r.height/md);shards.push(new GS(sx,sy,Math.atan2(sy-cy,sx-cx)+(Math.random()-0.5)*0.55,4+Math.random()*16));if(shards.length>MAX_SH)shards.shift()}for(let i=0;i<8;i++){const sx=cx+(Math.random()-0.5)*r.width*0.8,sy=cy+(Math.random()-0.5)*r.height*0.8;shards.push(new GS(sx,sy,Math.atan2(sy-cy,sx-cx)+(Math.random()-0.5)*0.6,3+Math.random()*10));if(shards.length>MAX_SH)shards.shift()}}

// Glint — lightweight geometric dissolution (ending fx)
const MAX_EM=isMobile?120:250;const embers=[];
const GLINT_COLORS=[
  [0,224,240],[0,240,192],[240,160,184],[240,200,128],[180,220,255],[200,180,240],
];
class Glint{
  constructor(x,y,vx,vy,sz){
    this.x=x;this.y=y;
    this.vx=vx;this.vy=vy;
    this.g=0.06;
    this.l=0.35+Math.random()*0.7;   // 0.35–1.05s, quick
    this.mL=this.l;
    this.sz=sz||(1.5+Math.random()*4);
    this.c=GLINT_COLORS[Math.floor(Math.random()*GLINT_COLORS.length)];
  }
  get alive(){return this.l>0}
  upd(dt){this.x+=this.vx;this.y+=this.vy;this.vy+=this.g;this.l-=dt}
  draw(cx){
    const a=this.l/this.mL;
    const [r_,g_,b_]=this.c;
    cx.beginPath();cx.arc(this.x,this.y,this.sz*0.7,0,Math.PI*2);
    cx.fillStyle=`rgba(${r_},${g_},${b_},${a*0.7})`;cx.fill();
  }
}
function emberize(wel){
  const r=wel.getBoundingClientRect();
  const cx=r.left+r.width/2,cy=r.top+r.height/2;
  const w=r.width,h=r.height;
  for(let i=0;i<30;i++){
    const sx=cx+(Math.random()-0.5)*w*0.8,sy=cy+(Math.random()-0.5)*h*0.75;
    const a=Math.atan2(sy-cy,sx-cx)+(Math.random()-0.5)*0.7;
    const spd=3+Math.random()*12;
    embers.push(new Glint(sx,sy,Math.cos(a)*spd,Math.sin(a)*spd,1.5+Math.random()*4));
    if(embers.length>MAX_EM)embers.shift();
  }
  for(let i=0;i<8;i++){
    const sx=cx+(Math.random()-0.5)*w*0.3,sy=cy+(Math.random()-0.5)*h*0.3;
    const a=Math.atan2(sy-cy,sx-cx)+(Math.random()-0.5)*0.4;
    embers.push(new Glint(sx,sy,Math.cos(a)*6,Math.sin(a)*6,4+Math.random()*7));
    if(embers.length>MAX_EM)embers.shift();
  }
}

// Media
const VX=new Set(['.mp4','.webm','.mov','.avi','.mkv']),isV=f=>VX.has(f.substring(f.lastIndexOf('.')));
const mf=['1780914873941.png','1780914880268.png','1780914883232.png','1780914886261.png','1780914889242.png','1780914892238.png','1780914896828.png','1780914900070.png','1780914903773.png','1780914920341.png','1780914942458.png','1780914947053.png','1780914950808.png','1780914954113.png','1780914956893.png','1780914959717.png','1780914962479.png','1780914965695.png','1780914968991.png','1780914971780.png','1780914973919.png','1780914976739.png','1780914979379.png','1780914981811.png','1780914985181.png'];
const ml=mf.map(f=>({src:`images/${f}`,isVideo:isV(f)}));const TOTAL=ml.length;

// Config
const ZOOM_DUR=2800,GRP_DWELL=800;const SGL_TIMES=[1000,1200,1300,800];

// Play/Pause
const pBtn=document.createElement('button');pBtn.id='pBtn';pBtn.innerHTML='⏸';
Object.assign(pBtn.style,{position:'fixed',bottom:'24px',right:'28px',zIndex:'99',width:'40px',height:'40px',borderRadius:'50%',border:'1px solid rgba(255,255,255,0.15)',background:'rgba(8,8,20,0.65)',color:'#ccc',fontSize:'16px',cursor:'pointer',display:'none',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)'});
document.body.appendChild(pBtn);let paused=false;pBtn.addEventListener('click',e=>{e.stopPropagation();paused=!paused;pBtn.innerHTML=paused?'▶':'⏸';if(!paused)tick()});

// Cards
const cards=[];
function createCard(media,index){
  const w=document.createElement('div');w.className='card-wrapper';w.setAttribute('data-index',index);
  w.style.transform='rotateY(0deg) translateZ(-500px) scale(0.5)';w.style.opacity='0';w.style.pointerEvents='none';
  const c=document.createElement('div');c.className='card';const inn=document.createElement('div');inn.className='card-inner';
  const mw=document.createElement('div');mw.className='card-media-wrap';
  let me;if(media.isVideo){me=document.createElement('video');me.src=media.src;me.loop=true;me.muted=true;me.playsInline=true;me.className='card-media'}else{me=document.createElement('img');me.src=media.src;me.loading='lazy';me.draggable=false;me.className='card-media'}
  mw.appendChild(me);const gR=document.createElement('div');gR.className='glitch-r';const gG=document.createElement('div');gG.className='glitch-g';const gB=document.createElement('div');gB.className='glitch-b';
  if(!media.isVideo){[gR,gG,gB].forEach(l=>{l.style.backgroundImage=`url(${media.src})`;l.style.backgroundSize='cover';l.style.backgroundPosition='center'})}
  const grad=document.createElement('div');grad.className='card-gradient';const sh=document.createElement('div');sh.className='card-shine';const scan=document.createElement('div');scan.className='card-scanline';const leak=document.createElement('div');leak.className='card-light-leak';
  inn.append(mw,gR,gG,gB,scan,leak,grad,sh);c.appendChild(inn);w.appendChild(c);
  return{el:w,card:c,inner:inn,mw,me,leak};
}

// State
let ceremonyDone=false,isMusicOn=false,phase='idle',phTimer=null,slTimer=null,phStart=0;
let activeSet=new Set(),grpSeq=[],grpIdx=0,sglSeq=[],sglIdx=0,sglStyleIdx=0;

// Helpers
function shuf(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function hideAll(){for(let i=0;i<TOTAL;i++){const cd=cards[i];cd.el.style.transition='opacity 0.4s ease';cd.el.style.opacity='0';cd.el.style.transform='rotateY(0deg) translateZ(-500px) scale(0.5)';cd.el.style.filter='none';cd.el.classList.remove('is-active','hovered','touched');cd.el.style.pointerEvents='none';cd.el.style.width='';cd.el.style.height='';cd.el.style.left='';cd.el.style.top=''}}
function posCard(cd,tx,ty,tz,sc,op,ry=0,rz=0,rx=0){cd.el.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px) translateX(${tx}px) translateY(${ty}px) rotateZ(${rz}deg) scale(${sc})`;cd.el.style.opacity=op;cd.el.style.filter='none'}

// Exit FX
function planeExit(wel){wel.style.width='';wel.style.height='';wel.style.left='';wel.style.top='';wel.style.transition='transform 0.35s cubic-bezier(.4,0,.7,1), opacity 0.25s ease';const d=Math.random()>0.5?1:-1;wel.style.transform=`rotateY(0deg) translateZ(0px) translateX(${d*250}px) translateY(-90px) rotateZ(${d*35}deg) scale(0.45)`;wel.style.opacity='0';wel.style.filter='none';wel.style.pointerEvents='none'}
function crumpExit(wel){wel.style.width='';wel.style.height='';wel.style.left='';wel.style.top='';wel.style.transition='transform 0.25s cubic-bezier(.6,0,1,.45), opacity 0.15s ease';const rz=(Math.random()-0.5)*90;wel.style.transform=`rotateY(0deg) translateZ(0px) scale(0.06) rotateZ(${rz}deg)`;wel.style.opacity='0';wel.style.filter='none';wel.style.pointerEvents='none';shatter(wel)}
function gridPos(n){let cw=isRecord?420:280,ch=isRecord?580:340,cols,rows;
  if(n===3){cols=3;rows=1;cw=isRecord?360:240} // 3-card: wide row
  else if(n===2){cols=2;rows=1;cw=isRecord?380:260} // 2-card: side by side
  else{cols=n<=4?2:n<=6?3:4;rows=Math.ceil(n/cols)}
  const p=[];for(let i=0;i<n;i++){const c=i%cols,r=Math.floor(i/cols);p.push({x:(c-(cols-1)/2)*cw,y:(r-(rows-1)/2)*ch})}return p}

// Phase 1: wind chime opening
function ph1_chime(){phase='chime';activeSet.clear();hideAll();
  const startX=W+50,endX=-350,totalW=Math.abs(endX-startX);
  const chimeGap=totalW/(TOTAL-1);
  for(let i=0;i<TOTAL;i++){
    const cd=cards[i];
    cd.el.style.transition='none';cd.el.style.width='';cd.el.style.height='';cd.el.style.left='';cd.el.style.top='';
    // Hang at varying heights, spread along corridor
    const x=startX+i*chimeGap;
    const hangY=-H*0.15-Math.sin(i*1.7)*40; // varied string lengths
    const sway=Math.sin(i*2.3)*3; // initial sway angle
    posCard(cd,x,hangY,0,0.7,0.95,0,sway);
    // Add string via inline style (thin line above card)
    cd.el.style.setProperty('--string-h',Math.abs(hangY-H*0.1)+'px');
    cd.el.classList.add('chime');cd.el.classList.remove('is-active');
    if(ml[i].isVideo&&cd.me)cd.me.pause();
  }
  // Gentle corridor pan: immediate start
  for(let i=0;i<TOTAL;i++){
      const cd=cards[i];
      cd.el.style.transition='transform 10s cubic-bezier(.4,0,.6,1)';
      const curX=parseFloat(cd.el.style.transform.match(/translateX\(([^)]+)/)?.[1]||0);
      const curY=parseFloat(cd.el.style.transform.match(/translateY\(([^)]+)/)?.[1]||0);
      const opacity=0.55+0.4*Math.sin((i/TOTAL)*Math.PI);
      posCard(cd,curX-totalW-700,curY,0,0.65,opacity);
    }
    // Sequential shatter: left to right, one by one into starfield
    setTimeout(()=>{
      stopBeat();
      for(let i=0;i<TOTAL;i++){
        setTimeout(()=>{
          const cd=cards[i];emberize(cd.el);cd.el.classList.remove('chime');
          cd.el.style.transition='opacity 0.2s ease';cd.el.style.opacity='0';cd.el.style.pointerEvents='none';
          if(i===TOTAL-1)setTimeout(()=>{hideAll();ph0()},800);
        },i*120); // 120ms stagger, ~3s total
      }
    },10400)}

// Phase 0: Ripple Opening — core photo + concentric rings bloom outward
function ph0(){
  phase='ripple';phStart=performance.now();cancelSl();
  startBeat(); // beat was stopped during chime particle burst
  activeSet.clear();hideAll();bgDiv.classList.remove('show');
  galleryStage.style.transform='rotateX(0deg)';

  // Pick one core photo at random
  const centerIdx=Math.floor(Math.random()*TOTAL);
  const others=shuf([...Array(TOTAL).keys()].filter(i=>i!==centerIdx));

  // Ring config — counts must sum to TOTAL-1 (24)
  const rz=1; // default radii, fine for both 720p and 1080p
  const ringCfg=[
    {count:5,radius:180*rz,scale:0.82,delayBase:150},
    {count:8,radius:320*rz,scale:0.68,delayBase:500},
    {count:8,radius:470*rz,scale:0.55,delayBase:900},
    {count:3,radius:600*rz,scale:0.44,delayBase:1300},
  ];

  // Build target map: index → {x, y, scale, delay}
  const targets={};
  targets[centerIdx]={x:0,y:0,scale:1.08,delay:0};

  let cursor=0;
  ringCfg.forEach((ring)=>{
    for(let i=0;i<ring.count&&cursor<others.length;i++){
      const idx=others[cursor++];
      // Natural stagger: offset angle slightly from perfect division
      const baseAngle=(i/ring.count)*Math.PI*2;
      const jitterA=(Math.random()-0.5)*0.35;        // angle jitter
      const jitterR=(Math.random()-0.5)*ring.radius*0.12; // radius jitter
      const angle=baseAngle+jitterA;
      const r=ring.radius+jitterR;
      const x=Math.cos(angle)*r;
      const y=Math.sin(angle)*r*0.62;  // elliptical squash for depth
      const stagger=i*55;
      targets[idx]={x,y,scale:ring.scale,delay:ring.delayBase+stagger};
    }
  });

  // Place ALL cards at center, tiny & transparent
  for(let i=0;i<TOTAL;i++){
    const cd=cards[i];
    cd.el.style.transition='none';
    cd.el.style.width='';cd.el.style.height='';cd.el.style.left='';cd.el.style.top='';
    posCard(cd,0,0,0,0.2,0.08);
    cd.el.classList.add('is-active');cd.el.classList.remove('hovered','touched','chime');
    cd.el.style.pointerEvents='none';
    activeSet.add(i);
  }

  // Force layout, then ripple outward
  void cards[0].el.offsetWidth;

  let maxDelay=0;
  for(let i=0;i<TOTAL;i++){
    const t=targets[i];
    if(!t)continue;
    if(t.delay>maxDelay)maxDelay=t.delay;
    const cd=cards[i];
    setTimeout(()=>{
      cd.el.style.transition='transform 0.75s cubic-bezier(.15,.82,.35,1), opacity 0.45s ease';
      posCard(cd,t.x,t.y,0,t.scale,1);
    },t.delay);
  }

  // Firefly burst at center when each ring blooms
  setTimeout(()=>{fireflies.forEach(ff=>{ff.bf=0.6;ff.ps=Math.random()})},100);
  setTimeout(()=>{fireflies.forEach(ff=>{ff.bf=0.8;ff.ps=Math.random()})},550);
  setTimeout(()=>{fireflies.forEach(ff=>{ff.bf=0.7;ff.ps=Math.random()})},950);

  // After ripple settles → groups
  phTimer=setTimeout(()=>{ph2()},maxDelay+1200);
}

// Phase 2: Groups
function ph2(){phase='groups';phStart=performance.now();grpIdx=0;galleryStage.style.transform='rotateX(0deg)';const pool=shuf([...Array(TOTAL).keys()]);grpSeq=[];const sz=[4,2,4,6,4,2,3];let i=0;for(const s of sz){if(i>=pool.length)break;grpSeq.push(pool.slice(i,Math.min(i+s,pool.length)));i+=s}if(i<pool.length)grpSeq.push(pool.slice(i));showGrp()}
function showGrp(){
  if(paused){slTimer=setTimeout(()=>showGrp(),100);return}
  if(grpIdx>=grpSeq.length){phaseOut();return}
  const grp=grpSeq[grpIdx];grpIdx++;const gd=gridPos(grp.length);
  // Exit old
  for(const idx of activeSet){const cd=cards[idx];if(!grp.includes(idx)){if(Math.random()>0.5)planeExit(cd.el);else crumpExit(cd.el);cd.el.classList.remove('is-active','hovered','touched')}}
  activeSet.clear();
  const n=grp.length;
  if(n===4){
    // ── 4-card: diagonal fold-flip ── [[0,3],[1,2]] = top-left+bottom-right first, then top-right+bottom-left
    [[0,3],[1,2]].forEach((pair,pi)=>{
      const delay=pi*320;
      pair.forEach(k=>{
        const idx=grp[k],cd=cards[idx],p=gd[k];
        activeSet.add(idx);
        cd.el.style.transition='none';
        // Start folded vertical: left column folds right (-80°), right column folds left (80°)
        const foldY=p.x<0?-80:80;
        posCard(cd,p.x,p.y+10,0,0.55,0.06,0,0,foldY);
        void cd.el.offsetWidth;
        setTimeout(()=>{
          cd.el.style.transition='transform 0.55s cubic-bezier(.15,.82,.35,1), opacity 0.35s ease';
          posCard(cd,p.x,p.y,0,1,1,0,0,0);
          cd.el.classList.add('is-active');cd.el.style.pointerEvents='auto';
          if(ml[idx].isVideo&&cd.me)cd.me.play().catch(()=>{});
        },delay);
      });
    });
    bp();slTimer=setTimeout(()=>showGrp(),1550);
  }else if(n===2){
    // ── 2-card: left pops first → right follows ──
    grp.forEach((idx,k)=>{
      const cd=cards[idx],p=gd[k];
      activeSet.add(idx);
      const delay=k*280;
      cd.el.style.transition='none';
      posCard(cd,p.x,p.y+35,0,0.5,0.08,0,k===0?-14:14);
      void cd.el.offsetWidth;
      setTimeout(()=>{
        cd.el.style.transition='transform 0.5s cubic-bezier(.15,.82,.35,1), opacity 0.32s ease';
        posCard(cd,p.x,p.y,0,1,1);
        cd.el.classList.add('is-active');cd.el.style.pointerEvents='auto';
        if(ml[idx].isVideo&&cd.me)cd.me.play().catch(()=>{});
      },delay);
    });
    bp();slTimer=setTimeout(()=>showGrp(),1200);
  }else{
    // ── 3/6-card: wave stagger ──
    grp.forEach((idx,k)=>{
      const cd=cards[idx],p=gd[k];
      activeSet.add(idx);
      const delay=k*110;
      cd.el.style.transition='none';
      posCard(cd,p.x,p.y+22,0,0.65,0.12);
      void cd.el.offsetWidth;
      setTimeout(()=>{
        cd.el.style.transition='transform 0.42s cubic-bezier(.15,.82,.35,1), opacity 0.3s ease';
        posCard(cd,p.x,p.y,0,1,1);
        cd.el.classList.add('is-active');cd.el.style.pointerEvents='auto';
        if(ml[idx].isVideo&&cd.me)cd.me.play().catch(()=>{});
      },delay);
    });
    bp();slTimer=setTimeout(()=>showGrp(),900+n*70);
  }
}

// Quick disperse exit (0.8s)
function phaseOut(){phase='out';
  for(const idx of activeSet){const cd=cards[idx];cd.el.style.transition='transform 0.5s cubic-bezier(.4,0,.7,1), opacity 0.4s ease';cd.el.style.transform+=` translateX(${(Math.random()-0.5)*300}px) translateY(${(Math.random()-0.5)*200}px) scale(0.3)`;cd.el.style.opacity='0';cd.el.style.filter='blur(3px)';cd.el.classList.remove('is-active')}
  activeSet.clear();setTimeout(()=>ph3(),550)}

// Phase 3: Singles + BG
function ph3(){phase='singles';phStart=performance.now();sglIdx=0;bgDiv.classList.add('show');galleryStage.style.transform='rotateX(0deg)';const pool=shuf([...Array(TOTAL).keys()]);sglSeq=pool.map(i=>[i]);showSgl()}
function showSgl(){
  if(paused){slTimer=setTimeout(()=>showSgl(),100);return}
  if(sglIdx>=sglSeq.length){bgDiv.classList.remove('show');ph1_chime();return}
  const bt=sglSeq[sglIdx];sglIdx++;rndBg();
  // Exit old
  for(const idx of activeSet){const cd=cards[idx];if(!bt.includes(idx)){crumpExit(cd.el);cd.el.classList.remove('is-active','hovered','touched')}}
  activeSet.clear();
  const spots=[{x:0,y:-80},{x:-150,y:60},{x:160,y:-30},{x:-100,y:-120},{x:120,y:100},{x:0,y:50}];
  const sp=spots[sglIdx%spots.length];
  const style=sglStyleIdx%5;sglStyleIdx++;

  bt.forEach(idx=>{
    const cd=cards[idx];activeSet.add(idx);
    cd.el.style.transition='none';cd.el.style.width='';cd.el.style.height='';cd.el.style.left='';cd.el.style.top='';
    cd.el.style.filter='none';
    // Reset clip-path from previous wipe
    cd.el.style.clipPath='';cd.card.style.clipPath='';

    switch(style){
      case 0: // ── 缩放淡入 ──
        posCard(cd,sp.x,sp.y,0,0.12,0.06);
        void cd.el.offsetWidth;
        cd.el.style.transition='transform 0.72s cubic-bezier(.15,.82,.35,1), opacity 0.48s ease';
        posCard(cd,sp.x,sp.y,0,1,1);
        break;
      case 1: // ── 推拉前移（dolly zoom）──
        posCard(cd,sp.x,sp.y,-220,1.55,0.08);
        cd.el.style.filter='blur(2.5px)';
        void cd.el.offsetWidth;
        cd.el.style.transition='transform 0.75s cubic-bezier(.1,.9,.3,1), opacity 0.4s ease, filter 0.55s ease';
        posCard(cd,sp.x,sp.y,0,1,1);
        cd.el.style.filter='blur(0px)';
        break;
      case 2:{ // ── 横向擦除 ──
        posCard(cd,sp.x,sp.y,0,1,1);
        const dir=sglStyleIdx%2?'right':'left';
        cd.el.style.clipPath=dir==='left'?'inset(0 100% 0 0)':'inset(0 0 0 100%)';
        void cd.el.offsetWidth;
        cd.el.style.transition='clip-path 0.58s cubic-bezier(.25,.46,.45,.94)';
        cd.el.style.clipPath='inset(0 0 0 0)';
      }break;
      case 3: // ── 旋转缓入 ──
        posCard(cd,sp.x,sp.y,0,0.78,0.06,0,-22);
        void cd.el.offsetWidth;
        cd.el.style.transition='transform 0.72s cubic-bezier(.15,.82,.35,1), opacity 0.4s ease';
        posCard(cd,sp.x,sp.y,0,1,1);
        break;
      case 4: // ── 模糊对焦 ──
        posCard(cd,sp.x,sp.y,0,1.04,0.22);
        cd.el.style.filter='blur(16px)';
        void cd.el.offsetWidth;
        cd.el.style.transition='transform 0.68s cubic-bezier(.15,.82,.35,1), opacity 0.45s ease, filter 0.5s ease';
        posCard(cd,sp.x,sp.y,0,1,1);
        cd.el.style.filter='blur(0px)';
        break;
    }
    cd.el.classList.add('is-active');cd.el.style.pointerEvents='auto';
    if(ml[idx].isVideo&&cd.me)cd.me.play().catch(()=>{});
  });
  const dwell=SGL_TIMES[sglIdx%4];bp();
  slTimer=setTimeout(()=>showSgl(),dwell);
}
function tick(){cancelSl();if(phase==='groups')showGrp();else if(phase==='singles')showSgl()}

// Beat
function bp(){brandTitle.classList.add('beat');setTimeout(()=>brandTitle.classList.remove('beat'),360);fireflies.forEach(ff=>{ff.bf=1.0;ff.ps=Math.random()})}
function tEx(wel){const r=wel.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;fireflies.forEach(ff=>{const dx=ff.x-cx,dy=ff.y-cy,a=Math.atan2(dy,dx)+(Math.random()-0.5)*Math.PI*0.45,f=12+Math.random()*24;ff.exVx=Math.cos(a)*f;ff.exVy=Math.sin(a)*f;ff.inEx=true})}
function tBB(){if(!isMusicOn||!ceremonyDone)return;const cx=W*(0.3+Math.random()*0.4),cy=H*(0.3+Math.random()*0.4);for(let i=0;i<20;i++){const ff=fireflies[Math.floor(Math.random()*FFC)],dx=ff.x-cx,dy=ff.y-cy,a=Math.atan2(dy,dx)+(Math.random()-0.5)*Math.PI*0.5,f=4+Math.random()*10;ff.exVx=Math.cos(a)*f;ff.exVy=Math.sin(a)*f;ff.inEx=true}}

// Init
function initIntro(){if(ceremonyDone)return;ceremonyDone=true;if(!isMusicOn){bgm.play().then(()=>{isMusicOn=true;vinylDisc.classList.add('spinning');vinylRecord.classList.add('playing');startBeat()}).catch(()=>{})}brandTitle.classList.add('revealed');pBtn.style.display='block';ph0()}

// BGM
function playBGM(){bgm.play().then(()=>{isMusicOn=true;vinylDisc.classList.add('spinning');vinylRecord.classList.add('playing');startBeat()}).catch(()=>{})}
function pauseBGM(){bgm.pause();isMusicOn=false;vinylDisc.classList.remove('spinning');vinylRecord.classList.remove('playing');stopBeat()}
function toggleBGM(){isMusicOn?pauseBGM():playBGM()}
vinylBtn.addEventListener('click',e=>{e.stopPropagation();if(!ceremonyDone)initIntro();else toggleBGM()});
document.addEventListener('click',e=>{if(e.target.closest('#vinylBtn')||e.target.closest('#pBtn'))return;if(!ceremonyDone)initIntro()});
document.addEventListener('keydown',e=>{if(e.code==='Space'&&document.activeElement===document.body){e.preventDefault();if(!ceremonyDone)initIntro();else toggleBGM()}});

// Beat sim
let bT=null;function startBeat(){stopBeat();bT=setInterval(()=>{if(isMusicOn&&ceremonyDone)tBB()},520)}function stopBeat(){if(bT){clearInterval(bT);bT=null}}

// Hover
let hC=null,tC=null,gT=null;
function aG(cd){if(!cd)return;const{card,mw}=cd;clearTimeout(gT);card.classList.remove('glitching');mw.style.clipPath='';mw.style.transform='';mw.style.filter='';void card.offsetWidth;card.classList.add('glitching');gT=setTimeout(()=>{card.classList.remove('glitching');mw.style.clipPath='';mw.style.transform='';mw.style.filter=''},170)}
function eF(cd){if(!cd)return;cd.el.classList.add('hovered');cancelSl();aG(cd)}
function xF(cd){if(!cd)return;cd.el.classList.remove('hovered','touched');cd.card.classList.remove('glitching');tick()}
galleryStage.addEventListener('mouseenter',e=>{const w=e.target.closest('.card-wrapper');if(!w||!w.classList.contains('is-active'))return;const idx=parseInt(w.getAttribute('data-index'));if(isNaN(idx))return;if(hC===cards[idx])return;if(hC)xF(hC);hC=cards[idx];eF(hC)},true);
galleryStage.addEventListener('mouseleave',e=>{const w=e.target.closest('.card-wrapper');if(!w)return;if(w.contains(e.relatedTarget))return;const idx=parseInt(w.getAttribute('data-index'));if(isNaN(idx)||hC!==cards[idx])return;xF(hC);hC=null},true);
galleryStage.addEventListener('touchstart',e=>{const w=e.target.closest('.card-wrapper');if(!w||!w.classList.contains('is-active'))return;const idx=parseInt(w.getAttribute('data-index'));if(isNaN(idx))return;tC=cards[idx];w.classList.add('touched');eF(tC)},{passive:true});
galleryStage.addEventListener('touchend',()=>{if(tC){xF(tC);tC=null}});

// Cancel slide
function cancelSl(){clearTimeout(slTimer);slTimer=null}

// Animation loop
let lastT=0;
function anim(now){if(animRunning){const dt=lastT?Math.min((now-lastT)/1000,0.1):0.016;lastT=now;ctx.clearRect(0,0,W,H);ctx.save();ctx.globalCompositeOperation='lighter';for(const ff of fireflies){ff.upd(now);ff.draw(ctx)}for(let i=shards.length-1;i>=0;i--){shards[i].upd(dt);if(!shards[i].alive)shards.splice(i,1)}for(const s of shards)s.draw(ctx);for(let i=embers.length-1;i>=0;i--){embers[i].upd(dt);if(!embers[i].alive)embers.splice(i,1)}for(const e of embers)e.draw(ctx);upTr(now,dt);for(const t of trails)t.draw(ctx);ctx.restore()}else{lastT=0}requestAnimationFrame(anim)}

function init(){ml.forEach((media,i)=>{const{el,card,inner,mw,me,leak}=createCard(media,i);galleryStage.appendChild(el);cards.push({el,card,inner,mw,me,leak})});lastT=performance.now();requestAnimationFrame(anim)}
init();
