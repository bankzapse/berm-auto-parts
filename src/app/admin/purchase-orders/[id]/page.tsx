import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAllProducts } from '@/lib/data';
import PoEditor, { type PoData } from '../PoEditor';

async function getPo(id: string) {
  try {
    return await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  } catch {
    return null;
  }
}
async function getSuppliers() {
  try {
    return await prisma.supplier.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
  } catch {
    return [];
  }
}

export default async function EditPoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [po, products, suppliers] = await Promise.all([getPo(id), getAllProducts(), getSuppliers()]);
  if (!po) notFound();

  const initial: PoData = {
    id: po.id,
    poNumber: po.poNumber,
    supplierId: po.supplierId || '',
    status: po.status,
    orderDate: po.orderDate.toISOString().slice(0, 10),
    note: po.note,
    received: po.received,
    items: po.items.map((it) => ({
      productId: it.productId,
      name: it.name,
      sku: it.sku,
      unit: it.unit,
      quantity: it.quantity,
      unitCost: it.unitCost,
    })),
  };

  return (
    <PoEditor
      mode="edit"
      initial={initial}
      products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, unit: p.unit, cost: p.cost }))}
      suppliers={suppliers}
    />
  );
}
