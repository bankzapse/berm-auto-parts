import type { Metadata } from 'next';
import { getSettings, formatAddress, lineHref } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: 'ติดต่อเรา',
    description: `ติดต่อ ${s.shopName} โทร ${s.phone2 || s.phone} • ${formatAddress(s)}`,
  };
}

export default async function ContactPage() {
  const s = await getSettings();
  const address = formatAddress(s) || 'อ.ป่าซาง จ.ลำพูน';
  const mapSrc =
    s.mapEmbedUrl ||
    `https://www.google.com/maps?q=${encodeURIComponent(
      s.latitude && s.longitude ? `${s.latitude},${s.longitude}` : `${s.shopName} ${address}`,
    )}&output=embed`;
  const mapLink =
    s.latitude && s.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.shopName + ' ' + address)}`;

  return (
    <div className="container-x py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-800">ติดต่อเรา</h1>
        <p className="mt-2 text-neutral-600">โทรสอบถามอะไหล่ หรือแวะที่ร้านได้เลย</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <InfoRow icon="🏪" label="ร้าน" value={s.shopName} />
          <InfoRow icon="📍" label="ที่อยู่" value={address} />
          <InfoRow
            icon="📞"
            label="โทรศัพท์"
            value={
              <span className="flex flex-wrap gap-x-3">
                <a href={`tel:${s.phone.replace(/[^0-9+]/g, '')}`} className="text-brand-700 underline">
                  {s.phone}
                </a>
                {s.phone2 ? (
                  <a href={`tel:${s.phone2.replace(/[^0-9+]/g, '')}`} className="text-brand-700 underline">
                    {s.phone2}
                  </a>
                ) : null}
              </span>
            }
          />
          {s.lineId ? (
            <InfoRow
              icon="💬"
              label="LINE"
              value={
                <a
                  href={lineHref(s.lineId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#06C755] underline"
                >
                  {s.lineId} (แชทเลย)
                </a>
              }
            />
          ) : null}
          <InfoRow icon="🕒" label="เวลาทำการ" value={s.openHours} />

          <div className="flex flex-wrap gap-3 pt-2">
            <a href={`tel:${(s.phone2 || s.phone).replace(/[^0-9+]/g, '')}`} className="btn-primary">
              📞 โทรเลย
            </a>
            {s.lineId ? (
              <a
                href={lineHref(s.lineId)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn text-white"
                style={{ backgroundColor: '#06C755' }}
              >
                💬 แชท LINE
              </a>
            ) : null}
            {s.facebookUrl ? (
              <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
                👍 Facebook
              </a>
            ) : null}
            <a href={mapLink} target="_blank" rel="noopener noreferrer" className="btn-outline">
              🗺️ นำทาง
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
          <iframe
            title={`แผนที่ ${s.shopName}`}
            src={mapSrc}
            className="h-80 w-full lg:h-full"
            style={{ minHeight: 320 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-sm text-neutral-500">{label}</div>
        <div className="font-medium text-neutral-800">{value}</div>
      </div>
    </div>
  );
}
