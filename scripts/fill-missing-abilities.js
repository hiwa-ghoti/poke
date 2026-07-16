const fs = require('fs');
const path = require('path');

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

const ROOT = path.join(__dirname, '..');
const pokeCsv = parseCsv(fs.readFileSync(path.join(__dirname, 'pokemon.csv'), 'utf8'));
const abCsv = parseCsv(fs.readFileSync(path.join(__dirname, 'pokemon_abilities.csv'), 'utf8'));
const an = parseCsv(fs.readFileSync(path.join(__dirname, 'ability_names.csv'), 'utf8'));
const jaById = {};
const enById = {};
for (const r of an) {
  if (r.local_language_id === '11') jaById[Number(r.ability_id)] = r.name;
  if (r.local_language_id === '9') enById[Number(r.ability_id)] = r.name;
}
const pokeByIdent = Object.fromEntries(pokeCsv.map((r) => [r.identifier, Number(r.id)]));
const absByPoke = {};
for (const r of abCsv) {
  const pid = Number(r.pokemon_id);
  if (!absByPoke[pid]) absByPoke[pid] = [];
  absByPoke[pid].push({
    slot: Number(r.slot),
    isHidden: r.is_hidden === '1',
    abilityId: Number(r.ability_id)
  });
}

function absFor(nameEn) {
  const ident = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const pid = pokeByIdent[ident];
  if (!pid) return [];
  return (absByPoke[pid] || [])
    .sort((a, b) => a.slot - b.slot)
    .map((a) => ({
      slot: a.isHidden ? '隠れ' : `特性${a.slot}`,
      name: jaById[a.abilityId] || enById[a.abilityId] || String(a.abilityId),
      nameEn: enById[a.abilityId] || ''
    }));
}

const pokemon = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/pokemon.json'), 'utf8'));
const builds = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/builds.json'), 'utf8'));
let filled = 0;
pokemon.forEach((p) => {
  const missing = !p.abilities || !p.abilities.length || p.abilities[0].name === '—';
  if (!missing) return;
  const list = absFor(p.nameEn);
  if (list.length) {
    p.abilities = list;
    filled += 1;
  }
});
for (const build of Object.values(builds)) {
  const poke = pokemon.find((p) => p.id === build.pokemonId);
  if (!build.ability || build.ability === '—') {
    if (poke?.abilities?.[0]?.name) build.ability = poke.abilities[0].name;
  }
  build.abilityOptions = (poke?.abilities || []).map((a) => a.name);
}
fs.writeFileSync(path.join(ROOT, 'data/pokemon.json'), JSON.stringify(pokemon, null, 2) + '\n');
fs.writeFileSync(path.join(ROOT, 'data/builds.json'), JSON.stringify(builds, null, 2) + '\n');
console.log('filled', filled, 'still dash', Object.values(builds).filter((b) => b.ability === '—').length);
console.log('pokemon missing', pokemon.filter((p) => !p.abilities || p.abilities[0]?.name === '—').map((p) => p.id));
