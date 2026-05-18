import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const bcrypt = require('bcryptjs')
const pg = require('pg')
const { Pool } = pg

const pool = new Pool({
  connectionString: 'postgresql://zahruser:zahrpass2024@localhost:5432/zahrtelkhlig?schema=public'
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
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 10)
  return `c${timestamp}${randomPart}`
}

async function main() {
  console.log('Seeding database...')

  // Admin user
  const adminPass = await bcrypt.hash('114891', 12)
  await query(`
    INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, 'ADMIN', NOW(), NOW())
    ON CONFLICT (email) DO NOTHING
  `, [cuid(), 'admin@zahrtelkhlig.com', adminPass, 'مدير المتجر'])
  console.log('✓ Admin: admin@zahrtelkhlig.com / 114891')

  // Categories
  const categories = [
    { nameAr: 'عبايات', nameEn: 'Abayas', slug: 'abaya' },
    { nameAr: 'فساتين', nameEn: 'Dresses', slug: 'dress' },
    { nameAr: 'قفاطين', nameEn: 'Kaftans', slug: 'kaftan' },
    { nameAr: 'جلابيب', nameEn: 'Jilbabs', slug: 'jilbab' },
    { nameAr: 'إكسسوارات', nameEn: 'Accessories', slug: 'accessories' },
    { nameAr: 'بلوزات', nameEn: 'Blouses', slug: 'blouse' },
  ]

  const catIds = {}
  for (const cat of categories) {
    const id = cuid()
    await query(`
      INSERT INTO "Category" (id, "nameAr", "nameEn", slug)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (slug) DO UPDATE SET "nameAr" = $2, "nameEn" = $3
      RETURNING id
    `, [id, cat.nameAr, cat.nameEn, cat.slug])
    const result = await query(`SELECT id FROM "Category" WHERE slug = $1`, [cat.slug])
    catIds[cat.slug] = result.rows[0].id
  }
  console.log('✓ Categories created')

  // Products
  const products = [
    { nameAr: 'عباية سوداء كلاسيكية', nameEn: 'Classic Black Abaya', descAr: 'عباية سوداء أنيقة من أجود أنواع القماش الكريب، مناسبة لجميع المناسبات، تتميز بتطريز ذهبي خفيف على الأكمام.', descEn: 'Elegant black abaya in finest crepe fabric.', price: 350, comparePrice: 450, stock: 25, featured: true, cat: 'abaya' },
    { nameAr: 'عباية مطرزة فاخرة', nameEn: 'Luxury Embroidered Abaya', descAr: 'عباية فاخرة مطرزة بالخيوط الفضية، تعطي إطلالة ملكية في المناسبات الرسمية.', descEn: 'Luxury abaya with silver embroidery.', price: 550, comparePrice: 700, stock: 15, featured: true, cat: 'abaya' },
    { nameAr: 'فستان سهرة أنيق', nameEn: 'Elegant Evening Dress', descAr: 'فستان سهرة طويل من قماش الساتان، يتميز بقصة واسعة وألوان زاهية مناسبة للأفراح والمناسبات.', descEn: 'Long evening dress in satin fabric.', price: 480, comparePrice: null, stock: 20, featured: true, cat: 'dress' },
    { nameAr: 'فستان كاجوال يومي', nameEn: 'Casual Daily Dress', descAr: 'فستان عملي للاستخدام اليومي من قماش مريح، متعدد الألوان.', descEn: 'Practical daily dress in comfortable fabric.', price: 220, comparePrice: 280, stock: 35, featured: false, cat: 'dress' },
    { nameAr: 'قفطان مغربي أصيل', nameEn: 'Authentic Moroccan Kaftan', descAr: 'قفطان مغربي أصيل بتطريز يدوي دقيق، مناسب للمناسبات والأعياد.', descEn: 'Authentic Moroccan kaftan with hand embroidery.', price: 650, comparePrice: 800, stock: 10, featured: true, cat: 'kaftan' },
    { nameAr: 'جلباب محتشم أنيق', nameEn: 'Modest Elegant Jilbab', descAr: 'جلباب محتشم وأنيق للمرأة المسلمة، مصنوع من قماش عالي الجودة.', descEn: 'Modest jilbab for Muslim women.', price: 290, comparePrice: null, stock: 30, featured: false, cat: 'jilbab' },
    { nameAr: 'بلوزة حرير فاخرة', nameEn: 'Luxury Silk Blouse', descAr: 'بلوزة من الحرير الطبيعي الفاخر، تناسب المناسبات الرسمية.', descEn: 'Natural silk blouse for formal occasions.', price: 180, comparePrice: 220, stock: 40, featured: false, cat: 'blouse' },
    { nameAr: 'إيشارب كريب أنيق', nameEn: 'Elegant Crepe Scarf', descAr: 'إيشارب كريب فاخر بألوان متنوعة، خفيف ومريح للارتداء اليومي.', descEn: 'Luxury crepe scarf in various colors.', price: 85, comparePrice: null, stock: 60, featured: false, cat: 'accessories' },
    { nameAr: 'عباية سوداء بحزام', nameEn: 'Black Abaya with Belt', descAr: 'عباية سوداء عصرية مع حزام رفيع يبرز الخصر، تمنح إطلالة عصرية وأنيقة.', descEn: 'Modern black abaya with waist belt.', price: 420, comparePrice: 520, stock: 18, featured: true, cat: 'abaya' },
    { nameAr: 'فستان زهري رومانسي', nameEn: 'Romantic Pink Dress', descAr: 'فستان زهري رومانسي من الشيفون الخفيف، مناسب للخروجات والمناسبات الخاصة.', descEn: 'Romantic pink chiffon dress for special occasions.', price: 320, comparePrice: 400, stock: 22, featured: false, cat: 'dress' },
  ]

  for (const p of products) {
    const id = cuid()
    await query(`
      INSERT INTO "Product" (id, "nameAr", "nameEn", "descriptionAr", "descriptionEn", price, "comparePrice", stock, images, featured, active, "categoryId", "createdAt", "updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,NOW(),NOW())
      ON CONFLICT DO NOTHING
    `, [id, p.nameAr, p.nameEn, p.descAr, p.descEn, p.price, p.comparePrice, p.stock, '{}', p.featured, catIds[p.cat]])
  }
  console.log('✓ Products created')

  // Banners
  await query(`
    INSERT INTO "Banner" (id, "titleAr", "titleEn", "subtitleAr", image, link, active, "sortOrder", "createdAt")
    VALUES ($1,$2,$3,$4,$5,$6,true,0,NOW()), ($7,$8,$9,$10,$11,$12,true,1,NOW())
    ON CONFLICT DO NOTHING
  `, [
    cuid(), 'زهرة الخليج للأزياء النسائية', 'Zahrtelkhlig Fashion', 'أجمل العبايات والفساتين بأسعار مناسبة', `${CDN}/banners/banner1.jpg`, '/products',
    cuid(), 'عروض الموسم الجديد', 'New Season Offers', 'خصومات تصل إلى 30%', `${CDN}/banners/banner2.jpg`, '/products?featured=true'
  ])
  console.log('✓ Banners created')

  console.log('\n✅ Database seeded!')
  console.log('Admin: admin@zahrtelkhlig.com / 114891')
}

main().catch(console.error).finally(() => pool.end())
