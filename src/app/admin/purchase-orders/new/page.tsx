import { prisma } from '@/lib/prisma';
import { getAllProducts } from '@/lib/data';
import PoEditor, { type PoData } from '../PoEditor';

async function getSuppliers() {
  try {
    return await prisma.supplier.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
  } catch {
    return [];
  }
}

export default async function NewPoPage() {
  const [products, suppliers] = await Promise.all([getAllProducts(), getSuppliers()]);
  const initial: PoData = {
    supplierId: '',
    status: 'DRAFT',
    orderDate: new Date().toISOString().slice(0, 10),
    note: '',
    received: false,
    items: [],
  };
  return (
    <PoEditor
      mode="new"
      initial={initial}
      products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, unit: p.unit, cost: p.cost }))}
      suppliers={suppliers}
    />
  );
}
