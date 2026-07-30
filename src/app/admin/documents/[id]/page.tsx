import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAllProducts, getSettings, formatAddress } from '@/lib/data';
import DocumentEditor, { type DocData } from '../DocumentEditor';
import type { DocTypeKey } from '@/lib/documents';

async function getDoc(id: string) {
  try {
    return await prisma.document.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  } catch {
    return null;
  }
}

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [doc, products, s] = await Promise.all([getDoc(id), getAllProducts(), getSettings()]);
  if (!doc) notFound();

  const initial: DocData = {
    id: doc.id,
    docNumber: doc.docNumber,
    type: doc.type as DocTypeKey,
    status: doc.status,
    issueDate: doc.issueDate.toISOString().slice(0, 10),
    dueDate: doc.dueDate ? doc.dueDate.toISOString().slice(0, 10) : '',
    customerName: doc.customerName,
    customerAddress: doc.customerAddress,
    customerPhone: doc.customerPhone,
    customerTaxId: doc.customerTaxId,
    note: doc.note,
    discount: doc.discount,
    vatRate: doc.vatRate,
    items: doc.items.map((it) => ({
      productId: it.productId,
      name: it.name,
      sku: it.sku,
      unit: it.unit,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
  };

  return (
    <DocumentEditor
      mode="edit"
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
