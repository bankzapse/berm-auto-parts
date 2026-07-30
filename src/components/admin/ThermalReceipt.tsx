'use client';

import { formatBaht } from '@/lib/documents';

export type ReceiptLine = { name: string; sku?: string; quantity: number; unit?: string; unitPrice: number; amount: number };
export type ReceiptData = {
  shopName: string;
  address?: string;
  phone?: string;
  taxId?: string;
  docNumber: string;
  dateText: string;
  items: ReceiptLine[];
  subtotal: number;
  discount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  paid: number;
  change: number;
  paymentLabel: string;
  footer?: string;
  width?: 58 | 80;
};

// ใบเสร็จอย่างย่อสำหรับเครื่องพิมพ์ความร้อน 58/80mm
export default function ThermalReceipt({ data }: { data: ReceiptData }) {
  const w = data.width ?? 80;
  const pad = w === 58 ? 48 : 72; // มม. พื้นที่พิมพ์จริง
  return (
    <div className="print-area">
      {/* กำหนดขนาดกระดาษเฉพาะตอนพิมพ์ (มีเฉพาะหน้านี้) */}
      <style>{`@media print { @page { size: ${w}mm auto; margin: 3mm; } }`}</style>
      <div
        className="mx-auto bg-white text-black"
        style={{ width: `${pad}mm`, fontFamily: "'Courier New', monospace", fontSize: '11px', lineHeight: 1.35 }}
      >
        <div className="text-center">
          <div style={{ fontSize: '14px', fontWeight: 700 }}>{data.shopName}</div>
          {data.address ? <div>{data.address}</div> : null}
          {data.phone ? <div>โทร {data.phone}</div> : null}
          {data.taxId ? <div>เลขภาษี {data.taxId}</div> : null}
        </div>
        <Divider />
        <div className="flex justify-between">
          <span>เลขที่ {data.docNumber}</span>
        </div>
        <div>{data.dateText}</div>
        <Divider />

        {data.items.map((it, i) => (
          <div key={i} style={{ marginBottom: 2 }}>
            <div>{it.name}{it.sku ? ` (${it.sku})` : ''}</div>
            <div className="flex justify-between">
              <span>
                {it.quantity} {it.unit || 'ชิ้น'} x {formatBaht(it.unitPrice)}
              </span>
              <span>{formatBaht(it.amount)}</span>
            </div>
          </div>
        ))}

        <Divider />
        <Line label="รวมเป็นเงิน" value={formatBaht(data.subtotal)} />
        {data.discount > 0 && <Line label="ส่วนลด" value={`-${formatBaht(data.discount)}`} />}
        {data.vatRate > 0 && <Line label={`VAT ${data.vatRate}%`} value={formatBaht(data.vatAmount)} />}
        <div style={{ fontSize: '14px', fontWeight: 700 }}>
          <Line label="ยอดสุทธิ" value={`฿${formatBaht(data.total)}`} />
        </div>
        <Line label={data.paymentLabel} value={formatBaht(data.paid)} />
        {data.change > 0 && <Line label="เงินทอน" value={formatBaht(data.change)} />}
        <Divider />
        <div className="text-center" style={{ marginTop: 4 }}>
          {data.footer || 'ขอบคุณที่ใช้บริการ'}
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />;
}
function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
