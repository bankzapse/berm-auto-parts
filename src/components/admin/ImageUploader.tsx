'use client';

import { useRef, useState } from 'react';

// ย่อรูปฝั่ง client ก่อนอัป (ด้าน max 1200px) เพื่อลดขนาดไฟล์
async function resizeImage(file: File, maxDim = 1200, quality = 0.82): Promise<Blob> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = document.createElement('img');
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    if (width >= height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  // ไฟล์ png ที่มีความโปร่งใสให้คงเป็น png, อื่น ๆ เป็น jpeg
  const type = file.type.includes('png') ? 'image/png' : 'image/jpeg';
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), type, quality),
  );
  return blob ?? file;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'รูปภาพ',
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');
    setUploading(true);
    try {
      const blob = await resizeImage(file);
      const form = new FormData();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      form.append('file', blob, `upload.${ext}`);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'อัปโหลดไม่สำเร็จ');
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex gap-4">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="พรีวิว" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
              ไม่มีรูป
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Spinner />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-3 file:py-2 file:text-white hover:file:bg-brand-800"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <input
            type="url"
            placeholder="หรือวางลิงก์รูป (เช่นจาก Facebook) แล้วกด Enter"
            className="input"
            defaultValue={value}
            onBlur={(e) => onChange(e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onChange((e.target as HTMLInputElement).value.trim());
              }
            }}
          />
          {uploading && <p className="text-xs text-brand-700">กำลังอัปโหลด…</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-6 w-6 animate-spin text-brand-700" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
