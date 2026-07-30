'use client';

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
