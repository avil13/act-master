import { type ActMaster, type ActMasterAction } from '../../..';
import type { CustomInspectorNode, StateBase } from '../dev-tools-types';
import { getArguments, getCurrentTime } from './utils';

const eventMonkeyState = new Map<string, StateBase[]>();
const eventMonkeyStateSort = new Set<string>();
const config = {
  isShowOnlyCalls: false,
};

export function watchOnEventsByMonkey(actMaster: ActMaster) {
  // @ts-ignore
  if (actMaster._old_emit) {
    return;
  }

  //@ts-ignore
  actMaster._old_emit = actMaster.emit.bind(actMaster);

  //@ts-ignore
  actMaster.emit = (...args: any[]) => {
    const [name, ...props] = args;
    const time = getCurrentTime();

    addStateByMonkey(name, {
      //@ts-ignore
      _isArgument: true, // path to define argument
      key: `Arguments ${time}`,
      value: props,
    });

    //@ts-ignore
    return actMaster._old_emit(...args).then((result) => {
      addStateByMonkey(name, {
        key: `Result ${time}`,
        value: result,
      });

      return result;
    });
  };
}

export function addStateByMonkey(name: string, state: StateBase): void {
  let items: StateBase[] = eventMonkeyState.get(name) || [];

  if (items.length > 20) {
    items = items.slice(-10);
  }

  items.push(state);
  eventMonkeyState.set(name, items);
  if (eventMonkeyStateSort.has(name)) {
    eventMonkeyStateSort.delete(name);
  }
  eventMonkeyStateSort.add(name);
}

export function getActEventsByMonkeyWatcher(
  actName: string,
  act: ActMasterAction | null
): StateBase[] {
  const list = eventMonkeyState.get(actName) || [];

  const argumentNames = getArguments(act?.exec);

  return list.map((stateBase) => {
    //@ts-ignore
    if (!stateBase._isArgument) {
      return stateBase;
    }

    let value: Record<string, any> = {};

    stateBase.value.forEach((v: any, i: number) => {
      value[argumentNames[i]] = v;
    });

    return {
      ...stateBase,
      value,
    };
  });
}

export function hasMonkeyState(name: string): boolean {
  return eventMonkeyState.has(name);
}

export function resetMonkeyWatcherState() {
  eventMonkeyState.clear();
  eventMonkeyStateSort.clear();
}

//
export function isShowActionByConfig(name: string): boolean {
  if (config.isShowOnlyCalls) {
    return hasMonkeyState(name);
  }
  return true;
}

export function toggleSettingsShowCall(api: any, INSPECTOR_ID: string) {
  config.isShowOnlyCalls = !config.isShowOnlyCalls;

  setTimeout(() => {
    api.sendInspectorTree(INSPECTOR_ID);
  }, 200);
}

export function useSettings(conf: typeof config | any) {
  Object.assign(config, conf || {});
  return config;
}

export function sortActInspectorTree(list: CustomInspectorNode[]) {
  if (config.isShowOnlyCalls) {
    const orderNames = [...eventMonkeyStateSort];
    const orderIndexes = new Map<string, number>(
      orderNames.map((item, index) => [item, index])
    );

    return list.sort((a, b) => {
      const indexOfA = orderIndexes.get(a.label) || -1;
      const indexOfB = orderNames.indexOf(b.label) || -1;

      return indexOfA - indexOfB;
    });
  }

  return list.sort((a, b) => (a.id > b.id ? 1 : -1));
}
