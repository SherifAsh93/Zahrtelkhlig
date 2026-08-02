# Development Workflow

## Environment Variables

Create a `.env.local` file in the project root (never commit this file):

```env
# Required: Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"

# Required: JWT signing secret (minimum 32 chars, use a strong random string)
SESSION_SECRET="your-long-random-secret-here-at-least-32-chars"

# Required for image uploads and media management
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Optional: used for og:url and canonical links
NEXT_PUBLIC_SITE_URL="https://zahrtelkhlig.vercel.app"
```

**SESSION_SECRET**: Must be at least 32 characters. Generate with:
```bash
openssl rand -base64 32
```

**GITHUB_TOKEN**: Personal access token with `repo` scope on `SherifAsh93/Zahrtelkhlig`. Used for:
- Image upload: `POST /api/admin/upload`
- Image deletion: `DELETE /api/admin/media`

**ADMIN_PASSWORD**: NOT an env variable. Hardcoded as `"12311"` in `src/app/actions/auth.ts`. To change it, edit the string directly in two places: the `adminLogin` action and the `posLogin` action (for the admin username path).

**Owner password**: Stored in `SiteSettings` table with key `"owner_password"`. Default is `"ashraf2024"` if the key does not exist. To change it, update the DB directly or add an admin UI for it.

---

## Local Setup

```bash
# Clone and install
git clone https://github.com/SherifAsh93/Zahrtelkhlig.git
cd Zahrtelkhlig
npm install

# Set up environment
cp .env.example .env.local  # if .env.example exists, else create manually
# Fill in DATABASE_URL and SESSION_SECRET at minimum

# Sync database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
# → http://localhost:3000
```

The build script (`prisma generate && prisma db push --accept-data-loss && next build`) handles schema sync automatically on Vercel. For local dev, run `prisma db push` manually after schema changes.

---

## Prisma Workflow

### After schema changes
```bash
# Apply changes to local/Neon database
npx prisma db push

# Regenerate TypeScript types
npx prisma generate
```

Always run `prisma generate` after schema changes, otherwise TypeScript will error on new model fields.

### Inspect the database
```bash
npx prisma studio
# → Opens at http://localhost:5555
```

### Run seed scripts
```bash
# Full seed (TypeScript, requires ts-node)
npm run seed

# Categories only
node prisma/seed-categories.cjs
```

### Database reset (destructive)
```bash
npx prisma db push --force-reset
# Drops all tables and recreates schema
```

---

## Vercel Deployment

**Environment variables on Vercel**: Set `DATABASE_URL`, `SESSION_SECRET`, and `GITHUB_TOKEN` in the Vercel project settings under Environment Variables. Set for all environments (Production, Preview, Development).

**Build command** (set automatically via package.json): `prisma generate && prisma db push --accept-data-loss && next build`

**Output directory**: `.next` (Next.js default)

**Framework preset**: Next.js (auto-detected by Vercel)

**Serverless**: All API routes and pages run as Vercel Functions (serverless). Connection pooling is handled by Neon's built-in pooler.

**Deploy from CLI**:
```bash
npm install -g vercel
vercel --prod
```

**Preview deployments**: Push to any non-main branch creates a preview URL automatically.

---

## How to Add a New User Role

1. Add the role to the `Role` enum in `prisma/schema.prisma`:
```prisma
enum Role {
  USER
  STAFF
  OWNER
  ADMIN
  MANAGER  // new role
}
```

2. Run `prisma db push` and `prisma generate`.

3. Decide which dashboard this role accesses. Create a new layout with the appropriate session guard:
```typescript
// src/app/manager/layout.tsx
import { getSession } from '@/lib/session'

export default async function ManagerLayout({ children }) {
  const session = await getSession()
  if (!session || session.role !== 'MANAGER') {
    return <ManagerLoginView />
  }
  return <>{children}</>
}
```

4. Add a login server action in `src/app/actions/auth.ts` following the `posLogin` pattern.

5. Add API routes under `/api/manager/` with appropriate guards.

6. Allow admin to set the role via `src/app/api/admin/users/[id]/route.ts` (already supports arbitrary role strings).

---

## How to Add a New Payment Method

1. Add to the `PaymentMethod` enum in `prisma/schema.prisma`:
```prisma
enum PaymentMethod {
  CASH_ON_DELIVERY
  VODAFONE_CASH
  INSTAPAY
  BANK_TRANSFER
  FAWRY        // new method
}
```

2. Run `prisma db push` and `prisma generate`.

3. Add the option to the checkout form's payment method selector in `src/app/(store)/checkout/CheckoutForm.tsx`.

4. Display payment instructions on the order confirmation page in `src/app/(store)/orders/[id]/page.tsx`. Add the FAWRY payment number/instructions in `src/lib/utils.ts`.

5. Update the admin order list to display the new method name in Arabic (add to any translation maps in admin UI components).

No changes needed to the `createOrder` server action — it accepts any `PaymentMethod` enum value.

---

## How to Add a New Homepage Section Type

1. Define the new section's type interface in `src/lib/homepage.ts`:
```typescript
export interface SectionAnnouncement {
  enabled: boolean
  text: string
  link: string
}
```

2. Add it to the `HomepageConfig.sections` object:
```typescript
export interface HomepageConfig {
  // ...
  sections: {
    // existing sections...
    announcement: SectionAnnouncement  // new
  }
}
```

3. Add the default config:
```typescript
export const DEFAULT_CONFIG: HomepageConfig = {
  // ...
  sections: {
    // ...
    announcement: { enabled: false, text: '', link: '' }
  }
}
```

4. Add the section key to `sectionsOrder` defaults if it should appear by default.

5. Add a label to `SECTION_LABELS`:
```typescript
export const SECTION_LABELS = {
  // ...
  announcement: 'إعلان مميز',
}
```

6. Create the section React component in `src/components/store/`.

7. Add a `case` for the new section type in the homepage page renderer (`src/app/(store)/page.tsx`).

8. Add UI controls for the new section in `src/app/admin/homepage/HomepageSettingsForm.tsx`.

---

## How to Create Staff Accounts

**Via admin UI** (`/admin/users`):
1. Log into admin with password `12311`
2. Navigate to Users
3. Click "إضافة موظف" (Add Staff)
4. Fill: name (Arabic), username (lowercase alphanumeric + underscore), password (min 6 chars)

**Via API** (for programmatic creation):
```bash
curl -X POST https://zahrtelkhlig.vercel.app/api/admin/staff \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_ADMIN_JWT" \
  -d '{"name":"محمد أحمد","username":"mohamed_ahmed","password":"secure123"}'
```

Staff login at `/pos`:
- Username: the username field (e.g., `mohamed_ahmed`)
- Password: the password set at creation

Staff accounts cannot access `/admin`. They can only access `/pos`.

---

## Troubleshooting

### Cold Start Delays
**Symptom**: First request after inactivity takes 2-5 seconds.  
**Cause**: Neon PostgreSQL serverless auto-suspends after 5 minutes of inactivity. Cold start includes re-establishing the connection.  
**Resolution**: This is expected and acceptable. No code change needed. Consider Neon Pro plan to disable auto-suspend for higher-traffic scenarios.

### Stock Sync Issues
**Symptom**: `product.stock` shows incorrect total vs. sum of `variants[].qty`.  
**Cause**: Manual DB edits, or a partial write that updated `variants` but not `stock`.  
**Resolution**: Trigger a save on the product from the admin edit page — this recalculates `stock` from `variants` or `sizeStock`. Alternatively, run a direct DB update:
```sql
-- For variant products, recalculate from variants JSON
UPDATE "Product"
SET stock = (
  SELECT SUM((elem->>'qty')::int)
  FROM jsonb_array_elements(variants::jsonb) AS elem
)
WHERE variants IS NOT NULL;
```

### Session Conflicts
**Symptom**: Admin is logged out unexpectedly, or shows wrong role.  
**Cause**: Two separate cookies (`session` and `admin_session`). The `session` cookie may belong to a STAFF login (from POS) while the `admin_session` is expired.  
**Resolution**: The admin layout only checks `admin_session`. The store layout only checks `session`. They are independent. If confused: clear all cookies and re-login.

### `admin_session` Expiry During Long Sessions
**Symptom**: Admin dashboard shows login screen after 8 hours without page refresh.  
**Cause**: `admin_session` has an 8-hour maxAge. There is no refresh mechanism.  
**Resolution**: Admin logs in again. Acceptable for current scale. If this is frequently disruptive, extend maxAge in `createAdminSession()` to `60 * 60 * 24` (24 hours).

### Image Upload Failures
**Symptom**: Upload returns `500 GitHub upload failed`.  
**Cause**: `GITHUB_TOKEN` is missing, expired, or lacks `repo` scope.  
**Resolution**: Verify `GITHUB_TOKEN` is set in Vercel environment variables. Generate a new PAT at GitHub → Settings → Developer settings → Personal access tokens. Ensure `repo` scope is checked.

### `prisma generate` Not Running on Vercel
**Symptom**: Build fails with "Cannot find module '@/generated/prisma/client'".  
**Cause**: The generated client is not committed to the repo and must be generated during build.  
**Resolution**: Ensure the build command is `prisma generate && prisma db push --accept-data-loss && next build`. Check Vercel project settings → Settings → General → Build Command.

### Homepage Not Updating After Config Save
**Symptom**: Admin saves homepage config, but the live site still shows old sections.  
**Cause**: `revalidatePath('/')` clears Next.js cache, but browser-cached versions may still be served by CDN.  
**Resolution**: Wait 60 seconds for Vercel's edge cache to expire, or add a `Cache-Control: no-store` header to the homepage route. The `revalidatePath` call is verified to work correctly for subsequent server renders.

### Database Schema Out of Sync
**Symptom**: Prisma throws `Unknown field` or `Invalid value` errors in production.  
**Cause**: Schema was changed but `db push` was not run (e.g., build failed early).  
**Resolution**: Trigger a new Vercel deployment. The build script runs `db push` before `next build`. Or run manually:
```bash
npx prisma db push --accept-data-loss
```
