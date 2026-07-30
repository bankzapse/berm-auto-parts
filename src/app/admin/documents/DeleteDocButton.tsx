'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/admin/ui';

export default function DeleteDocButton({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm(`ลบเอกสาร ${label} ?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'ลบไม่สำเร็จ');
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'ลบไม่สำเร็จ');
      setBusy(false);
    }
  }

  return (
    <button onClick={del} disabled={busy} className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
      {busy ? <Spinner className="h-4 w-4" /> : 'ลบ'}
    </button>
  );
}
