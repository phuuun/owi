import type { EntityCategory, EntityItem, StanceType } from '../types';

const TYPE: Record<EntityCategory, string> = { INSTITUTION: 'Lembaga', PERSON: 'Tokoh', PARTY: 'Partai' };
const STANCE: Record<StanceType, string> = { POSITIVE: 'positif', NEGATIVE: 'kritis', NEUTRAL: '' };

export function EntityChips({ entities }: { entities: EntityItem[] }) {
  if (entities.length === 0) return null;

  return (
    <section>
      <h3 className="text-sm text-muted">Disebut</h3>
      <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
        {entities.map((e, i) => (
          <li key={i}>
            {e.name}
            <span className="ml-2 text-sm text-muted">{[TYPE[e.type], STANCE[e.stance]].filter(Boolean).join(', ')}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
