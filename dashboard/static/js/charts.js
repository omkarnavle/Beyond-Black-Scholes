// charts.js — ResizeObserver-based canvas charts
const C={
  forest:"#1C2B1A",f2:"#1E3320",
  gold:"#B8975A",gl:"#D6C18B",
  card:"#FDFAF5",
  il:"#6B6257",im:"#3D3530",
  border:"#D8CCB5",borderL:"#EAE2D5",
  chart:["#1C2B1A","#B8975A","#6B5B3E","#4A7A47"],
  fb:"Inter,Arial,sans-serif",
  fm:"'JetBrains Mono','Courier New',monospace",
};

// Registry: id → {fn, args}
const registry = {};

function drawCanvas(id){
  const entry = registry[id];
  if(!entry) return;
  entry.fn(id, ...entry.args);
}

// Observe every canvas and redraw when its container resizes
const ro = new ResizeObserver(entries=>{
  entries.forEach(e=>{
    const canvas = e.target.querySelector("canvas[data-cid]");
    if(canvas) drawCanvas(canvas.dataset.cid);
  });
});

function getSize(id){
  const el = document.getElementById(id);
  if(!el) return null;
  // Walk up to find a sized ancestor
  let node = el.parentElement;
  for(let i=0;i<4;i++){
    if(!node) break;
    const w = node.getBoundingClientRect().width;
    const h = node.getBoundingClientRect().height;
    if(w>10 && h>10) return {el, w, h};
    node = node.parentElement;
  }
  return {el, w: el.parentElement?.offsetWidth||500, h: el.parentElement?.offsetHeight||300};
}

function render(id){
  const info = getSize(id);
  if(!info) return;
  const {el,w,h} = info;
  const d = window.devicePixelRatio||1;
  if(el.width !== Math.round(w*d) || el.height !== Math.round(h*d)){
    el.width  = Math.round(w*d);
    el.height = Math.round(h*d);
    el.style.width  = w+"px";
    el.style.height = h+"px";
  }
  const ctx = el.getContext("2d");
  ctx.setTransform(d,0,0,d,0,0);
  return {ctx,w,h};
}

function grid(ctx,l,t,r,b,n=5){
  ctx.save();
  ctx.strokeStyle="rgba(184,151,90,0.15)";
  ctx.lineWidth=0.5; ctx.setLineDash([3,3]);
  for(let i=0;i<=n;i++){
    const y=t+(b-t)*(i/n);
    ctx.beginPath();ctx.moveTo(l,y);ctx.lineTo(r,y);ctx.stroke();
  }
  ctx.setLineDash([]);ctx.restore();
}

// ── Bar chart ─────────────────────────────────────────────────
function _bar(id,labels,values,opts){
  const s=render(id); if(!s) return;
  const {ctx,w,h}=s;
  const p={t:32,r:16,b:44,l:62};
  const cw=w-p.l-p.r, ch=h-p.t-p.b;
  const n=values.length, max=Math.max(...values)*1.12;

  ctx.fillStyle=C.card; ctx.fillRect(0,0,w,h);
  ctx.fillStyle=C.card; ctx.fillRect(p.l,p.t,cw,ch);
  grid(ctx,p.l,p.t,p.l+cw,p.t+ch,6);

  ctx.fillStyle=C.il; ctx.font=`11px ${C.fm}`; ctx.textAlign="right";
  for(let i=0;i<=5;i++){
    const v=max*(1-i/5), y=p.t+ch*(i/5);
    const lbl=v>=10000?(v/1000).toFixed(0)+"k":v>=100?Math.round(v).toString():v.toFixed(1);
    ctx.fillText(lbl,p.l-7,y+4);
  }

  const bw=(cw/n)*0.58, gap=(cw/n)*0.42;
  values.forEach((v,i)=>{
    const x=p.l+(cw/n)*i+gap/2;
    const bh=Math.max(ch*(v/max),2), y=p.t+ch-bh;
    const gold=(opts.lastGold&&i===values.length-1)||i===opts.highlight;
    ctx.fillStyle=gold?C.gold:(opts.color||C.f2);
    ctx.fillRect(x,y,bw,bh);
    ctx.fillStyle=C.il; ctx.font=`10px ${C.fm}`; ctx.textAlign="center";
    const lbl=v>=1000?Math.round(v).toLocaleString():v.toFixed(opts.vDec??4);
    ctx.fillText(lbl,x+bw/2,y-5);
    ctx.fillStyle=C.il; ctx.font=`11px ${C.fb}`;
    ctx.fillText(labels[i],x+bw/2,p.t+ch+22);
  });

  ctx.strokeStyle=C.border; ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(p.l,p.t);ctx.lineTo(p.l,p.t+ch);ctx.lineTo(p.l+cw,p.t+ch);ctx.stroke();
}
window.drawBarChart=function(id,labels,values,opts={}){
  registry[id]={fn:_bar,args:[labels,values,opts]};
  // observe parent
  const el=document.getElementById(id);
  if(el?.parentElement) ro.observe(el.parentElement);
  _bar(id,labels,values,opts);
};

// ── Line chart ────────────────────────────────────────────────
function _line(id,data,color,opts){
  const s=render(id); if(!s) return;
  const {ctx,w,h}=s;
  const p={t:14,r:12,b:26,l:46};
  const cw=w-p.l-p.r, ch=h-p.t-p.b;
  const mx=Math.max(...data), mn=Math.min(...data);
  const rng=(mx-mn)||mx*0.1||1;
  const max=mx+rng*0.18, min=mn-rng*0.18;

  ctx.fillStyle=C.card; ctx.fillRect(0,0,w,h);
  ctx.fillStyle=C.card; ctx.fillRect(p.l,p.t,cw,ch);
  grid(ctx,p.l,p.t,p.l+cw,p.t+ch,3);

  ctx.fillStyle=C.il; ctx.font=`10px ${C.fm}`; ctx.textAlign="right";
  for(let i=0;i<=3;i++){
    const v=min+(max-min)*(1-i/3),y=p.t+ch*(i/3);
    ctx.fillText(v.toFixed(1),p.l-5,y+4);
  }
  ["L1","L2","L3"].forEach((l,i)=>{
    ctx.fillStyle=C.il; ctx.font=`11px ${C.fb}`; ctx.textAlign="center";
    ctx.fillText(l,p.l+(cw/2)*i,p.t+ch+18);
  });

  const pts=data.map((v,i)=>({x:p.l+(cw/2)*i,y:p.t+ch-ch*(v-min)/(max-min)}));
  ctx.beginPath();
  pts.forEach((pt,i)=>i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y));
  ctx.lineTo(pts[2].x,p.t+ch);ctx.lineTo(pts[0].x,p.t+ch);ctx.closePath();
  ctx.fillStyle=color+"18";ctx.fill();

  ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.lineJoin="round";
  ctx.beginPath();pts.forEach((pt,i)=>i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y));ctx.stroke();
  pts.forEach(pt=>{
    ctx.beginPath();ctx.arc(pt.x,pt.y,5,0,Math.PI*2);
    ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=C.card;ctx.lineWidth=2;ctx.stroke();
  });
  ctx.strokeStyle=C.border;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(p.l,p.t);ctx.lineTo(p.l,p.t+ch);ctx.lineTo(p.l+cw,p.t+ch);ctx.stroke();
}
window.drawLineChart=function(id,data,color,opts={}){
  registry[id]={fn:_line,args:[data,color,opts]};
  const el=document.getElementById(id);
  if(el?.parentElement) ro.observe(el.parentElement);
  _line(id,data,color,opts);
};

// ── Scatter ───────────────────────────────────────────────────
function _scatter(id,xVals,yVals){
  const s=render(id); if(!s) return;
  const {ctx,w,h}=s;
  const p={t:12,r:14,b:30,l:48};
  const cw=w-p.l-p.r,ch=h-p.t-p.b;
  const xMx=Math.max(...xVals)*1.03,xMn=Math.min(...xVals)*0.97;
  const yA=Math.max(Math.abs(Math.max(...yVals)),Math.abs(Math.min(...yVals)))*1.5||1;
  ctx.fillStyle=C.card;ctx.fillRect(0,0,w,h);
  ctx.fillStyle=C.card;ctx.fillRect(p.l,p.t,cw,ch);
  grid(ctx,p.l,p.t,p.l+cw,p.t+ch);
  const y0=p.t+ch/2;
  ctx.strokeStyle=C.gold;ctx.lineWidth=1;ctx.setLineDash([5,4]);
  ctx.beginPath();ctx.moveTo(p.l,y0);ctx.lineTo(p.l+cw,y0);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=C.il;ctx.font=`11px ${C.fb}`;ctx.textAlign="center";
  ctx.fillText("Fitted Values",p.l+cw/2,h-6);
  xVals.forEach((xv,i)=>{
    const x=p.l+cw*(xv-xMn)/(xMx-xMn);
    const y=p.t+ch*(1-(yVals[i]+yA)/(2*yA));
    ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);
    ctx.fillStyle=C.f2;ctx.globalAlpha=0.8;ctx.fill();ctx.globalAlpha=1;
    ctx.strokeStyle=C.card;ctx.lineWidth=1.5;ctx.stroke();
  });
  ctx.strokeStyle=C.border;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(p.l,p.t);ctx.lineTo(p.l,p.t+ch);ctx.lineTo(p.l+cw,p.t+ch);ctx.stroke();
}
window.drawScatter=function(id,xVals,yVals){
  registry[id]={fn:_scatter,args:[xVals,yVals]};
  const el=document.getElementById(id);
  if(el?.parentElement) ro.observe(el.parentElement);
  _scatter(id,xVals,yVals);
};

// ── Horizontal bar ────────────────────────────────────────────
function _hbar(id,labels,values){
  const s=render(id); if(!s) return;
  const {ctx,w,h}=s;
  const p={t:10,r:62,b:10,l:44};
  const cw=w-p.l-p.r,n=labels.length;
  const bh=Math.min(28,(h-p.t-p.b)/n-8);
  const gap=((h-p.t-p.b)-n*bh)/(n+1);
  const max=Math.max(...values);
  const cols=[C.forest,"#4A7A47","#6B5B3E",C.gold];
  ctx.fillStyle=C.card;ctx.fillRect(0,0,w,h);
  labels.forEach((lbl,i)=>{
    const y=p.t+gap*(i+1)+bh*i,bw=cw*(values[i]/max);
    ctx.fillStyle=cols[i]||C.f2;ctx.fillRect(p.l,y,bw,bh);
    ctx.fillStyle=C.il;ctx.font=`11px ${C.fb}`;
    ctx.textAlign="right";ctx.textBaseline="middle";
    ctx.fillText(lbl,p.l-6,y+bh/2);
    ctx.fillStyle=C.il;ctx.font=`11px ${C.fm}`;ctx.textAlign="left";
    ctx.fillText(values[i].toFixed(2)+"%",p.l+bw+6,y+bh/2);
  });
  ctx.textBaseline="alphabetic";
}
window.drawHorizBar=function(id,labels,values){
  registry[id]={fn:_hbar,args:[labels,values]};
  const el=document.getElementById(id);
  if(el?.parentElement) ro.observe(el.parentElement);
  _hbar(id,labels,values);
};

// Redraw all on window resize
window.addEventListener("resize",()=>{
  Object.keys(registry).forEach(id=>drawCanvas(id));
});
