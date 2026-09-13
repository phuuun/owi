import { ArrowUpRight } from 'lucide-react';
import type { EvidenceItem, EvidenceStance } from '../types';

const STANCE: Record<EvidenceStance, { label: string; dot: string }> = {
  SUPPORTS: { label: 'Mendukung', dot: 'bg-emerald-500' },
  REFUTES: { label: 'Membantah', dot: 'bg-red-500' },
  UNRELATED: { label: 'Konteks', dot: 'bg-muted' },
};

interface EvidenceListProps {
  evidence: EvidenceItem[];
  retrievalEmpty: boolean;
}

export function EvidenceList({ evidence, retrievalEmpty }: EvidenceListProps) {
  const empty = retrievalEmpty || evidence.length === 0;

  return (
    <section>
      <h3 className="text-sm text-muted">Bukti{!empty && ` · ${evidence.length}`}</h3>

      {empty ? (
        <p className="mt-4 text-lg">Tidak ada bukti relevan yang ditemukan.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {evidence.map((item, i) => {
            const s = STANCE[item.stance] ?? STANCE.UNRELATED;
            return (
              <li key={i} className="py-6">
                <p className="flex items-center gap-2 text-xs text-muted">
                  <span className={`size-1.5 shrink-0 rounded-full ${s.dot}`} />
                  <span>
                    <span className="text-fg">{s.label}</span> · {item.source} · {item.published}
                  </span>
                </p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="group mt-2 block text-lg font-medium leading-snug">
                  <span className="decoration-1 underline-offset-4 group-hover:underline">{item.title}</span>
                  <ArrowUpRight className="ml-1 inline size-4 text-muted" />
                </a>
                <p className="mt-2 leading-relaxed text-muted">{item.snippet}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
