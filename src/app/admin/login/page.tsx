'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/admin/ui';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/admin';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      router.push(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เข้าสู่ระบบไม่สำเร็จ');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-700 text-xl font-bold text-white">
            B.B.
          </div>
          <h1 className="mt-3 text-xl font-bold text-brand-800">เข้าสู่ระบบผู้ดูแล</h1>
          <p className="text-sm text-neutral-500">เบิ้มอะไหล่ยนต์</p>
        </div>

        <label className="label" htmlFor="username">
          ชื่อผู้ใช้ <span className="font-normal text-neutral-400">(เว้นว่าง = เจ้าของร้าน)</span>
        </label>
        <input
          id="username"
          type="text"
          className="input mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ชื่อผู้ใช้พนักงาน"
          autoComplete="username"
        />

        <label className="label" htmlFor="password">
          รหัสผ่าน
        </label>
        <input
          id="password"
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
          required
        />

        {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full disabled:opacity-70">
          {loading ? (
            <>
              <Spinner /> กำลังเข้าสู่ระบบ…
            </>
          ) : (
            'เข้าสู่ระบบ'
          )}
        </button>
      </form>
    </div>
  );
}
