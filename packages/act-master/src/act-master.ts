import { CancelledAct } from './cancelled';
import {
  ActinonAlreadyExistingError,
  InvalidDITypeError,
  KeyAlreadyExistsInDIError,
  NotFoundActionError,
} from './errors';
import {
  ActEventName,
  ActExec,
  ActMasterAction,
  ActMasterActionDevDI,
  ActMasterOptions,
  ActSubscribeType,
  devActMasterConfig,
  DIMap,
  EmitAction,
  IActMaster,
  ListenerFunction,
} from './types';

//@ts-ignore
import { version } from '../package.json';

import { migrationHelper } from './utils/migration-helper';

export * from './errors';
export * from './types';
export * from './decorators/index';
export { CancelledAct };

/**
 *
 */
export class ActMaster implements IActMaster {
  /* @__PURE__ */
  readonly version = version;

  private readonly _actions = new Map<ActEventName, ActMasterAction>();

  private readonly _watchers = new Map<ActEventName, Set<ActEventName>>();

  private readonly _listeners = new Map<ActEventName, Set<ListenerFunction>>();

  private readonly _inProgressWatchers = new Map<
    ActEventName,
    (inProgress: boolean) => void
  >();

  private _subCurrentName = '';
  private readonly _subsMap = new Map<any, (() => void)[]>();

  /** @deprecated */
  private _lastUnsubscribe: () => any = () => false;

  private _DIContainer: DIMap = {};

  private readonly _singlePromisesStore = new Map<
    ActEventName,
    Promise<any | CancelledAct>
  >();

  private readonly config: devActMasterConfig = {
    autoUnsubscribeCallback: undefined,
    errorHandlerEventName: undefined,
  };

  private static instance: ActMaster;

  constructor(options: ActMasterOptions = {}) {
    if (ActMaster.instance) {
      return ActMaster.instance;
    }

    const { actions, di, autoUnsubscribeCallback, errorHandlerEventName } = options;

    if (actions) {
      this.addActions(actions);
    }

    if (typeof autoUnsubscribeCallback === 'function') {
      this.config.autoUnsubscribeCallback = autoUnsubscribeCallback;
    }

    if (typeof di === 'object' && di) {
      if (Array.isArray(di)) {
        throw new InvalidDITypeError();
      }
      Object.entries(di).forEach(([k, v]) => {
        this.setDI(k, v);
      });
    }

    if (typeof errorHandlerEventName === 'string') {
      this.config.errorHandlerEventName = errorHandlerEventName;
    }

    ActMaster.instance = this;
  }

  /* @deprecated */
  static getInstance(): ActMaster {
    if (!ActMaster.instance) {
      throw new Error('ActMaster not initialized');
    }
    return ActMaster.instance;
  }

  //#region [ Actions ]

  addActions(actions: ActMasterAction[]): void {
    if (Array.isArray(actions)) {
      actions.values().forEach((action: ActMasterAction) => {
        this.addAction(action);
      });
    }
  }

  addAction(action: ActMasterAction): ActMaster {
    const eventName = action.name;

    if (this._actions.has(eventName)) {
      throw new ActinonAlreadyExistingError(eventName);
    }

    // TODO: remove in v3
    if (action.useEmit) {
      const bindedEmitter: EmitAction = (eventName: ActEventName, ...args) =>
        this.exec(eventName, ...args);

      action.useEmit(bindedEmitter);
    }

    migrationHelper(action);

    this._actions.set(eventName, action);

    this.emitDIProps(action);

    if (action.$watch) {
      action.$watch.values().forEach((watchEventName) => {
        const watchers = this._watchers.get(watchEventName) || new Set();
        watchers.add(eventName);
        this._watchers.set(watchEventName, watchers);
      });
    }

    return this;
  }

  removeAction(eventName: ActEventName): void {
    if (!this._actions.has(eventName)) {
      throw new NotFoundActionError(eventName);
    }

    this._actions.delete(eventName);
  }

  clearActions(): void {
    this._actions.clear();
  }

  clearListeners(): void {
    for (const eventName in this._listeners) {
      if (this._listeners.has(eventName)) {
        this._listeners.delete(eventName);
      }
    }
  }
  //#endregion

  //#region [ Executions ]

  exec: ActExec = async (eventName, ...args) => {
    this.setProgress(eventName, true);

    if (this._singlePromisesStore.has(eventName)) {
      const promise = this._singlePromisesStore.get(eventName);

      if (promise) {
        return promise;
      }
    }

    const promise = this.emit(eventName, ...args)
      .catch((err: Error) => {
        return this.catchEmitException(err, eventName);
      })
      .finally(() => {
        if (this._singlePromisesStore.has(eventName)) {
          this._singlePromisesStore.delete(eventName);
        }
        this.setProgress(eventName, false);
      });

    const action = this.getActionOrNull(eventName);

    if (action && action.$isSingleton) {
      this._singlePromisesStore.set(eventName, promise);
    }

    return promise;
  };

  private async emit<T2>(
    eventName: ActEventName,
    ...args: any[]
  ): Promise<T2 | null> {
    const action = this.getActionOrNull(eventName);

    if (action === null) {
      throw new NotFoundActionError(eventName);
    }

    // validator
    if (action.$validate) {
      const isValidOrError = await action.$validate(...args);

      if (isValidOrError !== true) {
        if (this.config.errorHandlerEventName) {
          this.emit(this.config.errorHandlerEventName, isValidOrError);
        }
        if (action.$onError) {
          this.emit(action.$onError, isValidOrError);
        }

        return isValidOrError;
      }
    }

    try {
      const value: T2 = await action.exec(...args);

      if (value instanceof CancelledAct || CancelledAct.is(value)) {
        return value;
      }

      this.notifyListeners(eventName, value);

      return value;
    } catch (err: any) {
      return this.catchEmitException(err, eventName);
    }
  }

  private catchEmitException(error: Error, eventName: ActEventName) {
    if (error instanceof NotFoundActionError) {
      throw error;
    }

    const action = this.getActionOrNull(eventName);

    if (action?.$onError && action.$onError !== eventName) {
      // Act has own error handler
      this.emit(action.$onError, error);
      return Promise.resolve(null);
    }

    if (
      this.config.errorHandlerEventName &&
      this.config.errorHandlerEventName !== eventName
    ) {
      this.emit(this.config.errorHandlerEventName, error);
      return Promise.resolve(null);
    }

    return Promise.reject(error);
  }

  private notifyListeners(eventName: ActEventName, value: any): void {
    const listeners = this._listeners.get(eventName);

    if (listeners) {
      listeners.forEach((listenerCallback) => {
        listenerCallback(value);
      });
    }

    if (this._watchers.has(eventName)) {
      for (const watchingEventName of this._watchers.get(eventName) || []) {
        this.exec(watchingEventName, value); // Without waiting
      }
    }
  }
  //#endregion

  //#region [ Subscribing ]

  /**
   * Subscribe to events
   *
   * @param actName Name of Act
   * @param listener Function that watches the event
   * @param context An entity that's used for unsubscribing.
                    If a function is passed, a callback for unsubscribe
                    will be passed to it. Otherwise,
                    the entity will be used as the key for "subsList.clear(context)"
   * @returns  Function for unsubscribing
   */
  subscribe(...args: Parameters<ActSubscribeType>) {
    const [actName, listener, context] = args

    if (!this._listeners.get(actName)) {
      this._listeners.set(actName, new Set());
    }
    const list = this._listeners.get(actName);
    list?.add(listener);

    const unsubscribe = () => this.unsubscribe(actName, listener);

    this._lastUnsubscribe = unsubscribe;

    if (this.config.autoUnsubscribeCallback) {
      this.config.autoUnsubscribeCallback({
        context,
        listener,
        eventName: actName,
      });
    }

    if (context) {
      if (typeof context === 'function') {
        context(unsubscribe);
      } else {
        this.subsList.add(context, unsubscribe);
      }
    } else if (this._subCurrentName) {
      this.subsList.add(this._subCurrentName, unsubscribe);
    }

    return unsubscribe;
  }

  unsubscribe(eventName: ActEventName, listener: ListenerFunction): boolean {
    const listeners = this._listeners.get(eventName);
    if (!listeners) {
      this._subsMap.set(eventName, []);
      return false;
    }

    return listeners.delete(listener);
  }

  once: ActSubscribeType = (
    eventName: ActEventName,
    listener: ListenerFunction
  ) => {
    const unsubscribe = this.subscribe(eventName, (...args) => {
      unsubscribe();
      listener(...args);
    });
    return unsubscribe;
  };

  on: ActSubscribeType = (
    eventName: ActEventName,
    listener: ListenerFunction,
    context?: any
  ) => {
    return this.subscribe(eventName, listener, context);
  };

  off(eventName: ActEventName, listener: ListenerFunction): boolean {
    return this.unsubscribe(eventName, listener);
  }
  //#endregion

  //#region [ extends functions ]
  /**
   * @deprecated
   *
   */
  inProgress(
    key: ActEventName | ActEventName[],
    callback: (inProgress: boolean) => void
  ): () => any {
    if (Array.isArray(key)) {
      key.forEach((k) => this._inProgressWatchers.set(k, callback));

      const unsubscribe = () => {
        key.forEach((k) => {
          this._inProgressWatchers.delete(k);
        });
      };

      this._lastUnsubscribe = unsubscribe;

      return unsubscribe;
    }

    this._inProgressWatchers.set(key, callback);

    const unsubscribe = () => this._inProgressWatchers.delete(key);

    this._lastUnsubscribe = unsubscribe;

    return unsubscribe;
  }

  // TODO: remove in v3
  /* @deprecated Will be removed */
  private setProgress(key: ActEventName, status: boolean) {
    if (this._inProgressWatchers.has(key)) {
      //@ts-ignore
      this._inProgressWatchers.get(key)(status);
    }
  }

  get subsList() {
    const self = this;

    const clear = (key: any) => {
      const list = self._subsMap.get(key) || [];
      list.values().forEach((unsubscribe) => unsubscribe());
      self._subsMap.delete(key);
    };

    return {
      /**
       * After running this method, all subscriptions will be saved,
       * and can be cleared using the
       * subList.clear('key') method - with the same key passed in.
       *
       */
      add(key: any, ...fns: (() => any)[]) {
        self._subCurrentName = key;

        const list = self._subsMap.get(key) || [];
        if (fns.length) {
          list.push(...fns);
        }
        self._subsMap.set(key, list);

        return clear;
      },

      clear,
    };
  }
  // #endregion

  //#region [ DI ]
  clearDI(): void {
    this._DIContainer = {};
  }

  setDI(key: string, ctx: any): ActMaster {
    if (this._DIContainer[key]) {
      throw new KeyAlreadyExistsInDIError(key);
    }
    this._DIContainer[key] = ctx;
    this.freshEmitDI();
    return this;
  }

  getDI<T = any>(key: string): T {
    return this._DIContainer[key];
  }

  private freshEmitDI() {
    let action: ActMasterAction | undefined;
    Object.keys(this._actions).forEach((key: string) => {
      action = this._actions.get(key);
      if (action) {
        this.emitDIProps(action);
      }
    });
  }

  private emitDIProps(action: ActMasterActionDevDI) {
    // For UseDI decorator
    if (!action._DI_CONTAINER_) {
      Object.defineProperty(action, '_DI_CONTAINER_', {
        get: () => this._DIContainer,
        enumerable: false, // Uncomment for DEBUG
      });
    }

    if (action._DI_MAP_) {
      Object.keys(action._DI_MAP_).forEach((k) => {
        if (action[k]) {
          return;
        }
        const propKey = action._DI_MAP_?.[k];
        if (!propKey) {
          return;
        }
        Object.defineProperty(action, k, {
          get() {
            return this._DI_CONTAINER_[propKey];
          },
          enumerable: true,
        });
      });
    }

    // TODO: remove in v3
    if (action.useDI) {
      action.useDI(this._DIContainer);
    }
  }
  //#endregion

  //#region [ helpers ]
  private getActionOrNull(eventName: ActEventName): ActMasterAction | null {
    return this._actions.get(eventName) || null;
  }

  /**
   * @internal For devtools use only
   */
  get _dev_() {
    if ('development,test:ci'.indexOf(`${process.env.NODE_ENV}`) === -1) {
      throw 'act:dev error';
    }
    const s = this;
    return {
      get actions() {
        return s._actions;
      },
      get devConf() {
        return s.config;
      },
      get listeners() {
        return s._listeners;
      },
    };
  }
  //#endregion
}
