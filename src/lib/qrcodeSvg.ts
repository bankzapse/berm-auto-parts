import qrcode from 'qrcode-generator';

// สร้าง QR code เป็น SVG (ทำงานทั้งฝั่ง client/server, ไม่ async)
export function qrSvg(text: string, opts: { size?: number; margin?: number } = {}): string {
  const value = (text || '').trim();
  if (!value) return '';
  const { size = 120, margin = 2 } = opts;
  const qr = qrcode(0, 'M');
  qr.addData(value);
  qr.make();
  const count = qr.getModuleCount();
  const cell = size / (count + margin * 2);
  const rects: string[] = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        const x = (c + margin) * cell;
        const y = (r + margin) * cell;
        rects.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="#000"/>`);
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#fff"/>${rects.join('')}</svg>`;
}

export function qrDataUri(text: string, opts?: { size?: number; margin?: number }): string {
  const svg = qrSvg(text, opts);
  if (!svg) return '';
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
