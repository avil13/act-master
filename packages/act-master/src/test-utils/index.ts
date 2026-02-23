import { act } from '../helpers';
import { type ActEventName, ActMaster } from '../act-master';
import type {
  ActExec,
  ActMasterAction,
  ActMasterOptions,
  ListenerFunction,
} from '../types';

export type ActTestEntityCountKey = 'actions' | 'watchers' | 'listeners' | 'di';

export class ActTest {
  /** @deprecated */
  private static $act: ActMaster;
  /** @deprecated */
  private static _lastResult: any;

  private constructor(private $act: ActMaster) { }

  static getInstance(options: ActMasterOptions = {}): ActMaster & { readonly t: ActTest } {
    //@ts-ignore
    const oldInstance: ActMaster = ActMaster.instance;
    //@ts-ignore
    ActMaster.instance = null;

    ActTest.resetAll();
    ActTest.removeSingleton();

    const $act = act.init(options);
    ActTest.$act = $act;

    //@ts-ignore // TODO: remove in next major relies
    ActMaster.instance = oldInstance || $act;

    return Object.setPrototypeOf({ t: new ActTest($act) }, $act);
  }

  /** @deprecated Now all test function calls can be made from the $act object. */
  static setInstance(actMaster: ActMaster) {
    ActTest.$act = actMaster;
  }

  /** @deprecated Now all test function calls can be made from the $act object. */
  static checkInstance(actMaster: ActMaster) {
    return ActTest.$act === actMaster;
  }

  /** @deprecated Now all test function calls can be made from the $act object. */
  static resetAll(): void {
    if (ActTest.$act) {
      ActTest.$act.clearActions();
      ActTest.$act.clearListeners();
      ActTest.$act.clearDI();
    }
    ActTest._lastResult = undefined;
  }

  /** @deprecated Now all test function calls can be made from the $act object. */
  static removeSingleton() {
    //@ts-ignore
    ActMaster.instance = undefined;
    ActTest._lastResult = undefined;
  }

  /** @deprecated Now all test function calls can be made from the $act object. */
  static addActions(actions: ActMasterAction[]): void {
    if (!ActTest.$act) {
      ActTest.getInstance();
    }

    ActTest.$act.addActions(actions);
  }

  /** @deprecated Now all test function calls can be made from the $act object. */
  static exec: ActExec = (eventName, ...args) => {
    return ActTest.$act
      .exec(eventName, ...args)
      .then((data) => {
        ActTest._lastResult = data;
        return data;
      })
      .catch((err) => {
        ActTest._lastResult = err;
        throw err;
      });
  };

  /** @deprecated Now all test function calls can be made from the $act object. */
  static subscribe(
    eventName: ActEventName,
    listener: ListenerFunction,
    context?: any
  ): () => boolean {
    return ActTest.$act.subscribe(eventName, listener, context);
  }

  /** @deprecated Now all test function calls can be made from the $act object. */
  static entityCount(key: ActTestEntityCountKey): number {
    if (key === 'di') {
      //@ts-ignore
      return Object.keys(ActTest.$act._DIContainer).length;
    }

    if (key === 'actions') {
      return ActTest.$act._dev_?.actions.size;
    }

    const map = {
      watchers: '_watchers',
      listeners: '_listeners',
    } as const;

    const propName = map[key];

    let count = 0;

    ActTest.$act[propName].forEach((val) => {
      count += val.size;
    });

    return count;
  }

  entityCount(key: ActTestEntityCountKey): number {
    if (key === 'di') {
      //@ts-ignore
      return Object.keys(this.$act._DIContainer).length;
    }

    if (key === 'actions') {
      return this.$act._dev_?.actions.size;
    }

    const map = {
      watchers: '_watchers',
      listeners: '_listeners',
    } as const;

    const propName = map[key];

    let count = 0;

    this.$act[propName].forEach((val) => {
      count += val.size;
    });

    return count;
  }

  /** @deprecated */
  static getLastResult(): any {
    return ActTest._lastResult;
  }

  /** @deprecated */
  static makeActionStub(action?: Partial<ActMasterAction>): ActMasterAction {
    const act = {
      name: `Act_${Math.random()}`,
      exec: () => null,
      ...action,
    };

    return act;
  }

  makeActionStub(action?: Partial<ActMasterAction>): ActMasterAction {
    const act = {
      name: `Act_${Math.random()}`,
      exec: () => null,
      ...action,
    };

    return act;
  }
}
