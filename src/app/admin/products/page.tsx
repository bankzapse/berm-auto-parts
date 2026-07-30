import { getAllProducts, getCategories } from '@/lib/data';
import CollectionManager, { type FieldDef } from '@/components/admin/CollectionManager';

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const catOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name || 'ไม่ระบุหมวด';

  const fields: FieldDef[] = [
    { key: 'name', label: 'ชื่อสินค้า', type: 'text', colSpan: 2 },
    { key: 'categoryId', label: 'หมวดสินค้า', type: 'select', options: catOptions },
    { key: 'brand', label: 'ประเภท/ยี่ห้อ', type: 'text', placeholder: 'แท้ / เทียบ / ยี่ห้อ' },
    { key: 'price', label: 'ราคาขาย (บาท)', type: 'price', hint: 'เว้นว่าง = สอบถามราคา' },
    { key: 'cost', label: 'ต้นทุน (บาท)', type: 'price', hint: 'ใช้คำนวณกำไร (ไม่แสดงหน้าเว็บ)' },
    { key: 'priceLabel', label: 'หน่วย/หมายเหตุราคา', type: 'text', placeholder: 'เช่น /ชิ้น, เริ่มต้น' },
    { key: 'sku', label: 'รหัสสินค้า (SKU)', type: 'text', placeholder: 'ใช้กับสติกเกอร์/สต็อก' },
    { key: 'barcode', label: 'บาร์โค้ด', type: 'text', placeholder: 'เลขบาร์โค้ด (สแกน/พิมพ์)' },
    { key: 'oem', label: 'เลข OEM / รหัสเทียบ', type: 'text', placeholder: 'คั่นด้วย , เช่น 90915-YZZE1, C-111' },
    { key: 'fitment', label: 'รุ่นรถที่ใช้ได้', type: 'text', placeholder: 'เช่น Isuzu D-Max 2012-2019; Toyota Vios' },
    { key: 'location', label: 'ชั้นวาง/โซนเก็บ', type: 'text', placeholder: 'เช่น A-01, ชั้น 3' },
    { key: 'unit', label: 'หน่วยนับ', type: 'text', placeholder: 'ชิ้น / ลิตร / เส้น' },
    { key: 'lowStock', label: 'จุดเตือนสต็อกต่ำ', type: 'number', hint: 'เตือนเมื่อคงเหลือ ≤ ค่านี้' },
    { key: 'order', label: 'ลำดับการแสดง', type: 'number' },
    { key: 'inStock', label: 'มีของพร้อมส่ง', type: 'boolean' },
    { key: 'featured', label: 'สินค้ายอดนิยม (แสดงหน้าแรก)', type: 'boolean' },
    { key: 'description', label: 'รายละเอียด', type: 'textarea' },
    { key: 'image', label: 'รูปสินค้า', type: 'image' },
  ];

  const defaults = {
    name: '',
    categoryId: catOptions[0]?.value || '',
    brand: '',
    price: null,
    cost: null,
    priceLabel: '',
    sku: '',
    barcode: '',
    oem: '',
    fitment: '',
    location: '',
    unit: 'ชิ้น',
    lowStock: 0,
    order: 0,
    inStock: true,
    featured: false,
    description: '',
    image: '',
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-neutral-800">สินค้า / อะไหล่</h1>
      <p className="mb-6 text-neutral-500">เพิ่ม แก้ไข ลบ สินค้า พร้อมราคาและหมวด</p>
      <CollectionManager
        endpoint="/api/products"
        items={products.map((it) => ({
          ...it,
          __subtitle: `${catName(it.categoryId)} • ${it.price != null ? '฿' + it.price : 'สอบถามราคา'}${it.sku ? ' • ' + it.sku : ''}`,
        }))}
        fields={fields}
        defaults={defaults}
        titleKey="name"
        addLabel="เพิ่มสินค้า"
      />
    </div>
  );
}
