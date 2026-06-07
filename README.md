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

## قاعدة البيانات — Neon PostgreSQL

### ما هي Neon؟

[Neon](https://neon.tech) هي قاعدة بيانات PostgreSQL سحابية مجانية. البيانات محفوظة على سيرفراتهم في الإنترنت — لا يوجد سيرفر محلي على الجهاز. الاتصال يتم من خلال رابط (connection string) في متغيرات البيئة.

### أين البيانات؟

كل بيانات المتجر (المنتجات، الطلبات، العملاء، المخزون...) موجودة في قاعدة البيانات على Neon.  
رابط لوحة تحكم Neon: **https://console.neon.tech**

### طريقة 1 — واجهة Neon (الأسهل)

1. افتح **https://console.neon.tech** وسجّل الدخول
2. اختر المشروع `zahrtelkhlig` أو `neondb`
3. من القائمة الجانبية اختر **"Tables"** لرؤية جميع الجداول بشكل مرئي
4. اضغط على أي جدول (مثلاً `Product`) لعرض الصفوف مباشرةً
5. يمكن تشغيل استعلامات SQL من تبويب **"SQL Editor"**

```sql
-- عرض جميع المنتجات
SELECT id, "nameAr", price, stock, active FROM "Product" ORDER BY "createdAt" DESC;

-- عرض الطلبات الأخيرة
SELECT "orderNumber", "customerName", total, status, "createdAt"
FROM "Order" ORDER BY "createdAt" DESC LIMIT 20;

-- عدد المنتجات النشطة
SELECT COUNT(*) FROM "Product" WHERE active = true;

-- عرض المستخدمين
SELECT name, email, role, "createdAt" FROM "User" ORDER BY "createdAt" DESC;
```

### طريقة 2 — Prisma Studio (واجهة محلية)

من مجلد المشروع على الـ VPS:

```bash
cd /home/sherif/sites/zahrtelkhlig
npx prisma studio
```

يفتح تلقائياً على **http://localhost:5555** — واجهة جرافيكية كاملة لتصفح وتعديل جميع الجداول.  
يُغلق بـ `Ctrl + C`.

### طريقة 3 — psql (سطر الأوامر)

```bash
psql "postgresql://neondb_owner:npg_3lqxRzQGZU5j@ep-noisy-term-aqh1s64r-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

بعد الاتصال:
```sql
\dt                          -- عرض جميع الجداول
\d "Product"                 -- عرض هيكل جدول المنتجات
SELECT * FROM "Product";     -- عرض جميع المنتجات
\q                           -- خروج
```

### جداول قاعدة البيانات

| الجدول | المحتوى |
|--------|---------|
| `Product` | المنتجات (اسم، سعر، مخزون، صور، مقاسات...) |
| `Order` | الطلبات (رقم الطلب، العميل، المبلغ، الحالة، المصدر) |
| `OrderItem` | تفاصيل كل طلب (المنتج، الكمية، المقاس، اللون) |
| `User` | العملاء والموظفين والأدمن |
| `Category` | أقسام المنتجات |
| `Banner` | بانرات الصفحة الرئيسية |
| `CartItem` | عناصر السلة المحفوظة |
| `Wishlist` | قوائم الأمنيات |
| `SiteSettings` | إعدادات الموقع العامة |

### رابط الاتصال (DATABASE_URL)

الرابط الكامل موجود في:
- ملف `.env.local` على الـ VPS داخل مجلد المشروع
- متغيرات البيئة في لوحة تحكم Vercel → Settings → Environment Variables

الصيغة العامة للرابط:
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

> **تنبيه:** لا تضع رابط الاتصال الحقيقي في أي ملف يُرفع على GitHub — يحتوي على بيانات دخول حساسة.

### حدود الخطة المجانية

| البند | الحد |
|-------|------|
| حجم التخزين | 512 MB |
| الاتصالات المتزامنة | 100 |
| Compute hours | 191.9 ساعة/شهر |
| عدد المشاريع | 1 |

الخطة المجانية كافية تماماً للمتجر في حجمه الحالي والمستقبل القريب.

---

## تخزين الصور — GitHub + jsDelivr CDN

### كيف يعمل النظام؟

الصور **لا تُحفظ في قاعدة البيانات** — بل تُحفظ كملفات مباشرةً داخل الـ GitHub repository تحت `public/images/`، وتُقدَّم عبر **jsDelivr** وهي شبكة CDN سريعة ومجانية تعكس محتوى GitHub.

```
رفع صورة من Admin  →  GitHub API  →  ملف في الـ Repo
                                           ↓
عرض الصورة في الموقع  ←  jsDelivr CDN  ←  GitHub
```

### رابط الصور

```
https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/{folder}/{filename}
```

**المجلدات:**
- `public/images/products/` — صور المنتجات (حالياً 147 صورة)
- `public/images/categories/` — صور الأقسام
- `public/images/banners/` — صور البانرات

### هل هو مجاني؟ وهل سيحتمل الصور المستقبلية؟

| البند | الحد | الوضع الحالي |
|-------|------|--------------|
| GitHub repo size | تحذير عند 1 GB، حظر عند 5 GB | ~50 MB (آمن جداً) |
| حجم ملف واحد | 100 MB | صور المنتجات ~200–500 KB |
| jsDelivr bandwidth | 50 GB/شهر مجاناً | أقل من 1 GB/شهر |
| التكلفة | **مجاني تماماً** | — |

**الطاقة الاستيعابية:** الـ repo يستطيع استيعاب **2,000–3,000 صورة منتج** بسهولة قبل أن يقترب من حد الـ 1 GB.

**الخلاصة:** النظام الحالي مجاني ومناسب تماماً لحجم المتجر لسنوات قادمة. إذا وصل عدد المنتجات لأكثر من 1,500 وبدأ الـ repo يثقل، يمكن الانتقال وقتها إلى Cloudinary (مجاني حتى 25 GB).

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

يعمل على: **http://localhost:3001**

---

## متغيرات البيئة المطلوبة

| المتغير | الوصف |
|---------|-------|
| `DATABASE_URL` | رابط اتصال Neon PostgreSQL (انظر قسم قاعدة البيانات أعلاه) |
| `SESSION_SECRET` | مفتاح تشفير الجلسات — أي نص عشوائي 32+ حرف |
| `GITHUB_TOKEN` | GitHub Personal Access Token — لرفع وحذف الصور عبر API |

### كيف تحصل على GITHUB_TOKEN؟

1. افتح **https://github.com/settings/tokens**
2. اضغط **"Generate new token (classic)"**
3. اختر صلاحية **`repo`** فقط
4. انسخ التوكن وضعه في متغيرات Vercel

---

## النشر على Vercel

المشروع ينشر تلقائياً عند أي `git push` على branch `main`.

**لنشر يدوي:**
```bash
vercel --prod --yes
```

**متغيرات البيئة على Vercel:**  
من لوحة تحكم Vercel → Settings → Environment Variables، أضف:
- `DATABASE_URL`
- `SESSION_SECRET`
- `GITHUB_TOKEN`
