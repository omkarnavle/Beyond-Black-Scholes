// main.js
import {el,qs,qsa,setMetrics,initClock,initSidebar} from "./ui.js";
import {renderL9,renderANOVA,renderANOM,renderSN,renderOptimal} from "./panels.js";

const PAGES={l9:renderL9,anova:renderANOVA,anom:renderANOM,sn:renderSN,optimal:renderOptimal};
let STATE=null,CURPAGE="l9";

async function boot(){
  initClock();
  const stocks=await fetch("/api/stocks").then(r=>r.json());
  initSidebar(stocks);

  qsa(".nav-btn").forEach(b=>{
    b.addEventListener("click",()=>{
      if(!STATE)return;
      CURPAGE=b.dataset.page;
      qsa(".nav-btn").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      showPage(CURPAGE);
    });
  });

  el("run-btn").addEventListener("click",run);
}

function showPage(page){
  qsa(".page").forEach(p=>p.style.display="none");
  const pel=el("page-"+page);
  pel.style.display="flex";
  if(STATE) PAGES[page]?.(pel,STATE);
}

async function run(){
  const v=window.getSidebarValues();
  const btn=el("run-btn");
  btn.disabled=true;btn.textContent="Running...";

  el("empty-state").style.display="none";
  el("loading-state").style.display="";
  qsa(".page").forEach(p=>p.style.display="none");
  el("metric-row").style.display="none";
  el("page-nav").style.display="none";

  try{
    const res=await fetch("/api/run",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify(v),
    });
    const data=await res.json();
    STATE=data;

    el("topbar-sub").textContent=`${v.ticker}.NS · Taguchi L9 · Black-Scholes · ${v.Tlabel}`;
    const badge=el("status-badge");
    badge.style.display="flex";
    badge.className=data.status.startsWith("Live")?"live-badge":"live-badge warn";

    setMetrics(data);
    el("page-nav").style.display="flex";
    el("loading-state").style.display="none";

    // show first page
    CURPAGE="l9";
    qsa(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page==="l9"));
    showPage("l9");

  }catch(e){
    el("loading-state").style.display="none";
    el("empty-state").style.display="";
    el("empty-state").querySelector(".es-title").textContent="Error: "+e.message;
  }

  btn.disabled=false;btn.textContent="Run Analysis";
}

boot();
