import type { Settings } from '@prisma/client';
import { lineHref, lineIsLinkable } from '@/lib/data';

// แถบข้อมูลบนสุดแบบเว็บ corporate — เวลาทำการ + ช่องทางติดต่อ
export default function TopBar({ s }: { s: Settings }) {
  const line = lineIsLinkable(s.lineId) ? lineHref(s.lineId) : '';
  return (
    <div className="hidden bg-brand-950 text-brand-100 md:block">
      <div className="container-x flex h-9 items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span>🕒 {s.openHours}</span>
          {s.topBarNote ? (
            <>
              <span className="text-brand-400">|</span>
              <span>{s.topBarNote}</span>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          <a href={`tel:${s.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white">📞 {s.phone}</a>
          {s.phone2 ? (
            <a href={`tel:${s.phone2.replace(/[^0-9+]/g, '')}`} className="hover:text-white">📱 {s.phone2}</a>
          ) : null}
          {line ? (
            <a href={line} target="_blank" rel="noopener noreferrer" className="hover:text-white">💬 LINE</a>
          ) : null}
          {s.facebookUrl ? (
            <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">👍 Facebook</a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
