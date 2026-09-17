import type { Lang, SampleCase } from '../../src/types.ts';
import { astroturfedBrand } from './cases/astroturfed-brand.ts';
import { astroturfedIkn } from './cases/astroturfed-ikn.ts';
import { insufficientRepliesOff } from './cases/insufficient-replies-off.ts';
import { leaningPpn } from './cases/leaning-ppn.ts';
import { neutralDebat } from './cases/neutral-debat.ts';
import type { MockCase } from './types.ts';

/** Checked in order: the first case whose keywords match wins. */
export const CASES: MockCase[] = [astroturfedIkn, leaningPpn, neutralDebat, astroturfedBrand, insufficientRepliesOff];

export const samples = (lang: Lang): SampleCase[] =>
  CASES.map((c) => ({
    id: c.case_id,
    climate: c.result.climate,
    label: c.sample.label[lang],
    note: c.sample.note[lang],
    url: c.sample.url,
  }));
