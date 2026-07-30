import { getTeam } from '@/lib/data';
import CollectionManager, { type FieldDef } from '@/components/admin/CollectionManager';

export default async function AdminTeamPage() {
  const team = await getTeam();
  const fields: FieldDef[] = [
    { key: 'name', label: 'ชื่อ', type: 'text' },
    { key: 'role', label: 'ตำแหน่ง', type: 'text' },
    { key: 'phone', label: 'เบอร์โทร', type: 'text' },
    { key: 'order', label: 'ลำดับ', type: 'number' },
    { key: 'bio', label: 'รายละเอียด', type: 'textarea' },
    { key: 'image', label: 'รูปภาพ', type: 'image' },
  ];
  const defaults = { name: '', role: '', phone: '', order: 0, bio: '', image: '' };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-neutral-800">ทีมงาน</h1>
      <p className="mb-6 text-neutral-500">เพิ่มได้หลายคน — เจ้าของร้าน พนักงาน ช่าง</p>
      <CollectionManager
        endpoint="/api/team"
        items={team}
        fields={fields}
        defaults={defaults}
        titleKey="name"
        imageKey="image"
        addLabel="เพิ่มทีมงาน"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subtitle={(it: any) => it.role}
      />
    </div>
  );
}
