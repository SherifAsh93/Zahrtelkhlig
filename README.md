# زهرة الخليج — متجر الأزياء النسائية

متجر إلكتروني متكامل للأزياء النسائية مبني بـ Next.js 16، TypeScript، TailwindCSS، PostgreSQL، و Prisma.

---

## المميزات

### الموقع (العملاء)
- واجهة عربية RTL كاملة
- تسجيل / دخول / خروج مع JWT (jose)
- ملف المستخدم الشخصي
- سلة تسوق (Zustand + localStorage)
- قائمة الأمنيات
- صفحة المنتجات مع فلترة وبحث
- تفاصيل المنتج مع اختيار المقاس واللون
- نظام الطلبات والدفع (فودافون كاش / انستاباي)
- تتبع الطلبات

### لوحة التحكم (`/admin`)
- إحصائيات فورية وطلبات حديثة
- إدارة المنتجات (إضافة / تعديل / حذف جماعي)
- إدارة الطلبات مع تغيير الحالة
- إدارة المخزون بتحكم تفصيلي
- إدارة المستخدمين والموظفين
- إدارة الأقسام والبانرات وإعدادات الصفحة الرئيسية
- مكتبة الصور — عرض وحذف ورفع متعدد بالسحب والإفلات
- تقارير يومية مفصلة (أونلاين vs محل)

### نقطة البيع (`/pos`)
- واجهة بسيطة للموظفين
- بحث بالمنتج وتحديد المقاس
- خصم المخزون مباشرة من قاعدة البيانات
- طباعة إيصال

### لوحة المالك (`/owner`)
- وصول مفتوح بدون كلمة مرور
- KPI cards: اليوم / الأسبوع / الشهر / الكل
- مخطط مبيعات 30 يوم
- توزيع المبيعات (أونلاين vs محل)
- أكثر المنتجات مبيعاً
- تنبيهات المخزون المنخفض
- نشاط حديث: آخر الطلبات والعملاء وتنبيهات الستوك
- تحديث تلقائي كل 5 دقائق

---

## التقنيات

| التقنية | الاستخدام |
|---------|-----------|
| Next.js 16 (App Router) | إطار العمل |
| TypeScript 5 | لغة البرمجة |
| TailwindCSS 4 | التصميم |
| PostgreSQL (Neon) | قاعدة البيانات |
| Prisma 7 | ORM |
| Jose | JWT Sessions |
| Zustand 5 | إدارة السلة |
| Lucide React | الأيقونات |
| GitHub + jsDelivr CDN | تخزين وتقديم الصور |

---

## الصور

الصور مخزنة داخل الـ repo وتُقدَّم عبر jsDelivr CDN:

```
https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/{folder}/{filename}
```

المجلدات:
- `public/images/products/` — صور المنتجات
- `public/images/categories/` — صور الأقسام
- `public/images/banners/` — صور البانرات

---

## التشغيل المحلي

```bash
git clone https://github.com/SherifAsh93/Zahrtelkhlig.git
cd Zahrtelkhlig
npm install
cp .env.example .env.local
# عدّل DATABASE_URL و SESSION_SECRET و GITHUB_TOKEN
npx prisma generate
npx prisma db push
npm run dev
```

---

## متغيرات البيئة المطلوبة

| المتغير | الوصف |
|---------|-------|
| `DATABASE_URL` | رابط اتصال Neon PostgreSQL |
| `SESSION_SECRET` | مفتاح تشفير الجلسات (32+ حرف) |
| `GITHUB_TOKEN` | Personal Access Token لرفع وحذف الصور |
