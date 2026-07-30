import { prisma } from './prisma';
import type { Settings, Category, Product, GalleryImage, TeamMember, Feature } from '@prisma/client';

// ค่า default ที่ใช้เมื่อ DB ยังไม่ถูกตั้งค่า/เชื่อมต่อไม่ได้ — เนื้อหาต้องแสดงเสมอ
export const DEFAULT_SETTINGS: Settings = {
  id: 'singleton',
  shopName: 'เบิ้มอะไหล่ยนต์',
  tagline: 'จำหน่ายอะไหล่รถยนต์ มอเตอร์ไซค์ รถบรรทุก ครบ จบ ราคาถูก อ.ป่าซาง จ.ลำพูน',
  shopType: 'อะไหล่รถยนต์ / มอเตอร์ไซค์ / รถบรรทุก',
  aboutTitle: 'เกี่ยวกับเบิ้มอะไหล่ยนต์',
  aboutText:
    'เบิ้มอะไหล่ยนต์ ร้านจำหน่ายอะไหล่ยนต์ครบวงจรใน อ.ป่าซาง จ.ลำพูน จำหน่ายอะไหล่รถยนต์ มอเตอร์ไซค์ และรถบรรทุก ทั้งอะไหล่แท้และอะไหล่เทียบคุณภาพดี ราคาย่อมเยา มีสินค้าพร้อมส่ง และรับสั่งอะไหล่ตามรุ่นรถ',
  phone: '053524076',
  phone2: '0898554760',
  lineId: '',
  facebookUrl: '',
  addressLine: '',
  subDistrict: '',
  district: 'ป่าซาง',
  province: 'ลำพูน',
  postalCode: '51120',
  latitude: 18.52,
  longitude: 98.938,
  mapEmbedUrl: '',
  openHours: 'จันทร์–เสาร์ 08:00–18:00',
  taxId: '',
  docFooter: 'ขอบคุณที่ใช้บริการ เบิ้มอะไหล่ยนต์',
  heroImage: '',
  logoImage: '',
  seoTitle: 'เบิ้มอะไหล่ยนต์ | ร้านอะไหล่รถยนต์ มอเตอร์ไซค์ ป่าซาง ลำพูน',
  seoDescription:
    'เบิ้มอะไหล่ยนต์ อ.ป่าซาง จ.ลำพูน จำหน่ายอะไหล่รถยนต์ มอเตอร์ไซค์ รถบรรทุก อะไหล่แท้/เทียบ น้ำมันเครื่อง แบตเตอรี่ ยาง ช่วงล่าง เบรก ไฟฟ้า ราคาถูก มีของพร้อมส่ง',
  seoKeywords: 'อะไหล่ยนต์ป่าซาง, อะไหล่รถยนต์ลำพูน, ร้านอะไหล่ป่าซาง, เบิ้มอะไหล่ยนต์',
  ogImage: '',
  updatedAt: new Date(),
};

export async function getSettings(): Promise<Settings> {
  try {
    const s = await prisma.settings.findUnique({ where: { id: 'singleton' } });
    return s ?? DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export type CategoryWithProducts = Category & { products: Product[] };

export async function getCategoriesWithProducts(): Promise<CategoryWithProducts[]> {
  try {
    return await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { products: { orderBy: { order: 'asc' } } },
    });
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await prisma.category.findMany({ orderBy: { order: 'asc' } });
  } catch {
    return [];
  }
}

export async function getFeaturedProducts(): Promise<(Product & { category: Category | null })[]> {
  try {
    return await prisma.product.findMany({
      where: { featured: true },
      orderBy: { order: 'asc' },
      include: { category: true },
      take: 8,
    });
  } catch {
    return [];
  }
}

export async function getAllProducts(): Promise<(Product & { category: Category | null })[]> {
  try {
    return await prisma.product.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: { category: true },
    });
  } catch {
    return [];
  }
}

export async function getGallery(): Promise<GalleryImage[]> {
  try {
    return await prisma.galleryImage.findMany({ orderBy: { order: 'asc' } });
  } catch {
    return [];
  }
}

export async function getTeam(): Promise<TeamMember[]> {
  try {
    return await prisma.teamMember.findMany({ orderBy: { order: 'asc' } });
  } catch {
    return [];
  }
}

export async function getFeatures(): Promise<Feature[]> {
  try {
    return await prisma.feature.findMany({ orderBy: { order: 'asc' } });
  } catch {
    return [];
  }
}

export async function getInventoryProducts(): Promise<(Product & { category: Category | null })[]> {
  try {
    return await prisma.product.findMany({
      orderBy: [{ stock: 'asc' }, { name: 'asc' }],
      include: { category: true },
    });
  } catch {
    return [];
  }
}

export async function getRecentMovements(take = 30) {
  try {
    return await prisma.stockMovement.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: { product: { select: { name: true, unit: true, sku: true } } },
    });
  } catch {
    return [];
  }
}

// รวมที่อยู่เป็นข้อความเดียว
export function formatAddress(s: Settings): string {
  const parts = [
    s.addressLine,
    s.subDistrict ? `ต.${s.subDistrict}` : '',
    s.district ? `อ.${s.district}` : '',
    s.province ? `จ.${s.province}` : '',
    s.postalCode,
  ].filter(Boolean);
  return parts.join(' ');
}
