'use client';

import { useState } from 'react';
import { Spinner } from '@/components/admin/ui';

export default function BackupButton() {
  const [busy, setBusy] = useState(false);

  async function backup() {
    setBusy(true);
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error('สำรองข้อมูลไม่สำเร็จ');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `berm-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'สำรองข้อมูลไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={backup} disabled={busy} className="btn-outline disabled:opacity-70">
      {busy ? <><Spinner className="h-4 w-4" /> กำลังสำรอง…</> : '💾 สำรองข้อมูล (JSON)'}
    </button>
  );
}
