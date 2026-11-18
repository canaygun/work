/* ============================================================
   SİTE AYARLARI — buradan düzenle, başka dosyaya dokunmana gerek yok
   ============================================================ */
window.SITE = {
  /* 1) INTRO KARELERİ */
  frames: {
    count: 117,                    // kare sayısı (000 → 116)
    desktop: 'frames/d/f_',        // 1920×1080
    mobile:  'frames/m/f_',        // 1280×720 (ekran ≤ 820px)
    ext: '.webp', pad: 3           // f_000.webp
  },
  focus: { x: 0.5, y: 0.42 },      // dar/dikey ekranda kırpma odağı (göz bölgesi)
  introVH: 500,                    // intro'nun scroll uzunluğu (vh). Büyütürsen animasyon yavaşlar.

  /* Scroll ilerlemesi (0→1)  →  kare numarası. Aralar lineer ve yumuşatılarak oynar.
     [scrollOranı, kare]  — "Open", "Scroll 1…5" ekranlarına göre tahmini eşleşme */
  map: [
    [0.00,   0],   // Open: profil + metinler
    [0.05,   0],
    [0.30,  30],   // profil → cepheye dönüş
    [0.42,  56],   // Scroll 1: cephe
    [0.58,  72],   // Scroll 2: yüze yaklaşma
    [0.72,  86],   // Scroll 3: göz
    [0.88, 108],   // Scroll 4: iris / gözbebeği
    [1.00, 116]    // Scroll 5: siyah
  ],
  open: { fadeOutAt: 0.08 },       // açılış metinlerinin kaybolduğu scroll oranı

  /* 2) DÖRT PROJE — sıra burada belirlenir. layout: 'imgL' (görsel solda) | 'imgR' */
  projects: [
    { title: 'Cattelier', layout: 'imgL', href: 'work-1.html', img: '',
      tags: ['Brand Design','Logo Design','Packing Design'],
      text: 'From naming to logo, visual identity, and packaging, every detail was crafted to balance aesthetics and functionality, creating a cohesive and distinctive cat litter brand.' },
    { title: 'Volar\nCar Rental', short: 'Volar', layout: 'imgR', href: 'work-2.html', img: '',
      tags: ['Web Design','UI / UX Design','Social Adworks'],
      text: 'A modern website was designed and developed for a car rental company, with a focus on user experience and effortless booking. Social media ad creatives extended the brand’s visual identity and strengthened its digital presence.' },
    { title: 'Municipality\nWorks', short: 'Municipality', layout: 'imgL', href: 'work-3.html', img: '',
      tags: ['Brand Design','Logo Design','Packing Design'],
      text: 'A selection of posters and billboards I designed for Menteşe Municipality. Each piece brings the municipality’s messages into urban life through clear communication and thoughtful visual design.' },
    { title: 'Melluva\nTowel', short: 'Melluva', layout: 'imgR', href: 'work-4.html', img: '',
      tags: ['Web Design','UI / UX Design','Social Adworks'],
      text: 'I created e-commerce product and lifestyle photography for towels and towel sets, highlighting their textures and details alongside branding designs that brought the collection together.' }
  ],

  /* 3) GALERİ — 7 kart (3:4). Görsel yolunu yaz, boş bırakırsan beyaz yer tutucu görünür. */
  gallery: {
    count: 7,
    images: ['', '', '', '', '', '', ''],   // örn. 'img/gallery-1.jpg'
    angle: 28                                // kartlar arası yelpaze açısı (derece)
  }
};
