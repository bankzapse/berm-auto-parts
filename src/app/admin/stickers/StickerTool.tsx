'use client';

import { useMemo, useRef, useState } from 'react';
import { barcodeDataUri } from '@/lib/barcode';
import { qrDataUri } from '@/lib/qrcodeSvg';
import { NumberInput } from '@/components/admin/ui';

type SP = {
  id: string;
  name: string;
  price: number | null;
  priceLabel: string;
  sku: string;
  barcode: string;
  brand: string;
};

// บรรทัดข้อความแบบกำหนดเอง (แต่ละบรรทัดตั้งขนาด/สี/ตัวหนาได้)
type Line = { id: number; text: string; size: number; color: string; bold: boolean };

type Sticker = {
  shopName?: string;
  lines?: Line[]; // โหมดกำหนดเอง: หลายบรรทัด
  title?: string; // โหมดสินค้า
  price?: string;
  code?: string;
  note?: string;
  codeValue?: string; // ค่าที่ใช้ทำบาร์โค้ด/QR
};

const FONTS = [
  { value: 'var(--font-thai), sans-serif', label: 'Sarabun (ค่าเริ่มต้น)' },
  { value: "'Tahoma', sans-serif", label: 'Tahoma' },
  { value: "'Times New Roman', serif", label: 'Times (มีหัว)' },
  { value: "'Courier New', monospace", label: 'Courier (ตัวพิมพ์ดีด)' },
];

const SIZES = {
  small: { w: 45, h: 25, base: 9, label: 'เล็ก 45×25 มม.' },
  medium: { w: 60, h: 35, base: 12, label: 'กลาง 60×35 มม.' },
  large: { w: 80, h: 45, base: 15, label: 'ใหญ่ 80×45 มม.' },
} as const;

export default function StickerTool({
  products,
  shopName,
  phone,
}: {
  products: SP[];
  shopName: string;
  phone: string;
}) {
  const [mode, setMode] = useState<'custom' | 'products'>('custom');

  // ตัวเลือกรูปแบบ
  const [font, setFont] = useState(FONTS[0].value);
  const [size, setSize] = useState<keyof typeof SIZES>('medium');
  const [columns, setColumns] = useState(3);
  const [bold, setBold] = useState(true);
  const [border, setBorder] = useState(true);
  const [showShop, setShowShop] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showCode, setShowCode] = useState(true);
  const [align, setAlign] = useState<'center' | 'left'>('center');
  const [codeType, setCodeType] = useState<'none' | 'barcode' | 'qr'>('none');

  // โหมดกำหนดเอง — เพิ่มบรรทัดได้ ตั้งขนาด/สี/ตัวหนาต่อบรรทัด
  const lineIdRef = useRef(3);
  const [customLines, setCustomLines] = useState<Line[]>([
    { id: 1, text: 'ชื่อสินค้า', size: 14, color: '#000000', bold: true },
    { id: 2, text: '฿0', size: 18, color: '#b52f2f', bold: true },
  ]);
  const [codeValueInput, setCodeValueInput] = useState('');
  const [copies, setCopies] = useState(6);

  function addLine() {
    setCustomLines((prev) => [...prev, { id: lineIdRef.current++, text: '', size: 12, color: '#000000', bold: false }]);
  }
  function updateLine(id: number, patch: Partial<Line>) {
    setCustomLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function removeLine(id: number) {
    setCustomLines((prev) => prev.filter((l) => l.id !== id));
  }
  function moveLine(id: number, dir: -1 | 1) {
    setCustomLines((prev) => {
      const i = prev.findIndex((l) => l.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  // โหมดจากสินค้า
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }, [products, search]);

  const priceText = (p: SP) =>
    p.price != null ? `฿${new Intl.NumberFormat('th-TH').format(p.price)}${p.priceLabel ? ' ' + p.priceLabel : ''}` : '';

  const stickers: Sticker[] = useMemo(() => {
    if (mode === 'custom') {
      const one: Sticker = {
        shopName: showShop ? shopName : undefined,
        lines: customLines.filter((l) => l.text.trim() !== ''),
        codeValue: codeValueInput || undefined,
      };
      return Array.from({ length: Math.max(1, Math.min(60, copies)) }, () => one);
    }
    // จากสินค้า
    const out: Sticker[] = [];
    for (const p of products) {
      const n = selected[p.id] || 0;
      for (let i = 0; i < n; i++) {
        out.push({
          shopName: showShop ? shopName : undefined,
          title: p.name,
          price: showPrice ? priceText(p) : undefined,
          code: showCode ? p.sku : undefined,
          note: p.brand || undefined,
          codeValue: p.barcode || p.sku || undefined,
        });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, products, selected, customLines, codeValueInput, copies, showShop, showPrice, showCode, shopName]);

  const dim = SIZES[size];

  return (
    <div className="space-y-6">
      {/* ==== ตัวเลือก (ไม่พิมพ์) ==== */}
      <div className="no-print space-y-6">
        <div className="flex gap-2">
          <TabBtn active={mode === 'custom'} onClick={() => setMode('custom')}>
            ✍️ กำหนดข้อความเอง
          </TabBtn>
          <TabBtn active={mode === 'products'} onClick={() => setMode('products')}>
            📦 เลือกจากสินค้า
          </TabBtn>
        </div>

        {mode === 'custom' ? (
          <div className="card space-y-3 p-5">
            <div className="flex items-center justify-between">
              <span className="label mb-0">บรรทัดข้อความ — เพิ่ม/ลบได้ ตั้งขนาด &amp; สีแต่ละบรรทัด</span>
              <button onClick={addLine} className="btn-outline py-1.5 text-sm">➕ เพิ่มบรรทัด</button>
            </div>

            {customLines.length === 0 ? (
              <p className="text-sm text-neutral-400">ยังไม่มีบรรทัด — กด “เพิ่มบรรทัด”</p>
            ) : null}

            <div className="space-y-2">
              {customLines.map((ln, idx) => (
                <div key={ln.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 p-2">
                  <input
                    className="input min-w-[8rem] flex-1"
                    value={ln.text}
                    onChange={(e) => updateLine(ln.id, { text: e.target.value })}
                    placeholder={`บรรทัดที่ ${idx + 1}`}
                    style={{ fontSize: `${Math.min(ln.size, 20)}px`, color: ln.color, fontWeight: ln.bold ? 700 : 400 }}
                  />
                  <label className="flex items-center gap-1 text-xs text-neutral-500">
                    ขนาด
                    <NumberInput
                      min={6} max={48}
                      className="w-16 rounded border border-neutral-300 px-2 py-1 text-sm"
                      value={ln.size}
                      emptyValue={12}
                      onChange={(v) => updateLine(ln.id, { size: v ?? 12 })}
                    />
                  </label>
                  <label className="flex items-center gap-1 text-xs text-neutral-500" title="สีข้อความ">
                    สี
                    <input
                      type="color"
                      className="h-8 w-10 cursor-pointer rounded border border-neutral-300"
                      value={ln.color}
                      onChange={(e) => updateLine(ln.id, { color: e.target.value })}
                    />
                  </label>
                  <label className="flex items-center gap-1 text-xs text-neutral-500">
                    <input type="checkbox" checked={ln.bold} onChange={(e) => updateLine(ln.id, { bold: e.target.checked })} /> หนา
                  </label>
                  <button onClick={() => moveLine(ln.id, -1)} className="px-1 text-neutral-400 hover:text-neutral-800" title="เลื่อนขึ้น">↑</button>
                  <button onClick={() => moveLine(ln.id, 1)} className="px-1 text-neutral-400 hover:text-neutral-800" title="เลื่อนลง">↓</button>
                  <button onClick={() => removeLine(ln.id)} className="px-1 text-red-500 hover:text-red-700" title="ลบบรรทัด">✕</button>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {codeType !== 'none' ? (
                <label>
                  <span className="label">ค่าบาร์โค้ด / QR</span>
                  <input className="input" value={codeValueInput} onChange={(e) => setCodeValueInput(e.target.value)} placeholder="เช่น 8850123456789 หรือ BRK-FR" />
                </label>
              ) : null}
              <label>
                <span className="label">จำนวนดวงที่พิมพ์</span>
                <NumberInput min={1} max={60} value={copies} emptyValue={1} onChange={(v) => setCopies(v ?? 1)} />
              </label>
            </div>
          </div>
        ) : (
          <div className="card p-5">
            <input
              className="input mb-3"
              placeholder="ค้นหาสินค้า / รหัส…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="p-4 text-center text-sm text-neutral-500">ไม่พบสินค้า</p>
              ) : (
                filtered.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg border border-neutral-200 p-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-neutral-500">
                        {p.sku || '—'} • {priceText(p) || 'ไม่มีราคา'}
                      </div>
                    </div>
                    <NumberInput
                      min={0}
                      max={60}
                      className="w-20 rounded-lg border border-neutral-300 px-2 py-1 text-sm"
                      value={selected[p.id] ?? 0}
                      emptyValue={0}
                      onChange={(v) => setSelected((prev) => ({ ...prev, [p.id]: v ?? 0 }))}
                    />
                    <span className="text-xs text-neutral-400">ดวง</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* รูปแบบสติกเกอร์ */}
        <div className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <label>
            <span className="label">ขนาดสติกเกอร์</span>
            <select className="input" value={size} onChange={(e) => setSize(e.target.value as keyof typeof SIZES)}>
              {Object.entries(SIZES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">ฟอนต์ (เลือกตัวอักษร)</span>
            <select className="input" value={font} onChange={(e) => setFont(e.target.value)}>
              {FONTS.map((ff) => (
                <option key={ff.value} value={ff.value}>{ff.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">จำนวนคอลัมน์/แถว</span>
            <select className="input" value={columns} onChange={(e) => setColumns(Number(e.target.value))}>
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} คอลัมน์</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">การจัดวางข้อความ</span>
            <select className="input" value={align} onChange={(e) => setAlign(e.target.value as 'center' | 'left')}>
              <option value="center">กึ่งกลาง</option>
              <option value="left">ชิดซ้าย</option>
            </select>
          </label>
          <label>
            <span className="label">บาร์โค้ด / QR</span>
            <select className="input" value={codeType} onChange={(e) => setCodeType(e.target.value as 'none' | 'barcode' | 'qr')}>
              <option value="none">ไม่มี</option>
              <option value="barcode">บาร์โค้ด (Code128)</option>
              <option value="qr">QR code</option>
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2 lg:col-span-3">
            <Check label="ตัวหนา" checked={bold} onChange={setBold} />
            <Check label="มีขอบ" checked={border} onChange={setBorder} />
            <Check label="แสดงชื่อร้าน" checked={showShop} onChange={setShowShop} />
            <Check label="แสดงราคา" checked={showPrice} onChange={setShowPrice} />
            <Check label="แสดงรหัส" checked={showCode} onChange={setShowCode} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="btn-primary" disabled={stickers.length === 0}>
            🖨️ พิมพ์ ({stickers.length} ดวง)
          </button>
          <span className="text-sm text-neutral-500">
            ตัวอย่างด้านล่างจะถูกพิมพ์ (ส่วนอื่นจะไม่ออกกระดาษ)
          </span>
        </div>
      </div>

      {/* ==== พื้นที่พิมพ์ ==== */}
      <div className="print-area">
        <div
          className="flex flex-wrap gap-2"
          style={{ maxWidth: `${columns * (dim.w + 3)}mm` }}
        >
          {stickers.length === 0 ? (
            <p className="no-print text-neutral-500">ยังไม่มีสติกเกอร์ให้แสดง</p>
          ) : (
            stickers.map((st, i) => (
              <div
                key={i}
                style={{
                  width: `${dim.w}mm`,
                  height: `${dim.h}mm`,
                  fontFamily: font,
                  border: border ? '1px solid #333' : 'none',
                  textAlign: align,
                  fontWeight: bold ? 700 : 400,
                }}
                className="flex flex-col justify-center overflow-hidden rounded-[2px] px-2 leading-tight"
              >
                {st.shopName ? (
                  <div style={{ fontSize: `${dim.base * 0.7}px` }} className="truncate text-neutral-500">
                    {st.shopName}
                  </div>
                ) : null}
                {st.lines ? (
                  st.lines.map((ln, j) => (
                    <div
                      key={j}
                      style={{ fontSize: `${ln.size}px`, color: ln.color, fontWeight: ln.bold ? 700 : 400 }}
                      className="break-words leading-tight"
                    >
                      {ln.text}
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ fontSize: `${dim.base}px` }} className="line-clamp-2 break-words">
                      {st.title}
                    </div>
                    <div className="flex items-baseline justify-between gap-1">
                      {st.price ? (
                        <span style={{ fontSize: `${dim.base * 1.15}px`, fontWeight: 800 }}>{st.price}</span>
                      ) : <span />}
                      {st.code ? (
                        <span style={{ fontSize: `${dim.base * 0.7}px` }} className="text-neutral-500">
                          {st.code}
                        </span>
                      ) : null}
                    </div>
                    {st.note ? (
                      <div style={{ fontSize: `${dim.base * 0.7}px` }} className="truncate text-neutral-500">
                        {st.note}
                      </div>
                    ) : null}
                  </>
                )}
                {codeType !== 'none' && st.codeValue ? (
                  <div className="mt-0.5 flex justify-center">
                    {codeType === 'barcode' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={barcodeDataUri(st.codeValue, { height: dim.base * 2, moduleWidth: 1, showText: true })}
                        alt={st.codeValue}
                        style={{ maxWidth: '100%', height: `${dim.base * 2.2}px` }}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUri(st.codeValue, { size: 80 })}
                        alt={st.codeValue}
                        style={{ height: `${dim.h * 0.4}mm`, width: `${dim.h * 0.4}mm` }}
                      />
                    )}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold ${
        active ? 'bg-brand-700 text-white' : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
      }`}
    >
      {children}
    </button>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
      <input type="checkbox" className="h-4 w-4" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
