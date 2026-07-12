import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActTest } from '../test-utils';
import { addTestActionFactory } from './test-helpers';

const $act = ActTest.getInstance();

const addTestAction = addTestActionFactory($act);

describe('ActMaster', () => {
  // tests
  describe('Actions', () => {
    it('addActions', async () => {
      const { eventName } = addTestAction();

      //@ts-ignore
      expect($act.getActionOrNull(eventName)).toBeTruthy();
    });

    it('remove action', async () => {
      const { eventName, expectMockResult } = addTestAction();

      const result = await $act.exec(eventName);
      expect(result).toBe(expectMockResult);

      $act.removeAction(eventName);
      expect($act.exec(eventName)).rejects.toThrow();
    });
  });

  describe('Executions', () => {
    it('exec', async () => {
      const { eventName, expectMockResult } = addTestAction();

      const result = await $act.exec(eventName);
      expect(result).toBe(expectMockResult);
    });
  });

  describe('Subscriptions', () => {
    it('subscribe', async () => {
      const { eventName } = addTestAction();
      let subscribedData: any;

      $act.subscribe(eventName, (data) => {
        subscribedData = data;
      });

      const result = await $act.exec(eventName);
      expect(result).toBe(subscribedData);
    });

    it('unsubscribe', async () => {
      const { eventName } = addTestAction();
      let subscribedData: any;

      const unsubscribe = $act.subscribe(eventName, (data) => {
        subscribedData = data;
      });

      let result;
      result = await $act.exec(eventName);
      expect(result).toBe(subscribedData);

      unsubscribe();
      subscribedData = null;

      result = await $act.exec(eventName);
      expect(result).not.toBe(subscribedData);
    });

    it('once method', async () => {
      const { eventName } = addTestAction();
      const mockCallback = vi.fn();

      $act.once(eventName, mockCallback);

      await $act.exec(eventName);
      await $act.exec(eventName);
      await $act.exec(eventName);

      expect(mockCallback).toBeCalledTimes(1);
    });
  });
});
