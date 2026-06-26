// ui.js
export function el(id){return document.getElementById(id);}
export function qs(s){return document.querySelector(s);}
export function qsa(s){return document.querySelectorAll(s);}

export function animNum(el,to,dec=2,pre="",suf="",dur=800){
  const t0=performance.now();
  const step=now=>{
    const p=Math.min((now-t0)/dur,1),e=1-Math.pow(1-p,3);
    el.textContent=pre+(to*e).toFixed(dec)+suf;
    if(p<1)requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function setMetrics(data){
  const mx=Math.max(...data.rows.map(r=>r.BS));
  const mxt=data.rows[data.rows.findIndex(r=>r.BS===mx)]?.trial;
  animNum(el("m-price"),data.price,2,"₹");
  animNum(el("m-vol"),data.vol,2,"","%" );
  animNum(el("m-maxbs"),mx,4,"₹");
  el("m-maxbs-sub").textContent="Trial "+mxt;
  animNum(el("m-optbs"),data.optBS,4,"₹");
  animNum(el("m-r2"),data.anova.r2,4);
  animNum(el("m-fstat"),data.anova.fstat||0,3);
  el("metric-row").style.display="";
}

export function initClock(){
  function tick(){
    const now=new Date();
    el("topbar-time").textContent="AS OF "+now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  }
  tick();setInterval(tick,1000);
}

export function initSidebar(stocks){
  const inp=el("stock-input"),dd=el("stock-dropdown"),sym=el("stock-symbol");
  let sel="HDFCBANK";

  function render(q){
    dd.innerHTML="";
    const f=Object.entries(stocks).filter(([n])=>n.toLowerCase().includes(q.toLowerCase())).slice(0,10);
    f.forEach(([n,s])=>{
      const d=document.createElement("div");d.className="sb-drop-item"+(s===sel?" sel":"");
      d.innerHTML=`${n}<span class="sym">${s}</span>`;
      d.addEventListener("mousedown",()=>{sel=s;inp.value=n;sym.textContent=s+".NS";dd.classList.remove("open");});
      dd.appendChild(d);
    });
    dd.classList.toggle("open",f.length>0&&q.length>0);
  }

  inp.addEventListener("focus",()=>{inp.select();render(inp.value);});
  inp.addEventListener("input",()=>render(inp.value));
  inp.addEventListener("blur", ()=>setTimeout(()=>dd.classList.remove("open"),150));

  qsa(".sb-pill").forEach(p=>{
    p.addEventListener("click",()=>{
      qsa(".sb-pill").forEach(x=>x.classList.remove("active"));
      p.classList.add("active");
    });
  });

  window.getSidebarValues=()=>{
    const ap=qs(".sb-pill.active");
    return{
      ticker:sel,
      T:parseFloat(ap?.dataset.t)||0.08219,
      Tlabel:ap?.textContent||"1M",
      r:[parseFloat(el("r1").value)||0.02,parseFloat(el("r2").value)||0.025,parseFloat(el("r3").value)||0.03],
      manualPrice:parseFloat(el("manual-price").value)||984.30,
      manualVol:parseFloat(el("manual-vol").value)||20.82,
    };
  };
}
