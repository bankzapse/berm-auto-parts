import { prisma } from '@/lib/prisma';
import { isOwner } from '@/lib/session';
import { formatBaht } from '@/lib/documents';
import BackupButton from './BackupButton';

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}
// วันในเขตเวลาไทย (กันยอดช่วงเช้ามืดตกไปวันก่อนหน้าเพราะ UTC)
function bkkYmd(d: Date) {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
}

async function load(fromStr: string, toStr: string) {
  const from = new Date(fromStr + 'T00:00:00');
  const to = new Date(toStr + 'T00:00:00');
  to.setDate(to.getDate() + 1); // inclusive
  try {
    const [docs, products] = await Promise.all([
      prisma.document.findMany({
        where: { type: { in: ['RECEIPT', 'INVOICE'] }, status: { not: 'CANCELLED' }, issueDate: { gte: from, lt: to } },
        include: { items: true },
      }),
      prisma.product.findMany({ select: { id: true, name: true, cost: true, stock: true, lowStock: true, unit: true } }),
    ]);
    return { docs, products, ok: true };
  } catch {
    return { docs: [], products: [], ok: false };
  }
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  if (!(await isOwner())) {
    return <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-800"> หน้านี้สำหรับเจ้าของร้านเท่านั้น</div>;
  }

  const now = new Date();
  const sp = await searchParams;
  const from = sp.from || ymd(new Date(now.getFullYear(), now.getMonth(), 1));
  const to = sp.to || ymd(now);
  const { docs, products, ok } = await load(from, to);

  const costMap = new Map(products.map((p) => [p.id, p.cost ?? 0]));
  const todayStr = bkkYmd(now);

  let totalSales = 0;
  let grossProfit = 0;
  const byMethod: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  const sellers = new Map<string, { name: string; qty: number; amount: number }>();
  const soldIds = new Set<string>();
  let todayTotal = 0;
  let todayCount = 0;
  const todayByMethod: Record<string, number> = {};

  for (const d of docs) {
    totalSales += d.total;
    byMethod[d.paymentMethod] = (byMethod[d.paymentMethod] || 0) + d.total;
    const day = bkkYmd(new Date(d.issueDate));
    byDay[day] = (byDay[day] || 0) + d.total;
    if (day === todayStr) {
      todayTotal += d.total;
      todayCount++;
      todayByMethod[d.paymentMethod] = (todayByMethod[d.paymentMethod] || 0) + d.total;
    }
    for (const it of d.items) {
      const cost = it.productId ? costMap.get(it.productId) ?? 0 : 0;
      grossProfit += (it.unitPrice - cost) * it.quantity;
      if (it.productId) soldIds.add(it.productId);
      const key = it.productId || it.name;
      const cur = sellers.get(key) || { name: it.name, qty: 0, amount: 0 };
      cur.qty += it.quantity;
      cur.amount += it.amount;
      sellers.set(key, cur);
    }
    // หักส่วนลดระดับบิลออกจากกำไรขั้นต้น (ให้สอดคล้องกับรายได้หลังส่วนลด)
    grossProfit -= d.discount;
  }

  const topSellers = [...sellers.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);
  const lowStock = products.filter((p) => p.stock <= 0 || (p.lowStock > 0 && p.stock <= p.lowStock));
  const deadStock = products.filter((p) => p.stock > 0 && !soldIds.has(p.id)).sort((a, b) => b.stock - a.stock).slice(0, 15);
  const dayEntries = Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0]));
  const maxDay = Math.max(1, ...dayEntries.map(([, v]) => v));
  const methodLabel: Record<string, string> = { cash: 'เงินสด', transfer: 'โอนเงิน', credit: 'เครดิต' };

  return (
    <div className="space-y-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-neutral-800">รายงาน & ปิดยอด</h1><p className="text-neutral-500">สรุปยอดขาย กำไร สินค้าขายดี และสต็อก</p></div><BackupButton /></div>

      {!ok && <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800"> อ่านข้อมูลไม่ได้ — ตรวจสอบการเชื่อมต่อฐานข้อมูล</div>}

      {/* ปิดยอดวันนี้ */}
      <section className="rounded-2xl bg-brand-800 p-5 text-white"><h2 className="mb-3 text-lg font-bold"> ปิดยอดวันนี้ ({new Date().toLocaleDateString('th-TH', { dateStyle: 'medium' })})</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><div><div className="text-2xl font-bold">฿{formatBaht(todayTotal)}</div><div className="text-sm text-brand-200">ยอดขายรวม</div></div><div><div className="text-2xl font-bold">{todayCount}</div><div className="text-sm text-brand-200">จำนวนบิล</div></div><div><div className="text-2xl font-bold">฿{formatBaht(todayByMethod.cash || 0)}</div><div className="text-sm text-brand-200">เงินสด</div></div><div><div className="text-2xl font-bold">฿{formatBaht((todayByMethod.transfer || 0))}</div><div className="text-sm text-brand-200">โอนเงิน</div></div></div></section>

      {/* ช่วงวันที่ */}
      <form className="card flex flex-wrap items-end gap-3 p-4"><label className="text-sm"><span className="label">ตั้งแต่</span><input type="date" name="from" defaultValue={from} className="input" /></label><label className="text-sm"><span className="label">ถึง</span><input type="date" name="to" defaultValue={to} className="input" /></label><button className="btn-primary">ดูรายงาน</button></form>

      {/* สรุปช่วง */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="ยอดขายรวม" value={`฿${formatBaht(totalSales)}`} /><Stat label="กำไรขั้นต้น (ประมาณ)" value={`฿${formatBaht(grossProfit)}`} tone="good" /><Stat label="จำนวนบิล" value={String(docs.length)} /><Stat label="เฉลี่ย/บิล" value={`฿${formatBaht(docs.length ? totalSales / docs.length : 0)}`} /></div>

      {/* ยอดขายรายวัน */}
      {dayEntries.length > 0 && (
        <section><h2 className="mb-3 text-lg font-bold text-neutral-800">ยอดขายรายวัน</h2><div className="card space-y-2 p-4">
            {dayEntries.map(([day, val]) => (
              <div key={day} className="flex items-center gap-3 text-sm"><span className="w-20 shrink-0 text-neutral-500">{new Date(day).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' })}</span><div className="h-5 flex-1 overflow-hidden rounded bg-neutral-100"><div className="h-full rounded bg-brand-500" style={{ width: `${(val / maxDay) * 100}%` }} /></div><span className="w-24 shrink-0 text-right font-medium">฿{formatBaht(val)}</span></div>
            ))}
          </div></section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ขายดี */}
        <section><h2 className="mb-3 text-lg font-bold text-neutral-800">สินค้าขายดี (ตามจำนวน)</h2><div className="card divide-y divide-neutral-100">
            {topSellers.length === 0 ? <p className="p-6 text-center text-neutral-400">ยังไม่มีข้อมูล</p> :
              topSellers.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 text-sm"><span className="min-w-0 flex-1 truncate"><span className="mr-2 text-neutral-400">{i + 1}.</span>{s.name}</span><span className="ml-3 shrink-0 font-semibold text-brand-800">{s.qty} <span className="text-xs font-normal text-neutral-400">ชิ้น</span></span></div>
              ))}
          </div></section>

        {/* dead stock */}
        <section><h2 className="mb-3 text-lg font-bold text-neutral-800">สินค้าค้างสต็อก (ไม่มีการขายในช่วงนี้)</h2><div className="card divide-y divide-neutral-100">
            {deadStock.length === 0 ? <p className="p-6 text-center text-neutral-400">ไม่มี</p> :
              deadStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 text-sm"><span className="min-w-0 flex-1 truncate">{p.name}</span><span className="ml-3 shrink-0 text-neutral-500">คงเหลือ {p.stock} {p.unit}</span></div>
              ))}
          </div></section></div>

      {/* ของใกล้หมด */}
      <section><h2 className="mb-3 text-lg font-bold text-neutral-800">ของใกล้หมด / หมดสต็อก ({lowStock.length})</h2><div className="card divide-y divide-neutral-100">
          {lowStock.length === 0 ? <p className="p-6 text-center text-neutral-400">สต็อกปกติดี </p> :
            lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 text-sm"><span className="min-w-0 flex-1 truncate">{p.name}</span><span className={`ml-3 shrink-0 font-semibold ${p.stock <= 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {p.stock <= 0 ? 'หมด' : `เหลือ ${p.stock} ${p.unit}`}
                </span></div>
            ))}
        </div></section><p className="text-xs text-neutral-400">* กำไรขั้นต้นคำนวณจาก (ราคาขาย − ต้นทุน) × จำนวน ต่อรายการ ยังไม่หักส่วนลด/VAT ระดับบิล</p></div> );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' }) {
  return (
    <div className="card p-4"><div className={`text-2xl font-bold ${tone === 'good' ? 'text-green-600' : 'text-brand-800'}`}>{value}</div><div className="mt-1 text-xs text-neutral-500">{label}</div></div> );
}
