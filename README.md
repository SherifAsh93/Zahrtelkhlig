# زهرة الخليج — متجر الأزياء النسائية

متجر إلكتروني متكامل للأزياء النسائية مبني بـ Next.js 16، TypeScript، TailwindCSS، PostgreSQL، و Prisma.

## المميزات

- واجهة عربية RTL كاملة مع دعم ثنائي اللغة
- تسجيل / دخول / خروج مع JWT (jose)
- ملف المستخدم الشخصي
- سلة تسوق (Zustand + localStorage)
- قائمة الأمنيات
- صفحة المنتجات مع فلترة وبحث
- تفاصيل المنتج
- نظام الدفع والطلبات
- تتبع الطلبات
- لوحة تحكم ادمن كاملة
- إدارة المنتجات والأقسام والطلبات والمستخدمين والبانرات
- تخزين الصور عبر GitHub + jsDelivr CDN

## التقنيات

| التقنية | الاستخدام |
|---------|-----------|
| Next.js 16 (App Router) | إطار العمل |
| TypeScript | لغة البرمجة |
| TailwindCSS 4 | التصميم |
| PostgreSQL | قاعدة البيانات |
| Prisma 7 | ORM |
| Jose | JWT Sessions |
| Zustand | إدارة السلة |
| Lucide React | الأيقونات |

## التشغيل المحلي

```bash
# 1. نسخ المشروع
git clone https://github.com/SherifAsh93/Zahrtelkhlig.git
cd Zahrtelkhlig

# 2. تثبيت المكتبات
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env
# عدّل DATABASE_URL و SESSION_SECRET

# 4. إنشاء قاعدة البيانات
npx prisma migrate dev

# 5. تشغيل البيانات الأولية
node prisma/seed.mjs

# 6. تشغيل السيرفر
npm run dev
```

## بيانات الدخول الافتراضية

- **المدير:** admin@zahrtelkhlig.com / 114891
- **لوحة التحكم:** /admin

## إضافة صور المنتجات

ارفعي الصور في مسارات:
- `public/images/products/` — صور المنتجات
- `public/images/categories/` — صور الأقسام
- `public/images/banners/` — صور البانرات

ثم استخدمي رابط jsDelivr CDN:
```
https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/products/filename.jpg
```
