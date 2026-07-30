'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/admin/ui';

type Row = Record<string, string>;

// ชื่อคอลัมน์ที่รองรับ (ไทย/อังกฤษ)
const ALIASES: Record<string, string[]> = {
  name: ['name', 'ชื่อ', 'ชื่อสินค้า', 'รายการ', 'สินค้า', 'product'],
  category: ['category', 'หมวด', 'หมวดสินค้า', 'ประเภท', 'cat'],
  price: ['price', 'ราคา', 'ราคาขาย', 'ขาย'],
  cost: ['cost', 'ต้นทุน', 'ทุน'],
  brand: ['brand', 'ยี่ห้อ', 'แบรนด์'],
  sku: ['sku', 'รหัส', 'รหัสสินค้า', 'code'],
  unit: ['unit', 'หน่วย'],
  fitment: ['fitment', 'รุ่นรถ', 'รุ่น', 'ใช้กับ', 'รถ'],
  oem: ['oem', 'รหัสเทียบ'],
  barcode: ['barcode', 'บาร์โค้ด'],
  image: ['image', 'รูป', 'url', 'ลิงก์รูป', 'รูปภาพ'],
  stock: ['stock', 'สต็อก', 'คงเหลือ', 'จำนวน'],
  description: ['description', 'รายละเอียด', 'desc'],
};
const POSITIONAL = ['name', 'price', 'category', 'sku', 'brand', 'fitment'];

function splitLine(line: string, delim: string): string[] {
  if (delim === '\t') return line.split('\t');
  // แยก comma แบบรองรับเครื่องหมายคำพูด
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') { cur += '"'; i++; }
      else q = !q;
    } else if (ch === ',' && !q) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function parse(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];
  const delim = lines[0].includes('\t') ? '\t' : ',';
  const first = splitLine(lines[0], delim).map((c) => c.trim().toLowerCase());

  // ตรวจว่าแถวแรกเป็นหัวตารางไหม (มี alias ที่รู้จัก)
  const headerMap: Record<number, string> = {};
  let isHeader = false;
  first.forEach((cell, i) => {
    for (const [field, al] of Object.entries(ALIASES)) {
      if (al.some((a) => cell === a)) {
        headerMap[i] = field;
        isHeader = true;
      }
    }
  });

  const dataLines = isHeader ? lines.slice(1) : lines;
  const rows: Row[] = [];
  for (const line of dataLines) {
    const cells = splitLine(line, delim);
    const row: Row = {};
    cells.forEach((cell, i) => {
      const field = isHeader ? headerMap[i] : POSITIONAL[i];
      if (field) row[field] = cell.trim();
    });
    if ((row.name || '').trim()) rows.push(row);
  }
  return rows;
}

const TEMPLATE = `ชื่อ,หมวด,ราคา,ต้นทุน,ยี่ห้อ,รหัส,รุ่นรถ
ผ้าเบรกหน้า Vios,เบรก,550,400,แท้,BRK-VIOS,Toyota Vios 2013-2019
กรองอากาศ D-Max,เครื่องยนต์,220,150,เทียบ,ENG-DMAX,Isuzu D-Max 2012-2019`;

export default function ImportTool() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => parse(text), [text]);

  function loadFile(f: File) {
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ''));
    reader.readAsText(f, 'utf-8');
  }

  async function doImport() {
    if (rows.length === 0) return;
    setImporting(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: rows }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'นำเข้าไม่สำเร็จ');
      setResult({ created: data.created, skipped: data.skipped });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'นำเข้าไม่สำเร็จ');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
        <p className="font-semibold">วิธีใช้</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-brand-800">
          <li>คัดลอกตารางสินค้าจากเว็บ/ไฟล์ Excel/Google Sheet ของคุณ แล้ว<strong>วาง</strong>ในช่องด้านล่าง (รองรับทั้งวางจากตารางและไฟล์ CSV)</li>
          <li>คอลัมน์ที่รองรับ: <code>ชื่อ, หมวด, ราคา, ต้นทุน, ยี่ห้อ, รหัส, รุ่นรถ, oem, บาร์โค้ด, รูป, สต็อก, รายละเอียด</code> (มี “ชื่อ” อย่างเดียวก็นำเข้าได้)</li>
          <li>หมวดที่ยังไม่มีจะถูกสร้างให้อัตโนมัติ • สินค้าที่รหัส (SKU) ซ้ำจะถูกข้าม</li>
        </ol>
        <button type="button" onClick={() => setText(TEMPLATE)} className="mt-2 text-sm font-medium text-brand-700 underline">
          ใส่ตัวอย่างให้ดู
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.tsv,.txt,text/csv"
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-3 file:py-2 file:text-white hover:file:bg-brand-800"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadFile(f);
          }}
        />
        <span className="text-sm text-neutral-500">หรือวางข้อมูลในช่องด้านล่าง</span>
      </div>

      <textarea
        className="input min-h-48 font-mono text-sm"
        placeholder={'วางตารางที่นี่… เช่น\nชื่อ,หมวด,ราคา\nผ้าเบรกหน้า,เบรก,550'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {rows.length > 0 && (
        <div className="card overflow-x-auto">
          <div className="border-b border-neutral-100 p-3 text-sm font-medium text-neutral-700">
            พบ {rows.length} รายการ (แสดง 5 แถวแรก)
          </div>
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="p-2">ชื่อ</th>
                <th className="p-2">หมวด</th>
                <th className="p-2 text-right">ราคา</th>
                <th className="p-2">รหัส</th>
                <th className="p-2">รุ่นรถ</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((r, i) => (
                <tr key={i} className="border-t border-neutral-100">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2 text-neutral-600">{r.category || '—'}</td>
                  <td className="p-2 text-right">{r.price || '—'}</td>
                  <td className="p-2 text-neutral-500">{r.sku || '—'}</td>
                  <td className="p-2 text-neutral-500">{r.fitment || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {result && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          ✓ นำเข้าสำเร็จ {result.created} รายการ{result.skipped > 0 ? ` • ข้าม ${result.skipped} รายการ (ชื่อว่าง/รหัสซ้ำ)` : ''}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button onClick={doImport} disabled={importing || rows.length === 0} className="btn-primary disabled:opacity-60">
          {importing ? <><Spinner /> กำลังนำเข้า…</> : `นำเข้า ${rows.length} รายการ`}
        </button>
        <a href="/admin/products" className="btn-outline">กลับไปหน้าสินค้า</a>
      </div>
    </div>
  );
}
