import { beforeAll, describe, expect, it } from 'vitest';
import { ActTest } from '../test-utils';

const $act = ActTest.getInstance();

describe('inProgress', () => {
  beforeAll(() => {
    $act.addAction({
      name: 'getData',
      resolve: null,
      exec(isStop: boolean) {
        if (isStop && this.resolve) {
          return this.resolve();
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return new Promise((resolve) => {
          self.resolve = resolve;
        });
      },
    });
  });

  it('inProgress("key")', async () => {
    let status = false;

    $act.inProgress('getData', (inProgress) => {
      status = inProgress;
    });

    $act.exec('getData');

    expect(status).toBe(true);

    await $act.exec('getData', true);

    expect(status).toBe(false);
  });

  it('inProgress(["key1", "key2"])', async () => {
    let status = false;

    $act.inProgress(['getData'], (inProgress) => {
      status = inProgress;
    });

    $act.exec('getData');

    expect(status).toBe(true);

    await $act.exec('getData', true);

    expect(status).toBe(false);
  });
});
