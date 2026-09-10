// Extracted verbatim from netlify_files/index.html. Keep content changes out of the React migration unless source docs change.
const RANKS = [
  {em:"🐾", name:"Rookie",     unlock:"12-Step reader · Discovery Form · Flashcards"},
  {em:"🔥", name:"Apprentice", unlock:"Pivot Points library · Script drills"},
  {em:"🎯", name:"Closer",     unlock:"Grade My Call · Advanced drills"},
  {em:"🏆", name:"Top Rep",    unlock:"Full platform · Mentor status"}
];

const PHASES = ["CONNECT","CONNECT","CONNECT","DISCOVER","DISCOVER","PRESENT","PRESENT","CLOSE","CLOSE","CLOSE","CLOSE","CLOSE"];

const STEPS = [
 {n:1,name:"Preparation / Arrival / Meet & Greet",time:"0–5 min",kpis:"KPIs 1, 2",
  task:"Scope the neighborhood, note roof trends, devices ready. Friendly intro, goodie bag, ask to head inside.",
  scripts:["“Hey [client name], my name is [your name] and I am with New Era Roofs. I am here for our [time of visit] visit. [Client name], is my truck parked over there, okay? Great — well, this goody bag is for you. I hope you enjoy it. Listen, is it okay if we head inside and sit down somewhere, so we can explore what’s going on? Great, let me put my booties on.”"],
  coach:"One-legger check happens here. Decision-maker missing = booking failure logged, full inspection, NO pricing, return visit locked (Scenario 9)."},
 {n:2,name:"Warm Up / Questionnaire",time:"6–30 min",kpis:"KPIs 3, 4, 5, 6",
  task:"Establish trust (FORM: Family / Occupation / Recreation / Motivation), run the Discovery Form, intro funding, run the GoodLeap soft pull.",
  scripts:["“So tell me — what’s new with you guys?”",
   "“Now, before I get the opportunity to investigate the possible challenges on your roof, I want to make sure we’re not wasting your time or mine. Let me pull up what you can potentially qualify for through GoodLeap — it’s a soft pull, zero impact on your credit score, and it takes two minutes. That way, when I come back with numbers, I can show you exactly what this looks like out of pocket versus monthly. Sounds good?”"],
  coach:"For Sale sign in the yard? Name it HERE, not at pricing (Scenario 7). Third-party names surface here — if one appears at the close instead, KPI 4 broke two hours earlier."},
 {n:3,name:"Upfront Contract",time:"5 min",kpis:"KPI 7",
  task:"Mutual agreement on the rest of the visit and that a NO is safe.",
  scripts:["“With your permission, here is what the rest of our visit will look like today… If my recommendation is to repair or replace your roof, then I will be able to share multiple options and prices with you at the end of our conversation today… Now, if you are comfortable with everything, then it’s my job to make it affordable. If I make it affordable, then I did my job and I’ll be able to get your project on our installation schedule. If not, then I came as a stranger, and I left as a friend. Sounds good?”",
   "Safe Space close: “I want you to know that I can take ‘NO’ just as graciously as I can take a ‘YES.’ If for some reason we are not a good fit — this is a ‘Safe Space.’ I want you to feel comfortable telling me ‘No.’ Sounds good?”"],
  coach:"“Not buying anything today” at the door? Accusation audit first, then this contract verbatim (Scenario 8). NEVER the “I’m only here to give information” line — our CSR promised exact pricing."},
 {n:4,name:"Investigation",time:"15 min",kpis:"KPI 8",
  task:"20+ photos minimum, attic AND exterior, video evidence. Bring the roof down to the customer.",
  scripts:["Transition: “Alright, let’s take a look at what I found.”"],
  coach:"Under 20 photos or no attic/video where accessible = the evidence can’t do the talking in Step 5."},
 {n:5,name:"Discovery Presentation",time:"10 min",kpis:"KPI 8",
  task:"Let the pictures talk. The customer diagnoses the problem — not you.",
  scripts:["“Now, what are you feeling after seeing these pictures and videos?” (pause — wait) “Yeah, I agree. I’m afraid a repair is not going to solve this problem. Are we in agreement?”",
   "Transition: “Now that we agree it’s a replacement — let me ask you straight. Would you be against me walking you through everything — the company, the materials, the options — even if at the end the answer is no?”"],
  coach:"Rep analyzing the pictures instead of asking = partial at best. Buy-in is confirmed, never assumed."},
 {n:6,name:"Slide Deck Presentation",time:"5–10 min",kpis:"KPIs 9, 10",
  task:"QUESTION-LED. Don’t tell them what’s on the slide — ask what they make of it. Every slide ends with a question. Every answer is ammunition for the bridge.",
  scripts:["S1 Cover — callback, not a question: “You told me earlier the main thing was [their Discovery answer]. I’m going to keep coming back to that.”",
   "S2 Industry: “Home improvement leads every single industry in complaints — more than 10 million last year. Roofing is one of the worst offenders. Why do you think that is?”",
   "S3 Contractors: “Before I show you why we land where we do — which of these three have you dealt with before?”",
   "S4 Fears: “Remember those 10 million complaints? This is what they look like at the kitchen table. Which of these hits closest to home for you?”",
   "S5 Guarantee: “Of these four pillars, which one is the most important to you?” … “Why is that so important to you?” [Quiet.]",
   "S6 Cost vs Value: “Have you heard of the Cost vs. Value Report?” (Kelley Blue Book of roofing)",
   "S7 Install: “Which of these steps would you want to be dead sure doesn’t get rushed or skipped?”",
   "S8 GBB: “Which one of these options aligns most with you and your family’s needs and safety?”",
   "S9 Alignment tie-downs: “Does it make sense that doing it right the first time costs less than doing it twice?” · “Would you agree the cost of waiting usually ends up higher than the cost of handling it now?” · “Fair to say the crew on your roof matters more than the brand on the shingle?”"],
  coach:"Broadcast deck = ⚠️ ceiling. Only sourced numbers: 10.7M complaints, the 64% seven-year price move. Nothing that dies to a Google search at the kitchen table."},
 {n:7,name:"Product Presentation",time:"10 min",kpis:"KPI 11",
  task:"Roof in a bag. Materials in their hands. GBB packages. The customer builds their own roof.",
  scripts:["Transition: “After seeing these materials, would you settle for anything less for your roof / home?”"],
  coach:"Rep-led show-and-tell = partial. Ownership of the choice is the point."},
 {n:8,name:"Final Bridge",time:"2 min + estimate",kpis:"KPIs 12, 13",
  task:"Eliminate every objection except price and affordability BEFORE numbers exist. Build the estimate with the customer.",
  scripts:["“Other than the price and affordability, is there any reason why I couldn’t get you on the schedule while I’m here? (No.) Great — next step is we’re going to build out your options… we transfer the measurements from the EagleView report into a data form, and we will get 3 options for you. I cannot manipulate numbers. Give me a couple of minutes to build these options for you.”"],
  coach:"A hedge left standing here walks straight into pricing with you. Isolate now."},
 {n:9,name:"Pricing Presentation",time:"15 min",kpis:"KPIs 14, 15",
  task:"Preference + reasoning first. Guarantee before numbers. Retail Best→Good, then discounts Best→Good. Then silence.",
  scripts:["“Out of the 3 packages that we just went over, which one do you feel fits your needs the best?” … “What made you pick that package?”",
   "Price & Value Guarantee: “…he’s going to continue to let you shop us out until the day of the install… if you find someone that does EXACTLY what we do and EXACTLY how we do it, and they can do all that for less than what I’m about to show you, then I need you to bring that back to me in writing, and we will refund you the difference — plus I’m going to give you $100… So is that the peace of mind you’re looking for when you first called New Era Roofs?”",
   "“So this is full retail for the project — this is what it costs to do it the right way.”",
   "PRESENT PRICES. BE QUIET."],
  coach:"The spouse look (Mum’s the Word, Scenario 10) = buying signal. Silence lasts as long as their conversation does. One more value point here talks couples out of a decision they already made."},
 {n:10,name:"Primary Close",time:"15 min",kpis:"KPIs 16, 20, 21, 22",
  task:"Clock in. Universal flow: FM DJ voice → mirror + 4-second silence → acknowledge → question only if the mirror stalls → PRICE → re-close → T.O. chain.",
  scripts:["“Okay, well it sounds like you’re excited to get started, because you told me you want [benefit]. Is [GBB option] the one you would like to move forward with?”",
   "[If no:] “Is it the monthly investment or the total cash investment that doesn’t quite make sense to you?”"],
  coach:"Whoever talks first after the mirror loses. Rising pitch = arguing = lost. Full price is the ONLY price for the rep."},
 {n:11,name:"Call to Manager",time:"10 min",kpis:"KPI 17",
  task:"Every time. Commitment BEFORE the call. Domino/Jenga framing. T.O. chain: Manager → designated 2nd/3rd → Jose H.",
  scripts:["“Let’s take a crack at it and find out what it is.”"],
  coach:"The rep never says relief is possible — the rep says it’s worth a call. Colorado Roof Relief Program moves through the manager only."},
 {n:12,name:"Cool Down / Next Steps",time:"—",kpis:"KPIs 18, 19",
  task:"Take-away close. Resell why they made the right decision. Stress-test the commitment. Not sold? Pull discounts — original estimate holds 45 days. Lock the next step before leaving (SAMFAM).",
  scripts:["“Congratulations, it will be a pleasure working on your project. But before I put this in, I want to be absolutely sure that there is no reason that you may want to turn around and cancel it.”"],
  coach:"Surface reversal risks out loud — including “my daughter is going to ask why I didn’t call her.” Better at the table than in a cancellation email."}
];

const DISCOVERY = [
 "Start here — before the FORM questions (don’t write it down): “So tell me — what’s new with you guys?”",
 "“How long have you owned the home — and who else is part of a decision like this with you?” (pause — surfaces the players)",
 "“What’s the long-term plan for the home — is this the forever home, or a step to something else?” (silence)",
 "“What has brought me here today — and how long has the issue been going on for?” (pause, and probe)",
 "“What’s stopped you from getting this done already?” (silence)",
 "★ WRITE THIS ONE VERBATIM: “When the roof is complete, what do you want to make sure you never worry about again?” (silence) — their exact words here are what you read back at the Final Bridge (Step 8) to trigger “that’s right.”",
 "“Who else’s opinion matters to you on a decision like this?” (silence — catches the hidden third party)",
 "“When would you like this project to be completed?” (silence)",
 "“Have you thought about how you’re going to fund this project — do you have money set aside, or would you like to see our promotional funding?”",
 "Transition: “I’ve asked you a lot of questions — what questions do you have for me before I get up there?”",
 "Permission: “Would it be alright with you if I got up there, showed you exactly what I found, and walked you through what it’ll take to handle this the right way?”",
 "Time check: “Great — do you have about 30–40 more minutes? Do you have to take a call, go somewhere, etc.?”",
 "After the soft pull: “Most people are surprised by what they qualify for — especially with the promotional rates we have right now.”"
];

const SCENARIOS = [
 {n:1,part:1,title:"“We need to think about it”",kpi:"KPI 20 · Step 10",
  what:"A stall, not an objection. Find which of three things is underneath: value, affordability, or timing. Never argue with the stall itself.",
  flow:["“Think about it?” [4-second silence]","“I see how you’d want to think about a decision this size.”","“Can I ask — how long do you feel you’d need?” (a serious answer is a buying signal)","Isolate: “Then when that time comes, the only thing between us would be the investment — or is there something else I missed?”","Diagnose OUT LOUD: “It’s value… affordability… or timing. Which one is it for you?”","Value → Cost vs Value + cinch + Triangle. Affordability → GoodLeap monthly. Timing → Scenario 5."],
  flag:"The no-oriented door (“or is there something else I missed?”) replaces the yes-trap “is that correct?”"},
 {n:2,part:1,title:"“We need three estimates”",kpi:"KPI 22 · Step 10",
  what:"Normal buyer behavior. Surface their decision criteria, get conditional commitment, let the Price & Value Guarantee do the heavy lifting.",
  flow:["“Three estimates?” [4 sec]","“Absolutely understand. Other than wanting those bids, is there anything about New Era that would stop you from feeling comfortable choosing us?”","“When those bids are side by side — what are you going to use to make the final call?” (Do NOT feed them “value.”)","“So if our value holds up against anything you find, is there any reason you couldn’t see yourself being a New Era customer?”","Already chose us? “Someone will always quote this cheaper… that’s exactly why the Price & Value Guarantee exists — you keep shopping us until install day, in writing.”","“Then is there any reason we shouldn’t take this off your plate today — knowing the guarantee protects you either way?”"],
  flag:"If the wall holds — STOP PUSHING. Go to Scenario 3, the parachute."},
 {n:3,part:1,title:"The Stone Wall",kpi:"KPI 22 · Steps 10→12",
  what:"They will not buy while you’re in the house. Quiet wall → parachute. Announced pact → call it out with an accusation audit.",
  flow:["Parachute: “It looks like there’s no way I can earn your business while I’m here — I totally understand.”","“Would you be against giving me the same respect you’re giving the others — and not signing with anyone the night they’re out, either?”","“When’s the last estimate scheduled? I’d like to set our review visit for right after… and honestly, if one of those bids is better than ours, I want to be the first to tell you.”","Announced pact: “You’re probably worried I’m going to spend the next ten minutes trying to talk you out of it. I’m not.”","“If this came in at some number that made it obvious — would tonight still be off the table?” → “So there’s a number in your mind. Would you be against telling me what it is?” → PRICE → T.O. chain."],
  flag:"The exit-sell line lives inside the parachute ONLY. Used earlier, it invites shopping before the wall exists."},
 {n:4,part:1,title:"“We never sign the same day”",kpi:"KPI 20 · Step 10",
  what:"A household rule. Arguing with a rule attacks their identity. Respect it, then create room to decide — the picture exit.",
  flow:["“Never the same day?” [4 sec]","“That’s fair — a rule like that has probably saved you from a bad contractor before.” (Let them tell the story.)","“I need to grab a few more pictures of the roofline for the file anyway. Take the time while I’m out there, talk it over — I can take a no just as graciously as a yes.”","Return: “Where did you two land?” [Silence.]","Still no? Lock the review appointment before you walk out. SAMFAM."],
  flag:"Only use the picture exit if you GENUINELY take pictures. Manufactured busywork corrodes the trust everything stands on."},
 {n:5,part:1,title:"“We have a bonus / tax return coming”",kpi:"KPI 16 · Step 10",
  what:"A timing objection wearing a money costume. Confirm conditional commitment, then bridge the gap with GoodLeap.",
  flow:["“A bonus coming?” [4 sec] “When are you expecting it?”","“So if we were sitting here at the end of [month] with that money in hand — would we be doing business?” (If no → it was never timing; Scenario 1 diagnosis.)","“If I could get the roof on the schedule now, and you didn’t need to put anything toward it until that money arrives — would you be against hearing how that works?”","GoodLeap pre-qual already ran. The bonus lands, they apply it, the roof’s already protecting the house."],
  flag:"Never promise financing terms from memory. Quote what the live pre-qual shows — a promise the paperwork can’t match is a cancel waiting to happen."},
 {n:6,part:1,title:"“Your price is too much”",kpi:"KPI 16 · Step 10",
  what:"Never handle it before you know what it means. “Too much” = value, affordability, timing, or a competitor’s number. Clarify first.",
  flow:["“Too much?” [4-second silence — this alone resolves half of these.]","“How do you mean?” [FM DJ. Silence. Whoever talks first loses.]","“More than we expected” → value: Cost vs Value, cinch, Triangle.","“Can’t swing that right now” → affordability: GoodLeap monthly.","“Waiting on money” → timing: Scenario 5.","“Another company was cheaper” → Triangle + Price & Value Guarantee."],
  flag:"The most common rep failure is ANSWERING this objection. Sort it first."},
 {n:7,part:2,title:"The For Sale Sign in the Yard",kpi:"Step 2 · KPIs 3–4",
  what:"They’re protecting a transaction, not buying peace of mind. Name it in the warm-up or everything after Step 2 lands flat.",
  flow:["“I noticed the For Sale sign out front — congratulations. So what’s the goal for our visit today: getting the house ready to list, or something a buyer’s inspection turned up?”","The economics: “When a buyer’s inspector flags the roof — some buyers walk, the rest negotiate, and they pad the number. Either way, the roof gets paid for. The only question is whether you control the price and the contractor, or the buyer does.”"],
  flag:"Do not quote the “National Board of Realtors 10%” stat — unverified. The logic above carries without a citation that can be fact-checked at the kitchen table."},
 {n:8,part:2,title:"“We’re not buying anything today” (at the door)",kpi:"Step 3 · KPI 7",
  what:"A trust deficit, not an objection. You don’t overcome it — you make it unnecessary.",
  flow:["“Not buying anything today?” [4 sec]","“That’s completely fair — and you’re probably braced for me to spend the next two hours trying to talk you out of that. I’m not going to.”","Then run the Step 3 Upfront Contract VERBATIM, ending on the Safe Space close."],
  flag:"NEVER “didn’t the office tell you I’m only here to give information?” — our CSR promised an inspection AND exact pricing. That line detonates trust at the numbers."},
 {n:9,part:2,title:"Not All Decision-Makers Home",kpi:"Step 1 · KPI 2",
  what:"A booking failure first (log it), a fallback play second: the one-legger protocol. Inspect fully. Present NO pricing.",
  flow:["“Will [spouse] be joining us today?” [No.] “No problem at all. Here’s what I can do while I’m here: questions, walk the property, full inspection — pictures and video, so I can bring the roof down to you.”","“I’d rather go through the numbers once, with both of you, than twice secondhand. When are you both home this week?”","Lock the return appointment before you leave. Run the soft pull if the present co-owner is willing.","“I’ll just fill them in” → “You could — and half of what makes the numbers make sense is everything we walked through together. [Spouse] deserves the same walkthrough, not a summary.”"],
  flag:"A price presented to half the decision unit is a number in a drawer, armed against you. Whoever sits with BOTH homeowners wins the job."},
 {n:10,part:3,title:"Mum’s the Word (the look)",kpi:"Step 9 · KPI 15",
  what:"Not an objection — a buying signal. One spouse checks the other for sign-off. The deal is closing itself. The only way to lose it is to talk.",
  flow:["PRESENT PRICES. BE QUIET.","The 4-second floor doesn’t apply — the silence lasts as long as their conversation does.","Need more privacy than silence gives? The picture exit from Scenario 4 — real pictures, real reason, real room."],
  flag:"Reps who fill this silence with one more value point routinely talk couples out of a decision they already made. Drill the discomfort, not the words."},
 {n:11,part:3,title:"“Your competitor is cheaper”",kpi:"KPIs 22, 16 · Step 10",
  what:"A buying signal wearing a price costume. If they wanted the cheaper bid, they’d have signed it. Never discount to match.",
  flow:["“Cheaper?” [4 sec] “That’s real — someone can always do it cheaper.”","“If both proposals were sitting on this table at the exact same price — who would you choose?” [Us:] “Can I ask why?” [Silence.]","“What else?” [Every reason they name is a reason you no longer have to argue.]","Summary in THEIR words → wait for “that’s right.”","“Given everything you just told me — would you be comfortable giving those up to save the difference?”","Stalls? Triangle + guarantee: apples to apples, in writing, refund plus $100."],
  flag:"Written bid produced? Read the scope line by line — shingle class, decking, ridge vent, workmanship term. Name the deltas without trash-talking."},
 {n:12,part:3,title:"“I don’t want to pay anything down”",kpi:"KPI 16 · Step 10",
  what:"Affordability structure, not affordability. GoodLeap exists for exactly this — and the pre-qual already ran.",
  flow:["“Nothing down?” [4 sec] “Completely understand — a lot of our customers go the same way.”","“Remember the GoodLeap pre-qualification we ran at the start? That was for this moment. Would you be against looking at what your approval actually shows?”"],
  flag:"Screen in hand, terms on screen, nothing from memory."},
 {n:13,part:3,title:"“We can’t afford that monthly payment”",kpi:"KPIs 16, 17 · Steps 10–11",
  what:"Let them name the number. Then the manager owns it. Never lead with the best payment structure.",
  flow:["“The monthly’s the issue — not the roof, not us?” [Confirm isolation.]","“What monthly would actually feel comfortable?” [Their number, not yours.]","“If that were the payment — would we be moving forward while I’m here?” [Commitment BEFORE any call.]","“Let’s take a crack at it and find out what it is.” [Call the manager. Every time.]"],
  flag:"The rep never says the lower payment is possible — the rep says it’s worth a call."},
 {n:14,part:3,title:"“It’s out of our budget”",kpi:"KPI 16 · Step 10",
  what:"When relief can’t reach their number: rescope, never discount. This is the reason GBB exists.",
  flow:["“If that’s where the budget genuinely is, I’m not going to pretend a phone call fixes it. What I can do is take another look at the scope.”","Move the tier: Best → Better, Better → Good. Same crew, same installation standard.","Or move the scope: what must happen now versus what can wait.","Budget question: “When you set that budget, was it built for an investment protecting the house for decades — or closer to a monthly-expenses number?”"],
  flag:"A Good roof installed right beats a Best proposal in a drawer. Rejected: “you deserve this, let’s get this done!” — flattery welded to a push."},
 {n:15,part:3,title:"“You’re being too pushy”",kpi:"KPI 16 · Any step",
  what:"If they say it, it’s true. Full concede, instantly. No “but.”",
  flow:["“I’m sorry — that’s on me, and I appreciate you saying it instead of just shutting down.” [Full stop.]","“My fear is that if I don’t do my job well while I’m here, you end up going with a cut-rate job and paying for it for years. But the pace is yours to set, not mine.”","“So let me just ask straight: where do you actually stand right now?” [Silence.]","Then slow everything down. Return to their discovery answers. Let the Safe Space contract work."],
  flag:"“Pushy” almost always means a specific earlier failure — a skipped mirror, a stacked close, filled silence. In review, find where it STARTED."},
 {n:16,part:4,title:"“My brother does this type of work”",kpi:"KPIs 4, 16 · Steps 2→10",
  what:"They booked us WITH a roofer in the family — that fact is doing a lot of talking. Surface it in Step 2 or eat it at the close.",
  flow:["Step 2: “Have you had anyone else look at this — or is there anyone in the family who does this kind of work?”","At the close: “Your brother does this?” [4 sec] “With a roofer in the family — what had you bring us out here today?” [Silence. The answer IS the objection.]","“Your brother will beat my number. What he can’t give you is what makes the number worth it — a licensed and insured crew, a lifetime workmanship warranty, and a $30,000 third-party guarantee through Directorii. If something leaks in year six, you have a contract and a company. With family, you have an awkward Thanksgiving.”"],
  flag:"Concede the price plainly; win on accountability. No sarcasm at the family’s expense."},
 {n:17,part:4,title:"“I need to talk to my son / daughter”",kpi:"KPIs 4, 16, 18",
  what:"An older homeowner deferring to adult children. NEVER route around the family — invite them in. Legal exposure in Colorado, not just reputation.",
  flow:["“Talk to your son?” [4 sec] “Good — that’s exactly what I’d want my parents to do.”","“Two ways I can help: we get him on the phone right now and I walk him through everything — or I come back when he can be here. Which works better for your family?”","Framework, offered as help: “Does this actually solve the problem? Do you trust the company doing it? Does the number work?”","Closed without the call? Step 12 surfaces the reversal risk at the table."],
  flag:"Kids who feel bypassed kill deals from the driveway. Kids who feel included become the second referral source. If the son calls later, that call is a second sales presentation — take it gladly."},
 {n:18,part:4,title:"“I need to talk to my dad / uncle / neighbor”",kpi:"KPI 16",
  what:"A first-time buyer borrowing confidence. The advisor is a stand-in — expert-transfer or a polite exit from a money conversation.",
  flow:["“Run it by your dad?” [4 sec] “Smart — a second set of eyes never hurts on a first project like this.”","“Can we get him on the phone while I’m here? I’d rather he ask me than ask you to guess.”","Unreachable? “Set your dad aside for one second — just you. The roof, the company, the number: where do you stand?”","“It’s a lot of money” → money diagnosis (Scenarios 13–14); the dad was never the objection. “I just want his eyes on it” → arm the advisor: full scope and photos, follow-up call set."],
  flag:"A confident advisor with real documents closes this deal for you."},
 {n:19,part:4,title:"“No, it’s just the total amount”",kpi:"KPI 16 · Step 10",
  what:"A value gap with a number on it. Find their anchor, measure the real gap, bridge with structure. The total price does not move.",
  flow:["“The total?” [4 sec] “Before I came out today, what did you have in your head for this project?” [Get the number.]","“And after everything we walked through — the Class 4 shingle, the decking, the lifetime workmanship, the guarantee — where are you now?” [The number moves up. It almost always does.]","“So we’re really talking about a [gap] difference, not the whole number. If we can make that difference painless — spread it through the monthly — is there anything else between us?”","Re-anchor with Cost vs Value if their number is years old — the 64% seven-year move is real and published."],
  flag:"If their number doesn’t move after the value recap, the gap is BELIEF, not the total. Do not bridge a belief gap with financing — go cinch the discovery answers."},
 {n:20,part:4,title:"“This is just more than we can afford right now”",kpi:"KPIs 16, 17 · Steps 10–11",
  what:"Affordability, final form. Monthly and down payment are adjustable without touching the total. Find which one pinches.",
  flow:["“More than you can afford right now?” [4 sec]","“Is it the monthly payment or the down payment that’s doing it?” [Their pick is the whole conversation.]","Down payment → GoodLeap, nothing out of pocket (Scenario 12).","Monthly → their number, commitment, manager call (Scenario 13).","“The whole thing” → total-price objection in an affordability coat → Scenario 19; survives the T.O. chain? Rescope via GBB (Scenario 14)."],
  flag:"Rejected: “if you make it easy enough, they’ll buy anything.” That sentence describes a customer as a mark. Our only relief architecture is the Colorado Roof Relief Program — through the manager, never invented at the table."}
];

const FOURCS = [
 {c:"Concede",map:"Tactical empathy — the mirror, the label, the acknowledge. You put yourself on their side BEFORE anything else. This is where reps fail: if your voice rises before you’ve mirrored, the other three C’s never happen."},
 {c:"Commit",map:"Isolation — “If we got that handled, is there anything else?” The Final Bridge logic re-run at the close."},
 {c:"Convince",map:"Reassure / overcome — tie downs, cinch the knot, the Triangle, Cost vs Value, the Price & Value Guarantee."},
 {c:"Close",map:"Re-close and T.O. chain. Every path ends here."}
];

const KPIS = [
 {n:1,name:"Appointment Start Summary",step:"Pre-Step 1",pass:"Summary logged before knocking: players named, purpose stated, neighborhood trends noted.",fail:"No summary, or arriving blind."},
 {n:2,name:"Meet & Greet",step:"Step 1",pass:"Verbatim intro, goodie bag, inside in 5 min. One-legger → protocol engaged, return locked.",fail:"AUTO ❌: any pricing on a one-legger."},
 {n:3,name:"Warm Up",step:"Step 2A",pass:"“What’s new with you guys?” + FORM from the home’s cues. For Sale sign named here.",fail:"Straight to business, or sign present and never named."},
 {n:4,name:"Question & Answer",step:"Step 2B",pass:"Full Discovery Form verbatim incl. outside-input question, probed.",fail:"RETRO ❌: third-party name at close that didn’t surface here."},
 {n:5,name:"Funding Intro",step:"Step 2B",pass:"Funding question verbatim, inside the flow, before soft-pull transition.",fail:"Never introduced before investigation."},
 {n:6,name:"Funding Preapproval",step:"Step 2B",pass:"Soft pull run BEFORE investigation; terms later quoted only from the live screen.",fail:"AUTO ❌: financing promises the paperwork can’t match."},
 {n:7,name:"Upfront Contract",step:"Step 3",pass:"Expectation statement + Safe Space close verbatim. Pact at door → accusation audit first.",fail:"No contract, or the “just information” line."},
 {n:8,name:"Investigation / Discovery Pres.",step:"Steps 4+5",pass:"20+ photos, attic + video. “What are you feeling…?” — customer talks first. No-oriented transition.",fail:"Rep analyzes instead of asking; evidence below standard."},
 {n:9,name:"Slide Deck Presentation",step:"Step 6",pass:"Question-led: every slide hands the floor back. Slide 1 callback. Slide 9 three tie-downs banked. Sourced numbers only.",fail:"⚠️ CEILING: broadcast deck. ❌: unverifiable stat quoted."},
 {n:10,name:"Cost vs Value",step:"Step 6",pass:"Report framed as published standard (Kelley Blue Book of roofing); revisited when value gap appears.",fail:"Never presented."},
 {n:11,name:"Product Presentation",step:"Step 7",pass:"Roof in a bag in their hands, GBB, customer builds; transition question delivered.",fail:"No materials, or jumped to price."},
 {n:12,name:"Final Bridge",step:"Step 8",pass:"Verbatim bridge; isolation complete; “I cannot manipulate numbers.”",fail:"Prices with non-price objections still live."},
 {n:13,name:"Build the Estimate",step:"Step 8",pass:"EagleView transfer at the table, 3 options, ~5 min, customer participates.",fail:"Built away from customer, or <3 options."},
 {n:14,name:"Options Review",step:"Step 9",pass:"Preference AND reasoning captured before any price. Compliment delivered.",fail:"Prices before preference."},
 {n:15,name:"Price Presentation",step:"Step 9",pass:"Guarantee verbatim BEFORE numbers. Retail Best→Good, re-confirm, discounts Best→Good. Then SILENCE.",fail:"⚠️ CEILING: guarantee skipped. ❌: filled the post-price silence."},
 {n:16,name:"Primary Close / Objections",step:"Step 10",pass:"FM DJ → mirror + 4 sec → acknowledge → question fallback. Correct scenario routing. Lands on PRICE → re-close → T.O.",fail:"⚠️ CEILING: question before mirror. ❌: rep discount language, arguing, pressuring seniors."},
 {n:17,name:"Call to Manager",step:"Step 11",pass:"Commitment BEFORE dialing. “Let’s take a crack at it.” Domino/Jenga. Chain respected.",fail:"No call on a live deal, or relief pre-announced."},
 {n:18,name:"Cool Down / Next Steps",step:"Step 12",pass:"Take-away resale + cancel-proofing verbatim. Not sold → discounts pulled, 45 days, review locked.",fail:"Unsold exit with no locked next step."},
 {n:19,name:"Appointment End Summary",step:"Post-12",pass:"Outcome + objection scenario tags + follow-ups + upstream flags logged.",fail:"No summary — the appointment disappears from coaching."},
 {n:20,name:"Objection: Think About It",step:"Scenario 1",pass:"Mirror + 4 sec, isolate with the no-oriented door, diagnose out loud, route correctly.",fail:"Arguing with the stall; fake exits."},
 {n:21,name:"Objection: Second Opinion",step:"Scenario 2",pass:"Criteria surfaced (don’t feed “value”), conditional commitment, guarantee positioned. Wall holds → parachute.",fail:"Closing into a standing wall; exit-sell line used early."},
 {n:22,name:"Objection: Shop Around",step:"Scenarios 3, 11",pass:"Same-price question, their reasons, “that’s right,” Triangle, guarantee. Scope deltas named without trash talk.",fail:"AUTO ❌: any move toward matching the competitor’s number."}
];

const KEYSCRIPTS = [
 {t:"Safe Space Close (Step 3)",s:"“I want you to know that I can take ‘NO’ just as graciously as I can take a ‘YES.’ If for some reason we are not a good fit — this is a ‘Safe Space.’ I want you to feel comfortable telling me ‘No.’ Sounds good?”"},
 {t:"GoodLeap Transition (Step 2)",s:"“Before I get the opportunity to investigate the possible challenges on your roof, I want to make sure we’re not wasting your time or mine. Let me pull up what you can potentially qualify for through GoodLeap — it’s a soft pull, zero impact on your credit score, and it takes two minutes. Sounds good?”"},
 {t:"Final Bridge (Step 8)",s:"“Other than the price and affordability, is there any reason why I couldn’t get you on the schedule while I’m here?”"},
 {t:"Price & Value Guarantee (Step 9)",s:"“…if you find someone that does EXACTLY what we do and EXACTLY how we do it, and they can do all that for less than what I’m about to show you, then I need you to bring that back to me in writing, and we will refund you the difference — plus I’m going to give you $100.”"},
 {t:"The Triangle (Step 10)",s:"Three variables, the customer picks two: Great company & warranties · Great products / top of the line · Lowest price."},
 {t:"Manager Call (Step 11)",s:"“Let’s take a crack at it and find out what it is.” — Commitment before the call. Full price is the ONLY price for the rep."}
];

const CARDS = [
 {f:"Meet & Greet — the opener at the door.",b:"“Hey [client name], my name is [your name] and I am with New Era Roofs. I am here for our [time of visit] visit… this goody bag is for you… is it okay if we head inside and sit down somewhere, so we can explore what’s going on?”"},
 {f:"Warm-up opener — first words after sitting down.",b:"“So tell me — what’s new with you guys?”"},
 {f:"FORM stands for…",b:"Family · Occupation · Recreation · Motivation"},
 {f:"Discovery — the funding question, verbatim.",b:"“Have you thought about how you’re going to fund this project — do you have money set aside, or would you like to see our promotional funding?”"},
 {f:"Discovery — the ★ write-it-verbatim question.",b:"“When the roof is complete, what do you want to make sure you never worry about again?” — their exact words come back at the Final Bridge to trigger “that’s right.”"},
 {f:"Discovery — the hidden third-party catcher.",b:"“Who else’s opinion matters to you on a decision like this?” (silence)"},
 {f:"The Safe Space close.",b:"“I can take ‘NO’ just as graciously as I can take a ‘YES.’ …this is a ‘Safe Space.’ I want you to feel comfortable telling me ‘No.’”"},
 {f:"GoodLeap soft pull — the three framing points.",b:"Soft pull · zero impact on your credit score · two minutes. Protects everyone’s time. Runs BEFORE the investigation."},
 {f:"Discovery Presentation — the question that lets the pictures talk.",b:"“Now, what are you feeling after seeing these pictures and videos?” (pause — wait for the answer)"},
 {f:"Step 5 → Step 6 transition (no-oriented).",b:"“Would you be against me walking you through everything — the company, the materials, the options — even if at the end the answer is no?”"},
 {f:"Slide 2 — the only complaint stat you’re allowed to quote.",b:"“Home improvement leads every single industry in complaints — more than 10 million last year. Roofing is one of the worst offenders.” (10.7M — documented)"},
 {f:"Slide 9 — the three alignment tie-downs.",b:"Right the first time costs less than twice · The cost of waiting ends up higher than handling it now · The crew on your roof matters more than the brand on the shingle."},
 {f:"Product transition (Step 7).",b:"“After seeing these materials, would you settle for anything less for your roof / home?”"},
 {f:"The Final Bridge, verbatim.",b:"“Other than the price and affordability, is there any reason why I couldn’t get you on the schedule while I’m here?”"},
 {f:"Estimate framing — the credibility line.",b:"“We transfer the measurements from the EagleView report into a data form, and we will get 3 options for you. I cannot manipulate numbers.”"},
 {f:"Price & Value Guarantee — the two EXACTLYs.",b:"“If you find someone that does EXACTLY what we do and EXACTLY how we do it, for less — bring it back in writing, and we will refund you the difference, plus $100.”"},
 {f:"The rule the moment prices are on the table.",b:"PRESENT PRICES. BE QUIET. On the spouse look, the silence lasts as long as their conversation does."},
 {f:"Universal objection flow — in order.",b:"FM DJ voice → mirror their words + 4-second silence → acknowledge → question only if the mirror stalls → PRICE → re-close → T.O. chain."},
 {f:"“Think about it?” — the diagnosis, out loud.",b:"“Usually when it comes down to the money, it’s one of three things: value, affordability, or timing. Which one is it for you?”"},
 {f:"The no-oriented isolation door (never the yes-trap).",b:"“Then the only thing between us would be the investment — or is there something else I missed?”"},
 {f:"The parachute — respect ask.",b:"“Would you be against giving me the same respect you’re giving the others — and not signing with anyone the night they’re out, either?”"},
 {f:"Competitor cheaper — the first two questions.",b:"“If both proposals were sitting on this table at the exact same price — who would you choose?” … “Can I ask why?” [Silence. Then:] “What else?”"},
 {f:"Monthly objection — the order of operations.",b:"Isolate (“the monthly’s the issue — not the roof, not us?”) → their number → commitment BEFORE the call → “Let’s take a crack at it and find out what it is.”"},
 {f:"Senior wants to talk to their kids — the rule.",b:"Invite the family IN. “Good — that’s exactly what I’d want my parents to do. We get him on the phone now, or I come back when he can be here. Which works better for your family?”"},
 {f:"Brother in the trade — win on…",b:"Accountability. “Your brother will beat my number. What he can’t give you: licensed & insured crew, lifetime workmanship warranty, $30,000 Directorii guarantee. With family, you have an awkward Thanksgiving.”"}
];

const DRILLS = [
 {n:1,name:"Mirror Discipline",sets:"3 sets × 8 reps",covers:"Scenarios 1–6, 11–15",
  how:"Partner throws objections cold. You must respond with mirror + 4-second silence before ANY other words.",
  pass:"Zero instances of talking inside the 4 seconds. Zero pitch-rise when the objection lands."},
 {n:2,name:"Diagnosis Speed",sets:"2 sets × 8 reps",covers:"Scenarios 1, 6, 13, 14",
  how:"Partner gives a money-flavored stall, then answers your clarifying question with a randomized underlying cause. Name the category (value / affordability / timing / comparison / structure) and route to the correct play.",
  pass:"7 of 8 routed correctly with no-oriented phrasing intact."},
 {n:3,name:"Parachute Delivery",sets:"5 reps",covers:"Scenario 3",
  how:"Full stone-wall roleplay to a booked review appointment.",
  pass:"Pact called out with accusation audit; exit-sell line delivered only inside the parachute; date and time locked before the roleplay ends."},
 {n:4,name:"Silence Endurance",sets:"2 sets × 5 reps",covers:"Scenarios 10 & 11",
  how:"Partner presents the spouse-look or names a cheaper competitor, then goes quiet for up to 60 seconds. Hold silence, or ask only “why?” / “what else?”",
  pass:"No value points volunteered, no discount language, silence held until the partner breaks it."},
 {n:5,name:"One-Legger Protocol",sets:"3 reps",covers:"Scenario 9",
  how:"Roleplay arrival with one homeowner missing, including the “I’ll just fill them in” pushback.",
  pass:"Full inspection offered, ZERO pricing presented, return visit with both homeowners locked with day and time before exit."},
 {n:6,name:"Outside-Voice Diagnosis",sets:"2 sets × 6 reps",covers:"Scenarios 16–18",
  how:"Partner plays brother-in-the-trade, elderly parent deferring to kids, or first-time buyer citing dad — randomized. Identify the advisor type and run the matching play.",
  pass:"Elderly always ends in a family invitation. Trade-family concedes price, wins on accountability. First-timer routes to the ownership question."}
];

const QUIZZES = [
 {rank:1,name:"Apprentice Exam",desc:"The 12 steps, the phases, the Discovery Form, the Upfront Contract.",qs:[
  {q:"What are the four phases of the 12-Step Process, in order?",o:["Connect · Discover · Present · Close","Greet · Inspect · Pitch · Sign","Warm Up · Investigate · Quote · Follow Up","Connect · Present · Discover · Close"],a:0,w:"Connect (1–3), Discover (4–5), Present (6–7), Close (8–12)."},
  {q:"Which step comes immediately after the Warm Up / Questionnaire?",o:["Investigation","Upfront Contract","Slide Deck Presentation","Discovery Presentation"],a:1,w:"Step 3 — mutual agreement on next steps before anything gets inspected."},
  {q:"The warm-up opener, verbatim:",o:["“How’s your day going so far?”","“Tell me about your roof problems.”","“So tell me — what’s new with you guys?”","“Mind if I ask a few quick questions?”"],a:2,w:"Then FORM questions from the home’s cues."},
  {q:"FORM stands for:",o:["Family, Occupation, Recreation, Motivation","Facts, Objections, Rapport, Money","Family, Objectives, Roof, Maintenance","Friends, Occupation, Roof, Money"],a:0},
  {q:"Which Discovery answer gets written down VERBATIM?",o:["Their budget number","“When the roof is complete, what do you want to make sure you never worry about again?”","Their preferred completion date","The funding answer"],a:1,w:"Their exact words get read back at the Final Bridge (Step 8) to trigger “that’s right.”"},
  {q:"Which Discovery question is followed by deliberate SILENCE?",o:["“How long have you owned the home?”","“When would you like this completed?”","“What’s stopped you from getting this done already?”","“Do you have any questions for me?”"],a:2,w:"Ask it, then let the silence work."},
  {q:"The GoodLeap soft pull runs:",o:["After the investigation, before pricing","Only if they ask about financing","At the very end, during the close","Before the investigation — zero impact, two minutes, protects everyone’s time"],a:3,w:"Credit checks run in the first ~15 minutes."},
  {q:"The Safe Space close, verbatim:",o:["“There’s no pressure here at all today.”","“I can take ‘NO’ just as graciously as I can take a ‘YES.’”","“Feel free to say no if you want.”","“I’m not here to sell you anything.”"],a:1},
  {q:"In the Upfront Contract, if you make it affordable and they’re comfortable — what happens? And if not?",o:["You leave a quote; you follow up next week","Project goes on the installation schedule; you came as a stranger and left as a friend","You call your manager; you drop the price","You book a second visit; you send an estimate by email"],a:1},
  {q:"Investigation evidence standard:",o:["10 photos of the worst spots","20+ photos minimum, attic AND exterior, plus video","Drone shots only","Whatever proves the damage"],a:1},
  {q:"The Discovery Presentation question that lets the pictures talk:",o:["“Pretty bad, right?”","“Do you see why you need a new roof?”","“Now, what are you feeling after seeing these pictures and videos?”","“Should I walk you through what I found?”"],a:2,w:"The customer diagnoses the problem — not you."},
  {q:"The Step 5 → 6 transition is no-oriented. Which is ours?",o:["“Ready to see why we’re the best?”","“Would you be against me walking you through everything — even if at the end the answer is no?”","“Let me show you our company story.”","“Can I get 10 more minutes of your time?”"],a:1}
 ]},
 {rank:2,name:"Closer Exam",desc:"Verbatim scripts, the deck, pricing mechanics, KPI mapping.",qs:[
  {q:"The slide deck posture is:",o:["Present each slide clearly and confidently","Don’t tell them what’s on the slide — ask them what they make of it","Keep it under 3 minutes","Skip slides that don’t apply"],a:1,w:"Every slide ends with a question that hands the floor back. Broadcast deck = ⚠️ ceiling."},
  {q:"Slide 1 (Cover) is:",o:["A question about their goals","A callback to their Discovery answer — not a re-asked question","The company story","An agenda for the presentation"],a:1},
  {q:"Which stat are you allowed to quote?",o:["“Roofing is 34% of all complaints”","“The National Board of Realtors says roofs cost sellers 10%”","“More than 10 million home-improvement complaints last year”","“9 out of 10 homeowners overpay”"],a:2,w:"10.7M is documented. Everything else dies to a Google search at the kitchen table."},
  {q:"The three Slide 9 alignment tie-downs are: right-the-first-time, cost of waiting, and…",o:["Our warranty beats everyone’s","The crew on your roof matters more than the brand on the shingle","Financing makes it painless","We’re Colorado’s most trusted"],a:1},
  {q:"Before ANY price is shown, you must capture:",o:["Their budget range","Their GBB preference AND the reasoning behind it","Their credit score","Their timeline"],a:1,w:"“What made you pick that package?” — that reasoning is your re-close ammunition."},
  {q:"The Price & Value Guarantee: find someone who does ______ what we do and ______ how we do it, for less, in writing →",o:["ROUGHLY / MOSTLY — we’ll price match","EXACTLY / EXACTLY — refund the difference plus $100","BETTER / FASTER — refund double","SIMILAR / CLOSE — manager reviews it"],a:1},
  {q:"Retail prices are presented:",o:["Good first, so Best looks premium","Only the package they picked","Best → Good, before any discounts","After discounts, to show savings"],a:2,w:"“This is what it costs to do it the right way.” Then discounts, Best → Good."},
  {q:"The instant prices are on the table:",o:["Recap the top three value points","BE QUIET","Ask which one fits their budget","Offer the manager call"],a:1},
  {q:"One spouse looks at the other in silence (Mum’s the Word). This is:",o:["An objection forming — address it","A buying signal — the silence lasts as long as their conversation does","Confusion — re-explain the options","Time to offer a discount"],a:1},
  {q:"“I cannot manipulate numbers” belongs to:",o:["The Price Presentation","The Manager Call","The Final Bridge / estimate build — EagleView measurements into the data form","The Cool Down"],a:2},
  {q:"Cost vs Value (KPI 10) is framed as:",o:["Our internal pricing sheet","The Kelley Blue Book of roofing — a published standard, not our numbers","A discount calculator","An insurance document"],a:1},
  {q:"Who gives discounts?",o:["The rep, if the customer pushes hard enough","The rep, up to 5%","Nobody — prices are final","The manager, via the T.O. chain. Full price is the ONLY price for the rep."],a:3}
 ]},
 {rank:3,name:"Top Rep Exam",desc:"All 20 pivot scenarios — routing, mechanics, hard lines.",qs:[
  {q:"The universal objection flow, in order:",o:["Acknowledge → question → mirror → close","FM DJ voice → mirror + 4-sec silence → acknowledge → question only if the mirror stalls → PRICE → re-close → T.O.","Question → acknowledge → overcome → close","Mirror → immediately overcome → manager call"],a:1,w:"Mirror first — it surfaces information before you commit to a direction."},
  {q:"“We need to think about it.” You diagnose the money into which categories?",o:["Price, product, company","Value, affordability, timing","Trust, urgency, money","Spouse, budget, competitors"],a:1,w:"Run the diagnosis OUT LOUD and let them pick."},
  {q:"The no-oriented isolation door is:",o:["“Is that correct?”","“Wouldn’t you agree?”","“…or is there something else I missed?”","“So we have a deal, right?”"],a:2,w:"The yes-trap versions are rejected card language."},
  {q:"The stone wall holds after your best close. You:",o:["Keep closing — persistence wins","Drop the price to create urgency","Deploy the parachute — respect ask, review visit set right after their last estimate","Leave a brochure and follow up Monday"],a:2},
  {q:"The exit-sell line (“if one of those bids is better, I want to be the first to tell you”) may be used:",o:["Any time to build trust","Inside the parachute ONLY","During the warm-up","At the Final Bridge"],a:1,w:"Used earlier, it invites shopping before the wall exists."},
  {q:"“We never sign the same day.” The picture exit is legit ONLY if:",o:["You stay out at least 10 minutes","You genuinely take pictures — manufactured busywork corrodes trust","They ask you to leave","Your manager approves it"],a:1},
  {q:"One decision-maker home. The iron rule:",o:["Present pricing so they can share it","Full inspection, NO pricing, return visit with both locked before you leave","Reschedule immediately and leave","Close the one who’s home"],a:1,w:"A price presented to half the decision unit is a number in a drawer, armed against you."},
  {q:"An older homeowner wants to talk to their son first. You:",o:["Close now, handle the son later","Explain why the decision is theirs alone","Invite the family in — phone now, or return when he can be there","Offer a discount that expires tonight"],a:2,w:"Working around the family = cancel + complaint + legal exposure in Colorado."},
  {q:"“My brother does this type of work.” You win on:",o:["Price — match the family discount","Speed of installation","Accountability — licensed crew, lifetime workmanship, $30K Directorii guarantee vs an awkward Thanksgiving","Better shingle brands"],a:2,w:"Concede the price plainly. Never sarcasm at the family’s expense."},
  {q:"“Your competitor is cheaper.” First move after the mirror:",o:["Read their bid and attack the scope","“If both proposals were at the exact same price — who would you choose?”","Show the Triangle immediately","Call the manager for a match"],a:1,w:"Their reasons — “why?” “what else?” — build the case so you don’t have to argue it."},
  {q:"The 4 C’s, mapped to our flow — Concede is:",o:["Giving a small discount to show good faith","Tactical empathy: mirror, label, acknowledge — BEFORE anything else","Agreeing to a follow-up visit","Letting them keep the estimate"],a:1,w:"Concede is where reps fail. The gear-down is the concede."},
  {q:"Spot the REJECTED line:",o:["“That’s fair — a rule like that has probably saved you from a bad contractor before.”","“Didn’t the office tell you I’m only here to give information?”","“Good — that’s exactly what I’d want my parents to do.”","“That’s real — someone can always do it cheaper.”"],a:1,w:"Our CSR promised an inspection AND exact pricing. That line is false and detonates trust at the numbers."},
  {q:"Budget genuinely below what the T.O. chain can approve. You:",o:["Walk away — not our customer","Discount deeper with manager approval","Rescope: move the tier (Best→Better→Good) or move the scope. The total never gets discounted below the floor.","Extend the financing term and hope"],a:2,w:"A Good roof installed right beats a Best proposal in a drawer."},
  {q:"“You’re being too pushy.” You:",o:["“I’m sorry you feel that way, but this roof is urgent.”","Full concede instantly — “that’s on me” — no ‘but’, then slow everything down","Explain you’re just passionate","Hand them to your manager"],a:1,w:"If they say it, it’s true. In review, find where it STARTED, not where it surfaced."}
 ]}
];
/* ================= V2 ADDITIONS — Sales Vocabulary Glossary + Diagnose the Money (six source documents) ================= */

const GLOSSARY = [
 {t:"The 4 C’s",d:"Concede, Commit, Convince, Close. The four moves on every objection, in that order. Concede is the most important: put yourself on the customer’s side before you do anything else. Maps to our flow as tactical empathy → isolation → reassure/overcome → re-close and T.O. chain."},
 {t:"Accusation Audit",d:"Saying the customer’s negative thought out loud before they do: “You’re probably braced for me to spend two hours pressuring you.” Naming the fear disarms it. Used at the pact call-out and the Upfront Contract."},
 {t:"Buying Signal",d:"Behavior that says the decision is already made, even when the words sound like an objection. The spouse look after pricing (Mum’s the Word) and “your competitor is cheaper” are both buying signals. The play on a buying signal is usually silence, not selling."},
 {t:"Calibrated Question",d:"An open question — almost always starting with “How” or “What” — that hands the customer the illusion of control while steering the conversation where you need it. It makes THEM solve the problem instead of you pushing. “How am I supposed to give you all that at their price?” is the strongest. Two hard rules: never lead with “why” (it’s a burner on a hot stove — it makes people defensive; convert “why did you” to “what caused you to”), and tone is everything — calm and deferential is a request for help; an edge makes it an accusation."},
 {t:"Cinch the Knot",d:"Revisiting a commitment the customer made earlier and tying it into the close. The tie down plants it; the cinch collects it. “You told me the most important thing was never worrying about this again — that’s exactly what this handles.”"},
 {t:"Conditional Commitment",d:"A yes locked in before the condition is tested: “If that were the payment, would we be moving forward while I’m here?” Always secured BEFORE the manager call — otherwise the manager negotiates against air."},
 {t:"Cool Down / Take-Away",d:"Step 12. After the signature, you re-sell the decision and try to talk them out of it: “Before I put this in, I want to be sure there’s no reason you’d turn around and cancel.” Surfaces reversal risks at the table instead of in a cancellation email."},
 {t:"Diagnose the Money",d:"Sorting a money stall into its real condition — value, affordability, timing, comparison, or structure — before running any play. Mirror + 4 seconds + “How do you mean?” Their next sentence names the condition. Treating before diagnosing is the #1 rep failure at the close."},
 {t:"Drill",d:"A live rep-and-partner exercise with sets, reps, and a pass condition. Not a discussion, not a read-through — performed out loud, scored pass/fail. The six drills live at the end of the Pivot Points Playbook."},
 {t:"Exit-Sell Line",d:"“If one of those bids is better than ours, I want to be the first to tell you.” A confidence play that lives inside the parachute ONLY. Used earlier in the appointment, it invites shopping before the wall exists."},
 {t:"FM DJ Voice",d:"The calm, low, downward-inflected tone every objection gets met with. If your pitch rises when the objection lands, you’ve turned the close into an argument and lost it."},
 {t:"GBB",d:"Good / Better / Best. The three-package structure. Also the rescope tool: when the budget genuinely can’t reach the number, you move the tier or the scope — never the price."},
 {t:"Isolation",d:"Confirming that one thing is the ONLY thing between you and the schedule: “Other than the investment, is there anything else?” The Final Bridge is isolation before pricing; the close re-runs it on every objection."},
 {t:"Label",d:"Naming the customer’s emotion or position out loud: “It sounds like that rule has saved you from a bad contractor before.” A label proves you heard them without agreeing or arguing."},
 {t:"Mirror",d:"Repeating their last few words back as a question, then 4 seconds of silence: “Think about it?” The mirror goes FIRST on every objection because it makes them reveal the direction before you commit to one. Whoever talks first after the mirror loses."},
 {t:"Mum’s the Word",d:"The spouse look after price is presented: one approves, checks the other for sign-off. Highest-stakes silence in the process. PRESENT PRICES. BE QUIET. The 4-second floor has no ceiling here."},
 {t:"No-Oriented Question",d:"A question where “no” moves the deal forward: “Would you be against taking a look?” People protect themselves with no; a no-oriented door lets them say it and still walk through. The default swap for every yes-trap."},
 {t:"One-Legger",d:"An appointment where only one decision-maker is home. A booking failure first, a protocol second: full inspection, ZERO pricing, return visit with both homeowners locked before you leave."},
 {t:"Open-Ended Question",d:"Any question that can’t be answered with yes or no — it opens the floor and pulls a longer answer. All calibrated questions are open-ended, but not all open-ended questions are calibrated: “What do you do for work?” opens; “How am I supposed to do that?” opens AND steers. The opposite of the yes-trap. Use it any time you want them talking and revealing — discovery, the deck, and after every label."},
 {t:"The Pact",d:"The agreement the homeowners made with each other before you arrived: “no matter what, we’re not signing tonight.” Not a reaction to you — it predates you. That’s why value-building can’t touch it: saying yes would mean breaking a promise to their spouse in front of a stranger."},
 {t:"Pact Called Out",d:"Naming the pact respectfully instead of selling into it, with an accusation audit in front: “It feels like you two decided before I got here that tonight was off the table — and I respect that.” Once it’s in the open, you can work with it. Closing into a silent pact is arguing with a promise made before you parked the truck."},
 {t:"The Parachute",d:"The exit play when the close is dead (stone wall). Three moves: release the pressure, the respect ask (“would you be against not signing with anyone the night they’re out, either?”), and booking the review visit after their last estimate — day and time locked before you leave. You stop closing the sale and close the rematch."},
 {t:"Picture Exit",d:"Stepping out to take genuinely needed photos so the decision-makers get room to talk (the porchlight close). Only legal if the pictures are real — fake busywork is manufactured, and manufactured anything is off the table."},
 {t:"Re-Close",d:"Asking for the sale again after an objection is resolved. Every path through every scenario ends the same way: PRICE → re-close → T.O. chain. Handling an objection without re-closing is answering a question nobody asked."},
 {t:"Rescope",d:"Changing what’s being bought instead of what it costs: move the tier (Best → Better → Good) or move the scope (now versus later). The fallback when the T.O. chain can’t reach their number. The price never moves at the table; the scope can."},
 {t:"Safe Space Close",d:"Step 3, verbatim: “I can take a NO just as graciously as I can take a YES.” Planted at the Upfront Contract, collected all appointment long — it’s what makes the picture exit, the pact call-out, and the parachute land as trust instead of tactics."},
 {t:"SAMFAM",d:"Set A Meeting From A Meeting. A follow-up secured in the home, with a day and time, beats any outreach after it. No unsold exit without a locked next step — “I’ll follow up next week” is a fail; “Thursday at 6” is a pass."},
 {t:"Stone Wall",d:"A customer who will not buy while you’re in the house, no matter what. Quiet version: polite and immovable. Announced version: the pact declared at the door. Both route to the parachute; the announced version gets called out first."},
 {t:"T.O. Chain",d:"Turn Over chain: Manager → designated second/third → Jose H. The ONLY path pricing relief travels. Full price is the only price a rep quotes; if relief exists, it comes from the manager’s mouth on the call — never invented at the table."},
 {t:"“That’s Right”",d:"The moment the customer confirms your summary of THEIR OWN case in THEIR OWN words. Different from “you’re right” (which means “stop talking”). The same-price question in Scenario 11 is engineered to produce it."},
 {t:"Tie Down",d:"A commitment banked mid-presentation for later use: “Fair to say the crew matters more than the brand on the shingle?” Slide 9 banks three of them. Tie downs and cinching the knot go hand in hand — one plants, the other collects."},
 {t:"The Triangle",d:"Three variables, customer picks two: great company & warranties, top-of-the-line products, lowest price. Nobody gets all three from anybody. The price objection’s home remedy."},
 {t:"Upfront Contract",d:"Step 3’s expectation statement: what today looks like, start to finish, including that prices come at the end — agreed to before the inspection. It’s why nothing later feels like a surprise or a trap."},
 {t:"Yes-Trap",d:"A question engineered so the customer can only agree: “Is that correct?” “Wouldn’t you agree it’s easier…?” Reads as pressure, builds resistance. Every yes-trap in the source cards was converted to a no-oriented door — recognizing them on sight is a Top Rep exam skill."}
];

const DIAGNOSE = [
 {g:"MONEY",cat:"Value",
  sounds:"“Thirty-four is crazy for a roof.” The number offends them; cash never comes up.",
  play:"Cost vs. Value (the 64% move) → cinch their discovery answers → the Triangle. Never finance a price they don’t believe."},
 {g:"MONEY",cat:"Affordability",
  sounds:"“We don’t have that kind of money sitting in the bank.” No argument with the number.",
  play:"GoodLeap — show the monthly from the live screen. Don’t re-sell value they already agree with."},
 {g:"MONEY",cat:"Timing",
  sounds:"A reason + a timeline. Money-timing: “Bonus hits in October.” Logistics-timing: “Not while the kitchen’s torn up.”",
  play:"Conditional commitment first. Money → bridge with GoodLeap. Logistics → schedule-and-lock: book now for the later date, lock today’s pricing."},
 {g:"MONEY",cat:"Comparison",
  sounds:"A specific bid in a drawer: “Another company said twenty-six.”",
  play:"Same-price question → their reasons → the Triangle → the guarantee. Never touch the price."},
 {g:"MONEY",cat:"Structure",
  sounds:"“$580 a month is more than we can take on.” The total is fine; the payment shape pinches.",
  play:"Isolate monthly vs. down → their number → conditional commitment → manager call. Structure moves; the total never does."},
 {g:"NON-MONEY",cat:"The Rule",
  sounds:"A household policy, older than you: “We never sign the same day. Thirty years.”",
  play:"Honor it, never argue it. Label the rule → picture exit → cinch the Safe Space close → “Where did you land?”"},
 {g:"NON-MONEY",cat:"The Outside Voice",
  sounds:"A trusted person in the decision. Senior + family, trade relative, or first-timer citing dad.",
  play:"One play, three doors: senior → invite the family IN. Trade family → concede price, win on accountability. First-timer → ownership question, route back to money."},
 {g:"NON-MONEY",cat:"Trust",
  sounds:"A personal wound: “My neighbor got screwed by a roofer.” Emotion attached.",
  play:"Release pressure, never apply it. Label the fear → let the structure reassure: escrow, Directorii, the guarantee. Never say “trust me.”"}
];

const DIAG_MODEL = "Every sales system teaches one answer for every objection — acknowledge, reassure, overcome. Same medicine, every patient. We don’t do that, because two homeowners can say the EXACT same words and need opposite treatments. So we work like a doctor: nobody gets a prescription from “my stomach hurts.” First we find out what’s actually wrong. THEN we treat it. Diagnose first, answer second.";
const DIAG_STEPS = [
 {s:"1. SYMPTOM",q:"What did they say?",m:"Their words. Never treated — only heard."},
 {s:"2. DIG",q:"What’s underneath it?",m:"The three tools — mirror, question, label — until it’s clear."},
 {s:"3. DIAGNOSE",q:"Which of the eight is it?",m:"Named silently, never spoken. If you’d be guessing — back to Step 2."},
 {s:"4. PLAY",q:"What do I run?",m:"The pre-wired play for that diagnosis. Run it, don’t improvise."}
];
const DIAG_TOOLS = [
 {t:"1. MIRROR",say:"Repeat their last few words back as a question. “Think about it?” — then 4 seconds of silence.",when:"You know nothing yet. Always your first move — it makes them explain themselves. Whoever talks first loses."},
 {t:"2. QUESTION",say:"“How do you mean?” — calm, then silence again.",when:"The mirror came back vague. You heard words but still can’t tell what’s underneath."},
 {t:"3. LABEL",say:"“It sounds like…” — never “I think.”",when:"They revealed something clear and you’re confirming it. If you can’t finish the sentence without guessing, you haven’t earned it — mirror instead."}
];
const DIAG_STOP = "When the condition has a name — STOP DIGGING. Put the tools down and run the play. Digging past a named condition talks customers out of decisions.";
const DIAG_TEST = "If you’d be guessing between conditions, you’re still at the symptom — keep digging. “We need three estimates” could be a Rule, a Value doubt, or a Trust wound: same words, three treatments. The diagnosis stays in your head, never spoken.";
const DIAG_END = "Every play, one ending: PRICE → re-close → T.O. chain. Full price is the only price a rep quotes; relief comes from the manager. If the treatment gets refused, the diagnosis was wrong — re-diagnose, don’t push harder.";

/* Drill → scenario links (Drill 2 also links to Diagnose the Money) */
const DRILL_LINKS = {1:[1,2,3,4,5,6,11,12,13,14,15],2:[1,6,13,14],3:[3],4:[10,11],5:[9],6:[16,17,18]};

/* Extra quiz questions — glossary terms + the five diagnosis categories; wrong answers use rejected card language */
QUIZZES[0].qs.push(
 {q:"SAMFAM means:",o:["Show A Man Facts And Math","Set A Meeting From A Meeting — a follow-up locked in the home, with a day and time","Sell As Much, Fast As Manageable","A closing discount program"],a:1,w:"“I’ll follow up next week” is a fail; “Thursday at 6” is a pass."},
 {q:"A no-oriented question is:",o:["A question the customer can’t say no to","“Is that correct?”","A question where “no” moves the deal forward — “Would you be against taking a look?”","“Wouldn’t you agree it’s easier to get this done now?”"],a:2,w:"The other two options are yes-traps — rejected card language."},
 {q:"An accusation audit is:",o:["Blaming the previous contractor","Saying the customer’s negative thought out loud before they do","A credit check disclosure","Asking what went wrong with past projects"],a:1,w:"“You’re probably braced for me to spend two hours pressuring you.” Naming the fear disarms it."}
);
QUIZZES[1].qs.push(
 {q:"A tie down and cinching the knot work together. Which is which?",o:["Tie down collects, cinch plants","Tie down plants the commitment mid-presentation; the cinch collects it at the close","They’re the same move","Both happen only at Step 10"],a:1},
 {q:"“That’s right” versus “you’re right”:",o:["Both mean the customer agrees — keep going","“That’s right” confirms THEIR OWN case in THEIR OWN words; “you’re right” means “stop talking”","“You’re right” is the close signal","Neither matters — watch body language instead"],a:1,w:"The same-price question in Scenario 11 is engineered to produce “that’s right.”"}
);
QUIZZES[2].qs.push(
 {q:"Diagnose the Objection — the five MONEY conditions:",o:["Price, product, timing, trust, spouse","Value, affordability, timing, comparison, structure","Budget, credit, urgency, competition, fear","Monthly, down payment, total, interest, term"],a:1,w:"Plus three non-money conditions: The Rule, The Outside Voice, and Trust. Eight total."},
 {q:"“My neighbor got screwed by a roofer.” The condition is TRUST. The play:",o:["“You can trust me — here’s my card.”","Release pressure, never apply it. Label the fear, let the structure reassure: escrow, Directorii, the guarantee.","Show more testimonials immediately","Offer a discount to prove good faith"],a:1,w:"Never say “trust me.” The structure reassures; the words never can."},
 {q:"“$580 a month is more than we can take on.” The condition is:",o:["Value — re-sell the roof","Affordability — they can’t access money","Structure — the total is fine, the payment is shaped wrong","Comparison — there’s a cheaper bid"],a:2,w:"Scenario 20: isolate monthly vs down payment. Structure moves; the total never does."},
 {q:"“We were thinking eighteen. Thirty-four is crazy.” The WRONG move is:",o:["Cost vs Value with the 64% move","Offering a monthly payment","Cinching their discovery answers","Running the Triangle"],a:1,w:"That’s VALUE. Financing a price they don’t believe is a cancellation on a payment plan."},
 {q:"The three digging tools, in default order:",o:["Question → label → mirror","Mirror → question (“How do you mean?”) → label (“It sounds like…”)","Label → mirror → close","Acknowledge → reassure → overcome"],a:1,w:"Mirror is always the first move. Label only when you can finish “it sounds like…” without guessing. When the condition has a name — STOP DIGGING."},
 {q:"The Pact is:",o:["A price-match agreement","The homeowners’ agreement with each other, made before you arrived, not to sign tonight","Your commitment to full price","The upfront contract"],a:1,w:"It predates you — that’s why value-building can’t touch it. Call it out with an accusation audit."}
);

/* ================= THE TRAINING PROTOCOL (seventh source document) ================= */
const PROTOCOL = {
 principles: [
  {t:"Retrieval beats review",d:"Testing yourself from a blank page strengthens memory two to three times more than re-reading. Never study the 12-step by reading it. Study it by closing the document and reproducing it."},
  {t:"Spacing beats massing",d:"Six 20-minute sessions across a week beat one 2-hour session — same total time, roughly double the retention. Short daily sessions are the correct instinct."},
  {t:"Overlearn the verbatim, understand the rest",d:"Under pressure, you fall to your level of automaticity, not your level of knowledge. Verbatim anchor scripts must be drilled past the point of first mastery — that is what makes them survive a live objection. Everything else needs comprehension, not memorization."},
  {t:"Chunk before you memorize",d:"The brain holds about four chunks at once. You learn 4 phases, then the steps inside each phase, then the segments inside each step. Scaffold first, detail second."},
  {t:"The 20 pivot points are not 20 memorizations",d:"Every scenario runs the same universal flow. Automate that one flow plus the five-category money diagnosis, and the 20 scenarios collapse into routing decisions, not scripts. That is a 90% reduction in memorization load."},
  {t:"Pressure inoculation",d:"Solo reps build knowledge; randomized partner drills build performance. The gap between knowing it in the truck and executing it at the kitchen table only closes with a live partner throwing cold objections."}
 ],
 phases: [
  {n:1,name:"Skeleton",time:"Week 1",focus:"Blank-page recall: 4 phases, 12 steps in order. Nothing else.",pass:"Write it cold in 90 seconds, 3 days in a row."},
  {n:2,name:"Verbatim Anchors",time:"Weeks 2–5",focus:"One anchor script per week, out loud, standing, in the voice.",pass:"Script delivered word-for-word, 5 clean reps, zero reads."},
  {n:3,name:"Universal Flow",time:"Weeks 5–8",focus:"Mirror + 4-second silence to automaticity, then money diagnosis speed (Drills 1 and 2).",pass:"Drill 1: zero talk inside 4 seconds, zero pitch rise. Drill 2: 7 of 8 routed correctly."},
  {n:4,name:"Interleaved Routing",time:"Ongoing",focus:"Partner throws randomized objections from all 20 scenarios. Name the category, run the flow, route the play.",pass:"Correct routing under randomization, no-oriented phrasing intact."}
 ],
 anchors: [
  {w:2,name:"Upfront Contract + Safe Space close",own:"Step 3 · KPI 7"},
  {w:3,name:"GoodLeap soft pull transition + funding intro",own:"Step 2B · KPIs 5–6"},
  {w:4,name:"Final Bridge",own:"Step 8 · KPI 12"},
  {w:5,name:"Price & Value Guarantee",own:"Step 9 · KPI 15"}
 ],
 daily: [
  "Minutes 1–5 — Blank-page recall of prior material. Yesterday’s script, last week’s phase skeleton, whatever is in rotation. From memory, before anything is opened.",
  "Minutes 6–15 — Out-loud reps on current material. This week’s anchor script or drill, performed at full delivery standard, five clean reps.",
  "Minutes 16–20 — Flashcard review of misses. Missed lines and missed routings recycle until nailed twice."
 ],
 rules: [
  "No marathon sessions. 20 minutes daily plus one 30-minute weekly drill is the ceiling, not the floor to exceed.",
  "One anchor script per week. Stacking two is how retention halves and frustration doubles.",
  "Misses are data, not failure. A missed line goes to the flashcard stack and comes back tomorrow. That is the system working.",
  "Movement over motivation. The protocol runs on schedule, not on mood."
 ],
 loop:"Real appointments are the exam. Red Panda grades the exam against all 22 KPIs. The graded call assigns the next drill. The drill becomes next week’s live session. Appointment → grade → drill → appointment. Nothing gets practiced that a real call did not expose, and nothing a real call exposed goes unpracticed.",
 motto:"Ten feet deep, two feet wide — one thing at a time, drilled past mastery, never dropped from rotation.",
 spacing:"Spaced rotation: old material returns on a widening schedule — 2 days, 4 days, 7 days, 14 days. Nothing mastered ever leaves the rotation; it just comes back less often."
};

QUIZZES[0].qs.push(
 {q:"Per the Training Protocol, how do you study the 12-step?",o:["Re-read it every morning until it sticks","Close the document and reproduce it from a blank page — retrieval beats review","Listen to recordings of it on drives","Highlight the key scripts"],a:1,w:"Testing yourself from a blank page strengthens memory 2–3× more than re-reading."},
 {q:"The Daily 20 splits into:",o:["20 minutes of reading the playbook","10 quiz / 10 flashcards","1–5 blank-page recall · 6–15 out-loud reps · 16–20 flashcard misses","5 warm-up / 15 roleplay"],a:2,w:"Recall first, from memory, before anything is opened. Silent reading does not count as a rep."}
);

export {
  RANKS,
  PHASES,
  STEPS,
  DISCOVERY,
  SCENARIOS,
  FOURCS,
  KPIS,
  KEYSCRIPTS,
  CARDS,
  DRILLS,
  DRILL_LINKS,
  QUIZZES,
  GLOSSARY,
  DIAGNOSE,
  DIAG_MODEL,
  DIAG_STEPS,
  DIAG_TOOLS,
  DIAG_STOP,
  DIAG_TEST,
  DIAG_END,
  PROTOCOL
};
