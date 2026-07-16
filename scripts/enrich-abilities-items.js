const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const enAbilityJa = require('./en-ability-ja.json');
const enItemJa = require('./en-item-ja.json');
const roster = require('./roster.json');

const ITEM_EFFECTS_JA = {
  'いのちのたま': '技の威力1.3倍。攻撃するたび最大HPの1/10ダメージ。',
  'オボンのみ': 'HPが半分以下で最大HPの1/4回復。',
  'たべのこし': '毎ターン最大HPの1/16回復。',
  'きあいのタスキ': 'HP満タン時、ひんし技を1回耐えてHP1残し。',
  'こだわりスカーフ': '素早さ1.5倍。同じ技しか出せない。',
  'こだわりハチマキ': '攻撃1.5倍。同じ技しか出せない。',
  'とつげきチョッキ': '特防1.5倍。変化技が出せない。',
  'ひかりのねんど': 'リフレクター／ひかりのかべのターン延長。',
  'しめったいわ': 'あめのターンを延長。',
  'あついいわ': 'ひざしの強いターンを延長。',
  'メンタルハーブ': 'メロメロ／アンコール等を1回解除。',
  'クリアチャーム': '相手の能力ダウン効果を受けない。',
  'くろいメガネ': 'あく技の威力1.2倍。',
  'しんぴのしずく': 'みず技の威力1.2倍。',
  'もくたん': 'ほのお技の威力1.2倍。',
  'じしゃく': 'でんき技の威力1.2倍。',
  'りゅうのキバ': 'ドラゴン技の威力1.2倍。',
  'きせきのたね': 'くさ技の威力1.2倍。',
  'やわらかいすな': 'じめん技の威力1.2倍。',
  'メタルコート': 'はがね技の威力1.2倍。',
  'カリスの実': 'タイプ強化きのみ（要確認）。',
  'ようせいのハネ': 'フェアリー技の威力1.2倍。',
  'くろいヘドロ': 'どくタイプなら毎ターン回復。他はダメージ。',
  'カシブのみ': 'こうかはばつぐんのゴースト技のダメージ半減。',
  'ナモのみ': 'こうかはばつぐんのあく技のダメージ半減。',
  'ヨプのみ': 'こうかはばつぐんのかくとう技のダメージ半減。',
  'バコウのみ': 'こうかはばつぐんのひこう技のダメージ半減。',
  'イトケのみ': 'こうかはばつぐんのみず技のダメージ半減。',
  'オッカのみ': 'こうかはばつぐんのほのお技のダメージ半減。',
  'リザードナイトY': 'メガシンカ用メガストーン（リザードンY）。',
  'リザードナイトX': 'メガシンカ用メガストーン（リザードンX）。',
  'ラグラージナイト': 'メガシンカ用メガストーン（ラグラージ）。',
  'メタグロスナイト': 'メガシンカ用メガストーン（メタグロス）。',
  'ムクホークナイト': 'メガシンカ用メガストーン（ムクホーク）。',
  'バンギラスナイト': 'メガシンカ用メガストーン（バンギラス）。',
  'フシギバナイト': 'メガシンカ用メガストーン（フシギバナ）。',
  'ハッサムナイト': 'メガシンカ用メガストーン（ハッサム）。',
  'バシャーモナイト': 'メガシンカ用メガストーン（バシャーモ）。',
  'クチートナイト': 'メガシンカ用メガストーン（クチート）。',
  'カエンジシナイト': 'メガシンカ用メガストーン（カエンジシ）。',
  'フラエッテナイト': 'メガシンカ用メガストーン（フラエッテ）。',
  'ライチュウナイトY': 'メガシンカ用メガストーン（ライチュウY）。',
  'プテラナイト': 'メガシンカ用メガストーン（プテラ）。'
};

function toJaAbility(name) {
  if (!name || name === '—') return '—';
  if (/[ぁ-んァ-ン一-龥]/.test(name)) return name;
  return enAbilityJa[name] || name;
}

function toJaItem(name) {
  if (!name) return '—';
  if (/[ぁ-んァ-ン一-龥]/.test(name)) return name;
  return enItemJa[name] || name;
}

const pokemon = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/pokemon.json'), 'utf8'));
const builds = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/builds.json'), 'utf8'));
const rosterByEn = Object.fromEntries(roster.map((r) => [r.name, r]));

pokemon.forEach((p) => {
  const r = rosterByEn[p.nameEn] || rosterByEn[p.name];
  const abs = r?.abilities || {};
  const list = [];
  ['0', '1', 'H'].forEach((slot) => {
    if (!abs[slot]) return;
    list.push({
      slot: slot === 'H' ? '隠れ' : `特性${Number(slot) + 1}`,
      name: toJaAbility(abs[slot]),
      nameEn: abs[slot]
    });
  });
  // dedupe by Japanese name
  const seen = new Set();
  p.abilities = list.filter((a) => {
    if (seen.has(a.name)) return false;
    seen.add(a.name);
    return true;
  });
  if (!p.abilities.length) p.abilities = [{ slot: '特性1', name: '—', nameEn: '' }];
});

for (const build of Object.values(builds)) {
  build.ability = toJaAbility(build.ability);
  build.item = toJaItem(build.item);
  // if ability still dash, pull from pokemon
  if (build.ability === '—' || !build.ability) {
    const poke = pokemon.find((p) => p.id === build.pokemonId);
    if (poke?.abilities?.[0]?.name) build.ability = poke.abilities[0].name;
  }
  build.itemEffect = ITEM_EFFECTS_JA[build.item] || '効果はゲーム内で確認してください。';
  // attach ability options
  const poke = pokemon.find((p) => p.id === build.pokemonId);
  build.abilityOptions = (poke?.abilities || []).map((a) => a.name);
}

fs.writeFileSync(path.join(ROOT, 'data/pokemon.json'), JSON.stringify(pokemon, null, 2) + '\n');
fs.writeFileSync(path.join(ROOT, 'data/builds.json'), JSON.stringify(builds, null, 2) + '\n');
fs.writeFileSync(path.join(ROOT, 'data/item-effects.json'), JSON.stringify(ITEM_EFFECTS_JA, null, 2) + '\n');

const stillEn = Object.values(builds).filter((b) => /[A-Za-z]{3,}/.test(b.ability || '')).length;
const stillDash = Object.values(builds).filter((b) => b.ability === '—').length;
console.log('builds still english ability', stillEn, 'dash', stillDash);
console.log('pokemon with abilities', pokemon.filter((p) => p.abilities?.[0]?.name !== '—').length);
