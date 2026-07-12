import { describe, expect, it } from 'vitest';
import { ActTest } from '../test-utils';

describe('Subscribe list cleaner', () => {
  it('Deprecated test:  Adding come subscriptions in different keys', () => {
    const $act = ActTest.getInstance();
    const action = $act.t.makeActionStub({ name: 'ACT_1' });

    $act.addActions([action]);

    $act.subsList.add(this);

    $act.subscribe('ACT_1', () => null);
    $act.subscribe('ACT_1', () => null);

    expect($act.t.entityCount('listeners')).toBe(2);

    $act.subsList.clear(this);

    expect($act.t.entityCount('listeners')).toBe(0);
  });

  it('ActTest 2: Adding come subscriptions in different keys', () => {
    const $act = ActTest.getInstance();
    const action = $act.t.makeActionStub({ name: 'ACT_1' });

    $act.addActions([action]);

    $act.subsList.add(this);

    $act.subscribe('ACT_1', () => null);
    $act.subscribe('ACT_1', () => null);

    expect($act.t.entityCount('listeners')).toBe(2);

    $act.subsList.clear(this);

    expect($act.t.entityCount('listeners')).toBe(0);
  });
});
