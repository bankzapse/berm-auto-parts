export type DocTypeKey = 'RECEIPT' | 'INVOICE' | 'QUOTATION';
export type DocStatusKey = 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';

export const DOC_TYPES: { value: DocTypeKey; label: string; prefix: string }[] = [
  { value: 'RECEIPT', label: 'ใบเสร็จรับเงิน', prefix: 'RC' },
  { value: 'INVOICE', label: 'ใบวางบิล / ใบแจ้งหนี้', prefix: 'IV' },
  { value: 'QUOTATION', label: 'ใบเสนอราคา', prefix: 'QT' },
];

export const DOC_STATUS: { value: DocStatusKey; label: string }[] = [
  { value: 'DRAFT', label: 'ร่าง' },
  { value: 'ISSUED', label: 'ออกแล้ว' },
  { value: 'PAID', label: 'ชำระแล้ว' },
  { value: 'CANCELLED', label: 'ยกเลิก' },
];

export function docTypeLabel(t: string): string {
  return DOC_TYPES.find((d) => d.value === t)?.label || t;
}
export function docStatusLabel(s: string): string {
  return DOC_STATUS.find((d) => d.value === s)?.label || s;
}
export function docPrefix(t: string): string {
  return DOC_TYPES.find((d) => d.value === t)?.prefix || 'DOC';
}

export interface RawItem {
  productId?: string | null;
  name: string;
  sku?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
}

export function computeTotals(items: RawItem[], discount: number, vatRate: number) {
  const cleanItems = (Array.isArray(items) ? items : [])
    .filter((it) => it && typeof it.name === 'string' && it.name.trim() !== '')
    .map((it, i) => {
      const quantity = Number(it.quantity) || 0;
      const unitPrice = Number(it.unitPrice) || 0;
      return {
        productId: it.productId || null,
        name: String(it.name).trim(),
        sku: it.sku || '',
        unit: it.unit || 'ชิ้น',
        quantity,
        unitPrice,
        amount: Math.round(quantity * unitPrice * 100) / 100,
        order: i,
      };
    });

  const subtotal = cleanItems.reduce((s, it) => s + it.amount, 0);
  const disc = Math.max(0, Number(discount) || 0);
  const afterDiscount = Math.max(0, subtotal - disc);
  const rate = Math.max(0, Number(vatRate) || 0);
  const vatAmount = Math.round(afterDiscount * (rate / 100) * 100) / 100;
  const total = Math.round((afterDiscount + vatAmount) * 100) / 100;

  return {
    items: cleanItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: disc,
    vatRate: rate,
    vatAmount,
    total,
  };
}

export function formatBaht(n: number): string {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
