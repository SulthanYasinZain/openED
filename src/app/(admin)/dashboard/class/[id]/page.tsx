import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { id } = await params;


  return (
    <main className="p-6   space-y-4">
      <Link 
        href="/dashboard" 
        className="text-sm text-stone-500 hover:underline mb-4 inline-block"
      >
        ← Kembali ke Dashboard
      </Link>

<div className="flex">
 <Link 
        href={`/dashboard/class/${id}/create`} 
    
      >
       Buat Kelas
      </Link>
<ul className="space-y-3">
  <li className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
    <div className="space-y-1">
      <p className="font-medium text-stone-900">Introduction To Scratch</p>
      <p className="text-sm text-stone-500">Jumat, xx 2026</p>
    </div>

    <div className="flex items-center gap-2">
      <button className="rounded-md border border-stone-200 px-3 py-2 text-sm hover:bg-stone-50">
        View
      </button>

      <button className="rounded-md border border-stone-200 px-3 py-2 text-sm hover:bg-stone-50">
        Grade
      </button>

      <button className="rounded-md bg-stone-900 px-3 py-2 text-sm text-white hover:bg-stone-800">
        Presence
      </button>
    </div>
  </li>
  
   <li className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
    <div className="space-y-1">
      <p className="font-medium text-stone-900">Introduction To Scratch</p>
      <p className="text-sm text-stone-500">Jumat, xx 2026</p>
    </div>

    <div className="flex items-center gap-2">
      <button className="rounded-md border border-stone-200 px-3 py-2 text-sm hover:bg-stone-50">
        View
      </button>

      <button className="rounded-md border border-stone-200 px-3 py-2 text-sm hover:bg-stone-50">
        Grade
      </button>

      <button className="rounded-md bg-stone-900 px-3 py-2 text-sm text-white hover:bg-stone-800">
        Presence
      </button>
    </div>
  </li>
</ul>

<div>
<p>10 pertemuan</p>
<p>SD - Kelas 4</p>
</div>
</div>
    </main>
  );
}
