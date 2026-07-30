// Shimmer skeleton ระหว่างสลับหน้า admin — เนื้อหาจริงแสดงเสมอ ไม่แตะ opacity
export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-56 rounded" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4">
            <div className="skeleton mb-2 h-7 w-20 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        ))}
      </div>
      <div className="card divide-y divide-neutral-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="skeleton h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
            <div className="skeleton h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
