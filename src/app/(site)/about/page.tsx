import type { Metadata } from 'next';
import { getSettings, getTeam, getFeatures, formatAddress } from '@/lib/data';
import PageHeader from '@/components/PageHeader';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: 'เกี่ยวกับเรา',
    description: `${s.aboutTitle} — ${s.shopName} อ.ป่าซาง จ.ลำพูน`,
  };
}

export default async function AboutPage() {
  const [s, team, features] = await Promise.all([getSettings(), getTeam(), getFeatures()]);

  return (
    <>
      <PageHeader title={s.aboutTitle} subtitle={s.tagline} />
      <div className="container-x py-10">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="whitespace-pre-line leading-relaxed text-neutral-700">{s.aboutText}</p>

          {features.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.id} className="card p-5">
                  <div className="text-2xl">{f.icon || '✅'}</div>
                  <h3 className="mt-2 font-bold text-neutral-800">{f.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{f.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="card h-fit p-6">
          <h2 className="font-bold text-brand-800">ข้อมูลร้าน</h2>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>🏪 {s.shopName}</li>
            <li>🔧 {s.shopType}</li>
            <li>📍 {formatAddress(s) || 'อ.ป่าซาง จ.ลำพูน'}</li>
            <li>📞 {s.phone}{s.phone2 ? ` , ${s.phone2}` : ''}</li>
            {s.lineId ? <li>💬 LINE: {s.lineId}</li> : null}
            <li>🕒 {s.openHours}</li>
          </ul>
        </aside>
      </div>

      {/* ทีมงาน */}
      {team.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-2xl font-bold text-brand-800">ทีมงานของเรา</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <div key={m.id} className="card overflow-hidden text-center">
                <img
                  src={m.image || 'https://picsum.photos/seed/team/400/400'}
                  alt={m.name}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h3 className="font-bold text-neutral-800">{m.name}</h3>
                  <p className="text-sm text-brand-600">{m.role}</p>
                  {m.bio ? <p className="mt-2 text-sm text-neutral-600">{m.bio}</p> : null}
                  {m.phone ? (
                    <a
                      href={`tel:${m.phone.replace(/[^0-9+]/g, '')}`}
                      className="mt-2 inline-block text-sm font-medium text-brand-700"
                    >
                      📞 {m.phone}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      </div>
    </>
  );
}
