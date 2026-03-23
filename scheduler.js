// IMPERIAL PRO INSPECTION — SCHEDULER ENGINE v2
// Auto-advance, phase discounts, Core/Pro slider,
// green addon toggles, WDI by pkg, silent surcharges,
// weekend blocking, larger fonts, military green

const PHASE1=[{max:2000,p:325},{max:2500,p:349},{max:3000,p:369},{max:3500,p:395},{max:4000,p:419},{max:4500,p:445},{max:5000,p:469},{max:5500,p:495},{max:6000,p:525},{max:Infinity,p:null}];
const PHASE2=[{max:2000,p:449},{max:2500,p:469},{max:3000,p:489},{max:3500,p:539},{max:4000,p:589},{max:4500,p:639},{max:5000,p:689},{max:5500,p:739},{max:6000,p:789},{max:Infinity,p:null}];
const PHASE3=[{max:2000,p:475},{max:2500,p:499},{max:3000,p:525},{max:3500,p:549},{max:4000,p:575},{max:4500,p:599},{max:5000,p:625},{max:5500,p:675},{max:6000,p:725},{max:Infinity,p:null}];
const PHASE4=[{max:2000,p:425},{max:2500,p:449},{max:3000,p:475},{max:3500,p:499},{max:4000,p:525},{max:4500,p:549},{max:5000,p:575},{max:5500,p:625},{max:6000,p:675},{max:Infinity,p:null}];
const RESALE_CORE=[{max:1500,p:475},{max:2000,p:500},{max:2500,p:550},{max:3000,p:575},{max:3500,p:625},{max:4000,p:675},{max:4500,p:725},{max:5000,p:825},{max:5500,p:925},{max:6000,p:1025},{max:Infinity,p:null}];
const RESALE_PRO=[{max:1500,p:575},{max:2000,p:600},{max:2500,p:650},{max:3000,p:675},{max:3500,p:750},{max:4000,p:800},{max:4500,p:875},{max:5000,p:975},{max:5500,p:1075},{max:6000,p:1175},{max:Infinity,p:null}];
const FOUND_A=[{max:2000,p:250},{max:2500,p:275},{max:3000,p:300},{max:3500,p:325},{max:4000,p:350},{max:5000,p:375},{max:6000,p:425},{max:Infinity,p:null}];
const FOUND_B=[{max:2000,p:350},{max:2500,p:375},{max:3000,p:400},{max:3500,p:425},{max:4000,p:450},{max:5000,p:500},{max:6000,p:550},{max:Infinity,p:null}];
const PRELISTING=[{max:2000,p:450},{max:2500,p:475},{max:3000,p:500},{max:3500,p:525},{max:4000,p:550},{max:4500,p:575},{max:5000,p:600},{max:6000,p:650},{max:Infinity,p:null}];
const WDI_STANDALONE=[{max:1500,p:175},{max:2000,p:195},{max:2500,p:215},{max:3000,p:235},{max:3500,p:255},{max:4000,p:275},{max:5000,p:300},{max:6000,p:325},{max:Infinity,p:null}];
const WDI_ADDON_CORE=[{max:1500,p:115},{max:2000,p:125},{max:2500,p:135},{max:3000,p:145},{max:3500,p:155},{max:4000,p:165},{max:5000,p:175},{max:6000,p:185},{max:Infinity,p:null}];
const WDI_ADDON_PRO=75;

const AGE_SURCHARGE=[{from:1977,to:9999,fee:0},{from:1967,to:1976,fee:25},{from:1957,to:1966,fee:35},{from:1947,to:1956,fee:50},{from:1937,to:1946,fee:75},{from:1927,to:1936,fee:100},{from:1917,to:1926,fee:135},{from:1907,to:1916,fee:250},{from:0,to:1906,fee:375}];
const COUPONS={'JADI':{amount:30,label:'Promo Code JADI'},'SAVE30':{amount:30,label:'Promo Code SAVE30'},'REFERRAL':{amount:50,label:'Referral Discount'},'FAMILY':{amount:50,label:'Family Discount'}};

const S={step:1,propType:null,role:null,service:null,military:false,sqft:null,year:null,foundation:null,phase:null,foundLevel:null,moldType:null,resalePkg:'pro',addons:{mold:false,wdi:false,repair:false,extraSamples:0},coupon:null,customQuote:false};

function lookup(table,sqft){if(!sqft)return null;for(const t of table){if(sqft<=t.max)return t.p;}return null;}
function fmt(n){return n!=null?'$'+n.toLocaleString():'--';}
function ageFee(year){if(!year)return 0;for(const b of AGE_SURCHARGE){if(year>=b.from&&year<=b.to)return b.fee;}return 0;}
function crawlFee(){return S.foundation==='crawl'?100:0;}
function scrollToWizard(){var el=document.getElementById('wizard-top');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}

function wdiAddonPrice(){
  var svc=S.service;
  var isPro=svc==='resale'&&S.resalePkg==='pro';
  var isPhase=svc==='phase'&&S.phase>=3;
  var isWarranty=svc==='warranty';
  var isPre=svc==='prelisting';
  if(isPro||isPhase||isWarranty||isPre)return WDI_ADDON_PRO;
  return lookup(WDI_ADDON_CORE,S.sqft)||115;
}

function getPhaseDiscount(phase){
  if(S.service!=='phase')return 0;
  if(phase===1||phase===2)return 25;
  return 0;
}

function updateProgress(step){
  for(var i=1;i<=5;i++){
    var dot=document.getElementById('pd'+i);
    var lbl=document.getElementById('pl-'+i);
    if(!dot||!lbl)continue;
    dot.classList.remove('active','done');lbl.classList.remove('active','done');
    if(i<step){dot.classList.add('done');lbl.classList.add('done');dot.textContent='+';}
    else if(i===step){dot.classList.add('active');lbl.classList.add('active');dot.textContent=i;}
    else{dot.textContent=i;}
    var line=document.getElementById('pl'+i);
    if(line)line.classList.toggle('done',i<step);
  }
}

function goStep(n){
  if(n===5) buildAddons();
  if(n===6) renderFinalSummary();
  document.querySelectorAll('.step-section').forEach(function(s){s.classList.remove('active');});
  var el=document.getElementById('step-'+n);
  if(el)el.classList.add('active');
  S.step=n;
  updateProgress(n);
  try{if(S.propType) highlightCard(['cc-residential','cc-commercial'],'cc-'+S.propType);}catch(e){}
  try{if(S.role) highlightCard(['cc-homebuyer','cc-homeowner','cc-agent'],'cc-'+S.role);}catch(e){}
  var wt=document.getElementById('wizard-top');
  if(wt) wt.scrollIntoView({behavior:'smooth',block:'start'});
}

function highlightCard(ids, selectedId){
  ids.forEach(function(x){
    var el=document.getElementById(x);
    if(!el)return;
    if(x===selectedId){
      el.style.borderColor='#c8531a';
      el.style.boxShadow='0 12px 40px rgba(200,83,26,.14)';
      el.style.transform='translateY(-2px)';
      el.classList.add('selected');
    } else {
      el.style.borderColor='';
      el.style.boxShadow='';
      el.style.transform='';
      el.classList.remove('selected');
    }
  });
}

function scrollToEl(id){
  var el=document.getElementById(id);
  if(el)setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'start'});},150);
}
function scrollToBtn(id){
  var btn=document.getElementById(id);
  if(btn)setTimeout(function(){btn.scrollIntoView({behavior:'smooth',block:'center'});},150);
}

function pickPropertyType(t){
  S.propType=t;
  highlightCard(['cc-residential','cc-commercial'],'cc-'+t);
  if(t==='commercial'){window.location.href='https://www.commercialpropertyinspectionstx.com/Contact.html';return;}
  scrollToBtn('next-1');
}

function pickRole(r){
  S.role=r;
  highlightCard(['cc-homebuyer','cc-homeowner','cc-agent'],'cc-'+r);
  var af=document.getElementById('agent-fields');if(af)af.style.display=(r==='agent')?'block':'none';
  buildStep3Cards();
  scrollToBtn('next-2');
}

function toggleMilitary(){
  S.military=!S.military;
  var wrap=document.getElementById('mil-wrap');
  if(wrap)wrap.classList.toggle('active',S.military);
  if(S.step>=5)renderSummary();
}

var SERVICE_DEFS={
  homebuyer:[
    {id:'resale',icon:'🏠',title:'Resale Home Inspection',desc:'Buying an existing home. Core includes full TREC inspection, infrared thermal imaging, and moisture testing. Upgrade to Pro to add a ZIPLEVEL precision foundation survey — the standard for Fort Bend County.',tag:'✦ Core · Pro · Add-ons'},
    {id:'phase',icon:'🏗️',title:'New Construction Phase Inspection',desc:'Building with a builder. ICC-certified inspections at every critical stage. The only ICC-certified inspector in Fort Bend County.',tag:'✦ Phase 1 · 2 · 3 · 4'},
    {id:'foundation',icon:'📐',title:'Standalone Foundation Inspection',desc:'Foundation evaluation only. Level A is a thorough visual assessment. Level B is a full ZIPLEVEL precision survey with CAD drawing — the same tool foundation engineers use.',tag:'✦ Level A · Level B'},
    {id:'mold',icon:'🧪',title:'Standalone Mold / IAQ Inspection',desc:'Air and surface sampling with certified lab results, or a full mold assessment plus sampling. No home inspection required.',tag:'✦ IAQ Sampling · Assessment'},
    {id:'termite',icon:'🪲',title:'Standalone WDI Termite Inspection',desc:'TDA-licensed wood-destroying insect inspection. Required by most lenders. Identifies active infestations and conditions that invite future activity.',tag:'✦ TDA Licensed'},
  ],
  homeowner:[
    {id:'warranty',icon:'📋',title:'Builder Warranty Inspection',desc:'Your 11-month window before your builder warranty expires. MEPS inspection covers Mechanical, Electrical, Plumbing, and Structural. Last chance to make them fix it at no cost to you.',tag:'✦ MEPS Scope · Phase 4 Pricing'},
    {id:'prelisting',icon:'🏷️',title:'Pre-Listing Inspection',desc:'Selling your home? A pre-listing MEPS inspection finds issues before buyers do — giving you full control of the negotiation before you ever list.',tag:'✦ MEPS Scope'},
    {id:'foundation',icon:'📐',title:'Standalone Foundation Inspection',desc:'Level A visual assessment or Level B full ZIPLEVEL precision survey with CAD drawing and deflection analysis.',tag:'✦ Level A · Level B'},
    {id:'mold',icon:'🧪',title:'Mold / IAQ Inspection',desc:'Professional air and surface sampling with certified lab results, or a full mold assessment plus sampling.',tag:'✦ IAQ Sampling · Assessment'},
    {id:'termite',icon:'🪲',title:'WDI Termite Inspection',desc:'TDA-licensed wood-destroying insect inspection. One visit, official report.',tag:'✦ TDA Licensed'},
  ],
  agent:[
    {id:'resale',icon:'🏠',title:'Resale Home Inspection',desc:'For your buyer purchasing an existing home. Core or Pro — both include infrared imaging and our Repair Request Builder formatted for seller negotiations.',tag:'✦ Core · Pro · Add-ons'},
    {id:'phase',icon:'🏗️',title:'New Construction Phase Inspection',desc:'For your buyer building with a builder. ICC-certified at every stage — Fort Bend County\'s only ICC-certified inspector.',tag:'✦ Phase 1 · 2 · 3 · 4'},
    {id:'foundation',icon:'📐',title:'Standalone Foundation Inspection',desc:'Level A or Level B precision survey — powerful negotiating data for your clients.',tag:'✦ Level A · Level B'},
    {id:'mold',icon:'🧪',title:'Standalone Mold / IAQ Inspection',desc:'Certified air and surface sampling. One visit, full written report.',tag:'✦ IAQ Sampling · Assessment'},
    {id:'termite',icon:'🪲',title:'Standalone WDI Termite Inspection',desc:'TDA-licensed WDI inspection. Required by most lenders.',tag:'✦ TDA Licensed'},
  ]
};

function buildStep3Cards(){
  var role=S.role;
  var defs=SERVICE_DEFS[role]||SERVICE_DEFS.homebuyer;
  var wrap=document.getElementById('step3-cards');
  wrap.innerHTML='';
  var grid=document.createElement('div');
  grid.className='choice-grid-2';
  defs.forEach(function(def){
    var card=document.createElement('button');
    card.type='button';
    card.className='choice-card';
    card.id='svc-'+def.id;
    card.style.textAlign='left';
    card.style.width='100%';
    card.innerHTML='<div class="cc-icon">'+def.icon+'</div><div class="cc-title">'+def.title+'</div><div class="cc-desc">'+def.desc+'</div><div class="cc-tag">'+def.tag+'</div>';
    card.setAttribute('onclick',"window.IPpickService('"+def.id+"')");
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
}

function pickService(svc){
  S.service=svc;
  S.addons={mold:false,wdi:false,repair:false,extraSamples:0};
  S.resalePkg='pro';S.phase=null;S.foundLevel=null;S.moldType=null;
  document.querySelectorAll('[id^="svc-"]').forEach(function(c){
    c.classList.remove('selected');
    c.style.borderColor='rgba(10,22,40,.1)';
    c.style.background='#fafaf8';
    c.style.transform='none';
    c.style.boxShadow='none';
  });
  var el=document.getElementById('svc-'+svc);
  if(el){
    el.classList.add('selected');
    el.style.borderColor='#c8531a';
    el.style.background='rgba(200,83,26,.05)';
    el.style.transform='translateY(-2px)';
    el.style.boxShadow='0 12px 40px rgba(200,83,26,.14)';
  }
  configStep4();
  scrollToBtn('next-3');
}

function configStep4(){
  var svc=S.service;
  function show(id,v){var el=document.getElementById(id);if(el)el.style.display=v?'block':'none';}
  ['fg-sqft','fg-year','fg-foundation','fg-phase','fg-found-level','fg-mold-type','fg-resale-pkg'].forEach(function(id){show(id,false);});
  show('price-preview',false);
  show('fg-sqft',true);
  if(svc==='resale'||svc==='prelisting')show('fg-year',true);
  if(svc==='resale'||svc==='phase'||svc==='foundation'||svc==='warranty'||svc==='prelisting')show('fg-foundation',true);
  if(svc==='phase')show('fg-phase',true);
  if(svc==='warranty')S.phase=4;
  if(svc==='foundation')show('fg-found-level',true);
  if(svc==='mold')show('fg-mold-type',true);
  if(svc==='resale'){show('fg-resale-pkg',true);buildResaleSlider();}
  S.sqft=null;S.year=null;S.foundation=null;
  var si=document.getElementById('inp-sqft');if(si)si.value='';
  var yi=document.getElementById('inp-year');if(yi)yi.value='';
  document.querySelectorAll('.radio-btn').forEach(function(rb){rb.classList.remove('selected');});
  show('price-preview',false);show('custom-quote-wrap',false);
  var n4=document.getElementById('next-4');if(n4)n4.disabled=true;
}

function buildResaleSlider(){
  // Cards are static HTML — just set default and apply selection
  S.resalePkg='pro';
  applyPkgSelection('pro');
}

function toggleSurveyInfo(e){
  if(e){e.stopPropagation();e.preventDefault();}
  var panel=document.getElementById('pkg-info-panel');
  if(panel)panel.style.display=(panel.style.display==='none'||!panel.style.display)?'block':'none';
}

function selectPkg(pkg){
  S.resalePkg=pkg;
  applyPkgSelection(pkg);
  onDetailsChange();
  // Scroll to top of value card so nothing is missed
  setTimeout(function(){
    var el=document.getElementById('price-preview');
    if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
  },200);
}

function applyPkgSelection(pkg){
  var core=document.getElementById('pkg-core');
  var pro=document.getElementById('pkg-pro');
  if(!core||!pro)return;
  if(pkg==='core'){
    core.style.borderColor='#c8531a';
    core.style.boxShadow='0 8px 32px rgba(200,83,26,.18)';
    pro.style.borderColor='rgba(10,22,40,.15)';
    pro.style.boxShadow='none';
    pro.style.opacity='.7';
    core.style.opacity='1';
  } else {
    pro.style.borderColor='#c8531a';
    pro.style.boxShadow='0 8px 32px rgba(200,83,26,.28)';
    core.style.borderColor='rgba(10,22,40,.12)';
    core.style.boxShadow='none';
    core.style.opacity='.7';
    pro.style.opacity='1';
  }
}

function onSliderChange(val){}
function updateSliderDisplay(val){}

function onDetailsChange(doScroll){
  if(doScroll===undefined)doScroll=true;
  var sqftVal=parseInt(document.getElementById('inp-sqft').value);
  var prevSqft=S.sqft;
  S.sqft=sqftVal&&sqftVal>=100?sqftVal:null;
  var yearEl=document.getElementById('inp-year');
  var prevYear=S.year;
  if(yearEl){var yv=parseInt(yearEl.value);S.year=yv&&yv>=1800&&yv<=2026?yv:null;}

  if(S.service==='resale'){
    // Update package prices live on every keystroke
    if(S.sqft){
      var coreP=lookup(RESALE_CORE,S.sqft);
      var proP=lookup(RESALE_PRO,S.sqft);
      var cEl=document.getElementById('price-core');
      var pEl=document.getElementById('price-pro');
      if(cEl)cEl.textContent=coreP?fmt(coreP):(S.sqft>6000?'Custom':'--');
      if(pEl)pEl.textContent=proP?fmt(proP):(S.sqft>6000?'Custom':'--');
    }
    // Only scroll when user leaves the field (doScroll=true)
    if(doScroll){
      if(S.sqft && !prevSqft && !S.year){
        scrollToEl('fg-year'); return;
      }
      if(S.year && !prevYear && !S.foundation){
        scrollToEl('fg-foundation'); return;
      }
    }
  }

  if(S.service==='phase'&&S.phase&&S.sqft)showPhaseDiscountBanner();

  var calc=calcBase();
  var previewEl=document.getElementById('price-preview');
  var customWrap=document.getElementById('custom-quote-wrap');

  if(calc.custom){
    if(previewEl)previewEl.style.display='block';
    if(customWrap)customWrap.style.display='block';
    var te=document.getElementById('pc-total');if(te)te.textContent='Custom Quote';
    var n4=document.getElementById('next-4');if(n4)n4.disabled=true;
    return;
  }
  if(customWrap)customWrap.style.display='none';

  var ready=checkStep4Ready();
  if(calc.price!=null){
    if(previewEl)previewEl.style.display='block';
    var ne=document.getElementById('pc-svc-name');if(ne)ne.textContent=calc.label;
    var de=document.getElementById('pc-svc-detail');if(de)de.textContent=calc.detail;
    // Package badge
    var badge=document.getElementById('pc-pkg-badge');
    if(badge){
      if(S.service==='resale'){badge.style.display='block';badge.textContent=S.resalePkg==='pro'?'Pro Package':'Core Package';}
      else{badge.style.display='none';}
    }
    // Value stack
    renderValueStack(S.service,S.resalePkg,S.phase);
    var le=document.getElementById('pc-lines');
    if(le)le.innerHTML=calc.lines.map(function(l){return'<div class="pc-line'+(l.cls?' '+l.cls:'')+'"><span class="pc-line-name">'+l.name+'</span><span class="pc-line-val">'+l.val+'</span></div>';}).join('');
    var te2=document.getElementById('pc-total');if(te2)te2.textContent=fmt(calc.price);
  } else {
    if(previewEl)previewEl.style.display='none';
  }
  var n4b=document.getElementById('next-4');if(n4b){if(ready){n4b.classList.remove('btn-inactive');n4b.removeAttribute('disabled');n4b.style.opacity='1';n4b.style.cursor='pointer';n4b.style.pointerEvents='auto';}else{n4b.classList.add('btn-inactive');}}
}

function showPhaseDiscountBanner(){
  var existing=document.getElementById('phase-discount-banner');
  if(existing)existing.remove();
  var phase=S.phase;
  if(phase>=3)return;
  var discPhases=phase===1?'Phases 1, 2, and 3':phase===2?'Phases 2 and 3':'';
  var totalSaved=phase===1?'$75':phase===2?'$50':'';
  if(!discPhases)return;
  var banner=document.createElement('div');
  banner.id='phase-discount-banner';
  banner.style.cssText='background:rgba(26,107,58,.08);border:1px solid rgba(168,213,184,.25);border-left:4px solid #6ecf95;padding:16px 20px;margin-top:18px';
  banner.innerHTML='<div style="font-family:\'Montserrat\',sans-serif!important;font-size:13px!important;font-weight:700!important;letter-spacing:.16em!important;text-transform:uppercase!important;color:#3a9e5f!important;margin-bottom:6px">Multi-Phase Savings Unlocked</div>'
    +'<div style="font-family:\'Crimson Pro\',serif!important;font-size:18px!important;color:#2d7a4a!important;line-height:1.55">Starting at Phase '+phase+' saves you <strong>$25 on '+discPhases+'</strong> — <strong>'+totalSaved+' total savings</strong> across your build. Your discounted rates are locked in and noted in your booking confirmation.</div>';
  var phaseSection=document.getElementById('phase-section');
  if(phaseSection)phaseSection.appendChild(banner);
}

function pickFoundation(f){
  S.foundation=f;
  ['slab','crawl'].forEach(function(x){var el=document.getElementById('rb-'+x);if(el)el.classList.toggle('selected',x===f);});
  onDetailsChange();
  // For resale, scroll to package cards. For others, scroll to next-4
  if(S.service==='resale'){
    setTimeout(function(){scrollToEl('pkg-cards-wrap');},200);
  } else {
    scrollToBtn('next-4');
  }
}

function pickPhase(n){
  S.phase=n;
  [1,2,3,4].forEach(function(i){var el=document.getElementById('rb-ph'+i);if(el)el.classList.toggle('selected',i===n);});
  onDetailsChange();
  scrollToBtn('next-4');
}

function pickFoundLevel(l){
  S.foundLevel=l;
  ['A','B'].forEach(function(x){var el=document.getElementById('rb-lvl'+x);if(el)el.classList.toggle('selected',x===l);});
  onDetailsChange();
  scrollToBtn('next-4');
}

function pickMoldType(t){
  S.moldType=t;
  ['iaq','assess'].forEach(function(x){var el=document.getElementById('rb-mold-'+x);if(el)el.classList.toggle('selected',x===t);});
  onDetailsChange();
  scrollToBtn('next-4');
}

function checkStep4Ready(){
  var svc=S.service;
  if(!S.sqft||S.sqft<100)return false;
  if(S.sqft>6000)return false;
  if(svc==='resale'&&!S.resalePkg)return false;
  if((svc==='resale'||svc==='prelisting')&&!S.year)return false;
  if((svc==='resale'||svc==='phase'||svc==='foundation'||svc==='warranty'||svc==='prelisting')&&!S.foundation)return false;
  if(svc==='phase'&&!S.phase)return false;
  if(svc==='foundation'&&!S.foundLevel)return false;
  if(svc==='mold'&&!S.moldType)return false;
  return true;
}

function calcBase(){
  var sqft=S.sqft,svc=S.service;
  if(!sqft)return{price:null,lines:[],label:'',detail:'',custom:false};
  if(sqft>6000)return{price:null,lines:[],label:'',detail:'',custom:true};
  var price=null,lines=[],label='',detail='';

  if(svc==='resale'){
    if(!S.resalePkg)return{price:null,lines:[],label:'',detail:'',custom:false};
    var table=S.resalePkg==='core'?RESALE_CORE:RESALE_PRO;
    var base=lookup(table,sqft);
    if(!base)return{price:null,lines:[],label:'',detail:'',custom:true};
    label=S.resalePkg==='core'?'Resale — Core Package':'Resale — Pro Package';
    detail=S.resalePkg==='core'?'Full TREC · Infrared · Moisture testing':'Full TREC + ZIPLEVEL Foundation Survey · Infrared · Moisture';
    lines.push({name:'Base Inspection',val:fmt(base)});
    var af=ageFee(S.year);
    var cf=crawlFee();
    if(af>0)lines.push({name:'Property age ('+S.year+')',val:'+'+fmt(af),cls:'surcharge'});
    if(cf>0)lines.push({name:'Crawlspace / Pier & Beam access',val:'+'+fmt(cf),cls:'surcharge'});
    price=base+af+cf;
  } else if(svc==='phase'||svc==='warranty'){
    var ph=S.phase;
    if(!ph)return{price:null,lines:[],label:'',detail:'',custom:false};
    var tables=[null,PHASE1,PHASE2,PHASE3,PHASE4];
    var phNames=['','Pre-Pour Foundation','Pre-Drywall Framing','Final New Construction','Builder Warranty (MEPS)'];
    var base2=lookup(tables[ph],sqft);
    if(!base2)return{price:null,lines:[],label:'',detail:'',custom:true};
    label='Phase '+ph+' — '+phNames[ph];
    detail=ph===4?'MEPS — Mechanical, Electrical, Plumbing, Structural':'ICC Code-Certified · ZIPLEVEL included · Report in 24hr';
    var disc=getPhaseDiscount(ph);
    lines.push({name:'Phase '+ph+' Inspection',val:fmt(base2)});
    if(disc>0)lines.push({name:'Multi-phase discount',val:'-'+fmt(disc),cls:'discount'});
    price=base2-disc+crawlFee();
  } else if(svc==='foundation'){
    if(!S.foundLevel)return{price:null,lines:[],label:'',detail:'',custom:false};
    var ftable=S.foundLevel==='A'?FOUND_A:FOUND_B;
    var fbase=lookup(ftable,sqft);
    if(!fbase)return{price:null,lines:[],label:'',detail:'',custom:true};
    label='Foundation Inspection — Level '+S.foundLevel;
    detail=S.foundLevel==='A'?'Visual assessment · Spot elevation · Drainage review':'ZIPLEVEL full survey · CAD drawing · Deflection analysis';
    lines.push({name:'Level '+S.foundLevel+' Foundation Inspection',val:fmt(fbase)});
    price=fbase+crawlFee();
  } else if(svc==='mold'){
    if(!S.moldType)return{price:null,lines:[],label:'',detail:'',custom:false};
    if(S.moldType==='iaq'){price=375;label='Mold IAQ Sampling';detail='3 samples · Certified lab · Written report';lines.push({name:'IAQ Sampling (3 samples)',val:fmt(375)});}
    else{var ab=sqft<=2000?475:sqft<=3000?525:sqft<=4000?575:sqft<=5000?625:sqft<=6000?675:null;if(!ab)return{price:null,lines:[],label:'',detail:'',custom:true};price=ab;label='Mold Assessment + IAQ Sampling';detail='Physical inspection + 3 air samples + certified lab';lines.push({name:'Mold Assessment + 3 IAQ Samples',val:fmt(ab)});}
  } else if(svc==='termite'){
    var tbase=lookup(WDI_STANDALONE,sqft);if(!tbase)return{price:null,lines:[],label:'',detail:'',custom:true};
    price=tbase;label='WDI Termite Inspection';detail='TDA-licensed · Official WDI report';
    lines.push({name:'WDI Termite Inspection',val:fmt(tbase)});
  } else if(svc==='prelisting'){
    var pbase=lookup(PRELISTING,sqft);if(!pbase)return{price:null,lines:[],label:'',detail:'',custom:true};
    label='Pre-Listing Inspection (MEPS)';detail='Mechanical · Electrical · Plumbing · Structural';
    lines.push({name:'Pre-Listing MEPS Inspection',val:fmt(pbase)});
    var paf=ageFee(S.year);var pcf=crawlFee();
    if(paf>0)lines.push({name:'Property age ('+S.year+')',val:'+'+fmt(paf),cls:'surcharge'});
    if(pcf>0)lines.push({name:'Crawlspace / Pier & Beam access',val:'+'+fmt(pcf),cls:'surcharge'});
    price=pbase+paf+pcf;
  }
  return{price:price,lines:lines,label:label,detail:detail,custom:false};
}

function calcTotal(){
  var base=calcBase();
  if(base.custom)return{total:null,lines:base.lines.slice(),label:base.label,detail:base.detail,custom:true};
  if(base.price==null)return{total:null,lines:[],label:base.label,detail:base.detail,custom:false};
  var total=base.price,lines=base.lines.slice(),svc=S.service,sqft=S.sqft;

  var phaseAllowsAddon=(svc==='phase'&&S.phase>=3)||(svc==='warranty');
  if(S.addons.mold&&(svc==='resale'||phaseAllowsAddon||svc==='prelisting')){
    lines.push({name:'Mold IAQ Sampling (3 samples)',val:fmt(275)});
    lines.push({name:'Standalone $375 — you save',val:fmt(100),cls:'discount'});
    total+=275;
    if(S.addons.extraSamples>0){var ec=S.addons.extraSamples*75;lines.push({name:'Additional samples (x'+S.addons.extraSamples+')',val:'+'+fmt(ec)});total+=ec;}
  }
  // Standalone mold — extra samples billed on top of base price
  if(svc==='mold'&&S.addons.extraSamples>0){
    var esc=S.addons.extraSamples*75;
    lines.push({name:'Additional samples (x'+S.addons.extraSamples+') at $75 each',val:'+'+fmt(esc)});
    total+=esc;
  }
  if(S.addons.wdi&&(svc==='resale'||phaseAllowsAddon||svc==='prelisting')){
    if(S.military){lines.push({name:'WDI Termite Inspection',val:'Complimentary',cls:'discount'});lines.push({name:'Military/First Responder benefit',val:'--',cls:'discount'});}
    else{var wa=wdiAddonPrice();var ws=lookup(WDI_STANDALONE,sqft)||195;var saved=ws-wa;lines.push({name:'WDI Termite Inspection',val:fmt(wa)});lines.push({name:'Standalone '+fmt(ws)+' — you save',val:fmt(saved),cls:'discount'});total+=wa;}
  }
  if(S.addons.repair&&svc==='resale'){lines.push({name:'Repair Estimate Report',val:fmt(130)});lines.push({name:'Standalone $149 — you save',val:fmt(19),cls:'discount'});total+=130;}
  if(S.coupon){lines.push({name:S.coupon.label,val:'-'+fmt(S.coupon.amount),cls:'discount'});total=Math.max(0,total-S.coupon.amount);}
  return{total:total,lines:lines,label:base.label,detail:base.detail,custom:false};
}

function buildAddonHTML(id, addon, on, priceHtml) {
  var inner = document.createElement('div');
  inner.className = 'addon-toggle-inner';
  inner.setAttribute('onclick', 'window.IPtoggleAddon("' + id + '")');
  inner.style.cssText = 'display:flex;align-items:flex-start;gap:16px;padding:18px 20px;cursor:pointer';

  var sw = document.createElement('div');
  sw.className = 'toggle-switch';
  sw.innerHTML = '<div class="toggle-knob"></div>';

  var body = document.createElement('div');
  body.style.cssText = 'flex:1;min-width:0';
  body.innerHTML =
    '<div style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--tan);margin-bottom:5px">' + addon.eye + '</div>' +
    '<div style="font-family:Georgia,serif;font-size:clamp(18px,2vw,22px);font-weight:700;color:#fafaf8;margin-bottom:6px;line-height:1.15">' + addon.icon + ' ' + addon.title + '</div>' +
    '<div style="font-size:16px;color:rgba(250,250,248,.5);line-height:1.6">' + addon.desc + '</div>';

  var price = document.createElement('div');
  price.style.cssText = 'text-align:right;flex-shrink:0;padding-left:12px';
  price.innerHTML = priceHtml;

  inner.appendChild(sw);
  inner.appendChild(body);
  inner.appendChild(price);

  var container = document.createElement('div');
  container.appendChild(inner);

  if(id === 'mold') {
    var samples = document.createElement('div');
    samples.id = 'extra-samples-wrap';
    samples.style.cssText = 'display:' + (on ? 'block' : 'none') + ';padding:14px 20px;border-top:1px solid rgba(184,154,110,.1)';
    samples.innerHTML =
      '<div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(250,250,248,.4);margin-bottom:10px">Need more samples? $75 each</div>' +
      '<div style="display:flex;align-items:center;gap:12px">' +
      '<button onclick="window.IPchangeExtraSamples(-1)" type="button" style="width:36px;height:36px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:#fafaf8;font-size:20px;cursor:pointer;line-height:1">-</button>' +
      '<span id="extra-count" style="font-size:26px;font-weight:600;color:#fafaf8;min-width:28px;text-align:center">0</span>' +
      '<button onclick="window.IPchangeExtraSamples(1)" type="button" style="width:36px;height:36px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:#fafaf8;font-size:20px;cursor:pointer;line-height:1">+</button>' +
      '<span style="font-size:15px;color:rgba(250,250,248,.4)">additional samples (3 included)</span>' +
      '</div>';
    container.appendChild(samples);
  }

  return container.innerHTML;
}

function buildAddons(){
  var wrap=document.getElementById('addons-wrap');
  wrap.innerHTML='';
  var svc=S.service,sqft=S.sqft,addons=[];

  // Mold: resale, phase 3+4, prelisting, warranty only (NOT phase 1 or 2)
  var phaseHasMold=(svc==='phase'&&S.phase>=3)||(svc==='warranty');
  if(svc==='resale'||phaseHasMold||svc==='prelisting'){
    addons.push({id:'mold',icon:'🧪',eye:'Same Visit · Certified Lab Results',title:'Mold & IAQ Air Sampling',desc:'3 air samples — 1 outdoor baseline and 2 indoor — with certified lab analysis. Reveals hidden mold and elevated spore counts that no visual inspection can detect. No second appointment needed.',addPrice:275,wasPrice:375,save:100,showSamples:true});
  }
  // Standalone mold — offer extra samples
  if(svc==='mold'){
    addons.push({id:'mold-extra',icon:'🧪',eye:'Additional Samples · $75 Each',title:'Add More Air Samples',desc:'Your service already includes 3 samples (1 outdoor baseline + 2 indoor). Add more samples to cover additional rooms, floors, or areas of concern.',addPrice:75,wasPrice:null,save:null,samplesOnly:true});
  }
  // WDI: resale, phase 3+4, prelisting, warranty only (NOT phase 1 or 2)
  if(svc==='resale'||phaseHasMold||svc==='prelisting'){
    var wa=wdiAddonPrice();var ws=lookup(WDI_STANDALONE,sqft)||195;var sv=ws-wa;
    addons.push({id:'wdi',icon:'🪲',eye:'TDA Licensed · Same Visit · Official Report',title:S.military?'WDI Termite Inspection — Complimentary':'WDI Termite Inspection',desc:'Official wood-destroying insect report. Required by most lenders. Identifies active infestations, prior damage, and conditions that invite future activity.',addPrice:S.military?0:wa,wasPrice:S.military?null:ws,save:S.military?null:sv,military:S.military});
  }
  if(svc==='resale'){addons.push({id:'repair',icon:'📋',eye:'Exclusive to Imperial Pro · Resale Only',title:'Repair Estimate Report',desc:'Every defect priced line by line with approximate estimated minimum and maximum repair cost ranges. Most inspectors hand you a list of problems. We hand you the leverage.',addPrice:130,wasPrice:149,save:19});}

  if(addons.length===0){wrap.innerHTML='<p style="font-family:\'Crimson Pro\',serif!important;font-size:18px!important;color:var(--text-muted)!important;font-style:italic!important;padding:20px 0">No add-ons available for this service. Your price is ready to confirm.</p>';renderSummary();return;}

  addons.forEach(function(addon){
    // Samples-only card for standalone mold
    if(addon.samplesOnly){
      var sc=document.createElement('div');
      sc.style.cssText='background:#0d1e33;border:1px solid rgba(184,154,110,.14);padding:20px;margin-bottom:10px';
      sc.innerHTML='<div style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#b89a6e;margin-bottom:8px">'+addon.eye+'</div>'
        +'<div style="font-size:clamp(16px,1.8vw,20px);font-weight:700;color:#fafaf8;margin-bottom:6px">'+addon.icon+' '+addon.title+'</div>'
        +'<div style="font-size:15px;color:rgba(250,250,248,.5);line-height:1.6;margin-bottom:14px">'+addon.desc+'</div>'
        +'<div style="display:flex;align-items:center;gap:12px">'
        +'<button onclick="window.IPchangeExtraSamples(-1)" type="button" style="width:36px;height:36px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:#fafaf8;font-size:20px;cursor:pointer;line-height:1">-</button>'
        +'<span id="extra-count" style="font-size:26px;font-weight:600;color:#fafaf8;min-width:28px;text-align:center">'+((S.addons.extraSamples)||0)+'</span>'
        +'<button onclick="window.IPchangeExtraSamples(1)" type="button" style="width:36px;height:36px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:#fafaf8;font-size:20px;cursor:pointer;line-height:1">+</button>'
        +'<span style="font-size:15px;color:rgba(250,250,248,.4)">additional samples at $75 each</span>'
        +'</div>';
      wrap.appendChild(sc);
      return;
    }

    var on=S.addons[addon.id]||addon.military;
    var card=document.createElement('div');
    card.className='addon-toggle'+(on?' on':'');
    card.id='atog-'+addon.id;
    var priceHtml=addon.military
      ?'<div style="font-size:clamp(16px,2vw,20px);color:#6ecf95;font-weight:700;line-height:1.2">Complimentary</div>'
       +'<div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6ecf95;margin-top:4px">Military benefit</div>'
      :'<div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6ecf95;margin-bottom:6px">&#10003; Save '+fmt(addon.save)+'</div>'
       +'<div style="font-size:clamp(30px,3.8vw,44px);font-weight:700;color:#6ecf95;line-height:1;letter-spacing:-.02em">'+fmt(addon.addPrice)+'</div>'
       +'<div style="font-size:11px;color:rgba(250,250,248,.25);margin-top:5px">reg. '+fmt(addon.wasPrice)+'</div>';
    card.innerHTML = buildAddonHTML(addon.id, addon, on, priceHtml);
    wrap.appendChild(card);
    if(addon.military)S.addons.wdi=true;
  });
  renderSummary();
}

function toggleAddon(id){
  if(id==='wdi'&&S.military)return;
  S.addons[id]=!S.addons[id];
  var card=document.getElementById('atog-'+id);
  if(card)card.classList.toggle('on',S.addons[id]);
  if(id==='mold'){var esWrap=document.getElementById('extra-samples-wrap');if(esWrap)esWrap.style.display=S.addons.mold?'block':'none';if(!S.addons.mold){S.addons.extraSamples=0;var ec=document.getElementById('extra-count');if(ec)ec.textContent='0';}}
  renderSummary();
}

function changeExtraSamples(delta){
  var nv=Math.max(0,Math.min(6,(S.addons.extraSamples||0)+delta));
  S.addons.extraSamples=nv;
  var ec=document.getElementById('extra-count');if(ec)ec.textContent=nv;
  renderSummary();
}

function getValueItems(svc, pkg, phase){
  var base=[
    {title:'Full TREC Home Inspection',sub:'Every major system — roof, structure, HVAC, electrical, plumbing, and more',tag:null},
    {title:'Infrared Thermal Imaging',sub:'Detects hidden moisture, insulation gaps, and electrical hot spots invisible to the naked eye',tag:'Included'},
    {title:'Moisture Meter Testing',sub:'Identifies active moisture intrusion behind walls and under floors',tag:'Included'},
    {title:'Photo-Rich Digital Report',sub:'Delivered within 24 hours with annotated photos and repair priority ratings',tag:'24hr delivery'},
    {title:'Repair Request Builder',sub:'One-click tool to share defect summaries directly with your agent',tag:'Included'}
  ];
  if(svc==='resale'&&pkg==='core'){
    base.push({title:'Foundation — Level A Visual Assessment',sub:'Spot elevation readings, drainage review, and professional performance opinion',tag:'$250+ value'});
  }
  if(svc==='resale'&&pkg==='pro'){
    base.push({title:'Foundation — Level B Advanced Survey',sub:'ZIPLEVEL® precision elevation survey — full footprint mapped, scaled CAD drawing in your report',tag:'$350+ value'});
  }
  if(svc==='phase'){
    var phaseNames=['','Pre-Pour Foundation','Pre-Drywall Framing','Final New Construction','Builder Warranty (MEPS)'];
    var phaseSubs=['',
      'Catches foundation issues before concrete is poured — the only time corrections are free',
      'Verifies framing, rough-in plumbing, electrical, and HVAC before walls close',
      'Full ICC code-certified inspection before your certificate of occupancy',
      'Covers Mechanical, Electrical, Plumbing, and Structural before warranty expires'
    ];
    base=[{title:'Phase '+(phase||'')+(phaseNames[phase]?' — '+phaseNames[phase]:''),sub:phaseSubs[phase]||'',tag:'ICC Certified'}];
    if(phase>=1&&phase<=3){
      base.push({title:'ZIPLEVEL® Foundation Reading',sub:'Precision elevation data captured at every phase',tag:'Included'});
    }
  }
  if(svc==='warranty'){
    base=[
      {title:'Builder Warranty Inspection (MEPS)',sub:'Mechanical, Electrical, Plumbing, and Structural — scoped to your warranty coverage window',tag:null},
      {title:'Documented Deficiency Report',sub:'Written evidence for warranty claims your builder is required to address',tag:'Included'},
    ];
  }
  if(svc==='prelisting'){
    base=[
      {title:'Pre-Listing MEPS Inspection',sub:'Identify surprises before buyers find them — price with confidence',tag:null},
      {title:'Infrared Thermal Imaging',sub:'Included at no extra charge',tag:'Included'},
      {title:'Repair Priority Report',sub:'Helps you decide what to fix, disclose, or price into the sale',tag:'Included'},
    ];
  }
  return base;
}

function renderValueStack(svc, pkg, phase){
  var wrap=document.getElementById('pc-value-stack');
  if(!wrap)return;
  var items=getValueItems(svc,pkg,phase);
  wrap.innerHTML='<div style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(184,154,110,.5);margin-bottom:12px">What\'s Included</div>';
  items.forEach(function(item,i){
    var div=document.createElement('div');
    div.className='pc-value-item';
    div.innerHTML='<div class="pc-value-check">&#10003;</div>'
      +'<div class="pc-value-body">'
      +'<div class="pc-value-title">'+item.title+'</div>'
      +(item.sub?'<div class="pc-value-sub">'+item.sub+'</div>':'')
      +'</div>'
      +(item.tag?'<div class="pc-value-tag">'+item.tag+'</div>':'');
    wrap.appendChild(div);
    setTimeout(function(){div.classList.add('visible');},80+i*90);
    // After last item animates, nudge scroll to reveal the See Add-Ons button
    if(i===items.length-1){
      setTimeout(function(){scrollToBtn('next-4');},80+i*90+600);
    }
  });
}

function renderSummary(){
  var calc=calcTotal();
  var se=document.getElementById('summary-svc');if(se)se.textContent=calc.label;
  var de=document.getElementById('summary-detail');if(de)de.textContent=calc.detail;
  var le=document.getElementById('summary-lines');
  if(le)le.innerHTML=(calc.lines||[]).map(function(l){return'<div class="pc-line'+(l.cls?' '+l.cls:'')+'"><span class="pc-line-name">'+l.name+'</span><span class="pc-line-val">'+l.val+'</span></div>';}).join('');
  var te=document.getElementById('summary-total');if(te)te.textContent=calc.total!=null?fmt(calc.total):'--';
  var mn=document.getElementById('summary-military-note');if(mn)mn.style.display=S.military?'block':'none';
  renderFinalSummary();
}

function toggleCoupon(){
  var field=document.getElementById('coupon-field');
  var icon=document.getElementById('coupon-toggle-icon');
  var isOpen=field.classList.contains('open');
  field.classList.toggle('open',!isOpen);
  if(icon)icon.textContent=isOpen?'+':'-';
}

function applyCoupon(){
  var val=document.getElementById('coupon-inp').value.trim().toUpperCase();
  var msg=document.getElementById('coupon-msg');
  msg.style.display='block';
  if(COUPONS[val]){S.coupon=COUPONS[val];msg.className='coupon-msg ok';msg.textContent='Code applied: '+COUPONS[val].label+' — -'+fmt(COUPONS[val].amount)+' off';}
  else{S.coupon=null;msg.className='coupon-msg err';msg.textContent='Code not recognized. Check spelling and try again.';}
  renderSummary();
}

function validateDates(){
  var d1=document.getElementById('inp-date1').value;
  var d2=document.getElementById('inp-date2').value;
  var errEl=document.getElementById('date-err');
  var isWeekend=function(d){var day=new Date(d+'T12:00:00').getDay();return day===0||day===6;};
  var err='';
  if(d1&&isWeekend(d1))err='That date falls on a weekend. Please select a Monday through Friday date.';
  if(!err&&d2&&isWeekend(d2))err='That date falls on a weekend. Please select a Monday through Friday date.';
  if(errEl){errEl.textContent=err;errEl.style.display=err?'block':'none';}
}

function toggleDate3(){
  var inp=document.getElementById('inp-date3');
  var btn=document.getElementById('date3-toggle');
  var isHidden=inp.style.display==='none'||inp.style.display==='';
  inp.style.display=isHidden?'block':'none';
  if(btn)btn.textContent=isHidden?'− Remove 3rd preferred date':'＋  Add a 3rd preferred date';
}

function buildSubmissionData(){
  var calc=calcTotal();
  var roleLabels={homebuyer:'Homebuyer',homeowner:'Homeowner',agent:'Real Estate Agent'};
  var svcLabels={resale:'Resale Home Inspection',phase:'New Construction Phase Inspection',foundation:'Standalone Foundation Inspection',mold:'Mold / IAQ Inspection',termite:'WDI Termite Inspection',prelisting:'Pre-Listing Inspection (MEPS)',warranty:'Builder Warranty Inspection (MEPS)'};
  var phaseLabels={1:'Phase 1 - Pre-Pour Foundation',2:'Phase 2 - Pre-Drywall Framing',3:'Phase 3 - Final New Construction',4:'Phase 4 - Builder Warranty (MEPS)'};
  var pkgLabels={core:'Core (Visual Foundation Assessment)',pro:'Pro (ZIPLEVEL Precision Survey)'};
  var breakdown=(calc.lines||[]).map(function(l){return'  '+l.name+': '+l.val;}).join('\n');
  var addonList=[];
  if(S.addons.mold){var ms='Mold IAQ Sampling - $275 (save $100 vs standalone $375)';if(S.addons.extraSamples>0)ms+=' + '+S.addons.extraSamples+' extra samples at $75 each';addonList.push(ms);}
  if(S.addons.wdi){if(S.military){addonList.push('WDI Termite - COMPLIMENTARY (Military/First Responder)');}else{var wa=wdiAddonPrice();var ws=lookup(WDI_STANDALONE,S.sqft)||195;addonList.push('WDI Termite - $'+wa+' (standalone: $'+ws+', save $'+(ws-wa)+')');}}
  if(S.addons.repair)addonList.push('Repair Estimate Report - $130 (standalone: $149, save $19)');
  var pdNote=S.service==='phase'&&S.phase<3?'YES - $25 off applied. Client entitled to $25 off remaining phases. Honor at next booking.':'No';

  return{
    _subject:'New Booking - '+(svcLabels[S.service]||S.service)+' | Imperial Pro',
    _replyto:document.getElementById('inp-email').value,
    'CLIENT NAME':document.getElementById('inp-fname').value+' '+document.getElementById('inp-lname').value,
    'EMAIL':document.getElementById('inp-email').value,
    'PHONE':document.getElementById('inp-phone').value,
    'ROLE':roleLabels[S.role]||S.role,
    'MILITARY':S.military?'YES - WDI Termite complimentary applied':'No',
    'ADDRESS':document.getElementById('inp-address').value+', '+document.getElementById('inp-city').value+', TX '+document.getElementById('inp-zip').value,
    'SQUARE FOOTAGE':S.sqft?S.sqft+' sq ft':'Not provided',
    'YEAR BUILT':S.year||'Not provided',
    'FOUNDATION TYPE':S.foundation==='crawl'?'Crawlspace / Pier & Beam (+$100 applied silently)':'Slab',
    'SERVICE TYPE':svcLabels[S.service]||S.service,
    'PACKAGE':S.resalePkg?pkgLabels[S.resalePkg]||S.resalePkg:S.foundLevel?'Level '+S.foundLevel:S.moldType?S.moldType:S.phase?phaseLabels[S.phase]||('Phase '+S.phase):'N/A',
    'ADD-ONS':addonList.length?addonList.join(' | '):'None',
    'COUPON':S.coupon?S.coupon.label+' - -$'+S.coupon.amount:'None',
    'MULTI-PHASE DISCOUNT':pdNote,
    'LINE ITEMS':'\n'+breakdown,
    'ESTIMATED TOTAL':calc.total!=null?fmt(calc.total):'CUSTOM QUOTE REQUIRED',
    'PRICING NOTE':'Verify sqft, year built, foundation type before confirming. Age and crawlspace surcharges applied silently.',
    '1ST PREFERRED DATE':document.getElementById('inp-date1').value||'Not provided',
    '2ND PREFERRED DATE':document.getElementById('inp-date2').value||'Not provided',
    '3RD PREFERRED DATE':document.getElementById('inp-date3').value||'Not provided',
    'ACCESS NOTES':document.getElementById('inp-notes').value||'None',
    'AGENT NAME':document.getElementById('inp-agent-name').value||'N/A',
    'AGENT EMAIL':document.getElementById('inp-agent-email').value||'N/A'
  };
}

function validateStep6(){
  var req=['inp-fname','inp-lname','inp-email','inp-phone','inp-address','inp-city','inp-zip','inp-date1','inp-date2'];
  for(var i=0;i<req.length;i++){var el=document.getElementById(req[i]);if(!el||!el.value.trim()){if(el)el.focus();return false;}}
  var d1=document.getElementById('inp-date1').value;
  var d2=document.getElementById('inp-date2').value;
  var isWeekend=function(d){var day=new Date(d+'T12:00:00').getDay();return day===0||day===6;};
  if(isWeekend(d1)||isWeekend(d2))return false;
  return true;
}

async function submitForm(){
  if(!validateStep6()){alert('Please fill in all required fields and make sure your preferred dates are weekdays (Monday through Friday).');return;}
  var btn=document.getElementById('submit-btn');
  btn.disabled=true;btn.textContent='Submitting...';
  var data=buildSubmissionData();
  try{
    var res=await fetch('https://formspree.io/f/maqpzzbw',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)});
    if(res.ok){
      document.getElementById('progress-wrap').style.display='none';
      document.querySelectorAll('.step-section').forEach(function(s){s.style.display='none';});
      var sw=document.getElementById('success-wrap');if(sw)sw.classList.add('show');
      scrollToWizard();
    } else {
      btn.disabled=false;btn.textContent='Submit My Booking Request';
      alert('Something went wrong. Please try again or call (281) 715-9755.');
    }
  } catch(e){
    btn.disabled=false;btn.textContent='Submit My Booking Request';
    alert('Network error. Please try again or call (281) 715-9755.');
  }
}

function renderFinalSummary(){
  var calc=calcTotal();
  var le=document.getElementById('final-lines');
  if(le)le.innerHTML=(calc.lines||[]).map(function(l){return'<div class="pc-line'+(l.cls?' '+l.cls:'')+'"><span class="pc-line-name">'+l.name+'</span><span class="pc-line-val">'+l.val+'</span></div>';}).join('');
  var te=document.getElementById('final-total');if(te)te.textContent=calc.total!=null?fmt(calc.total):'--';
}

function startOver(){
  // Reset all state
  S.step=1;S.propType=null;S.role=null;S.service=null;S.military=false;
  S.sqft=null;S.year=null;S.foundation=null;S.phase=null;S.foundLevel=null;
  S.moldType=null;S.resalePkg='pro';S.addons={mold:false,wdi:false,repair:false,extraSamples:0};
  S.coupon=null;S.customQuote=false;

  // Clear all selections visually
  document.querySelectorAll('.choice-card,.selected').forEach(function(el){
    el.classList.remove('selected');
    el.style.borderColor='';el.style.boxShadow='';el.style.opacity='';el.style.background='';el.style.transform='';
  });
  document.querySelectorAll('.radio-btn').forEach(function(rb){rb.classList.remove('selected');});

  // Clear form inputs
  ['inp-sqft','inp-year','inp-fname','inp-lname','inp-email','inp-phone',
   'inp-address','inp-city','inp-zip','inp-date1','inp-date2','inp-date3',
   'inp-agent-name','inp-agent-email','inp-notes','coupon-inp'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.value='';
  });

  // Hide all conditional sections
  ['fg-sqft','fg-year','fg-foundation','fg-phase','fg-found-level','fg-mold-type',
   'fg-resale-pkg','price-preview','custom-quote-wrap','phase-discount-banner',
   'pkg-info-panel','coupon-field','coupon-msg','date-err'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.style.display='none';
  });

  // Reset mil wrap
  var mw=document.getElementById('mil-wrap');if(mw)mw.classList.remove('active');

  // Show progress bar if hidden (post-success)
  var pw=document.getElementById('progress-wrap');if(pw)pw.style.display='block';

  // Go back to step 1
  goStep(1);
}
window.IPselectPkg=selectPkg;
window.IPtoggleSurveyInfo=toggleSurveyInfo;
window.IPstartOver=startOver;
window.IPpickPropertyType=pickPropertyType;
window.IPpickRole=pickRole;
window.IPtoggleMilitary=toggleMilitary;
window.IPpickService=pickService;
window.IPpickFoundation=pickFoundation;
window.IPpickPhase=pickPhase;
window.IPpickFoundLevel=pickFoundLevel;
window.IPpickMoldType=pickMoldType;
window.IPonSliderChange=onSliderChange;
window.IPtoggleAddon=toggleAddon;
window.IPchangeExtraSamples=changeExtraSamples;
window.IPtoggleCoupon=toggleCoupon;
window.IPapplyCoupon=applyCoupon;
window.IPtoggleDate3=toggleDate3;
window.IPsubmitForm=submitForm;
window.IPonDetailsChange=onDetailsChange;
window.IPvalidateDates=validateDates;

// Date minimums + weekend blocking
(function(){
  var tomorrow=new Date();
  tomorrow.setDate(tomorrow.getDate()+1);
  var mn=tomorrow.toISOString().split('T')[0];
  ['inp-date1','inp-date2','inp-date3'].forEach(function(id){
    var el=document.getElementById(id);
    if(!el)return;
    el.min=mn;
    el.addEventListener('change',function(){
      var d=new Date(this.value+'T12:00:00');
      var day=d.getDay();
      var errEl=document.getElementById('date-err');
      if(day===0||day===6){
        this.value='';
        if(errEl){errEl.textContent='Weekends are not available. Please select a Monday through Friday date.';errEl.style.display='block';}
      } else {
        if(errEl){errEl.textContent='';errEl.style.display='none';}
      }
    });
  });
})();

// Update addon toggle CSS for green
(function(){
  if(document.getElementById('addon-green-style'))return;
  var st=document.createElement('style');
  st.id='addon-green-style';
  st.textContent='.addon-toggle.on{border-color:rgba(110,207,149,.35)!important}'
    +'.addon-toggle.on .toggle-switch{background:#3a9e5f!important;border-color:#6ecf95!important}'
    +'.addon-toggle.on .addon-toggle-eye{color:#6ecf95!important}';
  document.head.appendChild(st);
})();

// Military toggle green CSS
(function(){
  if(document.getElementById('mil-green-style'))return;
  var st=document.createElement('style');
  st.id='mil-green-style';
  st.textContent='#mil-wrap.active{background:rgba(26,107,58,.08)!important;border-color:rgba(110,207,149,.4)!important;border-left-color:#6ecf95!important}'
    +'#mil-wrap.active .mil-check{background:#3a9e5f!important;border-color:#6ecf95!important}'
    +'#mil-wrap .mil-title{font-size:16px!important}'
    +'#mil-wrap .mil-desc{font-size:15px!important}';
  document.head.appendChild(st);
})();

// ── WINDOW EXPORTS ───────────────────────────────────────
window.IPgoStep             = goStep;
window.IPstartOver          = startOver;
window.IPselectPkg          = selectPkg;
window.IPtoggleSurveyInfo   = toggleSurveyInfo;
window.IPpickPropertyType   = pickPropertyType;
window.IPpickRole           = pickRole;
window.IPtoggleMilitary     = toggleMilitary;
window.IPpickService        = pickService;
window.IPpickFoundation     = pickFoundation;
window.IPpickPhase          = pickPhase;
window.IPpickFoundLevel     = pickFoundLevel;
window.IPpickMoldType       = pickMoldType;
window.IPonSliderChange     = onSliderChange;
window.IPtoggleAddon        = toggleAddon;
window.IPchangeExtraSamples = changeExtraSamples;
window.IPtoggleCoupon       = toggleCoupon;
window.IPapplyCoupon        = applyCoupon;
window.IPtoggleDate3        = toggleDate3;
window.IPsubmitForm         = submitForm;
window.IPonDetailsChange    = onDetailsChange;
window.IPvalidateDates      = validateDates;

updateProgress(1);
