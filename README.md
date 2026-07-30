# เบิ้มอะไหล่ยนต์ — เว็บไซต์ร้าน + ระบบหลังบ้าน

ร้านจำหน่ายอะไหล่รถยนต์ / มอเตอร์ไซค์ / รถบรรทุก อ.ป่าซาง จ.ลำพูน
เว็บไซต์มืออาชีพ เน้น SEO ภาษาไทย + ระบบผู้ดูแล (แก้ได้ทุกอย่างผ่านหน้าเว็บ)

**เทคโนโลยี:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL (Supabase) · Supabase Storage

---

## ระบบที่มี

**หน้าเว็บ (ลูกค้า)**
- หน้าแรก: Hero + สถิติ + หมวดอะไหล่ + สินค้ายอดนิยม + จุดเด่น + เกี่ยวกับเรา + แกลเลอรี + แถบชวนโทร
- สินค้า/อะไหล่ (กรองตามหมวด), ผลงาน/แกลเลอรี, เกี่ยวกับเรา (ทีมงาน), ติดต่อ (ฝังแผนที่ Google)
- ปุ่มโทร + Facebook ทุกหน้า, รองรับมือถือเต็มรูปแบบ
- SEO: meta ภาษาไทย, Open Graph, Twitter card, JSON-LD (AutoPartsStore), sitemap.xml, robots.txt

**ระบบผู้ดูแล `/admin`** (ล็อกอินด้วยรหัสผ่าน, middleware ป้องกัน, หลังบ้านล้วน — ไม่มีขายออนไลน์)
- ข้อมูลร้าน & SEO, สินค้า (ราคา/ต้นทุน/หมวด/บาร์โค้ด/OEM/รุ่นรถ/ชั้นวาง), หมวดสินค้า, แกลเลอรี, ทีมงาน, จุดเด่น
- อัปโหลดรูป (เลือกไฟล์ + วางลิงก์) พร้อมพรีวิว + ย่อรูปอัตโนมัติฝั่ง client → เก็บที่ Supabase Storage
- **ขายหน้าร้าน (POS):** สแกนบาร์โค้ด (เครื่องสแกน USB / กล้อง) หรือค้นหา → ตะกร้า → คิดเงิน/เงินทอน → ออกใบเสร็จ + ตัดสต็อกอัตโนมัติ
- **จัดการสต็อก:** รับเข้า / ตัดออก / นับสต็อก + ประวัติการเคลื่อนไหว + เตือนของใกล้หมด/หมด
- **ใบสั่งซื้อ (PO) + ซัพพลายเออร์:** สั่งซื้อจากซัพพลายเออร์ → กด "รับของเข้าสต็อก" เพิ่มยอดคงเหลืออัตโนมัติ
- **ใบเสร็จ / ใบวางบิล / ใบเสนอราคา / ใบกำกับภาษี:** สร้าง แก้ไข พิมพ์ (A4) + VAT/ส่วนลด + ตัดสต็อก
- **ลูกค้า + ค้างชำระ:** ทะเบียนลูกค้า และสรุปยอดค้างชำระจากใบวางบิล
- **รายงาน & ปิดยอด** (เจ้าของ): ยอดขายรายวัน/ช่วง, กำไรขั้นต้น, สินค้าขายดี, ของค้างสต็อก, ปิดยอดสิ้นวัน, สำรองข้อมูล (JSON)
- **พิมพ์สติกเกอร์ติดสินค้า:** เลือกจากสินค้า/พิมพ์ข้อความเอง เลือกฟอนต์/ขนาด + ใส่บาร์โค้ด (Code128) หรือ QR ได้
- **ใบเสร็จความร้อน 58/80mm:** POS พิมพ์ใบเสร็จอย่างย่อสำหรับเครื่องพิมพ์ความร้อน
- **ผู้ใช้ & สิทธิ์** (เจ้าของ): เพิ่มบัญชีพนักงาน (STAFF ขาย/สต็อก/เอกสารได้ แต่แก้ตั้งค่า/ผู้ใช้/รายงานไม่ได้)
- **แจ้งเตือนสต็อกต่ำ:** ส่ง webhook (Make/Zapier/n8n/Discord/เชื่อม LINE) เมื่อสินค้าใกล้หมด

---

## รันในเครื่อง (Local)

```bash
npm install
cp .env.example .env      # แล้วแก้ค่าในไฟล์ .env ให้ครบ
npm run db:push           # สร้างตารางในฐานข้อมูล
npm run db:seed           # ใส่ข้อมูลตัวอย่าง
npm run dev               # เปิด http://localhost:3000
```

> เว็บจะแสดงเนื้อหา default ได้แม้ยังไม่ต่อฐานข้อมูล แต่ระบบ admin/สต็อก/เอกสาร ต้องต่อ DB จริง

- หน้าเว็บ: http://localhost:3000
- ระบบผู้ดูแล: http://localhost:3000/admin
  - **เจ้าของร้าน:** เว้นช่อง "ชื่อผู้ใช้" ว่าง + ใส่รหัสจาก `ADMIN_PASSWORD`
  - **พนักงาน:** เจ้าของสร้างบัญชีได้ที่ /admin/users แล้วล็อกอินด้วยชื่อผู้ใช้ + รหัสผ่าน

---

## ตั้งค่า Supabase (ฐานข้อมูล + ที่เก็บรูป)

1. สร้างโปรเจกต์ที่ https://supabase.com → New project
2. **Connection strings** (เมนู Project Settings → Database):
   - `DATABASE_URL` = **Connection pooling** (พอร์ต `6543`) เติม `?pgbouncer=true` ต่อท้าย
   - `DIRECT_URL` = **Direct connection** (พอร์ต `5432`)
3. **Storage keys** (Project Settings → API):
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (ความลับ! ห้ามเปิดเผย)
   - `SUPABASE_STORAGE_BUCKET` = `uploads` (ระบบจะสร้าง bucket แบบ public ให้อัตโนมัติเมื่ออัปโหลดครั้งแรก)

ตัวอย่างค่า:
```
DATABASE_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

---

## Deploy ขึ้น Vercel (ขั้นตอนสั้น ๆ)

1. Push โค้ดขึ้น GitHub (ดูด้านล่าง)
2. ที่ https://vercel.com → **Add New → Project** → เลือก repo `berm-auto-parts`
3. หน้า Configure ให้ใส่ **Environment Variables** ทั้งหมด (ค่าเดียวกับ `.env`):
   - `DATABASE_URL`, `DIRECT_URL`
   - `ADMIN_PASSWORD`, `AUTH_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (เช่น `https://berm-auto-parts.vercel.app`)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`
4. กด **Deploy** — build script จะรัน `prisma generate && prisma db push && seed && next build` ให้อัตโนมัติ
5. เปิดใช้งานที่ URL ที่ Vercel ให้ → เข้า `/admin` เพื่อแก้ข้อมูลจริงและอัปโหลดรูป

> `AUTH_SECRET` สุ่มด้วย `openssl rand -hex 32`
> การ deploy ครั้งถัดไป seed จะไม่ทับข้อมูลที่แก้แล้ว (settings ใช้ upsert, สินค้า/รูป seed เฉพาะตอนตารางว่าง)

---

## Push ขึ้น GitHub

```bash
git add .
git commit -m "init: berm auto parts site"
git branch -M main
git remote add origin https://github.com/bankzapse/berm-auto-parts.git
git push -u origin main
```

> ไฟล์ `.env` ถูก `.gitignore` ไว้แล้ว — ค่าลับจะไม่ขึ้น GitHub

---

## โครงสร้างสำคัญ

```
prisma/schema.prisma      โครงฐานข้อมูล (Settings, Product, StockMovement, Document ฯลฯ)
prisma/seed.ts            ข้อมูลตัวอย่าง (idempotent)
src/app/(site)/           หน้าเว็บลูกค้า
src/app/admin/            ระบบผู้ดูแล
src/app/api/              API (auth, upload, CRUD, inventory, documents)
src/lib/                  prisma, auth, supabase, data (มี fallback), seo
src/components/           UI ส่วนกลาง + ส่วน admin
```
