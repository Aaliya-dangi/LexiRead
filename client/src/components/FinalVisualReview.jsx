import React, { useMemo, useState, useRef } from 'react';
import { Workflow, Download, CheckCircle2 } from 'lucide-react';
import { useReadingSettings } from '../context/ReadingSettingsContext';
import './FinalVisualReview.css';

/**
 * Match a specific step sentence or action to a fitting educational vector illustration.
 * Uses strict context combinations to avoid false matches (e.g. trophy only for winning/scoring).
 */
function matchStepVisual(sentence = '', mainLabel = '') {
  const text = `${sentence} ${mainLabel}`.toLowerCase();

  // 1. Solar / Sunlight / Light Energy
  if (/\b(sun|sunlight|solar|sunshine|daylight)\b/i.test(text) ||
      (/\blight\b/i.test(text) && !/\bbulb\b/i.test(text) && /\b(rays?|absorb\w*|beam|energy|shine|bright|source|capture)\b/i.test(text))) {
    return 'sun';
  }

  // 2. Plants / Botanical Life / Vegetation / Roots
  if (/\b(plants?|leaf|leaves|sprouts?|seedlings?|stem|roots?|flora|vegetation|chloroplast\w*|chlorophyll)\b/i.test(text) ||
      (/\bgrow\w*\b/i.test(text) && /\b(soil|seeds?|garden|crops?)\b/i.test(text))) {
    return 'plant';
  }

  // 3. Water / Liquids / Precipitation / Infiltration
  if (/\b(water|droplets?|rainfall|precipitation|rain water|drinking water|moisture|puddles?|runoff|infiltration)\b/i.test(text) ||
      (/\b(river|stream|lake|sea|ocean)\b/i.test(text) && /\b(flow\w*|water|liquid|current)\b/i.test(text))) {
    return 'water';
  }

  // 4. Clouds / Atmosphere / Vapor / Evaporation / Condensation
  if (/\b(clouds?|vapor|water vapor|atmosphere|evaporat\w*|condens\w*|sky)\b/i.test(text)) {
    return 'cloud';
  }

  // 5. Oxygen / Atmospheric Gases / Respiration
  if (/\b(oxygen|o2|carbon dioxide|co2|gas(?:es)?|air bubbles?|release\w* oxygen|exhale\w*)\b/i.test(text)) {
    return 'oxygen';
  }

  // 6. Food / Glucose / Sugar / Metabolic Energy
  if (/\b(glucose|sugar|food|nutrients?|carbohydrat\w*|synthesiz\w* food|atp|energy for the plant|digestion|ingestion)\b/i.test(text)) {
    return 'glucose';
  }

  // 7. Football / Soccer (Strict athletic gameplay context)
  if (/\b(football|soccer|dribbl\w*|goalkeeper)\b/i.test(text) ||
      (/\b(ball|kick\w*|pass\w*)\b/i.test(text) && /\b(pitch|field|player|team|goal|match|game)\b/i.test(text))) {
    return 'football';
  }

  // 8. Winning / Victory / Tournament (Strict: victory, trophies, or scoring the winner)
  if (/\b(won|wins?|winner|victory|champion\w*|trophy|first place|tournament win)\b/i.test(text) ||
      (/\b(scored?|goal)\b/i.test(text) && /\b(winning|points?|match|game|victory|net)\b/i.test(text))) {
    return 'trophy';
  }

  // 9. Heart / Cardiac / Blood Circulation
  if (/\b(heart|cardiac|ventricle|atrium|pulse)\b/i.test(text) ||
      (/\bblood\b/i.test(text) && /\b(pump\w*|circulat\w*|vessels?|arter\w*|veins?|oxygenat\w*)\b/i.test(text))) {
    return 'heart';
  }

  // 10. Treaty / Legal Charter / Official Peace Accord
  if (/\b(treaty|charter|constitution|decree|pact|accord)\b/i.test(text) ||
      (/\b(signed|ratified|agreement)\b/i.test(text) && /\b(peace|document|terms|law|parties)\b/i.test(text))) {
    return 'treaty';
  }

  // 11. Castle / Temple / Historic Architecture
  if (/\b(castle|palace|temple|monument|fortress|senate|parliament|pyramid|colosseum)\b/i.test(text) ||
      (/\b(ancient|historic|empire)\b/i.test(text) && /\b(city|build\w*|capital|ruins?)\b/i.test(text))) {
    return 'temple';
  }

  // 12. Shield / Defense / Battle Conflict
  if (/\b(battle|warfare|defen[sc]e|shield|troops|soldiers?|army|military|combat|protect\w*)\b/i.test(text)) {
    return 'shield';
  }

  // 13. Book / Study / Academic Literature
  if (/\b(books?|reading|textbook|literature|manuscript|study|studying|learn\w*|school|library)\b/i.test(text)) {
    return 'book';
  }

  // 14. Earth / Globe / Borders / Geography
  if (/\b(earth|globe|planet|continents?|worldwide|territor\w*|geograph\w*|borders?|sediments?|rocks?|valley)\b/i.test(text)) {
    return 'globe';
  }

  // 15. Fire / Heat / Combustion / High Temperature / Volcano
  if (/\b(fire|flames?|burning|combustion|blaze|wildfire|volcano|volcanic|lava|magma|erupt\w*)\b/i.test(text) ||
      (/\bheat\b/i.test(text) && /\b(temperature|hot|warm\w*|energy|pressure)\b/i.test(text))) {
    return 'fire';
  }

  // 16. Electricity / Lightning / Power Flow / Circuits
  if (/\b(electric\w*|lightning|voltage|current|power grid|battery|charge\w*|circuit|electrons?|wire|bulb|lamp)\b/i.test(text)) {
    return 'electricity';
  }

  // 17. Machinery / Mechanism / Gear / Engine
  if (/\b(engine|motor|gear\w*|machine\w*|mechanism|turbine|industrial|factory|assembly|switch)\b/i.test(text)) {
    return 'gear';
  }

  // 18. Brain / Mind / Cognition / Thinking / Nerves
  if (/\b(brain|neural|neuron|cognit\w*|mental|thought|thinking|intellect\w*|mind|nerves?|cortex|impulse|sensory)\b/i.test(text)) {
    return 'brain';
  }

  // 19. People / Community / Population / Group
  if (/\b(citizens?|community|population|team|crowd|workers?|society|people|group|leaders?)\b/i.test(text)) {
    return 'people';
  }

  // 20. Clock / Time / Duration
  if (/\b(clock|hours?|centur\w*|decades?|years? later|timeline|duration|period of time)\b/i.test(text)) {
    return 'clock';
  }

  // Neutral focus badge when no physical category authentically applies
  return null;
}

/**
 * Extract an accurate, meaningful process stage or action from a sentence.
 * Prioritizes recognized canonical process terms (e.g. "Evaporation", "Condensation", "Rainfall"),
 * predicate actions (e.g. "Absorbs Sunlight", "Makes Glucose", "Releases Oxygen"),
 * or historical events (e.g. "Treaty Signed", "Borders Established").
 */
function extractProcessStage(sentence = '') {
  if (!sentence) return { main: '', sub: '', visual: null };

  const lower = sentence.toLowerCase().trim();

  // Strip leading numbering, step labels, and transitional adverbs
  let cleanSentence = sentence
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
    .replace(/^(?:(?:step|stage)\s*\d+[:.\s\-–—]*|\d+[\.):\s\-–—]+)\s*/i, '')
    .replace(/^(first|second|third|fourth|initially|to begin with|starts? by|starts? with|then|next|subsequently|after that|afterwards|later|finally|lastly|eventually|as a result|therefore|consequently|moreover|however|furthermore|in fact|for example|in addition|because of this|due to this)[,\s]+/i, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[;:,.]+$/g, '')
    .trim();

  // 1. CANONICAL WATER CYCLE & ATMOSPHERIC PROCESSES
  if (/\b(evaporat\w*)\b/i.test(lower)) {
    return { main: 'Evaporation', sub: 'Water turns to vapor', visual: 'water' };
  }
  if (/\b(transpir\w*)\b/i.test(lower)) {
    return { main: 'Transpiration', sub: 'Plants release vapor', visual: 'plant' };
  }
  if (/\b(condens\w*)\b/i.test(lower)) {
    return { main: 'Condensation', sub: 'Clouds form', visual: 'cloud' };
  }
  if (/\b(precipitat\w*)\b/i.test(lower) || (/\b(rain|rainfall|downpour|snow|snowfall|hail)\b/i.test(lower) && /\b(fall\w*|drops?|pours?|ground)\b/i.test(lower))) {
    return { main: 'Rainfall', sub: 'Precipitation falls', visual: 'water' };
  }
  if (/\b(infiltrat\w*|seeps?|percolat\w*)\b/i.test(lower) && /\b(soil|ground|earth)\b/i.test(lower)) {
    return { main: 'Infiltration', sub: 'Water enters soil', visual: 'water' };
  }
  if (/\b(runoff|surface runoff|flows? into)\b/i.test(lower)) {
    return { main: 'Runoff', sub: 'Flows to waterways', visual: 'water' };
  }
  if (/\b(collect\w*|accumulat\w*)\b/i.test(lower) && /\b(ocean|lake|river|sea)\b/i.test(lower)) {
    return { main: 'Collection', sub: 'Gathers in oceans', visual: 'water' };
  }

  // 2. CANONICAL PLANT BIOLOGY & PHOTOSYNTHESIS PROCESSES
  if (/\b(absorb\w*|captur\w*|takes? in)\b/i.test(lower) && /\b(sun|sunlight|light|solar)\b/i.test(lower)) {
    return { main: 'Light Absorption', sub: 'Leaves capture sunlight', visual: 'sun' };
  }
  if (/\b(absorb\w*|takes? in|draws?)\b/i.test(lower) && /\b(water|minerals?)\b/i.test(lower) && /\b(roots?|soil|plant)\b/i.test(lower)) {
    return { main: 'Water Absorption', sub: 'Roots take in water', visual: 'water' };
  }
  if (/\b(carbon dioxide|co2)\b/i.test(lower) && /\b(absorb\w*|intake|enter\w*|takes? in)\b/i.test(lower)) {
    return { main: 'CO₂ Intake', sub: 'Leaves absorb CO₂', visual: 'plant' };
  }
  if (/\b(glucose|sugar|food)\b/i.test(lower) && /\b(produce\w*|make\w*|synthesiz\w*|creat\w*)\b/i.test(lower)) {
    return { main: 'Make Food', sub: 'Chloroplasts synthesize glucose', visual: 'glucose' };
  }
  if (/\b(oxygen|o2)\b/i.test(lower) && /\b(release\w*|emits?|given off|escap\w*)\b/i.test(lower)) {
    return { main: 'Release Oxygen', sub: 'Oxygen released into air', visual: 'oxygen' };
  }

  // 3. CANONICAL SPORTS & FOOTBALL ACTIONS
  if (/\b(pass\w*|passed|crossing)\b/i.test(lower) && /\b(ball|teammate|pitch|field)\b/i.test(lower)) {
    return { main: 'Pass Ball', sub: 'Moved across pitch', visual: 'football' };
  }
  if (/\b(kick\w*|kicked|shot|shoot\w*|struck|strike)\b/i.test(lower) && /\b(ball|goal|net|post|target)\b/i.test(lower)) {
    return { main: 'Shot on Goal', sub: 'Ball struck toward net', visual: 'football' };
  }
  if (/\b(save\w*|saved|block\w*|blocked|deflect\w*|dive\w*)\b/i.test(lower) && /\b(goalkeeper|keeper|shot)\b/i.test(lower)) {
    return { main: 'Goalkeeper Save', sub: 'Shot blocked', visual: 'football' };
  }
  if (/\b(score\w*|scored)\b/i.test(lower) && /\b(goal|points?|net)\b/i.test(lower)) {
    return { main: 'Goal Scored', sub: 'Ball enters net', visual: 'trophy' };
  }
  if (/\b(won|wins?|winner|victory|champion\w*|trophy)\b/i.test(lower)) {
    return { main: 'Match Victory', sub: 'Championship won', visual: 'trophy' };
  }

  // 4. CANONICAL HISTORY & SOCIETY EVENTS
  if (/\b(treaty|accord|charter|constitution)\b/i.test(lower) && /\b(sign\w*|ratifi\w*|draft\w*|agreed)\b/i.test(lower)) {
    return { main: 'Treaty Signed', sub: 'Peace pact finalized', visual: 'treaty' };
  }
  if (/\b(borders?|territor\w*|boundaries)\b/i.test(lower) && /\b(establish\w*|redrawn|creat\w*|form\w*|divid\w*)\b/i.test(lower)) {
    return { main: 'Borders Established', sub: 'Territories partitioned', visual: 'globe' };
  }
  if (/\b(rebuild\w*|reconstruct\w*|recovering|peace)\b/i.test(lower) && /\b(nations?|europe|cities|economy)\b/i.test(lower)) {
    return { main: 'Peace & Rebuilding', sub: 'Nations recover', visual: 'temple' };
  }
  if (/\b(battle|clash\w*|fought|attack\w*|invad\w*)\b/i.test(lower) && /\b(army|troops|soldiers?|forces?)\b/i.test(lower)) {
    return { main: 'Battle Clashes', sub: 'Forces engage in combat', visual: 'shield' };
  }
  if (/\b(rebellion|revolt|protest|revolution)\b/i.test(lower)) {
    return { main: 'Revolution', sub: 'Citizens rise up', visual: 'people' };
  }

  // 5. CANONICAL ANATOMY & PHYSIOLOGY & DIGESTION
  if (/\b(inhale|breathe? in|takes? in air)\b/i.test(lower)) {
    return { main: 'Inhalation', sub: 'Lungs draw in oxygen', visual: 'oxygen' };
  }
  if (/\b(pump\w*|contracts?)\b/i.test(lower) && /\b(heart|ventricle|blood)\b/i.test(lower)) {
    return { main: 'Heart Pumping', sub: 'Blood pumped to body', visual: 'heart' };
  }
  if (/\b(circulat\w*|flow\w*)\b/i.test(lower) && /\b(blood|vessels?|arter\w*|veins?)\b/i.test(lower)) {
    return { main: 'Circulation', sub: 'Flows through arteries', visual: 'heart' };
  }
  if (/\b(ingest\w*|chew\w*)\b/i.test(lower)) {
    return { main: 'Ingestion', sub: 'Food enters mouth', visual: 'glucose' };
  }
  if (/\b(digest\w*)\b/i.test(lower) && /\b(stomach|acid|enzymes?|food|break\w*)\b/i.test(lower)) {
    return { main: 'Digestion', sub: 'Food broken down', visual: 'glucose' };
  }
  if (/\b(absorb\w*)\b/i.test(lower) && /\b(nutrients?|intestine|villi)\b/i.test(lower)) {
    return { main: 'Nutrient Absorption', sub: 'Nutrients enter blood', visual: 'glucose' };
  }
  if (/\b(eliminat\w*|excret\w*|waste)\b/i.test(lower) && /\b(body|remains|bowel)\b/i.test(lower)) {
    return { main: 'Waste Elimination', sub: 'Remains discharged', visual: 'water' };
  }

  // 6. GENERAL SCIENCE & PHYSICS & ROCK CYCLE
  if (/\b(weather\w*)\b/i.test(lower) && /\b(rocks?|break\w*|sediment)\b/i.test(lower)) {
    return { main: 'Weathering', sub: 'Rocks broken down', visual: 'globe' };
  }
  if (/\b(erod\w*|erosion)\b/i.test(lower)) {
    return { main: 'Erosion', sub: 'Sediments transported', visual: 'globe' };
  }
  if (/\b(deposit\w*|sediments?\s+settle)\b/i.test(lower)) {
    return { main: 'Deposition', sub: 'Sediments settle', visual: 'globe' };
  }
  if (/\b(melt\w*|liquef\w*)\b/i.test(lower)) {
    return { main: 'Melting', sub: 'Solid turns to liquid', visual: 'fire' };
  }
  if (/\b(freez\w*|solidif\w*)\b/i.test(lower)) {
    return { main: 'Freezing', sub: 'Liquid turns to solid', visual: 'water' };
  }
  if (/\b(boil\w*|vaporiz\w*)\b/i.test(lower)) {
    return { main: 'Boiling', sub: 'Liquid heats to vapor', visual: 'fire' };
  }
  if (/\b(combust\w*|ignit\w*|burn\w*)\b/i.test(lower)) {
    return { main: 'Combustion', sub: 'Fuel ignites with oxygen', visual: 'fire' };
  }
  if (/\b(pollinat\w*)\b/i.test(lower)) {
    return { main: 'Pollination', sub: 'Pollen transferred', visual: 'plant' };
  }
  if (/\b(germinat\w*)\b/i.test(lower)) {
    return { main: 'Germination', sub: 'Seed begins growth', visual: 'plant' };
  }

  // 7. DYNAMIC ACTION PREDICATE EXTRACTOR FOR ARBITRARY SUBJECTS
  // Searches for key action verbs and extracts meaningful verb-noun combinations
  const words = cleanSentence.split(/\s+/).filter(Boolean);
  const actionVerbs = /\b(create(s|d)?|creating|build(s)?|built|building|destroy(s|ed)?|destroying|cause(s|d)?|causing|form(s|ed)?|forming|move(s|d)?|moving|travel(s|ed)?|traveling|reach(es|ed)?|reaching|develop(s|ed)?|developing|discover(s|ed)?|discovering|send(s)?|sent|sending|receive(s|d)?|receiving|gather(s|ed)?|gathering|separate(s|d)?|separating|connect(s|ed)?|connecting|transform(s|ed)?|transforming|enter(s|ed)?|entering|exit(s|ed)?|exiting|produce(s|d)?|producing|absorb(s|ed)?|absorbing|deliver(s|ed)?|delivering|store(s|d)?|storing|activate(s|d)?|activating|measure(s|d)?|measuring|meet(s)?|met|meeting|sign(s|ed)?|signing|launch(es|ed)?|launching|erupt(s|ed)?|erupting|combine(s|d)?|combining|divide(s|d)?|dividing|break(s)?|broke|broken|breaking|flow(s|ed)?|flowing|cool(s|ed)?|cooling|warm(s|ed)?|warming|heat(s|ed)?|heating|start(s|ed)?|starting|end(s|ed)?|ending|pass(es|ed)?|passing|score(s|d)?|scoring|win(s)?|won|winning|generate(s|d)?|generating|power(s|ed)?|powering|transmit(s|ted)?|transmitting|trigger(s|ed)?|triggering)\b/i;

  const nonContent = /^(the|a|an|in|at|on|to|from|by|with|into|onto|for|of|over|under|through|across|is|am|are|was|were|be|been|being|has|have|had|do|does|did|can|could|will|would|shall|should|may|might|must|it|its|they|them|their|theirs|he|him|his|she|her|hers|we|us|our|ours|i|me|my|you|your|yours|this|that|these|those|which|who|whom|whose|what|then|also|and|or|so)$/i;

  const verbIdx = words.findIndex(w => actionVerbs.test(w));
  if (verbIdx !== -1) {
    const rawVerb = words[verbIdx].replace(/[^a-zA-Z]/g, '');
    const verb = rawVerb.charAt(0).toUpperCase() + rawVerb.slice(1).toLowerCase();
    const meaningfulAfter = words.slice(verbIdx + 1).map(w => w.replace(/[^a-zA-Z]/g, '')).filter(w => w && !nonContent.test(w));
    const meaningfulBefore = words.slice(0, verbIdx).map(w => w.replace(/[^a-zA-Z]/g, '')).filter(w => w && !nonContent.test(w));

    let main = '';
    let sub = '';
    if (meaningfulBefore.length > 0 && meaningfulAfter.length > 0) {
      const subject = meaningfulBefore.slice(-1)[0].charAt(0).toUpperCase() + meaningfulBefore.slice(-1)[0].slice(1).toLowerCase();
      main = `${subject} ${verb}`;
      sub = meaningfulAfter.slice(0, 3).join(' ');
    } else if (meaningfulAfter.length > 0) {
      const obj = meaningfulAfter[0].charAt(0).toUpperCase() + meaningfulAfter[0].slice(1).toLowerCase();
      main = `${verb} ${obj}`;
      sub = meaningfulAfter.slice(1, 4).join(' ');
    } else if (meaningfulBefore.length > 0) {
      const subject = meaningfulBefore.slice(-1)[0].charAt(0).toUpperCase() + meaningfulBefore.slice(-1)[0].slice(1).toLowerCase();
      main = `${subject} ${verb}`;
      sub = words.slice(verbIdx + 1, verbIdx + 4).join(' ');
    } else {
      main = verb;
      sub = words.slice(verbIdx + 1, verbIdx + 4).join(' ');
    }
    const visual = matchStepVisual(cleanSentence, main);
    return { main, sub, visual };
  }

  // 8. ACCURATE NOMINAL/NOUN-PHRASE FALLBACK (No arbitrary random first words)
  // Extracts the leading salient noun phrase without filler articles
  const filteredWords = words
    .map(w => w.replace(/[^a-zA-Z]/g, ''))
    .filter(w => w && !nonContent.test(w));

  const main = filteredWords.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  const sub = filteredWords.slice(2, 5).join(' ');
  const visual = matchStepVisual(cleanSentence, main);

  return { main: main || 'Key Action', sub, visual };
}

/**
 * Deterministically analyzes the actual passage text to extract 2 to 4 meaningful
 * process steps, causal chains, or chronological milestones.
 */
function extractPassageDiagram(text = '') {
  const raw = (text || '').trim();
  if (!raw) return null;

  // Guard: require at least 12 words to form a reliable diagram
  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length < 12) return null;

  // Split into clean sentence candidates (supports punctuation and newline splits)
  const sentences = raw
    .split(/(?<=[.?!])\s+|\r?\n+/)
    .map(s => s.trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, ''))
    .filter(s => s.length > 8 && !/^(page\s+\d+|chapter\s+\d+|table\s+of|figure\s+\d+)/i.test(s));

  if (sentences.length < 2) {
    // If only one sentence, check for compound clauses connected by process cues
    const single = sentences[0] || raw;
    const clauseSplits = single.split(/\b(?:and then|then|which causes|leading to|so that|as a result|because of this|before)\b/i);
    const validClauses = clauseSplits.map(s => s.trim()).filter(s => s.length > 6);
    if (validClauses.length >= 2) {
      return buildDiagramStructure(validClauses, 'process');
    }
    return null;
  }

  // Detect genuine relationship cues from the actual passage
  const seqCues = /\b(first|initially|begins?|starts?|second|then|next|subsequently|after that|afterwards|later|third|finally|lastly|eventually)\b/i;
  const causalCues = /\b(because|causes?|caused by|leads? to|leading to|as a result|results? in|therefore|consequently|enables?|produces?)\b/i;

  const hasSequentialCues = sentences.some(s => seqCues.test(s));
  const hasCausalCues = sentences.some(s => causalCues.test(s));

  let diagramType = 'events';
  if (hasSequentialCues) {
    diagramType = 'process';
  } else if (hasCausalCues) {
    diagramType = 'causal';
  } else {
    diagramType = 'events';
  }

  return buildDiagramStructure(sentences, diagramType);
}

function buildDiagramStructure(sentences, diagramType) {
  if (!sentences || sentences.length < 2) return null;

  // Select 2 to 4 key chronological milestones across the text progression
  let selected = [];
  if (sentences.length <= 4) {
    selected = sentences;
  } else if (sentences.length === 5) {
    selected = [sentences[0], sentences[1], sentences[3], sentences[4]];
  } else {
    const stepSize = (sentences.length - 1) / 3;
    selected = [
      sentences[0],
      sentences[Math.round(stepSize)],
      sentences[Math.round(stepSize * 2)],
      sentences[sentences.length - 1]
    ];
  }

  selected = selected.filter((s, idx, arr) => arr.indexOf(s) === idx);
  if (selected.length < 2) return null;

  const nodes = selected.map((sentence, idx) => {
    const stage = extractProcessStage(sentence);
    return {
      id: `step-${idx + 1}`,
      stepNumber: idx + 1,
      main: stage.main,
      sub: stage.sub,
      visual: stage.visual,
      fullText: sentence
    };
  });

  return {
    type: diagramType,
    nodes
  };
}

/**
 * Render small, colorful, flat textbook-style vector illustration (26×26px)
 * Native SVG vectors ensure 100% fidelity during HTML5 canvas PNG export.
 */
function renderStepPicture(type, cx, cy, isDark) {
  const ox = cx - 13;
  const oy = cy - 13;

  switch (type) {
    case 'sun':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <circle cx="13" cy="13" r="6" fill="#F59E0B" />
          <circle cx="11.5" cy="11.5" r="2" fill="#FEF08A" opacity="0.6" />
          <line x1="13" y1="3" x2="13" y2="5" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="13" y1="21" x2="13" y2="23" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="13" x2="5" y2="13" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="21" y1="13" x2="23" y2="13" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="6" y1="6" x2="7.5" y2="7.5" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="18.5" y1="18.5" x2="20" y2="20" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="6" y1="20" x2="7.5" y2="18.5" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="18.5" y1="7.5" x2="20" y2="6" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );

    case 'plant':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <path d="M 13 23 Q 13 15 15 9" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 13 17 C 8 17 6 12 7 9 C 10 9 13 13 13 17 Z" fill="#22C55E" stroke="#15803D" strokeWidth="0.8" />
          <path d="M 14 13 C 19 13 21 8 20 5 C 17 5 14 9 14 13 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="0.8" />
        </g>
      );

    case 'water':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <path d="M 13 3 C 13 3 6 12 6 16 A 7 7 0 0 0 20 16 C 20 12 13 3 13 3 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="0.8" />
          <ellipse cx="10" cy="15" rx="1.5" ry="3" fill="#BAE6FD" opacity="0.8" />
        </g>
      );

    case 'cloud':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <path d="M 7 18 A 4 4 0 0 1 6 12 A 5 5 0 0 1 12 9 A 6 6 0 0 1 20 12 A 4 4 0 0 1 19 18 Z" fill={isDark ? '#475569' : '#94A3B8'} stroke={isDark ? '#64748B' : '#475569'} strokeWidth="0.8" />
          <line x1="9" y1="20" x2="8" y2="23" stroke="#0284C7" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="14" y1="20" x2="13" y2="23" stroke="#0284C7" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );

    case 'oxygen':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <circle cx="10" cy="15" r="5" fill="#06B6D4" stroke="#0891B2" strokeWidth="0.8" />
          <text x="10" y="17.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#FFFFFF" fontFamily="system-ui, sans-serif">O₂</text>
          <circle cx="17" cy="8" r="3.5" fill="#67E8F9" stroke="#0891B2" strokeWidth="0.8" />
        </g>
      );

    case 'glucose':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <polygon points="13,4 20,8 20,18 13,22 6,18 6,8" fill="#F59E0B" stroke="#D97706" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="13" cy="13" r="3" fill="#FEF3C7" />
        </g>
      );

    case 'football':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <circle cx="13" cy="13" r="9" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.2" />
          <polygon points="13,9 16,11 15,15 11,15 10,11" fill="#1E293B" />
          <line x1="13" y1="9" x2="13" y2="4" stroke="#1E293B" strokeWidth="1" />
          <line x1="16" y1="11" x2="20" y2="9" stroke="#1E293B" strokeWidth="1" />
          <line x1="15" y1="15" x2="19" y2="18" stroke="#1E293B" strokeWidth="1" />
          <line x1="11" y1="15" x2="7" y2="18" stroke="#1E293B" strokeWidth="1" />
          <line x1="10" y1="11" x2="6" y2="9" stroke="#1E293B" strokeWidth="1" />
        </g>
      );

    case 'trophy':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <path d="M 8 6 L 18 6 L 16 14 C 16 17 10 17 10 14 Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="0.8" />
          <path d="M 8 8 C 5 8 5 12 8 12" fill="none" stroke="#CA8A04" strokeWidth="1.2" />
          <path d="M 18 8 C 21 8 21 12 18 12" fill="none" stroke="#CA8A04" strokeWidth="1.2" />
          <line x1="13" y1="16" x2="13" y2="20" stroke="#CA8A04" strokeWidth="1.8" />
          <line x1="9" y1="21" x2="17" y2="21" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" />
        </g>
      );

    case 'heart':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <path d="M 13 8 C 11 4 6 5 6 9 C 6 13 13 18 13 20 C 13 20 20 13 20 9 C 20 5 15 4 13 8 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />
          <path d="M 8 11 L 11 11 L 13 8 L 15 14 L 16 11 L 18 11" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );

    case 'book':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <path d="M 13 7 C 9 5 4 6 4 17 C 8 16 13 18 13 18 C 13 18 18 16 22 17 C 22 6 17 5 13 7 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="0.8" />
          <line x1="13" y1="7" x2="13" y2="18" stroke="#1D4ED8" strokeWidth="1" />
          <line x1="6" y1="10" x2="11" y2="9.5" stroke="#FFFFFF" strokeWidth="0.8" />
          <line x1="15" y1="9.5" x2="20" y2="10" stroke="#FFFFFF" strokeWidth="0.8" />
        </g>
      );

    case 'treaty':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <path d="M 7 5 Q 7 3 10 3 L 18 3 Q 21 3 21 5 L 21 19 Q 21 21 18 21 L 10 21 Q 7 21 7 19 Z" fill="#FDE68A" stroke="#D97706" strokeWidth="0.8" />
          <line x1="10" y1="7" x2="18" y2="7" stroke="#D97706" strokeWidth="0.8" />
          <line x1="10" y1="11" x2="18" y2="11" stroke="#D97706" strokeWidth="0.8" />
          <circle cx="14" cy="16" r="2.5" fill="#DC2626" />
        </g>
      );

    case 'temple':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <polygon points="13,4 4,9 22,9" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="0.8" />
          <line x1="7" y1="9" x2="7" y2="18" stroke="#8B5CF6" strokeWidth="1.5" />
          <line x1="13" y1="9" x2="13" y2="18" stroke="#8B5CF6" strokeWidth="1.5" />
          <line x1="19" y1="9" x2="19" y2="18" stroke="#8B5CF6" strokeWidth="1.5" />
          <line x1="4" y1="19" x2="22" y2="19" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" />
        </g>
      );

    case 'shield':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <path d="M 6 5 L 20 5 L 20 12 C 20 18 13 22 13 22 C 13 22 6 18 6 12 Z" fill="#6366F1" stroke="#4338CA" strokeWidth="0.8" />
          <line x1="13" y1="5" x2="13" y2="21" stroke="#EEF2FF" strokeWidth="1" />
          <line x1="7" y1="11" x2="19" y2="11" stroke="#EEF2FF" strokeWidth="1" />
        </g>
      );

    case 'globe':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <circle cx="13" cy="13" r="8.5" fill="#0284C7" stroke="#0369A1" strokeWidth="0.8" />
          <path d="M 8 11 Q 11 8 13 11 Q 15 15 11 17 Z" fill="#22C55E" />
          <path d="M 15 7 Q 19 8 18 12 Q 16 11 15 7 Z" fill="#22C55E" />
        </g>
      );

    case 'fire':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <path d="M 13 3 C 13 3 18 8 18 14 C 18 18 15 21 13 21 C 11 21 8 18 8 14 C 8 10 11 6 13 3 Z" fill="#F97316" stroke="#EA580C" strokeWidth="0.8" />
          <path d="M 13 10 C 13 10 15 13 15 16 C 15 18 14 19 13 19 C 12 19 11 18 11 16 C 11 13 13 10 13 10 Z" fill="#FDE047" />
        </g>
      );

    case 'electricity':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <polygon points="14,3 7,12 13,12 11,23 20,10 14,10" fill="#EAB308" stroke="#CA8A04" strokeWidth="0.8" strokeLinejoin="round" />
        </g>
      );

    case 'gear':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <circle cx="13" cy="13" r="5" fill="none" stroke="#64748B" strokeWidth="3" />
          <circle cx="13" cy="13" r="2.5" fill="#334155" />
          <line x1="13" y1="4" x2="13" y2="22" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="4" y1="13" x2="22" y2="13" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );

    case 'brain':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <path d="M 8 15 A 4 4 0 0 1 7 10 A 4 4 0 0 1 12 7 A 3 3 0 0 1 16 7 A 4 4 0 0 1 19 10 A 4 4 0 0 1 18 15 Z" fill="#A855F7" stroke="#7E22CE" strokeWidth="0.8" />
          <circle cx="13" cy="6" r="1.5" fill="#FDE047" />
        </g>
      );

    case 'people':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <circle cx="9" cy="8" r="3" fill="#EC4899" />
          <path d="M 4 20 C 4 15 7 14 9 14 C 11 14 14 15 14 20 Z" fill="#EC4899" />
          <circle cx="17" cy="9" r="2.5" fill="#F472B6" />
          <path d="M 13 20 C 13 16 15 15 17 15 C 19 15 22 16 22 20 Z" fill="#F472B6" />
        </g>
      );

    case 'clock':
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <circle cx="13" cy="13" r="8.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="1.2" />
          <line x1="13" y1="13" x2="13" y2="8" stroke="#0284C7" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="13" y1="13" x2="17" y2="13" stroke="#0284C7" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );

    default:
      // Clean neutral step node badge when no physical category applies
      return (
        <g transform={`translate(${ox}, ${oy})`}>
          <circle cx="13" cy="13" r="7.5" fill={isDark ? '#374151' : '#E0E7FF'} stroke={isDark ? '#60A5FA' : '#4F46E5'} strokeWidth="1.4" />
          <circle cx="13" cy="13" r="3" fill={isDark ? '#60A5FA' : '#4F46E5'} />
        </g>
      );
  }
}

export default function FinalVisualReview({
  documentTitle = 'Current Document',
  rawText = '',
  simplifiedText = '',
  paragraphs = []
}) {
  const { settings } = useReadingSettings();
  const [downloaded, setDownloaded] = useState(false);
  const svgRef = useRef(null);

  const fullText = (simplifiedText || rawText || (paragraphs || []).map(p => p.simplifiedText || p.text || '').join(' ')).trim();

  // Dynamic passage-derived process diagram
  const diagram = useMemo(() => {
    return extractPassageDiagram(fullText);
  }, [fullText]);

  // Theme-aware palette adaptation
  const isDark = settings?.theme === 'slate' || settings?.theme === 'high-contrast-dark';
  const canvasBg = isDark ? '#111827' : '#FAF8F5';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const boxBg = isDark ? '#1F2937' : '#FFFFFF';
  const boxBorder = isDark ? '#3B82F6' : '#2563EB';
  const textColor = isDark ? '#F9FAFB' : '#0F172A';
  const subTextColor = isDark ? '#CBD5E1' : '#334155';
  const arrowColor = isDark ? '#60A5FA' : '#2563EB';
  const arrowTextColor = isDark ? '#93C5FD' : '#1D4ED8';
  const headerTextColor = isDark ? '#94A3B8' : '#64748B';

  // Crisp offline PNG save using native canvas
  const handleDownload = () => {
    if (!svgRef.current || !diagram) return;
    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URLObj = window.URL || window.webkitURL || window;
      const blobURL = URLObj.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200; // 2x crisp resolution of 600px display
        canvas.height = 366; // Matches 540x165 ratio
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = canvasBg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const safeTitle = (documentTitle || 'Passage_Diagram')
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '_')
            .slice(0, 30);

          const link = document.createElement('a');
          link.download = `${safeTitle || 'Process_Diagram'}.png`;
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setDownloaded(true);
          setTimeout(() => setDownloaded(false), 2000);
        }
        URLObj.revokeObjectURL(blobURL);
      };
      img.src = blobURL;
    } catch (e) {
      console.warn('Download notice:', e);
    }
  };

  // Render strictly horizontal left-to-right educational process diagram
  const renderDiagram = () => {
    if (!diagram || !diagram.nodes || diagram.nodes.length === 0) return null;

    const nodes = diagram.nodes;
    const n = nodes.length;

    // Layout configuration based on node count within 540px width
    let boxW = 104;
    let gap = 32;
    let startX = 14;

    if (n === 2) {
      boxW = 190;
      gap = 80;
      startX = 40;
    } else if (n === 3) {
      boxW = 136;
      gap = 46;
      startX = 20;
    }

    const boxH = 118;
    const boxY = 34;
    const fontSize = n === 4 ? 11 : 12;

    const diagramTitle = diagram.type === 'causal'
      ? 'Cause & Effect Progression'
      : diagram.type === 'process'
        ? 'Process Workflow (Left to Right)'
        : 'Sequence of Events';

    return (
      <g>
        <defs>
          <marker
            id="fvr-diagram-arrow"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill={arrowColor} />
          </marker>
        </defs>

        {/* Diagram Title Banner */}
        <text
          x="270"
          y="20"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.06em"
          fill={headerTextColor}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {diagramTitle.toUpperCase()}
        </text>

        {/* Horizontal Nodes and Right-Facing Arrows */}
        {nodes.map((node, idx) => {
          const bx = startX + idx * (boxW + gap);
          const cx = bx + boxW / 2;

          // Connector label for horizontal arrow
          let connectorLabel = 'then';
          if (diagram.type === 'causal') {
            connectorLabel = idx === 0 ? 'causes' : 'leads to';
          } else if (diagram.type === 'events') {
            connectorLabel = 'then';
          }

          const arrowStartX = bx + boxW + 4;
          const arrowEndX = bx + boxW + gap - 4;
          const arrowY = boxY + 44;

          return (
            <g key={node.id}>
              {/* Process Box */}
              <rect
                x={bx}
                y={boxY}
                width={boxW}
                height={boxH}
                rx="10"
                ry="10"
                fill={boxBg}
                stroke={boxBorder}
                strokeWidth="1.8"
              />

              {/* Small Colorful Vector Illustration Centered at Top */}
              {renderStepPicture(node.visual, cx, boxY + 30, isDark)}

              {/* Main Accurate Process Stage Label (High Contrast & Clear) */}
              <text
                x={cx}
                y={boxY + 68}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight="700"
                fill={textColor}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {node.main}
              </text>

              {/* Supporting Detail Extracted from Text */}
              {node.sub && (
                <text
                  x={cx}
                  y={boxY + 86}
                  textAnchor="middle"
                  fontSize={fontSize - 1.5}
                  fontWeight="500"
                  fill={subTextColor}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {node.sub.length > 22 ? `${node.sub.slice(0, 20)}...` : node.sub}
                </text>
              )}

              {/* Right-Facing Connecting Arrow between adjacent horizontal steps */}
              {idx < n - 1 && (
                <g>
                  <line
                    x1={arrowStartX}
                    y1={arrowY}
                    x2={arrowEndX}
                    y2={arrowY}
                    stroke={arrowColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    markerEnd="url(#fvr-diagram-arrow)"
                  />
                  <text
                    x={(arrowStartX + arrowEndX) / 2}
                    y={arrowY - 8}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="600"
                    fill={arrowTextColor}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {connectorLabel}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div
      className="final-visual-review-card mt-8 p-5 sm:p-7 rounded-2xl border shadow-md transition-all duration-200"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-main)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center space-x-2">
          <div
            className="p-1.5 rounded-lg border"
            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}
          >
            <Workflow className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Process Diagram</h3>
            <p className="text-[11px] opacity-70">Passage-derived visual flow</p>
          </div>
        </div>

        {diagram && (
          <button
            type="button"
            onClick={handleDownload}
            className="vj-btn text-[11px] py-1 px-2.5"
            title="Save process diagram image"
          >
            {downloaded ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="vj-content-area flex flex-col items-center justify-center py-2 sm:py-4">
        {diagram ? (
          <div className="vj-small-image-container w-full max-w-[600px]">
            <svg
              ref={svgRef}
              viewBox="0 0 540 165"
              className="vj-svg-illustration rounded-xl border shadow-xs"
              style={{
                backgroundColor: canvasBg,
                borderColor: borderColor
              }}
              xmlns="http://www.w3.org/2000/svg"
            >
              {renderDiagram()}
            </svg>
          </div>
        ) : (
          <div className="vj-fallback-box w-full max-w-[600px] py-6 px-5 text-center">
            <p className="text-xs sm:text-sm font-semibold opacity-85 leading-relaxed">
              Process diagram requires at least 2 clear steps or connected ideas in the passage.
            </p>
            <p className="text-[11px] opacity-65 mt-1">
              As you read or upload structured text with steps or causes, a school-style process diagram will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
