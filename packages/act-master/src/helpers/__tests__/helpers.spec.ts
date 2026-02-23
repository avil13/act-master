import { beforeEach, describe, expect, it } from 'vitest';
import { act, ActMaster } from '../..';
import { ActTest } from '../../test-utils';
import { fn2act } from '../function-to-action';

const sumAction = {
  name: 'sum.get',
  exec(a: number, b: number): number {
    return a + b;
  },
};

beforeEach(() => {
  // As a singleton, we create an instance to work with
  ActTest.getInstance();
});

it('act function return instance', () => {
  expect(act() instanceof ActMaster).toBe(true);
});

it('act().exec', async () => {
  act().addActions([sumAction]);
  const result = await act().exec('sum.get', 2, 3);
  expect(result).toBe(5);
});

it('act().subscribe', async () => {
  act().addActions([sumAction]);
  let resultBySubscribe = 0;
  let resultByOn = 0;

  act().subscribe('sum.get', (val) => (resultBySubscribe = val));
  act().on('sum.get', (val) => (resultByOn = val));

  await act().exec('sum.get', 3, 4);

  expect(resultBySubscribe).toBe(7);
  expect(resultByOn).toBe(7);
});

describe('act subscriptions', () => {
  it('clear subscriptions', () => {
    act().addActions([sumAction]);
    expect(ActTest.entityCount('listeners')).toBe(0);

    act().subscribe('sum.get', () => null, 'some_key');
    expect(ActTest.entityCount('listeners')).toBe(1);

    act.subListClear('some_key');

    expect(ActTest.entityCount('listeners')).toBe(0);
  });

  it('unsubscribe', () => {
    act().addActions([sumAction]);
    expect(ActTest.entityCount('listeners')).toBe(0);

    const unsubscribe = act().subscribe('sum.get', () => null);
    expect(ActTest.entityCount('listeners')).toBe(1);

    unsubscribe();
    expect(ActTest.entityCount('listeners')).toBe(0);
  });

  it('unmount', () => {
    act().addActions([sumAction]);
    expect(ActTest.entityCount('listeners')).toBe(0);

    const listFunctions: (() => void)[] = [];
    const onUnmountMock = (cb: () => void) => listFunctions.push(cb);

    act().subscribe('sum.get', () => null, onUnmountMock);
    expect(ActTest.entityCount('listeners')).toBe(1);

    listFunctions.forEach((fn) => fn());
    expect(ActTest.entityCount('listeners')).toBe(0);
  });
});

it('addAction functions', async () => {
  expect(ActTest.entityCount('actions')).toBe(0);

  const callbackAction = (a: number) => {
    return a * 2;
  };

  act().addActions([sumAction, fn2act(callbackAction)]);

  expect(ActTest.entityCount('actions')).toBe(2);

  const result = await act().exec('callbackAction', 2);

  expect(result).toBe(4);
});
