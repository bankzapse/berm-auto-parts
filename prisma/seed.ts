import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// รูปตัวอย่างที่โหลดได้จริง (แทนด้วยรูปจริงผ่านหน้า admin ภายหลัง)
const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

const CATEGORIES = [
  { slug: 'engine-oil', name: 'น้ำมันเครื่อง', icon: '🛢️', description: 'น้ำมันเครื่องรถยนต์และมอเตอร์ไซค์ ทุกยี่ห้อ' },
  { slug: 'battery', name: 'แบตเตอรี่', icon: '🔋', description: 'แบตเตอรี่รถยนต์ มอเตอร์ไซค์ พร้อมบริการเปลี่ยน' },
  { slug: 'tire', name: 'ยาง', icon: '🛞', description: 'ยางรถยนต์ ยางมอเตอร์ไซค์ หลากหลายรุ่น' },
  { slug: 'suspension', name: 'ช่วงล่าง', icon: '🔩', description: 'โช้คอัพ ลูกหมาก ปีกนก บูช อะไหล่ช่วงล่าง' },
  { slug: 'brake', name: 'เบรก', icon: '🛑', description: 'ผ้าเบรก จานเบรก น้ำมันเบรก อะไหล่ระบบเบรก' },
  { slug: 'electrical', name: 'ไฟฟ้า', icon: '💡', description: 'ไดสตาร์ท ไดชาร์จ หลอดไฟ ฟิวส์ อุปกรณ์ไฟฟ้า' },
  { slug: 'engine', name: 'เครื่องยนต์', icon: '⚙️', description: 'อะไหล่เครื่องยนต์ สายพาน ปะเก็น กรองต่าง ๆ' },
  { slug: 'accessories', name: 'อุปกรณ์เสริม', icon: '✨', description: 'อุปกรณ์ตกแต่งและของใช้ในรถ' },
];

const FEATURES = [
  { title: 'อะไหล่แท้ & เทียบ ครบ', description: 'มีทั้งอะไหล่แท้และอะไหล่เทียบคุณภาพดี ให้เลือกตามงบ', icon: '✅' },
  { title: 'ราคาถูก ยุติธรรม', description: 'ราคาส่ง–ปลีก จับต้องได้ บอกราคาชัดเจนก่อนซื้อ', icon: '💰' },
  { title: 'มีของพร้อมส่ง', description: 'สต๊อกอะไหล่ยอดนิยมพร้อมส่งทันที ไม่ต้องรอนาน', icon: '📦' },
  { title: 'สั่งได้ตามรุ่นรถ', description: 'แจ้งรุ่น/ปีรถ เราหาอะไหล่ให้ตรงรุ่น สั่งพิเศษได้', icon: '🚗' },
];

const TEAM = [
  { name: 'เจ้าของร้าน', role: 'เจ้าของร้าน / ที่ปรึกษาอะไหล่', bio: 'ประสบการณ์ด้านอะไหล่ยนต์ ให้คำแนะนำเรื่องอะไหล่ทุกรุ่น', image: img('owner'), order: 0 },
];

async function main() {
  // ---- Settings: upsert แบบไม่ทับค่าที่ผู้ดูแลแก้แล้ว (สร้างเฉพาะตอนยังไม่มี) ----
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {}, // สำคัญ: ไม่ทับค่าที่แก้ไว้แล้ว
    create: {
      id: 'singleton',
      shopName: 'เบิ้มอะไหล่ยนต์',
      tagline: 'จำหน่ายอะไหล่รถยนต์ มอเตอร์ไซค์ รถบรรทุก ครบ จบ ราคาถูก อ.ป่าซาง จ.ลำพูน',
      aboutText:
        'เบิ้มอะไหล่ยนต์ ร้านจำหน่ายอะไหล่ยนต์ครบวงจรใน อ.ป่าซาง จ.ลำพูน จำหน่ายอะไหล่รถยนต์ มอเตอร์ไซค์ และรถบรรทุก ทั้งอะไหล่แท้และอะไหล่เทียบคุณภาพดี ราคาย่อมเยา มีสินค้าพร้อมส่ง และรับสั่งอะไหล่ตามรุ่นรถ ดูแลลูกค้าด้วยความจริงใจ',
      phone: '053524076',
      phone2: '0898554760',
      district: 'ป่าซาง',
      province: 'ลำพูน',
      postalCode: '51120',
      openHours: 'จันทร์–เสาร์ 08:00–18:00',
      seoTitle: 'เบิ้มอะไหล่ยนต์ | ร้านอะไหล่รถยนต์ มอเตอร์ไซค์ ป่าซาง ลำพูน',
      seoDescription:
        'เบิ้มอะไหล่ยนต์ อ.ป่าซาง จ.ลำพูน จำหน่ายอะไหล่รถยนต์ มอเตอร์ไซค์ รถบรรทุก อะไหล่แท้/เทียบ น้ำมันเครื่อง แบตเตอรี่ ยาง ช่วงล่าง เบรก ไฟฟ้า ราคาถูก มีของพร้อมส่ง โทร 089-855-4760',
      seoKeywords:
        'อะไหล่ยนต์ป่าซาง, อะไหล่รถยนต์ลำพูน, ร้านอะไหล่ป่าซาง, อะไหล่มอเตอร์ไซค์ลำพูน, น้ำมันเครื่องป่าซาง, แบตเตอรี่ลำพูน, เบิ้มอะไหล่ยนต์',
    },
  });

  // ---- Categories: upsert ตาม slug ----
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, description: c.description, order: i },
      create: { ...c, order: i },
    });
  }

  // ---- Products: seed เฉพาะตอนตารางว่าง ----
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const cats = await prisma.category.findMany();
    const bySlug = (s: string) => cats.find((c) => c.slug === s)?.id;
    const sample: {
      name: string; cat: string; price: number | null; brand: string; sku: string; seed: string; featured?: boolean;
    }[] = [
      { name: 'น้ำมันเครื่องสังเคราะห์ 5W-30 (4 ลิตร)', cat: 'engine-oil', price: 890, brand: 'แท้', sku: 'OIL-5W30', seed: 'oil1', featured: true },
      { name: 'น้ำมันเครื่องมอเตอร์ไซค์ 10W-40 (0.8 ลิตร)', cat: 'engine-oil', price: 180, brand: 'แท้', sku: 'OIL-MC', seed: 'oil2' },
      { name: 'แบตเตอรี่รถยนต์ 12V 65Ah', cat: 'battery', price: 2450, brand: 'เทียบ', sku: 'BAT-65', seed: 'bat1', featured: true },
      { name: 'แบตเตอรี่มอเตอร์ไซค์ 12V', cat: 'battery', price: 650, brand: 'แท้', sku: 'BAT-MC', seed: 'bat2' },
      { name: 'ยางรถยนต์ 185/65 R15', cat: 'tire', price: 1750, brand: 'เทียบ', sku: 'TIRE-15', seed: 'tire1', featured: true },
      { name: 'โช้คอัพหน้า (คู่)', cat: 'suspension', price: 1600, brand: 'เทียบ', sku: 'SUS-FR', seed: 'sus1' },
      { name: 'ลูกหมากปีกนกล่าง', cat: 'suspension', price: 320, brand: 'เทียบ', sku: 'SUS-BJ', seed: 'sus2' },
      { name: 'ผ้าเบรกหน้า (ชุด)', cat: 'brake', price: 550, brand: 'แท้', sku: 'BRK-FR', seed: 'brk1', featured: true },
      { name: 'จานเบรกหน้า', cat: 'brake', price: 980, brand: 'เทียบ', sku: 'BRK-DISC', seed: 'brk2' },
      { name: 'ไดสตาร์ท (รีบิ้วท์)', cat: 'electrical', price: 1850, brand: 'เทียบ', sku: 'ELE-ST', seed: 'ele1' },
      { name: 'หลอดไฟหน้า LED (คู่)', cat: 'electrical', price: 690, brand: 'เทียบ', sku: 'ELE-LED', seed: 'ele2', featured: true },
      { name: 'สายพานหน้าเครื่อง', cat: 'engine', price: 280, brand: 'แท้', sku: 'ENG-BELT', seed: 'eng1' },
      { name: 'กรองอากาศ', cat: 'engine', price: 220, brand: 'แท้', sku: 'ENG-AIR', seed: 'eng2' },
      { name: 'กรองน้ำมันเครื่อง', cat: 'engine', price: 120, brand: 'แท้', sku: 'ENG-OILF', seed: 'eng3' },
    ];
    for (let i = 0; i < sample.length; i++) {
      const p = sample[i];
      await prisma.product.create({
        data: {
          name: p.name,
          price: p.price,
          cost: p.price != null ? Math.round(p.price * 0.75) : null,
          brand: p.brand,
          sku: p.sku,
          unit: 'ชิ้น',
          stock: 8 + ((i * 3) % 20),
          lowStock: 3,
          image: img(p.seed),
          featured: !!p.featured,
          order: i,
          categoryId: bySlug(p.cat),
        },
      });
    }
    console.log(`seeded ${sample.length} products`);
  }

  // ---- Gallery: seed เฉพาะตอนตารางว่าง ----
  if ((await prisma.galleryImage.count()) === 0) {
    for (let i = 1; i <= 6; i++) {
      await prisma.galleryImage.create({
        data: { url: img(`gallery${i}`), caption: `ภาพร้านและสินค้า ${i}`, order: i },
      });
    }
  }

  // ---- Features: seed เฉพาะตอนตารางว่าง ----
  if ((await prisma.feature.count()) === 0) {
    for (let i = 0; i < FEATURES.length; i++) {
      await prisma.feature.create({ data: { ...FEATURES[i], order: i } });
    }
  }

  // ---- Team: seed เฉพาะตอนตารางว่าง ----
  if ((await prisma.teamMember.count()) === 0) {
    for (const t of TEAM) await prisma.teamMember.create({ data: t });
  }

  console.log('✅ seed done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
