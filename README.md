# ZoZo · Mongolian E-Commerce

Цэвэр Next.js дээр угсарсан, Монгол хэлээр ажилладаг, COD (авахдаа төлөх) худалдаа авах сайт. Facebook boost-той зар шууд барааны хуудас руу үсэрч, нэг хуудаснаас захиалга үүсгэдэг.

## Боломжууд

- **Storefront** — Нүүр, бараа, ангилал (filter/sort), барааны дэлгэрэнгүй (gallery + bundle selector + "How to use" accordion)
- **Cart** — Zustand store, localStorage хадгалалт, слайд-инд drawer
- **Checkout** — нэг хуудас, утас + хаяг шалгалттай (Mongolian phone regex), localStorage автомат бөглөлт, "Энэ мэдээллийг хадгалах" сонголт
- **Admin** — Нууц үгийн нэвтрэлт (bcrypt + JWT cookie), dashboard (статистик + chart), захиалгын жагсаалт/дэлгэрэнгүй/төлөв, бүтээгдэхүүний CRUD with variant + image, тохиргоо
- **Order emails** — Resend ашиглан admin-ийн email рүү шинэ захиалга мэдэгдэл
- **Facebook Pixel** — `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`
- **SEO** — `generateMetadata`, sitemap.xml, robots.txt, Open Graph
- **Mobile-friendly** — Tailwind responsive

## Локал тохируулга

```bash
# 1. Dependency-уудыг суулгах
npm install

# 2. Env-ээ бэлдэх
copy .env.example .env.local  # (Windows) эсвэл cp дээр Mac/Linux
# .env.local-руу нууц үг, key-уудаа оруулна. Default-аар admin / admin ажиллана.

# 3. Database үүсгэх (SQLite local file)
mkdir data
npm run db:push           # schema-г DB рүү push хийнэ
npm run db:seed           # demo 3 product seed хийнэ

# 4. Эхлүүлэх
npm run dev
# → http://localhost:3000
```

Admin нэвтрэх: `http://localhost:3000/admin/login` · default password **`admin`**.

## Production deploy (Vercel + Turso + Domain.mn)

### 1. GitHub-д push

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create zozo --public --source=. --remote=origin --push
# Эсвэл GitHub UI-аас repo үүсгээд push хийнэ
```

### 2. Turso (production SQLite — Vercel-friendly)

Vercel дээр SQLite-ийг **Turso** (libSQL serverless) ашиглах нь хамгийн хялбар.

1. https://turso.tech дээр signup (free tier 9GB storage)
2. CLI суулгах: `npm install -g turso` эсвэл https://docs.turso.tech/quickstart-cli
3. DB үүсгэх:
   ```bash
   turso db create zozo --region sin  # Singapore (Монголоос хамгийн ойр)
   turso db show zozo --url
   turso db tokens create zozo
   ```
4. URL болон token-ыг хуулна — `DATABASE_URL` (libsql://...), `DATABASE_AUTH_TOKEN` Vercel env-д оруулна

Тэгээд local-аасаа schema push хийх:
```bash
DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:push
DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:seed
```

> Хэрвээ Postgres (Neon)-ийг ашиглахыг хүсвэл `drizzle.config.ts`, `src/lib/db.ts`, `scripts/seed.ts`-г `drizzle-orm/neon-http` ашиглахаар сольж, schema-г `pgTable` болгож хувиргана. Эхэндээ Turso хэрэглэхийг зөвлөж байна.

### 3. Resend (admin email)

1. https://resend.com signup
2. API key үүсгэх → Vercel env: `RESEND_API_KEY`
3. Эхэндээ `RESEND_FROM_EMAIL=onboarding@resend.dev` ашиглаж болно
4. Domain-аа худалдан авсны дараа Resend-д domain нэмж DNS verify хийгээд `RESEND_FROM_EMAIL=orders@yourdomain.mn` болгоно

### 3b. Telegram захиалгын мэдэгдэл (зөвлөмж — найдвартай)

Захиалга бүрийг шуурхай мэдэхэд хамгийн найдвартай суваг (имэйлээс илүү найдвартай, үнэгүй, домэйн шаардахгүй):

1. Telegram дээр **@BotFather** → `/newbot` → нэр өгч **TOKEN** авна.
2. Шинэ бот руугаа ямар нэг мессеж бичих.
3. Local-д `TELEGRAM_BOT_TOKEN`-оо тавиад chat_id-гаа олно:
   ```powershell
   $env:TELEGRAM_BOT_TOKEN="123:abc"; npx tsx scripts/telegram-setup.ts
   ```
   Гарсан `chat_id`-г хуулна. (Олон ажилтан хүлээж авах бол ботоо группд нэмж группын id ашиглана.)
4. Vercel → Settings → Environment Variables:
   - `TELEGRAM_BOT_TOKEN` = token
   - `TELEGRAM_CHAT_ID` = chat_id (олон бол таслалаар: `111,222`)
5. Redeploy. Дараа test захиалга өгөхөд Telegram-д шуурхай мессеж ирнэ.

### 4. Facebook Pixel (нэмэлт)

1. Meta Business Suite → Events Manager → Pixel үүсгэх
2. Pixel ID-г хуулж Vercel env: `NEXT_PUBLIC_FB_PIXEL_ID`
3. Дараа Facebook ad дотор Pixel-ээ сонгоод бараа тус бүр дээр boost хийнэ
4. **CTA URL**: `https://yourdomain.mn/products/<slug>?utm_source=facebook&utm_campaign=<нэр>`

### 5. Admin нууц үг үүсгэх

```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" 'таны-нууц-үг'
```
Гарсан hash-г Vercel env: `ADMIN_PASSWORD_HASH`-руу хуулна.

Session secret-ийг бас үүсгэнэ:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```
→ Vercel env: `ADMIN_SESSION_SECRET`.

### 6. Vercel deploy

1. https://vercel.com → New Project → GitHub repo сонгох
2. Framework: Next.js (автомат)
3. **Environment Variables** хэсэгт production-ийн бүх env-ийг оруулна:
   - `DATABASE_URL` (libsql://... — Turso-аас)
   - `DATABASE_AUTH_TOKEN` (Turso token)
   - `NEXT_PUBLIC_SITE_URL` (`https://zozo.mn`)
   - `NEXT_PUBLIC_SITE_NAME` (`ZoZo`)
   - `ADMIN_PASSWORD_HASH`
   - `ADMIN_SESSION_SECRET`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `ADMIN_NOTIFICATION_EMAIL` (захиалга очих email)
   - `NEXT_PUBLIC_FB_PIXEL_ID` (нэмэлт)
4. Deploy дарна

### 7. Domain.mn-ээс домэйн авч холбох

1. https://domain.mn → бүртгүүлж, домэйн (`zozo.mn` гэх мэт) худалдан авна (~50,000₮/жил)
2. Domain.mn-ийн DNS settings-д:
   ```
   A    @     76.76.21.21          (Vercel)
   CNAME www  cname.vercel-dns.com
   ```
3. Vercel project → Settings → Domains → `zozo.mn` болон `www.zozo.mn`-ээ нэмэх
4. 15 мин - 24 цагийн дотор DNS propagate хийгдэнэ, SSL автомат
5. `NEXT_PUBLIC_SITE_URL`-ыг `https://zozo.mn` болгож Redeploy

### 8. Production verify

1. `/` хуудас нээгдэнэ, бараа харагдана
2. Бараа дээр `/products/<slug>` URL хуулна — Facebook Sharing Debugger (https://developers.facebook.com/tools/debug/) дээр шалгаж title/image/price OG тагууд харагдаж байгаа эсэхийг шалгана
3. Mobile-аар сагсалж, захиалга өгч үзэх
4. Admin email-д шинэ захиалгын мэдэгдэл ирэх ёстой
5. `/admin/login` руу нэвтэрч, захиалгаа харна, төлөв өөрчилнэ

## Архитектур

```
src/
├── app/
│   ├── (storefront)/            # Public chrome (header/footer/cart)
│   │   ├── page.tsx             # Home
│   │   ├── products/[slug]/     # Product detail (Facebook ад очих хуудас)
│   │   ├── collections/all/     # Catalog
│   │   ├── checkout/            # Single-page checkout + success
│   │   ├── contact/
│   │   └── not-found.tsx
│   ├── admin/                   # Admin shell
│   │   ├── login/
│   │   ├── orders/[id]/
│   │   ├── products/[id]/
│   │   └── settings/
│   ├── layout.tsx               # Root layout + FB Pixel
│   ├── sitemap.ts / robots.ts / error.tsx
│   └── globals.css              # Tailwind v4 + design tokens
├── components/
│   ├── storefront/              # ProductCard, CartDrawer, CheckoutForm, ...
│   └── admin/                   # OrdersTable, ProductForm, RevenueChart, ...
├── lib/
│   ├── db.ts                    # Drizzle client (libSQL/Turso)
│   ├── schema.ts                # Re-export of drizzle/schema.ts
│   ├── env.ts                   # Zod-validated env
│   ├── auth.ts                  # bcrypt + jose JWT (Node)
│   ├── auth-edge.ts             # JWT verify only (Edge — middleware)
│   ├── cart/                    # Zustand store + pricing
│   ├── checkout/                # Zod schema
│   ├── orders/                  # Order number generator
│   ├── products/                # Queries
│   └── email/                   # Resend client + react-email template
├── server/actions/              # All Server Actions (checkout, admin-orders, ...)
└── middleware.ts                # Protects /admin/*

drizzle/
├── schema.ts                    # All tables (SQLite-compatible)
└── migrations/                  # Generated SQL

scripts/
├── seed.ts                      # Demo data
└── test-order.ts                # Smoke test order insert
```

## Хэрэгцээтэй scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run db:push      # Schema push (no migration file)
npm run db:generate  # Generate migration file
npm run db:migrate   # Apply migration files
npm run db:studio    # Drizzle Studio (DB UI)
npm run db:seed      # Seed demo products
```

## Trade-off-ууд

- **SQLite (libSQL) сонгосон** — Postgres-ээс цөөн хөдөлгөөн, Vercel-д хялбар, бяцхан COD дэлгүүрт хангалттай.
- **Zustand + localStorage** — Redux-аас илүү хялбар, 1KB-аас бага. Cart hosting нь client дээр л байна.
- **Integer MNT** — Tögrög-д бутархай байхгүй, float bug-аас зайлсхийнэ.
- **Order item snapshots** — Бараа нэр, үнэ дараа сольсон ч захиалгын түүх алдагдахгүй.
- **Бүртгэлгүй (no accounts)** — Утас + localStorage profile хангалттай COD shop-д.
- **`@/lib/schema` re-export** — App код-оос `drizzle/schema.ts`-руу `../../` гэх мэт relative path хэрэглэхгүй, alias-аар хандана.
- **Edge-compatible auth split** — `auth-edge.ts` зөвхөн `jose`-г import хийнэ. `bcryptjs`-тэй холбоотой код Node-only `auth.ts`-д. Middleware зөвхөн edge-friendly код.

## Cheat sheet

- Шинэ бараа нэмэх: Admin → Бараа → "+ Шинэ бараа". Зураг URL-ээр (одоохондоо). Variants дотор "2+1" гэх мэт багц нэмж болно.
- Promo banner-ыг засах: Admin → Тохиргоо → Promo banner текст.
- Email мэдэгдэл олдохгүй: `RESEND_API_KEY` орсон эсэхийг шалга, `ADMIN_NOTIFICATION_EMAIL` зөв эсэхийг шалга. Dev үед key байхгүй бол email скип, console log харагдана.
- Facebook ад дотор бараа холбох: `https://yourdomain.mn/products/<slug>` шууд CTA URL дээрээ оруул. Сайт автомат OG meta tag-уудаа үүсгэх ба Pixel `ViewContent` бичих болно.
