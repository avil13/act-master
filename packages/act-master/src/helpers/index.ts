import { type ActExec, ActMaster, type ActMasterOptions, type ActProxy, type ActSubscribeType } from '../act-master';

interface ActFunction {
  (): ActMaster;
  readonly $act: ActMaster | null;
  init(options: ActMasterOptions): ActMaster;
  subListClear: (key: any) => void;
}

/**
 * ActMaster instance and libs
 *
 * @returns ActMaster
 */
const act = function (): ActMaster {
  if (!act.$act) {
    throw new Error(
      `Instance call before initialization. Make a "new ActMaster()" first with "act.init({...})"`
    );
  }
  return act.$act;
} as ActFunction;

act.init = (options: ActMasterOptions): ActMaster => {
  // @ts-ignore
  return act.$act = new ActMaster(options);
};

// #region [ subscribe ]
const actSubscribe: ActSubscribeType = (
  eventName,
  listener,
  destroyHookOrKey?: any
): (() => boolean) => {
  const off = act().subscribe(eventName, listener);

  if (destroyHookOrKey) {
    if (typeof destroyHookOrKey === 'function') {
      destroyHookOrKey(off);
    } else {
      act().subsList.add(destroyHookOrKey, off);
    }
  }
  return off;
};
// #endregion

// #region [ subList.clear ]
export const subListClear = (key: any) => {
  return act().subsList.clear(key);
};

act.subListClear = subListClear;
// #endregion

const $act: ActProxy = new Proxy({} as ActProxy, {
  get: (_target, prop) => {
    return (...args: any[]) => {
      return act().exec(prop as string, ...args);
    };
  }
});

export { $act, act, actSubscribe };

