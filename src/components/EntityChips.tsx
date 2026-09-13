import React from 'react';
import { EntityItem, EntityCategory, StanceType } from '../types';
import { Users, Info, Building2, User, Flag } from 'lucide-react';

interface EntityChipsProps {
  entities: EntityItem[];
}

const getTypeLabel = (type: EntityCategory): { label: string; icon: React.ReactNode } => {
  switch (type) {
    case 'INSTITUTION':
      return {
        label: 'Lembaga',
        icon: <Building2 className="w-3 h-3 text-neutral-400" />,
      };
    case 'PERSON':
      return {
        label: 'Tokoh',
        icon: <User className="w-3 h-3 text-neutral-400" />,
      };
    case 'PARTY':
      return {
        label: 'Partai',
        icon: <Flag className="w-3 h-3 text-neutral-400" />,
      };
    default:
      return {
        label: 'Entitas',
        icon: <Users className="w-3 h-3 text-neutral-400" />,
      };
  }
};

const getStanceStyle = (stance: StanceType): { label: string; badge: string } => {
  switch (stance) {
    case 'POSITIVE':
      return {
        label: 'Positif',
        badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      };
    case 'NEGATIVE':
      return {
        label: 'Kritis / Negatif',
        badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      };
    case 'NEUTRAL':
    default:
      return {
        label: 'Netral',
        badge: 'text-neutral-400 bg-white/[0.04] border-white/[0.06]',
      };
  }
};

export const EntityChips: React.FC<EntityChipsProps> = ({ entities }) => {
  if (!entities || entities.length === 0) {
    return null;
  }

  return (
    <section
      id="entities-section"
      className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-6 space-y-4 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Entitas disebut
          </h3>
        </div>
        <span className="text-[11px] text-neutral-500 font-mono">
          {entities.length} entitas
        </span>
      </div>

      {/* Entity Chips Grid */}
      <div className="flex flex-wrap gap-2.5 pt-1">
        {entities.map((entity, idx) => {
          const typeInfo = getTypeLabel(entity.type);
          const stanceInfo = getStanceStyle(entity.stance);

          return (
            <div
              key={idx}
              id={`entity-chip-${idx}`}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#121215] border border-white/[0.08] rounded-full text-xs transition-all hover:border-white/[0.2]"
            >
              <div className="flex items-center gap-1.5 text-neutral-400">
                {typeInfo.icon}
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                  {typeInfo.label}
                </span>
              </div>

              <span className="font-medium text-white text-xs">
                {entity.name}
              </span>

              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${stanceInfo.badge}`}
              >
                {stanceInfo.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Explicit methodology note required by prompt */}
      <div
        id="entity-methodology-note"
        className="flex items-start gap-2.5 pt-3 border-t border-white/[0.06] text-xs text-neutral-400 leading-relaxed"
      >
        <Info className="w-3.5 h-3.5 shrink-0 text-neutral-500 mt-0.5" />
        <p className="text-[11px]">
          <span className="text-neutral-300 font-medium">Catatan metodologi:</span> Pendirian atau sentimen negatif terhadap suatu figur publik, partai, maupun lembaga negara adalah wajar dalam ekspresi politik dan{' '}
          <span className="text-white font-medium">bukan merupakan indikator bahwa informasi tersebut merupakan disinformasi atau hoaks</span>.
        </p>
      </div>
    </section>
  );
};
