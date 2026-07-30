import Link from 'next/link';
import type { Settings } from '@prisma/client';
import { formatAddress, lineHref, lineIsLinkable } from '@/lib/data';

export default function Footer({ s }: { s: Settings }) {
  const tel = (s.phone2 || s.phone).replace(/[^0-9+]/g, '');
  return (
    <footer className="mt-16 bg-brand-950 text-brand-100">
      <div className="container-x grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="text-xl font-bold text-white">{s.shopName}</h3>
          <p className="mt-3 text-sm leading-relaxed text-brand-200">{s.tagline}</p>
        </div>

        <div className="text-sm">
          <h4 className="mb-3 font-semibold text-white">ติดต่อร้าน</h4>
          <ul className="space-y-2 text-brand-200">
            <li>📍 {formatAddress(s) || 'อ.ป่าซาง จ.ลำพูน'}</li>
            <li>
              📞{' '}
              <a href={`tel:${s.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white">
                {s.phone}
              </a>
              {s.phone2 ? (
                <>
                  {' , '}
                  <a href={`tel:${tel}`} className="hover:text-white">
                    {s.phone2}
                  </a>
                </>
              ) : null}
            </li>
            {s.lineId ? (
              <li>
                💬 LINE:{' '}
                {lineIsLinkable(s.lineId) ? (
                  <a href={lineHref(s.lineId)} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {s.lineId}
                  </a>
                ) : (
                  <span>{s.lineId}</span>
                )}
              </li>
            ) : null}
            <li>🕒 {s.openHours}</li>
          </ul>
        </div>

        <div className="text-sm">
          <h4 className="mb-3 font-semibold text-white">เมนู</h4>
          <ul className="space-y-2 text-brand-200">
            <li><Link href="/products" className="hover:text-white">สินค้า/อะไหล่</Link></li>
            <li><Link href="/gallery" className="hover:text-white">ผลงาน</Link></li>
            <li><Link href="/about" className="hover:text-white">เกี่ยวกับเรา</Link></li>
            <li><Link href="/contact" className="hover:text-white">ติดต่อ</Link></li>
          </ul>
          {s.facebookUrl ? (
            <a
              href={s.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-800 px-3 py-2 font-medium text-white hover:bg-brand-700"
            >
              👍 Facebook เพจร้าน
            </a>
          ) : null}
        </div>
      </div>
      <div className="border-t border-brand-900 py-4 text-center text-xs text-brand-300">
        © {new Date().getFullYear()} {s.shopName} — อ.ป่าซาง จ.ลำพูน สงวนลิขสิทธิ์
      </div>
    </footer>
  );
}
