// ============================================================================
//  ZARDA.SHOP — PRODUCT CATALOG (single source of truth)
// ============================================================================
//  This one file is read by BOTH the storefront (browser) and the order API
//  (api/order.js). The server recalculates every price from this file, so a
//  customer cannot change a price in the browser.
//
//  HOW TO EDIT
//  • Add a product: copy one { ... } block, give it a NEW unique `id`.
//  • Remove a product: delete its block (or set `available: false` to hide it
//    from ordering but keep its page).
//  • Prices are whole numbers in UZS (сум), no spaces: 450000.
//  • `stock` lists the sizes that can be ordered. All items are made to order
//    (`preorder: true`), so every listed size gets the same number, which is
//    only used as the maximum quantity per order. Use 0 to switch a size off.
//  • `images`: first image is the main one. Files live in /images/products/.
//  • After editing, commit to GitHub — Vercel redeploys automatically.
//
//  Products, prices, sizes and photos are taken from the Telegram channel
//  t.me/www_zara_shop_uz (posts from August–November 2026). zr-122…zr-131 use
//  frames from the channel's videos.
// ============================================================================

export const STORE = {
  name: 'ZARDA',
  currency: 'UZS',
  // true → site shows a "demo catalog" notice and Telegram orders are marked [DEMO].
  demo: false,
  // Manager account that takes orders and answers questions.
  telegram: 'zarda_shop',
  channel: 'www_zara_shop_uz',
  reviews: 'zarda_otziv',
  // Shown next to every made-to-order item.
  preorderTime: '5–7 рабочих дней',
  // Cities offered at checkout ("Другой город" lets the customer type their own).
  cities: [
    'Ташкент', 'Ташкентская область', 'Самарканд', 'Бухара', 'Андижан', 'Фергана',
    'Наманган', 'Нукус', 'Карши', 'Навои', 'Джизак', 'Гулистан', 'Термез', 'Ургенч',
  ],
  maxQtyPerItem: 10,
};

export const CATEGORIES = [
  { id: 'outerwear', name: 'Куртки и пуховики' },
  { id: 'vests', name: 'Безрукавки' },
  { id: 'knitwear', name: 'Трикотаж' },
  { id: 'trousers', name: 'Брюки и джинсы' },
  // Used by products synced from the Telegram channel (lib/tgparse.js picks the category).
  { id: 'tops', name: 'Футболки и рубашки' },
  { id: 'shoes', name: 'Обувь' },
  { id: 'accessories', name: 'Аксессуары' },
  { id: 'other', name: 'Разное' },
];

// Sizes available to order. Every size gets the same orderable quantity.
const sizes = (...list) => Object.fromEntries(list.map((s) => [s, 10]));
const S_3XL = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
const img = (id, n) => Array.from({ length: n }, (_, i) => `/images/products/${id}-${i + 1}.jpg`);

const BLACK = { name: 'Чёрный', hex: '#151515' };
const NAVY = { name: 'Тёмно-синий', hex: '#1f2638' };
const BROWN = { name: 'Коричневый', hex: '#5a3b2a' };
const BEIGE = { name: 'Бежевый', hex: '#c9b08e' };
const MILK = { name: 'Молочный', hex: '#ece6da' };
const GREY = { name: 'Серый', hex: '#8e8d8a' };

export const PRODUCTS = [
  // ---- Куртки и пуховики ---------------------------------------------------
  {
    id: 'zr-101',
    name: 'Укороченный пуховик с капюшоном',
    category: 'outerwear',
    price: 450000,
    description: 'Объёмный укороченный пуховик со свободным оверсайз-кроем и опущенным плечом. Горизонтальная стёжка даёт мягкий объём, плотное утепление хорошо держит тепло. Металлическая молния, высокий воротник, прорезные боковые карманы.',
    details: ['Сезон: зима и холодное межсезонье', 'Крой: оверсайз, укороченный', 'Сочетается со свитерами, широкими брюками и джинсами'],
    images: img('zr-101', 7),
    colors: [BLACK, BEIGE],
    stock: sizes('M', 'L', 'XL', '2XL'),
    available: true, preorder: true, featured: true, bestseller: true, isNew: true,
  },
  {
    id: 'zr-102',
    name: 'Куртка с фактурой под кашемир',
    category: 'outerwear',
    price: 450000,
    description: 'Куртка на молнии из мягкого материала с фактурой под кашемир и шерсть. Смотрится дорого, хорошо сидит по фигуре и сочетается как с брюками, так и с джинсами.',
    details: ['Материал: мягкая ткань с фактурой под кашемир', 'Подходит для повседневного и более собранного образа'],
    images: img('zr-102', 8),
    colors: [NAVY, BROWN, BEIGE, GREY],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: true, bestseller: true, isNew: true,
  },
  {
    id: 'zr-103',
    name: 'Плюшевая куртка с воротником-стойкой',
    category: 'outerwear',
    price: 400000,
    description: 'Куртка из мягкой плюшевой ткани на молнии с высоким воротником-стойкой. Плотные вставки на груди и кармане, прямой крой, эластичные манжеты и низ, карман на молнии спереди и боковые карманы.',
    details: ['Крой: прямой', 'Карманы: нагрудный на молнии и боковые'],
    images: img('zr-103', 7),
    colors: [{ name: 'Хаки', hex: '#5d6648' }, NAVY, BLACK, MILK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: true, isNew: true,
  },
  {
    id: 'zr-104',
    name: 'Утеплённый бомбер с подкладкой «ромб»',
    category: 'outerwear',
    price: 380000,
    description: 'Свободный утеплённый бомбер с воротником-стойкой и рукавом-реглан, с трикотажной вставкой на плече. Манжеты и низ из плотной рибаны, внутри мягкая стёганая подкладка «ромбом» и внутренний карман. Боковые карманы скрыты в швах.',
    details: ['Крой: свободный, рукав-реглан', 'Подкладка: стёганая', 'Внутренний карман'],
    images: img('zr-104', 7),
    colors: [BLACK, { name: 'Бордовый', hex: '#4e2a38' }, { name: 'Светло-серый', hex: '#c9c9c6' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: true, bestseller: false, isNew: true,
  },
  {
    id: 'zr-105',
    name: 'Бомбер с двойной молнией',
    category: 'outerwear',
    price: 380000,
    description: 'Бомбер с воротником-стойкой: под внешней молнией скрыта вторая планка из плотной рибаны — эффект многослойности. Трикотажный воротник защищает шею от холода, гладкая ткань с мягким утеплителем хорошо держит тепло и отталкивает ветер.',
    details: ['Утеплитель: мягкий', 'Ткань отталкивает ветер', 'Сочетается с водолазкой, брюками и джинсами'],
    images: img('zr-105', 2),
    colors: [NAVY],
    stock: sizes('M', 'L', 'XL', '2XL', '3XL'),
    available: true, preorder: true, featured: false, bestseller: false, isNew: true,
  },
  {
    id: 'zr-106',
    name: 'Бомбер из замшеподобной ткани',
    category: 'outerwear',
    price: 350000,
    description: 'Лёгкий бомбер с отложным воротником из мягкой замшеподобной ткани с бархатистой фактурой. Кокетка на груди и вставки на рукавах, манжеты и низ из плотной рибаны, металлическая молния и прорезные боковые карманы.',
    details: ['Сезон: осень и межсезонье', 'Подходит для повседневного и smart casual образа'],
    images: img('zr-106', 2),
    colors: [NAVY, BLACK, { name: 'Зелёный', hex: '#3f5a3c' }, BROWN, { name: 'Красный', hex: '#8a2a2a' }],
    stock: sizes('M', 'L', 'XL', '2XL', '3XL', '4XL'),
    available: true, preorder: true, featured: false, bestseller: true, isNew: true,
  },
  {
    id: 'zr-107',
    name: 'Укороченная куртка-бомбер',
    category: 'outerwear',
    price: 320000,
    description: 'Укороченный крой, воротник-стойка, молния во всю длину и боковые карманы на молнии. Плотный трикотажный низ и манжеты для лучшей посадки. Базовая модель для холодного сезона — сочетается и с классикой, и с повседневными вещами.',
    details: ['Крой: укороченный', 'Карманы: боковые на молнии'],
    images: img('zr-107', 6),
    colors: [BROWN, BLACK, { name: 'Бордовый', hex: '#4e2a2e' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-108',
    name: 'Стёганая ветровка с трикотажными рукавами',
    category: 'outerwear',
    price: 320000,
    description: 'Демисезонная куртка: тёплая стёганая основа и эластичные трикотажные рукава. Минималистичный дизайн, комфортная посадка и универсальные цвета — вариант на каждый день.',
    details: ['Сезон: демисезон', 'Рукава: трикотаж'],
    images: img('zr-108', 6),
    colors: [NAVY, BLACK, MILK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },

  // ---- Безрукавки ----------------------------------------------------------
  {
    id: 'zr-109',
    name: 'Утеплённая стёганая безрукавка',
    category: 'vests',
    price: 240000,
    description: 'Утеплённая стёганая безрукавка с объёмным воротником-стойкой, застёжкой на молнию и боковыми карманами на молнии. Плотный материал хорошо сохраняет тепло, сочетается с джинсами, брюками и спортивной одеждой.',
    details: ['Воротник: стойка', 'Карманы: боковые на молнии'],
    images: img('zr-109', 9),
    colors: [NAVY, BLACK, GREY, { name: 'Белый', hex: '#f4f3ef' }, { name: 'Красный', hex: '#9c2b2b' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: true, bestseller: true, isNew: false,
  },
  {
    id: 'zr-110',
    name: 'Стёганая безрукавка',
    category: 'vests',
    price: 300000,
    description: 'Стёганая безрукавка с объёмным силуэтом. Лаконичная вещь для города и прогулок — хорошо сочетается с кепкой, брюками спокойных оттенков и кожаными кедами.',
    details: ['Силуэт: объёмный'],
    images: img('zr-110', 5),
    colors: [NAVY, BROWN, BLACK, { name: 'Белый', hex: '#f4f3ef' }, { name: 'Оранжевый', hex: '#c8662e' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },

  // ---- Трикотаж ------------------------------------------------------------
  {
    id: 'zr-111',
    name: 'Кардиган на молнии рельефной вязки',
    category: 'knitwear',
    price: 300000,
    description: 'Кардиган из плотной рельефной вязки с высоким воротником-стойкой — можно носить застёгнутым или распахнутым. Свободный крой с опущенным плечом, металлическая молния. Заменяет и свитер, и лёгкую куртку.',
    details: ['Вязка: рельефная рибана', 'Крой: свободный, опущенное плечо'],
    images: img('zr-111', 7),
    colors: [BLACK],
    stock: sizes('M', 'L', 'XL', '2XL', '3XL', '4XL'),
    available: true, preorder: true, featured: true, bestseller: true, isNew: true,
  },
  {
    id: 'zr-112',
    name: 'Кардиган из фактурной вязки',
    category: 'knitwear',
    price: 320000,
    description: 'Минималистичный кардиган из плотного трикотажа с фактурной вязкой, объёмным воротником и акцентной металлической молнией. Свободная посадка и лаконичный силуэт.',
    details: ['Материал: плотный трикотаж'],
    images: img('zr-112', 2),
    colors: [BLACK, GREY],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: true,
  },
  {
    id: 'zr-113',
    name: 'Вязаный кардиган-бомбер',
    category: 'knitwear',
    price: 300000,
    description: 'Мужской кардиган-бомбер из плотного трикотажа в рубчик. Отложной воротник, свободный расслабленный крой, молния во всю длину и дополнительный карман на молнии. Подходит под футболку или лёгкий свитшот.',
    details: ['Материал: трикотаж в рубчик', 'Дополнительный карман на молнии'],
    images: img('zr-113', 10),
    colors: [BLACK, { name: 'Коричневый', hex: '#6b5340' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: true, isNew: false,
  },
  {
    id: 'zr-114',
    name: 'Свитер объёмной вязки',
    category: 'knitwear',
    price: 300000,
    description: 'Свободный свитер объёмной вязки с круглым вырезом и рукавом-реглан. Рельефная вязка хорошо держит форму, воротник, манжеты и низ из плотной рибаны. Базовая вещь на осень и зиму.',
    details: ['Вырез: круглый', 'Рукав: реглан'],
    images: img('zr-114', 2),
    colors: [BROWN, BLACK],
    stock: sizes('M', 'L', 'XL', '2XL', '3XL'),
    available: true, preorder: true, featured: false, bestseller: false, isNew: true,
  },
  {
    id: 'zr-115',
    name: 'Зипка с утеплённой передней частью',
    category: 'knitwear',
    price: 300000,
    description: 'Утеплённая стёганая передняя часть, мягкие трикотажные рукава и застёжка на молнии. Отличный выбор для прохладной погоды — легко сочетается с джинсами, брюками и повседневными образами.',
    details: ['Перед: утеплённый, стёганый', 'Рукава: трикотаж'],
    images: img('zr-115', 5),
    colors: [BLACK, NAVY, MILK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-116',
    name: 'Трикотажный джемпер-полузамок',
    category: 'knitwear',
    price: 320000,
    description: 'Тёмно-коричневый трикотажный джемпер на молнии. Спокойный современный силуэт — хорошо смотрится с белой футболкой и свободными чёрными брюками.',
    details: ['Застёжка: молния-полузамок'],
    images: img('zr-116', 1),
    colors: [{ name: 'Тёмно-коричневый', hex: '#3b2f2a' }],
    stock: sizes('M', 'L', 'XL'),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-117',
    name: 'Белый лонгслив',
    category: 'knitwear',
    price: 280000,
    description: 'Белый лонгслив с лаконичным дизайном. Подчёркивает силуэт и придаёт образу свежесть — особенно в паре со свободными брюками графитового оттенка.',
    details: [],
    images: img('zr-117', 1),
    colors: [{ name: 'Белый', hex: '#f4f3ef' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },

  // ---- Брюки и джинсы ------------------------------------------------------
  {
    id: 'zr-118',
    name: 'Брюки прямого кроя',
    category: 'trousers',
    price: 300000,
    description: 'Современные брюки прямого кроя на каждый день. Удобная посадка и качественная ткань — комфортно с утра до вечера. Сочетаются с худи, свитерами, рубашками, кроссовками и ботинками.',
    details: ['Крой: прямой'],
    images: img('zr-118', 4),
    colors: [{ name: 'Графит', hex: '#55565a' }, BLACK, BEIGE],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: true, bestseller: true, isNew: false,
  },
  {
    id: 'zr-119',
    name: 'Свободные брюки графитового цвета',
    category: 'trousers',
    price: 340000,
    description: 'Свободные брюки графитового оттенка. Создают гармоничный контраст со светлым верхом — образ в духе тихой роскоши.',
    details: ['Крой: свободный'],
    images: img('zr-119', 1),
    colors: [{ name: 'Графит', hex: '#4a4b4f' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-120',
    name: 'Тёмно-синие джинсы relaxed',
    category: 'trousers',
    price: 320000,
    description: 'Свободные тёмно-синие джинсы в современном relaxed-крое. Плотный деним, контрастная строчка, широкая посадка для свободы движений.',
    details: ['Материал: плотный деним', 'Крой: relaxed, широкий'],
    images: img('zr-120', 5),
    colors: [{ name: 'Тёмно-синий деним', hex: '#22304a' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: true, isNew: false,
  },
  {
    id: 'zr-121',
    name: 'Светло-голубые джинсы oversized',
    category: 'trousers',
    price: 320000,
    description: 'Свободные джинсы светло-голубого оттенка с расслабленным oversized-кроем и широкими штанинами. Мягкий эффект выстиранного денима.',
    details: ['Крой: oversized, широкие штанины', 'Эффект выстиранного денима'],
    images: img('zr-121', 4),
    colors: [{ name: 'Светло-голубой', hex: '#8fa6bf' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  // ---- Зимняя коллекция из архива канала (посты октябрь 2025 – январь 2026, август 2026) ----
  {
    id: 'zr-132',
    name: 'Пальто прямого кроя',
    category: 'outerwear',
    price: 450000,
    description: 'Классическое пальто прямого кроя длиной до середины бедра. Отложной воротник с лацканами, потайная застёжка, боковые карманы. Носится поверх джемпера или пиджака — собранный образ на холодный сезон.',
    details: ['Длина: до середины бедра', 'Застёжка: на пуговицах'],
    images: img('zr-132', 5),
    colors: [NAVY, BEIGE, BLACK, GREY, BROWN],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: true, bestseller: true, isNew: false,
  },
  {
    id: 'zr-133',
    name: 'Объёмный пуховик оверсайз',
    category: 'outerwear',
    price: 470000,
    description: 'Тёплый объёмный пуховик свободного кроя с крупной горизонтальной стёжкой и воротником-стойкой. Яркие и базовые цвета на выбор.',
    details: ['Сезон: зима', 'Крой: оверсайз'],
    images: img('zr-133', 5),
    colors: [BLACK, GREY, { name: 'Зелёный', hex: '#2f6b45' }, { name: 'Горчичный', hex: '#b8862f' }, { name: 'Хаки', hex: '#7a6a3e' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: true, bestseller: false, isNew: false,
  },
  {
    id: 'zr-134',
    name: 'Короткий двусторонний пуховик',
    category: 'outerwear',
    price: 380000,
    description: 'Укороченный пуховик с контрастной подкладкой и воротником-стойкой. Объёмная стёжка хорошо держит тепло, молния во всю длину.',
    details: ['Сезон: зима', 'Крой: укороченный'],
    images: img('zr-134', 8),
    colors: [BLACK, { name: 'Светло-серый', hex: '#c9c9c6' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: true, isNew: false,
  },
  {
    id: 'zr-135',
    name: 'Стёганый пуховик с контрастной подкладкой',
    category: 'outerwear',
    price: 410000,
    description: 'Чёрный стёганый пуховик с белой контрастной подкладкой и высоким воротником. Плотное утепление для холодной зимы.',
    details: ['Сезон: зима'],
    images: img('zr-135', 4),
    colors: [BLACK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-136',
    name: 'Пуховик с капюшоном',
    category: 'outerwear',
    price: 380000,
    description: 'Тёплый пуховик с капюшоном и горизонтальной стёжкой. Прямой силуэт, молния во всю длину, боковые карманы.',
    details: ['Сезон: зима', 'Капюшон'],
    images: img('zr-136', 3),
    colors: [GREY, BLACK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-137',
    name: 'Стёганый пуховик с капюшоном',
    category: 'outerwear',
    price: 370000,
    description: 'Пуховик с капюшоном и объёмной стёжкой в глубоком коричневом и чёрном цветах. Тёплый и практичный вариант на каждый день.',
    details: ['Сезон: зима', 'Капюшон'],
    images: img('zr-137', 4),
    colors: [BROWN, BLACK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-138',
    name: 'Короткий пуховик с воротником-стойкой',
    category: 'outerwear',
    price: 380000,
    description: 'Тёмно-синий укороченный пуховик с высоким воротником-стойкой. Объёмная стёжка, молния, боковые карманы.',
    details: ['Сезон: зима', 'Крой: укороченный'],
    images: img('zr-138', 4),
    colors: [NAVY],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-139',
    name: 'Пуховик-бомбер',
    category: 'outerwear',
    price: 450000,
    description: 'Объёмный пуховик в стиле бомбер: укороченная длина, трикотажные манжеты и низ, плотная стёжка.',
    details: ['Сезон: зима', 'Манжеты и низ: трикотаж'],
    images: img('zr-139', 4),
    colors: [BLACK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-140',
    name: 'Тёмно-синий пуховик с капюшоном',
    category: 'outerwear',
    price: 380000,
    description: 'Тёмно-синий пуховик с капюшоном и молнией во всю длину. Сочетается с джемпером, водолазкой и классическими брюками.',
    details: ['Сезон: зима', 'Капюшон'],
    images: img('zr-140', 2),
    colors: [NAVY],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-141',
    name: 'Стёганая куртка с воротником-стойкой',
    category: 'outerwear',
    price: 340000,
    description: 'Лёгкая стёганая куртка с воротником-стойкой. Тонкое утепление — удобно под пальто или как самостоятельная куртка в межсезонье.',
    details: ['Сезон: осень, тёплая зима'],
    images: img('zr-141', 5),
    colors: [GREY, { name: 'Белый', hex: '#f4f3ef' }, BLACK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-142',
    name: 'Кожаная куртка с нашивкой',
    category: 'outerwear',
    price: 480000,
    description: 'Куртка из гладкой экокожи с отложным воротником и нашивкой на груди. Прямой крой, застёжка на молнии.',
    details: ['Материал: экокожа', 'Застёжка: молния'],
    images: img('zr-142', 6),
    colors: [{ name: 'Мятный', hex: '#9fc4b0' }, BLACK, { name: 'Белый', hex: '#f4f3ef' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-143',
    name: 'Куртка-рубашка с карманами',
    category: 'outerwear',
    price: 480000,
    description: 'Плотная куртка-рубашка с накладными карманами на груди. Утеплённая, носится поверх свитера и футболки.',
    details: ['Карманы: накладные нагрудные'],
    images: img('zr-143', 5),
    colors: [BEIGE, GREY, BROWN],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-144',
    name: 'Шерстяная куртка на пуговицах',
    category: 'outerwear',
    price: 320000,
    description: 'Мягкая куртка из шерстяной ткани с воротником-стойкой и застёжкой на пуговицы. Свободный крой, тёплая и лёгкая.',
    details: ['Ткань: шерстяная', 'Застёжка: пуговицы'],
    images: img('zr-144', 8),
    colors: [BEIGE, BLACK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-145',
    name: 'Шерстяной жакет',
    category: 'outerwear',
    price: 340000,
    description: 'Жакет из плотной шерстяной ткани с отложным воротником и пуговицами. В паре с брюками из той же ткани получается костюм.',
    details: ['Ткань: шерстяная', 'Брюки в комплект — отдельно'],
    images: img('zr-145', 5),
    colors: [NAVY, BROWN],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-146',
    name: 'Шерстяные брюки',
    category: 'trousers',
    price: 320000,
    description: 'Брюки прямого кроя из плотной шерстяной ткани — пара к шерстяному жакету.',
    details: ['Ткань: шерстяная', 'Крой: прямой'],
    images: img('zr-146', 3),
    colors: [NAVY, BROWN],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-147',
    name: 'Утеплённые брюки',
    category: 'trousers',
    price: 340000,
    description: 'Тёплые брюки прямого кроя на утеплённой подкладке для холодной погоды.',
    details: ['Подкладка: утеплённая', 'Крой: прямой'],
    images: img('zr-147', 4),
    colors: [NAVY, BEIGE, GREY],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-148',
    name: 'Стёганая безрукавка с воротником-стойкой',
    category: 'vests',
    price: 260000,
    description: 'Утеплённая стёганая безрукавка с воротником-стойкой и молнией. Яркие и базовые цвета.',
    details: ['Воротник: стойка'],
    images: img('zr-148', 5),
    colors: [NAVY, { name: 'Зелёный', hex: '#2f6b45' }, { name: 'Белый', hex: '#f4f3ef' }, BLACK, { name: 'Красный', hex: '#9c2b2b' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-149',
    name: 'Утеплённая безрукавка',
    category: 'vests',
    price: 280000,
    description: 'Стёганая безрукавка на молнии с воротником-стойкой. Тёплый слой поверх свитера или под пальто.',
    details: ['Воротник: стойка'],
    images: img('zr-149', 5),
    colors: [NAVY, { name: 'Светло-серый', hex: '#c9c9c6' }, BROWN],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-150',
    name: 'Трикотажный полузамок',
    category: 'knitwear',
    price: 320000,
    description: 'Трикотажный джемпер с воротником на короткой молнии. Плотная вязка, пять цветов на выбор.',
    details: ['Застёжка: полузамок'],
    images: img('zr-150', 6),
    colors: [NAVY, BLACK, GREY, BEIGE, { name: 'Зелёный', hex: '#2f6b45' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-151',
    name: 'Полузамок в полоску',
    category: 'knitwear',
    price: 280000,
    description: 'Вязаный джемпер в широкую полоску с отложным воротником и короткой молнией.',
    details: ['Узор: полоска', 'Застёжка: полузамок'],
    images: img('zr-151', 6),
    colors: [BROWN, BLACK, { name: 'Зелёный', hex: '#2f6b45' }, { name: 'Белый', hex: '#f4f3ef' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-152',
    name: 'Трикотажный джемпер на молнии',
    category: 'knitwear',
    price: 280000,
    description: 'Джемпер на молнии с воротником-стойкой из мягкого трикотажа. Носится поверх футболки или рубашки.',
    details: ['Застёжка: молния'],
    images: img('zr-152', 5),
    colors: [MILK, NAVY, BROWN, { name: 'Зелёный', hex: '#2f6b45' }, BLACK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-153',
    name: 'Джемпер на молнии с двойной планкой',
    category: 'knitwear',
    price: 360000,
    description: 'Плотный вязаный джемпер на молнии с контрастной планкой. Хорошо смотрится с рубашкой и галстуком.',
    details: ['Застёжка: молния'],
    images: img('zr-153', 5),
    colors: [BLACK, BROWN],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-154',
    name: 'Вязаный джемпер на молнии',
    category: 'knitwear',
    price: 340000,
    description: 'Тёплый вязаный джемпер в рубчик на молнии с воротником-стойкой.',
    details: ['Вязка: рубчик', 'Застёжка: молния'],
    images: img('zr-154', 6),
    colors: [BROWN, BLACK, MILK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  {
    id: 'zr-155',
    name: 'Кардиган на пуговицах',
    category: 'knitwear',
    price: 320000,
    description: 'Классический вязаный кардиган на пуговицах. Носится с рубашкой или футболкой.',
    details: ['Застёжка: пуговицы'],
    images: img('zr-155', 3),
    colors: [NAVY, BLACK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: false,
  },
  // ---- Из видео в канале (кадры из видео) -----------------------------------
  {
    id: 'zr-122',
    name: 'Пуховик с воротником-стойкой из рибаны',
    category: 'outerwear',
    price: 450000,
    description: 'Объёмный пуховик с высоким воротником-стойкой из плотной рибаны, который защищает шею от ветра и холода. Крупная горизонтальная стёжка, кокетка на плечах, металлическая молния, боковые карманы и кулиска по низу. Свободный крой и минималистичный дизайн.',
    details: ['Сезон: зима и холодное межсезонье', 'Воротник: стойка из плотной рибаны', 'Кулиска по низу'],
    images: img('zr-122', 3),
    colors: [NAVY],
    stock: sizes('M', 'L', 'XL', '2XL', '3XL'),
    available: true, preorder: true, featured: true, bestseller: false, isNew: true,
  },
  {
    id: 'zr-123',
    name: 'Пуховик оверсайз с капюшоном',
    category: 'outerwear',
    price: 420000,
    description: 'Объёмный пуховик с капюшоном и крупной горизонтальной стёжкой — мягкий «пышный» силуэт. Свободный оверсайз-крой с опущенным плечом, эластичные манжеты и кулиска по низу не пропускают холод. Металлическая молния, гладкая ткань корпуса.',
    details: ['Сезон: зима и холодное межсезонье', 'Крой: оверсайз, опущенное плечо', 'Капюшон, кулиска по низу'],
    images: img('zr-123', 3),
    colors: [BLACK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: true, bestseller: false, isNew: true,
  },
  {
    id: 'zr-124',
    name: 'Джакет на молнии с отложным воротником',
    category: 'outerwear',
    price: 320000,
    description: 'Лаконичный джакет на металлической молнии с отложным воротником. Прямой силуэт — хорошо смотрится с базовой футболкой, прямыми брюками и кедами.',
    details: ['Застёжка: металлическая молния', 'Воротник: отложной'],
    images: img('zr-124', 4),
    colors: [{ name: 'Тёмно-серый', hex: '#3b3f4a' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: true,
  },
  {
    id: 'zr-125',
    name: 'Кардиган на молнии крупной вязки',
    category: 'knitwear',
    price: 350000,
    description: 'Кардиган из плотной фактурной вязки на молнии с воротником-стойкой. Глубокий оливковый цвет и свободная посадка — тёплый слой поверх футболки.',
    details: ['Вязка: крупная, фактурная', 'Застёжка: молния'],
    images: img('zr-125', 4),
    colors: [{ name: 'Оливковый', hex: '#59582e' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: true,
  },
  {
    id: 'zr-126',
    name: 'Зипка серая меланж',
    category: 'knitwear',
    price: 340000,
    description: 'Мягкая зипка серого меланжевого цвета на молнии. Свободная посадка — легко сочетается с белой футболкой, свободными брюками и кроссовками.',
    details: ['Цвет: серый меланж', 'Застёжка: молния'],
    images: img('zr-126', 3),
    colors: [{ name: 'Серый меланж', hex: '#9a9996' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: true,
  },
  {
    id: 'zr-127',
    name: 'Свободные брюки на кулиске',
    category: 'trousers',
    price: 320000,
    description: 'Свободные брюки глубокого бордово-коричневого цвета на кулиске с деревянными бусинами. Расслабленный крой — удобно на каждый день.',
    details: ['Пояс: кулиска', 'Крой: свободный'],
    images: img('zr-127', 3),
    colors: [{ name: 'Бордово-коричневый', hex: '#5c2420' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: true,
  },
  {
    id: 'zr-128',
    name: 'Стёганая ветровка с воротником-стойкой',
    category: 'outerwear',
    price: 450000,
    description: 'Тёмно-синяя стёганая ветровка с воротником-стойкой и молнией. Чистый минималистичный силуэт — хорошо смотрится со светлыми брюками и белой футболкой.',
    details: ['Воротник: стойка', 'Застёжка: молния'],
    images: img('zr-128', 4),
    colors: [NAVY],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: true,
  },
  {
    id: 'zr-129',
    name: 'Брюки прямого кроя молочные',
    category: 'trousers',
    price: 280000,
    description: 'Светлые молочные брюки прямого кроя. Чистый цвет делает образ свежим — сочетаются с тёмной верхней одеждой и кедами.',
    details: ['Крой: прямой'],
    images: img('zr-129', 3),
    colors: [MILK],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: true,
  },
  {
    id: 'zr-130',
    name: 'Джакет-рубашка на молнии',
    category: 'outerwear',
    price: 320000,
    description: 'Коричневый джакет-рубашка на металлической молнии с отложным воротником и манжетами на кнопках. Минимализм, комфорт и современный streetwear в одном образе.',
    details: ['Застёжка: металлическая молния', 'Манжеты на кнопках'],
    images: img('zr-130', 4),
    colors: [BROWN],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: true,
  },
  {
    id: 'zr-131',
    name: 'Широкие брюки кремовые',
    category: 'trousers',
    price: 300000,
    description: 'Свободные широкие брюки кремового цвета. Хорошо сочетаются с коричневым джакетом, чёрной футболкой и кедами.',
    details: ['Крой: свободный, широкий'],
    images: img('zr-131', 2),
    colors: [{ name: 'Кремовый', hex: '#e6ddcb' }],
    stock: sizes(...S_3XL),
    available: true, preorder: true, featured: false, bestseller: false, isNew: true,
  },
];

// Photos used in homepage sections (all from the channel).
export const SITE_IMAGES = {
  hero: ['/images/products/zr-101-5.jpg', '/images/products/zr-102-1.jpg', '/images/products/zr-101-6.jpg'],
  editorial: '/images/products/zr-102-5.jpg',
  story: '/images/products/zr-110-3.jpg',
  vests: '/images/products/zr-109-1.jpg',
};

// ---- products synced from the Telegram channel -----------------------------
// New channel posts with a price become products automatically (api/telegram.js → Redis).
// They are merged in front of the hand-made list above. In the browser this happens once on
// page load; the order API calls loadDynamicProducts() on every request so prices are always current.
const STATIC_PRODUCTS = PRODUCTS.slice();
// Better photos for synced products whose post had only a video (Telegram gives bots a tiny cover).
// Keys are synced product ids (tg<post>-<n>): main photo first, then designed cards (-c1 hero, -c2 details, -c3 sizes/info).
const DYNAMIC_IMAGES = {
  'tg763-1': ['/images/products/tg763-1-main.jpg', '/images/products/tg763-1-c1.jpg', '/images/products/tg763-1-c2.jpg', '/images/products/tg763-1-c3.jpg'],
  'tg763-2': ['/images/products/tg763-2-main.jpg', '/images/products/tg763-2-c1.jpg', '/images/products/tg763-2-c2.jpg', '/images/products/tg763-2-c3.jpg'],
};
export async function loadDynamicProducts() {
  let dyn = [];
  try {
    if (typeof window !== 'undefined') {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const r = await fetch('/api/products', { signal: ctrl.signal });
      clearTimeout(timer);
      if (r.ok && (r.headers.get('content-type') || '').includes('json')) dyn = (await r.json()).products || [];
    } else {
      const store = await import('../lib/tgstore.js');
      if (store.storeReady()) dyn = await store.loadDynamic();
    }
  } catch { /* offline or not configured: the hand-made catalog still works */ }
  const known = new Set(STATIC_PRODUCTS.map((p) => p.id));
  dyn = dyn.filter((p) => p && p.id && !known.has(p.id)).map((p) => (DYNAMIC_IMAGES[p.id] ? { ...p, images: DYNAMIC_IMAGES[p.id] } : p));
  PRODUCTS.splice(0, PRODUCTS.length, ...dyn, ...STATIC_PRODUCTS);
  return PRODUCTS;
}
if (typeof window !== 'undefined') await loadDynamicProducts();

// ---- helpers shared by browser and server --------------------------------
export const getProduct = (id) => PRODUCTS.find((p) => p.id === id) || null;
export const getCategory = (id) => CATEGORIES.find((c) => c.id === id) || null;
export const sizesOf = (p) => Object.keys(p.stock || {});
export const stockOf = (p, size) => Number((p.stock || {})[size] || 0);
export const isInStock = (p) => p.available !== false && sizesOf(p).some((s) => stockOf(p, s) > 0);
export const totalStock = (p) => sizesOf(p).reduce((n, s) => n + stockOf(p, s), 0);
// Shown as "Осталось мало" on cards when total units across sizes is at or below this.
export const LOW_STOCK = 3;
