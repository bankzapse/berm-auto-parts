import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { docTypeLabel, docStatusLabel, formatBaht } from '@/lib/documents';
import DeleteDocButton from './DeleteDocButton';

async function getDocs() {
  try {
    return await prisma.document.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  } catch {
    return [];
  }
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-600',
  ISSUED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default async function DocumentsPage() {
  const docs = await getDocs();
  return (
    <div><div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-neutral-800">ใบเสร็จ / ใบวางบิล</h1><p className="text-neutral-500">ออกเอกสารการขายและพิมพ์ได้</p></div><Link href="/admin/documents/new" className="btn-primary">
           สร้างเอกสาร
        </Link></div>

      {docs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          ยังไม่มีเอกสาร — กด “สร้างเอกสาร” เพื่อเริ่ม
        </p>
      ) : (
        <div className="card overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="bg-neutral-50 text-left text-neutral-500"><tr><th className="p-3">เลขที่</th><th className="p-3">ประเภท</th><th className="p-3">ลูกค้า</th><th className="p-3 text-right">ยอดรวม</th><th className="p-3 text-center">สถานะ</th><th className="p-3 text-center">จัดการ</th></tr></thead><tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-t border-neutral-100"><td className="p-3"><div className="font-semibold text-brand-800">{d.docNumber}</div><div className="text-xs text-neutral-400">
                      {new Date(d.issueDate).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                    </div></td><td className="p-3 text-neutral-600">{docTypeLabel(d.type)}</td><td className="p-3 text-neutral-700">{d.customerName || '—'}</td><td className="p-3 text-right font-semibold text-neutral-800">฿{formatBaht(d.total)}</td><td className="p-3 text-center"><span className={`rounded-md px-2 py-1 text-xs font-medium ${STATUS_COLOR[d.status]}`}>
                      {docStatusLabel(d.status)}
                    </span></td><td className="p-3"><div className="flex justify-center gap-1"><Link href={`/admin/documents/${d.id}`} className="rounded-md px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                        เปิด/พิมพ์
                      </Link><DeleteDocButton id={d.id} label={d.docNumber} /></div></td></tr>
              ))}
            </tbody></table></div>
      )}
    </div> );
}
