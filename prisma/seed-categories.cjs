const { Pool } = require('pg')
const { randomUUID } = require('crypto')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const categories = [
  // Permanent
  { nameAr: 'فيست',      nameEn: 'Vest',           slug: 'vest',          seasonal: false, sortOrder: 1 },
  { nameAr: 'سويت',      nameEn: 'Suit',           slug: 'suit',          seasonal: false, sortOrder: 2 },
  { nameAr: 'عباية',     nameEn: 'Abaya',          slug: 'abaya',         seasonal: false, sortOrder: 3 },
  { nameAr: 'كارديجان',  nameEn: 'Cardigan',       slug: 'cardigan',      seasonal: false, sortOrder: 4 },
  { nameAr: 'قميص طويل', nameEn: 'Long Chemise',   slug: 'long-chemise',  seasonal: false, sortOrder: 5 },
  { nameAr: 'قميص قصير', nameEn: 'Short Chemise',  slug: 'short-chemise', seasonal: false, sortOrder: 6 },
  // Seasonal
  { nameAr: 'كولكشن الصيف',  nameEn: 'Summer Collection', slug: 'summer',  seasonal: true, sortOrder: 10 },
  { nameAr: 'كولكشن الشتاء', nameEn: 'Winter Collection', slug: 'winter',  seasonal: true, sortOrder: 11 },
  { nameAr: 'كولكشن العيد',  nameEn: 'Eid Collection',    slug: 'eid',     seasonal: true, sortOrder: 12 },
]

async function run() {
  const client = await pool.connect()
  try {
    for (const cat of categories) {
      await client.query(
        `INSERT INTO "Category" (id, "nameAr", "nameEn", slug, seasonal, "sortOrder")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE SET
           "nameAr"     = EXCLUDED."nameAr",
           "nameEn"     = EXCLUDED."nameEn",
           seasonal     = EXCLUDED.seasonal,
           "sortOrder"  = EXCLUDED."sortOrder"`,
        [randomUUID(), cat.nameAr, cat.nameEn, cat.slug, cat.seasonal, cat.sortOrder]
      )
      console.log(`  ✓ ${cat.nameAr}`)
    }
    console.log('Categories seeded successfully.')
  } finally {
    client.release()
    await pool.end()
  }
}

run().catch((err) => { console.error(err); process.exit(1) })
