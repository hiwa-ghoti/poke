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

const an = parseCsv(fs.readFileSync(path.join(__dirname, 'ability_names.csv'), 'utf8'));
const am = parseCsv(fs.readFileSync(path.join(__dirname, 'abilities_meta.csv'), 'utf8'));
const idByIdent = Object.fromEntries(am.map((r) => [r.identifier, Number(r.id)]));
const jaById = {};
const enById = {};
for (const r of an) {
  if (r.local_language_id === '11') jaById[Number(r.ability_id)] = r.name;
  if (r.local_language_id === '9') enById[Number(r.ability_id)] = r.name;
}

const enToJa = {};
for (const [ident, id] of Object.entries(idByIdent)) {
  if (enById[id] && jaById[id]) enToJa[enById[id]] = jaById[id];
}

const items = parseCsv(fs.readFileSync(path.join(__dirname, 'item_names.csv'), 'utf8'));
const im = parseCsv(fs.readFileSync(path.join(__dirname, 'items_meta.csv'), 'utf8'));
const itemIdByIdent = Object.fromEntries(im.map((r) => [r.identifier, Number(r.id)]));
const itemJa = {};
const itemEn = {};
for (const r of items) {
  if (r.local_language_id === '11') itemJa[Number(r.item_id)] = r.name;
  if (r.local_language_id === '9') itemEn[Number(r.item_id)] = r.name;
}
const itemEnToJa = {};
for (const [, id] of Object.entries(itemIdByIdent)) {
  if (itemEn[id] && itemJa[id]) itemEnToJa[itemEn[id]] = itemJa[id];
}

fs.writeFileSync(path.join(__dirname, 'en-ability-ja.json'), JSON.stringify(enToJa, null, 2));
fs.writeFileSync(path.join(__dirname, 'en-item-ja.json'), JSON.stringify(itemEnToJa, null, 2));
console.log('abilities', Object.keys(enToJa).length, 'Intimidate=', enToJa.Intimidate);
console.log('items', Object.keys(itemEnToJa).length, 'Life Orb=', itemEnToJa['Life Orb']);
