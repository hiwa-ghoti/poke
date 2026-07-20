/* Pokémon Champions team helper + type quiz */

const TYPES = [
  'ノーマル', 'ほのお', 'みず', 'くさ', 'でんき', 'こおり',
  'かくとう', 'どく', 'じめん', 'ひこう', 'エスパー', 'むし',
  'いわ', 'ゴースト', 'ドラゴン', 'あく', 'はがね', 'フェアリー'
];

const TYPE_COLORS = {
  'ノーマル': '#A8A878', 'ほのお': '#F08030', 'みず': '#6890F0', 'くさ': '#78C850',
  'でんき': '#F8D030', 'こおり': '#98D8D8', 'かくとう': '#C03028', 'どく': '#A040A0',
  'じめん': '#E0C068', 'ひこう': '#A890F0', 'エスパー': '#F85888', 'むし': '#A8B820',
  'いわ': '#B8A038', 'ゴースト': '#705898', 'ドラゴン': '#7038F8', 'あく': '#705848',
  'はがね': '#B8B8D0', 'フェアリー': '#EE99AC'
};

const MATCHUPS = {
  'ノーマル': { 'いわ': 0.5, 'ゴースト': 0, 'はがね': 0.5 },
  'ほのお': { 'ほのお': 0.5, 'みず': 0.5, 'くさ': 2, 'こおり': 2, 'むし': 2, 'いわ': 0.5, 'ドラゴン': 0.5, 'はがね': 2 },
  'みず': { 'ほのお': 2, 'みず': 0.5, 'くさ': 0.5, 'じめん': 2, 'いわ': 2, 'ドラゴン': 0.5 },
  'くさ': { 'ほのお': 0.5, 'みず': 2, 'くさ': 0.5, 'どく': 0.5, 'じめん': 2, 'ひこう': 0.5, 'むし': 0.5, 'いわ': 2, 'ドラゴン': 0.5, 'はがね': 0.5 },
  'でんき': { 'みず': 2, 'くさ': 0.5, 'でんき': 0.5, 'じめん': 0, 'ひこう': 2, 'ドラゴン': 0.5 },
  'こおり': { 'ほのお': 0.5, 'みず': 0.5, 'くさ': 2, 'こおり': 0.5, 'じめん': 2, 'ひこう': 2, 'ドラゴン': 2, 'はがね': 0.5 },
  'かくとう': { 'ノーマル': 2, 'こおり': 2, 'どく': 0.5, 'ひこう': 0.5, 'エスパー': 0.5, 'むし': 0.5, 'いわ': 2, 'ゴースト': 0, 'あく': 2, 'はがね': 2, 'フェアリー': 0.5 },
  'どく': { 'くさ': 2, 'どく': 0.5, 'じめん': 0.5, 'いわ': 0.5, 'ゴースト': 0.5, 'はがね': 0, 'フェアリー': 2 },
  'じめん': { 'ほのお': 2, 'くさ': 0.5, 'でんき': 2, 'どく': 2, 'ひこう': 0, 'むし': 0.5, 'いわ': 2, 'はがね': 2 },
  'ひこう': { 'くさ': 2, 'でんき': 0.5, 'かくとう': 2, 'むし': 2, 'いわ': 0.5, 'はがね': 0.5 },
  'エスパー': { 'かくとう': 2, 'どく': 2, 'エスパー': 0.5, 'あく': 0, 'はがね': 0.5 },
  'むし': { 'ほのお': 0.5, 'くさ': 2, 'かくとう': 0.5, 'どく': 0.5, 'ひこう': 0.5, 'エスパー': 2, 'ゴースト': 0.5, 'あく': 2, 'はがね': 0.5, 'フェアリー': 0.5 },
  'いわ': { 'ほのお': 2, 'こおり': 2, 'かくとう': 0.5, 'じめん': 0.5, 'ひこう': 2, 'むし': 2, 'はがね': 0.5 },
  'ゴースト': { 'ノーマル': 0, 'エスパー': 2, 'ゴースト': 2, 'あく': 0.5 },
  'ドラゴン': { 'ドラゴン': 2, 'はがね': 0.5, 'フェアリー': 0 },
  'あく': { 'かくとう': 0.5, 'エスパー': 2, 'ゴースト': 2, 'あく': 0.5, 'フェアリー': 0.5 },
  'はがね': { 'ほのお': 0.5, 'みず': 0.5, 'でんき': 0.5, 'こおり': 2, 'いわ': 2, 'はがね': 0.5, 'フェアリー': 2 },
  'フェアリー': { 'ほのお': 0.5, 'かくとう': 2, 'どく': 0.5, 'ドラゴン': 2, 'あく': 2, 'はがね': 0.5 }
};

const SP_ORDER = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
const SP_LABELS = {
  hp: 'HP', atk: '攻撃', def: '防御', spa: '特攻', spd: '特防', spe: '素早'
};
const SP_SHORT = { hp: 'H', atk: 'A', def: 'B', spa: 'C', spd: 'D', spe: 'S' };
const FALLBACK_ITEMS = [
  'オボンのみ', 'たべのこし', 'きあいのタスキ', 'いのちのたま',
  'こだわりスカーフ', 'とつげきチョッキ', 'ひかりのねんど', 'くろいヘドロ',
  'クリアチャーム', 'メンタルハーブ', 'しめったいわ', 'あついいわ'
];
/** Season M-4 (Reg M-B) 使用率上位を自動編成で優先 */
const META_PRIORITY = {
  doubles: [
    'garchomp', 'kingambit', 'incineroar', 'mega-charizard-y', 'charizard',
    'sinistcha', 'basculegion', 'whimsicott', 'farigiraf', 'sylveon',
    'sneasler', 'mega-aerodactyl', 'aerodactyl', 'mega-staraptor', 'staraptor',
    'archaludon', 'pelipper', 'venusaur', 'grimmsnarl', 'mega-raichu-y', 'raichu',
    'torkoal', 'mega-swampert', 'swampert', 'mega-metagross', 'metagross',
    'mega-floette', 'floette', 'gholdengo', 'annihilape', 'mega-mawile', 'mawile'
  ],
  singles: [
    'garchomp', 'mimikyu', 'archaludon', 'mega-metagross', 'metagross',
    'hippowdon', 'primarina', 'meowscarada', 'mega-gyarados', 'gyarados',
    'mega-blaziken', 'blaziken', 'mega-charizard-y', 'charizard',
    'mega-delphox', 'delphox', 'greninja', 'hydreigon', 'corviknight',
    'glimmora', 'basculegion', 'mega-raichu-y', 'kingambit', 'gholdengo'
  ]
};
const SPRITE_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

let pokemonList = [];
let buildsMap = {};
let coresList = [];
let pokemonById = {};
let megaStoneById = {};

let selectedIds = [];
let battleFormat = 'singles';
let activeCore = null;
let currentSuggestions = [];

let dualMode = true;
let revealAnswers = false;
let currentOpponentTypes = [];
let lastFocusedBeforeModal = null;

const $ = (id) => document.getElementById(id);

async function loadData() {
  const [pokemon, builds, cores, itemEffects, megaStones] = await Promise.all([
    fetch('data/pokemon.json').then((r) => r.json()),
    fetch('data/builds.json').then((r) => r.json()),
    fetch('data/cores.json').then((r) => r.json()),
    fetch('data/item-effects.json').then((r) => r.json()).catch(() => ({})),
    fetch('data/mega-stones.json').then((r) => r.json()).catch(() => ({}))
  ]);
  pokemonList = pokemon;
  buildsMap = builds;
  coresList = cores;
  window.ITEM_EFFECTS = itemEffects;
  megaStoneById = megaStones;
  pokemonById = Object.fromEntries(pokemon.map((p) => [p.id, p]));
  const countEl = $('roster-count');
  if (countEl) countEl.textContent = String(pokemon.length);
}

function isMegaFormId(id) {
  return Boolean(pokemonById[id]?.isMegaForm);
}

function baseFormId(id) {
  return pokemonById[id]?.baseFormId || id;
}

function expandSelectedIds(selected) {
  const expanded = new Set(selected);
  selected.forEach((id) => {
    expanded.add(id);
    const poke = pokemonById[id];
    if (poke?.baseFormId) expanded.add(poke.baseFormId);
    if (poke && !poke.baseFormId) {
      pokemonList
        .filter((p) => p.baseFormId === id)
        .forEach((p) => expanded.add(p.id));
    }
  });
  return expanded;
}

function matchesSearchQuery(poke, query) {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  if (poke.name.toLowerCase().includes(q)) return true;
  if (poke.nameEn && poke.nameEn.toLowerCase().includes(q)) return true;
  return false;
}

function spriteUrl(poke) {
  if (!poke?.dex) return '';
  return `${SPRITE_BASE}/${poke.dex}.png`;
}

function natureFactor(nature, statKey) {
  if (!nature || statKey === 'hp') return 1;
  if (nature.up === statKey) return 1.1;
  if (nature.down === statKey) return 0.9;
  return 1;
}

/** Champions Lv50 / IV31 / SP 公式（pkmnchamps準拠） */
function calcFinalStat(base, sp, nature, statKey) {
  const iv = 31;
  const pre = Math.floor((2 * base + iv + sp * 2) / 2);
  if (statKey === 'hp') return pre + 60;
  return Math.floor((pre + 5) * natureFactor(nature, statKey));
}

function calcAllFinalStats(poke, build) {
  const nature = build.nature || null;
  const out = {};
  SP_ORDER.forEach((key) => {
    out[key] = calcFinalStat(poke.base[key], build.sp[key] || 0, nature, key);
  });
  return out;
}

function getMultiplier(attackType, defenseType) {
  const table = MATCHUPS[attackType];
  return table[defenseType] !== undefined ? table[defenseType] : 1.0;
}

function defenseMultiplier(attackType, types) {
  return types.reduce((acc, t) => acc * getMultiplier(attackType, t), 1);
}

function buildsForPokemon(pokemonId) {
  const poke = pokemonById[pokemonId];
  const ids = new Set([pokemonId]);
  if (poke?.baseFormId) ids.add(poke.baseFormId);
  return Object.entries(buildsMap)
    .filter(([, b]) => ids.has(b.pokemonId))
    .map(([id, b]) => ({ id, ...b }));
}

function isMegaStoneItem(item) {
  return /ナイト|メガストーン/.test(item || '');
}

function isMegaBuild(build) {
  if (!build) return false;
  if (isMegaStoneItem(build.item)) return true;
  if (build.itemEffect && build.itemEffect.includes('メガシンカ')) return true;
  // 「メガネ」等に誤爆しないよう、ラベルはメガ型のみ
  return Boolean(build.label && /^メガ([XY]|$)/.test(build.label));
}

function megaFormsForBase(baseId) {
  return pokemonList.filter((p) => p.baseFormId === baseId);
}

/** 選出軸がメガ進化可能なら、候補ではメガフォルムを優先する */
function preferMegaAxisId(pokemonId) {
  const poke = pokemonById[pokemonId];
  if (!poke) return pokemonId;
  if (poke.isMegaForm) return pokemonId;
  const megas = megaFormsForBase(pokemonId);
  if (!megas.length) return pokemonId;
  const priority = META_PRIORITY[battleFormat] || META_PRIORITY.doubles;
  const byMeta = megas.find((m) => priority.includes(m.id));
  if (byMeta) return byMeta.id;
  const y = megas.find((m) => / Y$/i.test(m.nameEn || ''));
  if (y) return y.id;
  return megas[0].id;
}

function megaStoneName(poke) {
  if (!poke?.isMegaForm) return null;
  if (megaStoneById[poke.id]) return megaStoneById[poke.id];
  const curated = buildsForPokemon(poke.id).find(
    (b) => b.pokemonId === poke.id && isMegaStoneItem(b.item)
  );
  if (curated) return curated.item;

  // X/Y 片方だけキュレートされている場合は石名の末尾だけ差し替え
  const variant = (poke.name.match(/[XY]$/) || [])[0];
  if (variant) {
    for (const sib of megaFormsForBase(poke.baseFormId)) {
      const sibStone = megaStoneById[sib.id]
        || buildsForPokemon(sib.id).find((b) => b.pokemonId === sib.id && isMegaStoneItem(b.item))?.item;
      if (sibStone && /[XY]$/.test(sibStone)) {
        return sibStone.replace(/[XY]$/, variant);
      }
    }
  }

  const baseJa = poke.name.replace(/^メガ/, '');
  const stem = baseJa.replace(/[XY]$/, '');
  return variant ? `${stem}ナイト${variant}` : `${baseJa}ナイト`;
}

function defaultBuildId(pokemonId) {
  const poke = pokemonById[pokemonId];
  const list = buildsForPokemon(pokemonId);
  if (!list.length) return null;
  if (poke?.isMegaForm) {
    // このメガ自身向けのメガストーン型だけ採用（素体のカシブのみ等は絶対に使わない）
    const mega = list.find(
      (b) => b.pokemonId === pokemonId && isMegaStoneItem(b.item)
    );
    return mega ? mega.id : null;
  }
  const curated = list.find((b) => !b.auto && !isMegaBuild(b));
  const nonMega = list.find((b) => !isMegaBuild(b));
  return (curated || nonMega || list[0]).id;
}

function hasCuratedBuild(pokemonId) {
  if (pokemonById[pokemonId]?.isMegaForm) {
    return buildsForPokemon(pokemonId).some(
      (b) => b.pokemonId === pokemonId && isMegaStoneItem(b.item) && !b.auto
    );
  }
  return buildsForPokemon(pokemonId).some(
    (b) => !b.auto && !isMegaBuild(b) && b.pokemonId === pokemonId
  );
}

/**
 * 持ち物が空いている実戦型を優先して選ぶ。
 * usedItems に無い item の curated build → なければ default。
 */
function pickBuildId(pokemonId, usedItems = new Set()) {
  const poke = pokemonById[pokemonId];
  if (poke?.isMegaForm) {
    return ensureBuildId(pokemonId);
  }
  const curated = buildsForPokemon(pokemonId).filter(
    (b) => !b.auto && !isMegaBuild(b) && b.pokemonId === pokemonId
  );
  const free = curated.find((b) => b.item && !usedItems.has(b.item));
  if (free) return free.id;
  if (curated.length) return curated[0].id;
  return ensureBuildId(pokemonId);
}

/**
 * 重複時は「別の実戦型」へ切替。それでも無理なら最低限の道具差し替え。
 * 技・性格・SPがセットのまま残るので、盲目的な持ち物置換より実戦向き。
 */
function demoteMegaToBase(slot, usedItems) {
  const poke = pokemonById[slot.pokemonId];
  const baseId = poke?.baseFormId || slot.pokemonId;
  const buildId = pickBuildId(baseId, usedItems);
  const build = buildsMap[buildId];
  if (build?.item) usedItems.add(build.item);
  return {
    pokemonId: baseId,
    buildId,
    buildOverride: build
      ? {
          ...build,
          note: `${build.note || ''} ※メガは1体までのため素体型に変更。`
        }
      : undefined
  };
}

function resolveTeamBuilds(slots) {
  const usedItems = new Set();
  let itemIdx = 0;
  let remaps = 0;
  let altBuilds = 0;
  let curatedCount = 0;
  let megaKept = false;

  const resolved = slots.map((slot) => {
    slot = normalizeMegaSlot(slot);
    let build = slot.buildOverride || buildsMap[slot.buildId];
    if (!build) return slot;
    const poke = pokemonById[slot.pokemonId];
    if (!build.auto) curatedCount += 1;

    const isMegaSlot = Boolean(poke?.isMegaForm || isMegaStoneItem(build.item));
    if (isMegaSlot) {
      if (megaKept) {
        remaps += 1;
        return demoteMegaToBase(slot, usedItems);
      }
      megaKept = true;
      usedItems.add(build.item);
      return slot.buildOverride ? slot : { pokemonId: slot.pokemonId, buildId: slot.buildId };
    }

    if (!usedItems.has(build.item)) {
      usedItems.add(build.item);
      return { pokemonId: slot.pokemonId, buildId: slot.buildId };
    }

    // 同じポケモンの別キュレート型で空き持ち物を探す
    const alts = buildsForPokemon(slot.pokemonId).filter(
      (b) => !b.auto && !isMegaBuild(b)
        && b.pokemonId === slot.pokemonId
        && b.id !== slot.buildId
        && b.item
        && !usedItems.has(b.item)
    );
    if (alts.length) {
      altBuilds += 1;
      usedItems.add(alts[0].item);
      const alt = buildsMap[alts[0].id] || alts[0];
      return {
        pokemonId: slot.pokemonId,
        buildId: alts[0].id,
        buildOverride: {
          ...alt,
          note: `${alt.note || ''} ※Item Clause回避のため「${alt.label || alt.item}」型に切替。`
        }
      };
    }

    // 最終手段: 持ち物だけ変更（型の整合は崩れるので件数を数える）
    while (itemIdx < FALLBACK_ITEMS.length && usedItems.has(FALLBACK_ITEMS[itemIdx])) {
      itemIdx += 1;
    }
    const item = FALLBACK_ITEMS[itemIdx] || `${build.item}（要変更）`;
    itemIdx += 1;
    remaps += 1;
    usedItems.add(item);
    return {
      ...slot,
      buildOverride: {
        ...build,
        item,
        note: `${build.note || ''} ※持ち物重複のため仮変更。別型の検討を推奨。`
      }
    };
  });

  return { slots: resolved, remaps, altBuilds, curatedCount };
}

/** 実践ルールでパーティを採点・説明する */
function analyzeTeam(slots) {
  const members = slots.map((slot) => {
    const { poke, build } = resolveSlot(slot);
    return { poke, build, slot };
  }).filter((m) => m.poke && m.build);

  const items = members.map((m) => m.build.item);
  const itemDup = [...new Set(items.filter((x, i) => items.indexOf(x) !== i))];
  const megaCount = members.filter((m) => m.poke.isMegaForm || isMegaBuild(m.build)).length;
  const roles = new Set(members.flatMap((m) => m.poke.roles || []));
  const typeLists = members.map((m) => m.poke.types || []);
  const weakTo = weakTypesForTeam(typeLists).slice(0, 4);
  const metaHits = members.filter((m) => metaPriorityScore(m.poke.id) > 0).length;
  const curatedHits = members.filter((m) => !m.build.auto).length;
  const hasSupport = members.some((m) =>
    (m.poke.roles || []).includes('support')
    || /サポート|壁|おいかぜ|ねこ/.test(`${m.build.role || ''}${m.build.label || ''}`)
  );
  const hasAttacker = members.some((m) =>
    (m.poke.roles || []).includes('attacker')
    || /エース|アタッカー|物理|特殊/.test(m.build.role || '')
  );

  const checks = [
    {
      id: 'mega',
      ok: megaCount <= 1,
      label: megaCount <= 1 ? `メガ ${megaCount}/1` : `メガ超過 ${megaCount}`
    },
    {
      id: 'item',
      ok: itemDup.length === 0,
      label: itemDup.length === 0 ? '持ち物OK' : `重複: ${itemDup.join('・')}`
    },
    {
      id: 'meta',
      ok: metaHits >= 3,
      label: `環境枠 ${metaHits}/6`
    },
    {
      id: 'roles',
      ok: hasSupport && hasAttacker,
      label: hasSupport && hasAttacker ? '役割バランス' : '役割偏り'
    }
  ];

  let score = metaHits * 3 + curatedHits * 2;
  if (megaCount === 1) score += 4;
  if (megaCount > 1) score -= 12;
  if (!itemDup.length) score += 5;
  else score -= itemDup.length * 4;
  if (hasSupport) score += 3;
  if (hasAttacker) score += 3;
  if (weakTo.length <= 2) score += 2;

  const notes = [];
  if (megaCount === 1) {
    const mega = members.find((m) => m.poke.isMegaForm || isMegaBuild(m.build));
    notes.push(`メガ枠は${mega?.poke.name || '1体'}に集中。`);
  } else if (megaCount === 0) {
    notes.push('メガ未採用。素体＋道具のサイクル寄り。');
  } else {
    notes.push('メガは対戦中1体まで。余剰メガを素体へ落としました。');
  }
  if (!itemDup.length) notes.push('Item Clauseを満たす持ち物割当。');
  else notes.push(`持ち物重複あり: ${itemDup.join('、')}。要調整。`);
  if (metaHits >= 4) notes.push(`使用率上位を${metaHits}体採用。`);
  else if (metaHits >= 2) notes.push(`環境ポケモンを${metaHits}体混ぜた実戦寄り案。`);
  if (hasSupport && hasAttacker) notes.push('サポートとエースの役割が両立。');
  if (weakTo.length) notes.push(`チーム弱点になりやすい技タイプ: ${weakTo.join(' / ')}。`);

  return {
    checks,
    score,
    notes,
    weakTo,
    megaCount,
    metaHits,
    curatedHits,
    roles: [...roles],
    rationale: notes.join(' ')
  };
}

function enrichTeamSuggestion(team) {
  const analysis = analyzeTeam(team.slots || []);
  return {
    ...team,
    analysis,
    rationale: team.rationale || analysis.rationale,
    practicalScore: (team.score || 0) + analysis.score
  };
}

function generateRuntimeBuild(pokemonId) {
  const poke = pokemonById[pokemonId];
  if (!poke) return null;
  const phys = poke.base.atk >= poke.base.spa;
  const nature = poke.roles.includes('fast')
    ? (phys ? { name: 'ようき', up: 'spe', down: 'spa' } : { name: 'おくびょう', up: 'spe', down: 'atk' })
    : poke.roles.includes('wall')
      ? { name: 'わんぱく', up: 'def', down: 'spa' }
      : (phys ? { name: 'いじっぱり', up: 'atk', down: 'spa' } : { name: 'ひかえめ', up: 'spa', down: 'atk' });
  const offensive = phys ? 'atk' : 'spa';
  const sp = poke.roles.includes('wall')
    ? { hp: 32, atk: 0, def: 32, spa: 0, spd: 0, spe: 2 }
    : poke.roles.includes('support')
      ? { hp: 32, atk: 0, def: 20, spa: 0, spd: 14, spe: 0 }
      : { hp: 4, atk: 0, def: 0, spa: 0, spd: 0, spe: 30, [offensive]: 32 };
  SP_ORDER.forEach((k) => { if (sp[k] == null) sp[k] = 0; });
  const id = `${pokemonId}-runtime`;
  const stone = poke.isMegaForm ? megaStoneName(poke) : null;
  const item = stone
    || FALLBACK_ITEMS[Math.abs(pokemonId.length * 7) % FALLBACK_ITEMS.length];
  buildsMap[id] = {
    pokemonId,
    label: poke.isMegaForm ? 'メガ' : '自動提案',
    item,
    itemEffect: stone ? `メガシンカ用メガストーン（${poke.name.replace(/^メガ/, '')}）。` : undefined,
    ability: poke.abilities?.[0]?.name || '—',
    abilityOptions: (poke.abilities || []).map((a) => a.name),
    role: poke.roles.includes('support') ? 'サポート' : poke.roles.includes('wall') ? '耐久' : 'アタッカー',
    moves: phys
      ? ['じしん', 'インファイト', 'いわなだれ', 'まもる']
      : ['シャドーボール', 'かえんほうしゃ', '10まんボルト', 'まもる'],
    sp,
    nature,
    note: '全参戦対応の自動型です。技・持ち物はゲーム内で調整してください。',
    auto: true
  };
  return id;
}

function ensureBuildId(pokemonId) {
  return defaultBuildId(pokemonId) || generateRuntimeBuild(pokemonId);
}

/** メガ枠の持ち物をメガストーンに矯正する */
function normalizeMegaSlot(slot) {
  const poke = pokemonById[slot.pokemonId];
  if (!poke?.isMegaForm) return slot;
  const build = slot.buildOverride || buildsMap[slot.buildId];
  const stone = megaStoneName(poke);
  if (!stone) return slot;
  if (build && isMegaStoneItem(build.item) && build.pokemonId === poke.id) {
    return slot;
  }
  const buildId = ensureBuildId(poke.id);
  const ensured = buildsMap[buildId];
  if (ensured && isMegaStoneItem(ensured.item)) {
    return { pokemonId: poke.id, buildId };
  }
  return {
    pokemonId: poke.id,
    buildId: buildId || slot.buildId,
    buildOverride: {
      ...(ensured || build || {}),
      pokemonId: poke.id,
      label: 'メガ',
      item: stone,
      itemEffect: `メガシンカ用メガストーン（${poke.name.replace(/^メガ/, '')}）。`
    }
  };
}

function requirementMatch(requiresAny, selected) {
  const expanded = expandSelectedIds(selected);
  return requiresAny.some((req) => req.every((id) => expanded.has(id)));
}

function upgradeSlotsForSelection(slots, selected) {
  return slots.map((slot) => {
    const selMega = selected.find((id) => baseFormId(id) === slot.pokemonId && isMegaFormId(id));
    if (!selMega) return slot;
    return {
      ...slot,
      pokemonId: selMega,
      buildId: ensureBuildId(selMega)
    };
  });
}

function scoreCore(core, selected) {
  const ids = core.slots.map((s) => s.pokemonId);
  const expanded = expandSelectedIds(selected);
  let score = 0;
  expanded.forEach((id) => {
    if (ids.includes(id) || ids.includes(baseFormId(id))) score += 10;
  });
  if (core.format.includes(battleFormat)) score += 3;
  if (core.rating === '環境テンプレ') score += 4;
  else if (core.rating === 'おすすめ' || core.rating === '実戦テンプレ') score += 2;
  ids.forEach((id) => { score += Math.min(metaPriorityScore(id), 8) * 0.1; });
  return score;
}

function findCuratedCores(selected) {
  return coresList
    .filter((core) => requirementMatch(core.requiresAny, selected))
    .filter((core) => core.format.includes(battleFormat) || core.format.length === 2)
    .map((core) => ({
      ...core,
      slots: upgradeSlotsForSelection(core.slots, selected),
      source: 'curated',
      score: scoreCore(core, selected)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function weakTypesForTeam(typeLists) {
  const weaknessScore = {};
  TYPES.forEach((atk) => {
    let hits = 0;
    typeLists.forEach((types) => {
      if (defenseMultiplier(atk, types) >= 2) hits += 1;
    });
    if (hits > 0) weaknessScore[atk] = hits;
  });
  return Object.entries(weaknessScore)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);
}

function resistsAttack(types, attackType) {
  return defenseMultiplier(attackType, types) < 1;
}

function metaPriorityScore(pokemonId) {
  const list = META_PRIORITY[battleFormat] || META_PRIORITY.doubles;
  const idx = list.indexOf(pokemonId);
  if (idx >= 0) return 40 - Math.min(idx, 39);
  const base = baseFormId(pokemonId);
  const baseIdx = list.indexOf(base);
  if (baseIdx >= 0) return 30 - Math.min(baseIdx, 29);
  return 0;
}

function speciesKey(id) {
  return baseFormId(id);
}

function pickFallbackTeammates(selected, neededRoles) {
  const used = new Set(selected);
  const usedSpecies = new Set(selected.map(speciesKey));
  const axisHasMega = selected.some((id) => isMegaFormId(id));
  const picks = [];
  const pool = [...pokemonList]
    .filter((p) => !used.has(p.id) && !usedSpecies.has(speciesKey(p.id)))
    // 軸が既にメガなら、味方枠は素体を優先（パーティにメガを重ねない）
    .filter((p) => !(axisHasMega && p.isMegaForm))
    .sort((a, b) => {
      const score = (p) =>
        metaPriorityScore(p.id) +
        (hasCuratedBuild(p.id) ? 12 : 0) +
        (p.roles.includes('support') ? 3 : 0) +
        (p.roles.includes('wall') ? 2 : 0) +
        (p.roles.includes('attacker') ? 2 : 0) +
        (p.roles.includes('fast') ? 1 : 0) +
        (p.mega && !p.isMegaForm ? 1 : 0) -
        (p.isMegaForm ? 8 : 0);
      return score(b) - score(a);
    });

  const selectedTypes = selected.map((id) => pokemonById[id]?.types || []);
  const weakTo = weakTypesForTeam(selectedTypes);

  neededRoles.forEach((role) => {
    let candidates = pool.filter((p) => !used.has(p.id) && !usedSpecies.has(speciesKey(p.id)) && p.roles.includes(role));
    if (weakTo.length) {
      const cover = candidates.filter((p) =>
        weakTo.slice(0, 3).some((atk) => resistsAttack(p.types, atk))
      );
      if (cover.length) candidates = cover;
    }
    const selTypeSet = new Set(selectedTypes.flat());
    candidates.sort((a, b) => {
      const curated = (hasCuratedBuild(b.id) ? 1 : 0) - (hasCuratedBuild(a.id) ? 1 : 0);
      if (curated !== 0) return curated;
      const meta = metaPriorityScore(b.id) - metaPriorityScore(a.id);
      if (meta !== 0) return meta;
      const ua = a.types.filter((t) => selTypeSet.has(t)).length;
      const ub = b.types.filter((t) => selTypeSet.has(t)).length;
      return ua - ub;
    });
    const pick = candidates[0] || pool.find((p) => !used.has(p.id) && !usedSpecies.has(speciesKey(p.id)));
    if (pick) {
      used.add(pick.id);
      usedSpecies.add(speciesKey(pick.id));
      picks.push(pick.id);
    }
  });

  while (picks.length + selected.length < 6) {
    const next = pool.find((p) => !used.has(p.id) && !usedSpecies.has(speciesKey(p.id)));
    if (!next) break;
    used.add(next.id);
    usedSpecies.add(speciesKey(next.id));
    picks.push(next.id);
  }

  return picks;
}

function assignItemsWithoutDup(slots) {
  return resolveTeamBuilds(slots).slots;
}

function buildFallbackTeams(selected) {
  const concepts = [
    {
      name: 'バランス編成',
      rating: '実戦案',
      concept: '選出軸を残し、サポート／耐久／攻撃／速度で穴埋めした実戦寄りパーティ。',
      roles: ['support', 'wall', 'attacker', 'fast']
    },
    {
      name: '攻め編成',
      rating: '実戦案',
      concept: 'アタッカーを厚くした押し切り案。おいかぜ／ねこだまし役も確保。',
      roles: ['attacker', 'fast', 'support', 'attacker']
    },
    {
      name: '耐久・崩し編成',
      rating: '実戦案',
      concept: '耐久とサポートを厚くし、後続で崩す安定寄り案。',
      roles: ['wall', 'support', 'wall', 'attacker']
    }
  ];

  return concepts.map((c, index) => {
    const axis = selected.map(preferMegaAxisId);
    const teammates = pickFallbackTeammates(axis, c.roles);
    const order = [...axis, ...teammates].slice(0, 6);
    const usedItems = new Set();
    let slots = order.map((pokemonId) => {
      const buildId = pickBuildId(pokemonId, usedItems);
      const build = buildsMap[buildId];
      if (build?.item) usedItems.add(build.item);
      return { pokemonId, buildId };
    }).filter((s) => s.buildId);

    const resolved = resolveTeamBuilds(slots);
    slots = resolved.slots;
    const names = order.map((id) => pokemonById[id]?.name || id).join(' / ');
    const allCurated = resolved.curatedCount >= slots.length && resolved.remaps === 0;
    return enrichTeamSuggestion({
      id: `fallback-${index}-${order.join('-')}`,
      name: c.name,
      concept: `${c.concept}（${names}）`,
      rating: allCurated ? '実戦寄り' : c.rating,
      format: [battleFormat],
      source: allCurated
        ? '使用率上位の実戦型を組み合わせた提案'
        : (resolved.remaps
          ? '役割・相性ベースの提案（ルール補正済み・一部要調整）'
          : '使用率上位＋実戦型を優先した自動提案'),
      slots
    });
  });
}

function suggestTeams(selected) {
  if (!selected.length) return [];
  const curated = findCuratedCores(selected).map((core) => {
    const resolved = resolveTeamBuilds(core.slots);
    return enrichTeamSuggestion({
      ...core,
      slots: resolved.slots,
      source: core.source && core.source !== 'curated'
        ? core.source
        : (core.source || '環境テンプレ')
    });
  });
  const fallback = buildFallbackTeams(selected);
  const merged = [];
  const seen = new Set();
  for (const team of [...curated, ...fallback].sort((a, b) => (b.practicalScore || 0) - (a.practicalScore || 0))) {
    const key = team.slots.map((s) => s.pokemonId).sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(team);
    if (merged.length >= 3) break;
  }
  return merged;
}

function resolveSlot(slot) {
  slot = normalizeMegaSlot(slot);
  const poke = pokemonById[slot.pokemonId];
  const build = slot.buildOverride || buildsMap[slot.buildId];
  return { poke, build, slot };
}

function findDuplicateItems(slots) {
  const counts = {};
  slots.forEach((slot) => {
    const build = slot.buildOverride || buildsMap[slot.buildId];
    if (!build) return;
    counts[build.item] = (counts[build.item] || 0) + 1;
  });
  return Object.entries(counts)
    .filter(([, n]) => n > 1)
    .map(([item]) => item);
}

/* ---------- Team UI ---------- */

function renderSelected() {
  const row = $('selected-pokemon');
  row.replaceChildren();
  selectedIds.forEach((id) => {
    const p = pokemonById[id];
    if (!p) return;
    const chip = document.createElement('span');
    chip.className = 'selected-chip';
    const img = document.createElement('img');
    img.className = 'poke-thumb';
    img.src = spriteUrl(p);
    img.alt = '';
    img.loading = 'lazy';
    img.width = 28;
    img.height = 28;
    chip.appendChild(img);
    const label = document.createElement('span');
    label.textContent = p.name;
    chip.appendChild(label);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.setAttribute('aria-label', `${p.name}を外す`);
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      selectedIds = selectedIds.filter((x) => x !== id);
      renderSelected();
      updateSuggestButton();
      clearSuggestions();
    });
    chip.appendChild(remove);
    row.appendChild(chip);
  });
  updateSuggestButton();
}

function updateSuggestButton() {
  const disabled = selectedIds.length === 0;
  $('suggest-btn').disabled = disabled;
  const refine = $('ai-refine-btn');
  if (refine) refine.disabled = disabled;
}

function clearSuggestions() {
  currentSuggestions = [];
  activeCore = null;
  $('core-list').innerHTML = '<p class="empty-state">ポケモンを選んで候補を表示できます</p>';
  $('team-detail').hidden = true;
  const aiBox = $('ai-team-panel');
  if (aiBox) aiBox.hidden = true;
}

function renderSearchResults(query) {
  const box = $('search-results');
  const q = query.trim();
  if (!q || selectedIds.length >= 2) {
    box.classList.remove('is-open');
    box.replaceChildren();
    return;
  }
  const results = pokemonList
    .filter((p) => {
      if (selectedIds.includes(p.id)) return false;
      return matchesSearchQuery(p, q);
    })
    .sort((a, b) => {
      const aMega = a.isMegaForm ? 0 : 1;
      const bMega = b.isMegaForm ? 0 : 1;
      if (aMega !== bMega && (q.startsWith('メガ') || q.toLowerCase().startsWith('mega'))) {
        return aMega - bMega;
      }
      return a.dex - b.dex || a.name.localeCompare(b.name, 'ja');
    })
    .slice(0, 80);
  box.replaceChildren();
  if (!results.length) {
    box.classList.remove('is-open');
    return;
  }
  results.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'search-item';
    btn.setAttribute('role', 'option');
    const img = document.createElement('img');
    img.className = 'poke-thumb';
    img.src = spriteUrl(p);
    img.alt = '';
    img.loading = 'lazy';
    img.width = 36;
    img.height = 36;
    btn.appendChild(img);
    const name = document.createElement('span');
    name.textContent = p.name;
    btn.appendChild(name);
    p.types.forEach((t) => {
      const mini = document.createElement('span');
      mini.className = 'type-mini';
      mini.textContent = t.substring(0, 2);
      mini.style.background = TYPE_COLORS[t];
      btn.appendChild(mini);
    });
    btn.addEventListener('click', () => {
      selectedIds.push(p.id);
      $('poke-search').value = '';
      box.classList.remove('is-open');
      renderSelected();
      clearSuggestions();
    });
    box.appendChild(btn);
  });
  box.classList.add('is-open');
}

function renderCoreList(list) {
  const el = $('core-list');
  el.replaceChildren();
  if (!list.length) {
    el.innerHTML = '<p class="empty-state">候補が見つかりませんでした</p>';
    return;
  }
  list.forEach((core) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'core-card' + (activeCore === core.id ? ' is-active' : '');
    const checks = (core.analysis?.checks || [])
      .map((c) => `<span class="check-chip${c.ok ? '' : ' is-bad'}">${c.label}</span>`)
      .join('');

    card.innerHTML = `
      <div class="core-card-top">
        <p class="core-name">${core.name}</p>
        <span class="core-badge">${core.rating}${core.ai ? ' · AI' : ''}</span>
      </div>
      <p class="core-desc">${core.concept}</p>
      ${core.source ? `<p class="core-source">${core.source}${core.replicaCode ? ` · Replica: <code>${core.replicaCode}</code>` : ''}</p>` : ''}
      ${checks ? `<div class="check-row">${checks}</div>` : ''}
      ${core.rationale ? `<p class="core-rationale">${core.rationale}</p>` : ''}
      <div class="core-names">${core.slots.map((s) => {
        const poke = pokemonById[s.pokemonId];
        const n = poke?.name || s.pokemonId;
        const src = poke ? spriteUrl(poke) : '';
        return `<span class="core-poke"><img class="poke-thumb" src="${src}" alt="" loading="lazy" width="24" height="24">${n}</span>`;
      }).join('')}</div>
    `;
    card.addEventListener('click', () => {
      activeCore = core.id;
      renderCoreList(list);
      renderTeamDetail(core);
    });
    el.appendChild(card);
  });
}

function renderTeamDetail(core) {
  const detail = $('team-detail');
  const list = $('member-list');
  const warn = $('item-warn');
  detail.hidden = false;
  $('detail-title').textContent = `${core.name}の詳細`;

  const dups = findDuplicateItems(core.slots);
  if (dups.length) {
    warn.hidden = false;
    warn.textContent = `持ち物が重複しています: ${dups.join('、')}（Item Clause違反）`;
  } else {
    warn.hidden = true;
  }

  const aiBox = $('ai-team-panel');
  if (aiBox) {
    aiBox.hidden = false;
    const rationaleEl = $('ai-rule-rationale');
    if (rationaleEl) {
      rationaleEl.textContent = core.rationale || core.analysis?.rationale || 'ルールに基づく説明はありません。';
    }
    const explainOut = $('ai-explain-out');
    if (explainOut) {
      explainOut.textContent = core.aiExplain || '';
      explainOut.hidden = !core.aiExplain;
    }
    aiBox.dataset.coreId = core.id;
  }

  list.replaceChildren();
  core.slots.forEach((slot) => {
    const { poke, build } = resolveSlot(slot);
    if (!poke || !build) return;

    const card = document.createElement('article');
    card.className = 'member-card';

    const typesHtml = poke.types.map((t) =>
      `<span class="type-mini" style="background:${TYPE_COLORS[t]}">${t.substring(0, 2)}</span>`
    ).join('');

    const movesHtml = build.moves.map((m) => `<div class="move-chip">${m}</div>`).join('');
    const spTotal = SP_ORDER.reduce((a, k) => a + (build.sp[k] || 0), 0);
    const finals = calcAllFinalStats(poke, build);
    const nature = build.nature;
    const natureText = nature
      ? `${nature.name}（${SP_SHORT[nature.up]}↑ / ${SP_SHORT[nature.down]}↓）`
      : '—';

    const itemEffect = build.itemEffect
      || (window.ITEM_EFFECTS && window.ITEM_EFFECTS[build.item])
      || '効果はゲーム内で確認してください。';

    const abilityOptions = (build.abilityOptions && build.abilityOptions.length
      ? build.abilityOptions
      : (poke.abilities || []).map((a) => a.name))
      .filter(Boolean);
    const otherAbilities = abilityOptions.filter((a) => a !== build.ability);
    const abilitySlots = (poke.abilities || [])
      .map((a) => `<span class="ability-chip${a.name === build.ability ? ' is-active' : ''}">${a.slot}: ${a.name}</span>`)
      .join('');

    const trainRows = SP_ORDER.map((key) => {
      const sp = build.sp[key] || 0;
      const pct = (sp / 32) * 100;
      let mark = '';
      if (nature?.up === key) mark = ' is-up';
      if (nature?.down === key) mark = ' is-down';
      return `
        <div class="train-row${mark}">
          <div class="train-label">
            <span>${SP_LABELS[key]}</span>
            <span class="train-sp">${sp}<small>/32</small></span>
          </div>
          <div class="train-bar" aria-hidden="true">
            <div class="train-fill" style="width:${pct}%"></div>
          </div>
          <div class="train-final">
            <span class="train-final-label">Lv50</span>
            <strong>${finals[key]}</strong>
          </div>
        </div>`;
    }).join('');

    card.innerHTML = `
      <div class="member-head">
        <div class="member-identity">
          <img class="poke-art" src="${spriteUrl(poke)}" alt="${poke.name}" loading="lazy" width="72" height="72">
          <div>
            <p class="member-name">${poke.name}</p>
            <p class="member-role">${build.role} · ${build.label}</p>
            <div class="member-types" style="justify-content:flex-start;margin-top:6px">${typesHtml}</div>
          </div>
        </div>
      </div>
      <div class="meta-row meta-row-stack">
        <div class="meta-block meta-block-item">
          <p class="meta-label">持ち物</p>
          <p class="meta-value">${build.item}</p>
          <p class="meta-desc">${itemEffect}</p>
        </div>
        <div class="meta-block meta-block-ability">
          <p class="meta-label">特性（この型）</p>
          <p class="meta-value">${build.ability}</p>
          <div class="ability-list">${abilitySlots || `<span class="ability-chip is-active">${build.ability}</span>`}</div>
          ${otherAbilities.length ? `<p class="meta-desc">切替候補: ${otherAbilities.join(' / ')}</p>` : ''}
        </div>
      </div>
      <p class="meta-label" style="margin-bottom:6px">技</p>
      <div class="moves">${movesHtml}</div>
      <div class="train-panel">
        <div class="train-head">
          <p class="meta-label" style="margin:0">育成（Stat Points）</p>
          <p class="train-budget">SP ${spTotal} / 66 · IV 全31 · Lv50</p>
        </div>
        <div class="meta-block nature-block">
          <p class="meta-label">性格（Stat Alignment）</p>
          <p class="meta-value">${natureText}</p>
        </div>
        <div class="train-list">${trainRows}</div>
        <p class="train-footnote">1ステ上限32 / 合計66。実数値はチャンピオンズ計算式で算出。</p>
      </div>
      <p class="note">${build.note}</p>
    `;
    list.appendChild(card);
  });
}

function runSuggest() {
  currentSuggestions = suggestTeams(selectedIds);
  activeCore = currentSuggestions[0]?.id || null;
  renderCoreList(currentSuggestions);
  if (currentSuggestions[0]) renderTeamDetail(currentSuggestions[0]);
  else $('team-detail').hidden = true;
}

/* ---------- Quiz ---------- */

function totalMultiplier(attackType) {
  return currentOpponentTypes.reduce(
    (acc, defType) => acc * getMultiplier(attackType, defType),
    1
  );
}

function formatMult(mult) {
  if (mult === 0.25) return 'x¼';
  if (mult === 0.5) return 'x½';
  if (Number.isInteger(mult)) return `x${mult}`;
  return `x${mult}`;
}

function createTypeChip(typeName) {
  const chip = document.createElement('span');
  chip.className = 'type-chip';
  chip.textContent = typeName;
  chip.style.background = TYPE_COLORS[typeName] || '#666';
  return chip;
}

function renderOpponent() {
  const el = $('opponent-chips');
  el.replaceChildren();
  currentOpponentTypes.forEach((type) => el.appendChild(createTypeChip(type)));
}

function clearRevealStyles() {
  $('attack-buttons').querySelectorAll('.type-btn').forEach((btn) => {
    btn.classList.remove('is-best', 'is-dimmed');
    const badge = btn.querySelector('.mult-badge');
    if (badge) badge.remove();
  });
}

function updateRevealUI() {
  clearRevealStyles();
  $('reveal-btn').setAttribute('aria-pressed', revealAnswers ? 'true' : 'false');
  $('reveal-btn').textContent = revealAnswers ? '正解を隠す' : '正解を見る';
  if (!revealAnswers || !currentOpponentTypes.length) return;

  const scores = TYPES.map((type) => ({ type, mult: totalMultiplier(type) }));
  const best = Math.max(...scores.map((s) => s.mult));
  const hasSuper = best >= 2;

  scores.forEach(({ type, mult }) => {
    const btn = $('attack-buttons').querySelector(`[data-type="${type}"]`);
    if (!btn) return;
    const badge = document.createElement('span');
    badge.className = 'mult-badge';
    badge.textContent = formatMult(mult);
    btn.appendChild(badge);
    const isBest = hasSuper ? mult >= 2 && mult === best : mult === best && best > 0;
    if (isBest && best > 1) btn.classList.add('is-best');
    else if (hasSuper && mult < 2) btn.classList.add('is-dimmed');
    else if (!hasSuper && mult < best) btn.classList.add('is-dimmed');
  });
}

function setTypeMode(isDual) {
  dualMode = isDual;
  $('mode-single').setAttribute('aria-pressed', isDual ? 'false' : 'true');
  $('mode-dual').setAttribute('aria-pressed', isDual ? 'true' : 'false');
  generateOpponentTypes();
}

function generateOpponentTypes() {
  $('result-area').replaceChildren();
  const shuffled = [...TYPES].sort(() => Math.random() - 0.5);
  currentOpponentTypes = dualMode ? [shuffled[0], shuffled[1]] : [shuffled[0]];
  renderOpponent();
  updateRevealUI();
}

function attack(attackType) {
  if (!currentOpponentTypes.length) {
    alert('先に相手のタイプを生成してください！');
    return;
  }
  const total = totalMultiplier(attackType);
  const title = document.createElement('p');
  title.className = 'result-title';
  title.innerHTML = `${attackType}技で攻撃！ 倍率: <span class="result-mult">${formatMult(total)}</span>`;
  const msg = document.createElement('p');
  msg.className = 'result-msg';
  if (total >= 4) msg.textContent = '効果はちょうバツグンだ！';
  else if (total >= 2) msg.textContent = '効果はばつぐんだ！';
  else if (total > 0 && total < 1) msg.textContent = '効果はいまひとつだ...';
  else if (total === 0) msg.textContent = '効果はないみたいだ...';
  $('result-area').replaceChildren(title);
  if (msg.textContent) $('result-area').appendChild(msg);
}

function buildTypeChart() {
  let html = '<table><tr><th>攻撃＼防御</th>';
  TYPES.forEach((defType) => {
    html += `<th>${defType.substring(0, 2)}</th>`;
  });
  html += '</tr>';
  TYPES.forEach((atkType) => {
    html += `<tr><th>${atkType}</th>`;
    TYPES.forEach((defType) => {
      const mult = getMultiplier(atkType, defType);
      let mark = '-';
      let cssClass = '';
      if (mult === 2) { mark = '◯'; cssClass = 'eff-2'; }
      if (mult === 0.5) { mark = '△'; cssClass = 'eff-05'; }
      if (mult === 0) { mark = '×'; cssClass = 'eff-0'; }
      html += `<td class="${cssClass}">${mark}</td>`;
    });
    html += '</tr>';
  });
  html += '</table>';
  $('chart-container').innerHTML = html;
}

function openModal() {
  lastFocusedBeforeModal = document.activeElement;
  $('chart-modal').classList.add('is-open');
  $('chart-sheet').classList.add('is-open');
  $('chart-modal').setAttribute('aria-hidden', 'false');
  $('close-modal-btn').focus();
}

function closeModal() {
  $('chart-modal').classList.remove('is-open');
  $('chart-sheet').classList.remove('is-open');
  $('chart-modal').setAttribute('aria-hidden', 'true');
  if (lastFocusedBeforeModal?.focus) lastFocusedBeforeModal.focus();
}

function isModalOpen() {
  return $('chart-modal').classList.contains('is-open');
}

function setTab(which) {
  const team = which === 'team';
  $('tab-team').setAttribute('aria-selected', team ? 'true' : 'false');
  $('tab-quiz').setAttribute('aria-selected', team ? 'false' : 'true');
  $('view-team').hidden = !team;
  $('view-quiz').hidden = team;
  $('show-chart-btn').hidden = team;
  $('page-title').textContent = team ? '編成支援' : 'タイプ相性クイズ';
}

function initQuizButtons() {
  TYPES.forEach((type) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'type-btn';
    btn.dataset.type = type;
    btn.textContent = type;
    btn.style.background = TYPE_COLORS[type];
    btn.addEventListener('click', () => attack(type));
    $('attack-buttons').appendChild(btn);
  });
}

function bindEvents() {
  $('tab-team').addEventListener('click', () => setTab('team'));
  $('tab-quiz').addEventListener('click', () => setTab('quiz'));

  $('poke-search').addEventListener('input', (e) => renderSearchResults(e.target.value));
  $('poke-search').addEventListener('focus', (e) => renderSearchResults(e.target.value));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
      $('search-results').classList.remove('is-open');
    }
  });

  $('format-singles').addEventListener('click', () => {
    battleFormat = 'singles';
    $('format-singles').setAttribute('aria-pressed', 'true');
    $('format-doubles').setAttribute('aria-pressed', 'false');
    if (selectedIds.length) runSuggest();
  });
  $('format-doubles').addEventListener('click', () => {
    battleFormat = 'doubles';
    $('format-singles').setAttribute('aria-pressed', 'false');
    $('format-doubles').setAttribute('aria-pressed', 'true');
    if (selectedIds.length) runSuggest();
  });

  $('suggest-btn').addEventListener('click', runSuggest);

  $('generate-btn').addEventListener('click', generateOpponentTypes);
  $('reveal-btn').addEventListener('click', () => {
    revealAnswers = !revealAnswers;
    updateRevealUI();
  });
  $('mode-single').addEventListener('click', () => setTypeMode(false));
  $('mode-dual').addEventListener('click', () => setTypeMode(true));
  $('show-chart-btn').addEventListener('click', openModal);
  $('close-modal-btn').addEventListener('click', closeModal);
  $('chart-modal').addEventListener('click', (e) => {
    if (e.target === $('chart-modal')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen()) {
      e.preventDefault();
      closeModal();
      return;
    }
    if ($('view-quiz').hidden || isModalOpen()) return;
    if (e.target.matches('input, textarea, select')) return;
    if (e.key === 'r' || e.key === 'R') generateOpponentTypes();
    if (e.key === 'a' || e.key === 'A') {
      revealAnswers = !revealAnswers;
      updateRevealUI();
    }
    if (e.key === '1') setTypeMode(false);
    if (e.key === '2') setTypeMode(true);
  });
}

function getActiveSuggestion() {
  return currentSuggestions.find((c) => c.id === activeCore) || currentSuggestions[0] || null;
}

function applyAiExplain(text) {
  const core = getActiveSuggestion();
  if (!core) return;
  core.aiExplain = text;
  const out = $('ai-explain-out');
  if (out) {
    out.hidden = !text;
    out.textContent = text || '';
  }
}

function applyAiTeams(rawTeams) {
  if (!Array.isArray(rawTeams) || !rawTeams.length) {
    throw new Error('teams 配列が空です');
  }
  const axis = selectedIds.map(preferMegaAxisId);
  const teams = rawTeams.slice(0, 3).map((raw, index) => {
    const ids = (raw.pokemonIds || raw.members || [])
      .map((x) => (typeof x === 'string' ? x : x.id || x.pokemonId))
      .filter(Boolean);
    // 軸を先頭に固定
    const order = [...new Set([...axis, ...ids])].slice(0, 6);
    while (order.length < 6) {
      const filler = pickFallbackTeammates(order, ['support', 'attacker', 'wall', 'fast']);
      filler.forEach((id) => {
        if (order.length < 6 && !order.includes(id)) order.push(id);
      });
      if (filler.length === 0) break;
    }
    const usedItems = new Set();
    let slots = order.map((pokemonId) => {
      const buildId = pickBuildId(pokemonId, usedItems);
      const build = buildsMap[buildId];
      if (build?.item) usedItems.add(build.item);
      return { pokemonId, buildId };
    }).filter((s) => s.buildId);
    slots = resolveTeamBuilds(slots).slots;
    return enrichTeamSuggestion({
      id: `ai-${Date.now()}-${index}`,
      name: raw.name || `AI提案 ${index + 1}`,
      concept: raw.concept || raw.rationale || 'AIが提案した実戦寄りパーティ。ルールで補正済み。',
      rating: 'AI提案',
      format: [battleFormat],
      source: 'AI提案（ルールエンジンでメガ1・Item Clause補正）',
      ai: true,
      aiExplain: raw.explain || raw.rationale || '',
      slots
    });
  });
  currentSuggestions = teams;
  activeCore = teams[0]?.id || null;
  renderCoreList(currentSuggestions);
  if (teams[0]) renderTeamDetail(teams[0]);
  return teams;
}

function teamContextPayload(core) {
  const axis = selectedIds.map((id) => pokemonById[id]?.name || id);
  const members = (core?.slots || []).map((slot) => {
    const { poke, build } = resolveSlot(slot);
    if (!poke || !build) return null;
    return {
      id: poke.id,
      name: poke.name,
      types: poke.types,
      roles: poke.roles,
      item: build.item,
      ability: build.ability,
      role: build.role,
      moves: build.moves,
      nature: build.nature?.name,
      sp: build.sp
    };
  }).filter(Boolean);
  return {
    regulation: 'M-B',
    season: 'M-4',
    format: battleFormat,
    axis,
    teamName: core?.name,
    ruleRationale: core?.rationale || core?.analysis?.rationale || '',
    checks: core?.analysis?.checks || [],
    members,
    metaPriority: (META_PRIORITY[battleFormat] || []).slice(0, 20)
  };
}

window.PokeTeam = {
  getSelectedIds: () => selectedIds.slice(),
  getBattleFormat: () => battleFormat,
  getSuggestions: () => currentSuggestions,
  getActiveSuggestion,
  applyAiExplain,
  applyAiTeams,
  teamContextPayload,
  runSuggest,
  setStatus: (msg) => {
    const el = $('ai-status');
    if (el) el.textContent = msg || '';
  }
};

async function main() {
  try {
    await loadData();
  } catch (err) {
    console.error(err);
    $('core-list').innerHTML = '<p class="empty-state">データの読み込みに失敗しました。ローカルで開く場合は簡易サーバーが必要です。</p>';
  }
  initQuizButtons();
  bindEvents();
  buildTypeChart();
  generateOpponentTypes();
  setTab('team');
  if (window.TeamAI?.init) window.TeamAI.init();
}

main();
