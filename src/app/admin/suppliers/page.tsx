import { prisma } from '@/lib/prisma';
import CollectionManager, { type FieldDef } from '@/components/admin/CollectionManager';

async function getSuppliers() {
  try {
    return await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  } catch {
    return [];
  }
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();
  const fields: FieldDef[] = [
    { key: 'name', label: 'ชื่อร้าน/บริษัท', type: 'text', colSpan: 2 },
    { key: 'contact', label: 'ผู้ติดต่อ', type: 'text' },
    { key: 'phone', label: 'เบอร์โทร', type: 'text' },
    { key: 'taxId', label: 'เลขผู้เสียภาษี', type: 'text' },
    { key: 'address', label: 'ที่อยู่', type: 'textarea' },
    { key: 'note', label: 'หมายเหตุ', type: 'textarea' },
  ];
  const defaults = { name: '', contact: '', phone: '', taxId: '', address: '', note: '' };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-neutral-800">ซัพพลายเออร์</h1>
      <p className="mb-6 text-neutral-500">ทะเบียนร้านค้าส่ง/ผู้จำหน่ายอะไหล่</p>
      <CollectionManager
        endpoint="/api/suppliers"
        items={suppliers.map((it) => ({ ...it, __subtitle: [it.contact, it.phone].filter(Boolean).join(' • ') }))}
        fields={fields}
        defaults={defaults}
        titleKey="name"
        addLabel="เพิ่มซัพพลายเออร์"
      />
    </div>
  );
}
