import { prisma } from './prisma';

// กัน SSRF: อนุญาตเฉพาะ http(s) และบล็อกโฮสต์ภายใน/private
function isSafeWebhookUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  const host = u.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  ) {
    return false;
  }
  return true;
}

// ส่งข้อความไป webhook (รองรับ Make/Zapier/n8n/Discord ฯลฯ) — best-effort
export async function sendWebhook(url: string, message: string): Promise<boolean> {
  if (!url || !isSafeWebhookUrl(url)) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // ส่งหลาย key เผื่อปลายทางต่างกัน (text/content/message)
      body: JSON.stringify({ text: message, content: message, message }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

// ตรวจสินค้าที่ระบุว่าเข้าเกณฑ์สต็อกต่ำหรือไม่ แล้วแจ้งเตือน (ถ้าเปิดใช้ + มี webhook)
export async function checkLowStockAlert(productIds: string[]): Promise<void> {
  try {
    if (productIds.length === 0) return;
    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
    if (!settings || !settings.lowStockAlert || !settings.alertWebhookUrl) return;

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { name: true, stock: true, lowStock: true, unit: true },
    });
    const low = products.filter((p) => p.stock <= 0 || (p.lowStock > 0 && p.stock <= p.lowStock));
    if (low.length === 0) return;

    const lines = low.map((p) => `• ${p.name}: เหลือ ${p.stock} ${p.unit}`).join('\n');
    const message = `⚠️ [${settings.shopName}] สินค้าใกล้หมด/หมดสต็อก\n${lines}`;
    await sendWebhook(settings.alertWebhookUrl, message);
  } catch {
    // ไม่ให้การแจ้งเตือนทำให้รายการหลักล้มเหลว
  }
}
