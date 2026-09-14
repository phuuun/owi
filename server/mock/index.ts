import type { SampleCase } from '../../src/types.ts';
import { falseDebt } from './cases/false-debt.ts';
import { misleadingFuel } from './cases/misleading-fuel.ts';
import { opinionDownstreaming } from './cases/opinion-downstreaming.ts';
import { trueMkRuling } from './cases/true-mk-ruling.ts';
import { unverifiableRumor } from './cases/unverifiable-rumor.ts';
import type { MockCase } from './types.ts';

/** Checked in order: the first case whose keywords match wins. */
export const CASES: MockCase[] = [falseDebt, trueMkRuling, misleadingFuel, opinionDownstreaming, unverifiableRumor];

export const SAMPLES: SampleCase[] = CASES.map((c) => ({ id: c.case_id, ...c.sample }));
