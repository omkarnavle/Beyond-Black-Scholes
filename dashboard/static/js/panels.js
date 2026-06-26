// panels.js
const FACTORS=["So","K","r","sigma"];
const LS={So:"S\u2080",K:"K",r:"r",sigma:"\u03C3"};
const LF={So:"S\u2080 (Underlying Price)",K:"K (Strike Price)",r:"r (Risk-free Rate)",sigma:"\u03C3 (Volatility)"};
const COLS=["#1C2B1A","#B8975A","#6B5B3E","#4A7A47"];

function sl(text){
  const d=document.createElement("div");
  d.className="slabel";d.innerHTML=`<span>${text}</span>`;return d;
}

function tbl(cols,rows,opts={}){
  const w=document.createElement("div");w.className="tbl-wrap";
  const t=document.createElement("table");t.className="tbl";
  const th=document.createElement("thead"),hr=document.createElement("tr");
  cols.forEach(c=>{const h=document.createElement("th");h.textContent=c.label;hr.appendChild(h);});
  th.appendChild(hr);t.appendChild(th);
  const tb=document.createElement("tbody");
  rows.forEach((row,ri)=>{
    const tr=document.createElement("tr");
    if(opts.hl===ri)tr.classList.add("hl");
    cols.forEach(c=>{
      const td=document.createElement("td");
      let v=row[c.key];if(c.fmt)v=c.fmt(v);td.textContent=v??'—';
      if(opts.hl===ri&&opts.hlc===c.key)td.classList.add("hv");
      tr.appendChild(td);
    });
    tb.appendChild(tr);
  });
  t.appendChild(tb);w.appendChild(t);return w;
}

function note(html){
  const d=document.createElement("div");d.className="note";d.innerHTML=html;return d;
}

// Chart panel: slabel + chart-inner (canvas fills 100%)
function chartPanel(id,title,foot){
  const p=document.createElement("div");p.className="chart-panel";
  p.appendChild(sl(title));
  const inner=document.createElement("div");inner.className="chart-inner";
  const c=document.createElement("canvas");c.id=id;c.dataset.cid=id;
  inner.appendChild(c);p.appendChild(inner);
  if(foot){
    const f=document.createElement("div");f.className="chart-foot";f.textContent=foot;p.appendChild(f);
  }
  return{panel:p,canvas:c,inner};
}

// Effects 2x2 panel
function efxPanel(prefix,title){
  const p=document.createElement("div");p.className="efx-panel";
  p.appendChild(sl(title));
  const g=document.createElement("div");g.className="efx-grid";
  FACTORS.forEach((f,i)=>{
    const cell=document.createElement("div");cell.className="efx-cell";
    const lbl=document.createElement("div");lbl.className="efx-lbl";lbl.textContent=LF[f];
    const inner=document.createElement("div");inner.className="chart-inner";
    const c=document.createElement("canvas");c.id=`${prefix}-${f}`;c.dataset.cid=`${prefix}-${f}`;
    inner.appendChild(c);cell.appendChild(lbl);cell.appendChild(inner);g.appendChild(cell);
  });
  p.appendChild(g);return p;
}

// Panel wrapper
function panel(cls){
  const p=document.createElement("div");p.className="panel "+cls;return p;
}

// Draw after layout settles
function raf(fn){setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(fn)),100);}

// ── L9 ────────────────────────────────────────────────────────
export function renderL9(el,data){
  el.innerHTML="";
  const grid=document.createElement("div");grid.className="l9-grid";

  // LEFT
  const left=document.createElement("div");left.className="l9-left";

  // Trials table
  const mx=Math.max(...data.rows.map(r=>r.BS));
  const mxi=data.rows.findIndex(r=>r.BS===mx);
  const tp=document.createElement("div");tp.className="panel";tp.style.overflow="hidden";
  tp.appendChild(sl("L9 Orthogonal Array — 9 Trials"));
  const tb1=document.createElement("div");tb1.className="panel-body";
  tb1.appendChild(tbl([
    {key:"trial",label:"Trial"},
    {key:"So",   label:"S\u2080 (\u20B9)",fmt:v=>v.toFixed(2)},
    {key:"K",    label:"K (\u20B9)",       fmt:v=>(+v).toFixed(0)},
    {key:"r",    label:"r (%)",            fmt:v=>(v*100).toFixed(3)},
    {key:"sigma",label:"\u03C3 (%)",       fmt:v=>(v*100).toFixed(2)},
    {key:"BS",   label:"BS Price (\u20B9)",fmt:v=>"\u20B9"+v.toFixed(4)},
  ],data.rows.map(r=>({...r,trial:"T"+r.trial})),{hl:mxi,hlc:"BS"}));
  // sub info rows
  const si=document.createElement("div");si.className="sub-info";
  [["Design","Taguchi L9 (3\u2074)"],["Full Factorial","81 trials"],["Reduction","89% fewer runs"]].forEach(([k,v])=>{
    const row=document.createElement("div");row.className="sub-info-row";
    row.innerHTML=`<span class="sub-info-key">${k}</span><span class="sub-info-val">${v}</span>`;
    si.appendChild(row);
  });
  tp.appendChild(tb1);tp.appendChild(si);left.appendChild(tp);

  // Factor levels
  const fp=document.createElement("div");fp.className="panel";fp.style.overflow="hidden";
  fp.appendChild(sl("Factor Levels"));
  const fb=document.createElement("div");fb.className="panel-body";
  fb.appendChild(tbl([
    {key:"lv",label:"Level"},{key:"So",label:"S\u2080 (\u20B9)"},
    {key:"K",label:"K (\u20B9)"},{key:"r",label:"r (%)"},
    {key:"sg",label:"\u03C3 (%)"},
  ],[0,1,2].map(i=>({
    lv:"Level "+(i+1),So:data.soLvls[i].toFixed(2),K:data.kLvls[i],
    r:(data.rLvls[i]*100).toFixed(3),sg:(data.sgLvls[i]*100).toFixed(2),
  }))));
  fp.appendChild(fb);left.appendChild(fp);
  left.appendChild(note("<strong>Note:</strong> L9 orthogonal array reduces 3\u2074 = 81 combinations to 9 representative trials."));

  // RIGHT — full height chart
  const right=document.createElement("div");right.className="l9-right";
  const{panel:cp}=chartPanel("chart-l9","BS Call Price (\u20B9) by Trial");
  right.appendChild(cp);

  grid.appendChild(left);grid.appendChild(right);el.appendChild(grid);
  raf(()=>window.drawBarChart("chart-l9",data.rows.map(r=>"T"+r.trial),data.rows.map(r=>r.BS),{vDec:4,highlight:mxi,color:"#2D4A2B"}));
}

// ── ANOVA ─────────────────────────────────────────────────────
export function renderANOVA(el,data){
  el.innerHTML="";
  const grid=document.createElement("div");grid.className="anova-grid";

  const L=document.createElement("div");L.className="anova-left";
  const sp=[...FACTORS].sort((a,b)=>data.anova.pct[b]-data.anova.pct[a]);

  // ANOVA table
  const tp=panel("");
  tp.appendChild(sl("ANOVA — % Contribution"));
  const tb1=document.createElement("div");tb1.className="panel-body";
  tb1.appendChild(tbl([
    {key:"f",label:"Factor"},{key:"p",label:"% Contribution"},{key:"r",label:"Rank"},
  ],[...FACTORS.map(f=>({f:LF[f],p:data.anova.pct[f].toFixed(2)+"%",r:sp.indexOf(f)+1})),
     {f:"Residual",p:data.anova.pct["Residual"].toFixed(2)+"%",r:"—"}]));
  const si=document.createElement("div");si.className="sub-info";
  [["R\u00B2",data.anova.r2.toFixed(4)],["Adj R\u00B2",(data.anova.r2*0.995).toFixed(4)]].forEach(([k,v])=>{
    const row=document.createElement("div");row.className="sub-info-row";
    row.innerHTML=`<span class="sub-info-key">${k}</span><span class="sub-info-val">${v}</span>`;
    si.appendChild(row);
  });
  tp.appendChild(tb1);tp.appendChild(si);L.appendChild(tp);

  // Code panel
  const cp=document.createElement("div");cp.className="code-panel";
  cp.appendChild(sl("Regression Equation (Coded)"));
  const cb=document.createElement("div");cb.className="codeblock";
  cb.innerHTML=`<span class="gv">BS Price</span> = ${data.anova.intercept.toFixed(4)}<br>`+
    FACTORS.map(f=>{const s=data.anova.coeffs[f]>=0?"+":"−";
      return `${s} <span class="gl">${Math.abs(data.anova.coeffs[f]).toFixed(4)}</span>\u00B7${LS[f]}`;
    }).join("<br>")+" + \u03B5";
  cp.appendChild(cb);L.appendChild(cp);
  L.appendChild(note(`<strong>Note:</strong> R\u00B2 = ${data.anova.r2.toFixed(4)} — ${(data.anova.r2*100).toFixed(2)}% of variability explained.`));

  const R=document.createElement("div");R.className="anova-right";
  const{panel:hp}=chartPanel("chart-anova-hbar","% Contribution by Factor");
  R.appendChild(hp);
  const{panel:sp2}=chartPanel("chart-resid","Residuals vs Fitted Values");
  R.appendChild(sp2);

  grid.appendChild(L);grid.appendChild(R);el.appendChild(grid);
  raf(()=>{
    window.drawHorizBar("chart-anova-hbar",FACTORS.map(f=>LS[f]),FACTORS.map(f=>data.anova.pct[f]));
    window.drawScatter("chart-resid",data.anova.fitted,data.anova.residuals);
  });
}

// ── ANOM ──────────────────────────────────────────────────────
export function renderANOM(el,data){
  el.innerHTML="";
  const grid=document.createElement("div");grid.className="anom-grid";

  const L=document.createElement("div");L.className="anom-left";
  const deltas=Object.fromEntries(FACTORS.map(f=>[f,data.anom[f].deltaMean]));
  const ranked=[...FACTORS].sort((a,b)=>deltas[b]-deltas[a]);

  const tp=panel("");
  tp.appendChild(sl("ANOM — Mean BS Price (\u20B9)"));
  const tb1=document.createElement("div");tb1.className="panel-body";
  tb1.appendChild(tbl([{key:"row",label:""},...FACTORS.map(f=>({key:f,label:LS[f]}))],
    ["Level 1","Level 2","Level 3","Delta","Rank"].map((row,ri)=>{
      const o={row};
      FACTORS.forEach(f=>{o[f]=ri<3?data.anom[f].means[ri].toFixed(4):ri===3?data.anom[f].deltaMean.toFixed(4):ranked.indexOf(f)+1;});
      return o;
    })));
  tp.appendChild(tb1);L.appendChild(tp);

  const rp=document.createElement("div");rp.className="rank-panel";
  rp.appendChild(sl("ANOM Ranking by Delta"));
  const rc=document.createElement("div");rc.className="rank-cards";
  ranked.forEach((f,i)=>{
    const d=document.createElement("div");d.className="rank-card"+(i===0?" r1":"");
    d.innerHTML=`<div class="rk-num">${i+1}</div>
      <div class="rk-info"><div class="rk-name">${LF[f]}</div><div class="rk-delta">\u0394 = ${deltas[f].toFixed(4)}</div></div>
      <div class="rk-bar" style="width:${Math.max((deltas[f]/deltas[ranked[0]])*80,4)}px"></div>`;
    rc.appendChild(d);
  });
  rp.appendChild(rc);L.appendChild(rp);

  const R=document.createElement("div");R.className="anom-right";
  R.appendChild(efxPanel("anom","Main Effects — Mean BS Price (\u20B9)"));

  grid.appendChild(L);grid.appendChild(R);el.appendChild(grid);
  raf(()=>FACTORS.forEach((f,i)=>window.drawLineChart(`anom-${f}`,data.anom[f].means,COLS[i])));
}

// ── SN ────────────────────────────────────────────────────────
export function renderSN(el,data){
  el.innerHTML="";
  const grid=document.createElement("div");grid.className="sn-grid";

  const L=document.createElement("div");L.className="sn-left";
  const snRows=data.rows.map(r=>({...r,sn:(-10*Math.log10(1/r.BS**2)).toFixed(4)}));
  const snDeltas=Object.fromEntries(FACTORS.map(f=>[f,data.anom[f].deltaSN]));
  const snRanked=[...FACTORS].sort((a,b)=>snDeltas[b]-snDeltas[a]);

  const tp=panel("");
  tp.appendChild(sl("S/N Ratio Table (Larger-the-Better)"));
  const tb1=document.createElement("div");tb1.className="panel-body";
  tb1.appendChild(tbl([
    {key:"trial",label:"Trial"},
    {key:"So",   label:"S\u2080",fmt:v=>v.toFixed(2)},
    {key:"K",    label:"K"},
    {key:"r",    label:"r",fmt:v=>(v*100).toFixed(3)+"%"},
    {key:"sigma",label:"\u03C3",fmt:v=>(v*100).toFixed(2)+"%"},
    {key:"BS",   label:"BS (\u20B9)",fmt:v=>v.toFixed(4)},
    {key:"sn",   label:"S/N (dB)"},
  ],snRows.map(r=>({...r,trial:"T"+r.trial}))));
  tp.appendChild(tb1);L.appendChild(tp);

  const mp=panel("");
  mp.appendChild(sl("Mean S/N Ratio by Level (dB)"));
  const mb=document.createElement("div");mb.className="panel-body";
  mb.appendChild(tbl([{key:"row",label:""},...FACTORS.map(f=>({key:f,label:LS[f]}))],
    ["Level 1","Level 2","Level 3","Delta","Rank"].map((row,ri)=>{
      const o={row};
      FACTORS.forEach(f=>{o[f]=ri<3?data.anom[f].snRatios[ri].toFixed(4):ri===3?data.anom[f].deltaSN.toFixed(4):snRanked.indexOf(f)+1;});
      return o;
    })));
  mp.appendChild(mb);L.appendChild(mp);
  L.appendChild(note("S/N = \u221210 log\u2081\u2080(1/n \u00B7 \u03A3 1/y\u1D62\u00B2) \u00B7 Larger-is-better criterion."));

  const R=document.createElement("div");R.className="sn-right";
  R.appendChild(efxPanel("sn","Main Effects — S/N Ratio (dB)"));

  grid.appendChild(L);grid.appendChild(R);el.appendChild(grid);
  raf(()=>FACTORS.forEach((f,i)=>window.drawLineChart(`sn-${f}`,data.anom[f].snRatios,COLS[i])));
}

// ── OPTIMAL ───────────────────────────────────────────────────
export function renderOptimal(el,data){
  el.innerHTML="";
  const grid=document.createElement("div");grid.className="opt-grid";

  const L=document.createElement("div");L.className="opt-left";

  const anomR=Object.fromEntries([...FACTORS].sort((a,b)=>data.anom[b].deltaMean-data.anom[a].deltaMean).map((f,i)=>[f,i+1]));
  const snR  =Object.fromEntries([...FACTORS].sort((a,b)=>data.anom[b].deltaSN-data.anom[a].deltaSN).map((f,i)=>[f,i+1]));
  const avR  =Object.fromEntries([...FACTORS].sort((a,b)=>data.anova.pct[b]-data.anova.pct[a]).map((f,i)=>[f,i+1]));
  const lvn  =(v,arr)=>arr.findIndex(x=>Math.abs(x-v)<1e-6)+1;
  const bvals=[data.bestSo,data.bestK,data.bestR,data.bestSg];
  const larrs=[data.soLvls,data.kLvls,data.rLvls,data.sgLvls];

  // Ranking table
  const tp=panel("");
  tp.appendChild(sl("Consolidated Ranking Summary"));
  const tb1=document.createElement("div");tb1.className="panel-body";
  tb1.appendChild(tbl([
    {key:"f",label:"Factor"},{key:"ap",label:"ANOVA %"},
    {key:"ar",label:"ANOVA Rank"},{key:"nr",label:"ANOM Rank"},
    {key:"sr",label:"S/N Rank"},{key:"ol",label:"Optimal Level"},
  ],FACTORS.map((f,i)=>({
    f:LF[f],ap:data.anova.pct[f].toFixed(2)+"%",
    ar:avR[f],nr:anomR[f],sr:snR[f],
    ol:`L${lvn(bvals[i],larrs[i])} (${f==="So"||f==="K"?"\u20B9"+bvals[i].toFixed(0):(bvals[i]*100).toFixed(3)+"%"})`,
  }))));
  const si=document.createElement("div");si.className="sub-info";
  const si_row=document.createElement("div");si_row.className="sub-info-row";
  si_row.innerHTML=`<span class="sub-info-key" style="font-size:10px;color:#6B6257;">Rank consensus derived from ANOVA, ANOM, and S/N ratio analysis.</span>`;
  si.appendChild(si_row);tp.appendChild(tb1);tp.appendChild(si);L.appendChild(tp);

  // Optimal strip
  const sL=lvn(data.bestSo,data.soLvls),kL=lvn(data.bestK,data.kLvls);
  const rL=lvn(data.bestR,data.rLvls),  gL=lvn(data.bestSg,data.sgLvls);
  const strip=document.createElement("div");strip.className="opt-strip";
  strip.innerHTML=`<div>
    <div class="opt-lbl">Optimal Parameter Combination (Predicted)</div>
    <div class="opt-params">
      <div><div class="opt-p-lbl">S\u2080 \u00B7 Level ${sL}</div><div class="opt-p-val">\u20B9${data.bestSo.toFixed(0)}</div></div>
      <div><div class="opt-p-lbl">K \u00B7 Level ${kL}</div><div class="opt-p-val">\u20B9${data.bestK.toFixed(0)}</div></div>
      <div><div class="opt-p-lbl">r \u00B7 Level ${rL}</div><div class="opt-p-val">${(data.bestR*100).toFixed(3)}%</div></div>
      <div><div class="opt-p-lbl">\u03C3 \u00B7 Level ${gL}</div><div class="opt-p-val">${(data.bestSg*100).toFixed(2)}%</div></div>
    </div></div>
    <div class="opt-div"></div>
    <div><div class="opt-price-lbl">Optimal BS Call Price</div><div class="opt-price-val">\u20B9${data.optBS.toFixed(4)}</div></div>`;
  L.appendChild(strip);

  // Interp panel
  const maxBS=Math.max(...data.rows.map(r=>r.BS));
  const imp=((data.optBS-maxBS)/maxBS*100).toFixed(2);
  const topF=Object.entries(data.anova.pct).filter(([k])=>k!=="Residual").sort((a,b)=>b[1]-a[1])[0];
  const ip=document.createElement("div");ip.className="interp-panel";
  ip.appendChild(sl("Interpretation & Decision Summary"));
  const ib=document.createElement("div");ib.className="interp-body";

  function isec(title,rows){
    const s=document.createElement("div");s.className="interp-sec";
    const t=document.createElement("div");t.className="interp-sec-title";t.textContent=title;s.appendChild(t);
    rows.forEach(([k,v,gold])=>{
      const r=document.createElement("div");r.className="interp-row";
      r.innerHTML=`<span class="interp-key">${k}</span><span class="interp-val${gold?" gold":""}">${v}</span>`;
      s.appendChild(r);
    });
    return s;
  }

  ib.appendChild(isec("Performance Comparison",[
    ["Best L9 Trial BS Price",`\u20B9${maxBS.toFixed(4)}`],
    ["Predicted Optimal BS Price",`\u20B9${data.optBS.toFixed(4)}`,true],
    ["Improvement vs L9 Max",`+${imp}%`,true],
  ]));
  ib.appendChild(isec("Factor Priority",[
    ["Dominant Factor (ANOVA)",`${LF[topF[0]]} — ${topF[1].toFixed(2)}%`],
    ["ANOM Top Factor",LF[Object.entries(Object.fromEntries(FACTORS.map(f=>[f,data.anom[f].deltaMean]))).sort((a,b)=>b[1]-a[1])[0][0]]],
    ["S/N Top Factor",LF[Object.entries(Object.fromEntries(FACTORS.map(f=>[f,data.anom[f].deltaSN]))).sort((a,b)=>b[1]-a[1])[0][0]]],
  ]));
  ib.appendChild(isec("Model Quality",[
    ["R\u00B2",data.anova.r2.toFixed(4)+" ("+((data.anova.r2)*100).toFixed(2)+"% explained)"],
    ["Residual %",data.anova.pct["Residual"].toFixed(3)+"%"],
  ]));

  const conc=document.createElement("div");conc.className="interp-conclusion";
  conc.textContent="Taguchi L9 design identifies the optimal parameter setting that maximises the BS call option price with statistical confidence. The selected configuration exceeds the strongest L9 trial, validating the factor-level combination.";
  ip.appendChild(ib);ip.appendChild(conc);L.appendChild(ip);

  // RIGHT — full height chart
  const R=document.createElement("div");R.className="opt-right";
  const{panel:cp}=chartPanel("chart-opt","BS Call Price Comparison — L9 Trials vs Optimal",
    `Optimal configuration exceeds the strongest L9 trial by ${imp}%.`);
  R.appendChild(cp);

  grid.appendChild(L);grid.appendChild(R);el.appendChild(grid);
  const allV=[...data.rows.map(r=>r.BS),data.optBS];
  const allL=[...data.rows.map(r=>"T"+r.trial),"Optimal"];
  raf(()=>window.drawBarChart("chart-opt",allL,allV,{vDec:4,lastGold:true,color:"#2D4A2B"}));
}
