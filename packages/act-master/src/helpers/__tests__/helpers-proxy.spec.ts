import { beforeEach, expect, it } from 'vitest';
import { $act, act } from '../..';
import { ActTest } from '../../test-utils';

const sumAction = {
  name: 'SumGet',
  exec(a: number, b: number): number {
    return a + b;
  },
};

beforeEach(() => {
  // As a singleton, we create an instance to work with
  ActTest.getInstance();
});

it('$act.[Action]', async () => {
  act().addActions([sumAction]);
  // @ts-ignore - in current tests no this type
  const result = await $act.SumGet(2, 3);
  expect(result).toBe(5);
});

it('act().subscribe', async () => {
  act().addActions([sumAction]);
  let resultBySubscribe = 0;
  let resultByOn = 0;

  act().subscribe('SumGet', (val) => (resultBySubscribe = val));
  act().on('SumGet', (val) => (resultByOn = val));

  // @ts-ignore - in current tests no this type
  await $act.SumGet(3, 4);

  expect(resultBySubscribe).toBe(7);
  expect(resultByOn).toBe(7);
});
