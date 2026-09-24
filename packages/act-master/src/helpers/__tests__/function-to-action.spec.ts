import { describe, expect, it } from 'vitest';
import { ActTest } from '../../test-utils';
import { fn2act, functionToAction } from '../function-to-action';

describe('functionToAction', () => {
  it('dispatches a named function with its original arguments and result', async () => {
    const action = fn2act(function GetBalance(day: string): number {
      return day === '2026.01.01' ? 100 : 0;
    });
    const dispatcher = ActTest.getInstance({ actions: [action] });

    expect(await dispatcher.exec('GetBalance', '2026.01.01')).toBe(100);
  });

  it('preserves async functions and action options', async () => {
    const action = functionToAction(async function GetBalance(): Promise<number> {
      throw new Error('Unavailable');
    });
    action.$onError = 'OnError';
    const errors: unknown[] = [];
    const dispatcher = ActTest.getInstance({
      actions: [action, { name: 'OnError', exec: (error: unknown) => errors.push(error) }],
    });

    expect(await dispatcher.exec('GetBalance')).toBeNull();
    expect(errors).toEqual([new Error('Unavailable')]);
    expect(fn2act).toBe(functionToAction);
  });

  it('continues to reject anonymous functions and non-functions', () => {
    expect(() => fn2act(() => 1)).toThrow('Pass not valid function');
    // @ts-expect-error Verify the runtime guard for JavaScript callers.
    expect(() => fn2act(null)).toThrow('Pass not valid function');
  });
});
