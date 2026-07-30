import type { Metadata } from 'next';
import { getGallery, getSettings } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: 'ผลงาน / แกลเลอรี',
    description: `ภาพผลงาน สินค้า และบรรยากาศร้าน ${s.shopName} อ.ป่าซาง จ.ลำพูน`,
  };
}

export default async function GalleryPage() {
  const gallery = await getGallery();
  return (
    <div className="container-x py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-800">ผลงาน & แกลเลอรี</h1>
        <p className="mt-2 text-neutral-600">ภาพสินค้า บรรยากาศร้าน และงานที่ผ่านมา</p>
      </header>

      {gallery.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          ยังไม่มีรูปในแกลเลอรี
        </p>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {gallery.map((g) => (
            <figure key={g.id} className="mb-3 break-inside-avoid">
              <img
                src={g.url}
                alt={g.caption || 'ผลงานร้านเบิ้มอะไหล่ยนต์'}
                className="w-full rounded-xl object-cover"
                loading="lazy"
              />
              {g.caption ? (
                <figcaption className="mt-1 px-1 text-sm text-neutral-500">{g.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
