import { getFeatures } from '@/lib/data';
import CollectionManager, { type FieldDef } from '@/components/admin/CollectionManager';

export default async function AdminFeaturesPage() {
  const features = await getFeatures();
  const fields: FieldDef[] = [
    { key: 'title', label: 'หัวข้อ', type: 'text' },
    { key: 'icon', label: 'ไอคอน (emoji)', type: 'text', placeholder: '' },
    { key: 'order', label: 'ลำดับ', type: 'number' },
    { key: 'description', label: 'คำอธิบาย', type: 'textarea' },
  ];
  const defaults = { title: '', icon: '', order: 0, description: '' };

  return (
    <div><h1 className="mb-1 text-2xl font-bold text-neutral-800">จุดเด่น / บริการ</h1><p className="mb-6 text-neutral-500">จุดขายของร้านที่แสดงหน้าแรกและหน้าเกี่ยวกับเรา</p><CollectionManager
        endpoint="/api/features"
        items={features.map((it) => ({ ...it, __subtitle: it.description }))}
        fields={fields}
        defaults={defaults}
        titleKey="title"
        imageKey="icon"
        addLabel="เพิ่มจุดเด่น"
      /></div> );
}
