import Link from 'next/link';

export default function MilestonePage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Milestone {params.id}</h1>
      <p className="text-sm text-[#8B8680]">Submit deliverables and track status.</p>
      <Link href={`/deliver/${params.id}`} className="underline text-sm">Open delivery review</Link>
    </div>
  );
}
