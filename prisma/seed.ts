import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: 'postgresql://zahruser:zahrpass2024@localhost:5432/zahrtelkhlig?schema=public' })
const prisma = new PrismaClient({ adapter })

const categories = [
  { nameAr: 'عبايات', nameEn: 'Abayas', slug: 'abaya' },
  { nameAr: 'فساتين', nameEn: 'Dresses', slug: 'dress' },
  { nameAr: 'قفاطين', nameEn: 'Kaftans', slug: 'kaftan' },
  { nameAr: 'جلابيب', nameEn: 'Jilbabs', slug: 'jilbab' },
  { nameAr: 'إكسسوارات', nameEn: 'Accessories', slug: 'accessories' },
  { nameAr: 'بلوزات', nameEn: 'Blouses', slug: 'blouse' },
]

const CDN = 'https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images'

async function main() {
  console.log('Seeding database...')

  // Admin user
  const adminPassword = await bcrypt.hash('114891', 12)
  await prisma.user.upsert({
    where: { email: 'admin@zahrtelkhlig.com' },
    update: {},
    create: {
      email: 'admin@zahrtelkhlig.com',
      password: adminPassword,
      name: 'مدير المتجر',
      role: 'ADMIN',
    },
  })
  console.log('✓ Admin user created: admin@zahrtelkhlig.com / 114891')

  // Categories
  const createdCats: Record<string, string> = {}
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    createdCats[cat.slug] = c.id
  }
  console.log('✓ Categories created')

  // Sample products
  const products = [
    {
      nameAr: 'عباية سوداء كلاسيكية',
      nameEn: 'Classic Black Abaya',
      descriptionAr: 'عباية سوداء أنيقة من أجود أنواع القماش الكريب، مناسبة لجميع المناسبات، تتميز بتطريز ذهبي خفيف على الأكمام.',
      descriptionEn: 'Elegant black abaya made from finest crepe fabric, suitable for all occasions.',
      price: 350,
      comparePrice: 450,
      stock: 25,
      featured: true,
      categoryId: createdCats['abaya'],
      images: [`${CDN}/products/abaya1.jpg`],
    },
    {
      nameAr: 'عباية مطرزة فاخرة',
      nameEn: 'Luxury Embroidered Abaya',
      descriptionAr: 'عباية فاخرة مطرزة بالخيوط الفضية، تعطي إطلالة ملكية في المناسبات الرسمية.',
      descriptionEn: 'Luxury abaya embroidered with silver threads for royal look.',
      price: 550,
      comparePrice: 700,
      stock: 15,
      featured: true,
      categoryId: createdCats['abaya'],
      images: [`${CDN}/products/abaya2.jpg`],
    },
    {
      nameAr: 'فستان سهرة أنيق',
      nameEn: 'Elegant Evening Dress',
      descriptionAr: 'فستان سهرة طويل من قماش الساتان، يتميز بقصة واسعة وألوان زاهية مناسبة للأفراح والمناسبات.',
      descriptionEn: 'Long evening dress made from satin fabric with wide cut.',
      price: 480,
      comparePrice: null,
      stock: 20,
      featured: true,
      categoryId: createdCats['dress'],
      images: [`${CDN}/products/dress1.jpg`],
    },
    {
      nameAr: 'فستان كاجوال يومي',
      nameEn: 'Casual Daily Dress',
      descriptionAr: 'فستان عملي للاستخدام اليومي من قماش مريح، متعدد الألوان.',
      descriptionEn: 'Practical daily dress in comfortable fabric.',
      price: 220,
      comparePrice: 280,
      stock: 35,
      featured: false,
      categoryId: createdCats['dress'],
      images: [`${CDN}/products/dress2.jpg`],
    },
    {
      nameAr: 'قفطان مغربي أصيل',
      nameEn: 'Authentic Moroccan Kaftan',
      descriptionAr: 'قفطان مغربي أصيل بتطريز يدوي دقيق، مناسب للمناسبات والأعياد.',
      descriptionEn: 'Authentic Moroccan kaftan with fine hand embroidery.',
      price: 650,
      comparePrice: 800,
      stock: 10,
      featured: true,
      categoryId: createdCats['kaftan'],
      images: [`${CDN}/products/kaftan1.jpg`],
    },
    {
      nameAr: 'جلباب محتشم أنيق',
      nameEn: 'Modest Elegant Jilbab',
      descriptionAr: 'جلباب محتشم وأنيق للمرأة المسلمة، مصنوع من قماش عالي الجودة.',
      descriptionEn: 'Modest and elegant jilbab for Muslim women.',
      price: 290,
      comparePrice: null,
      stock: 30,
      featured: false,
      categoryId: createdCats['jilbab'],
      images: [`${CDN}/products/jilbab1.jpg`],
    },
    {
      nameAr: 'بلوزة حرير فاخرة',
      nameEn: 'Luxury Silk Blouse',
      descriptionAr: 'بلوزة من الحرير الطبيعي الفاخر، تناسب المناسبات الرسمية.',
      descriptionEn: 'Natural silk blouse for formal occasions.',
      price: 180,
      comparePrice: 220,
      stock: 40,
      featured: false,
      categoryId: createdCats['blouse'],
      images: [`${CDN}/products/blouse1.jpg`],
    },
    {
      nameAr: 'إيشارب كريب أنيق',
      nameEn: 'Elegant Crepe Scarf',
      descriptionAr: 'إيشارب كريب فاخر بألوان متنوعة، خفيف ومريح للارتداء اليومي.',
      descriptionEn: 'Luxury crepe scarf in various colors.',
      price: 85,
      comparePrice: null,
      stock: 60,
      featured: false,
      categoryId: createdCats['accessories'],
      images: [`${CDN}/products/scarf1.jpg`],
    },
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }
  console.log('✓ Sample products created')

  // Sample banners
  await prisma.banner.createMany({
    data: [
      {
        titleAr: 'زهرة الخليج للأزياء النسائية',
        titleEn: 'Zahrtelkhlig Fashion',
        subtitleAr: 'أجمل العبايات والفساتين بأسعار مناسبة',
        image: `${CDN}/banners/banner1.jpg`,
        link: '/products',
        active: true,
        sortOrder: 0,
      },
      {
        titleAr: 'عروض الموسم الجديد',
        titleEn: 'New Season Offers',
        subtitleAr: 'خصومات تصل إلى 30% على أجمل التصاميم',
        image: `${CDN}/banners/banner2.jpg`,
        link: '/products?featured=true',
        active: true,
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  })
  console.log('✓ Banners created')

  console.log('\n✅ Database seeded successfully!')
  console.log('Admin login: admin@zahrtelkhlig.com / 114891')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
