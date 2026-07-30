import { getGallery } from '@/lib/data';
import CollectionManager, { type FieldDef } from '@/components/admin/CollectionManager';

export default async function AdminGalleryPage() {
  const gallery = await getGallery();
  const fields: FieldDef[] = [
    { key: 'url', label: 'รูปภาพ', type: 'image', colSpan: 2 },
    { key: 'caption', label: 'คำบรรยายรูป', type: 'text', colSpan: 2 },
    { key: 'order', label: 'ลำดับ', type: 'number' },
  ];
  const defaults = { url: '', caption: '', order: 0 };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-neutral-800">แกลเลอรี</h1>
      <p className="mb-6 text-neutral-500">รูปสินค้า บรรยากาศร้าน และผลงาน</p>
      <CollectionManager
        endpoint="/api/gallery"
        items={gallery}
        fields={fields}
        defaults={defaults}
        titleKey="caption"
        imageKey="url"
        addLabel="เพิ่มรูป"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subtitle={(it: any) => it.url}
      />
    </div>
  );
}
