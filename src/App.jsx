import { useState, useEffect, useRef } from “react”;

// RAW CHICKEN WEIGHTS (cooked ÷ 0.8 — breast loses ~20% cooking)
// SUNDAY COOK (1,274g raw total):
//   Plain batch ~1,025g raw: MON L 250g + TUE L 263g + TUE D 263g + WED D 250g
//   Kebab batch ~250g raw:   MON D 250g
// WEDNESDAY COOK (1,787g raw total):
//   Plain batch ~1,275g raw: THU D 250g + FRI L 250g + FRI D 263g + SUN L 263g + SUN D 250g
//   Kebab batch ~512g raw:   THU L 263g + SAT L 250g

const MEALS = {
BK:  { label:“Breakfast”,     name:“Kefir & Granola Bowl”,         macros:{protein:18.4, carbs:46.5, fat:25.2, kcal:521, fibre:15.2} },
TL:  { label:“Lunch/Dinner”,  name:“Thai Fried Rice”,              macros:{protein:89,  carbs:63, fat:25, kcal:835,  fibre:10.7},
ingredients:[“200g chicken breast (cooked)”,“2 large eggs”,“80g chickpeas (drained)”,“110g cooked jasmine rice”,“120g tenderstem broccoli”,“80g carrots”,“50g spinach”,“1 tsp neutral oil”,“1 tbsp soy sauce”,“1 tsp fish sauce”,“½ tsp sesame oil”,“Garlic, ginger, chilli”],
steps:[“Heat oil in wok on high. Fry garlic and ginger 1 min.”,“Add broccoli, carrots and chickpeas. Stir-fry 3 mins.”,“Add chicken, heat through. Push everything to the side.”,“Scramble both eggs in the centre, mix through.”,“Add rice and spinach. Toss 1–2 mins.”,“Season with soy, fish sauce and sesame oil.”] },
KD:  { label:“Lunch/Dinner”,  name:“Kebab Chicken with Naan”,      macros:{protein:80,  carbs:66, fat:17, kcal:742,  fibre:12.2},
ingredients:[“200g chicken breast (cooked)”,“1 naan (~90g)”,“100g chickpeas (drained)”,“130g tenderstem broccoli”,“80g red pepper”,“80g onion”,“1 tsp olive oil”,“Cumin, paprika, coriander, garlic powder, lemon”,“2 tbsp 0% Greek yoghurt”],
steps:[“Reheat kebab chicken in pan or air fryer 3–4 mins.”,“Roast or stir-fry broccoli, pepper and onion.”,“Warm naan in oven or air fryer 3 mins.”,“Mix yoghurt with garlic powder and lemon for sauce.”,“Load naan with chicken, chickpeas, veg and yoghurt sauce.”] },
CPL: { label:“Lunch/Dinner”,  name:“Chicken & Potato Tray”,        macros:{protein:84,  carbs:73, fat:20, kcal:806,  fibre:17.9},
ingredients:[“210g chicken breast (cooked)”,“180g potato cubes (roasted)”,“130g pinto beans (drained)”,“130g tenderstem broccoli”,“80g carrots”,“60g spinach”,“1 tsp olive oil”,“Garlic powder, smoked paprika, thyme”],
steps:[“Re-crisp potato in air fryer 5 mins.”,“Stir-fry or steam broccoli and carrots 4 mins.”,“Warm pinto beans in pan with garlic and cumin.”,“Reheat chicken in pan.”,“Plate over beans. Add potato and veg. Wilt spinach in warm pan.”] },
BL:  { label:“Lunch/Dinner”,  name:“Beef & Bean Bolognese + Rigatoni”, macros:{protein:74,  carbs:87, fat:22, kcal:826,  fibre:19.5},
ingredients:[“200g lean beef mince 5% (raw weight)”,“80g cottage cheese (low-fat)”,“120g pinto beans (drained)”,“80g chickpeas (drained)”,“80g red pepper”,“80g carrots”,“60g spinach”,“100g passata”,“90g rigatoni (dry)”,“1 tsp olive oil”,“Garlic, Italian herbs”],
steps:[“Brown mince in dry pan on high. Drain fat completely.”,“Add oil, garlic, diced pepper and carrot. Soften 4 mins.”,“Add pinto beans, chickpeas, passata and herbs. Simmer 20 mins.”,“Boil rigatoni to packet instructions.”,“Off heat: stir in cottage cheese and spinach.”,“Serve sauce over rigatoni.”] },
KL:  { label:“Lunch/Dinner”,  name:“Kebab Chicken Bowl + Rice”,    macros:{protein:80,  carbs:67, fat:15, kcal:727,  fibre:11.6},
ingredients:[“210g chicken breast (cooked)”,“100g chickpeas (drained)”,“110g cooked jasmine rice”,“130g tenderstem broccoli”,“80g red pepper”,“80g onion”,“1 tsp olive oil”,“Cumin, paprika, coriander, garlic powder, lemon”],
steps:[“Reheat kebab chicken in pan or air fryer 3–4 mins.”,“Stir-fry or steam broccoli, pepper and onion.”,“Warm chickpeas in pan.”,“Reheat rice with splash of water.”,“Serve chicken over rice with veg and chickpeas.”] },
CSL: { label:“Lunch/Dinner”,  name:“Chinese Garlic Stir-fry + Rice”, macros:{protein:79,  carbs:68, fat:15, kcal:722,  fibre:11.9},
ingredients:[“200g chicken breast (cooked)”,“80g chickpeas (drained)”,“110g cooked jasmine rice”,“130g tenderstem broccoli”,“80g red pepper”,“80g onion”,“60g spinach”,“1 tsp neutral oil”,“4–5 garlic cloves”,“1 tbsp soy sauce”,“1 tbsp oyster sauce”,“1 tsp sesame oil”,“1 tsp fresh ginger”],
steps:[“Highest heat. Neutral oil in wok. Garlic and ginger 45 seconds.”,“Add broccoli, pepper and onion. Stir-fry 3–4 mins, keep moving.”,“Add chicken and chickpeas. Toss through 1–2 mins.”,“Add spinach, soy, oyster sauce and sesame oil. Toss 1 min.”,“Reheat rice separately. Serve stir-fry over rice.”] },
};

const DAYS = [
{ name:“Monday”,    short:“Mon”, type:“rest”,  tag:“Rest Day”,        targets:{kcal:2000}, meals:[“BK”,“TL”,“KD”],   totals:{protein:187, kcal:2098, fibre:38} },
{ name:“Tuesday”,   short:“Tue”, type:“rest”,  tag:“Rest Day”,        targets:{kcal:2000}, meals:[“BK”,“CPL”,“KL”],  totals:{protein:182, kcal:2054, fibre:45} },
{ name:“Wednesday”, short:“Wed”, type:“train”, tag:“Training Day 💪”, targets:{kcal:2050}, meals:[“BK”,“BL”,“CSL”],  totals:{protein:171, kcal:2069, fibre:47} },
{ name:“Thursday”,  short:“Thu”, type:“train”, tag:“Training Day 💪”, targets:{kcal:2050}, meals:[“BK”,“KL”,“TL”],   totals:{protein:187, kcal:2083, fibre:38} },
{ name:“Friday”,    short:“Fri”, type:“rest”,  tag:“Rest Day”,        targets:{kcal:2000}, meals:[“BK”,“CSL”,“CPL”], totals:{protein:181, kcal:2049, fibre:45} },
{ name:“Saturday”,  short:“Sat”, type:“train”, tag:“Training Day 💪”, targets:{kcal:2050}, meals:[“BK”,“KD”,“BL”],   totals:{protein:172, kcal:2089, fibre:47} },
{ name:“Sunday”,    short:“Sun”, type:“train”, tag:“Training Day 💪”, targets:{kcal:2050}, meals:[“BK”,“CPL”,“CSL”], totals:{protein:181, kcal:2049, fibre:45} },
];

// ─── CONTAINER DATA ──────────────────────────────────────────────────────────
const CONTAINERS_SUNDAY = [
{ id:“S1”, type:“split”,  label:“Split 1”, left:“250g plain chicken (MON LUNCH Thai)”, right:“110g cooked rice”, note:“Grab and go Monday morning ✓” },
{ id:“S2”, type:“split”,  label:“Split 2”, left:“263g plain chicken (TUE LUNCH C&P)”, right:“180g roasted potato”, note:“Take Small 1 beans alongside to work Tuesday ✓” },
{ id:“S3”, type:“split”,  label:“Split 3”, left:“90g rigatoni — cook Tue night, store here”, right:”(sauce comes from Jar 1)”, note:“Grab Jar 1 alongside to work Wednesday” },
{ id:“S4”, type:“split”,  label:“Split 4”, left:“EMPTY — fill Wednesday night”, right:“THU LUNCH: kebab chicken + rice”, note:“263g kebab chicken | 110g rice from Wed cook” },
{ id:“S5”, type:“split”,  label:“Split 5”, left:“EMPTY — fill Wednesday night”, right:“SAT LUNCH: kebab chicken”, note:“250g kebab chicken from Wed cook. Naan separately.” },
{ id:“J1”, type:“jar”,    label:“Jar 1”,   content:“WED LUNCH bolognese sauce (~380ml)\n120g pinto beans already in sauce\nDO NOT add cottage cheese — stir in fresh”, note:“Lasts 4 days. Keeps safely until Wednesday.” },
{ id:“J2”, type:“jar”,    label:“Jar 2”,   content:“SAT DINNER bolognese sauce (~380ml)\n150g pinto beans already in sauce\nDO NOT add cottage cheese — stir in fresh”, note:“Day 6 — check on smell test before using” },
{ id:“J3”, type:“jar”,    label:“Jar 3”,   content:“Raw diced peppers (~640g)”, note:“Keeps 5 days sealed. Scoop out per meal.” },
{ id:“J4”, type:“jar”,    label:“Jar 4”,   content:“Raw diced onions (~560g)”, note:“Keeps 5 days sealed. Scoop out per meal.” },
{ id:“J5”, type:“jar”,    label:“Jar 5”,   content:“Raw diced carrots (~560g)”, note:“Keeps 5 days sealed. Scoop out per meal.” },
{ id:“B1”, type:“box”,    label:“Box 1”,   content:“Roasted chickpeas (200g)”, note:“SEAL AIRTIGHT immediately. Goes soft within hours if left open. Mon kebab naan + Tue kebab bowl.” },
{ id:“B2”, type:“box”,    label:“Box 2”,   content:“Plain chicken for home dinners:\n• 263g labelled TUE DINNER\n• 250g labelled WED DINNER\n+ 2 small bags of 110g cooked rice for TUE D and WED D”, note:“Keep portions separated inside. Raw chickpeas go in a bowl in fridge.” },
{ id:“SM1”,type:“small”,  label:“Small 1”, content:“Pinto beans 130g — TUE LUNCH C&P”, note:“Goes with Split 2 to work on Tuesday” },
{ id:“SM2”,type:“small”,  label:“Small 2”, content:“Kebab chicken 200g — MON DINNER”, note:“Naan from freezer/bag. Fridge veg from jars.” },
{ id:“SM3”,type:“small”,  label:“Small 3”, content:“Pinto beans 260g — FRI DINNER + SUN LUNCH\n(130g each, scoop out per use)”, note:“Covers both Chicken & Potato meals in second half of week” },
];

const CONTAINERS_WEDNESDAY = [
{ id:“S1r”, type:“split”, label:“Split 1 (refill)”, left:“200g plain chicken (FRI LUNCH Chinese)”, right:“110g cooked rice”, note:“Freed Monday. Refilled Wednesday night for Friday work lunch.” },
{ id:“S4r”, type:“split”, label:“Split 4 (fill now)”, left:“263g kebab chicken (THU LUNCH Kebab bowl)”, right:“110g cooked rice”, note:“Thursday work lunch. Fill tonight.” },
{ id:“S5r”, type:“split”, label:“Split 5 (fill now)”, left:“250g kebab chicken (SAT LUNCH Kebab naan)”, right:”(empty — naan stored separately)”, note:“Saturday work lunch. Fill tonight.” },
{ id:“B1r”, type:“box”,   label:“Box 1 (refill)”,    content:“Roasted chickpeas (200g) — fresh batch”, note:“THU kebab bowl + SAT kebab naan” },
{ id:“B2r”, type:“box”,   label:“Box 2 (refill)”,    content:“Plain chicken for home dinners Thu–Sun:\n• 200g THU DINNER (Thai)\n• 263g FRI DINNER (C&P)\n• 263g SUN LUNCH (C&P)\n• 200g SUN DINNER (Chinese)\n= 926g total — tight in 1L box”, note:“All eaten at home — no split container needed. Add 4 rice bags (110g each) inside for THU D, FRI D, SUN L, SUN D.” },
{ id:“SM1r”,type:“small”, label:“Small 1 (refill)”,  content:“Pinto beans 130g — FRI DINNER C&P”, note:“Freed Tuesday. Top up from remaining stock.” },
{ id:“SM2r”,type:“small”, label:“Small 2 (refill)”,  content:“Roasted potatoes 360g\n(180g for FRI DINNER + 180g for SUN LUNCH)”, note:“Freed Monday. Both C&P portions fit in 500ml.” },
];

// ─── SUNDAY PLAN OF ATTACK ───────────────────────────────────────────────────
const SUNDAY_ATTACK = [
{ phase:“Before you start”, time:”—”, color:”#1a2535”, border:”#60a5fa25”,
steps:[
“Label ALL 15 containers before touching any food — saves huge confusion later”,
“Take 2 naan breads from the freezer or fridge, set aside”,
“Have your kitchen scales out — you’ll need them for portioning”,
“Cube 180g potato (for Tue C&P). Set aside.”,
]},
{ phase:“T+0:00 — Fire everything”, time:“0:00”, color:”#1a3020”, border:”#4ade8025”,
steps:[
“🍚 RICE COOKER: 150g dry jasmine rice + water. Press start. Done.”,
“✈️ AIR FRYER BASKET 1 (200°C, 18 mins): 1,025g plain chicken — garlic powder, salt, pepper, light oil. All 4 plain portions go in together.”,
“✈️ AIR FRYER BASKET 2 (200°C, 20 mins): 200g drained chickpeas tossed in oil + smoked paprika.”,
“🥩 HOB 1 (high heat): 400g beef mince, dry pan, no oil. Break up as it cooks.”,
]},
{ phase:“T+0:05 — Prep veg and beans”, time:“0:05”, color:”#1f1530”, border:”#a78bfa25”,
steps:[
“Dice all 5 peppers → Jar 3. Seal.”,
“Dice all onions → Jar 4. Seal.”,
“Dice all carrots → Jar 5. Seal.”,
“Drain all 3 pinto bean tins: 130g → Small 1, 120g into a bowl (for Jar 1 sauce), 150g into another bowl (for Jar 2 sauce), 260g → Small 3.”,
“Drain all 4 chickpea tins. 200g is already in air fryer basket. Put remaining ~760g in a bowl — goes into fridge loose (it’s fine).”,
“Mince should be browned now — drain fat, return pan to hob.”,
]},
{ phase:“T+0:18 — Basket 1 chicken done”, time:“0:18”, color:”#1a3020”, border:”#4ade8025”,
steps:[
“Plain chicken out of basket 1. Rest 5 mins — don’t cut yet.”,
“✈️ BASKET 1 SWAP (200°C, 18 mins): 250g raw chicken breast in kebab spice (cumin, smoked paprika, coriander, garlic powder, lemon juice). This is MON DINNER only.”,
“✈️ BASKET 2 SWAP (chickpeas should be done ~20 mins): Chickpeas into Box 1 — SEAL IMMEDIATELY. Swap basket 2 to 180g potato cubes in oil + paprika + thyme. 20 mins at 200°C.”,
“🥩 HOB 1 — Build bolognese base: add 1 tsp oil, 80g onion (Jar 4), 3 garlic cloves, 80g pepper (Jar 3), 80g carrot (Jar 5). Soften 4 mins.”,
]},
{ phase:“T+0:25 — Bolognese simmers + rice done”, time:“0:25”, color:”#1f1530”, border:”#a78bfa25”,
steps:[
“Add both bowls of pinto beans (270g total) + 80g raw chickpeas from the bowl + 200g passata + Italian herbs, salt, pepper to mince pan. Stir, reduce to LOW. 20 min simmer.”,
“🍚 Rice cooker done. Fluff and leave lid open 5 mins.”,
“Portion rice: 110g → Split 1 RIGHT side. 110g + 110g into two small snack bags — label TUE DINNER and WED DINNER. Tuck both bags into Box 2.”,
]},
{ phase:“T+0:25–0:35 — Slice and portion plain chicken”, time:“0:30”, color:”#1a2535”, border:”#60a5fa25”,
steps:[
“Weigh and slice the rested plain chicken:”,
“→ 250g into Split 1 LEFT side. Close Split 1. Fridge. ✓”,
“→ 263g into Split 2 LEFT side. (Don’t close yet — potato coming.)”,
“→ 263g into Box 2, labelled TUE DINNER”,
“→ 250g into Box 2, labelled WED DINNER. Close Box 2. Fridge. ✓”,
]},
{ phase:“T+0:36 — Kebab chicken + potatoes done”, time:“0:36”, color:”#1a3020”, border:”#4ade8025”,
steps:[
“Kebab chicken out. Rest 5 mins, slice thinly. Weigh 200g → Small 2 (MON DINNER). Fridge. ✓”,
“Potatoes out — golden and crispy. Weigh 180g → Split 2 RIGHT side. Close Split 2. Fridge. ✓”,
]},
{ phase:“T+0:48 — Bolognese sauce done”, time:“0:48”, color:”#1f1530”, border:”#a78bfa25”,
steps:[
“Off heat. Sauce should be thick and reduced.”,
“DO NOT add cottage cheese — this goes in fresh at serving time only.”,
“Ladle half (~380ml) → Jar 1, label WED LUNCH. The 120g pinto beans are already in the sauce. Fridge.”,
“Ladle other half (~380ml) → Jar 2, label SAT DINNER. The 150g pinto beans are already in the sauce. Fridge.”,
]},
{ phase:“T+0:50 — Final fridge check”, time:“0:50”, color:”#1a3020”, border:”#4ade8025”,
steps:[
“✅ Split 1 — MON LUNCH: chicken + rice. Ready to grab.”,
“✅ Split 2 — TUE LUNCH: chicken + potato. Take Small 1 alongside.”,
“⬜ Split 3 — empty. Cook pasta Tuesday night, store here.”,
“⬜ Split 4 — empty. Fill Wednesday night for THU LUNCH.”,
“⬜ Split 5 — empty. Fill Wednesday night for SAT LUNCH.”,
“✅ Jar 1 — WED LUNCH bolognese sauce (no CC yet).”,
“✅ Jar 2 — SAT DINNER bolognese sauce (no CC yet).”,
“✅ Jars 3/4/5 — peppers, onions, carrots.”,
“✅ Box 1 — roasted chickpeas, sealed airtight.”,
“✅ Box 2 — TUE D + WED D chicken portions + 2 rice bags.”,
“✅ Small 1 — TUE LUNCH pinto beans 130g.”,
“✅ Small 2 — MON DINNER kebab chicken 200g.”,
“✅ Small 3 — FRI D + SUN L pinto beans 260g.”,
“🥣 Bowl in fridge — ~760g raw drained chickpeas for the week.”,
]},
];

const SHOPPING = {
protein: { label:“Protein”, emoji:“🥩”, color:”#f87171”, items:[
{ name:“Chicken breast”, qty:“3.1kg”, note:“Split at home: 1.3kg Sunday cook, 1.8kg Wednesday cook” },
{ name:“Lean beef mince (5% fat)”, qty:“500g”, note:“Bolognese ×2 — both cooked Sunday” },
{ name:“Eggs”, qty:“6-pack”, note:“Thai ×2 servings = 4 eggs. 2 spare.” },
{ name:“Low-fat cottage cheese”, qty:“300g tub”, note:“Bolognese only — stir in fresh per serving, never pre-mix” },
{ name:“0% Greek yoghurt”, qty:“500g tub”, note:“Kebab naan sauce. 2 tbsp per serving.” },
]},
carbs: { label:“Carbs & Grains”, emoji:“🌾”, color:”#60a5fa”, items:[
{ name:“Jasmine rice”, qty:“500g bag”, note:“350g dry needed — Thai, Kebab bowl, Chinese” },
{ name:“Rigatoni pasta”, qty:“500g pack”, note:“180g dry needed — bolognese ×2 only” },
{ name:“Potatoes (Maris Piper)”, qty:“750g bag”, note:“540g needed — C&P ×3 (Tue/Fri/Sun)” },
{ name:“Naan bread”, qty:“4-pack”, note:“2 needed this week. Freeze the other 2.” },
]},
legumes: { label:“Tinned Legumes”, emoji:“🫘”, color:”#a78bfa”, items:[
{ name:“Chickpeas (tinned)”, qty:“4 × 400g tins”, note:“~960g drained needed across Thai, kebab dishes, bolognese, Chinese” },
{ name:“Pinto beans (tinned)”, qty:“3 × 400g tins”, note:“~630g drained needed — C&P ×3 and bolognese ×2” },
{ name:“Passata”, qty:“1 × 500g carton”, note:“200g for bolognese. Rest keeps 5 days.” },
]},
veg: { label:“Fresh Vegetables”, emoji:“🥦”, color:”#4ade80”, items:[
{ name:“Tenderstem broccoli”, qty:“1.6kg”, note:“In every meal except bolognese. Buy loose if available.” },
{ name:“Spinach”, qty:“2 × 200g bags”, note:“580g needed across Thai, C&P, bolognese, Chinese” },
{ name:“Red peppers”, qty:“5 large”, note:“~720g needed — kebab dishes, bolognese, Chinese” },
{ name:“Onions”, qty:“1kg bag”, note:“~560g needed — kebab dishes and Chinese” },
{ name:“Carrots”, qty:“750g bag”, note:“~560g needed — Thai and C&P” },
{ name:“Garlic”, qty:“2 bulbs”, note:“Heavy use — Chinese alone needs 4–5 cloves per serving ×3” },
]},
dairy: { label:“Dairy & Fridge”, emoji:“🥛”, color:”#fbbf24”, items:[
{ name:“Kefir (plain)”, qty:“2 × 750ml”, note:“200g per day. Aim for ≥3g protein per 100ml.” },
]},
breakfast: { label:“Breakfast”, emoji:“🥣”, color:”#fb923c”, items:[
{ name:“High-fibre granola”, qty:“500g box”, note:“60g per day = 420g. Check ≥4g fibre per 25g serving.” },
{ name:“Chia & flaxseed mix”, qty:“250g bag”, note:“25g per day = 175g” },
{ name:“Raspberries or blackberries”, qty:“300g frozen or 2×150g punnets”, note:“Frozen = identical nutrition, fraction of the cost” },
]},
pantry: { label:“Pantry & Sauces”, emoji:“🫙”, color:”#94a3b8”, items:[
{ name:“Low-sodium soy sauce”, qty:“1 bottle” },
{ name:“Oyster sauce”, qty:“1 jar” },
{ name:“Fish sauce”, qty:“1 small bottle” },
{ name:“Sesame oil”, qty:“1 small bottle” },
{ name:“Olive oil”, qty:“1 bottle” },
{ name:“Neutral oil (rapeseed)”, qty:“1 bottle” },
{ name:“Italian mixed herbs”, qty:“1 jar” },
{ name:“Ground cumin”, qty:“1 jar” },
{ name:“Smoked paprika”, qty:“1 jar” },
{ name:“Ground coriander”, qty:“1 jar” },
{ name:“Garlic powder”, qty:“1 jar” },
{ name:“Chilli flakes”, qty:“1 jar” },
{ name:“Dried thyme”, qty:“1 jar” },
]},
};

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────

const MacroBar = ({ p, c, f }) => {
const t = p*4 + c*4 + f*9;
return (
<div style={{display:“flex”,height:4,borderRadius:2,overflow:“hidden”,gap:1,marginTop:5}}>
<div style={{width:`${Math.round(p*4/t*100)}%`,background:”#4ade80”}}/>
<div style={{width:`${Math.round(c*4/t*100)}%`,background:”#60a5fa”}}/>
<div style={{width:`${Math.round(f*9/t*100)}%`,background:”#f59e0b”}}/>

```
</div>
```

);
};

const Chip = ({ label, value, unit, color, sub }) => (

  <div style={{background:color+"12",border:`1px solid ${color}28`,borderRadius:7,padding:"4px 7px",textAlign:"center"}}>
    <div style={{fontSize:8,color:"#475569",fontFamily:"monospace",letterSpacing:1}}>{label}</div>
    <div style={{fontSize:13,fontWeight:700,color,lineHeight:1.1}}>{value}<span style={{fontSize:9,fontWeight:400}}>{unit}</span></div>
    {sub && <div style={{fontSize:8,color:"#334155",marginTop:1}}>{sub}</div>}
  </div>
);

const MealCard = ({ id }) => {
const [open, setOpen] = useState(false);
const m = MEALS[id];
if (!m) return null;
const { protein, carbs, fat, kcal, fibre } = m.macros;
const isBK = id === “BK”;
return (
<div style={{background:”#0b1322”,border:“1px solid #1a2740”,borderRadius:11,overflow:“hidden”,marginBottom:7}}>
<div onClick={() => !isBK && setOpen(!open)} style={{padding:“11px 13px”,cursor:isBK?“default”:“pointer”,display:“flex”,gap:10}}>
<div style={{flex:1}}>
<div style={{fontSize:8,fontFamily:“monospace”,letterSpacing:1.5,color:”#334155”,marginBottom:2}}>{m.label.toUpperCase()}</div>
<div style={{fontSize:14,fontWeight:600,color:”#f1f5f9”}}>{m.name}</div>
<MacroBar p={protein} c={carbs} f={fat}/>
<div style={{display:“flex”,gap:8,marginTop:5,fontSize:10,flexWrap:“wrap”}}>
<span style={{color:”#4ade80”}}>{protein}g P</span>
<span style={{color:”#60a5fa”}}>{carbs}g C</span>
<span style={{color:”#f59e0b”}}>{fat}g F</span>
<span style={{color:”#94a3b8”}}>{kcal} kcal</span>
<span style={{color:”#a78bfa”}}>{fibre}g fibre</span>
</div>
</div>
{!isBK && <div style={{color:”#334155”,fontSize:11,marginTop:2,flexShrink:0}}>{open?“▲”:“▼”}</div>}
</div>
{open && m.ingredients && (
<div style={{padding:“0 13px 13px”,borderTop:“1px solid #1a2740”}}>
<div style={{marginTop:10}}>
<div style={{fontSize:9,color:”#334155”,letterSpacing:1.5,fontFamily:“monospace”,marginBottom:6}}>INGREDIENTS</div>
<div style={{display:“flex”,flexWrap:“wrap”,gap:4}}>
{m.ingredients.map((ing,i) => <span key={i} style={{fontSize:10,color:”#94a3b8”,background:”#1a2740”,padding:“2px 7px”,borderRadius:5,border:“1px solid #263352”}}>{ing}</span>)}
</div>
</div>
{m.steps && (
<div style={{marginTop:10}}>
<div style={{fontSize:9,color:”#334155”,letterSpacing:1.5,fontFamily:“monospace”,marginBottom:6}}>METHOD</div>
{m.steps.map((step,i) => (
<div key={i} style={{display:“flex”,gap:8,marginBottom:5}}>
<div style={{width:15,height:15,borderRadius:“50%”,background:”#1a2740”,border:“1px solid #263352”,display:“flex”,alignItems:“center”,justifyContent:“center”,flexShrink:0,marginTop:1}}>
<span style={{fontSize:8,color:”#475569”}}>{i+1}</span>
</div>
<span style={{fontSize:11,color:”#94a3b8”,lineHeight:1.5}}>{step}</span>
</div>
))}
</div>
)}
</div>
)}
</div>
);
};

const DayTotals = ({ day }) => {
const t = day.totals;
const delta = t.kcal - day.targets.kcal;
return (
<div style={{background:”#070e1a”,border:“1px solid #1a2740”,borderRadius:11,padding:13,marginTop:4}}>
<div style={{fontSize:9,color:”#263352”,letterSpacing:2,fontFamily:“monospace”,marginBottom:9}}>DAILY TOTALS</div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr 1fr 1fr”,gap:6}}>
<Chip label=“KCAL”    value={t.kcal}    unit=””  color={Math.abs(delta)<=150?”#4ade80”:”#f59e0b”} sub={delta>=0?`+${delta}`:`${delta}`}/>
<Chip label="PROTEIN" value={t.protein} unit="g" color={t.protein>=168?”#4ade80”:”#f59e0b”}/>
<Chip label="FIBRE"   value={t.fibre}   unit="g" color="#a78bfa"/>
<Chip label="TARGET"  value={day.targets.kcal} unit="" color="#334155"/>
</div>
</div>
);
};

const ContainerCard = ({ c }) => {
const typeColors = { split:”#60a5fa”, jar:”#a78bfa”, box:”#fb923c”, small:”#4ade80” };
const color = typeColors[c.type] || “#94a3b8”;
const typeLabels = { split:“870ml Split”, jar:“1L Mason Jar”, box:“1L Lunchbox”, small:“500ml Small” };
return (
<div style={{background:”#0b1322”,border:`1px solid ${color}25`,borderRadius:10,padding:“10px 12px”,marginBottom:7}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,marginBottom:6}}>
<div style={{fontSize:13,fontWeight:600,color:”#f1f5f9”}}>{c.label}</div>
<span style={{fontSize:9,color,background:color+“15”,padding:“2px 7px”,borderRadius:4,fontFamily:“monospace”,letterSpacing:1,flexShrink:0}}>{typeLabels[c.type]}</span>
</div>
{c.left !== undefined ? (
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:6}}>
<div style={{background:”#1a2740”,borderRadius:6,padding:“6px 8px”}}>
<div style={{fontSize:8,color:”#334155”,fontFamily:“monospace”,marginBottom:3}}>LEFT SIDE</div>
<div style={{fontSize:10,color:”#94a3b8”,lineHeight:1.4}}>{c.left}</div>
</div>
<div style={{background:”#1a2740”,borderRadius:6,padding:“6px 8px”}}>
<div style={{fontSize:8,color:”#334155”,fontFamily:“monospace”,marginBottom:3}}>RIGHT SIDE</div>
<div style={{fontSize:10,color:”#94a3b8”,lineHeight:1.4}}>{c.right}</div>
</div>
</div>
) : (
<div style={{background:”#1a2740”,borderRadius:6,padding:“6px 8px”,marginBottom:4}}>
<div style={{fontSize:10,color:”#94a3b8”,lineHeight:1.5,whiteSpace:“pre-line”}}>{c.content}</div>
</div>
)}
{c.note && <div style={{fontSize:10,color:”#475569”,marginTop:6,lineHeight:1.4}}>{c.note}</div>}
</div>
);
};

const CheckItem = ({ item, checked, onToggle, color }) => (

  <div onClick={onToggle} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 12px",borderRadius:8,marginBottom:5,cursor:"pointer",background:checked?"#060d18":"#0b1322",border:`1px solid ${checked?"#0f1a2e":"#1a2740"}`,opacity:checked?0.4:1,transition:"all 0.15s"}}>
    <div style={{width:17,height:17,borderRadius:4,flexShrink:0,marginTop:1,border:`2px solid ${checked?color:"#263352"}`,background:checked?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
      {checked && <span style={{color:"#030a14",fontSize:10,fontWeight:900,lineHeight:1}}>✓</span>}
    </div>
    <div style={{flex:1}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
        <span style={{fontSize:13,fontWeight:500,color:checked?"#263352":"#f1f5f9",textDecoration:checked?"line-through":"none"}}>{item.name}</span>
        <span style={{fontSize:11,fontWeight:700,color:checked?"#263352":color,flexShrink:0}}>{item.qty}</span>
      </div>
      {!checked && item.note && <div style={{fontSize:10,color:"#475569",marginTop:2,lineHeight:1.4}}>{item.note}</div>}
    </div>
  </div>
);

const AttackPhase = ({ phase }) => {
const [open, setOpen] = useState(true);
return (
<div style={{marginBottom:8,borderRadius:10,overflow:“hidden”,border:`1px solid ${phase.border}`}}>
<div onClick={() => setOpen(!open)} style={{background:phase.color,padding:“8px 12px”,cursor:“pointer”,display:“flex”,justifyContent:“space-between”,alignItems:“center”}}>
<div>
{phase.time !== “—” && <span style={{fontSize:9,color:”#4ade8060”,fontFamily:“monospace”,fontWeight:600,marginRight:8}}>{phase.time}</span>}
<span style={{fontSize:12,fontWeight:600,color:”#e2e8f0”}}>{phase.phase}</span>
</div>
<span style={{color:”#334155”,fontSize:10}}>{open?“▲”:“▼”}</span>
</div>
{open && (
<div style={{background:”#0b1322”,padding:“8px 12px”}}>
{phase.steps.map((s,i) => (
<div key={i} style={{display:“flex”,gap:8,padding:“5px 0”,borderBottom:i<phase.steps.length-1?“1px solid #0a1220”:“none”}}>
<span style={{fontSize:10,color:”#263352”,flexShrink:0,marginTop:1,fontFamily:“monospace”}}>{i+1}.</span>
<span style={{fontSize:11,color:”#94a3b8”,lineHeight:1.5}}>{s}</span>
</div>
))}
</div>
)}
</div>
);
};

// ─── WEIGHT TRACKER ──────────────────────────────────────────────────────────

const WeightTracker = () => {
const [entries, setEntries] = useState([]);
const [inputWeight, setInputWeight] = useState(””);
const [inputDate, setInputDate] = useState(() => new Date().toISOString().split(“T”)[0]);
const [loaded, setLoaded] = useState(false);
const [saved, setSaved] = useState(false);
const START_WEIGHT = 76;
const GOAL_LOW = 65;
const GOAL_HIGH = 70;

// Load from storage on mount
useEffect(() => {
const load = async () => {
try {
const result = await window.storage.get(“weight-entries”);
if (result && result.value) {
setEntries(JSON.parse(result.value));
}
} catch (e) {
// No entries yet
}
setLoaded(true);
};
load();
}, []);

// Save to storage whenever entries change
useEffect(() => {
if (!loaded) return;
const save = async () => {
try {
await window.storage.set(“weight-entries”, JSON.stringify(entries));
} catch (e) {}
};
save();
}, [entries, loaded]);

const addEntry = () => {
const w = parseFloat(inputWeight);
if (!w || w < 30 || w > 200) return;
if (!inputDate) return;
const existing = entries.find(e => e.date === inputDate);
if (existing) {
setEntries(prev => prev.map(e => e.date === inputDate ? { …e, weight: w } : e));
} else {
setEntries(prev => […prev, { date: inputDate, weight: w }].sort((a,b) => a.date.localeCompare(b.date)));
}
setInputWeight(””);
setSaved(true);
setTimeout(() => setSaved(false), 2000);
};

const removeEntry = (date) => {
setEntries(prev => prev.filter(e => e.date !== date));
};

const sorted = […entries].sort((a,b) => a.date.localeCompare(b.date));

// Group by week (Mon–Sun)
const getWeekKey = (dateStr) => {
const d = new Date(dateStr);
const day = d.getDay();
const diff = d.getDate() - day + (day === 0 ? -6 : 1);
const mon = new Date(d.setDate(diff));
return mon.toISOString().split(“T”)[0];
};

const getMonthKey = (dateStr) => dateStr.slice(0, 7);

const weeklyGroups = {};
sorted.forEach(e => {
const k = getWeekKey(e.date);
if (!weeklyGroups[k]) weeklyGroups[k] = [];
weeklyGroups[k].push(e.weight);
});

const monthlyGroups = {};
sorted.forEach(e => {
const k = getMonthKey(e.date);
if (!monthlyGroups[k]) monthlyGroups[k] = [];
monthlyGroups[k].push(e.weight);
});

const avg = arr => arr.length ? (arr.reduce((a,b) => a+b, 0) / arr.length) : null;

const weeklyAverages = Object.entries(weeklyGroups).map(([week, weights]) => ({
week,
avg: avg(weights),
count: weights.length
})).sort((a,b) => a.week.localeCompare(b.week));

const monthlyAverages = Object.entries(monthlyGroups).map(([month, weights]) => ({
month,
avg: avg(weights),
count: weights.length
})).sort((a,b) => a.month.localeCompare(b.month));

const latestWeight = sorted.length ? sorted[sorted.length - 1].weight : null;
const totalLost = latestWeight ? +(START_WEIGHT - latestWeight).toFixed(1) : null;
const toGoalLow = latestWeight ? +(latestWeight - GOAL_LOW).toFixed(1) : null;
const toGoalHigh = latestWeight ? +(latestWeight - GOAL_HIGH).toFixed(1) : null;

// Weekly loss between consecutive week averages
const weeklyLoss = weeklyAverages.length >= 2
? weeklyAverages.map((w, i) => i === 0 ? null : +(w.avg - weeklyAverages[i-1].avg).toFixed(2))
: [];

const formatDate = (dateStr) => {
const d = new Date(dateStr + “T12:00:00”);
return d.toLocaleDateString(“en-GB”, { day:“numeric”, month:“short” });
};

const formatMonth = (monthStr) => {
const [y, m] = monthStr.split(”-”);
return new Date(y, m-1, 1).toLocaleDateString(“en-GB”, { month:“long”, year:“numeric” });
};

const formatWeek = (weekStr) => {
const mon = new Date(weekStr + “T12:00:00”);
const sun = new Date(mon);
sun.setDate(sun.getDate() + 6);
return `${formatDate(weekStr)} – ${formatDate(sun.toISOString().split("T")[0])}`;
};

// Progress to goal (mid-point 67.5kg)
const goalMid = (GOAL_LOW + GOAL_HIGH) / 2;
const progressPct = latestWeight
? Math.min(100, Math.max(0, Math.round((START_WEIGHT - latestWeight) / (START_WEIGHT - goalMid) * 100)))
: 0;

if (!loaded) return <div style={{padding:24,textAlign:“center”,color:”#334155”,fontSize:12}}>Loading…</div>;

return (
<div style={{padding:“12px 16px 32px”}}>
{/* Stats row */}
{latestWeight && (
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr 1fr”,gap:6,marginBottom:12}}>
<div style={{background:”#0b1322”,border:“1px solid #4ade8028”,borderRadius:9,padding:“8px 10px”,textAlign:“center”}}>
<div style={{fontSize:8,color:”#334155”,fontFamily:“monospace”,letterSpacing:1,marginBottom:2}}>CURRENT</div>
<div style={{fontSize:18,fontWeight:700,color:”#4ade80”}}>{latestWeight}<span style={{fontSize:10,fontWeight:400}}>kg</span></div>
</div>
<div style={{background:”#0b1322”,border:“1px solid #60a5fa28”,borderRadius:9,padding:“8px 10px”,textAlign:“center”}}>
<div style={{fontSize:8,color:”#334155”,fontFamily:“monospace”,letterSpacing:1,marginBottom:2}}>LOST</div>
<div style={{fontSize:18,fontWeight:700,color:totalLost>0?”#60a5fa”:”#f87171”}}>{totalLost>0?”-”:””}{Math.abs(totalLost)}<span style={{fontSize:10,fontWeight:400}}>kg</span></div>
</div>
<div style={{background:”#0b1322”,border:“1px solid #a78bfa28”,borderRadius:9,padding:“8px 10px”,textAlign:“center”}}>
<div style={{fontSize:8,color:”#334155”,fontFamily:“monospace”,letterSpacing:1,marginBottom:2}}>TO GOAL</div>
<div style={{fontSize:18,fontWeight:700,color:”#a78bfa”}}>{toGoalHigh > 0 ? toGoalHigh : “✓”}<span style={{fontSize:10,fontWeight:400}}>{toGoalHigh > 0 ? “kg” : “”}</span></div>
</div>
</div>
)}

```
  {/* Progress bar */}
  {latestWeight && (
    <div style={{background:"#0b1322",border:"1px solid #1a2740",borderRadius:9,padding:"10px 12px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#475569",marginBottom:6}}>
        <span>Start: {START_WEIGHT}kg</span>
        <span style={{color:"#4ade80",fontWeight:600}}>{progressPct}% to goal</span>
        <span>Goal: {GOAL_LOW}–{GOAL_HIGH}kg</span>
      </div>
      <div style={{background:"#1a2740",borderRadius:4,height:8,position:"relative"}}>
        <div style={{width:`${progressPct}%`,height:8,borderRadius:4,background:"linear-gradient(90deg,#4ade80,#60a5fa)",transition:"width 0.4s"}}/>
      </div>
    </div>
  )}

  {/* Log entry */}
  <div style={{background:"#0b1322",border:"1px solid #1a2740",borderRadius:9,padding:"11px 12px",marginBottom:14}}>
    <div style={{fontSize:9,color:"#334155",letterSpacing:2,fontFamily:"monospace",marginBottom:9}}>LOG WEIGH-IN</div>
    <div style={{fontSize:10,color:"#475569",marginBottom:8,lineHeight:1.4}}>Weigh yourself every morning after toilet, before food or water.</div>
    <div style={{display:"flex",gap:8,marginBottom:8}}>
      <input
        type="date"
        value={inputDate}
        onChange={e => setInputDate(e.target.value)}
        style={{flex:1,background:"#1a2740",border:"1px solid #263352",borderRadius:7,padding:"8px 10px",color:"#f1f5f9",fontSize:12,outline:"none"}}
      />
      <div style={{position:"relative",flex:1}}>
        <input
          type="number"
          step="0.1"
          min="30"
          max="200"
          placeholder="kg e.g. 75.4"
          value={inputWeight}
          onChange={e => setInputWeight(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addEntry()}
          style={{width:"100%",background:"#1a2740",border:"1px solid #263352",borderRadius:7,padding:"8px 10px",color:"#f1f5f9",fontSize:12,outline:"none",boxSizing:"border-box"}}
        />
      </div>
    </div>
    <button onClick={addEntry} style={{width:"100%",padding:"9px",borderRadius:7,cursor:"pointer",border:"1px solid #4ade8040",background:saved?"#0d2d1a":"#0d2d1a",color:saved?"#4ade80":"#4ade80",fontSize:12,fontWeight:600}}>
      {saved ? "✓ Saved" : "Log Weight"}
    </button>
  </div>

  {/* Weekly averages */}
  {weeklyAverages.length > 0 && (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:9,color:"#334155",letterSpacing:2,fontFamily:"monospace",marginBottom:8}}>WEEKLY AVERAGES</div>
      {weeklyAverages.map((w, i) => {
        const loss = weeklyLoss[i];
        const isGain = loss !== null && loss > 0;
        const isLoss = loss !== null && loss < 0;
        return (
          <div key={w.week} style={{background:"#0b1322",border:"1px solid #1a2740",borderRadius:8,padding:"9px 12px",marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,fontWeight:500,color:"#f1f5f9"}}>{formatWeek(w.week)}</div>
              <div style={{fontSize:9,color:"#334155",marginTop:1}}>{w.count} weigh-in{w.count !== 1 ? "s" : ""}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{w.avg.toFixed(1)}<span style={{fontSize:10,fontWeight:400,color:"#475569"}}>kg</span></div>
              {loss !== null && (
                <div style={{fontSize:10,fontWeight:600,color:isLoss?"#4ade80":isGain?"#f87171":"#475569"}}>
                  {isLoss ? "▼" : isGain ? "▲" : "—"} {Math.abs(loss).toFixed(2)}kg
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )}

  {/* Monthly averages */}
  {monthlyAverages.length > 0 && (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:9,color:"#334155",letterSpacing:2,fontFamily:"monospace",marginBottom:8}}>MONTHLY AVERAGES</div>
      {monthlyAverages.map((m, i) => {
        const prevAvg = i > 0 ? monthlyAverages[i-1].avg : null;
        const monthLoss = prevAvg ? +(m.avg - prevAvg).toFixed(1) : null;
        return (
          <div key={m.month} style={{background:"#0b1322",border:"1px solid #1a2740",borderRadius:8,padding:"9px 12px",marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:12,fontWeight:500,color:"#f1f5f9"}}>{formatMonth(m.month)}</div>
              <div style={{fontSize:9,color:"#334155",marginTop:1}}>{m.count} weigh-in{m.count !== 1 ? "s" : ""}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:16,fontWeight:700,color:"#f1f5f9"}}>{m.avg.toFixed(1)}<span style={{fontSize:10,fontWeight:400,color:"#475569"}}>kg</span></div>
              {monthLoss !== null && (
                <div style={{fontSize:10,fontWeight:600,color:monthLoss<0?"#4ade80":monthLoss>0?"#f87171":"#475569"}}>
                  {monthLoss<0?"▼":monthLoss>0?"▲":"—"} {Math.abs(monthLoss).toFixed(1)}kg/month
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )}

  {/* Log history */}
  {sorted.length > 0 && (
    <div>
      <div style={{fontSize:9,color:"#334155",letterSpacing:2,fontFamily:"monospace",marginBottom:8}}>ALL ENTRIES</div>
      {[...sorted].reverse().map((e,i) => (
        <div key={e.date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:"#0b1322",border:"1px solid #1a2740",borderRadius:7,marginBottom:4}}>
          <span style={{fontSize:12,color:"#94a3b8"}}>{formatDate(e.date)}</span>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>{e.weight}kg</span>
            <span onClick={() => removeEntry(e.date)} style={{fontSize:10,color:"#334155",cursor:"pointer",padding:"2px 6px",borderRadius:4,border:"1px solid #1a2740"}}>✕</span>
          </div>
        </div>
      ))}
    </div>
  )}

  {sorted.length === 0 && (
    <div style={{textAlign:"center",padding:"32px 0",color:"#334155",fontSize:11,lineHeight:1.7}}>
      No weigh-ins yet.<br/>Log your first one above to get started.
    </div>
  )}

  <div style={{background:"#120a08",border:"1px solid #f59e0b15",borderRadius:9,padding:12,marginTop:8,fontSize:10,color:"#475569",lineHeight:1.7}}>
    <span style={{color:"#f59e0b",fontWeight:600}}>📊 Reading your progress: </span>
    Don't judge by individual days — water, sodium and sleep all shift the number. Weekly averages are the signal. Monthly averages show the real trend. Expect 0.3–0.4kg/week average loss on this plan.
  </div>
</div>
```

);
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
const [tab, setTab]         = useState(“plan”);
const [day, setDay]         = useState(0);
const [contDay, setContDay] = useState(“sunday”);
const [checked, setChecked] = useState({});
const [openCats, setOpenCats] = useState(Object.fromEntries(Object.keys(SHOPPING).map(k=>[k,true])));

const toggleItem = (cat,idx) => { const k=`${cat}-${idx}`; setChecked(c=>({…c,[k]:!c[k]})); };
const toggleCat  = cat => setOpenCats(o=>({…o,[cat]:!o[cat]}));

const allItems = Object.values(SHOPPING).flatMap(c=>c.items);
const done = Object.values(checked).filter(Boolean).length;
const pct  = Math.round(done/allItems.length*100);

const TABS = [[“plan”,“📅 Plan”],[“shopping”,“🛒 Shop”],[“containers”,“📦 Containers”],[“prep”,“🍳 Prep”],[“tracker”,“⚖️ Weight”]];

return (
<div style={{minHeight:“100vh”,background:”#030a14”,fontFamily:”‘Sora’,‘DM Sans’,sans-serif”,color:”#f1f5f9”,maxWidth:480,margin:“0 auto”}}>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet"/>

```
  <div style={{padding:"18px 16px 12px",borderBottom:"1px solid #0b1322"}}>
    <div style={{fontSize:9,color:"#263352",letterSpacing:3,fontFamily:"monospace",marginBottom:2}}>WEEK 1 · FAT LOSS + STRENGTH</div>
    <div style={{fontSize:20,fontWeight:700,letterSpacing:"-0.5px"}}>76kg → 65–70kg</div>
    <div style={{fontSize:11,color:"#475569",marginTop:1}}>Calisthenics Wed / Thu / Sat / Sun · ~2,000–2,050 kcal/day</div>
    <div style={{display:"flex",gap:10,marginTop:7,fontSize:9}}>
      <span style={{color:"#4ade80"}}>● Protein</span>
      <span style={{color:"#60a5fa"}}>● Carbs</span>
      <span style={{color:"#f59e0b"}}>● Fat</span>
      <span style={{color:"#a78bfa"}}>● Fibre</span>
    </div>
  </div>

  <div style={{display:"flex",borderBottom:"1px solid #0b1322",overflowX:"auto",scrollbarWidth:"none"}}>
    {TABS.map(([v,label]) => (
      <button key={v} onClick={() => setTab(v)} style={{flexShrink:0,flex:1,padding:"10px 4px",cursor:"pointer",background:"none",border:"none",borderBottom:tab===v?"2px solid #4ade80":"2px solid transparent",color:tab===v?"#4ade80":"#475569",fontSize:11,fontWeight:tab===v?600:400,whiteSpace:"nowrap"}}>{label}</button>
    ))}
  </div>

  {/* ── PLAN TAB ── */}
  {tab==="plan" && (
    <>
      <div style={{display:"flex",overflowX:"auto",padding:"9px 16px",gap:6,scrollbarWidth:"none",borderBottom:"1px solid #0b1322"}}>
        {DAYS.map((d,i) => (
          <button key={i} onClick={() => setDay(i)} style={{flexShrink:0,padding:"6px 10px",borderRadius:8,cursor:"pointer",border:day===i?"1px solid #4ade8045":"1px solid #1a2740",background:day===i?"#0d2d1a":"#0b1322",color:day===i?"#4ade80":"#475569",fontSize:11,fontWeight:day===i?600:400}}>
            <div>{d.short}</div>
            <div style={{fontSize:7,marginTop:1,color:d.type==="train"?"#f59e0b":"#263352"}}>{d.type==="train"?"TRAIN":"REST"}</div>
          </button>
        ))}
      </div>
      <div style={{padding:"12px 16px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontSize:17,fontWeight:700}}>{DAYS[day].name}</div>
            <div style={{fontSize:9,fontFamily:"monospace",letterSpacing:1.5,color:DAYS[day].type==="train"?"#f59e0b":"#475569",marginTop:1}}>{DAYS[day].tag.toUpperCase()}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:18,fontWeight:700,color:"#4ade80"}}>{DAYS[day].targets.kcal}</div>
            <div style={{fontSize:9,color:"#263352"}}>target kcal</div>
          </div>
        </div>
        {DAYS[day].meals.map(id => <MealCard key={id} id={id}/>)}
        <DayTotals day={DAYS[day]}/>
        <div style={{marginTop:10,padding:10,background:"#0b1322",border:"1px solid #1a2740",borderRadius:10,fontSize:10,color:"#475569",lineHeight:1.6}}>
          <span style={{color:"#64748b",fontWeight:600}}>💧 Hydration: </span>2.5–3L daily. Electrolytes on training days.<br/>
          <span style={{color:"#64748b",fontWeight:600}}>🕐 Timing: </span>Carb-heavy lunch 1–2hrs before training. Protein within 1hr post-session.
        </div>
      </div>
    </>
  )}

  {/* ── SHOPPING TAB ── */}
  {tab==="shopping" && (
    <div style={{padding:"12px 16px 24px"}}>
      <div style={{background:"#0b1322",border:"1px solid #1a2740",borderRadius:10,padding:"10px 12px",marginBottom:13}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:11,color:"#475569"}}>{done} of {allItems.length} items</span>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {done>0 && <span onClick={()=>setChecked({})} style={{fontSize:10,color:"#334155",cursor:"pointer",textDecoration:"underline"}}>reset</span>}
            <span style={{fontSize:12,fontWeight:700,color:pct===100?"#4ade80":"#60a5fa"}}>{pct}%</span>
          </div>
        </div>
        <div style={{background:"#1a2740",borderRadius:4,height:5}}>
          <div style={{width:`${pct}%`,height:5,borderRadius:4,background:pct===100?"#4ade80":"#60a5fa",transition:"width 0.3s"}}/>
        </div>
        {pct===100 && <div style={{fontSize:11,color:"#4ade80",marginTop:7,textAlign:"center"}}>✓ Ready to shop</div>}
      </div>
      {Object.entries(SHOPPING).map(([catKey,cat]) => {
        const catDone = cat.items.filter((_,i)=>checked[`${catKey}-${i}`]).length;
        return (
          <div key={catKey} style={{marginBottom:13}}>
            <div onClick={()=>toggleCat(catKey)} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,cursor:"pointer"}}>
              <span style={{fontSize:16}}>{cat.emoji}</span>
              <span style={{fontSize:13,fontWeight:600,color:cat.color,flex:1}}>{cat.label}</span>
              <span style={{fontSize:10,color:catDone===cat.items.length?"#4ade80":"#334155"}}>{catDone}/{cat.items.length}</span>
              <span style={{fontSize:10,color:"#334155",marginLeft:4}}>{openCats[catKey]?"▲":"▼"}</span>
            </div>
            {openCats[catKey] && cat.items.map((item,idx) => (
              <CheckItem key={idx} item={item} color={cat.color} checked={!!checked[`${catKey}-${idx}`]} onToggle={()=>toggleItem(catKey,idx)}/>
            ))}
          </div>
        );
      })}
      <div style={{background:"#0b1322",border:"1px solid #1a2740",borderRadius:10,padding:12,fontSize:10,color:"#475569",lineHeight:1.7}}>
        <div style={{color:"#64748b",fontWeight:600,marginBottom:4}}>💡 Tips</div>
        Buy chicken in bulk multi-packs — much cheaper per kg. Frozen berries = identical nutrition, fraction of the cost. 4 tins of chickpeas is correct — they're in nearly every meal. Buy tenderstem broccoli loose if you can.
      </div>
    </div>
  )}

  {/* ── CONTAINERS TAB ── */}
  {tab==="containers" && (
    <div style={{padding:"12px 16px 24px"}}>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[["sunday","🟢 After Sunday"],["wednesday","🔵 After Wednesday"]].map(([k,label]) => (
          <button key={k} onClick={()=>setContDay(k)} style={{flex:1,padding:"9px 8px",borderRadius:9,cursor:"pointer",border:contDay===k?`1px solid ${k==="sunday"?"#4ade80":"#60a5fa"}45`:"1px solid #1a2740",background:contDay===k?k==="sunday"?"#0d2d1a":"#0d1f35":"#0b1322",color:contDay===k?k==="sunday"?"#4ade80":"#60a5fa":"#475569",fontSize:11,fontWeight:contDay===k?600:400}}>{label}</button>
        ))}
      </div>
      <div style={{background:"#0b1322",border:"1px solid #1a2740",borderRadius:9,padding:"9px 12px",marginBottom:12,fontSize:10,color:"#64748b",lineHeight:1.5}}>
        {contDay==="sunday"
          ? "What goes into each container immediately after Sunday prep. Splits 4+5 stay empty — filled Wednesday night. All 15 containers accounted for exactly."
          : "What to fill after Wednesday cook using the containers freed from Mon–Wed meals. Fridge is now fully stocked for Thu–Sun."}
      </div>
      <div style={{fontSize:9,color:"#263352",letterSpacing:2,fontFamily:"monospace",marginBottom:8}}>CONTAINER ASSIGNMENT</div>
      {(contDay==="sunday" ? CONTAINERS_SUNDAY : CONTAINERS_WEDNESDAY).map((c,i) => <ContainerCard key={i} c={c}/>)}
    </div>
  )}

  {/* ── PREP TAB ── */}
  {tab==="prep" && (
    <div style={{padding:"12px 16px 24px"}}>
      <div style={{background:"#0d2d1a",border:"1px solid #4ade8025",borderRadius:9,padding:"10px 12px",marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:600,color:"#4ade80",marginBottom:4}}>🟢 Sunday Plan of Attack — ~75 mins</div>
        <div style={{fontSize:10,color:"#64748b",lineHeight:1.5}}>Air fryer, rice cooker and hob all fire up simultaneously at T+0:00. Everything overlaps — you're never waiting for one thing to finish before starting the next.</div>
      </div>
      <div style={{background:"#0b1322",border:"1px solid #1a2740",borderRadius:9,padding:"10px 12px",marginBottom:12}}>
        <div style={{fontSize:9,color:"#263352",letterSpacing:2,fontFamily:"monospace",marginBottom:8}}>RAW CHICKEN WEIGHTS</div>
        <div style={{fontSize:10,color:"#64748b",lineHeight:1.7}}>
          <span style={{color:"#4ade80",fontWeight:600}}>Sunday — Plain batch (1,025g raw): </span>MON L Thai 250g · TUE L C&P 263g · TUE D Kebab bowl 263g · WED D Chinese 250g<br/>
          <span style={{color:"#4ade80",fontWeight:600}}>Sunday — Kebab batch (250g raw): </span>MON D Kebab naan 250g<br/>
          <span style={{color:"#60a5fa",fontWeight:600}}>Wednesday — Plain batch (1,275g raw): </span>THU D 250g · FRI L 250g · FRI D 263g · SUN L 263g · SUN D 250g<br/>
          <span style={{color:"#60a5fa",fontWeight:600}}>Wednesday — Kebab batch (512g raw): </span>THU L 263g · SAT L 250g
        </div>
      </div>
      <div style={{fontSize:9,color:"#263352",letterSpacing:2,fontFamily:"monospace",marginBottom:8}}>STEP BY STEP</div>
      {SUNDAY_ATTACK.map((phase,i) => <AttackPhase key={i} phase={phase}/>)}
      <div style={{background:"#0d1f35",border:"1px solid #60a5fa20",borderRadius:9,padding:"10px 12px",marginTop:12}}>
        <div style={{fontSize:11,fontWeight:600,color:"#60a5fa",marginBottom:4}}>🔵 Wednesday Cook — ~45 mins</div>
        <div style={{fontSize:10,color:"#64748b",lineHeight:1.6}}>Same pattern: rice cooker + both air fryer baskets start simultaneously. Plain chicken (1,275g raw) basket 1, kebab chicken (512g raw) basket 2. Both at 200°C, 18 mins. Rice cooker does 200g dry rice. When chicken is done, potatoes (360g) into basket 1 and chickpeas (200g) into basket 2 — another 20 mins. Portion everything, fill Splits 4+5 for Thu and Sat work lunches.</div>
      </div>
      <div style={{background:"#120a08",border:"1px solid #f59e0b15",borderRadius:9,padding:12,marginTop:10,fontSize:10,color:"#475569",lineHeight:1.7}}>
        <span style={{color:"#f59e0b",fontWeight:600}}>⚠️ Always cook fresh: </span>Tenderstem broccoli (4 mins wok / 8 mins air fryer), spinach (60 sec wok), eggs, garlic, ginger, rigatoni. Pre-cooking any of these makes them unpleasant.<br/>
        <span style={{color:"#f59e0b",fontWeight:600}}>⚠️ Rice safety: </span>Rice cooker holds safely 2 hrs. Portion and fridge within 1 hr of finishing. Never reheat more than once. Eat within 3–4 days.
      </div>
    </div>
  )}

  {/* ── TRACKER TAB ── */}
  {tab==="tracker" && <WeightTracker/>}
</div>
```

);
}