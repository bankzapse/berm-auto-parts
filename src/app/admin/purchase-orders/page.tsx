import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatBaht } from '@/lib/documents';

async function getPOs() {
  try {
    return await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { supplier: true },
      take: 200,
    });
  } catch {
    return [];
  }
}

const STATUS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'ร่าง', color: 'bg-neutral-100 text-neutral-600' },
  ORDERED: { label: 'สั่งแล้ว', color: 'bg-blue-100 text-blue-700' },
  RECEIVED: { label: 'รับของแล้ว', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'ยกเลิก', color: 'bg-red-100 text-red-600' },
};

export default async function PurchaseOrdersPage() {
  const pos = await getPOs();
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">ใบสั่งซื้อ (รับของเข้า)</h1>
          <p className="text-neutral-500">สั่งซื้อจากซัพพลายเออร์ แล้วรับของเข้าสต็อกอัตโนมัติ</p>
        </div>
        <Link href="/admin/purchase-orders/new" className="btn-primary">➕ สร้างใบสั่งซื้อ</Link>
      </div>

      {pos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          ยังไม่มีใบสั่งซื้อ
        </p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="p-3">เลขที่</th>
                <th className="p-3">ซัพพลายเออร์</th>
                <th className="p-3 text-right">ยอดรวม</th>
                <th className="p-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => (
                <tr key={po.id} className="border-t border-neutral-100">
                  <td className="p-3">
                    <Link href={`/admin/purchase-orders/${po.id}`} className="font-semibold text-brand-800 hover:underline">
                      {po.poNumber}
                    </Link>
                    <div className="text-xs text-neutral-400">
                      {new Date(po.orderDate).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                    </div>
                  </td>
                  <td className="p-3 text-neutral-700">{po.supplier?.name || '—'}</td>
                  <td className="p-3 text-right font-semibold">฿{formatBaht(po.total)}</td>
                  <td className="p-3 text-center">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${STATUS[po.status]?.color}`}>
                      {STATUS[po.status]?.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
