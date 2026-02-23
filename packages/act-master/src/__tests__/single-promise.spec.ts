import { ActMasterAction } from '..';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActTest } from '../test-utils';

const $act = ActTest.getInstance();

afterEach(() => {
  ActTest.resetAll();
});

describe('SinglePromise', () => {
  it('one instance', async () => {
    const action: ActMasterAction = {
      isSingleExec: true, // prop for single exec
      name: 'ACT_NAME_ONE',
      async exec(val: number) {
        return await new Promise((ok) => setTimeout(() => ok(val), 50));
      },
    };

    $act.addAction(action);

    const mockFn = vi.fn();

    $act.on('ACT_NAME_ONE', mockFn);

    await Promise.all([
      $act.exec('ACT_NAME_ONE', 10),
      $act.exec('ACT_NAME_ONE', 5),
      $act.exec('ACT_NAME_ONE', 1),
    ]);

    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toBeCalledWith(10);
  });

  it('many instance', async () => {
    const action: ActMasterAction = {
      name: 'ACT_NAME_TWO',
      async exec(val: number) {
        return await new Promise((ok) => setTimeout(() => ok(val), 50));
      },
    };

    $act.addAction(action);

    const mockFn = vi.fn();

    $act.on('ACT_NAME_TWO', mockFn);

    await Promise.all([
      $act.exec('ACT_NAME_TWO', 10),
      $act.exec('ACT_NAME_TWO', 5),
      $act.exec('ACT_NAME_TWO', 1),
    ]);

    expect(mockFn).toBeCalledTimes(3);
    expect(mockFn).toBeCalledWith(1);
  });
});
