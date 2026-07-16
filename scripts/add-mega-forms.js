/**
 * Add Mega form entries to pokemon.json and link mega builds.
 * Run: node scripts/add-mega-forms.js
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
const BANNED_MEGA = new Set(['Mega Garchomp Z', 'Mega Lucario Z']);

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

function titleCase(words) {
  return words.split(/[\s-]+/).filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function megaIdFromEnName(enName) {
  return 'mega-' + enName.replace(/^Mega\s+/, '').toLowerCase().replace(/\s+/g, '-');
}

function megaJaName(baseJa, enName) {
  const rest = enName.replace(/^Mega\s+/, '').trim();
  const parts = rest.split(/\s+/);
  const last = parts[parts.length - 1];
  if (last === 'X' || last === 'Y') return `メガ${baseJa}${last}`;
  return `メガ${baseJa}`;
}

function inferRoles(base, types) {
  const roles = ['mega'];
  const phys = base.atk >= base.spa;
  if (base.spe >= 100) roles.push('fast');
  if ((phys ? base.atk : base.spa) >= 110) roles.push('attacker');
  else if ((phys ? base.atk : base.spa) >= 95 && base.spe >= 85) roles.push('attacker');
  if (base.hp + Math.max(base.def, base.spd) >= 200) roles.push('wall');
  if (!roles.includes('attacker')) roles.push('attacker');
  return [...new Set(roles)];
}

function identifierToMegaEnName(ident) {
  if (!ident.includes('mega')) return null;
  const parts = ident.split('-');
  const megaIdx = parts.indexOf('mega');
  if (megaIdx < 0) return null;
  const base = titleCase(parts.slice(0, megaIdx).join('-'));
  const variant = parts.slice(megaIdx + 1).map((v) => v.toUpperCase()).join(' ');
  return variant ? `Mega ${base} ${variant}` : `Mega ${base}`;
}

function baseSlugFromMegaEn(enName) {
  const rest = enName.replace(/^Mega\s+/, '').trim();
  const parts = rest.split(/\s+/);
  if (parts[parts.length - 1] === 'X' || parts[parts.length - 1] === 'Y') parts.pop();
  return slugify(parts.join(' '));
}

function megaApiIdent(enName) {
  const rest = enName.replace(/^Mega\s+/, '').toLowerCase();
  const parts = rest.split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && (parts[parts.length - 1] === 'x' || parts[parts.length - 1] === 'y')) {
    const variant = parts.pop();
    return `${parts.join('-')}-mega-${variant}`;
  }
  return `${parts.join('-')}-mega`;
}

const roster = require('./roster.json');
const baseStatsArr = require('./base-stats.json');
const enAbilityJa = require('./en-ability-ja.json');
const pokemon = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/pokemon.json'), 'utf8'));
const builds = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/builds.json'), 'utf8'));

const pokemonById = Object.fromEntries(pokemon.map((p) => [p.id, p]));
const pokemonByEn = Object.fromEntries(pokemon.map((p) => [p.nameEn, p]));
const statsByName = Object.fromEntries(baseStatsArr.map((s) => [s.name, s]));
const rosterByName = Object.fromEntries(roster.map((r) => [r.name, r]));

const pokeByIdentifier = {};
for (const row of parseCsv(fs.readFileSync(path.join(__dirname, 'pokemon.csv'), 'utf8'))) {
  pokeByIdentifier[row.identifier] = {
    id: Number(row.id),
    speciesId: Number(row.species_id)
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

const megaEnNames = new Set();
roster.filter((r) => r.form === 'Mega').forEach((r) => megaEnNames.add(r.name));
Object.keys(pokeByIdentifier)
  .filter((ident) => ident.includes('mega') && !ident.includes('mewtwo') && !ident.includes('rayquaza'))
  .forEach((ident) => {
    const name = identifierToMegaEnName(ident);
    if (name) megaEnNames.add(name);
  });

const existingMegaIds = new Set(pokemon.filter((p) => p.baseFormId).map((p) => p.id));
let added = 0;

for (const enName of [...megaEnNames].sort()) {
  if (BANNED_MEGA.has(enName)) continue;

  const id = megaIdFromEnName(enName);
  if (existingMegaIds.has(id)) continue;

  const baseSlug = baseSlugFromMegaEn(enName);
  const base = pokemonById[baseSlug];
  if (!base) continue;

  const r = rosterByName[enName];
  const st = statsByName[enName];
  const apiIdent = megaApiIdent(enName);
  const api = pokeByIdentifier[apiIdent]
    || pokeByIdentifier[apiIdent.replace(/-male$/, '')]
    || pokeByIdentifier[apiIdent.replace(/-female$/, '')];

  let typesEn = r?.types || [];
  if (!typesEn.length && api) {
    typesEn = (typesByPokeId[api.id] || [])
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type);
  }
  const types = typesEn.map((t) => TYPE_EN_JA[t] || t).filter(Boolean);
  if (!types.length) types.push(...base.types);

  let baseStats = st
    ? { hp: st.hp, atk: st.atk, def: st.def, spa: st.spa, spd: st.spd, spe: st.spe }
    : null;
  if (!baseStats && api && statsByPokeId[api.id]) baseStats = { ...statsByPokeId[api.id] };
  if (!baseStats) continue;

  const abs = r?.abilities || {};
  const abilities = [];
  ['0', '1', 'H'].forEach((slot) => {
    if (!abs[slot]) return;
    abilities.push({
      slot: slot === 'H' ? '隠れ' : `特性${Number(slot) + 1}`,
      name: enAbilityJa[abs[slot]] || abs[slot],
      nameEn: abs[slot]
    });
  });
  if (!abilities.length && base.abilities?.length) {
    abilities.push({
      slot: '特性1',
      name: enAbilityJa[r?.abilities?.['0']] || r?.abilities?.['0'] || base.abilities[0]?.name || '—',
      nameEn: r?.abilities?.['0'] || base.abilities[0]?.nameEn || '—'
    });
  }

  pokemon.push({
    id,
    name: megaJaName(base.name, enName),
    nameEn: enName,
    types,
    roles: inferRoles(baseStats, types),
    mega: true,
    isMegaForm: true,
    baseFormId: base.id,
    dex: base.dex,
    base: baseStats,
    abilities
  });
  existingMegaIds.add(id);
  added += 1;
}

pokemon.sort((a, b) => {
  const aMega = a.isMegaForm ? 1 : 0;
  const bMega = b.isMegaForm ? 1 : 0;
  if (aMega !== bMega) return aMega - bMega;
  return a.dex - b.dex || a.name.localeCompare(b.name, 'ja');
});

const megaByBase = {};
pokemon.filter((p) => p.isMegaForm).forEach((p) => {
  if (!megaByBase[p.baseFormId]) megaByBase[p.baseFormId] = [];
  megaByBase[p.baseFormId].push(p);
});

function isMegaBuild(build) {
  return /ナイト|メガストーン/.test(build.item || '')
    || (build.label && build.label.includes('メガ'))
    || (build.itemEffect && build.itemEffect.includes('メガシンカ'));
}

let buildLinks = 0;
Object.entries(builds).forEach(([buildId, build]) => {
  if (!isMegaBuild(build)) return;
  const baseId = build.pokemonId;
  const candidates = megaByBase[baseId] || [];
  if (!candidates.length) return;

  let target = null;
  if (buildId.includes('-mega-x') || build.label === 'メガX') {
    target = candidates.find((p) => p.nameEn.endsWith(' X'));
  } else if (buildId.includes('-mega-y') || buildId === 'charizard-y' || buildId === 'raichu-y' || build.label === 'メガY') {
    target = candidates.find((p) => p.nameEn.endsWith(' Y'));
  } else if (candidates.length === 1) {
    target = candidates[0];
  } else {
    target = candidates.find((p) => !p.nameEn.endsWith(' X') && !p.nameEn.endsWith(' Y')) || candidates[0];
  }

  if (target && build.pokemonId !== target.id) {
    build.pokemonId = target.id;
    buildLinks += 1;
  }
});

fs.writeFileSync(path.join(ROOT, 'data/pokemon.json'), JSON.stringify(pokemon, null, 2) + '\n');
fs.writeFileSync(path.join(ROOT, 'data/builds.json'), JSON.stringify(builds, null, 2) + '\n');
fs.writeFileSync(
  path.join(ROOT, 'data/meta.json'),
  JSON.stringify({
    regulation: 'M-B',
    rosterCount: pokemon.filter((p) => !p.isMegaForm).length,
    megaFormCount: pokemon.filter((p) => p.isMegaForm).length,
    searchableCount: pokemon.length,
    source: 'Emieeel/poke-mcp-tool regulations/m-b.json + pokemon-champions-data + PokeAPI',
    generatedAt: new Date().toISOString()
  }, null, 2) + '\n'
);

console.log(`Added ${added} mega forms (${pokemon.filter((p) => p.isMegaForm).length} total mega entries)`);
console.log(`Linked ${buildLinks} mega builds to mega form IDs`);
