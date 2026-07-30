import { prisma } from '@/lib/prisma';
import { isOwner } from '@/lib/session';
import CollectionManager, { type FieldDef } from '@/components/admin/CollectionManager';

async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, username: true, name: true, role: true, active: true },
    });
  } catch {
    return [];
  }
}

export default async function UsersPage() {
  if (!(await isOwner())) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-800">
        🔒 หน้านี้สำหรับ<strong>เจ้าของร้าน</strong>เท่านั้น
      </div>
    );
  }

  const users = await getUsers();
  const fields: FieldDef[] = [
    { key: 'username', label: 'ชื่อผู้ใช้ (ล็อกอิน)', type: 'text' },
    { key: 'name', label: 'ชื่อ-นามสกุล', type: 'text' },
    { key: 'password', label: 'รหัสผ่าน', type: 'text', hint: 'สร้างใหม่ต้องกรอก / แก้ไขเว้นว่างถ้าไม่เปลี่ยน' },
    {
      key: 'role',
      label: 'สิทธิ์',
      type: 'select',
      options: [
        { value: 'STAFF', label: 'พนักงาน (ขาย/สต็อก/เอกสาร)' },
        { value: 'OWNER', label: 'เจ้าของ (เข้าได้ทุกอย่าง)' },
      ],
    },
    { key: 'active', label: 'เปิดใช้งานบัญชี', type: 'boolean' },
  ];
  const defaults = { username: '', name: '', password: '', role: 'STAFF', active: true };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-neutral-800">ผู้ใช้งาน & สิทธิ์</h1>
      <p className="mb-6 text-neutral-500">
        เจ้าของร้านล็อกอินด้วยรหัส env ได้เสมอ (เว้นช่องชื่อผู้ใช้) — เพิ่มบัญชีพนักงานได้ที่นี่
      </p>
      <CollectionManager
        endpoint="/api/users"
        items={users.map((it) => ({
          ...it,
          __subtitle: `${it.role === 'OWNER' ? 'เจ้าของ' : 'พนักงาน'} • ${it.name || '-'}${it.active ? '' : ' • ปิดใช้งาน'}`,
        }))}
        fields={fields}
        defaults={defaults}
        titleKey="username"
        addLabel="เพิ่มผู้ใช้"
      />
    </div>
  );
}
