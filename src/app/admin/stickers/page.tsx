import { getAllProducts, getSettings } from '@/lib/data';
import StickerTool from './StickerTool';

export default async function StickersPage() {
  const [products, settings] = await Promise.all([getAllProducts(), getSettings()]);
  const simple = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    priceLabel: p.priceLabel,
    sku: p.sku,
    barcode: p.barcode,
    brand: p.brand,
  }));
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-neutral-800">พิมพ์สติกเกอร์ติดสินค้า</h1>
      <p className="mb-6 text-neutral-500">
        เลือกสินค้าหรือพิมพ์ข้อความเอง เลือกฟอนต์/ขนาด แล้วสั่งพิมพ์ติดหน้าสินค้าได้เลย
      </p>
      <StickerTool products={simple} shopName={settings.shopName} phone={settings.phone2 || settings.phone} />
    </div>
  );
}
