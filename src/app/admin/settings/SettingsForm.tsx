'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Settings } from '@prisma/client';
import { Field, SaveButton, type SaveState } from '@/components/admin/ui';
import ImageUploader from '@/components/admin/ImageUploader';

// แผนที่โหลดฝั่ง client เท่านั้น (Leaflet ใช้ window)
const MapPicker = dynamic(() => import('@/components/admin/MapPicker'), {
  ssr: false,
  loading: () => <div className="skeleton h-80 w-full rounded-xl" />,
});

const NAV = [
  { id: 'general', icon: '🏪', title: 'ข้อมูลทั่วไป' },
  { id: 'images', icon: '🖼️', title: 'รูปภาพหลัก' },
  { id: 'contact', icon: '📞', title: 'ติดต่อ' },
  { id: 'address', icon: '📍', title: 'ที่อยู่ & แผนที่' },
  { id: 'docs', icon: '🧾', title: 'เอกสาร' },
  { id: 'alert', icon: '🔔', title: 'แจ้งเตือน' },
  { id: 'seo', icon: '🔍', title: 'SEO' },
];

export default function SettingsForm({ initial, dbOk = true }: { initial: Settings; dbOk?: boolean }) {
  const [f, setF] = useState<Settings>(initial);
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState('');
  const [testMsg, setTestMsg] = useState('');

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://berm-auto-parts.vercel.app').replace(/^https?:\/\//, '');

  async function testAlert() {
    setTestMsg('กำลังส่ง…');
    try {
      const res = await fetch('/api/alert/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: f.alertWebhookUrl }),
      });
      const data = await res.json();
      setTestMsg(res.ok && data.ok ? '✓ ส่งทดสอบสำเร็จ' : `✗ ${data.error || 'ส่งไม่สำเร็จ'}`);
    } catch {
      setTestMsg('✗ ส่งไม่สำเร็จ');
    }
  }

  const set = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState('saving');
    setError('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      setState('saved');
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    }
  }

  const titleText = f.seoTitle || `${f.shopName} | อะไหล่ยนต์ ป่าซาง ลำพูน`;
  const descText = f.seoDescription || f.tagline;

  return (
    <form onSubmit={save}>
      {/* หัวหน้าเพจแบบพรีเมียม — รูปอะไหล่จาง + เงา */}
      <header className="relative mb-6 overflow-hidden rounded-2xl p-6 text-white shadow-lg sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=55"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-800/95 via-brand-900/95 to-brand-950/95" />
        <div className="relative flex items-center gap-4">
          {f.logoImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.logoImage} alt="" className="h-14 w-14 rounded-full border-2 border-white/30 object-cover shadow-lg" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-700 text-lg font-bold shadow-lg">B.B.</span>
          )}
          <div>
            <h1 className="text-2xl font-bold drop-shadow">ข้อมูลร้าน & SEO</h1>
            <p className="mt-1 text-sm text-brand-100">ตั้งค่าข้อมูลร้าน การติดต่อ และการค้นหาบน Google ให้ครบถ้วน</p>
          </div>
        </div>
      </header>

      {!dbOk && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          🔴 <strong>ต่อฐานข้อมูลไม่ได้</strong> — ข้อมูลที่เห็นเป็นค่าเริ่มต้น และจะ<strong>บันทึกไม่ได้</strong>
          <div className="mt-1 text-red-700">
            แก้: เข้า Supabase → ถ้า Project ถูก pause ให้กด Resume • ตรวจ <code>DATABASE_URL</code> บน Vercel ให้มี{' '}
            <code>?pgbouncer=true&amp;connection_limit=1</code> ต่อท้าย แล้ว Redeploy
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[190px_1fr]">
        {/* เมนูลัดแต่ละส่วน (เดสก์ท็อป) */}
        <nav className="sticky top-6 hidden h-fit space-y-1 lg:block">
          {NAV.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-2 rounded-lg border-l-2 border-transparent px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-accent-500 hover:bg-brand-50 hover:text-brand-800"
            >
              {s.title}
            </a>
          ))}
        </nav>

        {/* ส่วนตั้งค่า */}
        <div className="space-y-6">
          <Section id="general" icon="🏪" title="ข้อมูลทั่วไป" desc="ชื่อร้าน สโลแกน และเรื่องราวของร้าน">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ชื่อร้าน">
                <input className="input" value={f.shopName} onChange={set('shopName')} />
              </Field>
              <Field label="ประเภทสินค้า">
                <input className="input" value={f.shopType} onChange={set('shopType')} />
              </Field>
            </div>
            <Field label="สโลแกน (tagline)">
              <input className="input" value={f.tagline} onChange={set('tagline')} />
            </Field>
            <Field label="หัวข้อ 'เกี่ยวกับเรา'">
              <input className="input" value={f.aboutTitle} onChange={set('aboutTitle')} />
            </Field>
            <Field label="เนื้อหา 'เกี่ยวกับเรา'">
              <textarea className="input min-h-32" value={f.aboutText} onChange={set('aboutText')} />
            </Field>
            <Field label="เวลาทำการ">
              <input className="input" value={f.openHours} onChange={set('openHours')} />
            </Field>
            <Field label="ข้อความแถบบนสุด (top bar)" hint="ข้อความข้างเวลาทำการ เว้นว่างเพื่อซ่อน">
              <input className="input" value={f.topBarNote} onChange={set('topBarNote')} placeholder="เช่น ขายส่ง–ปลีก อะไหล่ยนต์" />
            </Field>
          </Section>

          <Section id="images" icon="🖼️" title="รูปภาพหลัก" desc="โลโก้ รูปหน้าแรก และรูปสำหรับแชร์โซเชียล">
            <div className="grid gap-5 sm:grid-cols-2">
              <ImageUploader label="โลโก้ร้าน" value={f.logoImage} onChange={(v) => setF((p) => ({ ...p, logoImage: v }))} />
              <ImageUploader label="รูป Hero (หน้าแรก)" value={f.heroImage} onChange={(v) => setF((p) => ({ ...p, heroImage: v }))} />
            </div>
            <ImageUploader label="รูป OG (แชร์โซเชียล 1200×630)" value={f.ogImage} onChange={(v) => setF((p) => ({ ...p, ogImage: v }))} />
          </Section>

          <Section id="contact" icon="📞" title="ติดต่อ" desc="เบอร์โทร LINE และ Facebook">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="เบอร์โทร 1">
                <input className="input" value={f.phone} onChange={set('phone')} />
              </Field>
              <Field label="เบอร์โทร 2">
                <input className="input" value={f.phone2} onChange={set('phone2')} />
              </Field>
              <Field label="LINE ID / ลิงก์" hint="ลิงก์ที่ลูกค้ากดเข้าแชทได้ ควรเป็น https://lin.ee/xxxx (จากบัญชีทางการ) — เบอร์/ID เปล่าอาจกดเข้าแชทไม่ได้ ให้ใช้ QR ด้านล่างแทน">
                <input className="input" value={f.lineId} onChange={set('lineId')} placeholder="https://lin.ee/xxxx" />
              </Field>
              <Field label="ลิงก์ Facebook">
                <input className="input" value={f.facebookUrl} onChange={set('facebookUrl')} />
              </Field>
            </div>
            <div className="rounded-xl border border-[#06C755]/30 bg-[#06C755]/5 p-4">
              <ImageUploader
                label="รูป QR โค้ด LINE (ให้ลูกค้าสแกนเพิ่มเพื่อน)"
                value={f.lineQrImage}
                onChange={(v) => setF((p) => ({ ...p, lineQrImage: v }))}
              />
              <p className="mt-2 text-xs text-neutral-500">
                💡 เปิดแอป LINE → โปรไฟล์ → “QR โค้ดของฉัน” → บันทึกรูป แล้วอัปโหลดที่นี่ —
                ลูกค้าสแกนเพิ่มเพื่อนได้เลย (ใช้ได้กับ LINE ส่วนตัว ไม่ต้องมีบัญชีทางการ)
              </p>
            </div>
          </Section>

          <Section id="address" icon="📍" title="ที่อยู่ & แผนที่" desc="ที่ตั้งร้านและพิกัดสำหรับแผนที่ Google">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ที่อยู่ (เลขที่/หมู่)">
                <input className="input" value={f.addressLine} onChange={set('addressLine')} />
              </Field>
              <Field label="ตำบล">
                <input className="input" value={f.subDistrict} onChange={set('subDistrict')} />
              </Field>
              <Field label="อำเภอ">
                <input className="input" value={f.district} onChange={set('district')} />
              </Field>
              <Field label="จังหวัด">
                <input className="input" value={f.province} onChange={set('province')} />
              </Field>
              <Field label="รหัสไปรษณีย์">
                <input className="input" value={f.postalCode} onChange={set('postalCode')} />
              </Field>
              <div />
              <Field label="Latitude (พิกัด)">
                <input className="input" value={String(f.latitude)} onChange={set('latitude')} />
              </Field>
              <Field label="Longitude (พิกัด)">
                <input className="input" value={String(f.longitude)} onChange={set('longitude')} />
              </Field>
            </div>

            <div>
              <span className="label">📍 เลือกตำแหน่งบนแผนที่</span>
              <MapPicker
                lat={Number(f.latitude) || 18.52}
                lng={Number(f.longitude) || 98.938}
                onChange={(la, lo) => setF((p) => ({ ...p, latitude: la, longitude: lo }))}
              />
            </div>

            <Field label="ลิงก์ฝังแผนที่ Google (embed URL)" hint="เว้นว่างได้ ระบบจะสร้างจากพิกัด/ชื่อร้านให้อัตโนมัติ">
              <input className="input" value={f.mapEmbedUrl} onChange={set('mapEmbedUrl')} />
            </Field>
          </Section>

          <Section id="docs" icon="🧾" title="เอกสาร (ใบเสร็จ / ใบวางบิล)" desc="ข้อมูลที่แสดงบนหัว/ท้ายเอกสาร">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="เลขประจำตัวผู้เสียภาษี" hint="แสดงบนหัวเอกสาร (ถ้ามี)">
                <input className="input" value={f.taxId} onChange={set('taxId')} />
              </Field>
              <Field label="ข้อความท้ายเอกสาร">
                <input className="input" value={f.docFooter} onChange={set('docFooter')} />
              </Field>
            </div>
          </Section>

          <Section id="alert" icon="🔔" title="แจ้งเตือนสต็อกต่ำ" desc="ส่ง Webhook เมื่อสินค้าใกล้หมด">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm font-medium text-neutral-700">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={f.lowStockAlert}
                onChange={(e) => setF((p) => ({ ...p, lowStockAlert: e.target.checked }))}
              />
              เปิดการแจ้งเตือนเมื่อสินค้าใกล้หมด/หมดสต็อก
            </label>
            <Field label="Webhook URL" hint="ใช้ได้กับ Make / Zapier / n8n / Discord ฯลฯ (เชื่อม LINE ผ่านบริการเหล่านี้ได้)">
              <input className="input" value={f.alertWebhookUrl} onChange={set('alertWebhookUrl')} placeholder="https://..." />
            </Field>
            <div className="flex items-center gap-3">
              <button type="button" onClick={testAlert} className="btn-outline py-2 text-sm">ทดสอบส่งแจ้งเตือน</button>
              {testMsg && <span className="text-sm text-neutral-600">{testMsg}</span>}
            </div>
          </Section>

          <Section id="seo" icon="🔍" title="SEO — ค้นหาบน Google" desc="ปรับให้ร้านติดอันดับและดูดีเวลาแชร์">
            {/* พรีวิวผลการค้นหา Google */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">ตัวอย่างบน Google</div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white">BB</span>
                <div className="leading-tight">
                  <div className="font-medium text-neutral-800">{f.shopName}</div>
                  <div className="text-xs text-green-700">{siteUrl}</div>
                </div>
              </div>
              <div className="mt-1 line-clamp-1 text-lg text-[#1a0dab] hover:underline">{titleText}</div>
              <div className="mt-0.5 line-clamp-2 text-sm text-neutral-600">{descText}</div>
            </div>

            <Field label="Meta Title" hint="ควรมีชื่อร้าน + คีย์เวิร์ด + พื้นที่ (ป่าซาง ลำพูน)">
              <input className="input" value={f.seoTitle} onChange={set('seoTitle')} placeholder={titleText} />
              <Counter value={f.seoTitle.length} ideal={60} />
            </Field>
            <Field label="Meta Description" hint="สรุปสั้น ๆ ~150-160 ตัวอักษร">
              <textarea className="input min-h-24" value={f.seoDescription} onChange={set('seoDescription')} />
              <Counter value={f.seoDescription.length} ideal={160} />
            </Field>
            <Field label="Keywords (คั่นด้วยจุลภาค)">
              <textarea className="input min-h-20" value={f.seoKeywords} onChange={set('seoKeywords')} />
            </Field>
          </Section>
        </div>
      </div>

      {/* แถบบันทึกลอยแบบพรีเมียม — โชว์ error ตรงนี้เลยจะได้เห็นแน่นอน */}
      <div
        className={`sticky bottom-4 z-10 mt-6 flex items-center justify-between gap-3 rounded-2xl border bg-white/95 p-3 pl-5 shadow-lg backdrop-blur ${
          state === 'error' ? 'border-red-300' : 'border-neutral-200'
        }`}
      >
        <span className="min-w-0 flex-1 text-sm">
          {state === 'error' ? (
            <span className="font-medium text-red-700">⚠️ {error || 'บันทึกไม่สำเร็จ'}</span>
          ) : state === 'saved' ? (
            <span className="font-medium text-green-700">✓ บันทึกเรียบร้อย</span>
          ) : (
            <span className="hidden text-neutral-500 sm:block">แก้ไขแล้วอย่าลืมกดบันทึก การเปลี่ยนแปลงจะขึ้นหน้าเว็บทันที</span>
          )}
        </span>
        <SaveButton state={state} label="บันทึกการตั้งค่า" />
      </div>
    </form>
  );
}

function Section({
  id,
  title,
  desc,
  children,
}: {
  id: string;
  icon?: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
      <header className="flex items-center gap-3 border-b border-neutral-100 bg-gradient-to-r from-brand-50 to-white px-5 py-4">
        <span className="h-9 w-1.5 rounded-full bg-accent-500" />
        <div>
          <h2 className="font-bold text-brand-900">{title}</h2>
          {desc ? <p className="text-xs text-neutral-500">{desc}</p> : null}
        </div>
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function Counter({ value, ideal }: { value: number; ideal: number }) {
  const tone = value === 0 ? 'text-neutral-400' : value <= ideal ? 'text-green-600' : value <= ideal * 1.2 ? 'text-amber-600' : 'text-red-600';
  return <span className={`mt-1 block text-right text-xs ${tone}`}>{value} / {ideal} ตัวอักษร</span>;
}
