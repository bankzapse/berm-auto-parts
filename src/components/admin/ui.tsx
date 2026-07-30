'use client';

import { useEffect, useRef, useState } from 'react';

// ช่องกรอกตัวเลขที่ "ลบให้ว่างได้" (แก้ปัญหาช่อง 0 ลบไม่ออก)
// เก็บ buffer เป็น string ระหว่างพิมพ์ แล้วส่งค่าตัวเลขออกไป (ว่าง = emptyValue)
export function NumberInput({
  value,
  onChange,
  emptyValue = 0,
  className = 'input',
  min,
  max,
  step,
  placeholder,
  disabled,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  emptyValue?: number | null;
  className?: string;
  min?: number;
  max?: number;
  step?: number | string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [buf, setBuf] = useState<string>(value == null ? '' : String(value));
  const emittedRef = useRef<number | null>(value);

  // ซิงก์ buffer เมื่อค่าถูกเปลี่ยนจากภายนอก (ไม่ใช่จากการพิมพ์ในช่องนี้)
  useEffect(() => {
    if (value !== emittedRef.current) {
      emittedRef.current = value;
      setBuf(value == null ? '' : String(value));
    }
  }, [value]);

  return (
    <input
      type="number"
      inputMode="decimal"
      className={className}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      disabled={disabled}
      value={buf}
      onChange={(e) => {
        const s = e.target.value;
        setBuf(s);
        const next = s === '' || s === '-' ? emptyValue : Number(s);
        const val = next != null && Number.isNaN(next) ? emptyValue : next;
        emittedRef.current = val;
        onChange(val);
      }}
      onBlur={() => {
        // ออกจากช่องแล้วยังว่าง → โชว์ค่าจริงกลับมา (กันช่องว่างค้าง)
        if (buf === '' || buf === '-') setBuf(emptyValue == null ? '' : String(emptyValue));
      }}
    />
  );
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function SaveButton({
  state,
  label = 'บันทึก',
  className = '',
}: {
  state: SaveState;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={state === 'saving'}
      className={`btn-primary disabled:opacity-70 ${className}`}
    >
      {state === 'saving' ? (
        <>
          <Spinner /> กำลังบันทึก…
        </>
      ) : state === 'saved' ? (
        <>✓ บันทึกแล้ว</>
      ) : (
        label
      )}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-neutral-500">{hint}</span> : null}
    </label>
  );
}
