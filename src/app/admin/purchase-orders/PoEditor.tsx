'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/admin/ui';
import { formatBaht } from '@/lib/documents';

type ProductLite = { id: string; name: string; sku: string; unit: string; cost: number | null };
type SupplierLite = { id: string; name: string };
type Item = { productId: string | null; name: string; sku: string; unit: string; quantity: number; unitCost: number };

export type PoData = {
  id?: string;
  poNumber?: string;
  supplierId: string;
  status: string;
  orderDate: string;
  note: string;
  received: boolean;
  items: Item[];
};

const STATUSES = [
  { value: 'DRAFT', label: 'ร่าง' },
  { value: 'ORDERED', label: 'สั่งแล้ว' },
  { value: 'RECEIVED', label: 'รับของแล้ว' },
  { value: 'CANCELLED', label: 'ยกเลิก' },
];

export default function PoEditor({
  mode,
  initial,
  products,
  suppliers,
}: {
  mode: 'new' | 'edit';
  initial: PoData;
  products: ProductLite[];
  suppliers: SupplierLite[];
}) {
  const router = useRouter();
  const [d, setD] = useState<PoData>(initial);
  const [saving, setSaving] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const total = useMemo(() => d.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitCost) || 0), 0), [d.items]);
  const set = <K extends keyof PoData>(k: K, v: PoData[K]) => setD((p) => ({ ...p, [k]: v }));

  function updateItem(i: number, patch: Partial<Item>) {
    setD((p) => ({ ...p, items: p.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }));
  }
  function removeItem(i: number) {
    setD((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  }
  function addBlank() {
    setD((p) => ({ ...p, items: [...p.items, { productId: null, name: '', sku: '', unit: 'ชิ้น', quantity: 1, unitCost: 0 }] }));
  }
  function addProduct(prod: ProductLite) {
    setD((p) => ({ ...p, items: [...p.items, { productId: prod.id, name: prod.name, sku: prod.sku, unit: prod.unit || 'ชิ้น', quantity: 1, unitCost: prod.cost ?? 0 }] }));
    setSearch('');
  }
  const found = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 8);
  }, [products, search]);

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(mode === 'new' ? '/api/purchase-orders' : `/api/purchase-orders/${d.id}`, {
        method: mode === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      if (mode === 'new') router.push(`/admin/purchase-orders/${data.item.id}`);
      else { setD((p) => ({ ...p, poNumber: data.item.poNumber })); router.refresh(); }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function receive() {
    if (!confirm('ยืนยันรับของเข้าสต็อกตามใบสั่งซื้อนี้? (เพิ่มจำนวนคงเหลือให้สินค้า)')) return;
    setReceiving(true);
    setError('');
    try {
      const res = await fetch(`/api/purchase-orders/${d.id}/receive`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'รับของไม่สำเร็จ');
      alert(`รับของเข้าสต็อกแล้ว ${data.receivedCount} รายการ`);
      setD((p) => ({ ...p, received: true, status: 'RECEIVED' }));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'รับของไม่สำเร็จ');
    } finally {
      setReceiving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <a href="/admin/purchase-orders" className="text-sm text-neutral-500 hover:text-brand-700">← กลับ</a>
        <h1 className="text-xl font-bold text-neutral-800">
          {mode === 'new' ? 'สร้างใบสั่งซื้อ' : `ใบสั่งซื้อ ${d.poNumber || ''}`}
        </h1>
        {d.received && <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">รับของแล้ว</span>}
      </div>

      <div className="card grid gap-4 p-5 sm:grid-cols-3">
        <label>
          <span className="label">ซัพพลายเออร์</span>
          <select className="input" value={d.supplierId} onChange={(e) => set('supplierId', e.target.value)}>
            <option value="">— ไม่ระบุ —</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label>
          <span className="label">สถานะ</span>
          <select className="input" value={d.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <label>
          <span className="label">วันที่สั่ง</span>
          <input type="date" className="input" value={d.orderDate} onChange={(e) => set('orderDate', e.target.value)} />
        </label>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-bold text-brand-800">รายการสินค้าที่สั่ง</h2>
        <div className="relative mb-3">
          <input className="input" placeholder="🔍 ค้นหาสินค้าเพื่อเพิ่ม" value={search} onChange={(e) => setSearch(e.target.value)} />
          {found.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
              {found.map((p) => (
                <button key={p.id} onClick={() => addProduct(p)} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-brand-50">
                  <span>{p.name} <span className="text-neutral-400">{p.sku}</span></span>
                  <span className="text-neutral-500">ทุน {p.cost != null ? formatBaht(p.cost) : '-'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-neutral-500">
              <tr>
                <th className="p-2">รายการ</th>
                <th className="w-20 p-2 text-right">จำนวน</th>
                <th className="w-20 p-2">หน่วย</th>
                <th className="w-28 p-2 text-right">ทุน/หน่วย</th>
                <th className="w-28 p-2 text-right">รวม</th>
                <th className="w-10 p-2" />
              </tr>
            </thead>
            <tbody>
              {d.items.map((it, i) => (
                <tr key={i} className="border-t border-neutral-100">
                  <td className="p-1"><input className="input" value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} /></td>
                  <td className="p-1"><input type="number" step="any" className="input text-right" value={it.quantity} onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })} /></td>
                  <td className="p-1"><input className="input" value={it.unit} onChange={(e) => updateItem(i, { unit: e.target.value })} /></td>
                  <td className="p-1"><input type="number" step="0.01" className="input text-right" value={it.unitCost} onChange={(e) => updateItem(i, { unitCost: Number(e.target.value) })} /></td>
                  <td className="p-2 text-right font-medium">฿{formatBaht((Number(it.quantity) || 0) * (Number(it.unitCost) || 0))}</td>
                  <td className="p-1 text-center"><button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700">✕</button></td>
                </tr>
              ))}
              {d.items.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-neutral-400">ยังไม่มีรายการ</td></tr>}
            </tbody>
          </table>
        </div>
        <button onClick={addBlank} className="btn-outline mt-3 py-2 text-sm">➕ เพิ่มแถวว่าง</button>

        <div className="mt-4 flex justify-end text-lg font-bold text-brand-800">
          รวมทั้งสิ้น ฿{formatBaht(total)}
        </div>
      </div>

      <label className="block">
        <span className="label">หมายเหตุ</span>
        <textarea className="input min-h-20" value={d.note} onChange={(e) => set('note', e.target.value)} />
      </label>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-70">
          {saving ? <><Spinner /> กำลังบันทึก…</> : mode === 'new' ? 'บันทึกใบสั่งซื้อ' : 'บันทึกการแก้ไข'}
        </button>
        {mode === 'edit' && !d.received && (
          <button onClick={receive} disabled={receiving} className="btn-outline border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-70">
            {receiving ? <><Spinner /> กำลังรับของ…</> : '📥 รับของเข้าสต็อก'}
          </button>
        )}
        {mode === 'new' && <span className="text-sm text-neutral-500">บันทึกก่อนจึงจะรับของเข้าสต็อกได้</span>}
      </div>
    </div>
  );
}
