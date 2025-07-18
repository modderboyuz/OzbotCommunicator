# MetalBaza - Qurilish Materiallari Marketplace

MetalBaza - bu qurilish materiallari va jihozlarini sotish uchun mo'ljallangan zamonaviy web ilova. Loyiha React, TypeScript, Tailwind CSS va Supabase texnologiyalari asosida qurilgan.

## Texnologiyalar

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query, Zustand
- **Routing**: Wouter
- **UI Components**: shadcn/ui

## O'rnatish

1. **Loyihani klonlash**:
```bash
git clone <repository-url>
cd metalbaza
```

2. **Dependencies o'rnatish**:
```bash
npm install
```

3. **Environment variables sozlash**:
`.env.example` faylini `.env` ga nusxalang va kerakli qiymatlarni kiriting:
```bash
cp .env.example .env
```

4. **Supabase loyihasi yaratish**:
- [Supabase](https://supabase.com) da yangi loyiha yarating
- Database URL va anon key ni `.env` fayliga qo'shing

5. **Database schema yaratish**:
Supabase SQL Editor da `supabase/migrations/create_complete_schema.sql` faylini ishga tushiring.

6. **Loyihani ishga tushirish**:
```bash
npm run dev
```

## Loyiha tuzilishi

```
metalbaza/
├── client/
│   ├── src/
│   │   ├── components/     # UI komponentlar
│   │   ├── pages/          # Sahifalar
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utility funksiyalar
│   │   └── main.tsx        # Entry point
│   └── index.html
├── supabase/
│   └── migrations/         # Database migration fayllari
├── package.json
└── README.md
```

## Asosiy funksiyalar

### Foydalanuvchi rollari
- **Client**: Mahsulotlarni ko'rish, buyurtma berish
- **Worker**: Ish arizalarini qabul qilish
- **Admin**: Tizimni boshqarish

### Sahifalar
- **Bosh sahifa**: Mahsulotlar va reklamalar
- **Katalog**: Kategoriyalar bo'yicha mahsulotlar
- **Ustalar**: Ishchilar ro'yxati va ariza yuborish
- **Buyurtmalar**: Foydalanuvchi buyurtmalari
- **Profil**: Shaxsiy ma'lumotlar

### Telegram Bot integratsiyasi
- Foydalanuvchilarni ro'yxatdan o'tkazish
- Web ilovaga avtomatik kirish
- Xabarlar yuborish

## Database Schema

### Asosiy jadvallar:
- `users` - Foydalanuvchilar
- `categories` - Mahsulot kategoriyalari
- `products` - Mahsulotlar
- `orders` - Buyurtmalar
- `order_items` - Buyurtma elementlari
- `cart_items` - Savatdagi mahsulotlar
- `ads` - Reklamalar
- `worker_applications` - Ish arizalari
- `worker_reviews` - Ishchi baholari

## Deployment

1. **Build yaratish**:
```bash
npm run build
```

2. **Supabase da hosting**:
- Supabase loyihasida hosting yoqing
- Build fayllarini yuklang

3. **Environment variables**:
Production muhitida kerakli environment variables ni sozlang.

## Telegram Bot sozlash

1. BotFather orqali yangi bot yarating
2. Bot token ni `.env` fayliga qo'shing
3. Webhook URL ni sozlang
4. Bot komandalarini ro'yxatdan o'tkazing

## Xavfsizlik

- Row Level Security (RLS) barcha jadvallarda yoqilgan
- Foydalanuvchilar faqat o'z ma'lumotlariga kirish huquqiga ega
- API so'rovlari autentifikatsiya orqali himoyalangan

## Qo'llab-quvvatlash

Savollar yoki muammolar uchun issue yarating yoki loyiha maintainer bilan bog'laning.