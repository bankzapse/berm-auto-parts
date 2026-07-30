'use client';

import { useState } from 'react';
import { Field, SaveButton, Spinner, type SaveState } from './ui';
import ImageUploader from './ImageUploader';

export type FieldDef = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'price' | 'boolean' | 'image' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  colSpan?: 1 | 2;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;

export default function CollectionManager({
  endpoint,
  items: initialItems,
  fields,
  defaults,
  titleKey = 'name',
  imageKey = 'image',
  subtitle,
  addLabel = 'เพิ่มรายการ',
}: {
  endpoint: string;
  items: Item[];
  fields: FieldDef[];
  defaults: Item;
  titleKey?: string;
  imageKey?: string;
  subtitle?: (item: Item) => string;
  addLabel?: string;
}) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [editing, setEditing] = useState<Item | null>(null);
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startAdd() {
    setError('');
    setEditing({ ...defaults });
  }
  function startEdit(item: Item) {
    setError('');
    setEditing({ ...item });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setState('saving');
    setError('');
    const isNew = !editing.id;
    try {
      const res = await fetch(isNew ? endpoint : `${endpoint}/${editing.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      const saved = data.item;
      setItems((prev) =>
        isNew ? [...prev, saved] : prev.map((it) => (it.id === saved.id ? saved : it)),
      );
      setState('idle');
      setEditing(null);
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    }
  }

  async function remove(item: Item) {
    if (!confirm(`ลบ "${item[titleKey] || 'รายการนี้'}" ?`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch(`${endpoint}/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'ลบไม่สำเร็จ');
      setItems((prev) => prev.filter((it) => it.id !== item.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ลบไม่สำเร็จ');
    } finally {
      setDeletingId(null);
    }
  }

  const setVal = (key: string, value: unknown) =>
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={startAdd} className="btn-primary">
          ➕ {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          ยังไม่มีรายการ — กด “{addLabel}” เพื่อเริ่ม
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="card flex items-center gap-3 p-3">
              {typeof item[imageKey] === 'string' && item[imageKey].startsWith('http') ? (
                <img
                  src={item[imageKey]}
                  alt=""
                  className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-2xl">
                  {item[imageKey] || '📄'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-neutral-800">
                  {item[titleKey] || '(ไม่มีชื่อ)'}
                </div>
                {subtitle ? (
                  <div className="truncate text-sm text-neutral-500">{subtitle(item)}</div>
                ) : null}
              </div>
              <button onClick={() => startEdit(item)} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
                แก้ไข
              </button>
              <button
                onClick={() => remove(item)}
                disabled={deletingId === item.id}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                {deletingId === item.id ? <Spinner className="h-4 w-4" /> : 'ลบ'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ฟอร์มแก้ไข/เพิ่ม (modal) */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <form
            onSubmit={save}
            className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-800">
                {editing.id ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
              </h2>
              <button type="button" onClick={() => setEditing(null)} className="text-neutral-400 hover:text-neutral-700">
                ✕
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((fd) => (
                <div key={fd.key} className={fd.colSpan === 2 || fd.type === 'image' || fd.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  {renderInput(fd, editing[fd.key], (v) => setVal(fd.key, v))}
                </div>
              ))}
            </div>

            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline">
                ยกเลิก
              </button>
              <SaveButton state={state} />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function renderInput(fd: FieldDef, value: unknown, onChange: (v: unknown) => void) {
  switch (fd.type) {
    case 'image':
      return <ImageUploader label={fd.label} value={(value as string) || ''} onChange={onChange} />;
    case 'textarea':
      return (
        <Field label={fd.label} hint={fd.hint}>
          <textarea
            className="input min-h-24"
            value={(value as string) || ''}
            placeholder={fd.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
    case 'boolean':
      return (
        <label className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-neutral-300"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-sm font-medium text-neutral-700">{fd.label}</span>
        </label>
      );
    case 'select':
      return (
        <Field label={fd.label} hint={fd.hint}>
          <select className="input" value={(value as string) || ''} onChange={(e) => onChange(e.target.value)}>
            <option value="">— ไม่ระบุ —</option>
            {fd.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      );
    case 'number':
    case 'price':
      return (
        <Field label={fd.label} hint={fd.hint}>
          <input
            type="number"
            step={fd.type === 'price' ? '0.01' : '1'}
            className="input"
            value={value === null || value === undefined ? '' : String(value)}
            placeholder={fd.placeholder}
            onChange={(e) => onChange(e.target.value === '' ? (fd.type === 'price' ? null : 0) : Number(e.target.value))}
          />
        </Field>
      );
    default:
      return (
        <Field label={fd.label} hint={fd.hint}>
          <input
            className="input"
            value={(value as string) || ''}
            placeholder={fd.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
  }
}
