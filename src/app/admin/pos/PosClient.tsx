'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { formatBaht } from '@/lib/documents';
import { Spinner } from '@/components/admin/ui';
import ThermalReceipt, { type ReceiptData } from '@/components/admin/ThermalReceipt';

type P = { id: string; name: string; sku: string; barcode: string; price: number; unit: string; stock: number; category: string };
type CartItem = { productId: string; name: string; sku: string; unit: string; price: number; qty: number; stock: number };
type Shop = { shopName: string; address: string; phone: string; taxId: string; footer: string };

const PAY = [
  { value: 'cash', label: 'เงินสด' },
  { value: 'transfer', label: 'โอนเงิน' },
  { value: 'credit', label: 'เครดิต' },
];

export default function PosClient({ products, shop }: { products: P[]; shop: Shop }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState('cash');
  const [received, setReceived] = useState<string>('');
  const [customer, setCustomer] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const total = Math.max(0, subtotal - (Number(discount) || 0));
  const paid = Number(received) || 0;
  const change = payMethod === 'cash' && paid > total ? paid - total : 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products.slice(0, 24);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [products, search]);

  function addToCart(p: P) {
    setCart((prev) => {
      const idx = prev.findIndex((it) => it.productId === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { productId: p.id, name: p.name, sku: p.sku, unit: p.unit, price: p.price, qty: 1, stock: p.stock }];
    });
  }

  function addByCode(code: string) {
    const c = code.trim().toLowerCase();
    if (!c) return false;
    const p = products.find((x) => x.barcode.toLowerCase() === c || x.sku.toLowerCase() === c);
    if (p) {
      addToCart(p);
      setSearch('');
      return true;
    }
    return false;
  }

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      // ลองจับคู่รหัสตรง ๆ ก่อน (เครื่องสแกนจะพิมพ์แล้วกด Enter)
      if (!addByCode(search) && filtered.length === 1) addToCart(filtered[0]);
      if (filtered.length === 1) setSearch('');
    }
  }

  function setQty(i: number, qty: number) {
    setCart((prev) => prev.map((it, idx) => (idx === i ? { ...it, qty: Math.max(1, qty) } : it)));
  }
  function setPrice(i: number, price: number) {
    setCart((prev) => prev.map((it, idx) => (idx === i ? { ...it, price: Math.max(0, price) } : it)));
  }
  function removeItem(i: number) {
    setCart((prev) => prev.filter((_, idx) => idx !== i));
  }
  function clearCart() {
    setCart([]);
    setDiscount(0);
    setReceived('');
    setCustomer('');
    setError('');
  }

  async function checkout() {
    if (cart.length === 0) return;
    setSaving(true);
    setError('');
    try {
      const items = cart.map((it) => ({
        productId: it.productId,
        name: it.name,
        sku: it.sku,
        unit: it.unit,
        quantity: it.qty,
        unitPrice: it.price,
      }));
      const paidAmount = payMethod === 'credit' ? paid : total;
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'RECEIPT',
          status: 'PAID',
          customerName: customer,
          paymentMethod: payMethod,
          paidAmount,
          discount: Number(discount) || 0,
          vatRate: 0,
          deductStock: true,
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'ขายไม่สำเร็จ');
      const doc = data.item;
      setReceipt({
        shopName: shop.shopName,
        address: shop.address,
        phone: shop.phone,
        taxId: shop.taxId,
        docNumber: doc.docNumber,
        dateText: new Date(doc.issueDate).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }),
        items: cart.map((it) => ({ name: it.name, sku: it.sku, quantity: it.qty, unit: it.unit, unitPrice: it.price, amount: it.price * it.qty })),
        subtotal,
        discount: Number(discount) || 0,
        vatRate: 0,
        vatAmount: 0,
        total,
        paid: paidAmount,
        change,
        paymentLabel: PAY.find((p) => p.value === payMethod)?.label || 'ชำระ',
        footer: shop.footer,
        width: 80,
      });
      clearCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ขายไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  // ---- แสดงใบเสร็จหลังขาย ----
  if (receipt) {
    return (
      <div>
        <div className="no-print mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-green-700">✓ ขายสำเร็จ • {receipt.docNumber}</h1>
          <button onClick={() => window.print()} className="btn-primary">🖨️ พิมพ์ใบเสร็จ</button>
          <button onClick={() => { setReceipt(null); searchRef.current?.focus(); }} className="btn-outline">
            + ขายรายการใหม่
          </button>
        </div>
        <div className="no-print rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <ThermalReceipt data={receipt} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">ขายหน้าร้าน (POS)</h1>
        <span className="text-sm text-neutral-500">สแกนบาร์โค้ด (เครื่องสแกน USB) หรือค้นหาเพื่อเพิ่มลงตะกร้า</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* ค้นหา + สินค้า */}
        <div className="lg:col-span-3">
          <div className="mb-3 flex gap-2">
            <input
              ref={searchRef}
              className="input"
              placeholder="🔍 สแกน/พิมพ์รหัส หรือค้นหาชื่อสินค้า แล้ว Enter"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onSearchKey}
              autoFocus
            />
            <button onClick={() => setScanOpen(true)} className="btn-outline whitespace-nowrap px-3">📷 กล้อง</button>
          </div>
          <div className="grid max-h-[65vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="card p-3 text-left transition-transform hover:-translate-y-0.5 hover:border-brand-300"
              >
                <div className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-neutral-800">{p.name}</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-bold text-brand-800">฿{formatBaht(p.price)}</span>
                  <span className={`text-xs ${p.stock <= 0 ? 'text-red-500' : 'text-neutral-400'}`}>คงเหลือ {p.stock}</span>
                </div>
                {p.sku ? <div className="text-xs text-neutral-400">{p.sku}</div> : null}
              </button>
            ))}
            {filtered.length === 0 && <p className="col-span-full p-6 text-center text-neutral-400">ไม่พบสินค้า</p>}
          </div>
        </div>

        {/* ตะกร้า */}
        <div className="lg:col-span-2">
          <div className="card sticky top-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 p-3">
              <h2 className="font-bold text-neutral-800">ตะกร้า ({cart.length})</h2>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-sm text-red-500 hover:underline">ล้าง</button>
              )}
            </div>

            <div className="max-h-[40vh] overflow-y-auto p-2">
              {cart.length === 0 ? (
                <p className="p-6 text-center text-sm text-neutral-400">ยังไม่มีสินค้า</p>
              ) : (
                cart.map((it, i) => (
                  <div key={i} className="flex items-center gap-2 border-b border-neutral-50 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{it.name}</div>
                      <div className="mt-1 flex items-center gap-1">
                        <button onClick={() => setQty(i, it.qty - 1)} className="h-6 w-6 rounded bg-neutral-100 font-bold">−</button>
                        <input
                          type="number"
                          className="w-12 rounded border border-neutral-200 px-1 text-center text-sm"
                          value={it.qty}
                          onChange={(e) => setQty(i, Number(e.target.value))}
                        />
                        <button onClick={() => setQty(i, it.qty + 1)} className="h-6 w-6 rounded bg-neutral-100 font-bold">+</button>
                        <span className="text-xs text-neutral-400">×</span>
                        <input
                          type="number"
                          step="0.01"
                          className="w-20 rounded border border-neutral-200 px-1 text-right text-sm"
                          value={it.price}
                          onChange={(e) => setPrice(i, Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-semibold">฿{formatBaht(it.price * it.qty)}</div>
                    <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">✕</button>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 border-t border-neutral-100 p-3 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>รวม</span><span>฿{formatBaht(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">ส่วนลด</span>
                <input type="number" step="0.01" className="w-24 rounded border border-neutral-300 px-2 py-1 text-right"
                  value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-lg font-bold text-brand-800">
                <span>ยอดสุทธิ</span><span>฿{formatBaht(total)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <select className="input" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  {PAY.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder={payMethod === 'cash' ? 'รับเงินมา' : 'ยอดชำระ'}
                  value={received}
                  onChange={(e) => setReceived(e.target.value)}
                />
              </div>
              {change > 0 && (
                <div className="flex justify-between font-semibold text-green-700">
                  <span>เงินทอน</span><span>฿{formatBaht(change)}</span>
                </div>
              )}

              <input className="input" placeholder="ชื่อลูกค้า (ไม่บังคับ)" value={customer} onChange={(e) => setCustomer(e.target.value)} />

              {error && <p className="rounded bg-red-50 p-2 text-xs text-red-700">{error}</p>}

              <button onClick={checkout} disabled={saving || cart.length === 0} className="btn-primary w-full disabled:opacity-60">
                {saving ? <><Spinner /> กำลังบันทึก…</> : `ชำระเงิน ฿${formatBaht(total)}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {scanOpen && <CameraScanner onDetect={(code) => { if (addByCode(code)) setScanOpen(false); }} onClose={() => setScanOpen(false)} />}
    </div>
  );
}

// สแกนบาร์โค้ดด้วยกล้อง (ใช้ BarcodeDetector ถ้าเบราว์เซอร์รองรับ)
function CameraScanner({ onDetect, onClose }: { onDetect: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [msg, setMsg] = useState('กำลังเปิดกล้อง…');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Detector = (window as any).BarcodeDetector;
    if (!Detector) {
      setMsg('เบราว์เซอร์นี้ไม่รองรับการสแกนด้วยกล้อง — ใช้เครื่องสแกน USB หรือค้นหาแทน');
      return;
    }
    const detector = new Detector({ formats: ['code_128', 'ean_13', 'ean_8', 'code_39', 'qr_code', 'upc_a'] });

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setMsg('เล็งกล้องไปที่บาร์โค้ด');
          const tick = async () => {
            if (stopped || !videoRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes && codes.length > 0 && codes[0].rawValue) {
                onDetect(String(codes[0].rawValue));
                return;
              }
            } catch { /* ignore frame errors */ }
            raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }
      } catch {
        setMsg('เปิดกล้องไม่ได้ — ตรวจสอบการอนุญาตใช้กล้อง');
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetect]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold text-neutral-800">สแกนด้วยกล้อง</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>
        <video ref={videoRef} className="aspect-square w-full rounded-lg bg-black object-cover" muted playsInline />
        <p className="mt-2 text-center text-sm text-neutral-500">{msg}</p>
      </div>
    </div>
  );
}
