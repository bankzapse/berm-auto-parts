// Shimmer skeleton ระหว่างโหลดหน้า — ไม่แตะ opacity ของเนื้อหาจริง
export default function Loading() {
  return (
    <div>
      <div className="skeleton h-72 w-full" />
      <div className="container-x py-14">
        <div className="skeleton mx-auto mb-8 h-8 w-48 rounded" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-[4/3] w-full" />
              <div className="space-y-2 p-4">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-5 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
