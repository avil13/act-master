import { act } from '../helpers';
import { ActMaster } from '../act-master';
import type { ActMasterAction, ActMasterOptions } from '../types';

export type ActTestEntityCountKey = 'actions' | 'watchers' | 'listeners' | 'di';

export class ActTest {
  private constructor(private $act: ActMaster) {}

  static getInstance(options: ActMasterOptions = {}): ActMaster & { readonly t: ActTest } {
    //@ts-ignore - ActMaster in prod is singleton
    ActMaster.instance = null;

    const $act = act.init(options);

    return Object.setPrototypeOf({ t: new ActTest($act) }, $act);
  }

  entityCount(key: ActTestEntityCountKey): number {
    if (key === 'di') {
      //@ts-ignore
      return Object.keys(this.$act._DIContainer).length;
    }

    if (key === 'actions') {
      return this.$act._dev_?.actions.size;
    }

    const map = { watchers: '_watchers', listeners: '_listeners' } as const;
    let count = 0;
    this.$act[map[key]].forEach((val) => { count += val.size; });
    return count;
  }

  makeActionStub(action?: Partial<ActMasterAction>): ActMasterAction {
    return { name: `Act_${Math.random()}`, exec: () => null, ...action };
  }

  makeAndAddActionStub(action?: Partial<ActMasterAction>): ActMaster {
    const act = this.makeActionStub(action);
    this.$act.addAction(act);
    return this.$act;
  }
}
