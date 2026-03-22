// ═══════════════════════════════════════════════════════
//  IMPERIAL PRO INSPECTION — SCHEDULER ENGINE
//  All pricing, state, UI logic
// ═══════════════════════════════════════════════════════

// ── PRICING TABLES ──────────────────────────────────────

const PHASE1 = [
  {max:2000,p:325},{max:2500,p:349},{max:3000,p:369},{max:3500,p:395},
  {max:4000,p:419},{max:4500,p:445},{max:5000,p:469},{max:5500,p:495},
  {max:6000,p:525},{max:Infinity,p:null}
];
const PHASE2 = [
  {max:2000,p:449},{max:2500,p:469},{max:3000,p:489},{max:3500,p:539},
  {max:4000,p:589},{max:4500,p:639},{max:5000,p:689},{max:5500,p:739},
  {max:6000,p:789},{max:Infinity,p:null}
];
const PHASE3 = [
  {max:2000,p:475},{max:2500,p:499},{max:3000,p:525},{max:3500,p:549},
  {max:4000,p:575},{max:4500,p:599},{max:5000,p:625},{max:5500,p:675},
  {max:6000,p:725},{max:Infinity,p:null}
];
const PHASE4 = [
  {max:2000,p:425},{max:2500,p:449},{max:3000,p:475},{max:3500,p:499},
  {max:4000,p:525},{max:4500,p:549},{max:5000,p:575},{max:5500,p:625},
  {max:6000,p:675},{max:Infinity,p:null}
];
const RESALE_CORE = [
  {max:1500,p:475},{max:2000,p:500},{max:2500,p:550},{max:3000,p:575},
  {max:3500,p:625},{max:4000,p:675},{max:4500,p:725},{max:5000,p:825},
  {max:5500,p:925},{max:6000,p:1025},{max:Infinity,p:null}
];
const RESALE_PRO = [
  {max:1500,p:575},{max:2000,p:600},{max:2500,p:650},{max:3000,p:675},
  {max:3500,p:750},{max:4000,p:800},{max:4500,p:875},{max:5000,p:975},
  {max:5500,p:1075},{max:6000,p:1175},{max:Infinity,p:null}
];
const FOUND_A = [
  {max:2000,p:250},{max:2500,p:275},{max:3000,p:300},{max:3500,p:325},
  {max:4000,p:350},{max:5000,p:375},{max:6000,p:425},{max:Infinity,p:null}
];
const FOUND_B = [
  {max:2000,p:350},{max:2500,p:375},{max:3000,p:400},{max:3500,p:425},
  {max:4000,p:450},{max:5000,p:500},{max:6000,p:550},{max:Infinity,p:null}
];
const PRELISTING = [
  {max:2000,p:450},{max:2500,p:475},{max:3000,p:500},{max:3500,p:525},
  {max:4000,p:550},{max:4500,p:575},{max:5000,p:600},{max:6000,p:650},
  {max:Infinity,p:null}
];
const WDI_STANDALONE = [
  {max:1500,p:175},{max:2000,p:195},{max:2500,p:215},{max:3000,p:235},
  {max:3500,p:255},{max:4000,p:275},{max:5000,p:300},{max:6000,p:325},
  {max:Infinity,p:null}
];
const WDI_ADDON = [
  {max:1500,p:75},{max:2000,p:85},{max:2500,p:95},{max:3000,p:100},
  {max:3500,p:110},{max:4000,p:115},{max:5000,p:125},{max:6000,p:135},
  {max:Infinity,p:null}
];

// Age surcharge (resale only)
const AGE_SURCHARGE = [
  {from:1977,to:9999,fee:0},
  {from:1967,to:1976,fee:25},
  {from:1957,to:1966,fee:35},
  {from:1947,to:1956,fee:50},
  {from:1937,to:1946,fee:75},
  {from:1927,to:1936,fee:100},
  {from:1917,to:1926,fee:135},
  {from:1907,to:1916,fee:250},
  {from:0,to:1906,fee:375}
];

// Coupons
const COUPONS = {
  'JADI':    {amount:30, label:'Promo Code — JADI'},
  'SAVE30':  {amount:30, label:'Promo Code — SAVE30'},
  'REFERRAL':{amount:50, label:'Referral Discount'},
  'FAMILY':  {amount:50, label:'Family Discount'}
};

// ── STATE ────────────────────────────────────────────────
const S = {
  step: 1,
  propType: null,    // residential | commercial
  role: null,        // homebuyer | homeowner | agent
  service: null,     // resale | phase | foundation | mold | termite | prelisting | warranty
  military: false,
  sqft: null,
  year: null,
  foundation: null,  // slab | crawl
  phase: null,       // 1|2|3|4
  foundLevel: null,  // A|B
  moldType: null,    // iaq | assessment
  resalePkg: null,   // core | pro
  addons: {
    mold: false,
    wdi: false,
    repair: false,
    extraSamples: 0
  },
  coupon: null,      // {amount, label}
  basePrice: null,
  customQuote: false,
};

// ── HELPERS ──────────────────────────────────────────────
function lookup(table, sqft) {
  if(!sqft) return null;
  for(const t of table) { if(sqft <= t.max) return t.p; }
  return null;
}
function fmt(n) { return n != null ? '$' + n.toLocaleString() : '—'; }
function ageFee(year) {
  if(!year) return 0;
  for(const b of AGE_SURCHARGE) { if(year >= b.from && year <= b.to) return b.fee; }
  return 0;
}
function crawlFee() { return S.foundation === 'crawl' ? 100 : 0; }
function isCustom() { return S.sqft && S.sqft > 6000; }

function scrollToWizard() {
  document.getElementById('wizard-top').scrollIntoView({behavior:'smooth', block:'start'});
}

// ── PROGRESS ─────────────────────────────────────────────
const STEP_LABELS = ['Type','Service','Details','Add-ons','Book'];
function updateProgress(step) {
  for(let i=1;i<=5;i++){
    const dot = document.getElementById('pd'+i);
    const lbl = document.getElementById('pl-'+i);
    dot.classList.remove('active','done');
    lbl.classList.remove('active','done');
    if(i < step){ dot.classList.add('done'); lbl.classList.add('done'); dot.textContent='✓'; }
    else if(i === step){ dot.classList.add('active'); lbl.classList.add('active'); dot.textContent=i; }
    else { dot.textContent=i; }
    const line = document.getElementById('pl'+i);
    if(line) line.classList.toggle('done', i < step);
  }
}

// ── NAVIGATION ───────────────────────────────────────────
function goStep(n) {
  if(n===5) buildAddons();
  if(n===6) renderFinalSummary();
  document.querySelectorAll('.step-section').forEach(s=>s.classList.remove('active'));
  document.getElementById('step-'+n).classList.add('active');
  S.step = n;
  updateProgress(n);
  scrollToWizard();
}

// ── STEP 1: PROPERTY TYPE ────────────────────────────────
function pickPropertyType(t) {
  S.propType = t;
  ['residential','commercial'].forEach(x=>{
    document.getElementById('cc-'+x).classList.toggle('selected', x===t);
  });
  if(t==='commercial'){
    window.location.href='https://www.commercialpropertyinspectionstx.com/Contact.html';
    return;
  }
  document.getElementById('next-1').disabled = false;
}

// ── STEP 2: ROLE ─────────────────────────────────────────
function pickRole(r) {
  S.role = r;
  ['homebuyer','homeowner','agent'].forEach(x=>{
    document.getElementById('cc-'+x).classList.toggle('selected', x===r);
  });
  // Show agent fields if role=agent
  document.getElementById('agent-fields').style.display = (r==='agent') ? 'block' : 'none';
  document.getElementById('next-2').disabled = false;
  buildStep3Cards();
}

function toggleMilitary() {
  S.military = !S.military;
  document.getElementById('mil-wrap').classList.toggle('active', S.military);
  // If military, WDI addon forced free — update summary if on step 5
  if(S.step >= 5) renderSummary();
}

// ── STEP 3: SERVICE CARDS ────────────────────────────────
const SERVICE_DEFS = {
  homebuyer: [
    { id:'resale', icon:'🏠', title:'Resale Home Inspection', desc:'Buying an existing home. Choose Core or Pro — both include infrared thermal imaging, moisture testing, and our industry-leading report.', tag:'✦ Core · Pro · Add-ons' },
    { id:'phase', icon:'🏗️', title:'New Construction Phase Inspection', desc:'Building a new home with a builder. ICC-certified inspections at every critical stage — the only ICC-certified inspector in Fort Bend County.', tag:'✦ Phase 1 · 2 · 3 · 4' },
    { id:'foundation', icon:'📐', title:'Standalone Foundation Inspection', desc:'Foundation evaluation only — Level A visual assessment or Level B full ZIPLEVEL® precision survey.', tag:'✦ Level A · Level B' },
    { id:'mold', icon:'🧪', title:'Standalone Mold / IAQ Inspection', desc:'Air and surface sampling with certified lab results, or a full mold assessment + sampling. No home inspection required.', tag:'✦ IAQ Sampling · Assessment' },
    { id:'termite', icon:'🪲', title:'Standalone WDI Termite Inspection', desc:'TDA-licensed wood-destroying insect inspection. Required by most lenders. Identify active infestations and conditions that invite future activity.', tag:'✦ TDA #801793' },
  ],
  homeowner: [
    { id:'warranty', icon:'📋', title:'Builder Warranty Inspection (MEPS)', desc:'Your 11-month window before your builder\'s 1-year warranty expires. MEPS inspection — Mechanical, Electrical, Plumbing, Structural. Your last chance to make them fix it at no cost.', tag:'✦ Phase 4 Pricing' },
    { id:'prelisting', icon:'🏷️', title:'Pre-Listing Inspection', desc:'Selling your home? A pre-listing MEPS inspection identifies issues before buyers find them — giving you control of the negotiation.', tag:'✦ MEPS Scope' },
    { id:'foundation', icon:'📐', title:'Standalone Foundation Inspection', desc:'Level A visual assessment or Level B full ZIPLEVEL® precision survey with CAD drawing and deflection analysis.', tag:'✦ Level A · Level B' },
    { id:'mold', icon:'🧪', title:'Mold / IAQ Inspection', desc:'Professional air and surface sampling with certified lab results, or a full mold assessment + sampling.', tag:'✦ IAQ Sampling · Assessment' },
    { id:'termite', icon:'🪲', title:'WDI Termite Inspection', desc:'TDA-licensed wood-destroying insect inspection. One visit, official report.', tag:'✦ TDA #801793' },
  ],
  agent: [
    { id:'resale', icon:'🏠', title:'Resale Home Inspection', desc:'For your buyer purchasing an existing home. Core or Pro — both include infrared imaging and our Repair Request Builder for negotiations.', tag:'✦ Core · Pro · Add-ons' },
    { id:'phase', icon:'🏗️', title:'New Construction Phase Inspection', desc:'For your buyer building with a builder. ICC-certified at every stage — Fort Bend County\'s only ICC-certified inspector.', tag:'✦ Phase 1 · 2 · 3 · 4' },
    { id:'foundation', icon:'📐', title:'Standalone Foundation Inspection', desc:'Level A or Level B precision survey — powerful negotiating data for your clients.', tag:'✦ Level A · Level B' },
    { id:'mold', icon:'🧪', title:'Standalone Mold / IAQ Inspection', desc:'Certified air and surface sampling. One visit, full written report.', tag:'✦ IAQ Sampling · Assessment' },
    { id:'termite', icon:'🪲', title:'Standalone WDI Termite Inspection', desc:'TDA-licensed WDI inspection. Required by most lenders — book alongside any inspection.', tag:'✦ TDA #801793' },
  ]
};

function buildStep3Cards() {
  const role = S.role;
  const defs = SERVICE_DEFS[role] || SERVICE_DEFS.homebuyer;
  const wrap = document.getElementById('step3-cards');
  wrap.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'choice-grid-2';
  defs.forEach(def => {
    const card = document.createElement('div');
    card.className = 'choice-card';
    card.id = 'svc-'+def.id;
    card.innerHTML = `<div class="cc-icon">${def.icon}</div><div class="cc-title">${def.title}</div><div class="cc-desc">${def.desc}</div><div class="cc-tag">${def.tag}</div>`;
    card.setAttribute('onclick', "window.IPpickService('" + def.id + "')");
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
}

function pickService(svc) {
  S.service = svc;
  S.addons = {mold:false,wdi:false,repair:false,extraSamples:0};
  S.resalePkg = null;
  S.phase = null;
  S.foundLevel = null;
  S.moldType = null;
  document.querySelectorAll('[id^="svc-"]').forEach(c=>c.classList.remove('selected'));
  const el = document.getElementById('svc-'+svc);
  if(el) el.classList.add('selected');
  document.getElementById('next-3').disabled = false;
  configStep4();
}

// ── STEP 4: PROPERTY DETAILS CONFIG ─────────────────────
function configStep4() {
  const svc = S.service;
  // Show/hide field groups
  const show = (id, visible) => {
    const el = document.getElementById(id);
    if(el) el.style.display = visible ? 'block' : 'none';
  };
  // All off first
  ['fg-sqft','fg-year','fg-foundation','fg-phase','fg-found-level','fg-mold-type','fg-resale-pkg'].forEach(id=>show(id,false));
  show('price-preview', false);

  // Sq ft always shown
  show('fg-sqft', true);

  // Year built — resale, prelisting (homeowner services get age surcharge too)
  if(['resale','prelisting'].includes(svc)) show('fg-year', true);

  // Foundation type — resale, phase, foundation standalone
  if(['resale','phase','foundation','warranty','prelisting'].includes(svc)) show('fg-foundation', true);

  // Phase selector
  if(svc === 'phase') show('fg-phase', true);
  if(svc === 'warranty') {
    // Auto-select phase 4
    S.phase = 4;
  }

  // Foundation level
  if(svc === 'foundation') show('fg-found-level', true);

  // Mold type
  if(svc === 'mold') show('fg-mold-type', true);

  // Resale package
  if(svc === 'resale') show('fg-resale-pkg', true);

  S.sqft = null;
  S.year = null;
  S.foundation = null;
  const sqftInp = document.getElementById('inp-sqft');
  const yearInp = document.getElementById('inp-year');
  if(sqftInp) sqftInp.value = '';
  if(yearInp) yearInp.value = '';
  document.querySelectorAll('.radio-btn').forEach(rb=>rb.classList.remove('selected'));
  document.getElementById('next-4').disabled = true;
  document.getElementById('price-preview').style.display = 'none';
  document.getElementById('custom-quote-wrap').style.display = 'none';

  // Build resale package cards
  if(svc === 'resale') buildResalePackages();
}

function buildResalePackages() {
  const wrap = document.getElementById('pkg-cards-wrap');
  const pkgs = [
    {
      id:'core', name:'Core', subtitle:'Complete Inspection',
      bullets:['Full TREC Home Inspection','Infrared Thermal Imaging — Included','Moisture Meter Testing Throughout','Photo-Rich Report in 24 Hours','Interactive Summary Webpage','Repair Request Builder'],
      note:'Foundation: Visual Assessment (spot elevation + drainage review)'
    },
    {
      id:'pro', name:'Pro', subtitle:'Core + Foundation Survey',
      featured:true,
      bullets:['Everything in Core, plus:','ZIPLEVEL® Precision Elevation Survey','Full Foundation Footprint Mapped','CAD Drawing in Report','Documented Baseline for Monitoring'],
      note:'Saves $350+ vs standalone foundation survey — the standard for Houston clay soils'
    }
  ];
  wrap.innerHTML = pkgs.map(pkg=>`
    <div class="choice-card${pkg.featured?' selected':''}" id="pkg-${pkg.id}" onclick="window.IPpickResalePkg('${pkg.id}')" style="padding:20px">
      ${pkg.featured?'<div style="font-family:\'Montserrat\',sans-serif!important;font-size:.4rem!important;font-weight:800!important;letter-spacing:.2em!important;text-transform:uppercase!important;color:var(--orange)!important;margin-bottom:8px!important">✦ Most Popular</div>':''}
      <div class="cc-title" style="font-size:clamp(18px,2vw,24px)!important;margin-bottom:2px">${pkg.name}</div>
      <div style="font-family:\'Crimson Pro\',serif!important;font-size:13px!important;color:var(--text-muted)!important;margin-bottom:12px!important;font-style:italic">${pkg.subtitle}</div>
      <div class="pc-total-num" id="pkg-price-${pkg.id}" style="font-size:clamp(28px,4vw,40px)!important;color:var(--text-dark)!important;line-height:1!important;margin-bottom:8px">—</div>
      <ul style="list-style:none;margin-bottom:12px">
        ${pkg.bullets.map(b=>`<li style="font-family:'Crimson Pro',serif!important;font-size:13px!important;color:var(--text-mid)!important;padding:4px 0;border-bottom:1px solid rgba(10,22,40,.05);display:flex;gap:7px;align-items:flex-start"><span style="color:var(--orange);flex-shrink:0;margin-top:1px">✦</span>${b}</li>`).join('')}
      </ul>
      <div style="font-family:'Crimson Pro',serif!important;font-size:12px!important;color:var(--orange)!important;font-style:italic!important;line-height:1.45">${pkg.note}</div>
    </div>
  `).join('');
  // Default select pro
  S.resalePkg = 'pro';
}

function pickResalePkg(pkg) {
  S.resalePkg = pkg;
  ['core','pro'].forEach(p=>{
    const el = document.getElementById('pkg-'+p);
    if(el) el.classList.toggle('selected', p===pkg);
  });
  onDetailsChange();
}

function pickFoundation(f) {
  S.foundation = f;
  ['slab','crawl'].forEach(x=>{
    document.getElementById('rb-'+x).classList.toggle('selected',x===f);
  });
  onDetailsChange();
}

function pickPhase(n) {
  S.phase = n;
  [1,2,3,4].forEach(i=>{
    document.getElementById('rb-ph'+i).classList.toggle('selected',i===n);
  });
  onDetailsChange();
}

function pickFoundLevel(l) {
  S.foundLevel = l;
  ['A','B'].forEach(x=>{
    document.getElementById('rb-lvl'+x).classList.toggle('selected',x===l);
  });
  onDetailsChange();
}

function pickMoldType(t) {
  S.moldType = t;
  ['iaq','assess'].forEach(x=>{
    document.getElementById('rb-mold-'+x).classList.toggle('selected',x===t);
  });
  onDetailsChange();
}

// ── PRICE CALCULATION ────────────────────────────────────
function calcBase() {
  const sqft = S.sqft;
  const svc = S.service;
  if(!sqft) return {price:null,lines:[],label:'',detail:'',custom:false};

  if(sqft > 6000) return {price:null,lines:[],label:'',detail:'',custom:true};

  let price = null;
  let lines = [];
  let label = '';
  let detail = '';

  if(svc === 'resale') {
    if(!S.resalePkg) return {price:null,lines:[],label:'',detail:'',custom:false};
    const table = S.resalePkg === 'core' ? RESALE_CORE : RESALE_PRO;
    const base = lookup(table, sqft);
    if(!base) return {price:null,lines:[],label:'',detail:'',custom:true};
    price = base;
    label = S.resalePkg === 'core' ? 'Resale — Core Package' : 'Resale — Pro Package';
    detail = S.resalePkg === 'core' ? 'Full TREC inspection · Infrared imaging · Moisture testing' : 'Full TREC + ZIPLEVEL® Foundation Survey · Infrared · Moisture';
    lines.push({name:'Base Inspection', val:fmt(base)});
    const af = ageFee(S.year);
    if(af > 0) lines.push({name:'Property age adjustment ('+S.year+')', val:'+'+fmt(af), cls:'surcharge'});
    const cf = crawlFee();
    if(cf > 0) lines.push({name:'Crawlspace / Pier & Beam access', val:'+'+fmt(cf), cls:'surcharge'});
    price = base + af + cf;
  }
  else if(svc === 'phase' || svc === 'warranty') {
    const ph = S.phase;
    if(!ph) return {price:null,lines:[],label:'',detail:'',custom:false};
    const tables = [null,PHASE1,PHASE2,PHASE3,PHASE4];
    const phNames = ['','Pre-Pour Foundation','Pre-Drywall Framing','Final New Construction','Builder Warranty (MEPS)'];
    const base = lookup(tables[ph], sqft);
    if(!base) return {price:null,lines:[],label:'',detail:'',custom:true};
    price = base;
    label = 'Phase '+ph+' — '+phNames[ph];
    detail = ph===4 ? 'MEPS inspection — Mechanical, Electrical, Plumbing, Structural' : 'ICC Code-Certified · ZIPLEVEL® included · Report in 24hr';
    lines.push({name:'Phase '+ph+' Inspection', val:fmt(base)});
    const cf = crawlFee();
    if(cf > 0) lines.push({name:'Crawlspace / Pier & Beam access', val:'+'+fmt(cf), cls:'surcharge'});
    price = base + cf;
  }
  else if(svc === 'foundation') {
    if(!S.foundLevel) return {price:null,lines:[],label:'',detail:'',custom:false};
    const table = S.foundLevel === 'A' ? FOUND_A : FOUND_B;
    const base = lookup(table, sqft);
    if(!base) return {price:null,lines:[],label:'',detail:'',custom:true};
    price = base;
    label = 'Foundation Inspection — Level '+S.foundLevel;
    detail = S.foundLevel==='A' ? 'Visual assessment · Spot elevation · Drainage review' : 'ZIPLEVEL® full survey · CAD drawing · Deflection analysis';
    lines.push({name:'Level '+S.foundLevel+' Foundation Inspection', val:fmt(base)});
    const cf = crawlFee();
    if(cf > 0) lines.push({name:'Crawlspace / Pier & Beam access', val:'+'+fmt(cf), cls:'surcharge'});
    price = base + cf;
  }
  else if(svc === 'mold') {
    if(!S.moldType) return {price:null,lines:[],label:'',detail:'',custom:false};
    if(S.moldType === 'iaq') {
      price = 375;
      label = 'Mold IAQ Sampling';
      detail = '3 samples (1 outdoor baseline + 2 indoor) · Certified lab · Written report';
      lines.push({name:'IAQ Sampling — 3 samples', val:fmt(375)});
    } else {
      // assessment scales by sqft modestly
      const assessBase = sqft <= 2000 ? 475 : sqft <= 3000 ? 525 : sqft <= 4000 ? 575 : sqft <= 5000 ? 625 : sqft <= 6000 ? 675 : null;
      if(!assessBase) return {price:null,lines:[],label:'',detail:'',custom:true};
      price = assessBase;
      label = 'Mold Assessment + IAQ Sampling';
      detail = 'Physical building inspection + 3 air samples + certified lab results';
      lines.push({name:'Mold Assessment + 3 IAQ Samples', val:fmt(assessBase)});
    }
  }
  else if(svc === 'termite') {
    const base = lookup(WDI_STANDALONE, sqft);
    if(!base) return {price:null,lines:[],label:'',detail:'',custom:true};
    price = base;
    label = 'WDI Termite Inspection';
    detail = 'TDA-licensed · Wood-destroying insect report · Official form';
    lines.push({name:'WDI Termite Inspection', val:fmt(base)});
  }
  else if(svc === 'prelisting') {
    const base = lookup(PRELISTING, sqft);
    if(!base) return {price:null,lines:[],label:'',detail:'',custom:true};
    price = base;
    label = 'Pre-Listing Inspection (MEPS)';
    detail = 'Mechanical · Electrical · Plumbing · Structural';
    lines.push({name:'Pre-Listing MEPS Inspection', val:fmt(base)});
    const af = ageFee(S.year);
    if(af > 0) lines.push({name:'Property age adjustment ('+S.year+')', val:'+'+fmt(af), cls:'surcharge'});
    const cf = crawlFee();
    if(cf > 0) lines.push({name:'Crawlspace / Pier & Beam access', val:'+'+fmt(cf), cls:'surcharge'});
    price = base + af + cf;
  }

  return {price, lines, label, detail, custom:false};
}

function calcTotal() {
  const base = calcBase();
  if(base.custom) return {total:null,lines:[...base.lines],label:base.label,detail:base.detail,custom:true};
  if(base.price == null) return {total:null,lines:[],label:base.label,detail:base.detail,custom:false};

  let total = base.price;
  let lines = [...base.lines];
  const svc = S.service;
  const sqft = S.sqft;

  // Mold add-on
  if(S.addons.mold && ['resale','phase','prelisting'].includes(svc)) {
    lines.push({name:'Mold IAQ Sampling (3 samples)', val:fmt(275), cls:''});
    lines.push({name:'  ↳ Standalone value: $375', val:'Save $100', cls:'discount'});
    total += 275;
    // Extra samples
    if(S.addons.extraSamples > 0) {
      const extraCost = S.addons.extraSamples * 75;
      lines.push({name:'Additional IAQ Samples (×'+S.addons.extraSamples+')', val:'+'+fmt(extraCost)});
      total += extraCost;
    }
  }

  // WDI add-on
  if(S.addons.wdi && ['resale','phase','prelisting'].includes(svc)) {
    if(S.military) {
      lines.push({name:'🇺🇸 WDI Termite Inspection', val:'Complimentary', cls:'discount'});
      lines.push({name:'  ↳ Military/First Responder benefit', val:'—', cls:'discount'});
    } else {
      const wdiAdd = lookup(WDI_ADDON, sqft) || 95;
      const wdiStand = lookup(WDI_STANDALONE, sqft) || 195;
      const saved = wdiStand - wdiAdd;
      lines.push({name:'WDI Termite Inspection', val:fmt(wdiAdd), cls:''});
      lines.push({name:'  ↳ Standalone: '+fmt(wdiStand), val:'Save '+fmt(saved), cls:'discount'});
      total += wdiAdd;
    }
  }

  // Repair estimate
  if(S.addons.repair && svc === 'resale') {
    lines.push({name:'Repair Estimate Report', val:fmt(130), cls:''});
    lines.push({name:'  ↳ Standalone: $149', val:'Save $19', cls:'discount'});
    total += 130;
  }

  // Coupon
  if(S.coupon) {
    lines.push({name:S.coupon.label, val:'-'+fmt(S.coupon.amount), cls:'discount'});
    total = Math.max(0, total - S.coupon.amount);
  }

  return {total, lines, label:base.label, detail:base.detail, custom:false};
}

// ── DETAILS CHANGE ───────────────────────────────────────
function onDetailsChange() {
  const sqftVal = parseInt(document.getElementById('inp-sqft').value);
  S.sqft = sqftVal && sqftVal >= 100 ? sqftVal : null;

  const yearVal = parseInt(document.getElementById('inp-year').value);
  S.year = yearVal && yearVal >= 1800 && yearVal <= 2026 ? yearVal : null;

  // Update package prices live
  if(S.service === 'resale' && S.sqft) {
    const core = lookup(RESALE_CORE, S.sqft);
    const pro = lookup(RESALE_PRO, S.sqft);
    const coreEl = document.getElementById('pkg-price-core');
    const proEl = document.getElementById('pkg-price-pro');
    if(coreEl) coreEl.textContent = core ? fmt(core) : S.sqft > 6000 ? 'Custom' : '—';
    if(proEl) proEl.textContent = pro ? fmt(pro) : S.sqft > 6000 ? 'Custom' : '—';
  }

  const calc = calcBase();
  const previewEl = document.getElementById('price-preview');
  const customWrap = document.getElementById('custom-quote-wrap');

  if(calc.custom) {
    previewEl.style.display = 'block';
    customWrap.style.display = 'block';
    document.getElementById('pc-svc-name').textContent = '';
    document.getElementById('pc-svc-detail').textContent = '';
    document.getElementById('pc-lines').innerHTML = '';
    document.getElementById('pc-total').textContent = 'Custom';
    document.getElementById('next-4').disabled = true;
    return;
  }

  customWrap.style.display = 'none';

  // Check if we have enough to show a price
  const ready = checkStep4Ready();
  if(calc.price != null) {
    previewEl.style.display = 'block';
    document.getElementById('pc-svc-name').textContent = calc.label;
    document.getElementById('pc-svc-detail').textContent = calc.detail;
    document.getElementById('pc-lines').innerHTML = calc.lines.map(l=>
      `<div class="pc-line${l.cls?' '+l.cls:''}"><span class="pc-line-name">${l.name}</span><span class="pc-line-val">${l.val}</span></div>`
    ).join('');
    document.getElementById('pc-total').textContent = fmt(calc.price);
  } else {
    previewEl.style.display = 'none';
  }

  document.getElementById('next-4').disabled = !ready;
}

function checkStep4Ready() {
  const svc = S.service;
  if(!S.sqft || S.sqft < 100) return false;
  if(S.sqft > 6000) return false;
  if(['resale'].includes(svc) && !S.resalePkg) return false;
  if(['resale','prelisting'].includes(svc) && !S.year) return false;
  if(['resale','phase','foundation','warranty','prelisting'].includes(svc) && !S.foundation) return false;
  if(svc === 'phase' && !S.phase) return false;
  if(svc === 'foundation' && !S.foundLevel) return false;
  if(svc === 'mold' && !S.moldType) return false;
  return true;
}

// ── STEP 5: ADD-ONS ──────────────────────────────────────
function buildAddons() {
  const wrap = document.getElementById('addons-wrap');
  wrap.innerHTML = '';
  const svc = S.service;
  const sqft = S.sqft;

  const addons = [];

  // Mold IAQ (resale, phases 3&4, prelisting, warranty)
  if(['resale','prelisting'].includes(svc) || (svc==='phase' && [3,4].includes(S.phase)) || svc==='warranty') {
    addons.push({
      id:'mold', icon:'🧪',
      eye:'Add-On · Same Visit · Certified Lab',
      title:'Mold & IAQ Air Sampling',
      desc:'3 samples (1 outdoor baseline + 2 indoor) with certified lab analysis. Reveals hidden mold and elevated spore counts no visual inspection can detect.',
      addPrice:275, wasPrice:375, save:100
    });
  }

  // WDI (resale, phase 3, prelisting) — not if military (it's free)
  if(['resale','prelisting'].includes(svc) || (svc==='phase' && S.phase===3)) {
    const wdiAdd = lookup(WDI_ADDON, sqft) || 95;
    const wdiStand = lookup(WDI_STANDALONE, sqft) || 195;
    const saved = wdiStand - wdiAdd;
    addons.push({
      id:'wdi', icon:'🪲',
      eye:'Add-On · TDA Licensed · Same Visit',
      title: S.military ? '🇺🇸 WDI Termite Inspection — Complimentary' : 'WDI Termite Inspection',
      desc:'Official wood-destroying insect report. Required by most lenders. Identifies active infestations, prior damage, and conditions that invite future activity.',
      addPrice: S.military ? 0 : wdiAdd,
      wasPrice: S.military ? null : wdiStand,
      save: S.military ? null : saved,
      military: S.military
    });
  }

  // Repair estimate (resale only)
  if(svc === 'resale') {
    addons.push({
      id:'repair', icon:'📋',
      eye:'Exclusive to Imperial Pro · Resale Only',
      title:'Repair Estimate Report',
      desc:'Every defect priced out line by line with minimum-to-maximum repair cost ranges. Most inspectors hand you a list of problems — we hand you the leverage.',
      addPrice:130, wasPrice:149, save:19
    });
  }

  if(addons.length === 0) {
    wrap.innerHTML = '<p style="font-family:\'Crimson Pro\',serif!important;font-size:clamp(14px,1.3vw,16px)!important;color:var(--text-muted)!important;font-style:italic!important">No additional add-ons available for this service type. Your price is ready to confirm.</p>';
    return;
  }

  addons.forEach(addon => {
    const on = S.addons[addon.id] || addon.military;
    const card = document.createElement('div');
    card.className = 'addon-toggle' + (on?' on':'');
    card.id = 'atog-'+addon.id;
    card.innerHTML = `
      <div class="addon-toggle-inner" onclick="window.IPtoggleAddon('${addon.id}')">
        <div class="toggle-switch"><div class="toggle-knob"></div></div>
        <div class="addon-toggle-body">
          <div class="addon-toggle-eye">${addon.eye}</div>
          <div class="addon-toggle-title">${addon.icon} &nbsp;${addon.title}</div>
          <div class="addon-toggle-desc">${addon.desc}</div>
        </div>
        <div class="addon-toggle-price">
          ${addon.military ? `<div class="atp-num" style="font-size:clamp(16px,1.8vw,22px)!important;color:#6ecf95!important">Complimentary</div>` :
          `<div class="atp-add">Add for</div>
           <div class="atp-num">${fmt(addon.addPrice)}</div>
           ${addon.wasPrice ? `<span class="atp-was">${fmt(addon.wasPrice)}</span><span class="atp-save">Save ${fmt(addon.save)}</span>` : ''}`}
        </div>
      </div>
      ${addon.id==='mold' ? `<div id="extra-samples-wrap" style="display:${on?'block':'none'};padding:12px 20px 16px 80px;border-top:1px solid rgba(184,154,110,.1)">
        <div style="font-family:'Montserrat',sans-serif!important;font-size:.42rem!important;font-weight:700!important;letter-spacing:.16em!important;text-transform:uppercase!important;color:rgba(250,250,248,.35)!important;margin-bottom:10px">Need more samples? — $75 each</div>
        <div style="display:flex;align-items:center;gap:12px">
          <button onclick="window.IPchangeExtraSamples(-1)" style="width:32px;height:32px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#fafaf8;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">−</button>
          <span id="extra-count" style="font-family:'Cormorant Garamond',serif!important;font-size:24px!important;font-weight:600!important;color:#fafaf8!important;min-width:24px;text-align:center">0</span>
          <button onclick="window.IPchangeExtraSamples(1)" style="width:32px;height:32px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#fafaf8;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">+</button>
          <span style="font-family:'Crimson Pro',serif!important;font-size:13px!important;color:rgba(250,250,248,.4)!important">additional samples (3 included)</span>
        </div>
      </div>` : ''}
    `;
    wrap.appendChild(card);
    // Force military WDI on
    if(addon.military) S.addons.wdi = true;
  });

  renderSummary();
}

function toggleAddon(id) {
  if(id==='wdi' && S.military) return; // can't toggle free WDI
  S.addons[id] = !S.addons[id];
  const card = document.getElementById('atog-'+id);
  card.classList.toggle('on', S.addons[id]);
  if(id==='mold') {
    const esWrap = document.getElementById('extra-samples-wrap');
    if(esWrap) esWrap.style.display = S.addons.mold ? 'block' : 'none';
    if(!S.addons.mold) { S.addons.extraSamples = 0; const ec=document.getElementById('extra-count'); if(ec) ec.textContent='0'; }
  }
  renderSummary();
}

function changeExtraSamples(delta) {
  const newVal = Math.max(0, Math.min(6, (S.addons.extraSamples||0) + delta));
  S.addons.extraSamples = newVal;
  const ec = document.getElementById('extra-count');
  if(ec) ec.textContent = newVal;
  renderSummary();
}

function renderSummary() {
  const calc = calcTotal();
  document.getElementById('summary-svc').textContent = calc.label;
  document.getElementById('summary-detail').textContent = calc.detail;
  document.getElementById('summary-lines').innerHTML = (calc.lines||[]).map(l=>
    `<div class="pc-line${l.cls?' '+l.cls:''}"><span class="pc-line-name">${l.name}</span><span class="pc-line-val">${l.val}</span></div>`
  ).join('');
  document.getElementById('summary-total').textContent = calc.total != null ? fmt(calc.total) : '—';
  const milNote = document.getElementById('summary-military-note');
  milNote.style.display = S.military ? 'block' : 'none';
  renderFinalSummary();
}

// ── COUPON ───────────────────────────────────────────────
function toggleCoupon() {
  const field = document.getElementById('coupon-field');
  const icon = document.getElementById('coupon-toggle-icon');
  const isOpen = field.classList.contains('open');
  field.classList.toggle('open', !isOpen);
  icon.textContent = isOpen ? '＋' : '−';
}

function applyCoupon() {
  const val = document.getElementById('coupon-inp').value.trim().toUpperCase();
  const msg = document.getElementById('coupon-msg');
  msg.style.display = 'block';
  if(COUPONS[val]) {
    S.coupon = COUPONS[val];
    msg.className = 'coupon-msg ok';
    msg.textContent = '✓ Code applied — ' + COUPONS[val].label + ': -' + fmt(COUPONS[val].amount) + ' off';
  } else {
    S.coupon = null;
    msg.className = 'coupon-msg err';
    msg.textContent = 'Code not recognized. Check spelling and try again.';
  }
  renderSummary();
}

// ── STEP 6 FINAL SUMMARY ─────────────────────────────────
function renderFinalSummary() {
  const calc = calcTotal();
  document.getElementById('final-lines').innerHTML = (calc.lines||[]).map(l=>
    `<div class="pc-line${l.cls?' '+l.cls:''}"><span class="pc-line-name">${l.name}</span><span class="pc-line-val">${l.val}</span></div>`
  ).join('');
  document.getElementById('final-total').textContent = calc.total != null ? fmt(calc.total) : '—';
}

// ── DATE VALIDATION ──────────────────────────────────────
function validateDates() {
  const d1 = document.getElementById('inp-date1').value;
  const d2 = document.getElementById('inp-date2').value;
  const errEl = document.getElementById('date-err');
  const isWeekend = d => { const day = new Date(d+'T12:00:00').getDay(); return day===0||day===6; };
  let err = '';
  if(d1 && isWeekend(d1)) err = 'Your 1st preferred date falls on a weekend. We are available Monday-Friday only.';
  if(!err && d2 && isWeekend(d2)) err = 'Your 2nd preferred date falls on a weekend. We are available Monday-Friday only.';
  errEl.textContent = err;
  errEl.style.display = err ? 'block' : 'none';
}

function toggleDate3() {
  const inp = document.getElementById('inp-date3');
  const btn = document.getElementById('date3-toggle');
  const isHidden = inp.style.display === 'none';
  inp.style.display = isHidden ? 'block' : 'none';
  btn.textContent = isHidden ? '− Remove 3rd date' : '＋ Add a 3rd preferred date';
}

// ── FORM SUBMISSION ──────────────────────────────────────
function buildSubmissionData() {
  const calc = calcTotal();
  const roleLabels = {homebuyer:'Homebuyer',homeowner:'Homeowner',agent:'Real Estate Agent'};
  const svcLabels = {
    resale:'Resale Home Inspection',
    phase:'New Construction Phase Inspection',
    foundation:'Standalone Foundation Inspection',
    mold:'Mold / IAQ Inspection',
    termite:'WDI Termite Inspection',
    prelisting:'Pre-Listing Inspection (MEPS)',
    warranty:'Builder Warranty Inspection (MEPS)'
  };
  const phaseLabels = {1:'Phase 1 — Pre-Pour Foundation',2:'Phase 2 — Pre-Drywall Framing',3:'Phase 3 — Final New Construction',4:'Phase 4 — Builder Warranty (MEPS)'};
  const pkgLabels = {core:'Core (Visual Foundation Assessment)',pro:'Pro (ZIPLEVEL® Precision Survey)'};

  // Build clean price breakdown string
  const breakdown = (calc.lines||[]).map(function(l){
    return '  ' + l.name + ': ' + l.val;
  }).join('\n');

  // Build add-ons string
  const addonList = [];
  if(S.addons.mold) {
    var moldStr = 'Mold IAQ Sampling — $275 (standalone value: $375, save $100)';
    if(S.addons.extraSamples > 0) moldStr += ' + ' + S.addons.extraSamples + ' extra sample(s) at $75 each';
    addonList.push(moldStr);
  }
  if(S.addons.wdi) {
    if(S.military) {
      addonList.push('WDI Termite Inspection — COMPLIMENTARY (Military/First Responder)');
    } else {
      const wdiAdd = lookup(WDI_ADDON, S.sqft)||95;
      const wdiStand = lookup(WDI_STANDALONE, S.sqft)||195;
      addonList.push('WDI Termite Inspection — $'+wdiAdd+' (standalone: $'+wdiStand+', save $'+(wdiStand-wdiAdd)+')');
    }
  }
  if(S.addons.repair) addonList.push('Repair Estimate Report — $130 (standalone: $149, save $19)');

  return {
    _subject: '⭐ New Booking Request — ' + (svcLabels[S.service]||S.service) + ' | Imperial Pro Inspection',
    _replyto: document.getElementById('inp-email').value,

    '━━ CLIENT INFORMATION ━━': '─────────────────────────',
    'Client Name':    document.getElementById('inp-fname').value + ' ' + document.getElementById('inp-lname').value,
    'Email':          document.getElementById('inp-email').value,
    'Phone':          document.getElementById('inp-phone').value,
    'Role':           roleLabels[S.role]||S.role,
    'Military / First Responder': S.military ? '✅ YES — WDI Termite complimentary applied' : 'No',

    '━━ PROPERTY INFORMATION ━━': '─────────────────────────',
    'Property Address': document.getElementById('inp-address').value,
    'City':            document.getElementById('inp-city').value,
    'State / ZIP':     'TX ' + document.getElementById('inp-zip').value,
    'Square Footage':  S.sqft ? S.sqft + ' sq ft' : 'Not provided',
    'Year Built':      S.year || 'Not provided',
    'Foundation Type': S.foundation === 'crawl' ? 'Crawlspace / Pier & Beam (+$100)' : 'Slab',

    '━━ SERVICE SELECTED ━━': '─────────────────────────',
    'Service Type':    svcLabels[S.service]||S.service,
    'Package / Level': S.resalePkg ? pkgLabels[S.resalePkg]||S.resalePkg :
                       S.foundLevel ? 'Level ' + S.foundLevel :
                       S.moldType ? (S.moldType==='iaq'?'IAQ Sampling (3 samples)':'Assessment + IAQ Sampling') :
                       S.phase ? phaseLabels[S.phase]||('Phase '+S.phase) : 'N/A',
    'Add-Ons Selected': addonList.length ? addonList.join(' | ') : 'None',
    'Coupon Applied':  S.coupon ? S.coupon.label + ' — -$' + S.coupon.amount : 'None',

    '━━ PRICE BREAKDOWN ━━': '─────────────────────────',
    'Line Items': '\n' + breakdown,
    'ESTIMATED TOTAL': calc.total != null ? fmt(calc.total) : 'CUSTOM QUOTE REQUIRED',
    'Pricing Note': 'Quote based on client-provided info. Verify sqft, year built, and foundation type before confirming.',

    '━━ SCHEDULING ━━': '─────────────────────────',
    '1st Preferred Date': document.getElementById('inp-date1').value || 'Not provided',
    '2nd Preferred Date': document.getElementById('inp-date2').value || 'Not provided',
    '3rd Preferred Date': document.getElementById('inp-date3').value || 'Not provided',
    'Access Notes':       document.getElementById('inp-notes').value || 'None',

    '━━ AGENT INFORMATION ━━': '─────────────────────────',
    'Agent Name':  document.getElementById('inp-agent-name').value || 'N/A',
    'Agent Email': document.getElementById('inp-agent-email').value || 'N/A',
  };
}

function validateStep6() {
  const req = ['inp-fname','inp-lname','inp-email','inp-phone','inp-address','inp-city','inp-zip','inp-date1','inp-date2'];
  for(const id of req) {
    const el = document.getElementById(id);
    if(!el||!el.value.trim()) { el.focus(); return false; }
  }
  const d1 = document.getElementById('inp-date1').value;
  const d2 = document.getElementById('inp-date2').value;
  const isWeekend = d => { const day = new Date(d+'T12:00:00').getDay(); return day===0||day===6; };
  if(isWeekend(d1)||isWeekend(d2)) return false;
  return true;
}

async function submitForm() {
  if(!validateStep6()) {
    alert('Please fill in all required fields and ensure preferred dates are on weekdays (Monday–Friday).');
    return;
  }
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  const data = buildSubmissionData();

  try {
    const res = await fetch('https://formspree.io/f/maqpzzbw', {
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(data)
    });
    if(res.ok) {
      document.getElementById('progress-wrap').style.display = 'none';
      document.querySelectorAll('.step-section').forEach(s=>s.style.display='none');
      const sw = document.getElementById('success-wrap');
      sw.classList.add('show');
      scrollToWizard();
    } else {
      btn.disabled = false;
      btn.textContent = 'Submit My Booking Request →';
      alert('Something went wrong. Please try again or call us at (281) 715-9755.');
    }
  } catch(e) {
    btn.disabled = false;
    btn.textContent = 'Submit My Booking Request →';
    alert('Network error. Please try again or call (281) 715-9755.');
  }
}

// ── EXPORT TO window SO onclick="" CAN ALWAYS REACH THEM ──
window.IPgoStep             = goStep;
window.IPpickPropertyType   = pickPropertyType;
window.IPpickRole           = pickRole;
window.IPtoggleMilitary     = toggleMilitary;
window.IPpickService        = pickService;
window.IPpickFoundation     = pickFoundation;
window.IPpickPhase          = pickPhase;
window.IPpickFoundLevel     = pickFoundLevel;
window.IPpickMoldType       = pickMoldType;
window.IPpickResalePkg      = pickResalePkg;
window.IPtoggleAddon        = toggleAddon;
window.IPchangeExtraSamples = changeExtraSamples;
window.IPtoggleCoupon       = toggleCoupon;
window.IPapplyCoupon        = applyCoupon;
window.IPtoggleDate3        = toggleDate3;
window.IPsubmitForm         = submitForm;
window.IPonDetailsChange    = onDetailsChange;
window.IPvalidateDates      = validateDates;

// ── DATE MINIMUMS ────────────────────────────────────────
(function setDateMins(){
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate()+1);
  var mn = tomorrow.toISOString().split('T')[0];
  ['inp-date1','inp-date2','inp-date3'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.min = mn;
  });
})();

// ── INIT ─────────────────────────────────────────────────
updateProgress(1);
