import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatBaht } from '@/lib/documents';
import CollectionManager, { type FieldDef } from '@/components/admin/CollectionManager';

async function getData() {
  try {
    const [customers, outstanding] = await Promise.all([
      prisma.customer.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.document.findMany({
        // ค้างชำระ = เอกสารที่ยังไม่ปิดยอด (ใบวางบิล หรือ ใบเสร็จเครดิต) ไม่ว่าประเภทใด
        where: { status: { notIn: ['PAID', 'CANCELLED'] } },
        orderBy: { issueDate: 'asc' },
      }),
    ]);
    return { customers, outstanding };
  } catch {
    return { customers: [], outstanding: [] };
  }
}

export default async function CustomersPage() {
  const { customers, outstanding } = await getData();
  const owed = outstanding
    .map((d) => ({ ...d, remain: d.total - d.paidAmount }))
    .filter((d) => d.remain > 0.01);
  const totalOwed = owed.reduce((s, d) => s + d.remain, 0);

  const fields: FieldDef[] = [
    { key: 'name', label: 'ชื่อลูกค้า', type: 'text', colSpan: 2 },
    { key: 'phone', label: 'เบอร์โทร', type: 'text' },
    { key: 'taxId', label: 'เลขผู้เสียภาษี', type: 'text' },
    { key: 'address', label: 'ที่อยู่', type: 'textarea' },
    { key: 'note', label: 'หมายเหตุ', type: 'textarea' },
  ];
  const defaults = { name: '', phone: '', address: '', taxId: '', note: '' };

  return (
    <div><h1 className="mb-1 text-2xl font-bold text-neutral-800">ลูกค้า / ค้างชำระ</h1><p className="mb-6 text-neutral-500">ทะเบียนลูกค้า และยอดค้างชำระจากใบวางบิล</p>

      {/* ค้างชำระ */}
      <section className="mb-8"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-neutral-800">ยอดค้างชำระ</h2><span className="rounded-lg bg-red-50 px-3 py-1 font-bold text-red-700">
            รวม ฿{formatBaht(totalOwed)}
          </span></div>
        {owed.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-neutral-500">
            ไม่มียอดค้างชำระ 
          </p>
        ) : (
          <div className="card divide-y divide-neutral-100">
            {owed.map((d) => (
              <Link
                key={d.id}
                href={`/admin/documents/${d.id}`}
                className="flex items-center gap-3 p-3 text-sm hover:bg-neutral-50"
              ><div className="min-w-0 flex-1"><div className="font-semibold text-brand-800">{d.docNumber}</div><div className="truncate text-neutral-500">{d.customerName || 'ไม่ระบุลูกค้า'}</div></div><div className="text-right"><div className="font-bold text-red-600">ค้าง ฿{formatBaht(d.remain)}</div><div className="text-xs text-neutral-400">
                    ยอด ฿{formatBaht(d.total)} • จ่ายแล้ว ฿{formatBaht(d.paidAmount)}
                  </div></div></Link>
            ))}
          </div>
        )}
      </section><h2 className="mb-3 text-lg font-bold text-neutral-800">ทะเบียนลูกค้า</h2><CollectionManager
        endpoint="/api/customers"
        items={customers.map((it) => ({ ...it, __subtitle: it.phone || it.address || '' }))}
        fields={fields}
        defaults={defaults}
        titleKey="name"
        addLabel="เพิ่มลูกค้า"
      /></div> );
}
