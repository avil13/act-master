import {
  type ActMaster,
  type ActMasterOptions,
} from '../act-master';
import { autoUnsubscribeFactory, refSubscribeFactory, type RefSubscriptionFunction } from './composable';
import { addDevtools } from './plugins/devtools';
import { act } from '../helpers';

export { ActInProgress, ActSubscribe } from './decorators';

/**
 * Declaration vue2
 *
 */
//@ts-ignore
declare module 'vue/types/vue' {
  interface Vue {
    $act: ActMaster;
  }

  interface VueConstructor {
    act: ActMaster;
  }
}

/**
 * Declaration vue3
 *
 */
//@ts-ignore
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $act: ActMaster;
  }
}

export class VueActMaster {
  static actMaster: ActMaster | null = null;
  static app: any | null = null;

  static setActMaster(actMaster: ActMaster) {
    VueActMaster.actMaster = actMaster;
  }

  constructor(actMaster?: ActMaster) {
    VueActMaster.actMaster = actMaster || null;
  }

  static install(app: any, options?: ActMasterOptions): void {
    VueActMaster.actMaster = VueActMaster.actMaster || act.init(options || {});
    VueActMaster.app = app;

    // add the instance method
    if (app.config?.globalProperties && !app.config.globalProperties.$act) {
      // vue 3
      app.config.globalProperties.$act = VueActMaster.actMaster;
      app.provide('$act', VueActMaster.actMaster);
    } else if (!Object.prototype.hasOwnProperty.call(app, '$act')) {
      // vue 2
      app.act = VueActMaster.actMaster;
      app.prototype.$act = VueActMaster.actMaster;
    }

    // devtool
    if (VueActMaster.actMaster) {
      //@ts-ignore
      if (process.env.NODE_ENV === 'development') {
        addDevtools(app, VueActMaster.actMaster);
      }
    }
  }

  install(vue: any, options?: ActMasterOptions): void {
    VueActMaster.install(vue, options);
  }
}

// composable

export type { RefSubscriptionFunction, ActMasterOptions, ActMaster };

export const useRefSubscription: RefSubscriptionFunction = refSubscribeFactory(VueActMaster);

export const useAutoUnsubscribe = autoUnsubscribeFactory(VueActMaster)
