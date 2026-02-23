import { describe, it, expectTypeOf, expect } from 'vitest';
import type {
  Bean,
  Shot,
  TasteFeedback,
  BalanceValue,
  CreateBeanInput,
  CreateShotInput,
  GuidanceSuggestion,
  DataExport,
} from './index';
import { EXPORT_VERSION } from './index';

describe('Type definitions', () => {
  it('Bean has required fields', () => {
    expectTypeOf<Bean>().toHaveProperty('id');
    expectTypeOf<Bean>().toHaveProperty('name');
    expectTypeOf<Bean>().toHaveProperty('roaster');
    expectTypeOf<Bean>().toHaveProperty('dialedRecipe');
    expectTypeOf<Bean>().toHaveProperty('isDialedIn');
  });

  it('Shot has required fields', () => {
    expectTypeOf<Shot>().toHaveProperty('id');
    expectTypeOf<Shot>().toHaveProperty('beanId');
    expectTypeOf<Shot>().toHaveProperty('doseGrams');
    expectTypeOf<Shot>().toHaveProperty('yieldGrams');
    expectTypeOf<Shot>().toHaveProperty('timeSeconds');
    expectTypeOf<Shot>().toHaveProperty('taste');
  });

  it('TasteFeedback.balance accepts valid values', () => {
    const validBalances: BalanceValue[] = [-2, -1, 0, 1, 2];
    expectTypeOf(validBalances).toMatchTypeOf<BalanceValue[]>();
  });

  it('CreateBeanInput has minimal required fields', () => {
    expectTypeOf<CreateBeanInput>().toHaveProperty('name');
    expectTypeOf<CreateBeanInput>().toHaveProperty('roaster');
  });

  it('CreateShotInput has required fields', () => {
    expectTypeOf<CreateShotInput>().toHaveProperty('beanId');
    expectTypeOf<CreateShotInput>().toHaveProperty('doseGrams');
    expectTypeOf<CreateShotInput>().toHaveProperty('yieldGrams');
    expectTypeOf<CreateShotInput>().toHaveProperty('timeSeconds');
    expectTypeOf<CreateShotInput>().toHaveProperty('taste');
  });

  it('GuidanceSuggestion has required fields', () => {
    expectTypeOf<GuidanceSuggestion>().toHaveProperty('action');
    expectTypeOf<GuidanceSuggestion>().toHaveProperty('message');
    expectTypeOf<GuidanceSuggestion>().toHaveProperty('confidence');
    expectTypeOf<GuidanceSuggestion>().toHaveProperty('reasoning');
  });

  it('DataExport has required fields', () => {
    expectTypeOf<DataExport>().toHaveProperty('version');
    expectTypeOf<DataExport>().toHaveProperty('exportedAt');
    expectTypeOf<DataExport>().toHaveProperty('beans');
    expectTypeOf<DataExport>().toHaveProperty('shots');
  });

  it('EXPORT_VERSION is 1', () => {
    expect(EXPORT_VERSION).toBe(1);
  });

  it('TasteFeedback is used by CreateShotInput', () => {
    expectTypeOf<CreateShotInput['taste']>().toMatchTypeOf<TasteFeedback>();
  });
});
