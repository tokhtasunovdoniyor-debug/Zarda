// Interface language: Russian (default) and Uzbek (Latin script).
// • JS-rendered text uses t('key', { vars }).
// • Static HTML uses data-uz="…" (text), data-uz-html, data-uz-placeholder, data-uz-aria-label,
//   data-uz-alt, data-uz-content; longer prose is written twice inside data-lang="ru" / data-lang="uz" blocks.
// • Product names/descriptions in Uzbek live in /data/products.uz.js (Russian stays the source of truth
//   for orders, so the manager always receives Russian names in Telegram).
import { UZ_PRODUCTS, UZ_CATEGORIES, UZ_COLORS } from '/data/products.uz.js';

export const LANGS = [
  { id: 'ru', short: 'RU', name: 'Русский' },
  { id: 'uz', short: 'UZ', name: 'Oʻzbekcha' },
];

export const lang = (() => {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'ru' || q === 'uz') return q;
    const s = localStorage.getItem('zarda_lang');
    if (s === 'ru' || s === 'uz') return s;
  } catch { /* ignore */ }
  return 'ru';
})();

export function setLang(l) {
  if (l !== 'ru' && l !== 'uz') return;
  try { localStorage.setItem('zarda_lang', l); } catch { /* ignore */ }
  const u = new URL(location.href);
  u.searchParams.delete('lang');
  location.replace(u.pathname + u.search + u.hash);
}

const ruItems = (n) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'товар';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'товара';
  return 'товаров';
};

const D = {
  ru: {
    skip: 'Перейти к содержимому',
    announce: 'Под заказ · {t}',
    preorderTime: '5–7 рабочих дней',
    menuOpen: 'Открыть меню', menuClose: 'Закрыть меню', menu: 'Меню',
    navMain: 'Основная навигация', navMobile: 'Мобильная навигация', homeAria: 'ZARDA — на главную',
    search: 'Поиск', searchCatalog: 'Поиск по каталогу',
    cart: 'Корзина', cartClose: 'Закрыть корзину', cartAria: '{n} товаров в корзине', cartAria0: 'товаров в корзине',
    new: 'Новинки', catalog: 'Каталог', allCatalog: 'Весь каталог', categories: 'Категории',
    about: 'О бренде', delivery: 'Доставка', payment: 'Оплата', returns: 'Возврат и обмен', contacts: 'Контакты', privacy: 'Конфиденциальность',
    writeTg: 'Написать в Telegram', contactTg: 'Связаться в Telegram',
    claim: 'Меньше вещей.<br>Больше стиля.',
    ftrAbout: 'Современная одежда с доставкой по Узбекистану.',
    shop: 'Магазин', bestsellers: 'Бестселлеры', customers: 'Покупателям', company: 'Компания', inTouch: 'Мы на связи',
    channel: 'Telegram-канал', reviews: 'Отзывы', pricesNote: 'Цены указаны в узбекских сумах (UZS)',
    language: 'Язык',
    out: 'Нет в наличии', low: 'Осталось мало', preorder: 'Под заказ', inStock: 'В наличии', newBadge: 'Новинка', samplePhoto: 'Фото-пример',
    quickView: 'Быстрый просмотр: {name}', colorsAria: '{n} цвета',
    cartEmpty: 'Ваша корзина пуста', cartEmptyHint: 'Начните с новинок сезона.', seeNew: 'Смотреть новинки',
    sizeColor: 'Размер {s} · {c}', qty: 'Количество', dec: 'Уменьшить', inc: 'Увеличить', remove: 'Удалить', total: 'Итого',
    cartNote: 'Доставка рассчитывается менеджером при подтверждении. Оплата — после подтверждения заказа.',
    checkout: 'Оформить заказ', continue: 'Продолжить покупки',
    currency: 'сум',
    // picker
    color: 'Цвет', size: 'Размер', sizeWaist: 'Размер по талии', sizeIntl: 'Международный', sizeOut: '{s} — нет в наличии',
    qtyDec: 'Уменьшить количество', qtyInc: 'Увеличить количество', addToCart: 'Добавить в корзину', toCart: 'В корзину',
    noteOut: 'Товара сейчас нет в наличии.', noteLeft: 'Осталось {n} шт. размера {s}', notePre: 'Под заказ · {t}', pickSize: 'Пожалуйста, выберите размер.',
    rUnavailable: 'Товар недоступен', rChooseSize: 'Выберите размер', rSizeOut: 'Этого размера нет в наличии', rMax: 'Максимум {n} шт. этого размера',
    addedLimited: 'Добавлено {n} шт. — это максимум в наличии',
    // quick view / product
    close: 'Закрыть', photos: 'Фотографии товара', photosShort: 'Фотографии', photoN: '{name} — фото {i}', more: 'Подробнее о товаре',
    notFound: 'Товар не найден', notFoundHint: 'Возможно, он был снят с продажи.', toCatalog: 'Перейти в каталог',
    crumbs: 'Навигация', home: 'Главная', openPhoto: 'Открыть фото {i} на весь экран', photoDot: 'Фото {i}',
    perkPre: 'Под заказ · {t}.', perkDelivery: 'Доставка по Узбекистану.',
    perkDeliveryText: 'Ташкент — курьером, области — почтой. Стоимость доставки сообщит менеджер до оплаты.',
    perkPayB: 'Без предоплаты на сайте.', perkPay: 'Оплата после подтверждения заказа.',
    perkRetB: 'Обмен и возврат.', perkRet: 'Поможем, если размер не подошёл.', terms: 'Условия',
    desc: 'Описание', details: 'Состав и детали', delPay: 'Доставка и оплата',
    delPayText: 'Мы доставляем по Ташкенту и во все регионы Узбекистана. После оформления менеджер свяжется с вами, подтвердит наличие, рассчитает доставку и согласует оплату.',
    sku: 'Артикул', sampleNote: 'Демонстрационный товар: название, фото и цена являются примером.',
    // catalog
    all: 'Все', items: (v) => `${v.n} ${ruItems(v.n)}`, filters: 'Фильтры', filtersN: 'Фильтры ({n})',
    showN: (v) => `Показать ${v.n} ${ruItems(v.n)}`, nothing: 'Ничего не найдено',
    // home promos
    promoKnitE: 'Трикотаж', promoKnitT: 'Мягкие фактуры сезона', promoKnitC: 'Выбрать трикотаж',
    promoVestE: 'Безрукавки', promoVestT: 'Лёгкое тепло для города', promoVestC: 'Выбрать безрукавку',
    altEditorial: 'Мужчина в куртке ZARDA', altStory: 'Стёганая безрукавка ZARDA с аксессуарами',
    // checkout
    choose: 'Выберите…', otherCity: 'Другой город', sending: 'Отправляем…', submit: 'Подтвердить заказ',
    serverDown: 'Сервер заказов недоступен.', sendFail: 'Не удалось отправить заказ.',
    orderNo: 'Заказ № {id}', successTotal: 'Сумма товаров: {sum}. Стоимость доставки сообщит менеджер.', doneTitle: 'Заказ оформлен',
    ifRepeat: 'Если проблема повторится, напишите нам в Telegram:',
  },
  uz: {
    skip: 'Asosiy qismga oʻtish',
    announce: 'Buyurtma asosida · {t}',
    preorderTime: '5–7 ish kuni',
    menuOpen: 'Menyuni ochish', menuClose: 'Menyuni yopish', menu: 'Menyu',
    navMain: 'Asosiy navigatsiya', navMobile: 'Mobil navigatsiya', homeAria: 'ZARDA — bosh sahifa',
    search: 'Qidiruv', searchCatalog: 'Katalog boʻyicha qidiruv',
    cart: 'Savat', cartClose: 'Savatni yopish', cartAria: 'Savatda {n} ta mahsulot', cartAria0: 'savatdagi mahsulotlar',
    new: 'Yangiliklar', catalog: 'Katalog', allCatalog: 'Butun katalog', categories: 'Kategoriyalar',
    about: 'Brend haqida', delivery: 'Yetkazib berish', payment: 'Toʻlov', returns: 'Qaytarish va almashtirish', contacts: 'Aloqa', privacy: 'Maxfiylik',
    writeTg: 'Telegramʼda yozish', contactTg: 'Telegram orqali bogʻlanish',
    claim: 'Kamroq narsa.<br>Koʻproq uslub.',
    ftrAbout: 'Oʻzbekiston boʻylab yetkazib beriladigan zamonaviy kiyimlar.',
    shop: 'Doʻkon', bestsellers: 'Eng koʻp sotilganlar', customers: 'Xaridorlarga', company: 'Kompaniya', inTouch: 'Biz aloqadamiz',
    channel: 'Telegram-kanal', reviews: 'Fikrlar', pricesNote: 'Narxlar oʻzbek soʻmida (UZS)',
    language: 'Til',
    out: 'Mavjud emas', low: 'Kam qoldi', preorder: 'Buyurtma asosida', inStock: 'Mavjud', newBadge: 'Yangi', samplePhoto: 'Namuna surat',
    quickView: 'Tezkor koʻrish: {name}', colorsAria: '{n} ta rang',
    cartEmpty: 'Savatingiz boʻsh', cartEmptyHint: 'Mavsum yangiliklaridan boshlang.', seeNew: 'Yangiliklarni koʻrish',
    sizeColor: 'Oʻlcham {s} · {c}', qty: 'Miqdor', dec: 'Kamaytirish', inc: 'Koʻpaytirish', remove: 'Oʻchirish', total: 'Jami',
    cartNote: 'Yetkazib berish narxini menejer tasdiqlashda hisoblaydi. Toʻlov — buyurtma tasdiqlangandan keyin.',
    checkout: 'Buyurtma berish', continue: 'Xaridni davom ettirish',
    currency: 'soʻm',
    color: 'Rang', size: 'Oʻlcham', sizeWaist: 'Bel oʻlchami', sizeIntl: 'Xalqaro', sizeOut: '{s} — mavjud emas',
    qtyDec: 'Miqdorni kamaytirish', qtyInc: 'Miqdorni koʻpaytirish', addToCart: 'Savatga qoʻshish', toCart: 'Savatga',
    noteOut: 'Mahsulot hozir mavjud emas.', noteLeft: '{s} oʻlchamdan {n} dona qoldi', notePre: 'Buyurtma asosida · {t}', pickSize: 'Iltimos, oʻlchamni tanlang.',
    rUnavailable: 'Mahsulot mavjud emas', rChooseSize: 'Oʻlchamni tanlang', rSizeOut: 'Bu oʻlcham mavjud emas', rMax: 'Bu oʻlchamdan koʻpi bilan {n} dona',
    addedLimited: '{n} dona qoʻshildi — bu mavjud maksimum',
    close: 'Yopish', photos: 'Mahsulot suratlari', photosShort: 'Suratlar', photoN: '{name} — {i}-surat', more: 'Mahsulot haqida batafsil',
    notFound: 'Mahsulot topilmadi', notFoundHint: 'Ehtimol, u sotuvdan olingan.', toCatalog: 'Katalogga oʻtish',
    crumbs: 'Navigatsiya', home: 'Bosh sahifa', openPhoto: '{i}-suratni toʻliq ekranda ochish', photoDot: '{i}-surat',
    perkPre: 'Buyurtma asosida · {t}.', perkDelivery: 'Oʻzbekiston boʻylab yetkazib berish.',
    perkDeliveryText: 'Toshkentga — kuryer orqali, viloyatlarga — pochta orqali. Yetkazib berish narxini menejer toʻlovdan oldin aytadi.',
    perkPayB: 'Saytda oldindan toʻlov yoʻq.', perkPay: 'Toʻlov buyurtma tasdiqlangandan keyin.',
    perkRetB: 'Almashtirish va qaytarish.', perkRet: 'Oʻlcham toʻgʻri kelmasa, yordam beramiz.', terms: 'Shartlar',
    desc: 'Tavsif', details: 'Tarkibi va tafsilotlar', delPay: 'Yetkazib berish va toʻlov',
    delPayText: 'Toshkent va Oʻzbekistonning barcha viloyatlariga yetkazib beramiz. Buyurtmadan soʻng menejer siz bilan bogʻlanadi, mavjudligini tasdiqlaydi, yetkazib berish narxini hisoblaydi va toʻlovni kelishib oladi.',
    sku: 'Artikul', sampleNote: 'Namuna mahsulot: nomi, surati va narxi misol sifatida berilgan.',
    all: 'Hammasi', items: (v) => `${v.n} ta mahsulot`, filters: 'Filtrlar', filtersN: 'Filtrlar ({n})',
    showN: (v) => `${v.n} ta mahsulotni koʻrsatish`, nothing: 'Hech narsa topilmadi',
    promoKnitE: 'Trikotaj', promoKnitT: 'Mavsumning yumshoq fakturalari', promoKnitC: 'Trikotaj tanlash',
    promoVestE: 'Nimchalar', promoVestT: 'Shahar uchun yengil issiqlik', promoVestC: 'Nimcha tanlash',
    altEditorial: 'ZARDA kurtkasidagi erkak', altStory: 'Aksessuarlar bilan ZARDA qavima nimchasi',
    choose: 'Tanlang…', otherCity: 'Boshqa shahar', sending: 'Yuborilmoqda…', submit: 'Buyurtmani tasdiqlash',
    serverDown: 'Buyurtmalar serveri ishlamayapti.', sendFail: 'Buyurtmani yuborib boʻlmadi.',
    orderNo: 'Buyurtma № {id}', successTotal: 'Mahsulotlar summasi: {sum}. Yetkazib berish narxini menejer aytadi.', doneTitle: 'Buyurtma qabul qilindi',
    ifRepeat: 'Muammo takrorlansa, bizga Telegramʼda yozing:',
    // field + server errors (Russian versions come from the server / lib/validate.js)
    errName: 'Ism va familiyangizni kiriting', errPhone: 'Raqamni +998 XX XXX XX XX formatida kiriting', errCity: 'Shaharni kiriting',
    errAddress: 'Yetkazib berish manzilini kiriting (koʻcha, uy, xonadon)', errComment: '1000 belgidan oshmasin',
    apiCustomer: 'Xaridor maʼlumotlarini tekshiring.', apiItems: 'Savatdagi mahsulotlarni tekshiring: ayrimlari oʻzgargan boʻlishi mumkin.',
    apiRate: 'Ketma-ket juda koʻp buyurtma. Keyinroq urinib koʻring yoki bizga Telegramʼda yozing.',
    apiConfig: 'Buyurtmalarni qabul qilish vaqtincha toʻxtatilgan. Bizga Telegramʼda yozing.',
    apiTelegram: 'Buyurtmani yuborib boʻlmadi. Qayta urinib koʻring yoki bizga Telegramʼda yozing.',
    apiBad: 'Notoʻgʻri soʻrov.',
  },
};

export function t(key, vars = {}) {
  const v = D[lang][key] ?? D.ru[key] ?? key;
  if (typeof v === 'function') return v(vars);
  return String(v).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

// ---- catalog data in the current language ----------------------------------
const uz = lang === 'uz';
export const pName = (p) => (uz && UZ_PRODUCTS[p.id]?.name) || p.name;
export const pDesc = (p) => (uz && UZ_PRODUCTS[p.id]?.description) || p.description;
export const pDetails = (p) => (uz && UZ_PRODUCTS[p.id]?.details) || p.details || [];
export const catName = (c) => (c ? (uz && UZ_CATEGORIES[c.id]) || c.name : '');
// Colour names stay Russian in the cart/order (they are the identifiers); only the label is translated.
export const colorName = (name) => (uz && UZ_COLORS[name]) || name;

// ---- static HTML -------------------------------------------------------------
const ATTRS = ['placeholder', 'aria-label', 'alt', 'content', 'title'];
export function applyStatic(root = document) {
  if (uz) {
    root.querySelectorAll('[data-uz]').forEach((el) => { el.textContent = el.dataset.uz; });
    root.querySelectorAll('[data-uz-html]').forEach((el) => { el.innerHTML = el.dataset.uzHtml; });
    ATTRS.forEach((a) => root.querySelectorAll(`[data-uz-${a}]`).forEach((el) => el.setAttribute(a, el.getAttribute(`data-uz-${a}`))));
  }
  document.documentElement.lang = lang;
  document.documentElement.classList.remove('i18n-wait');
}

export function langSwitch(cls = '') {
  return `<div class="lang-switch ${cls}" role="group" aria-label="${t('language')}">${LANGS.map((l) =>
    `<button type="button" data-setlang="${l.id}" aria-pressed="${l.id === lang}" lang="${l.id}" title="${l.name}">${l.short}</button>`).join('')}</div>`;
}
