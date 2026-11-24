/* ============================================================
   SİTE AYARLARI — içerik, kare eşleşmeleri ve eşikler burada
   ============================================================ */
window.SITE = {
  /* 1) INTRO KARELERİ */
  frames: {
    count: 94,                     // frames/d/f_000.webp … f_093.webp
    desktop: 'frames/d/f_',        // 1920×1080 (masaüstü, tablet)
    mobile:  'frames/d/f_',        // 1440×810 (telefon: kısa kenar ≤ 600px)
    ext: '.webp', pad: 3
  },
  blend: 0.3,                        // kareler arası çapraz geçiş bandı: 1 = tam yumuşak (bulanık görünebilir), 0.3 = dar bant, 0 = geçişsiz keskin
  focus: { x: 0.5, y: 0.42 },      // kırpma odağı (göz bölgesi)
  introVH: 600,                    // intro'nun scroll uzunluğu (vh). Büyütürsen animasyon yavaşlar.

  /* Scroll ilerlemesi (0→1) → kare numarası. [scrollOranı, kare]
     Open → Scroll 1 (cephe) → 2 (yüz) → 3 (göz) → 4 (iris) → 5 (siyah) */
  map: [
    [0.00,  0], [0.05,  0],        // Open: profil
    [0.25, 22],                    // profil → cephe
    [0.36, 40], [0.40, 41],        // Scroll 1: cephe
    [0.52, 51],                    // Scroll 2: yüz
    [0.62, 58],                    // Scroll 3: göz
    [0.74, 80],                    // Scroll 4: iris / gözbebeği
    [0.82, 88], [0.86, 93],        // Scroll 5: siyah
    [1.00, 93]
  ],
  open: { desktop: [0.40, 0.48], portrait: [0.40, 0.47] },   // açılış metinlerinin kaybolduğu aralık
  beat: { range: [0.88, 0.95],                             // Scroll 5.5: siyah ekranda beliren metin
          title: 'As I See It', sub: 'Design, Visuals,\nand Motion.' },

  /* Dikey ekran (telefon / dikey tablet): kare başta altta küçük durur, sonra tam ekrana büyür */
  fit: [[0, 0], [0.40, 0], [0.52, 1], [1, 1]],   // 0 = altta yerleşik, 1 = tam ekran
  insetMaxHeight: 0.635,                          // yerleşik modda karenin ekran yüksekliğine oranı
  portraitCover: { zoom: 1.06, x: 0.5, y: 0.44 }, // dikey ekranda tam ekran kadraj (UI kılavuzundan ölçüldü)
  insetFocusX: 0.48,

  /* 2) DÖRT PROJE — layout: 'imgL' (görsel solda) | 'imgR' (görsel sağda) */
  projects: [
    { title: 'Cattelier', short: 'Cattelier', layout: 'imgL', href: 'work-1.html', img: 'img/cattelier.webp',
      alt: 'Cattelier cat litter brand identity and packaging',
      tags: ['Brand Design', 'Logo Design', 'Packing Design'],
      text: 'I developed the name, logo, visual identity, and packaging for a cat litter brand, balancing a distinctive look with practical design.' },
    { title: 'Volar\nCar Rental', short: 'Volar', layout: 'imgR', href: 'work-2.html', img: 'img/volar.webp',
      alt: 'Volar Car Rental website and social media ads',
      tags: ['Web Design', 'UI / UX Design', 'Social Adworks'],
      text: 'I designed and developed a website that makes it easy to browse and book rental cars. I also created social media ads that brought the same visual identity to the brand’s campaigns.' },
    { title: 'Tok Italian\nRistorante', short: 'Tok', layout: 'imgL', href: 'work-3.html', img: 'img/tok.webp',
      alt: 'Tok Italian Ristorante menus and social media ads',
      tags: ['Menu Design', 'Digital Adworks', 'Food Photography'],
      text: 'I designed menus and social media ads that capture the warmth of Italian dining through modern typography and clean layouts.' },
    { title: 'Melluva\nTowel', short: 'Melluva', layout: 'imgR', href: 'work-4.html', img: 'img/melluva.webp',
      alt: 'Melluva Towel product photography and branding',
      tags: ['Product Photography', 'E-Commerce Adworks', 'Retouch & Editing'],
      text: 'I shot e-commerce product and lifestyle photos for towels and towel sets, highlighting their textures and details. I also designed branding elements that tied the collection together.' }
  ],

  /* 3) GALERİ — 7 kart (3:4) */
  gallery: {
    count: 7,
    images: ['img/card-1.webp','img/card-2.webp','img/card-3.webp','img/card-4.webp','img/card-5.webp','img/card-6.webp','img/card-7.webp'],
    alts:   ['Table tennis event poster','Volar car rental social ad','Tok tortellini poster','Air purifier ad','Residential project ad','Nature-themed poster','Product packaging ad'],
    angle: 28,                     // yatay ekranda kartlar arası yelpaze açısı (derece)
    /* Dikey ekran yelpazesi: 9:16'lık sanal kutuya göre [x, y, dönüş°]; cardW = kart genişliği */
    portrait: { cardW: 0.32,
      cards: [[.78,.66,98],[.84,.47,50],[.79,.295,22],[.50,.21,0],[.22,.30,-22],[.16,.49,-50],[.17,.67,-98]],
      titleTop: 0.79 }
  }
};
