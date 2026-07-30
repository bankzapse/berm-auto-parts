// ตัวสร้างบาร์โค้ด Code128B แบบ SVG (ไม่พึ่งไลบรารีภายนอก — สแกนได้ด้วยแอปทั่วไป)
const PATTERNS = [
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
  '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
  '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
  '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
  '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
  '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
  '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
  '114131','311141','411131','211412','211214','211232','2331112',
];
const START_B = 104;
const STOP = 106;

// คืนค่าเป็นสตริงของโมดูล (แต่ละตัวอักษร = ความกว้างแท่ง สลับดำ-ขาว เริ่มด้วยดำ)
function encode(text: string): string {
  const clean = (text || '').replace(/[^\x20-\x7E]/g, ''); // เก็บเฉพาะ ASCII พิมพ์ได้
  if (!clean) return '';
  const codes: number[] = [START_B];
  for (const ch of clean) codes.push(ch.charCodeAt(0) - 32);
  let sum = START_B;
  for (let i = 1; i < codes.length; i++) sum += codes[i] * i;
  codes.push(sum % 103); // checksum
  codes.push(STOP);
  return codes.map((c) => PATTERNS[c]).join('');
}

export function barcodeSvg(
  text: string,
  opts: { height?: number; moduleWidth?: number; showText?: boolean; className?: string } = {},
): string {
  const { height = 40, moduleWidth = 1.5, showText = true } = opts;
  const modules = encode(text);
  if (!modules) return '';

  let x = 0;
  let dark = true;
  const rects: string[] = [];
  for (const d of modules) {
    const w = Number(d) * moduleWidth;
    if (dark) rects.push(`<rect x="${x}" y="0" width="${w}" height="${height}" fill="#000"/>`);
    x += w;
    dark = !dark;
  }
  const width = x;
  const textH = showText ? 14 : 0;
  const total = height + textH;
  const label = showText
    ? `<text x="${width / 2}" y="${total - 2}" font-size="11" text-anchor="middle" font-family="monospace" fill="#000">${text}</text>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${total}" viewBox="0 0 ${width} ${total}"${
    opts.className ? ` class="${opts.className}"` : ''
  }>${rects.join('')}${label}</svg>`;
}

// สร้าง data URI สำหรับใช้ใน <img src>
export function barcodeDataUri(text: string, opts?: Parameters<typeof barcodeSvg>[1]): string {
  const svg = barcodeSvg(text, opts);
  if (!svg) return '';
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
