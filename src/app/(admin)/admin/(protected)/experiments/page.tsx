import Link from "next/link";
import { Stamp } from "@/components/lab/Stamp";
import { listAllExperiments } from "@/lib/admin/queries";
import { experimentCode, stageLabel } from "@/lib/loop";

export default async function AdminExperimentsPage() {
  const all = await listAllExperiments();
  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-[28px]">Experiments</h1>
        <Link href="/admin/experiments/new" className="rounded-note bg-ink px-4 py-2 text-[14px] text-paper">
          New experiment
        </Link>
      </div>
      <ul className="mt-6 border-t border-ink">
        {all.length === 0 && <li className="py-8 text-center font-serif text-muted italic">No experiments yet.</li>}
        {all.map((e) => (
          <li key={e.id} className="flex items-center gap-4 border-b border-line py-3">
            <span className="w-16 font-mono text-[12px] text-muted">{experimentCode(e.number)}</span>
            <Link href={`/admin/experiments/${e.id}`} className="ink-link min-w-0 flex-1 truncate font-serif text-[18px]">
              {e.title}
            </Link>
            <span className="text-[13px] text-muted">
              {e.stage} · {stageLabel(e.stage)}
              {!e.isPublic && " · hidden"}
            </span>
            <Stamp verdict={e.verdict} status={e.status} />
          </li>
        ))}
      </ul>
    </main>
  );
}
