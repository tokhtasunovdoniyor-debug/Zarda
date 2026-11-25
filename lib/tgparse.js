// Turns the text of a Telegram channel post into shop products — rule-based, no AI.
// Shared by the server (api/*) and usable in the browser for tests. Pure: no I/O.
//
// A post becomes products only if it has at least one price line, e.g.
//   «Куртка - 450.000 сум», «💰Брюки - 280.000 sum», «Джакет - 320.000», «Цена : 240.000 тыс».
// Every price line = one product. Optional lines the parser understands:
//   «Размеры: S/M/L/XL/2XL», «Размер : m-l», «Расцветки:⚫️🟢🟤», «В наличии тёмно-синяя расцветка».

export const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
const SHOE_SIZES = ['39', '40', '41', '42', '43', '44', '45'];
const SIZE_SCALE = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

// item word (lower-case root) -> category id
const CATEGORY_RULES = [
  [/пуховик|куртк|бомбер|ветровк|джакет|жакет|пальто|плащ|парк[аи]|дублёнк|дубленк|анорак/, 'outerwear'],
  [/безрукав|жилет/, 'vests'],
  [/кардиган|джемпер|свитер|полузамок|зипк|кофт|лонгслив|водолазк|худи|свитшот|толстовк|американк|олимпийк/, 'knitwear'],
  [/брюк|штан|джинс|шорт/, 'trousers'],
  [/футболк|поло|рубашк|майк|финк|сорочк|топ\b/, 'tops'],
  [/обув|кроссовк|кед|туфл|лофер|тапк|тапоч|ботинк|сапог|мокасин|слипон/, 'shoes'],
  [/кепк|галстук|очк|ремен|ремн|сумк|шапк|шарф|перчатк|носк|бейсболк|панам/, 'accessories'],
];

const COLOR_EMOJI = {
  '⚫': 'Чёрный', '⚪': 'Белый', '🟤': 'Коричневый', '🔵': 'Синий', '🔴': 'Красный',
  '🟢': 'Зелёный', '🟠': 'Оранжевый', '🟡': 'Жёлтый', '🟣': 'Фиолетовый',
};
// word root -> canonical colour name (must exist in COLOR_HEX)
const COLOR_WORDS = [
  [/серо[\s-]*син/, 'Серо-синий'], [/т[её]мно[\s-]*син/, 'Тёмно-синий'], [/ч[её]рн/, 'Чёрный'], [/бел(?!ь)/, 'Белый'], [/светло[\s-]*сер/, 'Светло-серый'],
  [/т[её]мно[\s-]*сер/, 'Тёмно-серый'], [/сер(ый|ая|ое|ые|ого|ой|ого)/, 'Серый'], [/беж/, 'Бежевый'], [/т[её]мно[\s-]*коричн/, 'Тёмно-коричневый'],
  [/коричн/, 'Коричневый'], [/хаки/, 'Хаки'], [/олив/, 'Оливковый'], [/зел[её]н/, 'Зелёный'], [/красн/, 'Красный'],
  [/бордов/, 'Бордовый'], [/молочн/, 'Молочный'], [/кремов/, 'Кремовый'], [/графит/, 'Графит'], [/голуб/, 'Светло-голубой'],
  [/син(ий|яя|ее|ие|его)/, 'Синий'], [/оранж/, 'Оранжевый'], [/ж[её]лт/, 'Жёлтый'], [/фиолет/, 'Фиолетовый'],
];
export const COLOR_HEX = {
  'Чёрный': '#151515', 'Белый': '#f4f3ef', 'Коричневый': '#5a3b2a', 'Синий': '#2a3f6b', 'Тёмно-синий': '#1f2638',
  'Красный': '#9c2b2b', 'Зелёный': '#3f5a3c', 'Оранжевый': '#c8662e', 'Жёлтый': '#d9b23a', 'Фиолетовый': '#5b3f6e',
  'Серый': '#8e8d8a', 'Светло-серый': '#c9c9c6', 'Тёмно-серый': '#3b3f4a', 'Бежевый': '#c9b08e', 'Тёмно-коричневый': '#3b2f2a',
  'Хаки': '#5d6648', 'Оливковый': '#59582e', 'Бордовый': '#4e2a38', 'Молочный': '#ece6da', 'Кремовый': '#e6ddcb',
  'Графит': '#55565a', 'Светло-голубой': '#8fa6bf', 'Серо-синий': '#5b6b82', 'Как на фото': '#b8b0a4',
};
export const PHOTO_COLOR = 'Как на фото';

// «450.000», «450 000», «450,000», «450000» — optionally followed by сум/sum/so'm/тыс/uzs.
export const PRICE_RE = /(\d{2,3})[.\s,  ]?(\d{3})(?![\d])\s*(?:сум|sum|so['ʻ’]?m|сўм|тыс|uzs)?/i;

const stripEmoji = (s) => s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}]/gu, '');
const clean = (s) => stripEmoji(s).replace(/\s+/g, ' ').trim();
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function singular(word) {
  if (/\s/.test(word.trim())) return word; // «Утеплённые брюки», «Льняные брюки» — leave phrases as written
  const w = word.toLowerCase();
  // «Куртки» -> «Куртка», «Брюки» stays (plural-only), «Футболки» -> «Футболка»
  if (/^(брюки|штаны|джинсы|шорты|очки|кеды|кроссовки|тапки|ботинки)$/.test(w)) return word;
  if (/ки$/.test(w)) return word.slice(0, -1) + 'а';
  return word;
}

export function categoryOf(text) {
  const t = text.toLowerCase();
  for (const [re, id] of CATEGORY_RULES) if (re.test(t)) return id;
  return 'other';
}

function parseSizes(text, category) {
  const m = text.match(/размер[ыа]?\s*[:\-–]?\s*([^\n]+)/i);
  if (m) {
    const raw = m[1].toUpperCase().replace(/XXXL/g, '3XL').replace(/XXL/g, '2XL').replace(/[ХX]/g, 'X').replace(/М/g, 'M').replace(/[ЅS]/g, 'S');
    const nums = raw.match(/\b(3[4-9]|4[0-9])\b/g);
    if (nums && category === 'shoes') return [...new Set(nums)];
    const found = raw.match(/\b(XXS|XS|[2-5]XL|XL|S|M|L)\b/g);
    if (found?.length) {
      const uniq = [...new Set(found)];
      // «M-L-XL», «S-M», «L-XL» are explicit lists; «S - 3XL» written as a range is expanded.
      if (uniq.length === 2 && /\b(?:XXS|XS|[2-5]?XL|S|M|L)\s*[-–—]\s*(?:XXS|XS|[2-5]?XL|S|M|L)\b/.test(raw) && !/[,/]/.test(raw)) {
        const a = SIZE_SCALE.indexOf(uniq[0]), b = SIZE_SCALE.indexOf(uniq[1]);
        if (a > -1 && b > a + 1) return SIZE_SCALE.slice(a, b + 1);
      }
      return uniq.sort((a, b) => SIZE_SCALE.indexOf(a) - SIZE_SCALE.indexOf(b));
    }
  }
  if (category === 'shoes') return SHOE_SIZES;
  if (category === 'accessories') return ['Единый'];
  return DEFAULT_SIZES;
}

// Colours come from emoji (⚫️🟤…) and colour words, but only on lines that talk about colours
// (descriptions of a look mention the colours of other items). In a multi-item post a colour line
// applies only to the item it names («Так же имеются 🟤⚫️ цвета безрукавки»).
function parseColors(text, itemRoot, multi) {
  const out = [];
  let also = false;
  const add = (c) => { if (c && !out.includes(c)) out.push(c); };
  for (const line of text.split('\n')) {
    const l = line.toLowerCase();
    const hasEmoji = [...line].some((ch) => COLOR_EMOJI[ch]);
    if (!hasEmoji && !/цвет|расцвет|представлен|в наличии/.test(l)) continue;
    if (multi && !(itemRoot && l.includes(itemRoot))) continue;
    if (/так\s*же|также|ещё|еще|имеются/.test(l)) also = true;
    // «тёмно-синий кардиган / тёмно-синие и серо-синие джинсы»: in a look, read only this item's part.
    const part = multi ? (line.split(/[/;|]|,(?![^(]*\))/).find((seg) => seg.toLowerCase().includes(itemRoot)) || line) : line;
    for (const ch of part) add(COLOR_EMOJI[ch]);
    // Colour words in the order they are written («тёмно-синие и серо-синие» → Тёмно-синий, Серо-синий).
    let rest = part.toLowerCase();
    const found = [];
    for (const [re, name] of COLOR_WORDS) {
      const m = rest.match(re);
      if (m) { found.push([m.index, name]); rest = rest.slice(0, m.index) + ' '.repeat(m[0].length) + rest.slice(m.index + m[0].length); }
    }
    found.sort((x, y) => x[0] - y[0]).forEach(([, name]) => add(name));
  }
  if (!out.length) return [PHOTO_COLOR];
  return also ? [PHOTO_COLOR, ...out] : out;
}

const NOISE = /(по поводу заказа|заказ оформляем|заказы принимает|обращаться|доставк|рабочих дн|курьер|почт[аы]|t\.me\/|@\w|https?:|трекинг|скидк|возврат|обмен|цена указана|в наличии\s*$|^\s*#|^[^А-Яа-яЁёA-Za-z]*цены?[^А-Яа-яЁёA-Za-z]*$)/i;

// Descriptive lines: everything that is not a price / size / colour / contact / hashtag line.
function descriptionLines(lines) {
  return lines
    .filter((l) => l.trim() && !PRICE_RE.test(l) && !/размер|расцвет|цвета?\s*:|состав|материал\s*:|ткань\s*:|срок/i.test(l) && !NOISE.test(l))
    .map(clean)
    .filter((l) => l.length > 2);
}

// A nicer name from the first sentence when it clearly describes this item:
// «Объёмный пуховик с высоким воротником-стойкой из плотной рибаны, который…» -> up to the comma.
const PREP = /^(с|со|из|и|в|во|на|для|под|который|которая|которые|что)$/i;
function nameFromDescription(firstLine, root, category) {
  if (!firstLine) return null;
  const first = firstLine.split(/(?<=[.!?])\s|[,;:—–]\s?/)[0].trim().replace(/[.!?]+$/, '');
  // Use the sentence if it names this item («Куртка - …» + «Объёмный пуховик …» are both outerwear).
  const fits = (root && first.toLowerCase().includes(root)) || (category !== 'other' && categoryOf(first) === category);
  if (!fits) return null;
  let words = first.split(/\s+/);
  if (words.length < 2 && !/-/.test(first)) return null; // «Куртка-бомбер» is a fine one-word name
  if (words.length > 6) {
    const cut = words.findIndex((w, i) => i >= 4 && PREP.test(w));
    words = words.slice(0, cut > 0 ? cut : 7);
  }
  while (words.length > 2 && PREP.test(words[words.length - 1])) words.pop();
  const name = words.join(' ');
  return name.length <= 70 ? cap(name) : null;
}

const rootOf = (word) => {
  const r = String(word || '').toLowerCase().split(/\s+/).pop().replace(/(ки|ка|и|ы|а|у)$/, '').slice(0, 6);
  return r.length >= 3 ? r : '';
};
const FALLBACK_NAME = { outerwear: 'Куртка', vests: 'Безрукавка', knitwear: 'Кофта', trousers: 'Брюки', tops: 'Футболка', shoes: 'Обувь', accessories: 'Аксессуар', other: 'Новинка' };

/**
 * @param {string} text  caption/text of the post
 * @returns {Array<{n:number,name:string,price:number,category:string,sizes:string[],colors:string[],description:string}>}
 */
export function parsePost(text) {
  if (!text) return [];
  const lines = String(text).replace(/\r/g, '').split('\n');
  const descLines = descriptionLines(lines);
  // «🧵 Состав: 70% хлопок, 30% полиэстер» → product details.
  const details = lines.map(clean).filter((l) => /^(состав|материал|ткань|подкладка|утеплитель)\s*[:\-–]/i.test(l)).slice(0, 4);
  const desc = descLines.join(' ').replace(/\s+([.,!?])/g, '$1').slice(0, 900);
  const items = [];
  const priceAll = new RegExp(PRICE_RE.source, 'gi');
  for (const raw of lines) {
    const line = clean(raw);
    if (!PRICE_RE.test(line) || /скидк|карго|доставк|\/\s*100\s*г/i.test(line)) continue;
    // A line may hold several «Name - price» pairs when the post has no line breaks.
    let from = 0;
    for (const m of line.matchAll(priceAll)) {
      const price = Number(m[1] + m[2]);
      const before = line.slice(from, m.index);
      from = m.index + m[0].length;
      if (!(price >= 10000 && price <= 50_000_000)) continue;
      // Item word: text before the price separator («Куртка - 450.000», «Брюки: 280 000»).
      let label = clean(before.replace(/#\S+/g, '').replace(/[-–—:=💰]+\s*$/, '').replace(/^[-–—•*\s]+/, ''));
      if (/^(цена|стоимость|price|narx)$/i.test(label)) label = '';
      items.push({ label, price });
    }
  }
  if (!items.length) return [];

  const hashtag = (text.match(/#([А-Яа-яЁё]+)/) || [])[1] || '';
  const multi = items.length > 1;
  return items.map((it, i) => {
    let word = it.label ? singular(it.label.split(/\s+/).slice(0, 4).join(' ')) : '';
    const category = categoryOf(word) !== 'other' ? categoryOf(word) : categoryOf(`${hashtag} ${desc}`);
    if (!word) word = FALLBACK_NAME[category];
    const root = rootOf(word);
    // Single item: name from the first sentence. A look («Мужской кардиган + джинсы»): the matching part of the title.
    const titlePart = multi && descLines[0] ? descLines[0].split(/\s*[+&/]\s*|\s+и\s+/).find((seg) => root && seg.toLowerCase().includes(root)) : null;
    const nice = !multi ? nameFromDescription(descLines[0], root, category) : (titlePart && titlePart.split(/\s+/).length > 1 && titlePart.length <= 50 ? titlePart : null);
    const name = (nice || word).replace(/^(так\s*же\s+|также\s+)?(в\s+наличии\s+)?(имеются\s+)?/i, '').trim() || word;
    return {
      n: i + 1,
      name: cap(name),
      price: it.price,
      category,
      sizes: parseSizes(text, category),
      colors: parseColors(text, root, multi),
      description: desc || '',
      details,
    };
  });
}
