// ============================================================================
//  ZARDA.SHOP — Uzbek (Latin) texts for the catalog
// ============================================================================
//  Russian texts in products.js are the source of truth (orders reach the manager
//  in Russian). This file only adds the Uzbek name / description / details shown
//  when a visitor switches the site to Oʻzbekcha. A product without an entry here
//  simply shows its Russian text.
// ============================================================================

export const UZ_CATEGORIES = {
  outerwear: 'Kurtkalar va puxoviklar',
  vests: 'Nimchalar',
  knitwear: 'Trikotaj',
  trousers: 'Shimlar va jinsilar',
  tops: 'Futbolka va koʻylaklar',
  shoes: 'Poyabzal',
  accessories: 'Aksessuarlar',
  other: 'Turli',
};

// Short Uzbek names for products synced from Telegram whose name is a single item word.
export const UZ_WORDS = {
  'Куртка': 'Kurtka', 'Пуховик': 'Puxovik', 'Бомбер': 'Bomber', 'Ветровка': 'Vetrovka', 'Джакет': 'Jaket', 'Жакет': 'Jaket',
  'Пальто': 'Palto', 'Плащ': 'Plashch', 'Безрукавка': 'Nimcha', 'Жилетка': 'Jilet', 'Жилет': 'Jilet',
  'Кардиган': 'Kardigan', 'Джемпер': 'Jemper', 'Свитер': 'Sviter', 'Полузамок': 'Yarim zamokli jemper', 'Зипка': 'Zipka',
  'Кофта': 'Kofta', 'Лонгслив': 'Longsliv', 'Водолазка': 'Vodolazka', 'Худи': 'Xudi', 'Свитшот': 'Svitshot', 'Американка': 'Amerikanka',
  'Брюки': 'Shim', 'Штаны': 'Shim', 'Джинсы': 'Jinsi', 'Шорты': 'Shortik', 'Футболка': 'Futbolka', 'Поло': 'Polo',
  'Рубашка': 'Koʻylak', 'Финка': 'Mayka', 'Обувь': 'Poyabzal', 'Кроссовки': 'Krossovka', 'Кеды': 'Ked', 'Туфли': 'Tufli',
  'Тапки': 'Shippak', 'Тапочка': 'Shippak', 'Кепка': 'Kepka', 'Галстук': 'Galstuk', 'Очки': 'Koʻzoynak', 'Сумка': 'Sumka',
  'Аксессуар': 'Aksessuar', 'Новинка': 'Yangi mahsulot',
};

// Keyed by the Russian colour name used in products.js.
export const UZ_COLORS = {
  'Чёрный': 'Qora',
  'Тёмно-синий': 'Toʻq koʻk',
  'Коричневый': 'Jigarrang',
  'Бежевый': 'Bej',
  'Молочный': 'Sutrang',
  'Серый': 'Kulrang',
  'Хаки': 'Xaki',
  'Бордовый': 'Bordo',
  'Светло-серый': 'Och kulrang',
  'Зелёный': 'Yashil',
  'Красный': 'Qizil',
  'Белый': 'Oq',
  'Оранжевый': 'Toʻq sariq',
  'Тёмно-коричневый': 'Toʻq jigarrang',
  'Графит': 'Grafit',
  'Тёмно-синий деним': 'Toʻq koʻk denim',
  'Светло-голубой': 'Och havorang',
  'Тёмно-серый': 'Toʻq kulrang',
  'Оливковый': 'Zaytunrang',
  'Серый меланж': 'Kulrang melanj',
  'Бордово-коричневый': 'Bordo-jigarrang',
  'Кремовый': 'Krem',
  'Синий': 'Koʻk',
  'Жёлтый': 'Sariq',
  'Фиолетовый': 'Binafsha',
  'Как на фото': 'Suratdagidek',
  'Горчичный': 'Xantal rang',
  'Мятный': 'Yalpiz rang',
  'Серо-синий': 'Kulrang-koʻk',
};

export const UZ_PRODUCTS = {
  'zr-101': {
    name: 'Kapyushonli kalta puxovik',
    description: 'Erkin oversize bichimli, tushirilgan yelkali hajmli kalta puxovik. Gorizontal tikuv yumshoq hajm beradi, zich isitgich issiqni yaxshi saqlaydi. Metall zamok, baland yoqa, yon choʻntaklar.',
    details: ['Mavsum: qish va sovuq oraliq mavsum', 'Bichim: oversize, kalta', 'Sviter, keng shim va jinsilar bilan yaxshi uygʻunlashadi'],
  },
  'zr-102': {
    name: 'Kashemir fakturali kurtka',
    description: 'Kashemir va jun fakturasiga ega yumshoq materialdan tikilgan zamokli kurtka. Qimmatbaho koʻrinadi, qomatga yaxshi oʻtiradi, shim bilan ham, jinsi bilan ham mos keladi.',
    details: ['Material: kashemir fakturali yumshoq mato', 'Kundalik va rasmiyroq obraz uchun mos'],
  },
  'zr-103': {
    name: 'Tik yoqali plyush kurtka',
    description: 'Baland tik yoqali, zamokli yumshoq plyush matodan kurtka. Koʻkrak va choʻntakda zich qoʻshimchalar, toʻgʻri bichim, elastik yeng uchlari va etak, oldida zamokli choʻntak va yon choʻntaklar.',
    details: ['Bichim: toʻgʻri', 'Choʻntaklar: zamokli koʻkrak choʻntagi va yon choʻntaklar'],
  },
  'zr-104': {
    name: '«Romb» astarli isitilgan bomber',
    description: 'Tik yoqali, reglan yengli, yelkasida trikotaj qoʻshimchali erkin isitilgan bomber. Yeng uchlari va etagi zich ribanadan, ichida «romb» shaklidagi yumshoq qavima astar va ichki choʻntak. Yon choʻntaklar choklarga yashirilgan.',
    details: ['Bichim: erkin, reglan yeng', 'Astar: qavima', 'Ichki choʻntak'],
  },
  'zr-105': {
    name: 'Ikki zamokli bomber',
    description: 'Tik yoqali bomber: tashqi zamok ostida zich ribanadan ikkinchi planka bor — koʻp qatlamli effekt. Trikotaj yoqa boʻynni sovuqdan himoya qiladi, yumshoq isitgichli silliq mato issiqni saqlaydi va shamolni oʻtkazmaydi.',
    details: ['Isitgich: yumshoq', 'Mato shamolni oʻtkazmaydi', 'Vodolazka, shim va jinsilar bilan mos'],
  },
  'zr-106': {
    name: 'Zamshsimon matodan bomber',
    description: 'Baxmal fakturali yumshoq zamshsimon matodan qaytarma yoqali yengil bomber. Koʻkragida koketka, yenglarida qoʻshimchalar, zich ribanadan yeng uchlari va etak, metall zamok va yon choʻntaklar.',
    details: ['Mavsum: kuz va oraliq mavsum', 'Kundalik va smart casual obraz uchun mos'],
  },
  'zr-107': {
    name: 'Kalta bomber-kurtka',
    description: 'Kalta bichim, tik yoqa, butun uzunlikdagi zamok va zamokli yon choʻntaklar. Zich trikotaj etak va yeng uchlari yaxshi oʻtirishni taʼminlaydi. Sovuq mavsum uchun bazaviy model.',
    details: ['Bichim: kalta', 'Choʻntaklar: zamokli yon choʻntaklar'],
  },
  'zr-108': {
    name: 'Trikotaj yengli qavima vetrovka',
    description: 'Oraliq mavsum kurtkasi: issiq qavima asos va elastik trikotaj yenglar. Minimalistik dizayn, qulay oʻtirish va universal ranglar — har kun uchun.',
    details: ['Mavsum: oraliq mavsum', 'Yenglar: trikotaj'],
  },
  'zr-109': {
    name: 'Isitilgan qavima nimcha',
    description: 'Hajmli tik yoqali, zamokli va zamokli yon choʻntakli isitilgan qavima nimcha. Zich material issiqni yaxshi saqlaydi; jinsi, shim va sport kiyimlari bilan oson uygʻunlashadi.',
    details: ['Yoqa: tik', 'Choʻntaklar: zamokli yon choʻntaklar'],
  },
  'zr-110': {
    name: 'Qavima nimcha',
    description: 'Hajmli siluetli qavima nimcha. Shahar va sayr uchun lakonik kiyim — kepka, sokin rangli shim va charm kedlar bilan yaxshi mos keladi.',
    details: ['Siluet: hajmli'],
  },
  'zr-111': {
    name: 'Boʻrtma toʻqimali zamokli kardigan',
    description: 'Baland tik yoqali zich boʻrtma toʻqimali kardigan — yopiq yoki ochiq holda kiyish mumkin. Tushirilgan yelkali erkin bichim, metall zamok. Ham sviterni, ham yengil kurtkani almashtiradi.',
    details: ['Toʻqima: boʻrtma riban', 'Bichim: erkin, tushirilgan yelka'],
  },
  'zr-112': {
    name: 'Fakturali toʻqima kardigan',
    description: 'Fakturali toʻqimali zich trikotajdan, hajmli yoqali va metall zamokli minimalistik kardigan. Erkin oʻtirish va lakonik siluet.',
    details: ['Material: zich trikotaj'],
  },
  'zr-113': {
    name: 'Toʻqilgan kardigan-bomber',
    description: 'Zich chiziqli trikotajdan erkaklar kardigan-bomberi. Qaytarma yoqa, erkin bichim, butun uzunlikdagi zamok va qoʻshimcha zamokli choʻntak. Futbolka yoki yengil svitshot ustidan kiyiladi.',
    details: ['Material: chiziqli trikotaj', 'Qoʻshimcha zamokli choʻntak'],
  },
  'zr-114': {
    name: 'Hajmli toʻqima sviter',
    description: 'Dumaloq yoqali, reglan yengli erkin hajmli toʻqima sviter. Boʻrtma toʻqima shaklni yaxshi saqlaydi, yoqa, yeng uchlari va etak zich ribanadan. Kuz va qish uchun bazaviy kiyim.',
    details: ['Yoqa: dumaloq', 'Yeng: reglan'],
  },
  'zr-115': {
    name: 'Oldi isitilgan zipka',
    description: 'Isitilgan qavima old qism, yumshoq trikotaj yenglar va zamok. Salqin havo uchun ajoyib tanlov — jinsi, shim va kundalik obrazlar bilan oson uygʻunlashadi.',
    details: ['Old qismi: isitilgan, qavima', 'Yenglar: trikotaj'],
  },
  'zr-116': {
    name: 'Trikotaj yarim zamokli jemper',
    description: 'Toʻq jigarrang zamokli trikotaj jemper. Sokin zamonaviy siluet — oq futbolka va erkin qora shim bilan chiroyli koʻrinadi.',
    details: ['Zamok: yarim zamok'],
  },
  'zr-117': {
    name: 'Oq longsliv',
    description: 'Lakonik dizayndagi oq longsliv. Siluetni taʼkidlaydi va obrazga tetiklik beradi — ayniqsa grafit rangli erkin shim bilan.',
    details: [],
  },
  'zr-118': {
    name: 'Toʻgʻri bichimli shim',
    description: 'Har kun uchun zamonaviy toʻgʻri bichimli shim. Qulay oʻtirish va sifatli mato — ertalabdan kechgacha qulay. Xudi, sviter, koʻylak, krossovka va botinkalar bilan mos.',
    details: ['Bichim: toʻgʻri'],
  },
  'zr-119': {
    name: 'Grafit rangli erkin shim',
    description: 'Grafit rangli erkin shim. Och rangli ust kiyim bilan uygʻun kontrast yaratadi — «sokin hashamat» uslubidagi obraz.',
    details: ['Bichim: erkin'],
  },
  'zr-120': {
    name: 'Toʻq koʻk relaxed jinsi',
    description: 'Zamonaviy relaxed bichimli erkin toʻq koʻk jinsi. Zich denim, kontrast chok, harakat erkinligi uchun keng oʻtirish.',
    details: ['Material: zich denim', 'Bichim: relaxed, keng'],
  },
  'zr-121': {
    name: 'Och havorang oversize jinsi',
    description: 'Erkin oversize bichimli, keng pochali och havorang jinsi. Yuvilgan denimning yumshoq effekti.',
    details: ['Bichim: oversize, keng pocha', 'Yuvilgan denim effekti'],
  },
  'zr-122': {
    name: 'Ribanadan tik yoqali puxovik',
    description: 'Zich ribanadan baland tik yoqali hajmli puxovik — boʻynni shamol va sovuqdan himoya qiladi. Yirik gorizontal tikuv, yelkada koketka, metall zamok, yon choʻntaklar va etakda bogʻich. Erkin bichim va minimalistik dizayn.',
    details: ['Mavsum: qish va sovuq oraliq mavsum', 'Yoqa: zich ribanadan tik yoqa', 'Etakda bogʻich'],
  },
  'zr-123': {
    name: 'Kapyushonli oversize puxovik',
    description: 'Kapyushonli va yirik gorizontal tikuvli hajmli puxovik — yumshoq «momiq» siluet. Tushirilgan yelkali oversize bichim, elastik yeng uchlari va etakdagi bogʻich sovuqni oʻtkazmaydi. Metall zamok, silliq mato.',
    details: ['Mavsum: qish va sovuq oraliq mavsum', 'Bichim: oversize, tushirilgan yelka', 'Kapyushon, etakda bogʻich'],
  },
  'zr-124': {
    name: 'Qaytarma yoqali zamokli jaket',
    description: 'Metall zamokli, qaytarma yoqali lakonik jaket. Toʻgʻri siluet — bazaviy futbolka, toʻgʻri shim va kedlar bilan yaxshi koʻrinadi.',
    details: ['Zamok: metall', 'Yoqa: qaytarma'],
  },
  'zr-125': {
    name: 'Yirik toʻqimali zamokli kardigan',
    description: 'Tik yoqali, zamokli zich fakturali toʻqima kardigan. Toʻq zaytun rangi va erkin oʻtirish — futbolka ustidan issiq qatlam.',
    details: ['Toʻqima: yirik, fakturali', 'Zamok bilan'],
  },
  'zr-126': {
    name: 'Kulrang melanj zipka',
    description: 'Kulrang melanj rangli yumshoq zamokli zipka. Erkin oʻtirish — oq futbolka, erkin shim va krossovkalar bilan oson uygʻunlashadi.',
    details: ['Rang: kulrang melanj', 'Zamok bilan'],
  },
  'zr-127': {
    name: 'Bogʻichli erkin shim',
    description: 'Yogʻoch munchoqli bogʻichli, chuqur bordo-jigarrang erkin shim. Erkin bichim — har kun uchun qulay.',
    details: ['Bel: bogʻich', 'Bichim: erkin'],
  },
  'zr-128': {
    name: 'Tik yoqali qavima vetrovka',
    description: 'Tik yoqali va zamokli toʻq koʻk qavima vetrovka. Toza minimalistik siluet — och rangli shim va oq futbolka bilan yaxshi koʻrinadi.',
    details: ['Yoqa: tik', 'Zamok bilan'],
  },
  'zr-129': {
    name: 'Sutrang toʻgʻri bichimli shim',
    description: 'Och sutrang toʻgʻri bichimli shim. Toza rang obrazni tetik qiladi — toʻq rangli ust kiyim va kedlar bilan mos.',
    details: ['Bichim: toʻgʻri'],
  },
  'zr-130': {
    name: 'Zamokli koʻylak-jaket',
    description: 'Metall zamokli, qaytarma yoqali va tugmali yeng uchli jigarrang koʻylak-jaket. Minimalizm, qulaylik va zamonaviy streetwear bitta obrazda.',
    details: ['Zamok: metall', 'Yeng uchlari tugmali'],
  },
  'zr-131': {
    name: 'Keng krem shim',
    description: 'Krem rangli erkin keng shim. Jigarrang jaket, qora futbolka va kedlar bilan yaxshi uygʻunlashadi.',
    details: ['Bichim: erkin, keng'],
  },
  'zr-132': {
    name: 'Toʻgʻri bichimli palto',
    description: 'Son oʻrtasigacha boʻlgan klassik toʻgʻri bichimli palto. Latskanli qaytarma yoqa, yashirin tugmalar, yon choʻntaklar. Jemper yoki pidjak ustidan kiyiladi — sovuq mavsum uchun saranjom obraz.',
    details: ['Uzunligi: son oʻrtasigacha', 'Tugmali'],
  },
  'zr-133': {
    name: 'Hajmli oversize puxovik',
    description: 'Yirik gorizontal tikuvli va tik yoqali erkin bichimli issiq hajmli puxovik. Yorqin va bazaviy ranglar tanlovi.',
    details: ['Mavsum: qish', 'Bichim: oversize'],
  },
  'zr-134': {
    name: 'Kalta ikki tomonlama puxovik',
    description: 'Kontrast astarli va tik yoqali kalta puxovik. Hajmli tikuv issiqni yaxshi saqlaydi, butun uzunlikdagi zamok.',
    details: ['Mavsum: qish', 'Bichim: kalta'],
  },
  'zr-135': {
    name: 'Kontrast astarli qavima puxovik',
    description: 'Oq kontrast astarli va baland yoqali qora qavima puxovik. Sovuq qish uchun zich isitgich.',
    details: ['Mavsum: qish'],
  },
  'zr-136': {
    name: 'Kapyushonli puxovik',
    description: 'Kapyushonli va gorizontal tikuvli issiq puxovik. Toʻgʻri siluet, butun uzunlikdagi zamok, yon choʻntaklar.',
    details: ['Mavsum: qish', 'Kapyushon'],
  },
  'zr-137': {
    name: 'Kapyushonli qavima puxovik',
    description: 'Toʻq jigarrang va qora ranglardagi kapyushonli hajmli tikuvli puxovik. Har kun uchun issiq va amaliy variant.',
    details: ['Mavsum: qish', 'Kapyushon'],
  },
  'zr-138': {
    name: 'Tik yoqali kalta puxovik',
    description: 'Baland tik yoqali toʻq koʻk kalta puxovik. Hajmli tikuv, zamok, yon choʻntaklar.',
    details: ['Mavsum: qish', 'Bichim: kalta'],
  },
  'zr-139': {
    name: 'Bomber-puxovik',
    description: 'Bomber uslubidagi hajmli puxovik: kalta uzunlik, trikotaj yeng uchlari va etak, zich tikuv.',
    details: ['Mavsum: qish', 'Yeng uchlari va etak: trikotaj'],
  },
  'zr-140': {
    name: 'Kapyushonli toʻq koʻk puxovik',
    description: 'Kapyushonli va butun uzunlikdagi zamokli toʻq koʻk puxovik. Jemper, vodolazka va klassik shim bilan mos.',
    details: ['Mavsum: qish', 'Kapyushon'],
  },
  'zr-141': {
    name: 'Tik yoqali qavima kurtka',
    description: 'Tik yoqali yengil qavima kurtka. Yupqa isitgich — palto ostida yoki oraliq mavsumda alohida kurtka sifatida qulay.',
    details: ['Mavsum: kuz, iliq qish'],
  },
  'zr-142': {
    name: 'Nishonli charm kurtka',
    description: 'Koʻkragida nishonli, qaytarma yoqali silliq ekocharmdan kurtka. Toʻgʻri bichim, zamokli.',
    details: ['Material: ekocharm', 'Zamok bilan'],
  },
  'zr-143': {
    name: 'Choʻntakli koʻylak-kurtka',
    description: 'Koʻkragida ustki choʻntakli zich koʻylak-kurtka. Isitilgan, sviter va futbolka ustidan kiyiladi.',
    details: ['Choʻntaklar: koʻkrakda ustki'],
  },
  'zr-144': {
    name: 'Tugmali jun kurtka',
    description: 'Tik yoqali, tugmali jun matodan yumshoq kurtka. Erkin bichim, issiq va yengil.',
    details: ['Mato: jun', 'Tugmali'],
  },
  'zr-145': {
    name: 'Jun jaket',
    description: 'Qaytarma yoqali, tugmali zich jun matodan jaket. Xuddi shu matodagi shim bilan kostyum boʻladi.',
    details: ['Mato: jun', 'Komplekt shimi — alohida'],
  },
  'zr-146': {
    name: 'Jun shim',
    description: 'Zich jun matodan toʻgʻri bichimli shim — jun jaketga juft.',
    details: ['Mato: jun', 'Bichim: toʻgʻri'],
  },
  'zr-147': {
    name: 'Isitilgan shim',
    description: 'Sovuq havo uchun isitilgan astarli toʻgʻri bichimli issiq shim.',
    details: ['Astar: isitilgan', 'Bichim: toʻgʻri'],
  },
  'zr-148': {
    name: 'Tik yoqali qavima nimcha',
    description: 'Tik yoqali, zamokli isitilgan qavima nimcha. Yorqin va bazaviy ranglar.',
    details: ['Yoqa: tik'],
  },
  'zr-149': {
    name: 'Isitilgan nimcha',
    description: 'Tik yoqali, zamokli qavima nimcha. Sviter ustidan yoki palto ostidan issiq qatlam.',
    details: ['Yoqa: tik'],
  },
  'zr-150': {
    name: 'Trikotaj yarim zamokli jemper',
    description: 'Kalta zamokli yoqali trikotaj jemper. Zich toʻqima, beshta rang tanlovi.',
    details: ['Zamok: yarim zamok'],
  },
  'zr-151': {
    name: 'Chiziqli yarim zamokli jemper',
    description: 'Qaytarma yoqali va kalta zamokli keng chiziqli toʻqilgan jemper.',
    details: ['Naqsh: chiziq', 'Zamok: yarim zamok'],
  },
  'zr-152': {
    name: 'Zamokli trikotaj jemper',
    description: 'Yumshoq trikotajdan tik yoqali zamokli jemper. Futbolka yoki koʻylak ustidan kiyiladi.',
    details: ['Zamok bilan'],
  },
  'zr-153': {
    name: 'Ikki plankali zamokli jemper',
    description: 'Kontrast plankali zich toʻqilgan zamokli jemper. Koʻylak va galstuk bilan chiroyli koʻrinadi.',
    details: ['Zamok bilan'],
  },
  'zr-154': {
    name: 'Toʻqilgan zamokli jemper',
    description: 'Tik yoqali, zamokli chiziqli toʻqimadan issiq jemper.',
    details: ['Toʻqima: chiziqli', 'Zamok bilan'],
  },
  'zr-155': {
    name: 'Tugmali kardigan',
    description: 'Klassik tugmali toʻqilgan kardigan. Koʻylak yoki futbolka bilan kiyiladi.',
    details: ['Tugmali'],
  },
  'zr-156': {
    name: 'Oversayz toʻqilgan kardigan',
    description: 'Har kungi obrazlar uchun minimalistik dizayndagi toʻqilgan kardigan. Erkin oversayz bichim, yumshoq va badanga yoqimli toʻqima, klassik dumaloq yoqa va tugmali. Jinsi, klassik shimlar va oddiy futbolkalar bilan oson uygʻunlashadi.',
    details: ['Tarkibi: 70% akril, 30% jun', 'Bichim: erkin, oversayz', 'Yoqa: dumaloq', 'Tugmali', 'Yeng uchi va pastki qismi: elastik rezinka'],
  },
};
