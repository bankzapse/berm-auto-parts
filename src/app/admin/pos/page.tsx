import { getAllProducts, getSettings, formatAddress } from '@/lib/data';
import PosClient from './PosClient';

export default async function PosPage() {
  const [products, s] = await Promise.all([getAllProducts(), getSettings()]);
  const list = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode,
    oem: p.oem,
    fitment: p.fitment,
    price: p.price ?? 0,
    unit: p.unit,
    stock: p.stock,
    category: p.category?.name || '',
  }));
  return (
    <PosClient
      products={list}
      shop={{
        shopName: s.shopName,
        address: formatAddress(s),
        phone: s.phone2 || s.phone,
        taxId: s.taxId,
        footer: s.docFooter,
      }}
    />
  );
}
