import { getAllProducts, getSettings, formatAddress } from '@/lib/data';
import DocumentEditor, { type DocData } from '../DocumentEditor';

export default async function NewDocumentPage() {
  const [products, s] = await Promise.all([getAllProducts(), getSettings()]);
  const today = new Date().toISOString().slice(0, 10);

  const initial: DocData = {
    type: 'RECEIPT',
    status: 'ISSUED',
    issueDate: today,
    dueDate: '',
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerTaxId: '',
    note: '',
    paymentMethod: 'cash',
    paidAmount: 0,
    discount: 0,
    vatRate: 0,
    items: [],
  };

  return (
    <DocumentEditor
      mode="new"
      initial={initial}
      products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, unit: p.unit, price: p.price }))}
      shop={{
        shopName: s.shopName,
        address: formatAddress(s),
        phone: s.phone,
        phone2: s.phone2,
        taxId: s.taxId,
        docFooter: s.docFooter,
        logo: s.logoImage,
      }}
    />
  );
}
