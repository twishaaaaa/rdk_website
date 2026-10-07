(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const sm=t=>t*t*(3-2*t);
const seg=(p,a,b)=>clamp((p-a)/(b-a));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall=()=>innerWidth<820;

$('#yr').textContent=new Date().getFullYear();

/*  mobile menu  */
const burger=$('#burger'), menu=$('#menu');
function setMenu(open){burger.setAttribute('aria-expanded',open);burger.setAttribute('aria-label',open?'Close menu':'Open menu');menu.hidden=!open;document.body.style.overflow=open?'hidden':''}
burger.addEventListener('click',()=>setMenu(burger.getAttribute('aria-expanded')!=='true'));
$$('a',menu).forEach(a=>a.addEventListener('click',()=>setMenu(false)));
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
matchMedia('(min-width:1081px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});

/*  reveal, counters, bars  */
function countUp(el){
  const to=+el.dataset.count; if(reduce){el.textContent=to;return}
  const from=to>1000?to-40:0, t0=performance.now(), dur=1500;
  (function tick(now){const k=clamp((now-t0)/dur);el.textContent=Math.round(lerp(from,to,1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(tick)})(t0);
}
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return; e.target.classList.add('in');
  $$('[data-count]',e.target).forEach(countUp);
  if(e.target.matches('[data-count]'))countUp(e.target);
  io.unobserve(e.target);
}),{threshold:.14,rootMargin:'0px 0px -6% 0px'});
$$('.rv,.wipe').forEach(el=>io.observe(el));

/*  project filter  */
const rows=$$('.row');
$$('.filters button').forEach(b=>b.addEventListener('click',()=>{
  $$('.filters button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  rows.forEach(r=>{const show=b.dataset.f==='all'||r.dataset.cat===b.dataset.f;r.style.display = show ? "grid" : "none";;if(show){r.classList.remove('pop');void r.offsetWidth;r.classList.add('pop')}});
  layoutGallery();
}));

/*  horizontal gallery  */
const gal=$('#gal'), galSticky=$('#galSticky'), galTrack=$('#galTrack'), galBar=$('#galBar');
let galDist=0;
function layoutGallery(){
  if(false){gal.classList.add('native');gal.style.height='';galTrack.style.transform='';return}
  gal.classList.remove('native');
  const pad=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad'))||0;
  galDist=Math.max(0,galTrack.scrollWidth-innerWidth);
  gal.style.height=(galDist+galSticky.offsetHeight)+'px';
}
function galFrame(){
  if(gal.classList.contains('native'))return;
  const r=gal.getBoundingClientRect(), span=gal.offsetHeight-galSticky.offsetHeight;
  const p=span>0?clamp(-r.top/span):0;
  galTrack.style.transform=`translate3d(${-p*galDist}px,0,0)`; galBar.style.width=(p*100)+'%';
}

/* hero into About  */
const ho=$('#handoff'), hoSticky=ho&&$('.handoff__sticky',ho);
function hoProgress(){const span=ho.offsetHeight-hoSticky.offsetHeight;const r=ho.getBoundingClientRect();return span>0?clamp(-r.top/span):0}
function handoffFrame(){
  const p=hoProgress();
  const drive=ease(seg(p,0,.24)), tx=lerp(-780,0,drive);
  const dump=sm(seg(p,.24,.36));
  const pileS=sm(seg(p,.26,.4));
  const flatten=sm(seg(p,.4,.5));
  const pitOn=sm(seg(p,.42,.56));
  const cross=sm(seg(p,.62,.86));
  const leave=ease(seg(p,.88,1));
  $('#hoBed').setAttribute('transform',`rotate(${-26*dump} 520 240)`);
  $('#hoLoad').style.opacity=Math.max(1-dump*1.4,0);
  $('#hoTruck').setAttribute('transform',`translate(${tx+lerp(0,680,leave)},0)`);
  $('#hoPile').setAttribute('transform',`translate(650,270) scale(${Math.max(pileS,.001)}) translate(-650,-270)`);
  $('#hoPile').style.opacity=Math.max(pileS,.001)>0.01?Math.max(1-flatten,0):0;
  $('#hoPit').style.opacity=Math.max(pitOn-cross,0);
  $('#hoPit').setAttribute('transform',`translate(650,263) scale(${lerp(.75,1,pitOn)}) translate(-650,-263)`);
  $('#hoBridge').style.opacity=cross;
  $('#hoBridge').setAttribute('transform',`translate(660,266) scale(${lerp(.7,1,cross)}) translate(-660,-266)`);
  $('#hoCap').style.opacity=sm(seg(p,.86,.97));
}
function handoffStatic(){
  $('#hoTruck').style.display='none';
  $('#hoPile').style.opacity=0;$('#hoPit').style.opacity=0;
  $('#hoBridge').style.opacity=1;$('#hoBridge').setAttribute('transform','translate(660,266) scale(1) translate(-660,-266)');
  $('#hoCap').style.opacity=1;
}
if(ho){if(reduce)handoffStatic()}

/*  route-line draw-in (About stats, Team)  */
const routeEls=[['statsDash',$('#stats')],['teamDash',$('.lead-team')]].filter(([id,el])=>el&&$('#'+id));
function routeFrame(){
  routeEls.forEach(([id,el])=>{
    const r=el.getBoundingClientRect();
    const p=clamp((innerHeight*.82-r.top)/(r.height*.7+1));
    $('#'+id).style.strokeDashoffset=(100*(1-p));
  });
}

/*  parallax, gauge, active nav  */
const parEls=$$('[data-par]'), navLinks=$$('.nav__links a'), gaugeLinks=$$('#gauge a'), gaugeFill=$('#gaugeFill');
const secIds=['home','about','services','projects','team','contact'], secs=secIds.map(id=>document.getElementById(id));
function frame(){
  const vh=innerHeight;
  if(!reduce) parEls.forEach(el=>{const r=el.parentElement.getBoundingClientRect(); if(r.bottom<-100||r.top>vh+100)return; const rel=(r.top+r.height/2-vh/2)/vh; el.style.transform=`translate3d(0,${(-rel*(+el.dataset.par)).toFixed(1)}px,0) scale(1.14)`});
  let cur=secIds[0]; const y=vh*.4; secs.forEach(s=>{if(s.getBoundingClientRect().top<=y)cur=s.id});
  [...navLinks,...gaugeLinks].forEach(a=>a.setAttribute('aria-current',a.getAttribute('href')==='#'+cur));
  const max=document.documentElement.scrollHeight-vh; if(max>0)gaugeFill.style.height=(scrollY/max*100)+'%';
  galFrame(); routeFrame(); if(ho&&!reduce)handoffFrame();
}
let ticking=false;
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{ticking=false;frame()})}},{passive:true});
addEventListener('resize',()=>{layoutGallery();frame()});
addEventListener('load',()=>{layoutGallery();frame()});
layoutGallery();frame();

/*  contact form  */
const form=$('#form'), note=$('#formNote');
function build(){
  const f=new FormData(form), n=(f.get('name')||'').trim(), p=(f.get('phone')||'').trim();
  let ok=true; const digits=p.replace(/\D/g,'');
  $('#e-name').textContent=''; $('#e-phone').textContent=''; form.querySelectorAll('.field').forEach(x=>x.classList.remove('bad'));
  if(!n){$('#e-name').textContent='Please enter your name.';$('#f-name').parentElement.classList.add('bad');ok=false}
  if(digits.length<10){$('#e-phone').textContent='Please enter a 10-digit phone number.';$('#f-phone').parentElement.classList.add('bad');ok=false}
  if(!ok){(form.querySelector('.bad input')||{focus(){}}).focus();return null}
  const msg=(f.get('msg')||'').trim();
  return `Hello RDK, I am ${n}. I am looking for: ${f.get('type')}.${msg?'\n'+msg:''}\nPhone: ${p}`;
}
form.addEventListener('submit',e=>{e.preventDefault();const t=build();if(!t)return;note.textContent='Opening WhatsApp…';open('https://wa.me/919016033357?text='+encodeURIComponent(t),'_blank','noopener')});

/*3D*/
const build_=$('#home'), stage=$('#stage'), canvas=$('#scene');
let hasGL=false;
try{const c=document.createElement('canvas');hasGL=!!(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl')))}catch(e){}
if(typeof THREE==='undefined'||!hasGL){document.body.classList.add('static-hero');return}

const caps=$$('.cap'), hudStage=$('#hudStage'), hudPct=$('#hudPct'), hudBar=$('#hudBar'), cue=$('#cue');
const STAGES=[[0,.16,'Earthwork'],[.16,.29,'Footings'],[.29,.57,'Piers'],[.57,.79,'Deck launch'],[.79,.905,'Track & road'],[.905,1.01,'Handover']];

let renderer, scene, camera, upd, running=false, lastT=0;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:!isSmall(),powerPreference:'high-performance'});
}catch(e){document.body.classList.add('static-hero');return}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,isSmall()?1.5:2));
const SHADOWS=!isSmall()&&matchMedia('(pointer:fine)').matches;
if(SHADOWS){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap}
scene=new THREE.Scene();
const skyDay=new THREE.Color(0xe8dfd1), skyNight=new THREE.Color(0x1f1f1f), sky=new THREE.Color();
scene.background=new THREE.Color(0xe8dfd1); scene.fog=new THREE.Fog(0xe8dfd1,48,125);
camera=new THREE.PerspectiveCamera(36,1,.5,300);

const hemi=new THREE.HemisphereLight(0xe8dfd1,0x262626,.95); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xf8f6f1,1.15); sun.position.set(22,34,16); scene.add(sun);
if(SHADOWS){sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const s=sun.shadow.camera;s.left=-30;s.right=30;s.top=30;s.bottom=-30;s.near=5;s.far=100;sun.shadow.bias=-.0006}

const M=(c,r=.85,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const mConcrete=M(0xd3c6b8,.92), mSlab=M(0xd3c6b8,.95), mYellow=M(0xa88254,.55,.1), mSteel=M(0x262626,.6,.4), mSoil=M(0x3d3d3d,1), mSoilD=M(0x4a4a4a,1), mAsph=M(0x262626,.95), mNavy=M(0x3d3d3d,.5,.1), mGlassDark=M(0x1f1f1f,.3,.5);
const boxB=(w,h,d)=>new THREE.BoxGeometry(w,h,d).translate(0,h/2,0);
function mesh(g,m,x=0,y=0,z=0,cast=true){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);if(SHADOWS){o.castShadow=cast;o.receiveShadow=true}return o}

/* river channel */
function gridTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#4A4A4A';g.fillRect(0,0,128,128);g.strokeStyle='#A88254';g.lineWidth=3;g.strokeRect(0,0,128,128);g.strokeStyle='rgba(168,130,84,.35)';g.lineWidth=1.5;g.beginPath();g.moveTo(64,0);g.lineTo(64,128);g.moveTo(0,64);g.lineTo(128,64);g.stroke();const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1/6,1/6);t.anisotropy=4;return t}
function waterTex(){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.fillStyle='#D3C6B8';g.fillRect(0,0,256,64);g.strokeStyle='rgba(201,168,118,.5)';g.lineWidth=2;for(let y=6;y<64;y+=11){g.beginPath();for(let x=-8;x<264;x+=16){g.lineTo(x,y+Math.sin(x*.09)*3)}g.stroke()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,3);t.anisotropy=4;return t}
const GAP=9, BANKD=6;
const shape=new THREE.Shape();shape.absarc(0,0,95,0,Math.PI*2,false);
const hole=new THREE.Path();[[-GAP,-BANKD],[-GAP,BANKD],[GAP,BANKD],[GAP,-BANKD]].forEach((p,i)=>i?hole.lineTo(p[0],p[1]):hole.moveTo(p[0],p[1]));hole.closePath();shape.holes.push(hole);
const ground=new THREE.Mesh(new THREE.ShapeGeometry(shape,72),new THREE.MeshStandardMaterial({map:gridTex(),color:0xada79c,roughness:1}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=SHADOWS;scene.add(ground);
const PIT=1.7,WTEX=waterTex();
[[0,-PIT/2,-BANKD,0,GAP*2],[0,-PIT/2,BANKD,Math.PI,GAP*2],[-GAP,-PIT/2,0,Math.PI/2,BANKD*2],[GAP,-PIT/2,0,-Math.PI/2,BANKD*2]].forEach(w=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w[4],PIT),mSoil);m.position.set(w[0],w[1],w[2]);m.rotation.y=w[3];m.receiveShadow=SHADOWS;scene.add(m)});
const water=new THREE.Mesh(new THREE.PlaneGeometry(GAP*2,BANKD*2),new THREE.MeshStandardMaterial({map:WTEX,roughness:.35,metalness:.05,transparent:true,opacity:.92}));
water.rotation.x=-Math.PI/2;water.position.y=-PIT+.32;water.receiveShadow=SHADOWS;scene.add(water);
/* haul road */
const road=new THREE.Mesh(new THREE.RingGeometry(14.6,17.6,72),mAsph);road.rotation.x=-Math.PI/2;road.position.y=.03;road.receiveShadow=SHADOWS;scene.add(road);
const dash=new THREE.Mesh(new THREE.RingGeometry(15.95,16.25,72,1),new THREE.MeshBasicMaterial({color:0xa88254,transparent:true,opacity:.55}));dash.rotation.x=-Math.PI/2;dash.position.y=.04;scene.add(dash);

/* spoil heap */
const heap=mesh(new THREE.ConeGeometry(3.4,2.4,9).translate(0,1.2,0),mSoil,-12.5,0,-4.5);scene.add(heap);

const boxL=(w,h,d)=>new THREE.BoxGeometry(w,h,d).translate(w/2,h/2,0);
const DECKY=3.3, PX=[-5.4,-1.8,1.8,5.4];

/* pier footings + rebar mats */
const foots=new THREE.Group();scene.add(foots);
const footRebar=new THREE.Group();footRebar.visible=false;scene.add(footRebar);
PX.forEach(x=>{
  const f=mesh(boxB(1.9,.6,1.9),mSlab,x,-PIT,0,false);f.scale.y=.001;foots.add(f);f.userData.full=1;
  const pts=[];for(let i=-.8;i<=.81;i+=.32){pts.push(x-.8,0,i,x+.8,0,i,x+i,0,-.8,x+i,0,.8)}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  footRebar.add(new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xa88254})));
});
footRebar.position.y=-PIT+.35;

/* piers */
const piers=PX.map((x,i)=>{
  const g=new THREE.Group();g.position.set(x,-PIT+.6,0);scene.add(g);
  const col=mesh(boxB(.85,1,.85),mConcrete,0,0,0);g.add(col);
  const cap=mesh(boxB(2.6,.4,1.7),mSlab,0,0,0);cap.visible=false;g.add(cap);
  return{g,col,cap,h:DECKY-(-PIT+.6)};
});

/* deck spans, launched left to right */
const SPANX=[-GAP,PX[0],PX[1],PX[2],PX[3],GAP];
const spans=[];
for(let i=0;i<5;i++){
  const x0=SPANX[i],x1=SPANX[i+1],w=x1-x0;
  const g=mesh(boxL(w,.5,3.6),mSlab,x0,DECKY,0,true);g.scale.x=.001;scene.add(g);
  spans.push(g);
}
const deckTotal=SPANX[5]-SPANX[0];

/* road (west half) + rail (east half), launched left to right on top of deck */
const road2=mesh(boxL(deckTotal,.12,1.55),mAsph,SPANX[0],DECKY+.5,-.85,true);road2.scale.x=.001;scene.add(road2);
const lane=mesh(new THREE.PlaneGeometry(deckTotal,.08),new THREE.MeshBasicMaterial({color:0xa88254,transparent:true,opacity:.8}));
lane.rotation.x=-Math.PI/2;lane.position.set(SPANX[0]+deckTotal/2,DECKY+.57,-.85);lane.scale.x=.001;scene.add(lane);
const ballast=mesh(boxL(deckTotal,.16,1.55),mSoil,SPANX[0],DECKY+.5,.85,true);ballast.scale.x=.001;scene.add(ballast);
const railL=mesh(boxL(deckTotal,.13,.06),mSteel,SPANX[0],DECKY+.66,.55,true);railL.scale.x=.001;scene.add(railL);
const railR=mesh(boxL(deckTotal,.13,.06),mSteel,SPANX[0],DECKY+.66,1.15,true);railR.scale.x=.001;scene.add(railR);
const N_SLEEP=26;
const sleepGeo=new THREE.BoxGeometry(.16,.12,1.5), sleepMat=M(0x4a4a4a,1);
const sleepers=new THREE.InstancedMesh(sleepGeo,sleepMat,N_SLEEP);
if(SHADOWS){sleepers.castShadow=true;sleepers.receiveShadow=true}
const sleepM=new THREE.Matrix4(),sleepV=new THREE.Vector3(),sleepQ=new THREE.Quaternion(),sleepS=new THREE.Vector3(1,1,1);
for(let i=0;i<N_SLEEP;i++){sleepM.compose(new THREE.Vector3(0,-99,0),sleepQ,sleepS);sleepers.setMatrixAt(i,sleepM)}
scene.add(sleepers);

/* entry gantry + sign */
const gantry=new THREE.Group();gantry.position.set(-GAP-1.6,0,0);scene.add(gantry);
gantry.add(mesh(boxB(.3,DECKY+1.6,.3),mSteel,0,0,-1.9,false),mesh(boxB(.3,DECKY+1.6,.3),mSteel,0,0,1.9,false));
gantry.add(mesh(boxB(.3,.3,4.1),mSteel,0,DECKY+1.5,0,false));
const logoTex=(()=>{const t=new THREE.Texture();const im=new Image();im.onload=()=>{t.image=im;t.needsUpdate=true};im.src='data:image/jpeg;base64,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';t.anisotropy=4;return t})();
const sign=new THREE.Group();sign.position.set(0,DECKY+1.9,0);gantry.add(sign);
const board=new THREE.Mesh(new THREE.PlaneGeometry(3.1,1.84),new THREE.MeshBasicMaterial({map:logoTex,side:THREE.DoubleSide}));sign.add(board);
const boardBack=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.94,.1).translate(0,0,-.06),mNavy);sign.add(boardBack);
sign.scale.setScalar(.001);

/* tower crane, on the near bank */
const crane=new THREE.Group();crane.position.set(-GAP-2.6,0,-4.4);scene.add(crane);
const MAST=15.6;
crane.add(mesh(boxB(2.6,.6,2.6),mConcrete,0,0,0));
[[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6]].forEach(p=>crane.add(mesh(boxB(.16,MAST,.16),mYellow,p[0],.6,p[1],false)));
for(let y=1.4;y<MAST;y+=1.6){crane.add(mesh(boxB(1.36,.09,.09),mYellow,0,y,-.6,false),mesh(boxB(1.36,.09,.09),mYellow,0,y,.6,false),mesh(boxB(.09,.09,1.36),mYellow,-.6,y,0,false),mesh(boxB(.09,.09,1.36),mYellow,.6,y,0,false))}
const top=new THREE.Group();top.position.y=MAST+.6;crane.add(top);
top.add(mesh(boxB(1.5,.6,1.5),mYellow,0,-.3,0,false));
top.add(mesh(boxB(.5,2.6,.5),mYellow,0,.3,0,false));
top.add(mesh(boxB(16,.34,.5),mYellow,7.6,0,0,false));
top.add(mesh(boxB(5,.34,.5),mYellow,-2.7,0,0,false));
top.add(mesh(boxB(1.6,1.3,1.0),mSteel,-4.6,-1.1,0,false));
top.add(mesh(boxB(1.1,1.1,1.1),mNavy,.9,-1.2,.85,false));
function rod(a,b){const d=new THREE.Vector3().subVectors(b,a),L=d.length();const m=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,L,5),mSteel);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m}
top.add(rod(new THREE.Vector3(0,2.9,0),new THREE.Vector3(14.5,.34,0)),rod(new THREE.Vector3(0,2.9,0),new THREE.Vector3(6.5,.34,0)),rod(new THREE.Vector3(0,2.9,0),new THREE.Vector3(-5.2,.34,0)));
const trolley=new THREE.Group();top.add(trolley);trolley.add(mesh(boxB(.9,.3,.7),mSteel,0,-.32,0,false));
const cable=mesh(new THREE.CylinderGeometry(.03,.03,1,5).translate(0,-.5,0),mSteel,0,-.3,0,false);trolley.add(cable);
const hook=new THREE.Group();trolley.add(hook);
hook.add(mesh(boxB(.5,.5,.5),mYellow,0,-.5,0,false));
const load=new THREE.Group();hook.add(load);
load.add(mesh(boxB(2.6,.42,1.2),mConcrete,-1.3,-1.55,0,false),rod(new THREE.Vector3(-.9,-.5,0),new THREE.Vector3(-.9,-1.2,0)),rod(new THREE.Vector3(.9,-.5,0),new THREE.Vector3(.9,-1.2,0)));

/* excavator, working the near bank */
const exc=new THREE.Group();exc.position.set(-GAP-3.4,0,4.6);scene.add(exc);
[-.95,.95].forEach(z=>exc.add(mesh(boxB(3.2,.6,.75),mSteel,0,0,z)));
const turret=new THREE.Group();turret.position.y=.6;exc.add(turret);
turret.add(mesh(boxB(2.4,.7,2),mYellow,0,0,0),mesh(boxB(1.2,1.0,1.0),mNavy,.4,.7,.5),mesh(boxB(1.0,.8,1.8),mSteel,-1.2,.1,0));
const boom=new THREE.Group();boom.position.set(1,.65,-.1);turret.add(boom);boom.add(mesh(new THREE.BoxGeometry(3.4,.44,.44).translate(1.7,0,0),mYellow,0,0,0));
const stick=new THREE.Group();stick.position.x=3.4;boom.add(stick);stick.add(mesh(new THREE.BoxGeometry(2.4,.34,.34).translate(1.2,0,0),mYellow,0,0,0));
const bucket=new THREE.Group();bucket.position.x=2.4;stick.add(bucket);bucket.add(mesh(new THREE.BoxGeometry(.9,.75,1.1).translate(.3,-.25,0),mSteel,0,0,0));

/* dump trucks, circling the haul road */
function truck(){
  const t=new THREE.Group();
  t.add(mesh(boxB(3.6,.35,1.6),mSteel,0,.6,0),mesh(boxB(2.4,1.0,1.7),mYellow,-.5,.95,0),mesh(boxB(1.2,1.2,1.6),mYellow,1.4,.7,0),mesh(boxB(.06,.6,1.3),mGlassDark,2.02,1.05,0,false));
  [[-1.2,.85],[-1.2,-.85],[.2,.85],[.2,-.85],[1.5,.85],[1.5,-.85]].forEach(p=>{const w=mesh(new THREE.CylinderGeometry(.5,.5,.4,12),mSteel,p[0],.5,p[1]);w.rotation.x=Math.PI/2;t.add(w)});
  scene.add(t);return t;
}
const trucks=[truck(),truck()];

/* train, crosses the completed rail line at the end */
const train=new THREE.Group();train.visible=false;scene.add(train);
[[-2.6,0],[0,0],[2.6,0]].forEach((p,i)=>{const car=mesh(boxB(2.3,.85,1.15),i===0?mNavy:M(0xd3c6b8,.6),p[0],DECKY+.86,.85);train.add(car)});
train.add(mesh(boxB(.5,.3,1.3),mGlassDark,-3.5,DECKY+1.5,.85,false));


let cur=0, aspect=1;
upd=function(p,t){
  const night=sm(seg(p,.8,1));
  sky.copy(skyDay).lerp(skyNight,night);scene.background.copy(sky);scene.fog.color.copy(sky);
  hemi.intensity=lerp(.95,.5,night);sun.intensity=lerp(1.15,.55,night);
  water.material.map.offset.x=(t*.02)%1;

  // earthwork
  heap.scale.setScalar(lerp(.08,1,sm(seg(p,0,.18))));
  const work=Math.min(p,.34), c=(work*13)%1, phase=c*Math.PI*2;
  const swing=1.95*(sm(seg(c,.3,.5))-sm(seg(c,.6,.85)));
  turret.rotation.y=p<.35?swing:0;
  boom.rotation.z=.55+.16*Math.sin(phase);
  stick.rotation.z=-1.55+.5*Math.sin(phase*2);
  bucket.rotation.z=-1+.6*Math.sin(phase*2+1);
  trucks.forEach((tk,i)=>{const th=p*9+i*Math.PI,R=16.1;tk.position.set(Math.cos(th)*R,0,Math.sin(th)*R);tk.rotation.y=Math.atan2(-Math.cos(th),-Math.sin(th))});

  // footings
  const rbWin=seg(p,.15,.29);footRebar.visible=rbWin>0&&rbWin<1;
  foots.children.forEach((f,i)=>{const s=.17+i*.022,fc=sm(seg(p,s,s+.05));f.scale.y=Math.max(fc,.001);f.visible=fc>0});

  // piers rise
  let pierTop=0;
  piers.forEach((pr,i)=>{
    const s=.29+i*.045, pc=sm(seg(p,s,s+.14));
    pr.col.scale.y=Math.max(pc,.001);pr.col.visible=pc>0;
    pr.cap.visible=pc>.9;
    pierTop=Math.max(pierTop,pc);
  });

  // deck spans launched left to right
  let deckDone=0;
  spans.forEach((g,i)=>{
    const s=.57+i*.042, dc=sm(seg(p,s,s+.09));
    g.scale.x=Math.max(dc,.001);
    deckDone=Math.max(deckDone,dc*.2+i*.2);
  });

  // road + rail overlay, launched left to right
  const ov=sm(seg(p,.79,.905));
  [road2,lane,ballast,railL,railR].forEach(m=>m.scale.x=Math.max(ov,.001));
  const revealCount=Math.floor(ov*N_SLEEP);
  for(let i=0;i<N_SLEEP;i++){
    const sx=SPANX[0]+(i+.5)*(deckTotal/N_SLEEP), show=i<revealCount;
    sleepM.compose(show?sleepV.set(sx,DECKY+.62,.85):sleepV.set(0,-99,0),sleepQ,sleepS);
    sleepers.setMatrixAt(i,sleepM);
  }
  sleepers.instanceMatrix.needsUpdate=true;

  // gantry sign + crossing train
  const gs=sm(seg(p,.905,.97));sign.scale.setScalar(Math.max(gs,.001));
  const trp=seg(p,.945,1.01);train.visible=trp>0&&trp<1;
  if(train.visible)train.position.set(lerp(-GAP+2,GAP-2,trp),0,0);

  // crane
  const base=Math.atan2(4.4,GAP+2.6);
  const settle=sm(seg(p,.86,1));
  top.rotation.y=base+Math.sin(p*24)*.5*(1-settle);
  const tx=lerp(4,13.5,.5+.5*Math.sin(p*30));trolley.position.set(tx,0,0);
  const focus=clamp(seg(p,.17,.86));
  const hy=clamp(lerp(2.2,DECKY+2.4,focus)+Math.sin(p*66)*.22,2.2,DECKY+2.6);
  const hl=(MAST+.6)-hy;cable.scale.y=Math.max(hl-.3,.1);hook.position.y=-Math.max(hl-.3,.1)+.3;
  load.visible=p>.28&&p<.9;

  // camera
  const e=ease(p), fit=aspect<1?1+(1-aspect)*.65:1;
  const az=lerp(-.85,.32,e)+Math.sin(t*.35)*.015;
  const lookX=lerp(-5.5,0,e);
  const r=lerp(45,40,e)*fit, h=lerp(24,16.5,e)*(aspect<1?1.1:1);
  camera.position.set(lookX+Math.sin(az)*r,h,Math.cos(az)*r);
  camera.lookAt(lookX,lerp(1.4,4.6,sm(seg(p,.2,.9))),0);
}

function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,isSmall()?1.5:2));
  renderer.setSize(w,h,false);aspect=w/h;camera.aspect=aspect;camera.fov=aspect<1?48:36;
  if(aspect>=1.15){camera.setViewOffset(w,h,-w*.14,h*.02,w,h)}else{camera.setViewOffset(w,h,0,h*.13,w,h)}
  camera.updateProjectionMatrix();
}
resize();addEventListener('resize',resize);
if(window.ResizeObserver)new ResizeObserver(resize).observe(stage);

function targetProgress(){
  const span=build_.offsetHeight-stage.offsetHeight;
  return span>0?clamp(-build_.getBoundingClientRect().top/span):0;
}
function ui(p){
  caps.forEach(c=>{const on=p>=+c.dataset.a&&p<+c.dataset.b;if(c.classList.contains('on')!==on){c.classList.toggle('on',on);c.setAttribute('aria-hidden',!on)}});
  let name='Earthwork';STAGES.forEach(s=>{if(p>=s[0])name=s[2]});
  if(name==='Piers'){const lv=clamp(Math.ceil((p-.29)/.045+.001),1,4);name='Piers · '+lv+' of 4'}
  if(name==='Deck launch'){const lv=clamp(Math.ceil((p-.57)/.042+.001),1,5);name='Deck launch · span '+lv+' of 5'}
  hudStage.textContent=name;hudPct.textContent=Math.round(p*100)+'%';hudBar.style.width=(p*100)+'%';
  cue.style.opacity=p<.02?1:0;
}

let visible=true;
new IntersectionObserver(es=>{visible=es[0].isIntersecting},{rootMargin:'120px'}).observe(build_);
if(reduce){
  document.body.classList.add('still');
  cur=.97;upd(cur,0);renderer.render(scene,camera);ui(0);
  addEventListener('resize',()=>{upd(cur,0);renderer.render(scene,camera)});
  caps.forEach((c,i)=>c.classList.toggle('on',i===0));
}else{
  cur=targetProgress();
  (function loop(now){
    requestAnimationFrame(loop);
    if(!visible||document.hidden)return;
    const dt=Math.min(.05,(now-lastT)/1000||.016);lastT=now;
    const tp=targetProgress();cur+=(tp-cur)*(1-Math.exp(-dt*4));if(Math.abs(tp-cur)<.0004)cur=tp;
    upd(cur,now/1000);ui(cur);renderer.render(scene,camera);
  })(performance.now());
}
})();
