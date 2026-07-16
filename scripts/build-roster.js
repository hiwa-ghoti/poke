/**
 * Build full Reg M-B roster + auto builds from Champions legality data + PokeAPI CSVs.
 * Run: node scripts/build-roster.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TYPE_EN_JA = {
  Normal: 'ノーマル', Fire: 'ほのお', Water: 'みず', Grass: 'くさ', Electric: 'でんき',
  Ice: 'こおり', Fighting: 'かくとう', Poison: 'どく', Ground: 'じめん', Flying: 'ひこう',
  Psychic: 'エスパー', Bug: 'むし', Rock: 'いわ', Ghost: 'ゴースト', Dragon: 'ドラゴン',
  Dark: 'あく', Steel: 'はがね', Fairy: 'フェアリー'
};
const TYPE_ID_EN = {
  1: 'Normal', 2: 'Fighting', 3: 'Flying', 4: 'Poison', 5: 'Ground', 6: 'Rock',
  7: 'Bug', 8: 'Ghost', 9: 'Steel', 10: 'Fire', 11: 'Water', 12: 'Grass',
  13: 'Electric', 14: 'Psychic', 15: 'Ice', 16: 'Dragon', 17: 'Dark', 18: 'Fairy'
};
const STAT_ID = { 1: 'hp', 2: 'atk', 3: 'def', 4: 'spa', 5: 'spd', 6: 'spe' };

const MOVE_POOL = {
  attacker: {
    physical: ['じしん', 'インファイト', 'アイアンヘッド', 'いわなだれ', 'アクアジェット', 'まもる'],
    special: ['シャドーボール', 'かえんほうしゃ', '10まんボルト', 'サイコキネシス', 'れいとうビーム', 'まもる']
  },
  support: ['ねこだまし', 'すてゼリフ', 'てだすけ', 'まもる'],
  wall: ['まもる', 'じこさいせい', 'ねっとう', 'クリアスモッグ'],
  fast: ['とんぼがえり', 'でんこうせっか', 'まもる', 'アンコール']
};

const ITEM_POOL = [
  'オボンのみ', 'たべのこし', 'きあいのタスキ', 'いのちのたま', 'こだわりスカーフ',
  'とつげきチョッキ', 'メンタルハーブ', 'クリアチャーム', 'くろいメガネ', 'しんぴのしずく',
  'もくたん', 'じしゃく', 'りゅうのキバ', 'きせきのたね', 'やわらかいすな',
  'カシブのみ', 'ナモのみ', 'ヨプのみ', 'バコウのみ', 'イトケのみ'
];

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const cols = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { q = !q; continue; }
      if (ch === ',' && !q) { cols.push(cur); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur);
    const row = {};
    headers.forEach((h, i) => { row[h] = cols[i]; });
    return row;
  });
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/\s+/g, '-')
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m');
}

function inferRoles(base, types) {
  const roles = [];
  const bst = base.hp + base.atk + base.def + base.spa + base.spd + base.spe;
  const phys = base.atk >= base.spa;
  if (base.spe >= 100) roles.push('fast');
  if ((phys ? base.atk : base.spa) >= 110) roles.push('attacker');
  else if ((phys ? base.atk : base.spa) >= 95 && base.spe >= 85) roles.push('attacker');
  if (base.hp + Math.max(base.def, base.spd) >= 200) roles.push('wall');
  if (base.spe <= 60 && base.hp >= 90) roles.push('support');
  if (!roles.includes('attacker') && !roles.includes('wall')) {
    if (types.includes('フェアリー') || types.includes('くさ') || types.includes('ゴースト')) roles.push('support');
    else roles.push('attacker');
  }
  if (!roles.length) roles.push('attacker');
  if (bst >= 600) roles.push('mega');
  return [...new Set(roles)];
}

function pickNature(base, roles) {
  const phys = base.atk >= base.spa;
  if (roles.includes('fast') && phys) return { name: 'ようき', up: 'spe', down: 'spa' };
  if (roles.includes('fast') && !phys) return { name: 'おくびょう', up: 'spe', down: 'atk' };
  if (roles.includes('wall') && base.def >= base.spd) return { name: 'わんぱく', up: 'def', down: 'spa' };
  if (roles.includes('wall')) return { name: 'おだやか', up: 'spd', down: 'atk' };
  if (roles.includes('support')) return { name: 'しんちょう', up: 'spd', down: 'spa' };
  if (phys) return { name: 'いじっぱり', up: 'atk', down: 'spa' };
  return { name: 'ひかえめ', up: 'spa', down: 'atk' };
}

function pickSp(roles, nature) {
  const sp = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  if (roles.includes('wall')) {
    sp.hp = 32; sp[nature.up === 'def' || nature.up === 'spd' ? nature.up : 'def'] = 32; sp.spe = 2;
  } else if (roles.includes('support')) {
    sp.hp = 32; sp.def = 20; sp.spd = 14;
  } else if (roles.includes('fast')) {
    const off = nature.up === 'spa' || (!roles.includes('fast') && false) ? 'spa' : (nature.up === 'atk' || nature.up === 'spe' ? (nature.up === 'spe' ? (/* check atk vs spa from nature down */ nature.down === 'spa' ? 'atk' : 'spa') : nature.up) : 'atk');
    const offensive = nature.down === 'spa' ? 'atk' : (nature.down === 'atk' ? 'spa' : (nature.up === 'atk' || nature.up === 'spa' ? nature.up : 'atk'));
    sp[offensive] = 32;
    sp.spe = 30;
    sp.hp = 4;
  } else {
    const offensive = nature.down === 'spa' ? 'atk' : 'spa';
    sp[offensive] = 32;
    sp.hp = 20;
    sp.spe = 14;
  }
  // normalize to <=66
  let total = Object.values(sp).reduce((a, b) => a + b, 0);
  if (total > 66) {
    const keys = Object.keys(sp).filter((k) => sp[k] > 0 && k !== 'hp');
    while (total > 66 && keys.length) {
      const k = keys[keys.length - 1];
      sp[k] -= 1;
      total -= 1;
    }
  }
  Object.keys(sp).forEach((k) => { if (sp[k] > 32) sp[k] = 32; });
  return sp;
}

function pickMoves(types, roles, base) {
  const phys = base.atk >= base.spa;
  if (roles.includes('support') && !roles.includes('attacker')) {
    return ['ねこだまし', 'てだすけ', 'まもる', types.includes('くさ') ? 'キノコのほうし' : 'アンコール'];
  }
  if (roles.includes('wall') && !roles.includes('attacker')) {
    return ['まもる', 'じこさいせい', types.includes('みず') ? 'ねっとう' : 'ボディプレス', 'クリアスモッグ'];
  }
  const pool = phys ? MOVE_POOL.attacker.physical : MOVE_POOL.attacker.special;
  return pool.slice(0, 4);
}

function pickItem(roles, index) {
  if (roles.includes('mega')) return null; // filled later if mega stone unknown
  if (roles.includes('support')) return ITEM_POOL[index % 3 === 0 ? 0 : 6];
  if (roles.includes('wall')) return ITEM_POOL[1];
  if (roles.includes('fast')) return index % 2 === 0 ? ITEM_POOL[2] : ITEM_POOL[3];
  return ITEM_POOL[(index + 3) % ITEM_POOL.length];
}

function abilityLabel(abilities) {
  if (!abilities) return '—';
  return abilities['0'] || abilities[0] || Object.values(abilities)[0] || '—';
}

// Load sources
const legal = require('./m-b.json').legalPokemon.map((x) => x.name);
const roster = require('./roster.json');
const statsArr = require('./base-stats.json');
const curatedBuilds = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/builds.json'), 'utf8'));

const jaByDex = {};
for (const row of parseCsv(fs.readFileSync(path.join(__dirname, 'species_names.csv'), 'utf8'))) {
  if (row.local_language_id === '11') jaByDex[Number(row.pokemon_species_id)] = row.name;
}

const pokeByIdentifier = {};
for (const row of parseCsv(fs.readFileSync(path.join(__dirname, 'pokemon.csv'), 'utf8'))) {
  pokeByIdentifier[row.identifier] = {
    id: Number(row.id),
    speciesId: Number(row.species_id),
    dex: Number(row.species_id)
  };
}

const typesByPokeId = {};
for (const row of parseCsv(fs.readFileSync(path.join(__dirname, 'pokemon_types.csv'), 'utf8'))) {
  const pid = Number(row.pokemon_id);
  if (!typesByPokeId[pid]) typesByPokeId[pid] = [];
  typesByPokeId[pid].push({ slot: Number(row.slot), type: TYPE_ID_EN[Number(row.type_id)] });
}

const statsByPokeId = {};
for (const row of parseCsv(fs.readFileSync(path.join(__dirname, 'pokemon_stats.csv'), 'utf8'))) {
  const pid = Number(row.pokemon_id);
  if (!statsByPokeId[pid]) statsByPokeId[pid] = {};
  const key = STAT_ID[Number(row.stat_id)];
  if (key) statsByPokeId[pid][key] = Number(row.base_stat);
}

const rosterByName = Object.fromEntries(roster.map((r) => [r.name, r]));
const statsByName = Object.fromEntries(statsArr.map((s) => [s.name, s]));

const megaCapable = new Set(
  roster.filter((r) => r.form === 'Mega').map((r) => r.name.replace(/^Mega\s+/, '').replace(/\s+[XY]$/, ''))
);

function resolveEnglishName(name) {
  // Prefer base form from roster
  if (rosterByName[name] && rosterByName[name].form === 'Base') return name;
  if (rosterByName[name]) return name;
  if (rosterByName[`Mega ${name}`]) return name;
  return name;
}

function lookupPokeApi(name) {
  const ident = name.toLowerCase().replace(/\s+/g, '-').replace(/['’.]/g, '');
  let entry = pokeByIdentifier[ident];
  if (!entry && name.includes(' ')) {
    entry = pokeByIdentifier[ident.replace(/-/g, '')];
  }
  // special cases
  const aliases = {
    'mr-rime': 'mr-rime',
    'kommo-o': 'kommo-o',
    'hakamo-o': 'hakamo-o',
    'jangmo-o': 'jangmo-o',
    'porygon-z': 'porygon-z',
    'type-null': 'type-null'
  };
  if (!entry && aliases[ident]) entry = pokeByIdentifier[aliases[ident]];
  return entry || null;
}

const pokemon = [];
const usedIds = new Set();

legal.forEach((enName, index) => {
  const name = resolveEnglishName(enName);
  const id = slugify(name);
  if (usedIds.has(id)) return;
  usedIds.add(id);

  const r = rosterByName[name] || rosterByName[enName];
  const st = statsByName[name] || statsByName[enName];
  const api = lookupPokeApi(name);

  let dex = r?.dexNumber || st?.dexNumber || api?.dex || 0;
  let typesEn = r?.types || [];
  if (!typesEn.length && api) {
    const trows = (typesByPokeId[api.id] || []).sort((a, b) => a.slot - b.slot);
    typesEn = trows.map((t) => t.type);
  }
  const types = typesEn.map((t) => TYPE_EN_JA[t] || t).filter(Boolean);
  if (!types.length) types.push('ノーマル');

  let base = st
    ? { hp: st.hp, atk: st.atk, def: st.def, spa: st.spa, spd: st.spd, spe: st.spe }
    : null;
  if (!base && api && statsByPokeId[api.id]) base = { ...statsByPokeId[api.id] };
  if (!base) base = { hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80 };

  const ja = jaByDex[dex] || name;
  const roles = inferRoles(base, types);
  if (megaCapable.has(name) || megaCapable.has(enName)) {
    if (!roles.includes('mega')) roles.push('mega');
  }

  pokemon.push({
    id,
    name: ja,
    nameEn: enName,
    types,
    roles,
    mega: roles.includes('mega'),
    dex,
    base
  });
});

pokemon.sort((a, b) => a.dex - b.dex || a.name.localeCompare(b.name, 'ja'));

// Merge curated form variants that help existing cores (if still needed)
const curatedExtra = [
  // keep wash rotom only if Rotom exists — as alternate id pointing same dex family
];

// Auto builds for everyone without curated build
const curatedPokemonIds = new Set(Object.values(curatedBuilds).map((b) => b.pokemonId));
const autoBuilds = { ...curatedBuilds };
let itemCursor = 0;

pokemon.forEach((p, index) => {
  if (curatedPokemonIds.has(p.id)) return;
  const nature = pickNature(p.base, p.roles);
  const sp = pickSp(p.roles, nature);
  let item = pickItem(p.roles, itemCursor++);
  if (!item) item = ITEM_POOL[itemCursor % ITEM_POOL.length];
  const buildId = `${p.id}-auto`;
  autoBuilds[buildId] = {
    pokemonId: p.id,
    label: '自動提案',
    item,
    ability: abilityLabel((rosterByName[p.nameEn] || {}).abilities),
    role: p.roles.includes('support') ? 'サポート'
      : p.roles.includes('wall') ? '耐久'
        : p.roles.includes('fast') ? '高速アタッカー'
          : 'アタッカー',
    moves: pickMoves(p.types, p.roles, p.base),
    sp,
    nature,
    note: '全参戦対応の自動型です。技・持ち物はゲーム内で調整してください。',
    auto: true
  };
});

fs.writeFileSync(path.join(ROOT, 'data/pokemon.json'), JSON.stringify(pokemon, null, 2) + '\n');
fs.writeFileSync(path.join(ROOT, 'data/builds.json'), JSON.stringify(autoBuilds, null, 2) + '\n');
fs.writeFileSync(
  path.join(ROOT, 'data/meta.json'),
  JSON.stringify({
    regulation: 'M-B',
    rosterCount: pokemon.length,
    source: 'Emieeel/poke-mcp-tool regulations/m-b.json + pokemon-champions-data + PokeAPI',
    generatedAt: new Date().toISOString()
  }, null, 2) + '\n'
);

console.log(`Wrote ${pokemon.length} pokemon, ${Object.keys(autoBuilds).length} builds`);
const missingDex = pokemon.filter((p) => !p.dex).length;
const missingJa = pokemon.filter((p) => p.name === p.nameEn).length;
console.log(`missing dex: ${missingDex}, english-only names: ${missingJa}`);
