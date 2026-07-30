'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/admin/ui';

type P = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  stock: number;
  lowStock: number;
  cost: number | null;
  price: number | null;
  category: string;
};

type M = {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  balance: number;
  note: string;
  refDoc: string;
  createdAt: string;
  productName: string;
  unit: string;
};

const TYPE_LABEL: Record<string, string> = { IN: 'รับเข้า', OUT: 'ตัดออก', ADJUST: 'นับ/ปรับ' };
const TYPE_COLOR: Record<string, string> = {
  IN: 'bg-green-100 text-green-700',
  OUT: 'bg-red-100 text-red-700',
  ADJUST: 'bg-amber-100 text-amber-700',
};

export default function InventoryTool({ products, movements }: { products: P[]; movements: M[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<{ product: P; type: 'IN' | 'OUT' | 'ADJUST' } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    );
  }, [products, search]);

  const totalValue = products.reduce((sum, p) => sum + (p.cost || 0) * p.stock, 0);
  const lowCount = products.filter((p) => p.stock <= p.lowStock && p.lowStock > 0).length;
  const outCount = products.filter((p) => p.stock <= 0).length;
  const fmt = (n: number) => new Intl.NumberFormat('th-TH').format(n);

  return (
    <div className="space-y-6">
      {/* สรุป */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="รายการสินค้า" value={fmt(products.length)} />
        <Stat label="มูลค่าสต็อก (ทุน)" value={`฿${fmt(Math.round(totalValue))}`} />
        <Stat label="ใกล้หมด" value={fmt(lowCount)} tone={lowCount ? 'warn' : undefined} />
        <Stat label="หมดสต็อก" value={fmt(outCount)} tone={outCount ? 'danger' : undefined} />
      </div>

      <input
        className="input"
        placeholder="ค้นหาสินค้า / รหัส / หมวด…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ตารางสต็อก */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="p-3">สินค้า</th>
              <th className="p-3">รหัส</th>
              <th className="p-3 text-right">คงเหลือ</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const low = p.lowStock > 0 && p.stock <= p.lowStock;
              const out = p.stock <= 0;
              return (
                <tr key={p.id} className="border-t border-neutral-100">
                  <td className="p-3">
                    <div className="font-medium text-neutral-800">{p.name}</div>
                    <div className="text-xs text-neutral-400">{p.category}</div>
                  </td>
                  <td className="p-3 text-neutral-500">{p.sku || '—'}</td>
                  <td className="p-3 text-right">
                    <span
                      className={`font-bold ${out ? 'text-red-600' : low ? 'text-amber-600' : 'text-neutral-800'}`}
                    >
                      {fmt(p.stock)}
                    </span>{' '}
                    <span className="text-xs text-neutral-400">{p.unit}</span>
                    {out ? <div className="text-xs text-red-500">หมดสต็อก</div> : low ? <div className="text-xs text-amber-500">ใกล้หมด</div> : null}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-1">
                      <Btn color="green" onClick={() => setDialog({ product: p, type: 'IN' })}>+ รับเข้า</Btn>
                      <Btn color="red" onClick={() => setDialog({ product: p, type: 'OUT' })}>- ตัดออก</Btn>
                      <Btn color="amber" onClick={() => setDialog({ product: p, type: 'ADJUST' })}>นับ</Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-neutral-400">
                  ไม่พบสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ประวัติล่าสุด */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-neutral-800">ประวัติการเคลื่อนไหวล่าสุด</h2>
        <div className="card divide-y divide-neutral-100">
          {movements.length === 0 ? (
            <p className="p-6 text-center text-neutral-400">ยังไม่มีประวัติ</p>
          ) : (
            movements.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 text-sm">
                <span className={`rounded-md px-2 py-1 text-xs font-semibold ${TYPE_COLOR[m.type]}`}>
                  {TYPE_LABEL[m.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-neutral-800">{m.productName}</div>
                  {m.note || m.refDoc ? (
                    <div className="truncate text-xs text-neutral-400">
                      {m.refDoc ? `#${m.refDoc} ` : ''}{m.note}
                    </div>
                  ) : null}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-neutral-700">
                    {m.type === 'OUT' ? '-' : m.type === 'IN' ? '+' : '='}
                    {fmt(m.quantity)} {m.unit}
                  </div>
                  <div className="text-xs text-neutral-400">เหลือ {fmt(m.balance)}</div>
                </div>
                <div className="hidden w-28 text-right text-xs text-neutral-400 sm:block">
                  {new Date(m.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {dialog && (
        <MovementDialog
          product={dialog.product}
          type={dialog.type}
          onClose={() => setDialog(null)}
          onDone={() => {
            setDialog(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function MovementDialog({
  product,
  type,
  onClose,
  onDone,
}: {
  product: P;
  type: 'IN' | 'OUT' | 'ADJUST';
  onClose: () => void;
  onDone: () => void;
}) {
  const [qty, setQty] = useState<string>(type === 'ADJUST' ? String(product.stock) : '1');
  const [note, setNote] = useState('');
  const [unitCost, setUnitCost] = useState<string>(product.cost != null ? String(product.cost) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const title =
    type === 'IN' ? 'รับสินค้าเข้า' : type === 'OUT' ? 'ตัดสินค้าออก' : 'นับสต็อก (ปรับยอด)';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/inventory/movement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          type,
          quantity: Number(qty),
          note,
          unitCost: type === 'IN' ? unitCost : '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'ทำรายการไม่สำเร็จ');
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ทำรายการไม่สำเร็จ');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-brand-800">{title}</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {product.name} • คงเหลือปัจจุบัน {product.stock} {product.unit}
        </p>

        <label className="mt-4 block">
          <span className="label">{type === 'ADJUST' ? `ยอดนับจริง (${product.unit})` : `จำนวน (${product.unit})`}</span>
          <input
            type="number"
            min={0}
            step="1"
            className="input"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            autoFocus
            required
          />
        </label>

        {type === 'IN' && (
          <label className="mt-3 block">
            <span className="label">ต้นทุนต่อหน่วย (บาท)</span>
            <input type="number" step="0.01" className="input" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
          </label>
        )}

        <label className="mt-3 block">
          <span className="label">หมายเหตุ</span>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น รับจากซัพพลายเออร์ / ขายหน้าร้าน" />
        </label>

        {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-outline">ยกเลิก</button>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-70">
            {saving ? <><Spinner /> กำลังบันทึก…</> : 'บันทึก'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'warn' | 'danger' }) {
  const color = tone === 'danger' ? 'text-red-600' : tone === 'warn' ? 'text-amber-600' : 'text-brand-800';
  return (
    <div className="card p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="mt-1 text-xs text-neutral-500">{label}</div>
    </div>
  );
}

function Btn({ color, onClick, children }: { color: 'green' | 'red' | 'amber'; onClick: () => void; children: React.ReactNode }) {
  const map = {
    green: 'text-green-700 hover:bg-green-50',
    red: 'text-red-600 hover:bg-red-50',
    amber: 'text-amber-700 hover:bg-amber-50',
  };
  return (
    <button onClick={onClick} className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ${map[color]}`}>
      {children}
    </button>
  );
}
