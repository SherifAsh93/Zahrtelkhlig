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
  console.log('✓ Admin: admin@zahrtelkhlig.com / 114891')

  // Categories — no createdAt/updatedAt columns in DB
  const categories = [
    { nameAr: 'كولكشن العيد', nameEn: 'Eid Collection', slug: 'eid', image: `${CDN}/categories/logo.jpg` },
    { nameAr: 'كولكشن الصيف', nameEn: 'Summer Collection', slug: 'summer', image: `${CDN}/categories/logo.jpg` },
    { nameAr: 'كارديجان', nameEn: 'Cardigan', slug: 'cardigan', image: `${CDN}/categories/logo.jpg` },
    { nameAr: 'عبايات', nameEn: 'Abayas', slug: 'abaya', image: `${CDN}/categories/logo.jpg` },
    { nameAr: 'فساتين', nameEn: 'Dresses', slug: 'dress', image: `${CDN}/categories/logo.jpg` },
    { nameAr: 'إكسسوارات', nameEn: 'Accessories', slug: 'accessories', image: `${CDN}/categories/logo.jpg` },
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

  // Products with real Instagram photos
  const products = [
    // Eid Collection — كولكشن العيد
    {
      nameAr: 'طقم عيد أنيق',
      nameEn: 'Elegant Eid Set',
      descAr: 'New Eid Collection ✨\nمتوفر الأن كولكشن العيد 🤩\nتصميم راقي وأنيق مناسب لإطلالات العيد\nللطلبات: 01002001446\nمتوفر الشحن داخل وخارج دمياط',
      descEn: 'New Eid Collection. Elegant and sophisticated design for Eid.',
      price: 850, compare: 1100, stock: 15, featured: true, cat: 'eid',
      imgs: [`${CDN}/products/p01.jpg`]
    },
    {
      nameAr: 'فستان عيد فاخر',
      nameEn: 'Luxury Eid Dress',
      descAr: 'New Eid Collection ✨\nمتوفر الأن كولكشن العيد 🤩\nخامة فاخرة وتصميم عصري يليق بك في العيد\nللطلبات: 01002001446',
      descEn: 'Luxury Eid Collection. Premium fabric with modern design.',
      price: 950, compare: 1200, stock: 12, featured: true, cat: 'eid',
      imgs: [`${CDN}/products/p02.jpg`]
    },
    {
      nameAr: 'إطلالة عيد مميزة',
      nameEn: 'Special Eid Look',
      descAr: 'New Eid Collection ✨\nكولكشن العيد الجديد — تصاميم حصرية\nعنوان الفرع: دمياط - كورنيش النيل - ميدان الساعة\nللطلبات: 01002001446',
      descEn: 'New Eid Collection. Exclusive designs for a stunning Eid look.',
      price: 780, compare: null, stock: 20, featured: false, cat: 'eid',
      imgs: [`${CDN}/products/p03.jpg`]
    },
    // Summer Collection — كولكشن الصيف
    {
      nameAr: 'فستان صيف خفيف',
      nameEn: 'Light Summer Dress',
      descAr: 'New Summer Collection ✨\nمتوفر الأن كولكشن الصيف 🤩\nخامة مريحة تناسب الجو الحار\nللطلبات: 01002001446\nمتوفر الشحن داخل وخارج دمياط',
      descEn: 'New Summer Collection. Comfortable fabric for hot weather.',
      price: 650, compare: 850, stock: 25, featured: true, cat: 'summer',
      imgs: [`${CDN}/products/p04.jpg`]
    },
    {
      nameAr: 'طقم صيفي أنيق',
      nameEn: 'Elegant Summer Set',
      descAr: 'New Summer Collection ✨\nأناقة وراحة في آنٍ واحد مع كولكشن الصيف\nمواعيد العمل: من ١١ صباحًا حتي ١٢ مساءً\nللطلبات: 01002001446',
      descEn: 'New Summer Collection. Elegance and comfort in one outfit.',
      price: 720, compare: 900, stock: 18, featured: false, cat: 'summer',
      imgs: [`${CDN}/products/p05.jpg`]
    },
    {
      nameAr: 'تونيك صيف عصري',
      nameEn: 'Modern Summer Tunic',
      descAr: 'New Summer Collection ✨\nكولكشن الصيف الجديد 🌸\nتصميم عصري لإطلالة صيفية مثالية\nللطلبات: 01002001446',
      descEn: 'New Summer Collection. Modern design for a perfect summer look.',
      price: 580, compare: null, stock: 30, featured: false, cat: 'summer',
      imgs: [`${CDN}/products/p06.jpg`]
    },
    {
      nameAr: 'فستان ماكسي صيف',
      nameEn: 'Summer Maxi Dress',
      descAr: 'New Summer Collection ✨\nفستان ماكسي أنيق مناسب لجميع المناسبات\nعنوان الفرع: دمياط - كورنيش النيل - ميدان الساعة - بجوار سليب هاي',
      descEn: 'Summer Maxi Dress. Elegant for all occasions.',
      price: 690, compare: 850, stock: 22, featured: true, cat: 'summer',
      imgs: [`${CDN}/products/p07.jpg`]
    },
    // Cardigan Collection 2026
    {
      nameAr: 'كارديجان كولكشن ٢٠٢٦',
      nameEn: 'Cardigan Collection 2026',
      descAr: '✨ Cardigan Collection ✨\nمتوفر الأن كولكشن كارديجان ٢٠٢٦ 🤗\nتصاميم عصرية وخامات راقية\nللطلبات: 01002001446\nمتوفر الشحن داخل وخارج دمياط',
      descEn: 'Cardigan Collection 2026. Luxurious cardigan with modern designs.',
      price: 450, compare: 600, stock: 35, featured: true, cat: 'cardigan',
      imgs: [`${CDN}/products/p08.jpg`]
    },
  ]

  for (const p of products) {
    await query(`
      INSERT INTO "Product" (id, "nameAr", "nameEn", "descriptionAr", "descriptionEn", price, "comparePrice", stock, images, featured, active, "categoryId", "createdAt", "updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,NOW(),NOW())
    `, [cuid(), p.nameAr, p.nameEn, p.descAr, p.descEn, p.price, p.compare, p.stock, p.imgs, p.featured, catIds[p.cat]])
  }
  console.log(`✓ ${products.length} products created`)

  // Banners — matching the real brand content
  await query(`DELETE FROM "Banner"`)
  const banners = [
    { titleAr: 'زهرة الخليج | Zahret Elkhaleel', titleEn: 'Zahret Elkhaleel', subtitleAr: 'Designed to Define ✨ — Proudly Egyptian Brand Since 2022', image: `${CDN}/banners/banner1.jpg`, link: '/products', sort: 0 },
    { titleAr: 'كولكشن العيد الجديد 🤩', titleEn: 'New Eid Collection', subtitleAr: 'متوفر الأن — شحن لجميع المحافظات | 01002001446', image: `${CDN}/banners/banner2.jpg`, link: '/products?category=eid', sort: 1 },
  ]

  for (const b of banners) {
    await query(`
      INSERT INTO "Banner" (id, "titleAr", "titleEn", "subtitleAr", image, link, active, "sortOrder", "createdAt")
      VALUES ($1,$2,$3,$4,$5,$6,true,$7,NOW())
    `, [cuid(), b.titleAr, b.titleEn, b.subtitleAr, b.image, b.link, b.sort])
  }
  console.log('✓ Banners created')

  console.log('\n✅ Database seeded!')
  console.log('   Admin: admin@zahrtelkhlig.com / 114891')
}

main().catch(console.error).finally(() => pool.end())
