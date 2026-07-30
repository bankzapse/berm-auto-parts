import { getInventoryProducts, getRecentMovements } from '@/lib/data';
import InventoryTool from './InventoryTool';

export default async function InventoryPage() {
  const [products, movements] = await Promise.all([getInventoryProducts(), getRecentMovements(30)]);
  const simple = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    unit: p.unit,
    stock: p.stock,
    lowStock: p.lowStock,
    cost: p.cost,
    price: p.price,
    category: p.category?.name || '',
  }));
  const moves = movements.map((m) => ({
    id: m.id,
    type: m.type as 'IN' | 'OUT' | 'ADJUST',
    quantity: m.quantity,
    balance: m.balance,
    note: m.note,
    refDoc: m.refDoc,
    createdAt: m.createdAt.toISOString(),
    productName: m.product?.name || '',
    unit: m.product?.unit || '',
  }));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-neutral-800">จัดการสต็อกสินค้า</h1>
      <p className="mb-6 text-neutral-500">รับเข้า–ตัดออก–นับสต็อก และดูประวัติการเคลื่อนไหว</p>
      <InventoryTool products={simple} movements={moves} />
    </div>
  );
}
