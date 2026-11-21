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
//  • `stock` lists sizes and how many are in stock. 0 = sold out for that size.
//  • `images`: first image is the main one. Use https:// URLs or /images/... files.
//  • After editing, commit to GitHub — Vercel redeploys automatically.
//
//  ⚠ SAMPLE DATA: every product below is a PLACEHOLDER (names, prices, photos).
//  Replace with your real inventory, then set STORE.demo = false.
// ============================================================================

export const STORE = {
  name: 'ZARDA',
  currency: 'UZS',
  // true → site shows a "demo catalog" notice and Telegram orders are marked [DEMO].
  demo: true,
  telegram: 'Zarda_shop_bot',
  instagram: 'zarda.shop_uz',
  // Cities offered at checkout ("Другой город" lets the customer type their own).
  cities: [
    'Ташкент', 'Ташкентская область', 'Самарканд', 'Бухара', 'Андижан', 'Фергана',
    'Наманган', 'Нукус', 'Карши', 'Навои', 'Джизак', 'Гулистан', 'Термез', 'Ургенч',
  ],
  maxQtyPerItem: 10,
};

export const CATEGORIES = [
  { id: 'outerwear', name: 'Верхняя одежда' },
  { id: 'tailoring', name: 'Костюмы и пиджаки' },
  { id: 'knitwear', name: 'Трикотаж' },
  { id: 'shirts', name: 'Рубашки' },
  { id: 'tshirts', name: 'Футболки' },
  { id: 'trousers', name: 'Брюки и джинсы' },
  { id: 'dresses', name: 'Платья' },
];

const U = (id) => `https://images.unsplash.com/photo-${id}`;

export const PRODUCTS = [
  {
    id: 'zr-001',
    name: 'Пальто прямого кроя',
    category: 'outerwear',
    price: 1290000,
    description: 'Пальто прямого силуэта длиной ниже колена. Спущенная линия плеча, потайная застёжка, два боковых кармана. Носится поверх трикотажа и костюма.',
    details: ['Состав: 70% шерсть, 30% полиамид (пример)', 'Длина: ниже колена', 'Подкладка: вискоза'],
    images: [U('1539533018447-63fcce2678e3'), U('1485462537746-965f33f7f6a7')],
    colors: [{ name: 'Кэмел', hex: '#b48a5e' }, { name: 'Серый меланж', hex: '#9a9a96' }],
    stock: { S: 3, M: 5, L: 2, XL: 0 },
    available: true, featured: true, bestseller: true, isNew: true, sample: true,
  },
  {
    id: 'zr-002',
    name: 'Бомбер из плотной ткани',
    category: 'outerwear',
    price: 690000,
    description: 'Укороченный бомбер с трикотажными манжетами и молнией. Лёгкий утеплитель для межсезонья.',
    details: ['Состав: 100% полиэстер (пример)', 'Застёжка: молния', 'Утеплитель: лёгкий'],
    images: [U('1591047139829-d91aecb6caea')],
    colors: [{ name: 'Терракота', hex: '#b5704d' }],
    stock: { S: 2, M: 4, L: 4, XL: 1 },
    available: true, featured: false, bestseller: true, isNew: false, sample: true,
  },
  {
    id: 'zr-003',
    name: 'Кожаная куртка',
    category: 'outerwear',
    price: 1850000,
    description: 'Куртка классического байкерского кроя из гладкой кожи. Асимметричная молния, металлическая фурнитура.',
    details: ['Состав: натуральная кожа (пример)', 'Подкладка: хлопок', 'Фурнитура: металл'],
    images: [U('1551028719-00167b16eac5'), U('1520975954732-35dd22299614')],
    colors: [{ name: 'Чёрный', hex: '#151515' }],
    stock: { M: 2, L: 3, XL: 1 },
    available: true, featured: true, bestseller: false, isNew: true, sample: true,
  },
  {
    id: 'zr-004',
    name: 'Пиджак классического кроя',
    category: 'tailoring',
    price: 980000,
    description: 'Однобортный пиджак с лацканами-нотч. Мягкое плечо, два шлицевых кармана. Сочетается с брюками в тон или с джинсами.',
    details: ['Состав: 60% шерсть, 40% полиэстер (пример)', 'Застёжка: две пуговицы', 'Подкладка: вискоза'],
    images: [U('1617127365659-c47fa864d8bc'), U('1617137968427-85924c800a22')],
    colors: [{ name: 'Чёрный', hex: '#151515' }, { name: 'Тёмно-синий', hex: '#1f2a44' }],
    stock: { S: 1, M: 3, L: 3, XL: 2 },
    available: true, featured: true, bestseller: false, isNew: false, sample: true,
  },
  {
    id: 'zr-005',
    name: 'Джемпер мягкой вязки',
    category: 'knitwear',
    price: 420000,
    description: 'Объёмный джемпер из мягкой пряжи с округлым вырезом и спущенным плечом.',
    details: ['Состав: 50% хлопок, 50% акрил (пример)', 'Посадка: свободная'],
    images: [U('1581044777550-4cfa60707c03'), U('1434389677669-e08b4cac3105')],
    colors: [{ name: 'Пудровый', hex: '#e7cfc8' }, { name: 'Молочный', hex: '#efe9df' }],
    stock: { XS: 2, S: 4, M: 4, L: 2 },
    available: true, featured: true, bestseller: true, isNew: true, sample: true,
  },
  {
    id: 'zr-006',
    name: 'Худи из плотного хлопка',
    category: 'knitwear',
    price: 390000,
    description: 'Худи свободного кроя с капюшоном на кулиске и карманом-кенгуру. Плотный футер с начёсом.',
    details: ['Состав: 80% хлопок, 20% полиэстер (пример)', 'Плотность: 320 г/м²'],
    images: [U('1556821840-3a63f95609a7'), U('1578681994506-b8f463449011')],
    colors: [{ name: 'Серый меланж', hex: '#9a9a96' }, { name: 'Чёрный', hex: '#151515' }],
    stock: { S: 5, M: 6, L: 6, XL: 3, XXL: 2 },
    available: true, featured: false, bestseller: true, isNew: false, sample: true,
  },
  {
    id: 'zr-007',
    name: 'Свитшот базовый',
    category: 'knitwear',
    price: 310000,
    description: 'Свитшот прямого кроя без лишних деталей. Рибана на манжетах и по низу.',
    details: ['Состав: 100% хлопок (пример)'],
    images: [U('1620799140408-edc6dcb6d633')],
    colors: [{ name: 'Белый', hex: '#f4f4f2' }],
    stock: { S: 3, M: 3, L: 0, XL: 2 },
    available: true, featured: false, bestseller: false, isNew: true, sample: true,
  },
  {
    id: 'zr-008',
    name: 'Рубашка из поплина',
    category: 'shirts',
    price: 360000,
    description: 'Классическая рубашка из хлопкового поплина. Воротник кент, манжеты на пуговицах.',
    details: ['Состав: 100% хлопок (пример)', 'Посадка: прямая'],
    images: [U('1598033129183-c4f50c736f10'), U('1602810318383-e386cc2a3ccf')],
    colors: [{ name: 'Белый', hex: '#f4f4f2' }, { name: 'Голубой', hex: '#b9cbe0' }],
    stock: { S: 4, M: 6, L: 5, XL: 3 },
    available: true, featured: false, bestseller: true, isNew: false, sample: true,
  },
  {
    id: 'zr-009',
    name: 'Футболка Essential',
    category: 'tshirts',
    price: 180000,
    description: 'Базовая футболка из плотного хлопкового джерси. Прямой крой, округлый вырез.',
    details: ['Состав: 100% хлопок (пример)', 'Плотность: 220 г/м²'],
    images: [U('1521572163474-6864f9cf17ab'), U('1554568218-0f1715e72254')],
    colors: [{ name: 'Белый', hex: '#f4f4f2' }],
    stock: { XS: 4, S: 8, M: 10, L: 8, XL: 4 },
    available: true, featured: false, bestseller: true, isNew: false, sample: true,
  },
  {
    id: 'zr-010',
    name: 'Футболка оверсайз',
    category: 'tshirts',
    price: 210000,
    description: 'Футболка свободного силуэта со спущенным плечом и удлинёнными рукавами.',
    details: ['Состав: 100% хлопок (пример)', 'Посадка: оверсайз'],
    images: [U('1618354691373-d851c5c3a990'), U('1622519407650-3df9883f76a5')],
    colors: [{ name: 'Чёрный', hex: '#151515' }],
    stock: { S: 4, M: 6, L: 6, XL: 2 },
    available: true, featured: false, bestseller: false, isNew: true, sample: true,
  },
  {
    id: 'zr-011',
    name: 'Брюки-чинос',
    category: 'trousers',
    price: 340000,
    description: 'Хлопковые чинос прямого кроя со средней посадкой. Боковые и задние карманы.',
    details: ['Состав: 98% хлопок, 2% эластан (пример)', 'Посадка: средняя'],
    images: [U('1473966968600-fa801b869a1a')],
    colors: [{ name: 'Бежевый', hex: '#c8b394' }],
    stock: { 30: 2, 32: 4, 34: 3, 36: 1 },
    available: true, featured: false, bestseller: false, isNew: false, sample: true,
  },
  {
    id: 'zr-012',
    name: 'Джинсы прямого кроя',
    category: 'trousers',
    price: 450000,
    description: 'Джинсы классического пятикарманного дизайна из плотного денима.',
    details: ['Состав: 100% хлопок (пример)', 'Посадка: прямая'],
    images: [U('1542272604-787c3835535d')],
    colors: [{ name: 'Индиго', hex: '#2b3a55' }],
    stock: { 28: 1, 30: 3, 32: 4, 34: 2 },
    available: true, featured: false, bestseller: true, isNew: false, sample: true,
  },
  {
    id: 'zr-013',
    name: 'Брюки свободного кроя',
    category: 'trousers',
    price: 380000,
    description: 'Женские брюки с высокой посадкой и эластичным поясом. Струящаяся ткань.',
    details: ['Состав: 65% вискоза, 35% полиэстер (пример)', 'Посадка: высокая'],
    images: [U('1594633312681-425c7b97ccd1')],
    colors: [{ name: 'Пудровый', hex: '#e2b9ac' }],
    stock: { XS: 2, S: 3, M: 3, L: 0 },
    available: true, featured: false, bestseller: false, isNew: true, sample: true,
  },
  {
    id: 'zr-014',
    name: 'Платье макси',
    category: 'dresses',
    price: 890000,
    description: 'Платье в пол с открытыми плечами и запáхом. Для вечерних выходов.',
    details: ['Состав: 100% полиэстер (пример)', 'Длина: макси'],
    images: [U('1612336307429-8a898d10e223')],
    colors: [{ name: 'Красный', hex: '#a4232b' }],
    stock: { XS: 1, S: 2, M: 2, L: 1 },
    available: true, featured: true, bestseller: false, isNew: true, sample: true,
  },
];

// Images used by page sections (hero, collections, editorial). Replace freely.
export const SITE_IMAGES = {
  hero: U('1490481651871-ab68de25d43d'),
  editorial: U('1608234808654-2a8875faa7fd'),
  store: U('1445205170230-053b83016050'),
  basics: U('1562157873-818bc0726f68'),
};

// ---- helpers shared by browser and server --------------------------------
export const getProduct = (id) => PRODUCTS.find((p) => p.id === id) || null;
export const getCategory = (id) => CATEGORIES.find((c) => c.id === id) || null;
export const sizesOf = (p) => Object.keys(p.stock || {});
export const stockOf = (p, size) => Number((p.stock || {})[size] || 0);
export const isInStock = (p) => p.available !== false && sizesOf(p).some((s) => stockOf(p, s) > 0);
export const totalStock = (p) => sizesOf(p).reduce((n, s) => n + stockOf(p, s), 0);
// Shown as "Осталось мало" on cards when total units across sizes is at or below this.
export const LOW_STOCK = 3;
