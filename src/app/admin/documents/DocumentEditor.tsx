'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner, NumberInput } from '@/components/admin/ui';
import {
  DOC_TYPES,
  DOC_STATUS,
  computeTotals,
  docTypeLabel,
  formatBaht,
  type DocTypeKey,
} from '@/lib/documents';

type ProductLite = { id: string; name: string; sku: string; unit: string; price: number | null };
type ShopInfo = {
  shopName: string;
  address: string;
  phone: string;
  phone2: string;
  taxId: string;
  docFooter: string;
  logo: string;
};
type Item = {
  productId: string | null;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  unitPrice: number;
};
export type DocData = {
  id?: string;
  docNumber?: string;
  type: DocTypeKey;
  status: string;
  issueDate: string; // yyyy-mm-dd
  dueDate: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerTaxId: string;
  note: string;
  paymentMethod: string;
  paidAmount: number;
  discount: number;
  vatRate: number;
  items: Item[];
};

const PAYMENT_METHODS = [
  { value: 'cash', label: 'เงินสด' },
  { value: 'transfer', label: 'โอนเงิน' },
  { value: 'credit', label: 'เครดิต (ค้างชำระ)' },
];

export default function DocumentEditor({
  mode,
  initial,
  products,
  shop,
}: {
  mode: 'new' | 'edit';
  initial: DocData;
  products: ProductLite[];
  shop: ShopInfo;
}) {
  const router = useRouter();
  const [d, setD] = useState<DocData>(initial);
  const [deductStock, setDeductStock] = useState(mode === 'new' && initial.type === 'RECEIPT');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const totals = useMemo(
    () => computeTotals(d.items, d.discount, d.vatRate),
    [d.items, d.discount, d.vatRate],
  );

  const set = <K extends keyof DocData>(k: K, v: DocData[K]) => setD((p) => ({ ...p, [k]: v }));

  function updateItem(i: number, patch: Partial<Item>) {
    setD((p) => ({ ...p, items: p.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }));
  }
  function removeItem(i: number) {
    setD((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  }
  function addBlankRow() {
    setD((p) => ({ ...p, items: [...p.items, { productId: null, name: '', sku: '', unit: 'ชิ้น', quantity: 1, unitPrice: 0 }] }));
  }
  function addProduct(prod: ProductLite) {
    setD((p) => ({
      ...p,
      items: [
        ...p.items,
        { productId: prod.id, name: prod.name, sku: prod.sku, unit: prod.unit || 'ชิ้น', quantity: 1, unitPrice: prod.price ?? 0 },
      ],
    }));
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
      const payload = { ...d, deductStock };
      const res = await fetch(mode === 'new' ? '/api/documents' : `/api/documents/${d.id}`, {
        method: mode === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      if (mode === 'new') {
        router.push(`/admin/documents/${data.item.id}`);
      } else {
        setD((p) => ({ ...p, docNumber: data.item.docNumber }));
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ===== ฟอร์ม (ไม่พิมพ์) ===== */}
      <div className="no-print space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <a href="/admin/documents" className="text-sm text-neutral-500 hover:text-brand-700">← กลับ</a>
          <h1 className="text-xl font-bold text-neutral-800">
            {mode === 'new' ? 'สร้างเอกสารใหม่' : `แก้ไข ${d.docNumber || ''}`}
          </h1>
        </div>

        <div className="card grid gap-4 p-5 sm:grid-cols-3">
          <label>
            <span className="label">ประเภทเอกสาร</span>
            <select className="input" value={d.type} onChange={(e) => set('type', e.target.value as DocTypeKey)}>
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">สถานะ</span>
            <select className="input" value={d.status} onChange={(e) => set('status', e.target.value)}>
              {DOC_STATUS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">วันที่เอกสาร</span>
            <input type="date" className="input" value={d.issueDate} onChange={(e) => set('issueDate', e.target.value)} />
          </label>
        </div>

        {/* ลูกค้า */}
        <div className="card grid gap-4 p-5 sm:grid-cols-2">
          <label>
            <span className="label">ชื่อลูกค้า</span>
            <input className="input" value={d.customerName} onChange={(e) => set('customerName', e.target.value)} />
          </label>
          <label>
            <span className="label">เบอร์โทรลูกค้า</span>
            <input className="input" value={d.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} />
          </label>
          <label className="sm:col-span-2">
            <span className="label">ที่อยู่ลูกค้า</span>
            <input className="input" value={d.customerAddress} onChange={(e) => set('customerAddress', e.target.value)} />
          </label>
          <label>
            <span className="label">เลขผู้เสียภาษีลูกค้า</span>
            <input className="input" value={d.customerTaxId} onChange={(e) => set('customerTaxId', e.target.value)} />
          </label>
          {d.type !== 'RECEIPT' && (
            <label>
              <span className="label">ครบกำหนดชำระ</span>
              <input type="date" className="input" value={d.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
            </label>
          )}
        </div>

        {/* รายการสินค้า */}
        <div className="card p-5">
          <h2 className="mb-3 font-bold text-brand-800">รายการสินค้า</h2>

          <div className="relative mb-3">
            <input
              className="input"
              placeholder="🔍 ค้นหาสินค้าเพื่อเพิ่ม (หรือกดปุ่มเพิ่มแถวว่างด้านล่าง)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {found.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
                {found.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addProduct(p)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-brand-50"
                  >
                    <span>{p.name} <span className="text-neutral-400">{p.sku}</span></span>
                    <span className="text-neutral-500">{p.price != null ? `฿${formatBaht(p.price)}` : '-'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="text-left text-neutral-500">
                <tr>
                  <th className="p-2">รายการ</th>
                  <th className="w-20 p-2 text-right">จำนวน</th>
                  <th className="w-20 p-2">หน่วย</th>
                  <th className="w-28 p-2 text-right">ราคา/หน่วย</th>
                  <th className="w-28 p-2 text-right">รวม</th>
                  <th className="w-10 p-2" />
                </tr>
              </thead>
              <tbody>
                {d.items.map((it, i) => (
                  <tr key={i} className="border-t border-neutral-100">
                    <td className="p-1">
                      <input className="input" value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} placeholder="ชื่อรายการ" />
                    </td>
                    <td className="p-1">
                      <NumberInput step="any" className="input text-right" value={it.quantity}
                        onChange={(v) => updateItem(i, { quantity: v ?? 0 })} />
                    </td>
                    <td className="p-1">
                      <input className="input" value={it.unit} onChange={(e) => updateItem(i, { unit: e.target.value })} />
                    </td>
                    <td className="p-1">
                      <NumberInput step="0.01" className="input text-right" value={it.unitPrice}
                        onChange={(v) => updateItem(i, { unitPrice: v ?? 0 })} />
                    </td>
                    <td className="p-2 text-right font-medium text-neutral-700">
                      ฿{formatBaht((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0))}
                    </td>
                    <td className="p-1 text-center">
                      <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700">✕</button>
                    </td>
                  </tr>
                ))}
                {d.items.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-neutral-400">ยังไม่มีรายการ</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <button onClick={addBlankRow} className="btn-outline mt-3 py-2 text-sm">➕ เพิ่มแถวว่าง</button>
        </div>

        {/* ยอดรวม + ตัวเลือก */}
        <div className="card grid gap-4 p-5 sm:grid-cols-2">
          <div className="space-y-3">
            <label>
              <span className="label">ส่วนลด (บาท)</span>
              <NumberInput step="0.01" value={d.discount} onChange={(v) => set('discount', v ?? 0)} />
            </label>
            <label>
              <span className="label">ภาษีมูลค่าเพิ่ม VAT (%)</span>
              <NumberInput step="0.01" value={d.vatRate} onChange={(v) => set('vatRate', v ?? 0)} placeholder="0 = ไม่มี VAT, 7 = VAT 7%" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="label">วิธีชำระ</span>
                <select className="input" value={d.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">ยอดชำระแล้ว (บาท)</span>
                <NumberInput step="0.01" value={d.paidAmount} onChange={(v) => set('paidAmount', v ?? 0)} />
              </label>
            </div>
            <label>
              <span className="label">หมายเหตุ</span>
              <textarea className="input min-h-20" value={d.note} onChange={(e) => set('note', e.target.value)} />
            </label>
            {d.type === 'RECEIPT' && mode === 'new' && (
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                <input type="checkbox" className="h-5 w-5" checked={deductStock} onChange={(e) => setDeductStock(e.target.checked)} />
                ตัดสต็อกสินค้าอัตโนมัติเมื่อบันทึก
              </label>
            )}
          </div>

          <div className="rounded-xl bg-neutral-50 p-4 text-sm">
            <Row label="รวมเป็นเงิน" value={`฿${formatBaht(totals.subtotal)}`} />
            {totals.discount > 0 && <Row label="ส่วนลด" value={`-฿${formatBaht(totals.discount)}`} />}
            {totals.vatRate > 0 && <Row label={`VAT ${totals.vatRate}%`} value={`฿${formatBaht(totals.vatAmount)}`} />}
            <div className="mt-2 border-t border-neutral-300 pt-2">
              <Row label="ยอดสุทธิ" value={`฿${formatBaht(totals.total)}`} big />
            </div>
            {d.paidAmount > 0 && <Row label="ชำระแล้ว" value={`฿${formatBaht(d.paidAmount)}`} />}
            {totals.total - d.paidAmount > 0.01 && (
              <Row label="ค้างชำระ" value={`฿${formatBaht(totals.total - d.paidAmount)}`} />
            )}
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="sticky bottom-4 flex flex-wrap items-center gap-3">
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-70">
            {saving ? <><Spinner /> กำลังบันทึก…</> : mode === 'new' ? 'บันทึกเอกสาร' : 'บันทึกการแก้ไข'}
          </button>
          {mode === 'edit' && (
            <button onClick={() => window.print()} className="btn-outline">🖨️ พิมพ์เอกสาร</button>
          )}
          {mode === 'new' && <span className="text-sm text-neutral-500">บันทึกก่อนจึงจะพิมพ์ได้</span>}
        </div>
      </div>

      {/* ===== พื้นที่พิมพ์ (เฉพาะตอนแก้ไข/มีเลขที่) ===== */}
      {mode === 'edit' && (
        <PrintView d={d} totals={totals} shop={shop} />
      )}
    </div>
  );
}

function PrintView({
  d,
  totals,
  shop,
}: {
  d: DocData;
  totals: ReturnType<typeof computeTotals>;
  shop: ShopInfo;
}) {
  return (
    <div className="print-area mx-auto max-w-[800px] rounded-xl border border-neutral-200 bg-white p-8 text-sm text-neutral-800">
      {/* หัวเอกสาร */}
      <div className="flex items-start justify-between border-b-2 border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          {shop.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shop.logo} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : null}
          <div>
            <div className="text-xl font-bold text-neutral-900">{shop.shopName}</div>
            <div className="text-xs text-neutral-500">{shop.address}</div>
            <div className="text-xs text-neutral-500">
              โทร {shop.phone}{shop.phone2 ? `, ${shop.phone2}` : ''}
              {shop.taxId ? ` • เลขภาษี ${shop.taxId}` : ''}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">
            {docTypeLabel(d.type)}
            {totals.vatRate > 0 && d.type === 'RECEIPT' ? '/ใบกำกับภาษี' : ''}
          </div>
          <div className="text-neutral-600">เลขที่: {d.docNumber}</div>
          <div className="text-neutral-600">
            วันที่: {d.issueDate ? new Date(d.issueDate).toLocaleDateString('th-TH', { dateStyle: 'medium' }) : '-'}
          </div>
        </div>
      </div>

      {/* ลูกค้า */}
      <div className="mt-4">
        <div className="font-semibold text-neutral-700">ลูกค้า</div>
        <div>{d.customerName || '-'}</div>
        {d.customerAddress ? <div className="text-neutral-600">{d.customerAddress}</div> : null}
        <div className="text-neutral-600">
          {d.customerPhone ? `โทร ${d.customerPhone}` : ''}
          {d.customerTaxId ? `  เลขภาษี ${d.customerTaxId}` : ''}
        </div>
      </div>

      {/* ตาราง */}
      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-y border-neutral-400 bg-neutral-50 text-left">
            <th className="p-2 text-center">#</th>
            <th className="p-2">รายการ</th>
            <th className="p-2 text-right">จำนวน</th>
            <th className="p-2 text-right">ราคา/หน่วย</th>
            <th className="p-2 text-right">จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          {totals.items.map((it, i) => (
            <tr key={i} className="border-b border-neutral-200">
              <td className="p-2 text-center">{i + 1}</td>
              <td className="p-2">
                {it.name}
                {it.sku ? <span className="text-neutral-400"> ({it.sku})</span> : null}
              </td>
              <td className="p-2 text-right">{it.quantity} {it.unit}</td>
              <td className="p-2 text-right">{formatBaht(it.unitPrice)}</td>
              <td className="p-2 text-right">{formatBaht(it.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ยอดรวม */}
      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-1">
          <Row label="รวมเป็นเงิน" value={`฿${formatBaht(totals.subtotal)}`} />
          {totals.discount > 0 && <Row label="ส่วนลด" value={`-฿${formatBaht(totals.discount)}`} />}
          {totals.vatRate > 0 && <Row label={`VAT ${totals.vatRate}%`} value={`฿${formatBaht(totals.vatAmount)}`} />}
          <div className="border-t border-neutral-800 pt-1">
            <Row label="ยอดสุทธิ" value={`฿${formatBaht(totals.total)}`} big />
          </div>
          {d.paidAmount > 0 && <Row label="ชำระแล้ว" value={`฿${formatBaht(d.paidAmount)}`} />}
          {totals.total - d.paidAmount > 0.01 && (
            <Row label="ค้างชำระ" value={`฿${formatBaht(totals.total - d.paidAmount)}`} />
          )}
        </div>
      </div>

      <div className="mt-3 text-xs text-neutral-500">
        วิธีชำระ: {PAYMENT_METHODS.find((m) => m.value === d.paymentMethod)?.label || d.paymentMethod}
      </div>
      {d.note ? <div className="mt-2 text-neutral-600">หมายเหตุ: {d.note}</div> : null}

      {/* ลายเซ็น */}
      <div className="mt-10 grid grid-cols-2 gap-8 text-center text-xs text-neutral-500">
        <div>
          <div className="mx-auto mt-8 w-40 border-t border-neutral-400 pt-1">ผู้รับเงิน / ผู้มีอำนาจ</div>
        </div>
        <div>
          <div className="mx-auto mt-8 w-40 border-t border-neutral-400 pt-1">ผู้รับสินค้า / ลูกค้า</div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-neutral-500">{shop.docFooter}</div>
    </div>
  );
}

function Row({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className={`flex justify-between ${big ? 'text-base font-bold text-brand-800' : 'text-neutral-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
