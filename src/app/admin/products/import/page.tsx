import ImportTool from './ImportTool';

export default function ImportPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-neutral-800">นำเข้าสินค้าจำนวนมาก</h1>
      <p className="mb-6 text-neutral-500">วางตารางจากเว็บ/ไฟล์ Excel หรืออัปโหลด CSV แล้วนำเข้าทีเดียว</p>
      <ImportTool />
    </div>
  );
}
