'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Map as LMap, Marker as LMarker, LeafletMouseEvent } from 'leaflet';

// เลือกพิกัดร้านบนแผนที่ (OpenStreetMap ฟรี ไม่ต้องมี API key)
export default function MapPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const markerRef = useRef<LMarker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [msg, setMsg] = useState('');

  const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

  useEffect(() => {
    let cancelled = false;
    const startLat = lat || 18.52;
    const startLng = lng || 98.938;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current).setView([startLat, startLng], 15);
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      const icon = L.divIcon({
        className: 'bb-map-pin',
        html: '<div style="width:22px;height:22px;background:#b52f2f;border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,.45)"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 22],
      });
      const marker = L.marker([startLat, startLng], { draggable: true, icon }).addTo(map);
      markerRef.current = marker;
      marker.on('dragend', () => {
        const p = marker.getLatLng();
        onChangeRef.current(round6(p.lat), round6(p.lng));
      });
      map.on('click', (e: LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current(round6(e.latlng.lat), round6(e.latlng.lng));
      });
      setTimeout(() => map.invalidateSize(), 200);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // อัปเดตหมุดเมื่อพิกัดถูกแก้จากช่องกรอกภายนอก
  useEffect(() => {
    if (markerRef.current && mapRef.current && lat && lng) {
      markerRef.current.setLatLng([lat, lng]);
    }
  }, [lat, lng]);

  async function doSearch() {
    const q = search.trim();
    if (!q) return;
    setSearching(true);
    setMsg('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept-Language': 'th' } },
      );
      const data = await res.json();
      if (data && data[0]) {
        const la = Number(data[0].lat);
        const lo = Number(data[0].lon);
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([la, lo], 16);
          markerRef.current.setLatLng([la, lo]);
        }
        onChangeRef.current(round6(la), round6(lo));
      } else {
        setMsg('ไม่พบสถานที่ — ลองพิมพ์ละเอียดขึ้น หรือคลิกบนแผนที่เอง');
      }
    } catch {
      setMsg('ค้นหาไม่สำเร็จ ลองใหม่ หรือคลิกบนแผนที่เอง');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <input
          className="input"
          placeholder="ค้นหาที่อยู่/ชื่อร้าน เช่น ป่าซาง ลำพูน"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              doSearch();
            }
          }}
        />
        <button type="button" onClick={doSearch} disabled={searching} className="btn-outline whitespace-nowrap px-4">
          {searching ? 'ค้นหา…' : 'ค้นหา'}
        </button>
      </div>
      <div
        ref={containerRef}
        style={{ height: 320 }}
        className="w-full overflow-hidden rounded-xl border border-neutral-200"
      />
      <p className="mt-1 text-xs text-neutral-500">คลิกบนแผนที่ หรือลากหมุดสีแดง เพื่อตั้งพิกัดร้าน</p>
      {msg ? <p className="mt-1 text-xs text-amber-600">{msg}</p> : null}
    </div>
  );
}
