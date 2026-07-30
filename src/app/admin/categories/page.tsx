import { getCategories } from '@/lib/data';
import CollectionManager, { type FieldDef } from '@/components/admin/CollectionManager';

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  const fields: FieldDef[] = [
    { key: 'name', label: 'ชื่อหมวด', type: 'text' },
    { key: 'slug', label: 'slug (ภาษาอังกฤษ ไม่เว้นวรรค)', type: 'text', hint: 'ใช้ใน URL เช่น engine-oil' },
    { key: 'icon', label: 'ไอคอน (emoji)', type: 'text', placeholder: '' },
    { key: 'order', label: 'ลำดับ', type: 'number' },
    { key: 'description', label: 'คำอธิบายหมวด', type: 'textarea' },
    { key: 'image', label: 'รูปหมวด (ถ้ามี)', type: 'image' },
  ];
  const defaults = { name: '', slug: '', icon: '', order: 0, description: '', image: '' };

  return (
    <div><h1 className="mb-1 text-2xl font-bold text-neutral-800">หมวดสินค้า</h1><p className="mb-6 text-neutral-500">จัดหมวดอะไหล่ เช่น น้ำมันเครื่อง แบตเตอรี่ ยาง เบรก</p><CollectionManager
        endpoint="/api/categories"
        items={categories.map((it) => ({ ...it, __subtitle: `${it.icon || ''} /${it.slug}` }))}
        fields={fields}
        defaults={defaults}
        titleKey="name"
        imageKey="image"
        addLabel="เพิ่มหมวด"
      /></div> );
}
