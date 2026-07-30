'use client';

import { useState } from 'react';
import type { Settings } from '@prisma/client';
import { Field, SaveButton, type SaveState } from '@/components/admin/ui';
import ImageUploader from '@/components/admin/ImageUploader';

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [f, setF] = useState<Settings>(initial);
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState('');
  const [testMsg, setTestMsg] = useState('');

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

  return (
    <form onSubmit={save} className="space-y-8">
      <Section title="ข้อมูลทั่วไป">
        <Field label="ชื่อร้าน">
          <input className="input" value={f.shopName} onChange={set('shopName')} />
        </Field>
        <Field label="สโลแกน (tagline)">
          <input className="input" value={f.tagline} onChange={set('tagline')} />
        </Field>
        <Field label="ประเภทสินค้า">
          <input className="input" value={f.shopType} onChange={set('shopType')} />
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
      </Section>

      <Section title="รูปภาพหลัก">
        <ImageUploader label="โลโก้ร้าน" value={f.logoImage} onChange={(v) => setF((p) => ({ ...p, logoImage: v }))} />
        <ImageUploader label="รูป Hero (หน้าแรก)" value={f.heroImage} onChange={(v) => setF((p) => ({ ...p, heroImage: v }))} />
        <ImageUploader label="รูป OG (แชร์โซเชียล)" value={f.ogImage} onChange={(v) => setF((p) => ({ ...p, ogImage: v }))} />
      </Section>

      <Section title="ติดต่อ">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="เบอร์โทร 1">
            <input className="input" value={f.phone} onChange={set('phone')} />
          </Field>
          <Field label="เบอร์โทร 2">
            <input className="input" value={f.phone2} onChange={set('phone2')} />
          </Field>
          <Field label="LINE ID">
            <input className="input" value={f.lineId} onChange={set('lineId')} />
          </Field>
          <Field label="ลิงก์ Facebook">
            <input className="input" value={f.facebookUrl} onChange={set('facebookUrl')} />
          </Field>
        </div>
      </Section>

      <Section title="ที่อยู่ & แผนที่">
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
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Latitude (พิกัด)">
            <input className="input" value={String(f.latitude)} onChange={set('latitude')} />
          </Field>
          <Field label="Longitude (พิกัด)">
            <input className="input" value={String(f.longitude)} onChange={set('longitude')} />
          </Field>
        </div>
        <Field label="ลิงก์ฝังแผนที่ Google (embed URL)" hint="เว้นว่างได้ ระบบจะสร้างจากพิกัด/ชื่อร้านให้อัตโนมัติ">
          <input className="input" value={f.mapEmbedUrl} onChange={set('mapEmbedUrl')} />
        </Field>
      </Section>

      <Section title="เอกสาร (ใบเสร็จ / ใบวางบิล)">
        <Field label="เลขประจำตัวผู้เสียภาษี" hint="แสดงบนหัวเอกสาร (ถ้ามี)">
          <input className="input" value={f.taxId} onChange={set('taxId')} />
        </Field>
        <Field label="ข้อความท้ายเอกสาร">
          <input className="input" value={f.docFooter} onChange={set('docFooter')} />
        </Field>
      </Section>

      <Section title="แจ้งเตือนสต็อกต่ำ (Webhook)">
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
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

      <Section title="SEO">
        <Field label="Meta Title" hint="ควรมีชื่อร้าน + คีย์เวิร์ด + พื้นที่ (ป่าซาง ลำพูน)">
          <input className="input" value={f.seoTitle} onChange={set('seoTitle')} />
        </Field>
        <Field label="Meta Description" hint="สรุปสั้น ๆ ~150-160 ตัวอักษร">
          <textarea className="input min-h-24" value={f.seoDescription} onChange={set('seoDescription')} />
        </Field>
        <Field label="Keywords (คั่นด้วยจุลภาค)">
          <textarea className="input min-h-20" value={f.seoKeywords} onChange={set('seoKeywords')} />
        </Field>
      </Section>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="sticky bottom-4 flex items-center gap-3">
        <SaveButton state={state} label="บันทึกการตั้งค่า" />
        {state === 'saved' && <span className="text-sm text-green-700">บันทึกเรียบร้อย</span>}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 border-b border-neutral-200 pb-2 text-lg font-bold text-brand-800">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
