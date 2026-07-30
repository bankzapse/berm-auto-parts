import type { Settings } from '@prisma/client';
import { lineHref } from '@/lib/data';

// แถบชวนโทร ลอยด้านล่างบนมือถือ — แสดงเสมอ ไม่พึ่ง JS/opacity
export default function CallBar({ s }: { s: Settings }) {
  const tel = (s.phone2 || s.phone).replace(/[^0-9+]/g, '');
  const line = lineHref(s.lineId);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-200 bg-white/95 p-2 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <div className="flex gap-2">
        <a href={`tel:${tel}`} className="btn-primary flex-1 py-3">
          📞 โทรเลย
        </a>
        {line ? (
          <a
            href={line}
            target="_blank"
            rel="noopener noreferrer"
            className="btn px-4 py-3 text-white"
            style={{ backgroundColor: '#06C755' }}
          >
            💬 LINE
          </a>
        ) : null}
        {s.facebookUrl ? (
          <a
            href={s.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline px-4 py-3"
          >
            👍
          </a>
        ) : null}
      </div>
    </div>
  );
}
