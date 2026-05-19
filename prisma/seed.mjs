import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const bcrypt = require('bcryptjs')
const pg = require('pg')
const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://zahruser:zahrpass2024@localhost:5432/zahrtelkhlig?schema=public'
})

const CDN = 'https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images'

async function query(sql, params = []) {
  const client = await pool.connect()
  try {
    return await client.query(sql, params)
  } finally {
    client.release()
  }
}

function cuid() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
}

async function main() {
  console.log('Seeding database...')

  // Admin — password: 114891
  const adminPass = await bcrypt.hash('114891', 12)
  await query(`
    INSERT INTO "User" (id, email, password, name, phone, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, 'ADMIN', NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET password=$3, role='ADMIN', phone=$5, "updatedAt"=NOW()
  `, [cuid(), 'admin@zahrtelkhlig.com', adminPass, 'مدير المتجر', '01002001446'])
  console.log('✓ Admin: password 114891')

  // Categories — no createdAt/updatedAt columns in DB
  const categories = [
    { nameAr: 'كولكشن العيد', nameEn: 'Eid Collection', slug: 'eid', image: `${CDN}/categories/logo.jpg` },
    { nameAr: 'كولكشن الصيف', nameEn: 'Summer Collection', slug: 'summer', image: `${CDN}/categories/logo.jpg` },
    { nameAr: 'كارديجان', nameEn: 'Cardigan', slug: 'cardigan', image: `${CDN}/categories/logo.jpg` },
    { nameAr: 'كولكشن الشتاء', nameEn: 'Winter Collection', slug: 'winter', image: `${CDN}/categories/logo.jpg` },
    { nameAr: 'عبايات', nameEn: 'Abayas', slug: 'abaya', image: `${CDN}/categories/logo.jpg` },
    { nameAr: 'فساتين', nameEn: 'Dresses', slug: 'dress', image: `${CDN}/categories/logo.jpg` },
  ]

  const catIds = {}
  for (const cat of categories) {
    await query(`
      INSERT INTO "Category" (id, "nameAr", "nameEn", slug, image)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (slug) DO UPDATE SET "nameAr"=$2, "nameEn"=$3, image=$5
    `, [cuid(), cat.nameAr, cat.nameEn, cat.slug, cat.image])
    const res = await query(`SELECT id FROM "Category" WHERE slug = $1`, [cat.slug])
    catIds[cat.slug] = res.rows[0].id
  }
  console.log('✓ Categories created')

  // Clear existing products to re-insert with real images
  await query(`DELETE FROM "Product"`)

  const EID_DESC_AR = 'New Eid Collection ✨\nمتوفر الأن كولكشن العيد🤩\nللطلبات: ٠١٠٠٢٠٠١٤٤٦\nمتوفر الشحن داخل و خارج دمياط\nمواعيد العمل: من ١٢ صباحًا حتي ١٢ مساءً\nعنوان الفرع: دمياط - كورنيش النيل - ميدان الساعة - بجوار سليب هاي'
  const SUMMER_DESC_AR = 'New Summer Collection ✨\nمتوفر الأن كولكشن الصيف🤩\nللطلبات: ٠١٠٠٢٠٠١٤٤٦\nمتوفر الشحن داخل و خارج دمياط\nمواعيد العمل: من ١١ صباحًا حتي ١٢ مساءً\nعنوان الفرع: دمياط - كورنيش النيل - ميدان الساعة - بجوار سليب هاي'
  const CARDIGAN_DESC_AR = '✨ Cardigan Collection ✨\nمتوفر الأن كولكشن كارديجان ٢٠٢٦🤗\nللطلبات: ٠١٠٠٢٠٠١٤٤٦\nمتوفر الشحن داخل و خارج دمياط\nمواعيد العمل: من ١١ صباحًا حتي ١١ مساءً\nعنوان الفرع: دمياط - كورنيش النيل - ميدان الساعة - بجوار سليب هاي'
  const WINTER_DESC_AR = '✨ Winter Collection ✨\nمتوفر الأن كولكشن شتاء ٢٠٢٦🤗\nللطلبات: ٠١٠٠٢٠٠١٤٤٦\nمتوفر الشحن داخل و خارج دمياط\nمواعيد العمل: من ١١ صباحًا حتي ١١ مساءً\nعنوان الفرع: دمياط - كورنيش النيل - ميدان الساعة - بجوار سليب هاي'

  const products = [
    // Eid Collection — كولكشن العيد (6 products)
    { nameAr: 'طقم عيد أنيق', nameEn: 'Elegant Eid Set', descAr: EID_DESC_AR, descEn: 'New Eid Collection. Elegant and sophisticated design for Eid.', price: 850, compare: 1100, stock: 15, featured: true, cat: 'eid', imgs: [`${CDN}/products/p01.jpg`] },
    { nameAr: 'فستان عيد فاخر', nameEn: 'Luxury Eid Dress', descAr: EID_DESC_AR, descEn: 'Luxury Eid Collection. Premium fabric with modern design.', price: 950, compare: 1200, stock: 12, featured: true, cat: 'eid', imgs: [`${CDN}/products/p02.jpg`] },
    { nameAr: 'إطلالة عيد مميزة', nameEn: 'Special Eid Look', descAr: EID_DESC_AR, descEn: 'New Eid Collection. Exclusive designs for a stunning Eid look.', price: 780, compare: null, stock: 20, featured: false, cat: 'eid', imgs: [`${CDN}/products/p03.jpg`] },
    { nameAr: 'طقم عيد جديد ١', nameEn: 'Eid Set 1', descAr: EID_DESC_AR, descEn: 'New Eid Collection. Elegant design.', price: 890, compare: 1100, stock: 10, featured: true, cat: 'eid', imgs: [`${CDN}/products/p09.jpg`] },
    { nameAr: 'طقم عيد جديد ٢', nameEn: 'Eid Set 2', descAr: EID_DESC_AR, descEn: 'New Eid Collection. Premium look.', price: 820, compare: 1000, stock: 8, featured: false, cat: 'eid', imgs: [`${CDN}/products/p10.jpg`] },
    { nameAr: 'طقم عيد جديد ٣', nameEn: 'Eid Set 3', descAr: EID_DESC_AR, descEn: 'New Eid Collection. Modern style.', price: 750, compare: null, stock: 14, featured: false, cat: 'eid', imgs: [`${CDN}/products/p11.jpg`] },

    // Summer Collection — كولكشن الصيف (7 products)
    { nameAr: 'فستان صيف خفيف', nameEn: 'Light Summer Dress', descAr: SUMMER_DESC_AR, descEn: 'New Summer Collection. Comfortable fabric for hot weather.', price: 650, compare: 850, stock: 25, featured: true, cat: 'summer', imgs: [`${CDN}/products/p04.jpg`] },
    { nameAr: 'طقم صيفي أنيق', nameEn: 'Elegant Summer Set', descAr: SUMMER_DESC_AR, descEn: 'New Summer Collection. Elegance and comfort in one outfit.', price: 720, compare: 900, stock: 18, featured: false, cat: 'summer', imgs: [`${CDN}/products/p05.jpg`] },
    { nameAr: 'تونيك صيف عصري', nameEn: 'Modern Summer Tunic', descAr: SUMMER_DESC_AR, descEn: 'New Summer Collection. Modern design for a perfect summer look.', price: 580, compare: null, stock: 30, featured: false, cat: 'summer', imgs: [`${CDN}/products/p06.jpg`] },
    { nameAr: 'فستان ماكسي صيف', nameEn: 'Summer Maxi Dress', descAr: SUMMER_DESC_AR, descEn: 'Summer Maxi Dress. Elegant for all occasions.', price: 690, compare: 850, stock: 22, featured: true, cat: 'summer', imgs: [`${CDN}/products/p07.jpg`] },
    { nameAr: 'إطلالة صيفية ١', nameEn: 'Summer Look 1', descAr: SUMMER_DESC_AR, descEn: 'New Summer Collection. Fresh summer style.', price: 630, compare: 800, stock: 20, featured: false, cat: 'summer', imgs: [`${CDN}/products/p12.jpg`] },
    { nameAr: 'إطلالة صيفية ٢', nameEn: 'Summer Look 2', descAr: SUMMER_DESC_AR, descEn: 'New Summer Collection. Light and breezy.', price: 670, compare: null, stock: 15, featured: false, cat: 'summer', imgs: [`${CDN}/products/p13.jpg`] },
    { nameAr: 'إطلالة صيفية ٣', nameEn: 'Summer Look 3', descAr: SUMMER_DESC_AR, descEn: 'New Summer Collection. Effortless elegance.', price: 710, compare: 900, stock: 12, featured: true, cat: 'summer', imgs: [`${CDN}/products/p14.jpg`] },
    { nameAr: 'إطلالة صيفية ٤', nameEn: 'Summer Look 4', descAr: SUMMER_DESC_AR, descEn: 'New Summer Collection. Beautiful summer design.', price: 660, compare: 820, stock: 18, featured: false, cat: 'summer', imgs: [`${CDN}/products/p15.jpg`] },

    // Cardigan Collection 2026 (2 products)
    { nameAr: 'كارديجان كولكشن ٢٠٢٦', nameEn: 'Cardigan Collection 2026', descAr: CARDIGAN_DESC_AR, descEn: 'Cardigan Collection 2026. Luxurious cardigan with modern designs.', price: 450, compare: 600, stock: 35, featured: true, cat: 'cardigan', imgs: [`${CDN}/products/p08.jpg`] },
    { nameAr: 'كارديجان أنيق ٢٠٢٦', nameEn: 'Elegant Cardigan 2026', descAr: CARDIGAN_DESC_AR, descEn: 'Cardigan Collection 2026. Cozy and stylish.', price: 480, compare: 620, stock: 28, featured: false, cat: 'cardigan', imgs: [`${CDN}/products/p16.jpg`] },

    // Winter Collection 2026 — كولكشن الشتاء (5 products)
    { nameAr: 'عباية شتاء فاخرة ١', nameEn: 'Luxury Winter Abaya 1', descAr: WINTER_DESC_AR, descEn: 'Winter Collection 2026. Premium quality for cold days.', price: 980, compare: 1200, stock: 15, featured: true, cat: 'winter', imgs: [`${CDN}/products/p17.jpg`] },
    { nameAr: 'عباية شتاء فاخرة ٢', nameEn: 'Luxury Winter Abaya 2', descAr: WINTER_DESC_AR, descEn: 'Winter Collection 2026. Warm and elegant.', price: 920, compare: 1150, stock: 12, featured: true, cat: 'winter', imgs: [`${CDN}/products/p18.jpg`] },
    { nameAr: 'عباية شتاء فاخرة ٣', nameEn: 'Luxury Winter Abaya 3', descAr: WINTER_DESC_AR, descEn: 'Winter Collection 2026. Sophisticated winter style.', price: 860, compare: null, stock: 20, featured: false, cat: 'winter', imgs: [`${CDN}/products/p19.jpg`] },
    { nameAr: 'عباية شتاء فاخرة ٤', nameEn: 'Luxury Winter Abaya 4', descAr: WINTER_DESC_AR, descEn: 'Winter Collection 2026. Classic and timeless.', price: 1050, compare: 1300, stock: 8, featured: false, cat: 'winter', imgs: [`${CDN}/products/p20.jpg`] },
    { nameAr: 'عباية شتاء فاخرة ٥', nameEn: 'Luxury Winter Abaya 5', descAr: WINTER_DESC_AR, descEn: 'Winter Collection 2026. Ultimate luxury for winter.', price: 1100, compare: 1350, stock: 10, featured: true, cat: 'winter', imgs: [`${CDN}/products/p21.jpg`] },
  ]

  for (const p of products) {
    await query(`
      INSERT INTO "Product" (id, "nameAr", "nameEn", "descriptionAr", "descriptionEn", price, "comparePrice", stock, images, featured, active, "categoryId", "createdAt", "updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,NOW(),NOW())
    `, [cuid(), p.nameAr, p.nameEn, p.descAr, p.descEn, p.price, p.compare, p.stock, p.imgs, p.featured, catIds[p.cat]])
  }
  console.log(`✓ ${products.length} products created`)

  // Banners
  await query(`DELETE FROM "Banner"`)
  const banners = [
    { titleAr: 'زهرة الخليج | Zahret Elkhaleel', titleEn: 'Zahret Elkhaleel', subtitleAr: 'Designed to Define ✨ — Proudly Egyptian Brand', image: `${CDN}/banners/banner1.jpg`, link: '/products', sort: 0 },
    { titleAr: 'كولكشن العيد الجديد 🤩', titleEn: 'New Eid Collection', subtitleAr: 'متوفر الأن — شحن لجميع المحافظات | ٠١٠٠٢٠٠١٤٤٦', image: `${CDN}/banners/banner2.jpg`, link: '/products?category=eid', sort: 1 },
  ]
  for (const b of banners) {
    await query(`
      INSERT INTO "Banner" (id, "titleAr", "titleEn", "subtitleAr", image, link, active, "sortOrder", "createdAt")
      VALUES ($1,$2,$3,$4,$5,$6,true,$7,NOW())
    `, [cuid(), b.titleAr, b.titleEn, b.subtitleAr, b.image, b.link, b.sort])
  }
  console.log('✓ Banners created')

  console.log('\n✅ Database seeded!')
  console.log('   Admin password: 114891')
  console.log(`   ${products.length} products across 4 collections`)
}

main().catch(console.error).finally(() => pool.end())
