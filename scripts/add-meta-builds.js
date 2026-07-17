/**
 * Add curated competitive builds for META_PRIORITY Pokémon that lack them.
 * Run: node scripts/add-meta-builds.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const buildsPath = path.join(ROOT, 'data/builds.json');
const effectsPath = path.join(ROOT, 'data/item-effects.json');

const builds = JSON.parse(fs.readFileSync(buildsPath, 'utf8'));
const effects = JSON.parse(fs.readFileSync(effectsPath, 'utf8'));

const EFFECT = {
  'いのちのたま': '技の威力1.3倍。攻撃するたび最大HPの1/10ダメージ。',
  'きあいのタスキ': 'HP満タン時、ひんし技を1回耐えてHP1残し。',
  'こだわりスカーフ': '素早さ1.5倍。同じ技しか出せない。',
  'こだわりメガネ': '特攻1.5倍。同じ技しか出せない。',
  'こだわりハチマキ': '攻撃1.5倍。同じ技しか出せない。',
  'とつげきチョッキ': '特防1.5倍。変化技が出せない。',
  'たべのこし': '毎ターン最大HPの1/16回復。',
  'オボンのみ': 'HPが半分以下で最大HPの1/4回復。',
  'クリアチャーム': '相手の能力ダウン効果を受けない。',
  'パワフルハーブ': 'ため技を1回だけ即座に発動できる。',
  'ゴツゴツメット': '接触技を受けた相手に最大HPの1/6ダメージ。',
  'くろいメガネ': 'あく技の威力1.2倍。',
  'ようせいのハネ': 'フェアリー技の威力1.2倍。',
  'ヨプのみ': 'こうかはばつぐんのかくとう技のダメージ半減。',
  'カシブのみ': 'こうかはばつぐんのゴースト技のダメージ半減。',
  'メンタルハーブ': 'メロメロ／アンコール等を1回解除。'
};

Object.assign(effects, EFFECT);

function sp(phys, mode) {
  if (mode === 'fast') {
    return phys
      ? { hp: 4, atk: 32, def: 0, spa: 0, spd: 0, spe: 30 }
      : { hp: 4, atk: 0, def: 0, spa: 32, spd: 0, spe: 30 };
  }
  if (mode === 'bulk') {
    return phys
      ? { hp: 32, atk: 20, def: 10, spa: 0, spd: 4, spe: 0 }
      : { hp: 32, atk: 0, def: 4, spa: 20, spd: 10, spe: 0 };
  }
  if (mode === 'support') {
    return { hp: 32, atk: 0, def: 20, spa: 0, spd: 14, spe: 0 };
  }
  // mixed bulk attacker
  return phys
    ? { hp: 20, atk: 32, def: 0, spa: 0, spd: 0, spe: 14 }
    : { hp: 20, atk: 0, def: 0, spa: 32, spd: 0, spe: 14 };
}

const NEW = {
  'greninja-sash': {
    pokemonId: 'greninja',
    label: 'タスキ',
    item: 'きあいのタスキ',
    ability: 'へんげんじざい',
    role: '高速特殊',
    moves: ['ハイドロポンプ', 'あくのはどう', 'れいとうビーム', 'くさむすび'],
    sp: sp(false, 'fast'),
    nature: { name: 'おくびょう', up: 'spe', down: 'atk' },
    note: 'Season M-4シングル使用率上位。へんげんじざい＋タスキで先制圏を広げる。',
    abilityOptions: ['げきりゅう', 'へんげんじざい']
  },
  'greninja-specs': {
    pokemonId: 'greninja',
    label: 'メガネ',
    item: 'こだわりメガネ',
    ability: 'へんげんじざい',
    role: '特殊エース',
    moves: ['ハイドロポンプ', 'あくのはどう', 'れいとうビーム', 'とんぼがえり'],
    sp: sp(false, 'fast'),
    nature: { name: 'おくびょう', up: 'spe', down: 'atk' },
    note: '高火力押し切り。とんぼがえりで選出操作も可能。',
    abilityOptions: ['げきりゅう', 'へんげんじざい']
  },
  'gholdengo-scarf': {
    pokemonId: 'gholdengo',
    label: 'スカーフ',
    item: 'こだわりスカーフ',
    ability: 'おうごんのからだ',
    role: '高速特殊',
    moves: ['ゴールドラッシュ', 'シャドーボール', 'きあいだま', 'トリック'],
    sp: sp(false, 'fast'),
    nature: { name: 'おくびょう', up: 'spe', down: 'atk' },
    note: '状態異常無効の高速特殊。LO型と持ち物を分担しやすい。',
    abilityOptions: ['おうごんのからだ']
  },
  'gholdengo-av': {
    pokemonId: 'gholdengo',
    label: 'チョッキ',
    item: 'とつげきチョッキ',
    ability: 'おうごんのからだ',
    role: '特殊耐久',
    moves: ['ゴールドラッシュ', 'シャドーボール', 'きあいだま', 'でんじは'],
    sp: { hp: 32, atk: 0, def: 0, spa: 20, spd: 14, spe: 0 },
    nature: { name: 'ひかえめ', up: 'spa', down: 'atk' },
    note: '特殊受け寄り。砂・バランスの中継ぎに。',
    abilityOptions: ['おうごんのからだ']
  },
  'annihilape-sash': {
    pokemonId: 'annihilape',
    label: 'タスキ',
    item: 'きあいのタスキ',
    ability: 'やるき',
    role: '物理エース',
    moves: ['いかりの拳', 'インファイト', 'かげうち', 'まもる'],
    sp: sp(true, 'fast'),
    nature: { name: 'ようき', up: 'spe', down: 'spa' },
    note: 'いかりの拳積みの高速型。のこりもの型と役割分担。',
    abilityOptions: ['やるき', 'せいしんりょく', 'まけんき']
  },
  'annihilape-lo': {
    pokemonId: 'annihilape',
    label: 'いのちのたま',
    item: 'いのちのたま',
    ability: 'まけんき',
    role: '物理エース',
    moves: ['いかりの拳', 'ドレインパンチ', 'かげうち', 'まもる'],
    sp: sp(true, 'mixed'),
    nature: { name: 'いじっぱり', up: 'atk', down: 'spa' },
    note: '火力重視。まけんきで能力ダウンを活かす。',
    abilityOptions: ['やるき', 'せいしんりょく', 'まけんき']
  },
  'farigiraf-sitrus': {
    pokemonId: 'farigiraf',
    label: 'オボン',
    item: 'オボンのみ',
    ability: 'アーマーテール',
    role: 'サポート',
    moves: ['てだすけ', 'サイコキネシス', 'いかりのこな', 'まもる'],
    sp: sp(false, 'support'),
    nature: { name: 'おだやか', up: 'spd', down: 'atk' },
    note: 'ねこだまし無効サポート。トリル型と持ち物を分担。',
    abilityOptions: ['はんすう', 'テイルアーマー', 'そうしょく']
  },
  'sneasler-lo': {
    pokemonId: 'sneasler',
    label: 'いのちのたま',
    item: 'いのちのたま',
    ability: 'どくしゅ',
    role: '物理エース',
    moves: ['インファイト', 'どくづき', 'アクアカッター', 'ロックブラスト'],
    sp: sp(true, 'fast'),
    nature: { name: 'ようき', up: 'spe', down: 'spa' },
    note: 'タスキと役割分担する火力型。',
    abilityOptions: ['プレッシャー', 'かるわざ', 'どくしゅ']
  },
  'sneasler-band': {
    pokemonId: 'sneasler',
    label: 'ハチマキ',
    item: 'こだわりハチマキ',
    ability: 'どくしゅ',
    role: '物理エース',
    moves: ['インファイト', 'どくづき', 'アクアカッター', 'とんぼがえり'],
    sp: sp(true, 'fast'),
    nature: { name: 'いじっぱり', up: 'atk', down: 'spa' },
    note: '高火力ハチマキ。とんぼがえりで選出操作。',
    abilityOptions: ['プレッシャー', 'かるわざ', 'どくしゅ']
  },
  'grimmsnarl-sash': {
    pokemonId: 'grimmsnarl',
    label: 'タスキ壁',
    item: 'きあいのタスキ',
    ability: 'いたずらごころ',
    role: 'サポート',
    moves: ['リフレクター', 'ひかりのかべ', 'でんじは', 'あくのはどう'],
    sp: sp(false, 'support'),
    nature: { name: 'おだやか', up: 'spd', down: 'atk' },
    note: 'ねんど無しでも壁を張るタスキ型。Item Clause回避用。',
    abilityOptions: ['いたずらごころ', 'おみとおし', 'びびり']
  },
  'sylveon-specs': {
    pokemonId: 'sylveon',
    label: 'メガネ',
    item: 'こだわりメガネ',
    ability: 'フェアリースキン',
    role: '特殊エース',
    moves: ['ハイパーボイス', 'ムーンフォース', 'かげうち', 'でんじは'],
    sp: sp(false, 'fast'),
    nature: { name: 'おくびょう', up: 'spe', down: 'atk' },
    note: 'フェアリースキン＋メガネの高火力。ハネ型と分担。',
    abilityOptions: ['メロメロボディ', 'フェアリースキン']
  },
  'sylveon-cloak': {
    pokemonId: 'sylveon',
    label: 'クリアチャーム',
    item: 'クリアチャーム',
    ability: 'フェアリースキン',
    role: '特殊耐久',
    moves: ['ハイパーボイス', 'ムーンフォース', 'ねむる', 'まもる'],
    sp: sp(false, 'bulk'),
    nature: { name: 'おだやか', up: 'spd', down: 'atk' },
    note: '能力ダウン無効の耐久特殊。リザY軸の並びで採用。',
    abilityOptions: ['メロメロボディ', 'フェアリースキン']
  },
  'glimmora-herb': {
    pokemonId: 'glimmora',
    label: 'パワフルハーブ',
    item: 'パワフルハーブ',
    ability: 'どくげしょう',
    role: '特殊エース',
    moves: ['メテオビーム', 'ヘドロウェーブ', 'だいちのちから', 'まもる'],
    sp: sp(false, 'fast'),
    nature: { name: 'おくびょう', up: 'spe', down: 'atk' },
    note: 'メテオビーム即時発動。タスキ設置型と役割分担。',
    abilityOptions: ['どくげしょう', 'ふしょく']
  },
  'corviknight-rocky': {
    pokemonId: 'corviknight',
    label: 'ゴツゴツ',
    item: 'ゴツゴツメット',
    ability: 'ミラーアーマー',
    role: '物理受け',
    moves: ['ボディプレス', 'てっぺき', 'とんぼがえり', 'はねやすめ'],
    sp: { hp: 32, atk: 0, def: 32, spa: 0, spd: 0, spe: 2 },
    nature: { name: 'わんぱく', up: 'def', down: 'spa' },
    note: '接触削り受け。たべのこし型と持ち物を分担。',
    abilityOptions: ['プレッシャー', 'きんちょうかん', 'ミラーアーマー']
  },
  'corviknight-sitrus': {
    pokemonId: 'corviknight',
    label: 'オボン',
    item: 'オボンのみ',
    ability: 'ミラーアーマー',
    role: '物理受け',
    moves: ['ボディプレス', 'てっぺき', 'とんぼがえり', 'まもる'],
    sp: { hp: 32, atk: 0, def: 28, spa: 0, spd: 4, spe: 2 },
    nature: { name: 'わんぱく', up: 'def', down: 'spa' },
    note: '即時回復の受け出し型。',
    abilityOptions: ['プレッシャー', 'きんちょうかん', 'ミラーアーマー']
  },
  'whimsicott-cloak': {
    pokemonId: 'whimsicott',
    label: 'クリアチャーム',
    item: 'クリアチャーム',
    ability: 'いたずらごころ',
    role: 'サポート',
    moves: ['おいかぜ', 'ムーンブラスト', 'アンコール', 'まもる'],
    sp: sp(false, 'support'),
    nature: { name: 'ずぶとい', up: 'def', down: 'atk' },
    note: '能力ダウン無効のおいかぜ役。タスキ／メンタルと3型体制。',
    abilityOptions: ['いたずらごころ', 'すりぬけ', 'ようりょくそ']
  },
  'basculegion-scarf': {
    pokemonId: 'basculegion',
    label: 'スカーフ',
    item: 'こだわりスカーフ',
    ability: 'てきおうりょく',
    role: '高速物理',
    moves: ['ウェーブタックル', 'アクアジェット', 'かげうち', 'じしん'],
    sp: sp(true, 'fast'),
    nature: { name: 'ようき', up: 'spe', down: 'spa' },
    note: '適応力＋スカーフで上から押す。LO／しずく型と分担。',
    abilityOptions: ['すいすい', 'てきおうりょく', 'かたやぶり']
  },
  'venusaur-av': {
    pokemonId: 'venusaur',
    label: 'チョッキ',
    item: 'とつげきチョッキ',
    ability: 'ようりょくそ',
    role: '特殊耐久',
    moves: ['ヘドロばくだん', 'ギガドレイン', 'だいちのちから', 'ねっとう'],
    sp: { hp: 32, atk: 0, def: 0, spa: 24, spd: 10, spe: 0 },
    nature: { name: 'ひかえめ', up: 'spa', down: 'atk' },
    note: '晴れ下の特殊中継ぎ。タスキ型と持ち物分担。',
    abilityOptions: ['しんりょく', 'ようりょくそ']
  },
  'torkoal-sitrus': {
    pokemonId: 'torkoal',
    label: 'オボン晴れ',
    item: 'オボンのみ',
    ability: 'ひでり',
    role: '晴れサポート',
    moves: ['ふんえん', 'クリアスモッグ', 'あまえる', 'まもる'],
    sp: sp(false, 'support'),
    nature: { name: 'おだやか', up: 'spd', down: 'spe' },
    note: 'あついいわ無しの晴れ始動。Item Clause回避用。',
    abilityOptions: ['しろいけむり', 'ひでり', 'シェルアーマー']
  },
  'pelipper-av': {
    pokemonId: 'pelipper',
    label: 'チョッキ',
    item: 'とつげきチョッキ',
    ability: 'あめふらし',
    role: '雨特殊',
    moves: ['ハイドロポンプ', 'ぼうふう', 'こごえるかぜ', 'うのミサイル'],
    sp: { hp: 32, atk: 0, def: 0, spa: 32, spd: 2, spe: 0 },
    nature: { name: 'ひかえめ', up: 'spa', down: 'atk' },
    note: '雨特殊アタッカー寄り。いわ／オボン型と分担。',
    abilityOptions: ['するどいめ', 'あめふらし', 'あめうけざら']
  },
  'kingambit-sash': {
    pokemonId: 'kingambit',
    label: 'タスキ',
    item: 'きあいのタスキ',
    ability: 'そうだいしょう',
    role: '物理エース',
    moves: ['アイアンヘッド', 'くらいつく', 'すいりゅうれんだ', 'つるぎのまい'],
    sp: sp(true, 'fast'),
    nature: { name: 'ようき', up: 'spe', down: 'spa' },
    note: 'つるぎのまい起点。メガネ／LOと3型で持ち物を分散。',
    abilityOptions: ['まけんき', 'そうだいしょう', 'プレッシャー']
  },
  'incineroar-safety': {
    pokemonId: 'incineroar',
    label: 'クリアチャーム',
    item: 'クリアチャーム',
    ability: 'いかく',
    role: 'サポート',
    moves: ['ねこだまし', 'フレアドライブ', 'うっとりする', 'まもる'],
    sp: sp(true, 'support'),
    nature: { name: 'しんちょう', up: 'spd', down: 'spa' },
    note: '能力ダウン無効のねこだまし役。オボン／こしと3型。',
    abilityOptions: ['もうか', 'いかく']
  },
  'sinistcha-cloak': {
    pokemonId: 'sinistcha',
    label: 'クリアチャーム',
    item: 'クリアチャーム',
    ability: 'おもてなし',
    role: 'サポート',
    moves: ['ちゃかいほう', 'いかりのこな', 'トリックルーム', 'まもる'],
    sp: sp(false, 'support'),
    nature: { name: 'れいせい', up: 'spa', down: 'spe' },
    note: 'オボン／カシブ以外の第3サポート型。',
    abilityOptions: ['おもてなし', 'ヒートプルーフ']
  },
  'meowscarada-lo': {
    pokemonId: 'meowscarada',
    label: 'いのちのたま',
    item: 'いのちのたま',
    ability: 'へんげんじざい',
    role: '物理エース',
    moves: ['はたきおとす', 'トリックフラワー', 'とんぼがえり', 'まもる'],
    sp: sp(true, 'fast'),
    nature: { name: 'ようき', up: 'spe', down: 'spa' },
    note: 'タスキ／スカーフ以外の火力型。',
    abilityOptions: ['しんりょく', 'へんげんじざい']
  },
  'primarina-cloak': {
    pokemonId: 'primarina',
    label: 'クリアチャーム',
    item: 'クリアチャーム',
    ability: 'うるおいボイス',
    role: '特殊耐久',
    moves: ['ムーンブラスト', 'うたかたのアリア', 'こごえるかぜ', 'まもる'],
    sp: sp(false, 'bulk'),
    nature: { name: 'おだやか', up: 'spd', down: 'atk' },
    note: 'メガネ／こし以外の耐久特殊。能力ダウン無効。',
    abilityOptions: ['げきりゅう', 'うるおいボイス']
  },
  'hippowdon-rocky': {
    pokemonId: 'hippowdon',
    label: 'ゴツゴツ',
    item: 'ゴツゴツメット',
    ability: 'すなおこし',
    role: '砂サポート',
    moves: ['じしん', 'あくび', 'ロックブラスト', 'まもる'],
    sp: { hp: 32, atk: 0, def: 28, spa: 0, spd: 6, spe: 0 },
    nature: { name: 'わんぱく', up: 'def', down: 'spa' },
    note: '砂始動＋接触削り。オボン／こしと3型。',
    abilityOptions: ['すなおこし', 'すなのちから']
  },
  'hydreigon-lo': {
    pokemonId: 'hydreigon',
    label: 'いのちのたま',
    item: 'いのちのたま',
    ability: 'ふみん',
    role: '特殊エース',
    moves: ['あくのはどう', 'りゅうせいぐん', 'かえんほうしゃ', 'まもる'],
    sp: sp(false, 'fast'),
    nature: { name: 'おくびょう', up: 'spe', down: 'atk' },
    note: 'スカーフ／メガネ以外の自由技枠型。',
    abilityOptions: ['ふみん']
  },
  'archaludon-sash': {
    pokemonId: 'archaludon',
    label: 'タスキ',
    item: 'きあいのタスキ',
    ability: 'がんじょう',
    role: '特殊エース',
    moves: ['りゅうせいぐん', 'でんじは', 'ボディプレス', 'まもる'],
    sp: sp(false, 'fast'),
    nature: { name: 'ひかえめ', up: 'spa', down: 'atk' },
    note: '雨／シングルチョッキ以外の起点作り型。',
    abilityOptions: ['がんじょう', 'じゅんかん', 'すじがねいり']
  },
  'mimikyu-cloak': {
    pokemonId: 'mimikyu',
    label: 'クリアチャーム',
    item: 'クリアチャーム',
    ability: 'ばけのかわ',
    role: '物理エース',
    moves: ['じゃれつく', 'かげうち', 'のろい', 'まもる'],
    sp: sp(true, 'bulk'),
    nature: { name: 'いじっぱり', up: 'atk', down: 'spa' },
    note: 'LO／タスキ以外ののろい積み型。',
    abilityOptions: ['ばけのかわ']
  }
};

let added = 0;
let skipped = 0;
for (const [id, build] of Object.entries(NEW)) {
  if (builds[id]) {
    skipped += 1;
    continue;
  }
  builds[id] = {
    ...build,
    itemEffect: EFFECT[build.item] || effects[build.item] || ''
  };
  added += 1;
}

fs.writeFileSync(buildsPath, JSON.stringify(builds, null, 2) + '\n');
fs.writeFileSync(effectsPath, JSON.stringify(effects, null, 2) + '\n');
console.log(`Added ${added} builds (skipped ${skipped} existing)`);
console.log(`Curated total: ${Object.values(builds).filter((b) => !b.auto).length}`);
